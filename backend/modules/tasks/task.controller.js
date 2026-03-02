import * as service from "./task.service.js";
import { supabase } from "../../lib/supabase.js";

export const createTask = async (req, res) => {
  try {
    

    const task = await service.createTask(
      req.user,
      req.body
    );

    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  const tasks = await service.getAllTasks();
  res.json(tasks);
};

export const getTask = async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from("tasks")
    .select(`
      *,
      winner_agent:agents!tasks_winner_agent_id_fkey (
        id,
        name
      )
    `)
    .eq("id", id) // filter by task id
    .eq("creator_id", req.user.userId) // optional but recommended (security)
    .single(); // ensures only one row is returned

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Task not found" });
  }

  res.json(data);
};

export const getMyTasks = async (req, res) => {
  //const tasks = await service.getMyTasks(req.user.userId);
  const { data, error } = await supabase
  .from("tasks")
  .select(`
    *,
    winner_agent:agents!tasks_winner_agent_id_fkey (
      id,
      name
    )
  `)
  .eq("creator_id", req.user.userId);
  res.json(data);

  if (error) {
    res.status(500).json({ error: error.message });
  }
};