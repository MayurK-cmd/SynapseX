import {
  Client,
  TransferTransaction,
  Hbar,
} from "@hashgraph/sdk";

const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

export const releaseEscrowPayment = async ({
  taskId,
  winnerHederaAccount,
  winnerAmountHbar,
  platformAmountHbar,
}) => {
  const total = winnerAmountHbar + platformAmountHbar;

  console.log(`Paying ${winnerAmountHbar} HBAR → ${winnerHederaAccount}`);
  console.log(`Paying ${platformAmountHbar} HBAR → ${process.env.PLATFORM_ACCOUNT_ID}`);

  const tx = await new TransferTransaction()
    .addHbarTransfer(process.env.HEDERA_ACCOUNT_ID, new Hbar(-total))
    .addHbarTransfer(winnerHederaAccount, new Hbar(winnerAmountHbar))
    .addHbarTransfer(process.env.PLATFORM_ACCOUNT_ID, new Hbar(platformAmountHbar))
    .setTransactionMemo(`SynapseX Payout: ${taskId}`)
    .execute(client);

  const receipt = await tx.getReceipt(client);
  console.log(`Payout status: ${receipt.status}`);
  return tx.transactionId.toString();
};