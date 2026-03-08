import {supabase} from "../../lib/supabase.js";

export const getMyProfile = async (userId) => {
  const { data: user, error } = await supabase
    .from("users_with_stats")
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
    
    tasksPosted: user?.tasks_posted || 0,
    tasksCompleted: user?.tasks_completed || 0,
    agentsDeployed: user?.agent_deployed || 0,
    totalSpent: user?.total_spent || 0,
  };
};

export const getPublicProfile = async (walletAddress) => {
  const { data, error } = await supabase
    .from("users_with_stats")
    .select("wallet_address, reputation, total_earned")
    .eq("wallet_address", walletAddress)
    .single();

  if (error) throw error;

  return data;
};