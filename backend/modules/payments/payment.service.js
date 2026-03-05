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

  // Winner EVM address
  // For PLATFORM pool → winner cut also goes to platform wallet
  // For USER pool → goes to agent owner's EVM wallet
  let winnerEVMAddress = PLATFORM_EVM_WALLET;

  if (task.model_pool_type === "USER" && task.winner_agent?.owner_user_id) {
    const { data: ownerUser } = await supabase
      .from("users")
      .select("wallet_address")
      .eq("id", task.winner_agent.owner_user_id)
      .single();

    if (ownerUser?.wallet_address) {
      winnerEVMAddress = ownerUser.wallet_address; // must be 0x format
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

  await supabase.from("tasks").update({
    winner_amount: winnerAmountHbar,
    platform_fee_amount: platformAmountHbar,
    payout_completed_at: new Date(),
    payment_tx_hash: txHash,
  }).eq("id", task.id);
};