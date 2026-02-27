import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  getMyTasks,
} from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authenticate, createTask);
router.get("/", getTasks);
router.get("/my", authenticate, getMyTasks);
router.get("/:id", getTask);


export default router;