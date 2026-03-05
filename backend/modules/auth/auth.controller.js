import * as authService from "./auth.service.js";
import { supabase } from "../../lib/supabase.js";

export const getNonce = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const nonce = await authService.generateNonce(walletAddress);
    res.json({ nonce });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const verify = async (req, res) => {
  try {
    const { walletAddress, signature, nonce } = req.body; // 👈 signature not signatureMap

    const data = await authService.verifySignature(
      walletAddress,
      signature,
      nonce
    );

    res.json(data);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const me = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", req.user.userId)
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};