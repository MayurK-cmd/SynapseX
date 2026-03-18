import { supabase } from "../../lib/supabase.js";
import { executeModel } from "../../services/ai/execution.service.js";
import { handlePayout } from "../payments/payment.service.js";
import { logCompetitionResult } from "../../services/hedera/hcs.service.js";

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runPlatformCompetition = async (task) => {
  let query = supabase
    .from("agents")
    .select("*")
    .eq("competition_enabled", true);

  if (task.selected_agent_ids?.length > 0) {
    query = query.in("id", task.selected_agent_ids);
  }

  if (task.model_pool_type === "PLATFORM") {
    query = query.eq("model_source", "PLATFORM");
  } else if (task.model_pool_type === "USER") {
    query = query.eq("model_source", "USER");
  }

  const { data: agents, error } = await query;

  console.log("model_pool_type:", task.model_pool_type);
  console.log("creator_id:", task.creator_id);
  console.log("agents found:", agents);
  console.log("query error:", error);

  if (error) throw error;
  if (!agents.length) throw new Error(`No ${task.model_pool_type} models available`);

  const isImageTask = task.type === "IMAGE";

  // Sequential execution with 10s delay between each model
  const executions = [];
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    if (i > 0) await delay(10000);

    try {
      const result = await executeModel({
        modelIdentifier: agent.model_identifier,
        prompt: task.description,
        taskType: task.type,                          // ← pass task type
        originAgentCluster: {
          model_source: agent.model_source,
          model_pool_type: task.model_pool_type,
          api_key_encrypted: agent.api_key_encrypted ?? null,
        },
      });

      console.log(
        `[${agent.name}] ✅ tokens: ${result.tokens} | latency: ${result.latency}ms` +
        (isImageTask ? ` | url: ${result.output_url}` : ` | response: ${result.text?.slice(0, 100)}...`)
      );

      executions.push({
        agent,
        response_text: result.text,
        output_url: result.output_url,               // ← store image url
        tokens_used: result.tokens,
        latency_ms: result.latency,
      });

    } catch (err) {
      console.error(`Error with agent ${agent.name}:`, err.message);
      console.log(`[${agent.name}] ❌ failed: ${err.message}`);
      executions.push({
        agent,
        response_text: null,
        output_url: null,
        tokens_used: 0,
        latency_ms: 0,
      });
    }
  }

  const successful = executions.filter(e => e.latency_ms > 0);
  if (!successful.length) throw new Error("All models failed to execute");

  // ─── Scoring ───────────────────────────────────────────────────────────────
  const maxLatency = Math.max(...successful.map(e => e.latency_ms));
  const minLatency = Math.min(...successful.map(e => e.latency_ms));

  const normalize = (val, min, max) =>
    max === min ? 0 : (val - min) / (max - min);

  if (isImageTask) {
    // Image tasks: score purely on latency (tokens not meaningful)
    successful.forEach(e => {
      e.score = normalize(e.latency_ms, minLatency, maxLatency);
      console.log(`[${e.agent.name}] latency: ${e.latency_ms}ms | score: ${e.score.toFixed(4)}`);
    });
  } else {
    // Text tasks: 60% token efficiency + 40% latency
    const maxTokens = Math.max(...successful.map(e => e.tokens_used));
    const minTokens = Math.min(...successful.map(e => e.tokens_used));

    successful.forEach(e => {
      e.score = (
        0.6 * normalize(e.tokens_used, minTokens, maxTokens) +
        0.4 * normalize(e.latency_ms, minLatency, maxLatency)
      );
      console.log(`[${e.agent.name}] tokens: ${e.tokens_used} | latency: ${e.latency_ms}ms | score: ${e.score.toFixed(4)}`);
    });
  }

  successful.sort((a, b) => a.score - b.score);
  const winner = successful[0];
  console.log(`Winner: ${winner.agent.name} with score ${winner.score.toFixed(4)}`);

  // Save all entries including failed ones
  for (const entry of executions) {
    await supabase.from("task_model_entries").insert({
      task_id: task.id,
      agent_id: entry.agent.id,
      response_text: entry.response_text,
      tokens_used: entry.tokens_used,
      latency_ms: entry.latency_ms,
      score: entry.score ?? 0,
      is_winner: entry.agent.id === winner.agent.id,
    });
  }

  // Update task with winner result
  await supabase.from("tasks").update({
    winner_agent_id: winner.agent.id,
    result: winner.response_text ?? null,
    output_url: winner.output_url ?? null,            // ← save image url
    total_models_competed: executions.length,
    total_tokens_used: winner.tokens_used,
    competition_completed_at: new Date(),
    status: "COMPLETED",
  }).eq("id", task.id);

  console.log(`Competition completed for task ${task.id}. Winner: ${winner.agent.name}`);

  // ── HCS audit log ─────────────────────────────────────────────────────────
  // Posts immutable competition result to Hedera Consensus Service topic.
  // Non-blocking — failure here never affects payout.
  logCompetitionResult({
    taskId:           task.id,
    taskDescription:  task.description,
    winnerAgentId:    winner.agent.id,
    winnerAgentName:  winner.agent.name,
    winnerWallet:     winner.agent.wallet_address,
    winnerScore:      winner.score,
    winnerTokens:     winner.tokens_used,
    winnerLatencyMs:  winner.latency_ms,
    totalModels:      executions.length,
    rewardHbar:       task.reward,
    poolType:         task.model_pool_type,
  }).catch(() => {}); // fire-and-forget, never blocks

  // Payout
  try {
    const { data: fullTask } = await supabase
      .from("tasks")
      .select(`*, winner_agent:agents!tasks_winner_agent_id_fkey(id,wallet_address,owner_user_id)`)
      .eq("id", task.id)
      .single();

    await handlePayout(fullTask);
  } catch (err) {
    console.error(`Payout failed for task ${task.id}:`, err.message);
  }

  return winner;
};