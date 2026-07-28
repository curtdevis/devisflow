import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { isAdminAuthed } from "@/lib/admin-auth";

const WINDOW_MS = 7 * 24 * 60 * 60 * 1000; // last 7 days — enough volume to be meaningful
const MAX_ROWS = 20_000;

export interface PageEngagementRow {
  path: string;
  visits: number;
  avgDurationMs: number;
}

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { data, error } = await admin
    .from("site_visits")
    .select("path, duration_ms")
    .gte("created_at", since)
    .limit(MAX_ROWS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const byPath = new Map<string, { visits: number; durationSum: number; durationCount: number }>();
  for (const row of data ?? []) {
    const entry = byPath.get(row.path) ?? { visits: 0, durationSum: 0, durationCount: 0 };
    entry.visits++;
    if (typeof row.duration_ms === "number") {
      entry.durationSum += row.duration_ms;
      entry.durationCount++;
    }
    byPath.set(row.path, entry);
  }

  const pages: PageEngagementRow[] = Array.from(byPath.entries())
    .map(([path, s]) => ({
      path,
      visits: s.visits,
      avgDurationMs: s.durationCount > 0 ? Math.round(s.durationSum / s.durationCount) : 0,
    }))
    .sort((a, b) => b.avgDurationMs - a.avgDurationMs)
    .slice(0, 15);

  return NextResponse.json({ pages });
}
