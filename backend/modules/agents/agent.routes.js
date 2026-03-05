import express from "express";
import { supabase } from "../../lib/supabase.js";
import { registerModel, myModels } from "./agent.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authenticate, registerModel);
router.get("/my",authenticate,myModels);
// GET /agents/available?pool=PLATFORM or ?pool=USER
router.get("/available", authenticate, async (req, res) => {
  try {
    const { pool } = req.query;
    const { data, error } = await supabase
      .from("agents")
      .select("id, name, model_identifier, model_source, reputation, wallet_address")
      .eq("competition_enabled", true)
      .eq("model_source", pool === "USER" ? "USER" : "PLATFORM");

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;