import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { isAdminAuthed } from "@/lib/admin-auth";

const WINDOW_MS = 90 * 24 * 60 * 60 * 1000;
const MAX_ROWS = 500;
const BOT_SCAN_MAX_DURATION_MS = 2000;

export interface IdentifiedClick {
  visitedAt: string;
  path: string;
  city: string | null;
  country: string | null;
  companyName: string | null;
  email: string | null;
  category: string | null;
  likelyBot: boolean;
}

/**
 * Answers "which prospect actually clicked?" — the campaigns overview
 * (../route.ts) only ever reports aggregate visit counts per utm_source,
 * because a click alone (utm_source=prospecting) doesn't identify the
 * clicker. This joins site_visits.ref back to prospecting_sent.tracking_ref
 * (see migrations.sql section 13) to name the company/email behind each
 * click.
 */
export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();

  const { data: visits, error: visitsError } = await admin
    .from("site_visits")
    .select("created_at, path, city, country, duration_ms, ref")
    .not("ref", "is", null)
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (visitsError) {
    return NextResponse.json({ error: visitsError.message }, { status: 500 });
  }
  if (!visits || visits.length === 0) {
    return NextResponse.json({ clicks: [] });
  }

  const refs = Array.from(new Set(visits.map((v) => v.ref).filter((r): r is string => r !== null)));
  const { data: prospects, error: prospectsError } = await admin
    .from("prospecting_sent")
    .select("tracking_ref, company_name, email, category")
    .in("tracking_ref", refs);

  if (prospectsError) {
    return NextResponse.json({ error: prospectsError.message }, { status: 500 });
  }

  const byRef = new Map((prospects ?? []).map((p) => [p.tracking_ref as string, p]));

  const clicks: IdentifiedClick[] = visits.map((v) => {
    const prospect = v.ref ? byRef.get(v.ref) : undefined;
    return {
      visitedAt: v.created_at,
      path: v.path,
      city: v.city,
      country: v.country,
      companyName: prospect?.company_name ?? null,
      email: prospect?.email ?? null,
      category: prospect?.category ?? null,
      likelyBot: v.duration_ms !== null && v.duration_ms < BOT_SCAN_MAX_DURATION_MS,
    };
  });

  return NextResponse.json({ clicks });
}
