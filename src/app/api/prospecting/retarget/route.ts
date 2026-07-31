import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { retargetLoopWorkflow } from "../../../../../scripts/retarget-loop";

// Vercel Cron trigger — starts the durable 24h self-looping workflow (see
// scripts/retarget-loop.ts) and returns immediately. Triggered once/day
// (Hobby plan caps Vercel Cron Jobs at once/day — the every-10-minutes
// repetition happens inside the workflow via sleep(), a separate mechanism
// not subject to that cap) via vercel.json.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const run = await start(retargetLoopWorkflow);
  return NextResponse.json({ started: true, runId: run.runId });
}
