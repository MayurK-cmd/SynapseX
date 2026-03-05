import { supabase } from "../../lib/supabase.js";
import { ethers } from "ethers";
import crypto from "crypto";
import { signToken } from "../../utils/jwt.js";

export const generateNonce = async (walletAddress) => {
  const nonce = crypto.randomBytes(16).toString("hex");

  const { error } = await supabase
    .from("nonces")
    .upsert(
      { wallet_address: walletAddress.toLowerCase(), nonce },
      { onConflict: "wallet_address" }
    );

  if (error) throw error;
  return nonce;
};

export const verifySignature = async (walletAddress, signature, nonce) => {
  // 1. Check nonce is valid
  const { data, error } = await supabase
    .from("nonces")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (error || !data || data.nonce !== nonce) {
    throw new Error("Invalid nonce");
  }

  // 2. Recover signer address from signature
  const recoveredAddress = ethers.verifyMessage(nonce, signature);

  if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
    throw new Error("Signature verification failed");
  }

  // 3. Delete used nonce
  await supabase.from("nonces").delete().eq("wallet_address", walletAddress.toLowerCase());

  // 4. Upsert user
  let { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("wallet_address", walletAddress.toLowerCase())
    .single();

  if (!user) {
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({ wallet_address: walletAddress.toLowerCase() })
      .select()
      .single();

    if (createError) throw createError;
    user = newUser;
  }

  const token = signToken({ userId: user.id });
  return { token, user };
};