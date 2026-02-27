import axios from "axios";

export const executeImage = async (task) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
         model: "google/gemma-3-27b-it:free",
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
        },
    }
  );
    return {
        model: "google/gemma-3-27b-it:free",
        output_url: null,
        result_hash: null,
        raw: response.data,
    }
};