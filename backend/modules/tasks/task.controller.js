import * as service from "./task.service.js";

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
  const task = await service.getTask(req.params.id);
  res.json(task);
};

export const getMyTasks = async (req, res) => {
  const tasks = await service.getMyTasks(req.user.userId);
  res.json(tasks);
};