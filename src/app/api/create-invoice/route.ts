import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

function generateInvoiceNumber(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const rand = String(Math.floor(Math.random() * 9000) + 1000);
  return `FAC-${y}${m}-${rand}`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { devisId } = await req.json();
    if (!devisId) return NextResponse.json({ error: "devisId requis" }, { status: 400 });

    const admin = createSupabaseAdmin();

    // Fetch the devis
    const { data: devis, error: devisError } = await admin
      .from("devis")
      .select("*")
      .eq("id", devisId)
      .eq("user_id", user.id)
      .single();

    if (devisError || !devis) {
      return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
    }

    // Check if invoice already exists
    const { data: existing } = await admin
      .from("invoices")
      .select("id, invoice_number")
      .eq("devis_id", devisId)
      .single();

    if (existing) {
      return NextResponse.json({ invoiceNumber: existing.invoice_number, alreadyExists: true });
    }

    const invoiceNumber = generateInvoiceNumber();

    // Build invoice result_json from devis result_json
    const devisResult = devis.result_json;
    const invoiceResult = devisResult
      ? { ...devisResult, devisNumber: invoiceNumber, isInvoice: true }
      : null;

    const { data: invoice, error: insertError } = await admin
      .from("invoices")
      .insert({
        devis_id: devisId,
        user_id: user.id,
        invoice_number: invoiceNumber,
        status: "pending",
        result_json: invoiceResult,
      })
      .select("id, invoice_number")
      .single();

    if (insertError) {
      console.error("[create-invoice]", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ id: invoice.id, invoiceNumber: invoice.invoice_number });
  } catch (err) {
    console.error("[create-invoice] unexpected:", err);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
