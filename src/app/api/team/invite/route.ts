import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { MAX_TEAM_MEMBERS } from "@/lib/team-limits";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// POST — owner (paid Intermédiaire) invites a teammate by email
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createSupabaseAdmin();

  const { data: ownerProfile } = await admin
    .from("profiles")
    .select("plan, tier, full_name, company_name")
    .eq("id", user.id)
    .single<{ plan: string | null; tier: string | null; full_name: string | null; company_name: string | null }>();

  if (ownerProfile?.plan !== "paid" || ownerProfile?.tier !== "intermediaire") {
    return NextResponse.json(
      { error: "L'invitation d'équipe est réservée aux comptes avec l'abonnement Intermédiaire actif." },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const { email: rawEmail } = body as { email?: unknown };
  const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  if (!email || email.length > 254 || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "Adresse email invalide." }, { status: 400 });
  }

  // ownerId is always the authenticated user — never trust a client-supplied value
  const ownerId = user.id;
  const nowIso = new Date().toISOString();

  // Cap: accepted members AND still-pending (non-expired) invites both count
  // against the limit — counting only accepted members would let an owner
  // send unlimited pending invitations (each one becomes a full member the
  // moment it's accepted, with no re-check at accept time), silently
  // busting the "max 2 members" cap the 79€/mois price is based on.
  const [{ count: memberCount }, { count: pendingInviteCount }] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }).eq("member_of", ownerId),
    admin
      .from("team_invites")
      .select("id", { count: "exact", head: true })
      .eq("owner_id", ownerId)
      .is("accepted_at", null)
      .gt("expires_at", nowIso),
  ]);

  if ((memberCount ?? 0) + (pendingInviteCount ?? 0) >= MAX_TEAM_MEMBERS) {
    return NextResponse.json(
      { error: `Limite de ${MAX_TEAM_MEMBERS} membres atteinte pour votre équipe.` },
      { status: 403 }
    );
  }

  const { data: pendingInvite } = await admin
    .from("team_invites")
    .select("id")
    .eq("owner_id", ownerId)
    .eq("email", email)
    .is("accepted_at", null)
    .gt("expires_at", nowIso)
    .maybeSingle();

  if (pendingInvite) {
    return NextResponse.json(
      { error: "Une invitation est déjà en attente pour cette adresse email." },
      { status: 409 }
    );
  }

  const token = crypto.randomBytes(32).toString("hex");
  const { data: inserted, error: insertError } = await admin
    .from("team_invites")
    .insert({ owner_id: ownerId, email, token })
    .select("id")
    .single<{ id: string }>();

  if (insertError || !inserted) {
    console.error("[team/invite] insert error:", insertError?.message);
    return NextResponse.json({ error: "Erreur lors de la création de l'invitation." }, { status: 500 });
  }

  const ownerName = ownerProfile.company_name ?? ownerProfile.full_name ?? "Votre équipe";
  const registerUrl = `${SITE_URL}/auth/register?invite=${token}`;

  const { error: emailError } = await resend.emails.send({
    from: "DevisFlow <equipe@devis-flow.fr>",
    to: email,
    subject: `${ownerName} vous invite à rejoindre son équipe sur DevisFlow`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 8px">
          Devis<span style="color:#f97316">Flow</span>
        </p>
        <h1 style="font-size:20px;color:#1e3a5f;margin:24px 0 12px">Vous avez été invité !</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6">
          <strong>${escapeHtml(ownerName)}</strong> vous invite à rejoindre son équipe sur DevisFlow — le générateur de devis IA pour artisans.
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
          DevisFlow · <a href="https://devis-flow.fr" style="color:#9ca3af">devis-flow.fr</a>
        </p>
      </div>
    `,
  });

  if (emailError) {
    console.error("[team/invite] Resend error:", emailError);
    // Roll back the invite row — otherwise it sits as a "pending invitation"
    // for this email for up to 7 days (expires_at), blocking any retry with
    // the duplicate-pending-invite check above even though no email ever
    // went out.
    await admin.from("team_invites").delete().eq("id", inserted.id);
    return NextResponse.json({ error: "Erreur lors de l'envoi de l'email d'invitation. Réessayez." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
