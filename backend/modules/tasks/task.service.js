import * as repo from "./task.repository.js";
import { TaskStatus } from "../../constants/taskStatus.js";
import { runPlatformCompetition } from "../competition/competition.engine.js";
import { supabase } from "../../lib/supabase.js";

export const createTask = async (user, body) => {
  const autotitle = body.description.split(" ").slice(0, 6).join(" ") + "...";

  const task = {
    title: autotitle,
    description: body.description,
    reward: body.reward,
    type: body.type,
    creator_id: user.userId,
    model_pool_type: body.model_pool_type || "PLATFORM",
    status: "PENDING_ESCROW",          // ← was "OPEN" — competition does NOT start yet
    selected_agent_ids: body.selected_agent_ids ?? [],
  };

  const savedTask = await repo.createTask(task);

  // ✋ Do NOT call processTask here anymore.
  // Competition starts only after escrow is confirmed via PATCH /:id/escrow

  return savedTask;
};

// Called by the escrow PATCH route once tx hash is confirmed
export const processTask = async (task) => {
  try {
    await supabase
      .from("tasks")
      .update({ status: "IN_PROGRESS" })
      .eq("id", task.id);

    await runPlatformCompetition(task);
  } catch (err) {
    console.error("Error processing task:", err);
    await supabase
      .from("tasks")
      .update({ status: "FAILED", error: err.message })
      .eq("id", task.id);
  } finally {
    console.log(`Task ${task.id} processed.`);
  }
};

export const getMyTasks = (id) => repo.getTasksByUser(id);
export const getTask = (id) => repo.getTaskById(id);
export const getAllTasks = () => repo.getAllTasks();