// services/pricing.service.js
// Calculates dynamic task reward based on OpenRouter model costs + platform markup

const OPENROUTER_MODELS_URL = "https://openrouter.ai/api/v1/models";
const HBAR_PRICE_URL = "https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd";

const PLATFORM_MARKUP_USD = 0.50; // flat $0.50 per model
const ESTIMATED_TOKENS = 500;     // assumed prompt+completion tokens per model run
const FALLBACK_HBAR_PRICE = 0.07; // used if CoinGecko is unreachable

let modelCache = null;
let modelCacheTime = 0;
const MODEL_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

let hbarCache = null;
let hbarCacheTime = 0;
const HBAR_CACHE_TTL = 60 * 1000; // 1 minute

// ─── Fetch HBAR/USD live price ────────────────────────────────────────────────
async function getHbarPriceUSD() {
  if (hbarCache && Date.now() - hbarCacheTime < HBAR_CACHE_TTL) {
    return hbarCache;
  }
  try {
    const res = await fetch(HBAR_PRICE_URL);
    if (!res.ok) throw new Error("CoinGecko unreachable");
    const data = await res.json();
    const price = data?.["hedera-hashgraph"]?.usd;
    if (!price) throw new Error("Invalid response");
    hbarCache = price;
    hbarCacheTime = Date.now();
    return price;
  } catch (err) {
    console.warn("[pricing] CoinGecko failed, using fallback:", FALLBACK_HBAR_PRICE, err.message);
    return FALLBACK_HBAR_PRICE;
  }
}

// ─── Fetch OpenRouter model list (cached) ────────────────────────────────────
async function getOpenRouterModels() {
  if (modelCache && Date.now() - modelCacheTime < MODEL_CACHE_TTL) {
    return modelCache;
  }
  try {
    const res = await fetch(OPENROUTER_MODELS_URL);
    if (!res.ok) throw new Error("OpenRouter unreachable");
    const data = await res.json();
    modelCache = data.data || [];
    modelCacheTime = Date.now();
    return modelCache;
  } catch (err) {
    console.warn("[pricing] OpenRouter model fetch failed:", err.message);
    return modelCache || [];
  }
}

// ─── Get cost for a single model ─────────────────────────────────────────────
// Returns estimated USD cost for ESTIMATED_TOKENS tokens
async function getModelCostUSD(modelIdentifier) {
  const models = await getOpenRouterModels();
  const model = models.find(m => m.id === modelIdentifier);

  if (!model) {
    // Unknown model — charge flat markup only
    return { modelId: modelIdentifier, inputCostUSD: 0, isFree: true, found: false };
  }

  const promptPrice = parseFloat(model.pricing?.prompt || "0");   // per token
  const completionPrice = parseFloat(model.pricing?.completion || "0"); // per token

  // Estimate: half tokens input, half output
  const estimatedCostUSD = (promptPrice + completionPrice) * (ESTIMATED_TOKENS / 2);
  const isFree = estimatedCostUSD === 0;

  return {
    modelId: modelIdentifier,
    modelName: model.name || modelIdentifier,
    inputCostUSD: estimatedCostUSD,
    promptPricePerToken: promptPrice,
    completionPricePerToken: completionPrice,
    isFree,
    found: true,
  };
}

// ─── Main: calculate total task reward ───────────────────────────────────────
// modelIdentifiers: string[] — array of OpenRouter model IDs
async function calculateTaskReward(modelIdentifiers) {
  if (!modelIdentifiers || modelIdentifiers.length === 0) {
    throw new Error("At least one model identifier is required");
  }

  const [hbarPrice, ...modelCosts] = await Promise.all([
    getHbarPriceUSD(),
    ...modelIdentifiers.map(id => getModelCostUSD(id)),
  ]);

  const breakdown = modelCosts.map(m => {
    const totalForModelUSD = m.inputCostUSD + PLATFORM_MARKUP_USD;
    return {
      modelId: m.modelId,
      modelName: m.modelName || m.modelId,
      isFree: m.isFree,
      found: m.found,
      inputCostUSD: parseFloat(m.inputCostUSD.toFixed(6)),
      markupUSD: PLATFORM_MARKUP_USD,
      totalForModelUSD: parseFloat(totalForModelUSD.toFixed(6)),
      totalForModelHBAR: parseFloat((totalForModelUSD / hbarPrice).toFixed(4)),
    };
  });

  const totalUSD = breakdown.reduce((sum, m) => sum + m.totalForModelUSD, 0);
  const totalHBAR = totalUSD / hbarPrice;

  return {
    breakdown,
    totalUSD: parseFloat(totalUSD.toFixed(6)),
    totalHBAR: parseFloat(totalHBAR.toFixed(4)),
    hbarPriceUSD: hbarPrice,
    estimatedTokensPerModel: ESTIMATED_TOKENS,
    markupPerModelUSD: PLATFORM_MARKUP_USD,
    modelCount: modelIdentifiers.length,
  };
}

export { calculateTaskReward, getHbarPriceUSD };