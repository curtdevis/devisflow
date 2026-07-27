import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin, requirePaidAgence } from "@/lib/supabase-server";
import { ARTISAN_LIMIT } from "@/lib/agence-limits";
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
  // Authenticate caller
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  if (!(await requirePaidAgence(user.id))) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { email, agenceName: rawAgenceName } = body as {
    email: string;
    agenceName: string;
  };
  // Escape HTML to prevent injection in email body
  const agenceName = String(rawAgenceName ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").slice(0, 200);

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  // agenceId is always the authenticated user — never trust client-supplied value
  const agenceId = user.id;

  const admin = createSupabaseAdmin();

  // Cap portfolio size: linked artisans + invitations still pending count
  // against the limit, so a burst of invites can't overshoot it once accepted.
  // Invitations older than 7 days (the stated validity in the invite email)
  // no longer count — otherwise dead, never-accepted invites would silently
  // eat into the cap forever.
  const inviteValidityCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [{ count: linkedCount }, { count: pendingCount }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("agence_id", agenceId),
    admin
      .from("agence_invitations")
      .select("id", { count: "exact", head: true })
      .eq("agence_id", agenceId)
      .is("accepted_at", null)
      .gte("created_at", inviteValidityCutoff),
  ]);

  if ((linkedCount ?? 0) + (pendingCount ?? 0) >= ARTISAN_LIMIT) {
    return NextResponse.json(
      { error: `Limite de ${ARTISAN_LIMIT} artisans atteinte pour votre portefeuille. Contactez le support pour l'augmenter.` },
      { status: 403 }
    );
  }

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
    from: "DevisFlow <equipe@devis-flow.fr>",
    to: email,
    subject: `${agenceName} vous invite sur DevisFlow`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 8px">
          Devis<span style="color:#f97316">Flow</span>
        </p>
        <h1 style="font-size:20px;color:#1e3a5f;margin:24px 0 12px">Vous avez été invité !</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6">
          <strong>${agenceName}</strong> vous invite à rejoindre DevisFlow — le générateur de devis IA pour artisans.
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
