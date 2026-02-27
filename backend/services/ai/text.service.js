import axios from "axios";

export const executeText = async (task) => {
  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemma-3-4b-it:free",
        messages: [
          {
            role: "user",
            content: task.description,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return {
      model: "google/gemma-3-4b-it:free",
      output_url: null,
      result_hash: null,
      raw: response.data,
      result: response.data.choices[0].message.content,
    };

  } catch (error) {
    console.error("OpenRouter Error:", error.response?.data || error.message);
    throw error;
  }
};