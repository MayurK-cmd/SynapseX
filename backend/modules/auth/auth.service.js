import {supabase} from "../../lib/supabase.js";
import { ethers } from "ethers";
import crypto from "crypto";
import { signToken } from "../../utils/jwt.js";

export const generateNonce = async (walletAddress) => {
  const nonce = crypto.randomBytes(16).toString("hex");

  const { error } = await supabase
    .from("nonces")
    .upsert({ wallet_address: walletAddress, nonce });

  if (error) throw error;

  return nonce;
};

export const verifySignature = async (
  walletAddress,
  signature,
  nonce
) => {
  const { data, error } = await supabase
    .from("nonces")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error || !data || data.nonce !== nonce) {
    throw new Error("Invalid nonce");
  }

  const recoveredAddress = ethers.verifyMessage(nonce, signature);

  if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("Invalid signature");
  }

  // Check if user exists
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (!user) {
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ wallet_address: walletAddress })
      .select()
      .single();

    if (createError) throw createError;
    user = newUser;
  }

  const token = signToken({ userId: user.id });

  return { token, user };
};