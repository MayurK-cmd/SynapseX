import express from "express";
import { createSupportTicket } from "./support.controller.js";

const router = express.Router();

router.post("/support", createSupportTicket);

export default router;