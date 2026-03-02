import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import userRoutes from "./modules/user/user.routes.js";
import taskRoutes from "./modules/tasks/task.routes.js";
import agentRoutes from "./modules/agents/agent.routes.js";
import statsRoutes from "./utils/stats.routes.js";

dotenv.config();
const app = express();
const allowedOrigins = [
  'http://localhost:5173',
  process.env.CORS_ORIGIN
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());
app.get("/",(req,res) => {
  res.status(200).json({message:'Backend is up and running check /stats for data'})
}

)
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/agents",agentRoutes);
app.use("/stats",statsRoutes)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});