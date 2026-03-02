import axios from "axios";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export const executeModel = async ({ modelIdentifier, prompt, apiKey }) => {
  const start = Date.now();

  try {
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
      }
    );

    const latency = Date.now() - start;

    // Validate response structure
    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error("Invalid response structure");
    }

    return {
      text: response.data.choices[0].message.content,
      tokens: response.data.usage.total_tokens,
      latency,
    };
  } catch (error) {
    console.error("Error in executeModel:", error);
    throw new Error("Failed to execute model");
  }
};