import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { isAdminAuthed } from "@/lib/admin-auth";

const MAX_ROWS = 20_000;

/**
 * Buckets raw created_at timestamps in JS rather than a SQL GROUP BY — traffic
 * volume is low enough for this project that fetching raw rows and bucketing
 * in memory is simpler than adding a Postgres RPC function, and still fast.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const range = request.nextUrl.searchParams.get("range") === "30d" ? "30d" : "24h";
  const windowMs = range === "30d" ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const bucketMs = range === "30d" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
  const bucketCount = range === "30d" ? 30 : 24;

  const admin = createSupabaseAdmin();
  const since = new Date(Date.now() - windowMs);
  const { data, error } = await admin
    .from("site_visits")
    .select("created_at")
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true })
    .limit(MAX_ROWS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const now = Date.now();
  const buckets = Array.from({ length: bucketCount }, (_, i) => {
    const bucketStart = now - (bucketCount - i) * bucketMs;
    return { time: new Date(bucketStart).toISOString(), count: 0 };
  });

  for (const row of data ?? []) {
    const t = new Date(row.created_at).getTime();
    const bucketIndex = bucketCount - 1 - Math.floor((now - t) / bucketMs);
    if (bucketIndex >= 0 && bucketIndex < bucketCount) {
      buckets[bucketIndex].count++;
    }
  }

  return NextResponse.json({ range, buckets });
}
