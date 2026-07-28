import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const SESSION_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const MAX_TEXT_LENGTH = 512;

/** Public pageview beacon — no auth (anonymous visitors), input validated to keep bad/abusive rows out. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const sessionId = body?.sessionId;
  const path = body?.path;
  const referrer = body?.referrer;

  if (typeof sessionId !== "string" || !SESSION_ID_RE.test(sessionId)) {
    return NextResponse.json({ error: "Invalid sessionId" }, { status: 400 });
  }
  if (typeof path !== "string" || path.length === 0 || path.length > MAX_TEXT_LENGTH) {
    return NextResponse.json({ error: "Invalid path" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  await admin.from("site_visits").insert({
    session_id: sessionId,
    path,
    referrer: typeof referrer === "string" ? referrer.slice(0, MAX_TEXT_LENGTH) : null,
  });

  return NextResponse.json({ ok: true });
}
