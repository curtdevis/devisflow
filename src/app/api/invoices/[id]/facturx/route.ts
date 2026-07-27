import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { generateFacturXML, invoiceFromDevisResult } from "@/lib/facturx";
import type { DevisResult } from "@/lib/devis-html";

/**
 * GET /api/invoices/[id]/facturx
 *
 * Retourne le XML Factur-X (profil MINIMUM) pour la facture identifiée par [id].
 * Auth obligatoire — ownership vérifié avant tout traitement.
 *
 * Headers de réponse :
 *   Content-Type: application/xml; charset=utf-8
 *   Content-Disposition: attachment; filename="facture-FAC-XXXXXX.xml"
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "id requis" }, { status: 400 });
  }

  // --- Authentification ---
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // --- Récupération de la facture (ownership check inclus via user_id) ---
  const admin = createSupabaseAdmin();

  const { data: invoice, error: fetchErr } = await admin
    .from("invoices")
    .select("id, invoice_number, created_at, result_json, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const result = invoice.result_json as DevisResult | null;

  if (!result) {
    return NextResponse.json(
      { error: "Données de facturation manquantes (result_json vide)" },
      { status: 422 }
    );
  }

  // --- Vérification des champs obligatoires pour Factur-X ---
  if (!result.artisan?.name || !result.client?.name) {
    return NextResponse.json(
      { error: "Nom artisan ou client manquant — XML Factur-X impossible à générer" },
      { status: 422 }
    );
  }

  // --- Génération du XML ---
  let xml: string;
  try {
    const facturXData = invoiceFromDevisResult(
      invoice.invoice_number,
      invoice.created_at,
      {
        artisan: {
          name: result.artisan.name,
          siret: result.artisan.siret ?? "",
        },
        client: {
          name: result.client.name,
        },
        subtotalHT: result.subtotalHT ?? 0,
        tvaRate: result.tvaRate ?? 20,
        tvaAmount: result.tvaAmount ?? 0,
        totalTTC: result.totalTTC ?? 0,
      }
    );

    xml = generateFacturXML(facturXData);
  } catch (err) {
    console.error("[GET /api/invoices/:id/facturx] génération XML:", err);
    return NextResponse.json({ error: "Erreur lors de la génération XML" }, { status: 500 });
  }

  // --- Réponse avec le XML en téléchargement ---
  // Sanitize invoice_number before embedding in a Content-Disposition header
  // to prevent header injection (strip any chars that are not word chars, hyphens, or dots).
  const safeNumber = String(invoice.invoice_number ?? "").replace(/[^\w\-\.]/g, "_");
  const filename = `facture-${safeNumber}.xml`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Pas de cache — données financières personnelles
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}
