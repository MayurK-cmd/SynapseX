import { supabase } from "../../lib/mock.supabase.js";
import { PublicKey } from "@hashgraph/sdk";
import { proto } from "@hashgraph/proto";
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

export const verifySignature = async (walletAddress, signatureMap, nonce) => {
  // 1. Check nonce is valid
  const { data, error } = await supabase
    .from("nonces")
    .select("*")
    .eq("wallet_address", walletAddress)
    .single();

  if (error || !data || data.nonce !== nonce) {
    throw new Error("Invalid nonce");
  }

  // 2. Verify signature
  // try {
  //   const sigMapBytes = Buffer.from(signatureMap, "base64");
  //   const sigMap = proto.SignatureMap.decode(sigMapBytes);

  //   const sigPair = sigMap.sigPair[0];
  //   const pubKey = PublicKey.fromBytes(sigPair.pubKeyPrefix);
  //   const signature = Buffer.from(sigPair.ed25519);
  //   const messageBytes = Buffer.from(btoa(nonce));

  //   const isValid = pubKey.verify(messageBytes, signature);
  //   if (!isValid) throw new Error("Invalid signature");
  // } catch (err) {
  //   throw new Error("Signature verification failed: " + err.message);
  // }

  try {
    const sigMapBytes = Buffer.from(signatureMap, "base64");
const sigMap = proto.SignatureMap.decode(sigMapBytes);

const sigPair = sigMap.sigPair[0];
const rawPubKeyHex = Buffer.from(sigPair.pubKeyPrefix).toString("hex");
const sig = Buffer.from(sigPair.ed25519);
const pubKey = PublicKey.fromStringED25519(rawPubKeyHex);

const btoaNonce = btoa(nonce); // "NTA0OWU5MmQx..."

const candidates = {
  "raw nonce utf8":         Buffer.from(nonce, "utf8"),
  "btoa(nonce) utf8":       Buffer.from(btoaNonce, "utf8"),
  "btoa(nonce) base64":     Buffer.from(btoaNonce, "base64"),
  "nonce hex":              Buffer.from(nonce, "hex"),
  "nonce base64":           Buffer.from(nonce, "base64"),
};

for (const [label, msgBytes] of Object.entries(candidates)) {
  const valid = pubKey.verify(msgBytes, sig);
  console.log(`[${label}] length=${msgBytes.length} valid=${valid}`);

  console.log("sig hex:", sig.toString("hex"));
console.log("sigPair keys:", Object.keys(sigPair));
}
  } catch (err) {
  throw new Error("Signature verification failed: " + err.message);
}

  // 3. Delete used nonce
  await supabase.from("nonces").delete().eq("wallet_address", walletAddress);

  // 4. Check if user exists, create if not
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