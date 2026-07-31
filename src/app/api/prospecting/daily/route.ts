import { NextRequest, NextResponse } from "next/server";
import { start } from "workflow/api";
import { dailyProspectingWorkflow } from "../../../../../scripts/daily-prospecting";

// Vercel Cron trigger — starts the durable workflow and returns immediately.
// The actual scraping/personalizing/sending (up to ~100 min with the 30s
// delay between the 10 categories × 20 prospects) runs independently of this
// request's lifetime, so this route stays fast regardless of campaign size.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // maxSends is an optional manual-test knob (e.g. ?maxSends=50 to validate
  // the pipeline end-to-end without waiting out a full multi-hour run) —
  // the actual cron trigger never sets it, so production runs stay uncapped.
  // Rejecting anything malformed matters here specifically: a silently
  // ignored typo (e.g. ?maxSends=abc, Number()'d to NaN) would fall through
  // to an unbounded production-scale send under what looked like a capped
  // test.
  const maxSendsParam = request.nextUrl.searchParams.get("maxSends");
  let maxSends: number | undefined;
  if (maxSendsParam !== null) {
    maxSends = Number(maxSendsParam);
    if (!Number.isInteger(maxSends) || maxSends <= 0) {
      return NextResponse.json({ error: "maxSends must be a positive integer" }, { status: 400 });
    }
  }

  const run = await start(dailyProspectingWorkflow, [maxSends]);
  return NextResponse.json({ started: true, runId: run.runId, maxSends: maxSends ?? null });
}
