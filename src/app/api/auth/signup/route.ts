import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps invalide" }, { status: 400 });

  const { email, password, fullName, accountType, inviteToken } = body as {
    email: string;
    password: string;
    fullName: string;
    accountType: "artisan" | "agence";
    inviteToken: string | null;
  };

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // Generate signup link — creates user + returns confirmation URL (no default Supabase email sent)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type: "signup",
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        account_type: accountType,
        invite_token: inviteToken ?? null,
      },
      redirectTo: `${SITE_URL}/auth/callback`,
    },
  });

  if (linkError) {
    const msg = linkError.message.includes("already registered")
      ? "Cet email est déjà utilisé. Connectez-vous."
      : linkError.message;
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const confirmationUrl = linkData?.properties?.action_link;
  if (!confirmationUrl) {
    return NextResponse.json(
      { error: "Impossible de générer le lien de confirmation." },
      { status: 500 }
    );
  }

  // Send custom confirmation email via Resend
  const { error: emailError } = await resend.emails.send({
    from: "noreply@devis-flow.fr",
    to: email,
    subject: "Bienvenue sur DevisFlow — Confirmez votre email",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 4px">
          Devis<span style="color:#f97316">Flow</span>
        </p>
        <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Générateur de devis IA pour artisans</p>

        <h1 style="font-size:20px;color:#1e3a5f;margin:0 0 12px">Bienvenue, ${fullName} !</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px">
          Merci de rejoindre DevisFlow. Cliquez sur le bouton ci-dessous pour confirmer votre adresse email et activer votre compte.
        </p>

        <a href="${confirmationUrl}"
           style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
          Confirmer mon email →
        </a>

        <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin-top:24px;">
          Ce lien est valable 24 heures.<br>
          Si vous n'avez pas créé de compte sur DevisFlow, ignorez cet email.
        </p>

        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0">
        <p style="color:#9ca3af;font-size:11px;">
          DevisFlow · Générateur de devis IA conforme e-facture 2026<br>
          <a href="https://devis-flow.fr" style="color:#9ca3af">devis-flow.fr</a>
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("Resend error:", emailError);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email de confirmation." },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
