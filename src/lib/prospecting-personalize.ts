const MAX_SITE_TEXT_LENGTH = 6000;

// Personalization temporarily runs on Gemini instead of Claude — the
// Anthropic account is out of credit. Swap back to @anthropic-ai/sdk once
// credits are restored; the prompt and call site are unchanged either way.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

import { resolveMx } from "node:dns/promises";

const EMAIL_REGEX =
  /[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+/;

// Template placeholder addresses that show up verbatim in unmodified site
// boilerplate — never real contact addresses, must never be sent to.
const GENERIC_EMAIL_BLOCKLIST = new Set([
  "example@example.com",
  "email@example.com",
  "test@test.com",
  "your@email.com",
  "name@example.com",
  "info@example.com",
  "contact@example.com",
]);

const GENERIC_LOCAL_PREFIXES = new Set(["noreply", "no-reply", "donotreply", "do-not-reply"]);

// French independent artisans very commonly run their business contact off a
// personal freemail address rather than a domain-matching one (confirmed by
// this project's own delivered-email data) — mailto links to these are
// trusted, but only via mailto (a deliberate, human-published contact point),
// never via the bare-text regex fallback below.
const FREEMAIL_DOMAINS = new Set([
  "gmail.com", "outlook.com", "outlook.fr", "hotmail.com", "hotmail.fr",
  "yahoo.com", "yahoo.fr", "orange.fr", "free.fr", "laposte.net",
  "wanadoo.fr", "sfr.fr", "icloud.com", "live.fr", "bbox.fr",
]);

function isUsableEmail(candidate: string): boolean {
  if (!EMAIL_REGEX.test(candidate)) return false;
  if (GENERIC_EMAIL_BLOCKLIST.has(candidate)) return false;
  const localPart = candidate.split("@")[0];
  return !GENERIC_LOCAL_PREFIXES.has(localPart);
}

function domainMatchesSite(siteDomain: string, emailDomain: string): boolean {
  return (
    siteDomain === emailDomain ||
    emailDomain.endsWith(`.${siteDomain}`) ||
    siteDomain.endsWith(`.${emailDomain}`)
  );
}

/**
 * Extracts a real, published contact email from a business's own site —
 * never guessed/pattern-generated, and never picked up from a third party
 * merely mentioned on the page (chat widgets, WordPress theme credits, host
 * "abuse@" addresses, a quoted testimonial's signature). Two passes:
 * 1. Every `mailto:` link (a deliberate, human-published contact point),
 *    accepted if its domain matches the site's own domain OR is a common
 *    French freemail provider (very common for independent artisans).
 * 2. Only if no mailto matched: a bare-text regex scan, accepted ONLY if the
 *    domain matches the site's own domain — freemail is excluded here since
 *    an unlinked bare-text email is far more likely to belong to someone
 *    else quoted on the page than to the business itself.
 */
function extractEmailFromCleanedHtml(cleanedHtml: string, siteUrl: string): string | null {
  let siteDomain: string;
  try {
    siteDomain = new URL(siteUrl).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }

  const mailtoRegex = /mailto:([^"'\s?<>]+)/gi;
  let match: RegExpExecArray | null;
  while ((match = mailtoRegex.exec(cleanedHtml)) !== null) {
    let candidate: string;
    try {
      candidate = decodeURIComponent(match[1]).toLowerCase();
    } catch {
      continue; // malformed percent-encoding in this one match — keep scanning
    }
    if (!isUsableEmail(candidate)) continue;
    const emailDomain = candidate.split("@")[1];
    if (!emailDomain) continue;
    if (domainMatchesSite(siteDomain, emailDomain) || FREEMAIL_DOMAINS.has(emailDomain)) {
      return candidate;
    }
  }

  const textRegex = new RegExp(EMAIL_REGEX.source, "gi");
  let textMatch: RegExpExecArray | null;
  while ((textMatch = textRegex.exec(cleanedHtml)) !== null) {
    const candidate = textMatch[0].toLowerCase();
    if (!isUsableEmail(candidate)) continue;
    const emailDomain = candidate.split("@")[1];
    if (emailDomain && domainMatchesSite(siteDomain, emailDomain)) return candidate;
  }

  return null;
}

/**
 * Fetches a company website once and returns both the readable text (for LLM
 * personalization) and any real contact email found on the page (replaces
 * Apify's paid "scrapeContacts" add-on — see google-places.ts). Returns
 * `email: null` rather than fabricating one if nothing verifiable is
 * published.
 */
export async function fetchWebsiteData(
  url: string
): Promise<{ text: string | null; email: string | null }> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DevisFlowBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return { text: null, email: null };

    const html = await res.text();
    const cleaned = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<!--[\s\S]*?-->/g, " ");

    const email = extractEmailFromCleanedHtml(cleaned, url);
    const text = cleaned
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    return { text: text.length > 0 ? text.slice(0, MAX_SITE_TEXT_LENGTH) : null, email };
  } catch {
    return { text: null, email: null };
  }
}

/**
 * Confirms the email's domain can actually receive mail (has an MX record)
 * before we send to it — catches typo'd/dead domains that would otherwise
 * only surface as a bounce after the fact. Apify's scrapeContacts never did
 * this check.
 */
export async function domainAcceptsMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

function buildPrompt(url: string, siteText: string): string {
  return `Tu es un expert en prospection B2B. Lis attentivement ce site d'entreprise artisanale : ${url}.
Repère UN seul détail concret et récent sur cette entreprise (spécialité précise, zone d'intervention, ancienneté, réalisation mentionnée, certification).
Rédige un email de prospection en 4 phrases maximum pour présenter DevisFlow (logiciel de génération de devis IA en 30 secondes, 29€/mois, devis-flow.fr) :
- Phrase 1 : ouvre sur le détail concret trouvé sur leur site (pas de formule générique)
- Phrase 2 : présente DevisFlow en une phrase directe
- Phrase 3 : mentionne la deadline e-facture septembre 2026 comme raison d'agir maintenant
- Phrase 4 : termine par une question simple et directe
Signature : DevisFlow — devis-flow.fr — Se désinscrire : répondez STOP
INTERDIT : formules génériques, superlatifs, tout ce qui pourrait s'appliquer à n'importe quelle autre entreprise, toute ligne "Objet :" ou "Subject :" en tête de message.
Réponds uniquement avec le corps de l'email (aucune ligne d'objet, aucune explication), en commençant directement par la première phrase.

--- Contenu du site (extrait) ---
${siteText}`;
}

/** Returns null if the model can't produce a genuinely personalized email (e.g. thin/empty site content). */
export async function personalizeEmail(url: string, siteText: string): Promise<string | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant");

  const res = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(url, siteText) }] }],
      }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
  // Gemini occasionally prepends a "Subject:"/"Objet:" line despite the
  // prompt forbidding it (seen in production output) — strip it defensively
  // rather than let it leak into the email body.
  const email = raw.replace(/^(subject|objet)\s*:.*\n+/i, "").trim();
  return email.length > 0 ? email : null;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Wraps a personalized message (plain text, as produced by personalizeEmail)
 * in a branded HTML template — navy + white + orange accent, per the
 * project's visual identity. Strips the plain-text signature block (the
 * "DevisFlow — devis-flow.fr — Se désinscrire" line) since it's rebuilt as
 * proper styled markup below instead of being echoed as raw text.
 */
const CTA_URL = "https://devis-flow.fr/auth/register?type=artisan&utm_source=prospecting&utm_medium=email&utm_campaign=cold-outreach";

export function buildEmailHtml(message: string): string {
  const body = message
    .replace(/\n?DevisFlow\s*[—-]\s*devis-flow\.fr\s*[—-]\s*Se désinscrire\s*:\s*répondez STOP\s*$/i, "")
    .trim();

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p).replace(/\n/g, "<br>")}</p>`)
    .join("");

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#f4f5f7;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f5f7;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:8px;overflow:hidden;">
<tr><td style="background:#0a2540;padding:20px 32px;">
<span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:0.3px;">Devis<span style="color:#ff7a1a;">Flow</span></span>
</td></tr>
<tr><td style="padding:32px;color:#1a1a2e;font-size:15px;line-height:1.6;">
${paragraphs}
<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;">
<tr><td style="border-radius:8px;background:#ff7a1a;">
<a href="${CTA_URL}" style="display:inline-block;padding:14px 28px;color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;">Essayer gratuitement 7 jours →</a>
</td></tr>
</table>
<p style="margin:0 0 24px;color:#6b7280;font-size:13px;">Sans carte bancaire, annulation en 1 clic.</p>
<p style="margin:0;">Cordialement,<br>
<strong>L'équipe DevisFlow</strong></p>
</td></tr>
<tr><td style="padding:20px 32px;background:#f4f5f7;border-top:1px solid #e5e7eb;">
<a href="https://devis-flow.fr?utm_source=prospecting&utm_medium=email&utm_campaign=cold-outreach" style="color:#ff7a1a;font-size:13px;text-decoration:none;font-weight:bold;">devis-flow.fr</a>
<p style="margin:8px 0 0;color:#8a8f98;font-size:12px;">Pour ne plus recevoir nos emails, répondez simplement STOP à ce message.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
