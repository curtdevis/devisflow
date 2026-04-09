import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// PATCH — resend an invitation
export async function PATCH(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { token, agenceId, agenceName, email } = body as {
    token: string;
    agenceId: string;
    agenceName: string;
    email: string;
  };

  if (!token || !agenceId || !email) {
    return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // Reset created_at so it doesn't appear expired
  const { error: updateError } = await admin
    .from("agence_invitations")
    .update({ created_at: new Date().toISOString() })
    .eq("token", token)
    .eq("agence_id", agenceId);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  const registerUrl = `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr"}/auth/register?invite=${token}`;

  const { error: emailError } = await resend.emails.send({
    from: "noreply@devis-flow.fr",
    to: email,
    subject: `Rappel — ${agenceName} vous invite sur DevisFlow`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 8px">
          Devis<span style="color:#f97316">Flow</span>
        </p>
        <h1 style="font-size:20px;color:#1e3a5f;margin:24px 0 12px">Rappel d'invitation</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6">
          <strong>${agenceName}</strong> vous rappelle que vous avez été invité à rejoindre DevisFlow.
        </p>
        <a href="${registerUrl}"
           style="display:inline-block;margin:24px 0;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
          Créer mon compte →
        </a>
        <p style="color:#9ca3af;font-size:12px;">Ce lien est valable 7 jours.</p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json({ error: "Erreur envoi email" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// DELETE — cancel an invitation
export async function DELETE(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { token } = body as { token: string };
  if (!token) return NextResponse.json({ error: "token requis" }, { status: 400 });

  const admin = createSupabaseAdmin();
  const { error } = await admin
    .from("agence_invitations")
    .delete()
    .eq("token", token);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
