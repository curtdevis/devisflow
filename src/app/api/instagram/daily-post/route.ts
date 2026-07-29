import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { dailyInstagramPostWorkflow } from "../../../../../scripts/daily-instagram-post";

// Vercel Cron trigger — starts the durable workflow and returns immediately.
// See scripts/daily-instagram-post.tsx for the actual logic and
// .claude/agents/community-manager.md for the Instagram API gotchas.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const run = await start(dailyInstagramPostWorkflow);
  return NextResponse.json({ started: true, runId: run.runId });
}
