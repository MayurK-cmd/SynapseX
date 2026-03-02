import express from "express";
import { getStats,getLeaderboard } from "./stats.controller.js";

const router = express.Router();

router.get("/", getStats);
router.get("/leaderboard",getLeaderboard)

export default router;