import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { parseUserAgent } from "@/lib/user-agent";

const SESSION_ID_RE = /^[a-zA-Z0-9_-]{8,64}$/;
const MAX_TEXT_LENGTH = 512;

function parseFloatHeader(value: string | null): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n : null;
}

const countryNames = new Intl.DisplayNames(["fr"], { type: "region" });
function countryName(code: string | null): string | null {
  if (!code) return null;
  try {
    return countryNames.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

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

  // Vercel injects these geo headers on every request at the edge — free, no
  // third-party geo-IP service needed. Absent when running locally.
  const headers = request.headers;
  const countryCode = headers.get("x-vercel-ip-country");
  const city = headers.get("x-vercel-ip-city");
  const { deviceType, browser, os } = parseUserAgent(headers.get("user-agent") ?? "");

  const admin = createSupabaseAdmin();
  await admin.from("site_visits").insert({
    session_id: sessionId,
    path,
    referrer: typeof referrer === "string" ? referrer.slice(0, MAX_TEXT_LENGTH) : null,
    country: countryName(countryCode),
    country_code: countryCode,
    city: city ? decodeURIComponent(city) : null,
    latitude: parseFloatHeader(headers.get("x-vercel-ip-latitude")),
    longitude: parseFloatHeader(headers.get("x-vercel-ip-longitude")),
    device_type: deviceType,
    browser,
    os,
  });

  return NextResponse.json({ ok: true });
}
