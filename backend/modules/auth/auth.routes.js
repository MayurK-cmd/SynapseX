import express from "express";
import {
  getNonce,
  verify,
  me
} from "./auth.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/nonce", getNonce);
router.post("/verify", verify);
router.get("/me", authenticate, me);

export default router;