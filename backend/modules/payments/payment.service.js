import { supabase } from "../../lib/supabase.js";
import { releaseEscrowPayment } from "./escrow.service.js";

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

  // For USER pool — fetch winner agent owner's Hedera wallet
  // For PLATFORM pool — platform keeps winner cut too
  let winnerHederaAccount = process.env.PLATFORM_ACCOUNT_ID;

  if (task.model_pool_type === "USER" && task.winner_agent?.owner_user_id) {
    const { data: ownerUser } = await supabase
      .from("users")
      .select("wallet_address")
      .eq("id", task.winner_agent.owner_user_id)
      .single();

    if (ownerUser?.wallet_address) {
      winnerHederaAccount = ownerUser.wallet_address; // 0.0.XXXXX format
    }
  }

  const txId = await releaseEscrowPayment({
    taskId: task.id,
    winnerHederaAccount,
    winnerAmountHbar,
    platformAmountHbar,
  });

  await supabase.from("tasks").update({
    winner_amount: winnerAmountHbar,
    platform_fee_amount: platformAmountHbar,
    payout_completed_at: new Date(),
    payment_tx_hash: txId,
  }).eq("id", task.id);
};