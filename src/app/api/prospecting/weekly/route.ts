import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { weeklyProspectingWorkflow } from "../../../../../scripts/weekly-prospecting";

// Vercel Cron trigger — starts the durable workflow and returns immediately.
// The actual scraping/personalizing/sending (up to ~50 min with the 30s
// delay between the 10 categories × 10 prospects) runs independently of this
// request's lifetime, so this route stays fast regardless of campaign size.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const run = await start(weeklyProspectingWorkflow);
  return NextResponse.json({ started: true, runId: run.runId });
}
