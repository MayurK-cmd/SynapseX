import { ethers } from "ethers";

const ESCROW_CONTRACT_ADDRESS = process.env.ESCROW_CONTRACT_ADDRESS;

const ESCROW_ABI = [
  "function releasePayment(bytes32 taskId, address winner, uint256 winnerAmount, uint256 platformAmount) external",
];

const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
const operatorWallet = new ethers.Wallet(process.env.PLATFORM_PRIVATE_KEY, provider);
const contract = new ethers.Contract(ESCROW_CONTRACT_ADDRESS, ESCROW_ABI, operatorWallet);

export const releaseEscrowPayment = async ({
  taskId,
  winnerEVMAddress,
  winnerAmountHbar,
  platformAmountHbar,
}) => {
  const taskIdBytes32 = ethers.id(taskId);

  // Hedera EVM uses tinybars: 1 HBAR = 1e8 tinybars
  const winnerTinybars = BigInt(Math.round(winnerAmountHbar * 100_000_000));
  const platformTinybars = BigInt(Math.round(platformAmountHbar * 100_000_000));
  const totalTinybars = winnerTinybars + platformTinybars;

  console.log(`Releasing ${winnerAmountHbar} HBAR (${winnerTinybars} tinybars) → ${winnerEVMAddress}`);
  console.log(`Releasing ${platformAmountHbar} HBAR (${platformTinybars} tinybars) → platform wallet`);
  console.log(`Total: ${totalTinybars} tinybars`);

  const tx = await contract.releasePayment(
    taskIdBytes32,
    winnerEVMAddress,
    winnerTinybars,
    platformTinybars,
    { gasLimit: 300000 }
  );

  console.log("releasePayment tx sent:", tx.hash);
  await tx.wait();
  console.log("releasePayment confirmed:", tx.hash);
  return tx.hash;
};