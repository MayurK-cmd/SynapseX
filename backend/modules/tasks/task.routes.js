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
router.get("/:id", authenticate,getTask);
router.patch("/:id/escrow", authenticate, async (req, res) => {
  try {
    const { escrow_tx_hash } = req.body;
    const { data, error } = await supabase
      .from("tasks")
      .update({ escrow_tx_hash })
      .eq("id", req.params.id)
      .eq("creator_id", req.user.userId)
      .select()
      .single();
    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


export default router;