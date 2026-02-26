import express from "express";
import {
  me,
  publicProfile
} from "./user.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", authenticate, me);
router.get("/:walletAddress", publicProfile);

export default router;