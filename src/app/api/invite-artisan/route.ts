import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// GET — resolve an invite token (used by register page to show agency name)
export async function GET(request: NextRequest) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) return NextResponse.json({ error: "Missing token" }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { data, error } = await admin
    .from("agence_invitations")
    .select("agence_name, email")
    .eq("token", token)
    .is("accepted_at", null)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Token invalide ou expiré" }, { status: 404 });
  }

  return NextResponse.json({ agence_name: data.agence_name, email: data.email });
}

// POST — send an invitation from an agence to an artisan email
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { email, agenceId, agenceName } = body as {
    email: string;
    agenceId: string;
    agenceName: string;
  };

  if (!email || !agenceId) {
    return NextResponse.json({ error: "email et agenceId requis" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // Create invitation record
  const token = crypto.randomUUID();
  const { error: insertError } = await admin.from("agence_invitations").insert({
    agence_id: agenceId,
    agence_name: agenceName,
    email,
    token,
  });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  const registerUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}/auth/register?invite=${token}`;

  // Send invitation email
  const { error: emailError } = await resend.emails.send({
    from: "noreply@devis-flow.fr",
    to: email,
    subject: `${agenceName} vous invite sur DevisFlow`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 8px">
          Devis<span style="color:#f97316">Flow</span>
        </p>
        <h1 style="font-size:20px;color:#1e3a5f;margin:24px 0 12px">Vous avez été invité !</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6">
          <strong>${agenceName}</strong> vous invite à rejoindre DevisFlow — le générateur de devis IA pour artisans, conforme e-facture 2026.
        </p>
        <a href="${registerUrl}"
           style="display:inline-block;margin:24px 0;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
          Créer mon compte →
        </a>
        <p style="color:#9ca3af;font-size:12px;line-height:1.5;">
          Ce lien est personnel et valable 7 jours.<br>
          Si vous n'attendiez pas cet email, ignorez-le.
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:11px;">
          DevisFlow · <a href="https://devis-flow.fr/unsubscribe" style="color:#9ca3af">Se désinscrire</a>
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
