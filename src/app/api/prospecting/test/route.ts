import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { scrapeGoogleMapsCategory } from "@/lib/apify";
import { fetchWebsiteText, personalizeEmail, buildEmailHtml } from "@/lib/prospecting-personalize";
import { appendSheetRow } from "@/lib/google-sheets";

// TEMPORARY — validates the nationwide-scrape + send pipeline on a tiny
// sample (1 category, 2 results) before the full daily cron goes live.
// Delete this route once the test is confirmed good.

const TEST_CATEGORY = "plombier";
const TEST_MAX_RESULTS = 2;
const SEND_FROM = "DevisFlow <equipe@devis-flow.fr>";

function getIsoWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-S${String(weekNum).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY);
  const week = getIsoWeekLabel(new Date());

  const places = await scrapeGoogleMapsCategory(TEST_CATEGORY, TEST_MAX_RESULTS);
  const log: string[] = [`Scraped ${places.length} places for "${TEST_CATEGORY}" (nationwide)`];

  for (const place of places) {
    if (!place.website || !place.email) {
      log.push(`SKIP ${place.companyName} — no_website_or_email`);
      continue;
    }

    const [{ data: blacklisted }, { data: sentToEmail }, { data: sentToCompany }] = await Promise.all([
      admin.from("prospecting_blacklist").select("id").eq("email", place.email).maybeSingle(),
      admin.from("prospecting_sent").select("id").eq("email", place.email).maybeSingle(),
      admin.from("prospecting_sent").select("id").ilike("company_name", place.companyName).maybeSingle(),
    ]);
    if (blacklisted || sentToEmail || sentToCompany) {
      log.push(`SKIP ${place.companyName} — already contacted or blacklisted`);
      continue;
    }

    const siteText = await fetchWebsiteText(place.website);
    if (!siteText) {
      log.push(`SKIP ${place.companyName} — could not fetch website text`);
      continue;
    }

    const message = await personalizeEmail(place.website, siteText);
    if (!message) {
      log.push(`SKIP ${place.companyName} — personalization failed`);
      continue;
    }

    const { error } = await resend.emails.send({
      from: SEND_FROM,
      to: place.email,
      replyTo: "equipe@devis-flow.fr",
      subject: `${place.companyName}, une question rapide`,
      text: message,
      html: buildEmailHtml(message),
      headers: { "List-Unsubscribe": "<mailto:equipe@devis-flow.fr?subject=STOP>" },
    });

    const status = error ? "bounced" : "sent";
    if (error) {
      log.push(`FAIL ${place.email} — ${error.message}`);
    } else {
      log.push(`OK ${place.companyName} <${place.email}>`);
      await admin.from("prospecting_sent").insert({
        email: place.email,
        category: TEST_CATEGORY,
        company_name: place.companyName,
      });
    }

    try {
      await appendSheetRow([
        week,
        new Date().toISOString().slice(0, 10),
        TEST_CATEGORY,
        place.companyName,
        place.email ?? "",
        place.phone ?? "",
        place.website ?? "",
        place.address ?? "",
        place.googleRating ?? "",
        status === "sent" ? "envoyé" : "bounced",
        message,
      ]);
    } catch (err) {
      log.push(`Sheet append failed: ${err instanceof Error ? err.message : "unknown"}`);
    }
  }

  return NextResponse.json({ log, places });
}
