import * as repo from "./task.repository.js";
import { TaskStatus } from "../../constants/taskStatus.js";
import { executeAI } from "../../services/ai/ai.router.js";
import { getOrCreateSystemAgent } from "../../services/agent.service.js";

export const createTask = async (user, body) => {
  const task = {
    title: body.title,
    description: body.description,
    reward: body.reward,
    type: body.type,
    creator_id: user.userId,
    status: TaskStatus.OPEN,
  };

  const savedTask = await repo.createTask(task);

  processTask(savedTask.id);

  return savedTask;
};

const processTask = async (taskId) => {
  try {
    const systemAgent = await getOrCreateSystemAgent();

    // 1️⃣ assign agent + mark IN_PROGRESS
    await repo.updateTask(taskId, {
      status: TaskStatus.IN_PROGRESS,
      agent_id: systemAgent.id,
    });

    const task = await repo.getTaskById(taskId);

    // 2️⃣ execute AI
    const result = await executeAI(task);

    // 3️⃣ complete task
    await repo.updateTask(taskId, {
      status: TaskStatus.COMPLETED,
      executed_model: result.model,
      output_url: result.output_url || null,
      result_hash: result.raw ? JSON.stringify(result.raw) : result.text ||null,
    });

  } catch (err) {
    await repo.updateTask(taskId, {
      status: TaskStatus.FAILED,
      error: err.message,
    });
  }
};

export const getTask = (id) => repo.getTaskById(id);
export const getAllTasks = () => repo.getAllTasks();