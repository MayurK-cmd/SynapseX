import express from "express";
import {
  createTask,
  getTasks,
  getTask,
  getMyTasks,
} from "./task.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { calculateTaskReward } from "../pricing/pricing.service.js";
import { processTask } from "./task.service.js";
import { supabase } from "../../lib/supabase.js";

const router = express.Router();

// ── Pricing — MUST be above /:id ──────────────────────────────────
router.get("/price", authenticate, async (req, res) => {
  try {
    const { models } = req.query;

    if (!models || !models.trim()) {
      return res.status(400).json({ message: "Query param 'models' is required (comma-separated model IDs)" });
    }

    const modelIds = models
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    if (modelIds.length === 0) {
      return res.status(400).json({ message: "No valid model IDs provided" });
    }

    const pricing = await calculateTaskReward(modelIds);
    return res.json(pricing);
  } catch (err) {
    console.error("[pricing route]", err);
    return res.status(500).json({ message: "Failed to calculate pricing", error: err.message });
  }
});

// ── My tasks — MUST be above /:id ────────────────────────────────
router.get("/my", authenticate, getMyTasks);

// ── Create task ───────────────────────────────────────────────────
router.post("/", authenticate, createTask);

// ── All tasks ─────────────────────────────────────────────────────
router.get("/", getTasks);

// ── Single task ───────────────────────────────────────────────────
router.get("/:id", authenticate, getTask);

// ── Escrow confirmation → triggers competition ────────────────────
router.patch("/:id/escrow", authenticate, async (req, res) => {
  try {
    const { escrow_tx_hash } = req.body;
    const { id } = req.params;

    if (!escrow_tx_hash) {
      return res.status(400).json({ message: "escrow_tx_hash is required" });
    }

    // 1. Fetch task — verify ownership and that it's still awaiting escrow
    const { data: task, error: fetchErr } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", id)
      .eq("creator_id", req.user.userId)
      .single();

    if (fetchErr || !task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.status !== "PENDING_ESCROW") {
      return res.status(400).json({
        message: `Cannot confirm escrow — task is already '${task.status}'`
      });
    }

    // 2. Save tx hash and set status to OPEN
    const { data: updated, error: updateErr } = await supabase
      .from("tasks")
      .update({
        escrow_tx_hash,
        status: "OPEN",
        updated_at: new Date(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateErr) throw updateErr;

    // 3. Respond immediately — competition runs in background
    res.json(updated);

    // 4. NOW start competition (fire and forget)
    processTask(updated).catch(err =>
      console.error(`[competition] Task ${id} failed:`, err)
    );

  } catch (err) {
    console.error("[escrow patch]", err);
    res.status(500).json({ message: err.message });
  }
});

export default router;