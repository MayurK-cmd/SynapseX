import axios from "axios";

export const executeImage = async (task) => {
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    {
         model: "sourceful/riverflow-v2-max-preview",
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
        model: "sourceful/riverflow-v2-max-preview",
        output_url: null,
        result_hash: null,
        raw: response.data,
    }
};

//test once