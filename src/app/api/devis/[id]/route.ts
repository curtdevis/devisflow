import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";

// Validate a base64 PNG data URL — prevent XSS via svg/javascript URIs
function isValidSignatureDataUrl(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.startsWith("data:image/png;base64,") &&
    value.length > 100 &&
    value.length < 500_000 // ~375KB max
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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
    .select("id, status, artisan_name, artisan_email, client_name, devis_number, total_ttc")
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
  const isBeingSigned = input.status === "signed";
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

  // Send notification email to artisan when devis is signed
  if (isBeingSigned && current.artisan_email) {
    const artisanName = escapeHtml(current.artisan_name ?? "");
    const clientName = escapeHtml(current.client_name ?? "");
    const devisNumber = escapeHtml(current.devis_number ?? "");
    const totalTTC = typeof current.total_ttc === "number"
      ? current.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })
      : "—";

    const notificationHtml = `
<div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
  <p style="font-size:22px;font-weight:900;color:#1e3a5f;margin:0 0 24px;">
    Devis<span style="color:#f97316;">Flow</span>
  </p>
  <div style="background:#d1fae5;border:2px solid #6ee7b7;border-radius:12px;padding:20px 24px;margin-bottom:20px;">
    <p style="font-size:18px;font-weight:700;color:#065f46;margin:0 0 6px;">✅ Devis signé !</p>
    <p style="font-size:14px;color:#064e3b;margin:0;">
      <strong>${clientName}</strong> vient d'accepter votre devis <strong>${devisNumber}</strong>
      d'un montant de <strong>${totalTTC} € TTC</strong>.
    </p>
  </div>
  <p style="font-size:14px;color:#374151;margin:0 0 16px;">
    Bonjour ${artisanName},<br><br>
    Excellente nouvelle ! Votre client a signé le devis. Vous pouvez maintenant le convertir en facture depuis votre tableau de bord.
  </p>
  <a href="${SITE_URL}/dashboard" style="display:inline-block;background:#1e3a5f;color:#ffffff;font-weight:700;font-size:14px;padding:12px 24px;border-radius:10px;text-decoration:none;">
    Voir mon tableau de bord →
  </a>
  <p style="color:#9ca3af;font-size:11px;margin-top:20px;">
    Notification automatique — <a href="${SITE_URL}" style="color:#9ca3af;">DevisFlow</a>
  </p>
</div>`;

    resend.emails.send({
      from: "DevisFlow <noreply@devis-flow.fr>",
      to: current.artisan_email,
      subject: `✅ Devis signé — ${current.client_name} a accepté votre devis ${current.devis_number}`,
      html: notificationHtml,
    }).catch((err: unknown) => {
      console.error("[devis-sign] notification email error:", err instanceof Error ? err.message : "unknown");
    });
  }

  return NextResponse.json({ ok: true });
}
