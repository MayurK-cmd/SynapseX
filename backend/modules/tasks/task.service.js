import * as repo from "./task.repository.js";
import { TaskStatus } from "../../constants/taskStatus.js";
import { executeAI } from "../../services/ai/ai.router.js";
import { getOrCreateSystemAgent } from "../../services/agent.service.js";
import { runPlatformCompetition } from "../competition/competition.engine.js";
import { supabase } from "../../lib/supabase.js";

export const createTask = async ( user,body) => {

  const autotitle = body.description.split(" ").slice(0,6).join(" ") + "...";
  const task = {
    title: autotitle,
    description :body.description,
    reward : body.reward,
    type: body.type,
    creator_id: user.userId,
    model_pool_type: body.model_pool_type || "PLATFORM",
    status: "OPEN",
  };

  const savedTask = await repo.createTask(task);

  // fire async process (don't await)
  processTask(savedTask);

  return savedTask;
};

// const processTask = async (taskId) => {
//   try {
//     const systemAgent = await getOrCreateSystemAgent();

//     // 1️⃣ assign agent + mark IN_PROGRESS
//     await repo.updateTask(taskId, {
//       status: TaskStatus.IN_PROGRESS,
//       agent_id: systemAgent.id,
//     });

//     const task = await repo.getTaskById(taskId);

//     // 2️⃣ execute AI
//     const result = await executeAI(task);

//     // 3️⃣ complete task
//     await repo.updateTask(taskId, {
//       status: TaskStatus.COMPLETED,
//       executed_model: result.model,
//       output_url: result.output_url || null,
//       result_hash: result.raw ? JSON.stringify(result.raw) : result.text ||null,
//     });

//   } catch (err) {
//     await repo.updateTask(taskId, {
//       status: TaskStatus.FAILED,
//       error: err.message,
//     });
//   }
// };

export const processTask = async (task) => {
  try {
    await supabase.from("tasks").update({ status: "IN_PROGRESS" }).eq("id", task.id);
    await runPlatformCompetition(task);
  } catch (err) {
    console.error("Error processing task:", err);
    await supabase.from("tasks").update({ status: "FAILED", error: err.message }).eq("id", task.id);
  } finally {
    console.log(`Task ${task.id} processed.`);
  }
};

export const getTasksByUser = async (id) => {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("creator_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getMyTasks = (id) => repo.getTasksByUser(id);
export const getTask = (id) => repo.getTaskById(id);
export const getAllTasks = () => repo.getAllTasks();