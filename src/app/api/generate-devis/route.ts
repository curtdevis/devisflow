import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

const client = new Anthropic();

const AGENT_ID = process.env.ANTHROPIC_AGENT_ID;
const ENV_ID = process.env.ANTHROPIC_ENV_ID;

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

async function generateWithManagedAgent(prompt: string): Promise<{ lines: DevisLine[]; notes: string; legalMentions: string }> {
  const session = await client.beta.sessions.create({
    agent: AGENT_ID!,
    environment_id: ENV_ID!,
  });

  // Open stream before sending (stream-first ordering)
  const stream = await client.beta.sessions.events.stream(session.id);

  await client.beta.sessions.events.send(session.id, {
    events: [{ type: "user.message", content: [{ type: "text", text: prompt }] }],
  });

  let collectedText = "";
  for await (const event of stream) {
    if (event.type === "agent.message") {
      for (const block of event.content) {
        if (block.type === "text") collectedText += block.text;
      }
    }
    if (event.type === "session.status_terminated") break;
    if (event.type === "session.status_idle") {
      if ((event as { stop_reason?: { type: string } }).stop_reason?.type !== "requires_action") break;
    }
  }

  // Archive session async — don't block the response
  client.beta.sessions.archive(session.id).catch(() => {});

  const jsonMatch = collectedText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse agent invalide");
  const parsed = JSON.parse(jsonMatch[0]);
  return { lines: parsed.lines ?? [], notes: parsed.notes ?? "", legalMentions: parsed.legalMentions ?? "" };
}

async function generateWithDirectAPI(prompt: string): Promise<{ lines: DevisLine[]; notes: string; legalMentions: string }> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    messages: [{ role: "user", content: prompt }],
  });
  const rawText = message.content[0].type === "text" ? message.content[0].text : "";
  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Réponse IA invalide");
  const parsed = JSON.parse(jsonMatch[0]);
  return { lines: parsed.lines ?? [], notes: parsed.notes ?? "", legalMentions: parsed.legalMentions ?? "" };
}

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

  const laborCost = parseFloat(laborHours) * parseFloat(hourlyRate);
  const validMaterials = materials.filter((m) => m.description && m.unitPrice);
  const materialsCost = validMaterials.reduce(
    (acc, m) => acc + parseFloat(m.quantity || "1") * parseFloat(m.unitPrice), 0
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
    const useManagedAgent = AGENT_ID && ENV_ID;
    const result = useManagedAgent
      ? await generateWithManagedAgent(prompt)
      : await generateWithDirectAPI(prompt);

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

  const subtotalHT = claudeLines.reduce((acc, l) => acc + l.total, 0);
  const tvaRateNum = parseInt(tvaRate, 10);
  const tvaAmount = subtotalHT * (tvaRateNum / 100);
  const totalTTC = subtotalHT + tvaAmount;
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

  let userId: string | null = null;
  try {
    const supabaseServer = await createSupabaseServer();
    const { data: { user } } = await supabaseServer.auth.getUser();
    userId = user?.id ?? null;
  } catch (err) {
    console.error("[generate-devis] session error:", err);
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
  }

  return NextResponse.json({ ...result, id: inserted?.id ?? null });
}
