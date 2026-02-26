//import {supabase} from "../../lib/supabase.js";
import {supabase} from "../../lib/supabase.js";

export const getMyProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("creator_id", userId);

  const completedTasks = tasks?.filter(
    (t) => t.status === "COMPLETED"
  );

  return {
    reputation: user.reputation,
    tasksPosted: tasks?.length || 0,
    tasksCompleted: completedTasks?.length || 0,
    earnings: user.total_earned,
  };
};

export const getPublicProfile = async (walletAddress) => {
  const { data, error } = await supabase
    .from("users")
    .select("wallet_address, reputation, total_earned")
    .eq("wallet_address", walletAddress)
    .single();

  if (error) throw error;

  return data;
};