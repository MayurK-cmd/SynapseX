// cron/cleanupPendingTasks.js
// Run this once in your index.js:  import "./cron/cleanupPendingTasks.js"
//
// Install dependency: npm install node-cron

import cron from "node-cron";
import { supabase } from "../lib/supabase.js";

const TIMEOUT_MINUTES = 10;

cron.schedule("*/5 * * * *", async () => {
  const cutoff = new Date(Date.now() - TIMEOUT_MINUTES * 60 * 1000).toISOString();

  const { data: abandoned, error } = await supabase
    .from("tasks")
    .update({
      status: "CANCELLED",
      error: "escrow_timeout — user did not lock funds within 10 minutes",
      updated_at: new Date(),
    })
    .eq("status", "PENDING_ESCROW")
    .lt("created_at", cutoff)
    .select("id");

  if (error) {
    console.error("[cron] Failed to clean up abandoned tasks:", error.message);
    return;
  }

  if (abandoned?.length) {
    console.log(
      `[cron] Cancelled ${abandoned.length} abandoned PENDING_ESCROW task(s):`,
      abandoned.map(t => t.id)
    );
  }
});

console.log("[cron] Abandoned task cleanup scheduled (every 5 min)");