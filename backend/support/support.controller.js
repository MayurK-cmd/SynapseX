import { supabase } from "../lib/supabase.js";

export const createSupportTicket = async (req, res) => {
  try {
    const { category, message, email } = req.body;

    if (!category || !message) {
      return res.status(400).json({ error: "Category and message are required" });
    }

    const { data, error } = await supabase
      .from("support")
      .insert([
        {
          category,
          message,
          email,
        },
      ])
      .select();

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({
      success: true,
      ticket: data[0],
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};