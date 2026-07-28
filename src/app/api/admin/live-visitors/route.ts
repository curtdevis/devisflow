import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const LIVE_WINDOW_MS = 5 * 60 * 1000;

export async function GET() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword || session?.value !== adminPassword) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const since = new Date(Date.now() - LIVE_WINDOW_MS).toISOString();
  const { data, error } = await admin
    .from("site_visits")
    .select("session_id")
    .gte("created_at", since);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const liveVisitors = new Set((data ?? []).map((r) => r.session_id)).size;
  return NextResponse.json({ liveVisitors });
}
