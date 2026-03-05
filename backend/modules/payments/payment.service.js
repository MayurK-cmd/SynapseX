import { supabase } from "../../lib/supabase.js";
import { releaseEscrowPayment } from "./escrow.service.js";

const PLATFORM_EVM_WALLET = process.env.PLATFORM_WALLET;

export const handlePayout = async (task) => {
  const total = task.reward;

  if (!total || total <= 0) {
    console.warn(`Task ${task.id} has no reward, skipping payout`);
    return;
  }

  let winnerAmountHbar;
  let platformAmountHbar;

  if (task.model_pool_type === "PLATFORM") {
    winnerAmountHbar = total * 0.6;
    platformAmountHbar = total * 0.4;
  } else {
    winnerAmountHbar = total * 0.7;
    platformAmountHbar = total * 0.3;
  }

  let winnerEVMAddress = PLATFORM_EVM_WALLET;

  if (task.model_pool_type === "USER") {
    if (task.winner_agent?.owner_user_id) {
      const { data: ownerUser } = await supabase
        .from("users")
        .select("wallet_address")
        .eq("id", task.winner_agent.owner_user_id)
        .single();
      if (ownerUser?.wallet_address) {
        winnerEVMAddress = ownerUser.wallet_address;
      }
    }
    if (winnerEVMAddress === PLATFORM_EVM_WALLET && task.winner_agent?.wallet_address) {
      winnerEVMAddress = task.winner_agent.wallet_address;
    }
    console.log(`USER pool winner wallet resolved: ${winnerEVMAddress}`);
  }

  const txHash = await releaseEscrowPayment({
    taskId: task.id,
    winnerEVMAddress,
    winnerAmountHbar,
    platformAmountHbar,
  });

  // Update task
  await supabase.from("tasks").update({
    winner_amount: winnerAmountHbar,
    platform_fee_amount: platformAmountHbar,
    payout_completed_at: new Date(),
    payment_tx_hash: txHash,
  }).eq("id", task.id);

  // Update winner agent earnings + reputation
  if (task.winner_agent?.id) {
    const { data: currentAgent } = await supabase
      .from("agents")
      .select("total_earned, reputation")
      .eq("id", task.winner_agent.id)
      .single();

    if (currentAgent) {
      // Reputation: +10 per win, capped at 100
      const newReputation = Math.min(100, (currentAgent.reputation ?? 0) + 10);
      const newTotalEarned = (currentAgent.total_earned ?? 0) + winnerAmountHbar;

      await supabase.from("agents").update({
        total_earned: newTotalEarned,
        reputation: newReputation,
      }).eq("id", task.winner_agent.id);

      console.log(`Agent ${task.winner_agent.id} → earned: ${newTotalEarned} HBAR | rep: ${newReputation}`);
    }
  }

  // Update winner agent owner's total_earned in users table
  if (task.model_pool_type === "USER" && task.winner_agent?.owner_user_id) {
    const { data: currentUser } = await supabase
      .from("users")
      .select("total_earned")
      .eq("id", task.winner_agent.owner_user_id)
      .single();

    if (currentUser) {
      await supabase.from("users").update({
        total_earned: (currentUser.total_earned ?? 0) + winnerAmountHbar,
      }).eq("id", task.winner_agent.owner_user_id);
    }
  }

  // Update task creator's total_spent
  if (task.creator_id) {
    const { data: creator } = await supabase
      .from("users")
      .select("total_spent")
      .eq("id", task.creator_id)
      .single();

    if (creator) {
      await supabase.from("users").update({
        total_spent: (creator.total_spent ?? 0) + total,
      }).eq("id", task.creator_id);
    }
  }
};