import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { notifyAdmin, escapeHtml } from "@/lib/admin-notify";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps invalide" }, { status: 400 });

  const { email, password, fullName, accountType, inviteToken, redirectAfter, artisanCount, utm_source, utm_medium, utm_campaign, ref } = body as {
    email: string;
    password: string;
    fullName: string;
    accountType: "artisan" | "agence";
    inviteToken: string | null;
    redirectAfter: string | null;
    artisanCount: string | null;
    utm_source?: string | null;
    utm_medium?: string | null;
    utm_campaign?: string | null;
    ref?: string | null;
  };

  const UTM_RE = /^[a-zA-Z0-9_-]{1,64}$/;
  const cleanUtm = (v: string | null | undefined) => (typeof v === "string" && UTM_RE.test(v) ? v : null);

  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 });
  }

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "Le mot de passe doit contenir au moins 8 caractères." }, { status: 400 });
  }
  if (fullName.trim().length < 2 || fullName.length > 100) {
    return NextResponse.json({ error: "Le nom doit contenir entre 2 et 100 caractères." }, { status: 400 });
  }
  if (!["artisan", "agence"].includes(accountType)) {
    return NextResponse.json({ error: "Type de compte invalide." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();

  // Generate signup link — creates user + returns confirmation URL (no default Supabase email sent)
  // Retried once on a transient JWT signature error: Supabase's Auth API
  // intermittently rejects with "bad_jwt" unrelated to this request
  // (reproduced directly against their Admin API, outside our app) — an
  // immediate retry resolves it almost every time.
  type GenerateLinkResult = Awaited<ReturnType<typeof admin.auth.admin.generateLink>>;
  let linkData: GenerateLinkResult["data"] | null = null;
  let linkError: GenerateLinkResult["error"] | null = null;
  let retriedAfterJwtError = false;

  for (let attempt = 1; attempt <= 2; attempt++) {
    const result = await admin.auth.admin.generateLink({
      type: "signup",
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
          invite_token: inviteToken ?? null,
          redirect_after: redirectAfter ?? null,
          artisan_count: artisanCount ?? null,
          utm_source: cleanUtm(utm_source),
          utm_medium: cleanUtm(utm_medium),
          utm_campaign: cleanUtm(utm_campaign),
          // Not trusted as-is — only ever honored for the 14-day retargeting
          // trial after auth/callback re-validates it server-side against
          // prospecting_sent.tracking_ref + retargeted_at IS NOT NULL.
          ref: cleanUtm(ref),
        },
        redirectTo: `${SITE_URL}/auth/callback`,
      },
    });
    linkData = result.data;
    linkError = result.error;

    // "bad_jwt" is Supabase's stable error code for the transient signature
    // failure — more robust than matching on their message text.
    const isTransientJwtError = linkError?.code === "bad_jwt";
    if (!linkError || !isTransientJwtError || attempt === 2) break;
    retriedAfterJwtError = true;
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  if (linkError) {
    const isDuplicate = linkError.message.includes("already registered");
    // If "already registered" only shows up after our own JWT retry, the
    // first attempt may have created the account before failing to return a
    // token — that's not the same as a genuine pre-existing account, so
    // don't tell the user to just log in with a password they never set.
    const msg =
      isDuplicate && retriedAfterJwtError
        ? "Un problème temporaire est survenu. Réessayez dans quelques instants ou contactez le support si ça persiste."
        : isDuplicate
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
    from: "DevisFlow <equipe@devis-flow.fr>",
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
          DevisFlow · Générateur de devis IA pour artisans<br>
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

  notifyAdmin(
    `Nouvel utilisateur DevisFlow — ${email}`,
    `<p><strong>Nom :</strong> ${escapeHtml(fullName)}</p>
     <p><strong>Email :</strong> ${escapeHtml(email)}</p>
     <p><strong>Type de compte :</strong> ${escapeHtml(accountType)}</p>`
  );

  return NextResponse.json({ success: true });
}
