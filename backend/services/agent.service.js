import {supabase} from '../lib/supabase.js';

const SYSTEM_AGENT_WALLET = process.env.PLATFORM_WALLET;

export const getOrCreateSystemAgent = async () => {
  const { data: existing } = await supabase
    .from("agents")
    .select("*")
    .eq("wallet_address", SYSTEM_AGENT_WALLET)
    .single();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("agents")
    .insert({
      name: "System AI Agent",
      wallet_address: SYSTEM_AGENT_WALLET,
    })
    .select()
    .single();

  if (error) throw error;

  return data;
};