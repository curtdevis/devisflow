import { sleep } from "workflow";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { scrapeGoogleMapsCategory, type ApifyPlace } from "@/lib/apify";
import { fetchWebsiteText, personalizeEmail, buildEmailHtml } from "@/lib/prospecting-personalize";
import { appendSheetRow } from "@/lib/google-sheets";

const CATEGORIES = [
  "plombier",
  "electricien",
  "peintre",
  "macon",
  "carreleur",
  "menuisier",
  "chauffagiste",
  "couvreur",
  "serrurier",
  "vitrier",
] as const;

const PROSPECTS_PER_CATEGORY = 20;
const DELAY_BETWEEN_EMAILS = "30s";
const SEND_FROM = "DevisFlow <equipe@devis-flow.fr>";

type SendStatus = "sent" | "bounced" | "skipped";

interface ProspectResult {
  category: string;
  companyName: string;
  email: string | null;
  status: SendStatus;
  reason?: string;
}

function getIsoWeekLabel(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return `${d.getUTCFullYear()}-S${String(weekNum).padStart(2, "0")}`;
}

// ── Steps ──────────────────────────────────────────────────────────────────

async function scrapeCategoryStep(category: string): Promise<ApifyPlace[]> {
  "use step";
  try {
    return await scrapeGoogleMapsCategory(category, PROSPECTS_PER_CATEGORY);
  } catch (err) {
    console.error(`[daily-prospecting] Apify scrape failed for "${category}":`, err);
    return [];
  }
}

/**
 * Blocks a send if this email (or this company, under a possibly different
 * email) already received an outreach, or if the email replied STOP.
 * The company-name check matters because Apify can surface the same
 * business with a slightly different scraped email across daily runs.
 */
async function checkGateStep(
  email: string,
  companyName: string
): Promise<{ allowed: boolean; reason?: string }> {
  "use step";
  const admin = createSupabaseAdmin();

  const [{ data: blacklisted }, { data: sentToEmail }, { data: sentToCompany }] = await Promise.all([
    admin.from("prospecting_blacklist").select("id").eq("email", email).maybeSingle(),
    admin.from("prospecting_sent").select("id").eq("email", email).maybeSingle(),
    admin.from("prospecting_sent").select("id").ilike("company_name", companyName).maybeSingle(),
  ]);

  if (blacklisted) return { allowed: false, reason: "blacklisted" };
  if (sentToEmail) return { allowed: false, reason: "already_sent_email" };
  if (sentToCompany) return { allowed: false, reason: "already_sent_company" };
  return { allowed: true };
}

async function personalizeStep(place: ApifyPlace): Promise<string | null> {
  "use step";
  if (!place.website) return null;
  const siteText = await fetchWebsiteText(place.website);
  if (!siteText) return null;
  try {
    return await personalizeEmail(place.website, siteText);
  } catch (err) {
    console.error(`[daily-prospecting] Claude personalization failed for ${place.website}:`, err);
    return null;
  }
}

// NOTE: STOP replies are not auto-processed yet — that requires Resend
// Inbound on a dedicated receiving subdomain (Pro plan), not set up as of
// writing. The instruction is still shown to prospects (required either
// way); until inbound is wired up, STOP replies must be blacklisted by hand
// via an insert into prospecting_blacklist. Duplicate protection in
// checkGateStep (by email AND company name) is what actually prevents
// re-contacting someone in the meantime.
async function sendEmailStep(
  place: ApifyPlace,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  "use step";
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error } = await resend.emails.send({
      from: SEND_FROM,
      to: place.email!,
      replyTo: "equipe@devis-flow.fr",
      subject: `${place.companyName}, une question rapide`,
      text: message,
      html: buildEmailHtml(message),
      headers: {
        "List-Unsubscribe": "<mailto:equipe@devis-flow.fr?subject=STOP>",
      },
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
}

async function recordResultStep(
  week: string,
  place: ApifyPlace,
  category: string,
  status: SendStatus,
  message: string
): Promise<void> {
  "use step";
  const admin = createSupabaseAdmin();

  if (status === "sent" && place.email) {
    await admin.from("prospecting_sent").insert({
      email: place.email,
      category,
      company_name: place.companyName,
    });
  }

  try {
    await appendSheetRow([
      week,
      new Date().toISOString().slice(0, 10),
      category,
      place.companyName,
      place.email ?? "",
      place.phone ?? "",
      place.website ?? "",
      place.address ?? "",
      place.googleRating ?? "",
      status === "sent" ? "envoyé" : status === "bounced" ? "bounced" : "ignoré",
      message,
    ]);
  } catch (err) {
    // Never let a Sheets outage block the campaign — the Supabase row above
    // is the source of truth for dedup; the sheet is a human-readable log.
    console.error("[daily-prospecting] Google Sheets append failed:", err);
  }
}

// ── Workflow ───────────────────────────────────────────────────────────────

export async function dailyProspectingWorkflow() {
  "use workflow";

  const week = getIsoWeekLabel(new Date());
  const results: ProspectResult[] = [];

  for (const category of CATEGORIES) {
    const places = await scrapeCategoryStep(category);

    for (const place of places) {
      if (!place.website || !place.email) {
        results.push({ category, companyName: place.companyName, email: place.email, status: "skipped", reason: "no_website_or_email" });
        continue;
      }

      const gate = await checkGateStep(place.email, place.companyName);
      if (!gate.allowed) {
        results.push({ category, companyName: place.companyName, email: place.email, status: "skipped", reason: gate.reason });
        continue;
      }

      const message = await personalizeStep(place);
      if (!message) {
        results.push({ category, companyName: place.companyName, email: place.email, status: "skipped", reason: "personalization_failed" });
        continue;
      }

      const sendResult = await sendEmailStep(place, message);
      const status: SendStatus = sendResult.ok ? "sent" : "bounced";
      await recordResultStep(week, place, category, status, message);
      results.push({ category, companyName: place.companyName, email: place.email, status, reason: sendResult.error });

      await sleep(DELAY_BETWEEN_EMAILS);
    }
  }

  const sent = results.filter((r) => r.status === "sent").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const bounced = results.filter((r) => r.status === "bounced").length;

  console.log(`[daily-prospecting] Semaine ${week} — ${sent} envoyés, ${skipped} ignorés, ${bounced} échecs`);

  return { week, sent, skipped, bounced, results };
}
