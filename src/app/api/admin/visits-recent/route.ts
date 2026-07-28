import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { isAdminAuthed } from "@/lib/admin-auth";

const WINDOW_MS = 24 * 60 * 60 * 1000; // last 24h — entries stay visible through the full day instead of vanishing after an hour
const MAX_ROWS = 500;

export async function GET() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { data, error } = await admin
    .from("site_visits")
    .select("session_id, path, country, country_code, city, latitude, longitude, device_type, browser, os, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(MAX_ROWS);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ visits: data ?? [] });
}
