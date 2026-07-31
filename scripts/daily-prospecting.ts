import { sleep } from "workflow";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { searchBusinessesByCategory, type BusinessPlace } from "@/lib/google-places";
import { fetchWebsiteData, domainAcceptsMail, personalizeEmail, buildEmailHtml } from "@/lib/prospecting-personalize";
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

// A bare "{category} France" query only ever returns Google's top-20
// national results for that text — same listings, run after run — which is
// why the pool of fresh prospects dried up after a few days. Querying per
// city instead surfaces a distinct top-N for each city, and pagination lets
// each of those go past 20. See searchBusinessesByCategory in
// src/lib/google-places.ts.
const CITIES = [
  "Paris",
  "Marseille",
  "Lyon",
  "Toulouse",
  "Nice",
  "Nantes",
  "Montpellier",
  "Strasbourg",
  "Bordeaux",
  "Lille",
  "Rennes",
  "Reims",
  "Toulon",
  "Grenoble",
  "Dijon",
] as const;

const RESULTS_PER_CITY = 20;
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

interface EnrichedPlace extends Omit<BusinessPlace, "website"> {
  website: string;
  email: string;
  siteText: string;
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

/**
 * Queries every city for this category and merges the results, deduping on
 * company name and website — the same business can legitimately surface
 * under more than one city query (chains, or a search radius overlapping a
 * neighboring city), and re-enriching/re-sending to it would waste a step
 * and risk a double email if the dedupe DB check ever raced.
 */
async function scrapeCategoryStep(category: string): Promise<BusinessPlace[]> {
  "use step";
  const merged: BusinessPlace[] = [];
  const seenNames = new Set<string>();
  const seenWebsites = new Set<string>();

  for (const city of CITIES) {
    let places: BusinessPlace[];
    try {
      places = await searchBusinessesByCategory(category, city, RESULTS_PER_CITY);
    } catch (err) {
      console.error(`[daily-prospecting] Google Places search failed for "${category}" / "${city}":`, err);
      continue;
    }

    for (const place of places) {
      const nameKey = place.companyName.trim().toLowerCase();
      const siteKey = place.website?.trim().toLowerCase() ?? null;
      if (seenNames.has(nameKey) || (siteKey && seenWebsites.has(siteKey))) continue;
      seenNames.add(nameKey);
      if (siteKey) seenWebsites.add(siteKey);
      merged.push(place);
    }

    // Stay well clear of any per-second burst limit across 15 sequential
    // calls per category — Places API New's default quota is generous, but
    // this costs a few seconds against a workflow that already sleeps 30s
    // per send.
    await new Promise((r) => setTimeout(r, 150));
  }

  return merged;
}

/**
 * Fetches the business's own site once, extracting both the personalization
 * text and a real published email (see prospecting-personalize.ts — never a
 * guessed address), then confirms the email's domain can receive mail.
 * Returns null if any of those three things comes up empty — a place with no
 * verifiable, real contact email is skipped entirely, never sent to.
 */
async function enrichPlaceStep(place: BusinessPlace): Promise<EnrichedPlace | null> {
  "use step";
  const website = place.website;
  if (!website) return null;

  const { text, email } = await fetchWebsiteData(website);
  if (!text || !email) return null;

  const mxOk = await domainAcceptsMail(email);
  if (!mxOk) return null;

  return { ...place, website, email, siteText: text };
}

/**
 * Blocks a send if this email (or this company, under a possibly different
 * email) already received an outreach, or if the email replied STOP.
 * The company-name check matters because Google Places can surface the same
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

async function personalizeStep(place: EnrichedPlace): Promise<string | null> {
  "use step";
  try {
    return await personalizeEmail(place.website, place.siteText);
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
  place: EnrichedPlace,
  message: string
): Promise<{ ok: boolean; error?: string }> {
  "use step";
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { error } = await resend.emails.send({
      from: SEND_FROM,
      to: place.email,
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
  place: EnrichedPlace,
  category: string,
  status: SendStatus,
  message: string
): Promise<void> {
  "use step";
  const admin = createSupabaseAdmin();

  if (status === "sent") {
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
      place.email,
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

    for (const rawPlace of places) {
      if (!rawPlace.website) {
        results.push({ category, companyName: rawPlace.companyName, email: null, status: "skipped", reason: "no_website" });
        continue;
      }

      const place = await enrichPlaceStep(rawPlace);
      if (!place) {
        results.push({ category, companyName: rawPlace.companyName, email: null, status: "skipped", reason: "no_verifiable_email" });
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
