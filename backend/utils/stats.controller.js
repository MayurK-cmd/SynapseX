import { supabase } from "../lib/supabase.js";

export const getStats = async (req, res) => {
  try {
    const [agents, users, tasks, completedTasks, failedTasks, platformAgents, userAgents, rewards, latencyRes] = await Promise.all([
      supabase.from("agents").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "COMPLETED"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "FAILED"),
      supabase.from("agents").select("*", { count: "exact", head: true }).eq("model_source", "PLATFORM"),
      supabase.from("agents").select("*", { count: "exact", head: true }).eq("model_source", "USER"),
      supabase.from("tasks").select("reward").eq("status", "COMPLETED"),
      supabase.from("task_model_entries").select("latency_ms").gt("latency_ms", 0),


    ]);
    const avgLatency = latencyRes.data?.length > 0
  ? Math.round(latencyRes.data.reduce((sum, e) => sum + e.latency_ms, 0) / latencyRes.data.length)
  : 0;

    const totalRewards = rewards.data?.reduce((sum, t) => sum + (t.reward || 0), 0) ?? 0;

    res.json({
      total_models: agents.count ?? 0,
      total_users: users.count ?? 0,
      total_tasks: tasks.count ?? 0,
      completed_tasks: completedTasks.count ?? 0,
      failed_tasks: failedTasks.count ?? 0,
      platform_agents: platformAgents.count ?? 0,
      user_agents: userAgents.count ?? 0,
      total_rewards: totalRewards,
      avg_latency_ms:avgLatency,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeaderboard = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, model_source, reputation, total_earned, model_identifier")
      .order("reputation", { ascending: false })
      .limit(5);
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};