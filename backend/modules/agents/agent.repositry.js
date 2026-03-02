import { supabase } from "../../lib/supabase.js";

export const createAgent = async (agent) => {
    const {data, error} = await supabase
        .from('agents')
        .insert(agent)
        .select()
        .single();

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

export const getUserAgents = async (userId) => {
    const {data, error} = await supabase
        .from('agents')
        .select()
        .eq('owner_user_id', userId)
        .eq("model_source","USER");

    if (error) {
        throw new Error(error.message);
    }

    return data;
};
