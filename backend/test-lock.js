// test-lock.js
import dotenv from "dotenv";
dotenv.config();

import {
  Client,
  ContractExecuteTransaction,
  ContractFunctionParameters,
  Hbar,
} from "@hashgraph/sdk";
import { ethers } from "ethers";

const client = Client.forTestnet().setOperator(
  process.env.HEDERA_ACCOUNT_ID,
  process.env.HEDERA_PRIVATE_KEY
);

// 👇 paste a fresh task ID from your DB here
const taskId = "fcbec5a1-8dec-4f54-bb26-90887d76bf49";

const taskIdBytes32 = ethers.id(taskId);
const taskIdBuffer = Buffer.from(taskIdBytes32.slice(2), "hex");

const params = new ContractFunctionParameters().addBytes32(taskIdBuffer);

const tx = await new ContractExecuteTransaction()
  .setContractId(process.env.ESCROW_CONTRACT_ID)
  .setGas(200000)
  .setPayableAmount(new Hbar(10)) // must match reward_amount in DB
  .setFunction("lockTask", params)
  .execute(client);

const receipt = await tx.getReceipt(client);
console.log("Lock status:", receipt.status.toString());