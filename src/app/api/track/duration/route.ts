import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_DURATION_MS = 24 * 60 * 60 * 1000; // sanity cap — a tab left open for days shouldn't skew averages

/** Public beacon (sent via navigator.sendBeacon on page hide) — reports how long a visit lasted. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const id = body?.id;
  const durationMs = body?.durationMs;

  if (typeof id !== "string" || !UUID_RE.test(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs <= 0 || durationMs > MAX_DURATION_MS) {
    return NextResponse.json({ error: "Invalid durationMs" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  await admin.from("site_visits").update({ duration_ms: Math.round(durationMs) }).eq("id", id);

  return NextResponse.json({ ok: true });
}
