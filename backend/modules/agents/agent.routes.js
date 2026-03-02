import express from "express";
import { registerModel, myModels } from "./agent.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", authenticate, registerModel);
router.get("/my",authenticate,myModels);

export default router;