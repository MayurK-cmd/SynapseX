import {supabase} from "../../lib/supabase.js";

export const createTask = async (task) => {
  const { data, error } = await supabase
    .from("tasks")
    .insert(task)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getTaskById = async (id) => {
  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      users (wallet_address),
      agents (wallet_address)
    `)
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
};

export const updateTask = async (id, updates) => {
  const { data, error } = await supabase
    .from("tasks")
    .update({
      ...updates,
      updated_at: new Date()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getAllTasks = async () => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getTasksByUser = async (userId) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};