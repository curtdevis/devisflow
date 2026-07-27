import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

const MAX_SITE_TEXT_LENGTH = 6000;

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
INTERDIT : formules génériques, superlatifs, tout ce qui pourrait s'appliquer à n'importe quelle autre entreprise.
Réponds uniquement avec l'email, sans explication.

--- Contenu du site (extrait) ---
${siteText}`;
}

/** Returns null if Claude can't produce a genuinely personalized email (e.g. thin/empty site content). */
export async function personalizeEmail(url: string, siteText: string): Promise<string | null> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [{ role: "user", content: buildPrompt(url, siteText) }],
  });

  const block = message.content.find((b) => b.type === "text");
  const email = block && block.type === "text" ? block.text.trim() : "";
  return email.length > 0 ? email : null;
}
