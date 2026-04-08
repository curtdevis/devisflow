import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase";

const client = new Anthropic();

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
  return d.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function today(): string {
  return new Date().toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function POST(req: NextRequest) {
  let body: DevisRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const {
    artisanName,
    artisanSiret,
    artisanAddress,
    artisanPhone,
    artisanEmail,
    logoBase64,
    clientName,
    clientAddress,
    clientPhone,
    clientEmail,
    workDescription,
    materials,
    laborHours,
    hourlyRate,
    tvaRate,
    validityDays,
    customNotes,
  } = body;

  // Basic validation
  if (!artisanName || !clientName || !clientAddress || !workDescription || !laborHours || !hourlyRate) {
    return NextResponse.json(
      { error: "Champs obligatoires manquants." },
      { status: 400 }
    );
  }

  const laborCost = parseFloat(laborHours) * parseFloat(hourlyRate);
  const materialsCost = materials
    .filter((m) => m.description && m.unitPrice)
    .reduce((acc, m) => acc + parseFloat(m.quantity || "1") * parseFloat(m.unitPrice), 0);

  const validMaterials = materials.filter((m) => m.description && m.unitPrice);

  const prompt = `Tu es un assistant spécialisé dans la génération de devis professionnels pour les artisans français.

Génère un devis professionnel détaillé en JSON strict (pas de markdown, pas d'explication) avec la structure exacte ci-dessous.

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
1. Génère des lignes de devis détaillées et professionnelles à partir de la description des travaux et des matériaux.
2. Si des matériaux sont listés, crée une ligne par matériau avec les prix fournis.
3. Crée une ligne "Main d'œuvre" avec les heures et le taux horaire fournis.
4. Calcule précisément les totaux HT, TVA et TTC.
5. Rédige des notes professionnelles adaptées au type de travaux.
6. Inclus les mentions légales obligatoires françaises pour un devis artisan.
7. Ne modifie PAS les prix fournis — utilise exactement les chiffres donnés.

Retourne UNIQUEMENT ce JSON, sans aucun autre texte :
{
  "lines": [
    {
      "description": "string — description détaillée de la ligne",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ],
  "notes": "string — notes professionnelles (conditions de paiement, délai d'intervention, garantie, etc.)",
  "legalMentions": "string — mentions légales obligatoires françaises complètes"
}`;

  let claudeLines: DevisLine[] = [];
  let notes = "";
  let legalMentions = "";

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Extract JSON — strip any accidental markdown code fences
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Réponse IA invalide");

    const parsed = JSON.parse(jsonMatch[0]);
    claudeLines = parsed.lines ?? [];
    notes = customNotes?.trim() || parsed.notes || "";
    legalMentions = parsed.legalMentions ?? "";
  } catch (err) {
    console.error("Claude API error:", err);
    // Fallback: build lines manually from form data
    if (validMaterials.length > 0) {
      claudeLines = validMaterials.map((m) => ({
        description: m.description,
        quantity: parseFloat(m.quantity || "1"),
        unitPrice: parseFloat(m.unitPrice),
        total: parseFloat(m.quantity || "1") * parseFloat(m.unitPrice),
      }));
    }
    claudeLines.push({
      description: `Main d'œuvre — ${workDescription.slice(0, 80)}`,
      quantity: parseFloat(laborHours),
      unitPrice: parseFloat(hourlyRate),
      total: laborCost,
    });
    notes =
      customNotes?.trim() ||
      "Paiement à 30 jours à réception de facture. Acompte de 30% à la commande.";
    legalMentions =
      "Devis valable 30 jours. TVA non applicable, art. 293 B du CGI (si auto-entrepreneur). En cas d'acceptation, veuillez retourner ce document signé avec la mention « Bon pour accord ».";
  }

  // Recalculate totals from lines to ensure consistency
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
    client: {
      name: clientName,
      address: clientAddress,
      phone: clientPhone || "",
      email: clientEmail || "",
    },
    lines: claudeLines,
    subtotalHT,
    tvaRate: tvaRateNum,
    tvaAmount,
    totalTTC,
    notes,
    legalMentions,
  };

  // Get authenticated user (non-blocking — don't fail generation if auth errors)
  let userId: string | null = null;
  try {
    const supabaseServer = await createSupabaseServer();
    const { data: { user } } = await supabaseServer.auth.getUser();
    userId = user?.id ?? null;
  } catch { /* continue without user_id */ }

  // Save to Supabase via admin client (bypasses RLS, works with or without auth)
  createSupabaseAdmin()
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
    })
    .then(({ error }) => {
      if (error) console.error("Supabase insert error:", error.message);
    });

  return NextResponse.json(result);
}
