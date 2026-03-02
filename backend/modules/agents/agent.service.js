import * as repo from "./agent.repositry.js";
import {encrypt} from "../../services/security/encryption.service.js";
import { supabase } from "../../lib/supabase.js";

export const registerUserModel = async({
    user,
    name,
    modelIdentifier,
    apiKey,
}) => {
    const encryptedKey = encrypt(apiKey);

    const {data:dbUser} = await supabase
       .from("users")
       .select("wallet_address")
       .eq("id", user.userId)
       .single();
      

  return repo.createAgent({
    name,
    model_identifier: modelIdentifier,
    model_source: "USER",
    owner_user_id: user.userId,
    wallet_address: dbUser.wallet_address,
    api_key_encrypted: encryptedKey,
  });
}


export const getUserAgents = (userId) => repo.getUserAgents(userId);