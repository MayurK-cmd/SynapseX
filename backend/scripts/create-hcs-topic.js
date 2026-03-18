/**
 * create-hcs-topic.js
 * Run ONCE to create the HCS topic. Copy the printed topic ID into your .env
 *
 * Usage:
 *   node scripts/create-hcs-topic.js
 *
 * Requires in .env:
 *   HEDERA_OPERATOR_ID=0.0.8064708
 *   HEDERA_OPERATOR_KEY=0xd9cea6d1f2455b8db43614f86749b379d506b73d748411365386683b7277da7c
 */

import "dotenv/config";
import { Client, TopicCreateTransaction, AccountId, PrivateKey } from "@hashgraph/sdk";

const operatorId  = process.env.HEDERA_OPERATOR_ID;
const operatorKey = process.env.HEDERA_OPERATOR_KEY;

if (!operatorId || !operatorKey) {
  console.error("Missing HEDERA_OPERATOR_ID or HEDERA_OPERATOR_KEY in .env");
  process.exit(1);
}

const client = Client.forTestnet();
client.setOperator(
  AccountId.fromString(operatorId),
  PrivateKey.fromString(operatorKey)
);

const tx = await new TopicCreateTransaction()
  .setTopicMemo("SynapseX Competition Audit Log")
  .execute(client);

const receipt = await tx.getReceipt(client);
const topicId = receipt.topicId.toString();

console.log("✅ HCS Topic created!");
console.log(`   Topic ID: ${topicId}`);
console.log("");
console.log("Add this to your .env:");
console.log(`   HEDERA_HCS_TOPIC_ID=${topicId}`);
console.log("");
console.log(`View on Hashscan: https://hashscan.io/testnet/topic/${topicId}`);

client.close();