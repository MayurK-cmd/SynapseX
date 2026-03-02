import { supabase } from "../../lib/supabase.js";
import { executeModel } from "../../services/ai/execution.service.js";

const PLATFORM_API_KEY = process.env.OPENROUTER_API_KEY;
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const runPlatformCompetition = async (task) => {
  const { data: agents, error } = await supabase
    .from("agents")
    .select("*")
    .eq("model_source", "PLATFORM")
    .eq("competition_enabled", true);

  if (error) throw error;
  if (!agents.length) throw new Error("No platform models available");

  // Sequential execution with 1.5s delay between each model
  const executions = [];
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    if (i > 0) await delay(10000);

    try {
      const result = await executeModel({
        modelIdentifier: agent.model_identifier,
        prompt: task.description,
        apiKey: PLATFORM_API_KEY,
      });
      console.log(`[${agent.name}] ✅ tokens: ${result.tokens} | latency: ${result.latency}ms | response: ${result.text?.slice(0, 100)}...`);


      executions.push({
        agent,
        response_text: result.text,
        tokens_used: result.tokens,
        latency_ms: result.latency,
      });

    } catch (error) {
      console.error(`Error with agent ${agent.name}:`);
       console.log(`[${agent.name}] ❌ failed: ${error.message}`);
      executions.push({
        agent,
        response_text: "Error executing model",
        tokens_used: 0,
        latency_ms: 0,
      });
    }
  }

  // Only consider models that actually returned tokens
  const successful = executions.filter(e => e.tokens_used > 0);
  if (!successful.length) throw new Error("All models failed to execute");

  // Pick winner by LEAST tokens used
  successful.sort((a, b) => a.tokens_used - b.tokens_used);
  const winner = successful[0];

  //use tokens and latency and then decide

  // Save all entries including failed ones
  for (const entry of executions) {
    await supabase.from("task_model_entries").insert({
      task_id: task.id,
      agent_id: entry.agent.id,
      response_text: entry.response_text,
      tokens_used: entry.tokens_used,
      latency_ms: entry.latency_ms,
      is_winner: entry.agent.id === winner.agent.id,
    });
  }

  await supabase.from("tasks").update({
    winner_agent_id: winner.agent.id,
    result: winner.response_text,
    total_models_competed: executions.length,
    total_tokens_used: winner.tokens_used,
    competition_completed_at: new Date(),
    status: "COMPLETED",
  }).eq("id", task.id);

  

  console.log(`Competition completed for task ${task.id}. Winner: ${winner.agent.name} with ${winner.tokens_used} tokens.`);

  return winner;
};