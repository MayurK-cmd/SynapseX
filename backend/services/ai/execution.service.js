import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const executeModel = async ({ modelIdentifier, prompt, originAgentCluster }) => {
  const start = Date.now();

  try {
    let apiKey;

    if (originAgentCluster.model_pool_type === "USER") {
      // If this model is in the USER pool, use the user-specific API key
      const { decrypt } = await import("../../services/security/encryption.service.js");
      apiKey = decrypt(originAgentCluster.api_key_encrypted);
    } else if (originAgentCluster.model_pool_type === "PLATFORM") {
      // Platform models use the platform-wide key
      apiKey = process.env.OPENROUTER_API_KEY;
    } else {
      throw new Error("Cannot determine API key for this model");
    }

    if (!apiKey) {
      throw new Error("Missing API key");
    }

    const response = await axios.post(
      OPENROUTER_URL,
      {
        model: modelIdentifier,
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 60000,
      }
    );

    const latency = Date.now() - start;

    if (!response.data?.choices?.length) {
      throw new Error("Invalid response structure from OpenRouter");
    }

    return {
      text: response.data.choices[0].message?.content ?? "",
      tokens: response.data.usage?.total_tokens ?? null,
      latency,
    };
  } catch (error) {
    console.error("executeModel error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message || "Failed to execute model"
    );
  }
};