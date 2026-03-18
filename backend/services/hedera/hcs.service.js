import {
  Client,
  TopicMessageSubmitTransaction,
  AccountId,
  PrivateKey,
} from "@hashgraph/sdk";

// ── Build client once at module load ─────────────────────────────────────────
function buildClient() {
  const operatorId  = process.env.HEDERA_OPERATOR_ID;
  const operatorKey = process.env.HEDERA_OPERATOR_KEY;
  const network     = process.env.HEDERA_NETWORK || "testnet";

  if (!operatorId || !operatorKey) {
    console.warn("[HCS] Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY — HCS logging disabled");
    return null;
  }

  try {
    const client = network === "mainnet"
      ? Client.forMainnet()
      : Client.forTestnet();

    client.setOperator(
      AccountId.fromString(operatorId),
      PrivateKey.fromString(operatorKey)
    );

    return client;
  } catch (err) {
    console.warn("[HCS] Client init failed:", err.message);
    return null;
  }
}

const hederaClient = buildClient();

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Submits a competition result as an immutable HCS message.
 * Non-blocking — failures are logged but never throw (won't break payouts).
 *
 * @param {object} params
 * @param {string} params.taskId
 * @param {string} params.taskDescription   — first 80 chars
 * @param {string} params.winnerAgentId
 * @param {string} params.winnerAgentName
 * @param {string} params.winnerWallet
 * @param {number} params.winnerScore
 * @param {number} params.winnerTokens
 * @param {number} params.winnerLatencyMs
 * @param {number} params.totalModels
 * @param {number} params.rewardHbar
 * @param {string} params.poolType          — "PLATFORM" | "USER"
 */
export async function logCompetitionResult(params) {
  const topicId = process.env.HEDERA_HCS_TOPIC_ID;

  if (!hederaClient || !topicId) {
    console.warn("[HCS] Skipping — client or topic not configured");
    return null;
  }

  const message = JSON.stringify({
    event:            "COMPETITION_COMPLETED",
    timestamp:        new Date().toISOString(),
    task_id:          params.taskId,
    task_description: params.taskDescription?.slice(0, 80),
    winner: {
      agent_id:    params.winnerAgentId,
      agent_name:  params.winnerAgentName,
      wallet:      params.winnerWallet,
      score:       parseFloat(params.winnerScore?.toFixed(4)),
      tokens_used: params.winnerTokens,
      latency_ms:  params.winnerLatencyMs,
    },
    competition: {
      total_models: params.totalModels,
      pool_type:    params.poolType,
      reward_hbar:  params.rewardHbar,
    },
    network: process.env.HEDERA_NETWORK || "testnet",
  });

  try {
    const receipt = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(hederaClient);

    const txReceipt = await receipt.getReceipt(hederaClient);
    const sequenceNumber = txReceipt.topicSequenceNumber?.toString();

    console.log(`[HCS] ✅ Competition logged — topic: ${topicId} | seq: ${sequenceNumber} | task: ${params.taskId}`);
    return { topicId, sequenceNumber };

  } catch (err) {
    // Never let HCS failure break the competition flow
    console.error("[HCS] ❌ Failed to log competition:", err.message);
    return null;
  }
}