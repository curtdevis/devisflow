import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";

// Validate a base64 PNG data URL — prevent XSS via svg/javascript URIs
function isValidSignatureDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("data:image/png;base64,") &&
    value.length > 100 &&
    value.length < 500_000 // ~375KB max
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("devis")
    .select(
      "id, devis_number, artisan_name, client_name, total_ttc, result_json, status, signed_at, created_at, signature_data"
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const input = body as Record<string, unknown>;

  const admin = createSupabaseAdmin();

  // Fetch current devis to check it exists and isn't already signed
  const { data: current, error: fetchErr } = await admin
    .from("devis")
    .select("id, status")
    .eq("id", id)
    .single();

  if (fetchErr || !current) {
    return NextResponse.json({ error: "Devis introuvable" }, { status: 404 });
  }

  // Prevent re-signing an already signed devis
  if (current.status === "signed") {
    return NextResponse.json({ error: "Ce devis est déjà signé" }, { status: 409 });
  }

  // Build allowed update with strict type validation
  const allowed: Record<string, unknown> = {};

  if (input.signature_data !== undefined) {
    if (!isValidSignatureDataUrl(input.signature_data)) {
      return NextResponse.json({ error: "Format signature invalide" }, { status: 422 });
    }
    allowed.signature_data = input.signature_data;
  }

  if (input.signed_at !== undefined) {
    if (typeof input.signed_at !== "string" || isNaN(Date.parse(input.signed_at))) {
      return NextResponse.json({ error: "Date de signature invalide" }, { status: 422 });
    }
    if (new Date(input.signed_at) > new Date()) {
      return NextResponse.json({ error: "La date de signature ne peut pas être dans le futur" }, { status: 422 });
    }
    allowed.signed_at = input.signed_at;
  }

  // Only allow valid status transitions
  if (input.status !== undefined) {
    if (input.status !== "signed" && input.status !== "pending") {
      return NextResponse.json({ error: "Statut invalide" }, { status: 422 });
    }
    allowed.status = input.status;
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
  }

  const { error } = await admin.from("devis").update(allowed).eq("id", id);

  if (error) {
    console.error("[PATCH /api/devis/:id]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
