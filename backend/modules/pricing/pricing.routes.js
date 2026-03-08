// routes/pricing.routes.js
// GET /api/tasks/price?models=openai/gpt-4o,meta-llama/llama-3.3-70b-instruct
import express from "express";

const router = express.Router();
import { calculateTaskReward } from "./pricing.service";
import { authenticate } from "../../middlewares/auth.middleware";

/**
 * GET /api/tasks/price
 *
 * Query params:
 *   models (required) — comma-separated OpenRouter model IDs
 *
 * Returns:
 *   {
 *     breakdown: [{ modelId, modelName, isFree, inputCostUSD, markupUSD, totalForModelUSD, totalForModelHBAR }],
 *     totalUSD: number,
 *     totalHBAR: number,         ← use this as the suggested reward
 *     hbarPriceUSD: number,
 *     estimatedTokensPerModel: number,
 *     markupPerModelUSD: number,
 *     modelCount: number
 *   }
 */
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
      .slice(0, 3); // max 3 models

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

module.exports = router;