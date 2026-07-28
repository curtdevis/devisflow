const MAX_SITE_TEXT_LENGTH = 6000;

// Personalization temporarily runs on Gemini instead of Claude — the
// Anthropic account is out of credit. Swap back to @anthropic-ai/sdk once
// credits are restored; the prompt and call site are unchanged either way.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

/** Fetches a company website and strips it down to readable text for the LLM prompt. */
export async function fetchWebsiteText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DevisFlowBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) return null;

    const html = await res.text();
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&[a-z]+;/gi, " ")
      .replace(/\s+/g, " ")
      .trim();

    return text.length > 0 ? text.slice(0, MAX_SITE_TEXT_LENGTH) : null;
  } catch {
    return null;
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
<p style="margin:24px 0 0;">Cordialement,<br>
<strong>L'équipe DevisFlow</strong></p>
</td></tr>
<tr><td style="padding:20px 32px;background:#f4f5f7;border-top:1px solid #e5e7eb;">
<a href="https://devis-flow.fr" style="color:#ff7a1a;font-size:13px;text-decoration:none;font-weight:bold;">devis-flow.fr</a>
<p style="margin:8px 0 0;color:#8a8f98;font-size:12px;">Pour ne plus recevoir nos emails, répondez simplement STOP à ce message.</p>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}
