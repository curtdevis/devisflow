import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import {
  calculateDevisTotals,
  calculateLaborCost,
  calculateMaterialsSubtotal,
  sumLineTotals,
} from "@/lib/devis-calculations";
import { notifyAdmin, escapeHtml } from "@/lib/admin-notify";
import { DEVIS_LIMIT_PER_MONTH } from "@/lib/agence-limits";

// IP-based rate limit for unauthenticated requests: 5 per hour, persisted in Supabase
// SQL to run once in Supabase:
// CREATE TABLE IF NOT EXISTS rate_limits (
//   ip TEXT NOT NULL,
//   window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
//   count INTEGER NOT NULL DEFAULT 1,
//   PRIMARY KEY (ip, window_start)
// );
const ANON_RATE_LIMIT = 5;
const TRIAL_DAYS = 7;

async function checkAnonLimitDb(ip: string): Promise<boolean> {
  try {
    const admin = createSupabaseAdmin();
    const oneHourAgo = new Date(Date.now() - 3_600_000).toISOString();

    // Clean up expired entries (non-blocking, best-effort)
    void admin
      .from("rate_limits")
      .delete()
      .lt("window_start", oneHourAgo);

    // Count requests in the last hour for this IP
    const { count, error: countError } = await admin
      .from("rate_limits")
      .select("*", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("window_start", oneHourAgo);

    if (countError) {
      // Fallback: allow the request if we can't read the table
      console.warn("[rate-limit] count error, allowing:", countError.message);
      return true;
    }

    if ((count ?? 0) >= ANON_RATE_LIMIT) return false;

    // Record this request
    const { error: insertError } = await admin
      .from("rate_limits")
      .insert({ ip, window_start: new Date().toISOString(), count: 1 });

    if (insertError) {
      // Table might not exist yet — fallback silently
      console.warn("[rate-limit] insert error, allowing:", insertError.message);
    }

    return true;
  } catch (err) {
    // Any unexpected error: allow the request rather than block
    console.warn("[rate-limit] unexpected error, allowing:", err);
    return true;
  }
}

interface Material {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface DevisRequest {
  artisanName: string;
  artisanSiret: string;
  artisanAddress?: string;
  artisanPhone?: string;
  artisanEmail?: string;
  logoBase64?: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  workDescription: string;
  materials: Material[];
  laborHours: string;
  hourlyRate: string;
  tvaRate: "10" | "20";
  validityDays: string;
  customNotes?: string;
  reminderEnabled?: boolean;
  reminderFrequencyDays?: number;
  reminderMaxCount?: number;
  reminderTone?: string;
}

interface DevisLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DevisResult {
  devisNumber: string;
  date: string;
  validUntil: string;
  artisan: {
    name: string;
    siret: string;
    address?: string;
    phone?: string;
    email?: string;
    logoBase64?: string;
  };
  client: { name: string; address: string; phone: string; email: string };
  lines: DevisLine[];
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  notes: string;
  legalMentions: string;
}

function generateDevisNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `DEV-${y}${m}-${random}`;
}

function addDays(date: Date, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function today(): string {
  return new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function buildFallback(body: DevisRequest, validMaterials: Material[], laborCost: number) {
  const lines: DevisLine[] = validMaterials.map((m) => ({
    description: m.description,
    quantity: parseFloat(m.quantity || "1"),
    unitPrice: parseFloat(m.unitPrice),
    total: parseFloat(m.quantity || "1") * parseFloat(m.unitPrice),
  }));
  lines.push({
    description: `Main d'œuvre — ${body.workDescription.slice(0, 80)}`,
    quantity: parseFloat(body.laborHours),
    unitPrice: parseFloat(body.hourlyRate),
    total: laborCost,
  });
  return {
    lines,
    notes: body.customNotes?.trim() || "Paiement à 30 jours à réception de facture. Acompte de 30% à la commande.",
    legalMentions: "Devis valable 30 jours. TVA non applicable, art. 293 B du CGI (si auto-entrepreneur). En cas d'acceptation, veuillez retourner ce document signé avec la mention « Bon pour accord ».",
  };
}

function extractFirstJson(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

// Génération temporairement sur Gemini — le compte Anthropic est à sec de
// crédit. Repasser sur @anthropic-ai/sdk une fois les crédits reconstitués ;
// le prompt et le point d'appel restent inchangés dans les deux cas.
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_API_BASE = "https://generativelanguage.googleapis.com/v1beta";

async function generateWithGemini(prompt: string): Promise<{ lines: DevisLine[]; notes: string; legalMentions: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY manquant");

  const res = await fetch(
    `${GEMINI_API_BASE}/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Gemini request failed (${res.status}): ${text.slice(0, 500)}`);
  }

  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  const jsonMatch = extractFirstJson(rawText);
  if (!jsonMatch) throw new Error("Réponse IA invalide");
  const parsed = JSON.parse(jsonMatch);
  return { lines: parsed.lines ?? [], notes: parsed.notes ?? "", legalMentions: parsed.legalMentions ?? "" };
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_LOGO_BYTES = 500_000; // 500KB base64

export async function POST(req: NextRequest) {
  let body: DevisRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const {
    artisanName, artisanSiret, artisanAddress, artisanPhone, artisanEmail, logoBase64,
    clientName, clientAddress, clientPhone, clientEmail,
    workDescription, materials, laborHours, hourlyRate, tvaRate, validityDays,
    customNotes, reminderEnabled, reminderFrequencyDays, reminderMaxCount, reminderTone,
  } = body;

  if (!artisanName || !clientName || !clientAddress || !workDescription || !laborHours || !hourlyRate) {
    return NextResponse.json({ error: "Champs obligatoires manquants." }, { status: 400 });
  }

  // Validate emails
  if (artisanEmail && !EMAIL_REGEX.test(artisanEmail)) {
    return NextResponse.json({ error: "Email artisan invalide." }, { status: 400 });
  }
  if (clientEmail && !EMAIL_REGEX.test(clientEmail)) {
    return NextResponse.json({ error: "Email client invalide." }, { status: 400 });
  }

  // Validate logo size and format
  if (logoBase64) {
    if (!logoBase64.startsWith("data:image/")) {
      return NextResponse.json({ error: "Format logo invalide." }, { status: 400 });
    }
    if (logoBase64.length > MAX_LOGO_BYTES) {
      return NextResponse.json({ error: "Logo trop volumineux (max 375 Ko)." }, { status: 400 });
    }
  }

  // Rate limiting
  let userId: string | null = null;
  let userCreatedAt: string | null = null;
  try {
    const supabaseServer = await createSupabaseServer();
    const { data: { user } } = await supabaseServer.auth.getUser();
    userId = user?.id ?? null;
    userCreatedAt = user?.created_at ?? null;
  } catch { /* anonymous allowed */ }

  if (!userId) {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const allowed = await checkAnonLimitDb(ip);
    if (!allowed) {
      return NextResponse.json({ error: "Limite atteinte. Créez un compte pour continuer." }, { status: 429 });
    }
  }

  if (userId) {
    const admin = createSupabaseAdmin();

    const { data: profile } = await admin
      .from("profiles")
      .select("plan, agence_id")
      .eq("id", userId)
      .single();

    // Artisans linked to a paid Cabinet & Groupement account are covered by
    // the agence's subscription — their own 7-day trial clock doesn't apply,
    // but the agence's shared monthly devis cap does.
    let coveredByAgence = false;
    if (profile?.agence_id) {
      const { data: agenceProfile } = await admin
        .from("profiles")
        .select("plan")
        .eq("id", profile.agence_id)
        .single<{ plan: string | null }>();
      coveredByAgence = agenceProfile?.plan === "paid";
    }

    if (coveredByAgence) {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: agenceArtisans } = await admin
        .from("profiles")
        .select("id")
        .eq("agence_id", profile!.agence_id);
      const artisanIds = (agenceArtisans ?? []).map((a: { id: string }) => a.id);
      const { count: agenceDevisThisMonth } = await admin
        .from("devis")
        .select("id", { count: "exact", head: true })
        .in("user_id", artisanIds)
        .gte("created_at", monthStart);

      if ((agenceDevisThisMonth ?? 0) >= DEVIS_LIMIT_PER_MONTH) {
        return NextResponse.json(
          { error: `Limite mensuelle de ${DEVIS_LIMIT_PER_MONTH} devis atteinte pour votre cabinet. Contactez votre administrateur.` },
          { status: 403 }
        );
      }
    } else if (profile?.plan !== "paid" && userCreatedAt) {
      // Trial enforcement — mirrors the client-side check in devis/page.tsx,
      // but this one can't be bypassed by calling the API directly.
      const daysSinceSignup = (Date.now() - new Date(userCreatedAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceSignup > TRIAL_DAYS) {
        return NextResponse.json(
          { error: "Votre essai gratuit de 7 jours est terminé. Passez à l'abonnement Artisan Solo pour continuer à générer des devis." },
          { status: 403 }
        );
      }
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { count } = await admin
      .from("devis")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", oneHourAgo);

    if ((count ?? 0) >= 20) {
      return NextResponse.json({ error: "Limite atteinte : 20 devis par heure." }, { status: 429 });
    }
  }

  const laborCost = calculateLaborCost(parseFloat(laborHours), parseFloat(hourlyRate));
  const validMaterials = materials.filter((m) => m.description && m.unitPrice);
  const materialsCost = calculateMaterialsSubtotal(
    validMaterials.map((m) => ({ quantity: parseFloat(m.quantity || "1"), unitPrice: parseFloat(m.unitPrice) }))
  );

  const prompt = `Génère un devis professionnel détaillé en JSON strict (pas de markdown, pas d'explication) avec la structure exacte ci-dessous.

Informations fournies :
- Artisan : ${artisanName} (SIRET: ${artisanSiret || "À compléter"})
- Client : ${clientName}, ${clientAddress}${clientPhone ? `, Tél: ${clientPhone}` : ""}${clientEmail ? `, Email: ${clientEmail}` : ""}
- Description des travaux : ${workDescription}
- Matériaux : ${validMaterials.length > 0 ? validMaterials.map((m) => `${m.description} (qté: ${m.quantity}, PU HT: ${m.unitPrice}€)`).join("; ") : "Aucun matériau renseigné"}
- Main d'œuvre : ${laborHours}h à ${hourlyRate}€/h HT = ${laborCost.toFixed(2)}€ HT
- Coût matériaux estimé : ${materialsCost.toFixed(2)}€ HT
- TVA : ${tvaRate}%
- Validité : ${validityDays} jours

Instructions :
1. Génère des lignes de devis détaillées et professionnelles.
2. Si des matériaux sont listés, crée une ligne par matériau avec les prix fournis.
3. Crée une ligne "Main d'œuvre" avec les heures et le taux horaire fournis.
4. Calcule précisément les totaux HT, TVA et TTC.
5. Rédige des notes professionnelles adaptées au type de travaux.
6. Inclus les mentions légales obligatoires françaises.
7. Ne modifie PAS les prix fournis.

Retourne UNIQUEMENT ce JSON :
{
  "lines": [{ "description": "string", "quantity": number, "unitPrice": number, "total": number }],
  "notes": "string",
  "legalMentions": "string"
}`;

  let claudeLines: DevisLine[] = [];
  let notes = "";
  let legalMentions = "";

  try {
    const result = await generateWithGemini(prompt);

    claudeLines = result.lines;
    notes = customNotes?.trim() || result.notes;
    legalMentions = result.legalMentions;
  } catch (err) {
    console.error("[generate-devis] AI error, using fallback:", err);
    const fallback = buildFallback(body, validMaterials, laborCost);
    claudeLines = fallback.lines;
    notes = customNotes?.trim() || fallback.notes;
    legalMentions = fallback.legalMentions;
  }

  // Recalculate totals from lines to ensure consistency
  const subtotalHT = sumLineTotals(claudeLines);
  const tvaRateNum = parseInt(tvaRate, 10);
  const { tvaAmount, totalTTC } = calculateDevisTotals(subtotalHT, tvaRateNum);

  const now = new Date();

  const result: DevisResult = {
    devisNumber: generateDevisNumber(),
    date: today(),
    validUntil: addDays(now, parseInt(validityDays, 10)),
    artisan: {
      name: artisanName,
      siret: artisanSiret || "À compléter",
      address: artisanAddress || undefined,
      phone: artisanPhone || undefined,
      email: artisanEmail || undefined,
      logoBase64: logoBase64 || undefined,
    },
    client: { name: clientName, address: clientAddress, phone: clientPhone || "", email: clientEmail || "" },
    lines: claudeLines,
    subtotalHT,
    tvaRate: tvaRateNum,
    tvaAmount,
    totalTTC,
    notes,
    legalMentions,
  };

  // Anonymous users: generate the devis but don't persist to DB
  if (!userId) {
    return NextResponse.json({ ...result, id: null });
  }

  const { data: inserted, error: insertError } = await createSupabaseAdmin()
    .from("devis")
    .insert({
      user_id: userId,
      devis_number: result.devisNumber,
      artisan_name: artisanName,
      artisan_email: artisanEmail || null,
      artisan_phone: artisanPhone || null,
      artisan_siret: artisanSiret || null,
      client_name: clientName,
      client_email: clientEmail || null,
      total_ttc: totalTTC,
      profession: workDescription.slice(0, 100),
      result_json: result,
      reminder_enabled: reminderEnabled ?? false,
      reminder_frequency_days: reminderFrequencyDays ?? 3,
      reminder_max_count: reminderMaxCount ?? 2,
      reminder_tone: reminderTone ?? "professionnel",
      reminder_count: 0,
      reminder_next_date:
        reminderEnabled && clientEmail
          ? new Date(Date.now() + (reminderFrequencyDays ?? 3) * 24 * 60 * 60 * 1000).toISOString()
          : null,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[generate-devis] insert error:", insertError.message);
  } else {
    notifyAdmin(
      `Nouveau devis — ${artisanName} → ${clientName} — ${totalTTC.toFixed(2)}€`,
      `<p><strong>Artisan :</strong> ${escapeHtml(artisanName)}</p>
       <p><strong>Client :</strong> ${escapeHtml(clientName)}</p>
       <p><strong>Total TTC :</strong> ${totalTTC.toFixed(2)} €</p>
       <p><strong>Devis n° :</strong> ${escapeHtml(result.devisNumber)}</p>
       <p><strong>Description :</strong> ${escapeHtml(workDescription.slice(0, 200))}</p>`
    );
  }

  return NextResponse.json({ ...result, id: inserted?.id ?? null });
}
