import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { createCheckoutSession } from "@/lib/lemon-squeezy";
import { MAX_TEAM_MEMBERS } from "@/lib/team-limits";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";

const UTM_RE = /^[a-zA-Z0-9_-]{1,64}$/;
function cleanUtm(v: string | null): string | null {
  return v && UTM_RE.test(v) ? v : null;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // Present for Google OAuth signups — see handleGoogleSignIn in
  // auth/register/page.tsx, which appends these to the redirectTo URL since
  // signInWithOAuth has no equivalent to signUp's user_metadata `data`.
  const oauthUtmSource = cleanUtm(searchParams.get("utm_source"));
  const oauthUtmMedium = cleanUtm(searchParams.get("utm_medium"));
  const oauthUtmCampaign = cleanUtm(searchParams.get("utm_campaign"));

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("[auth/callback] exchangeCodeForSession failed:", error);
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  const user = data.user;
  const meta = user.user_metadata ?? {};
  const accountType = (meta.account_type ?? "artisan") as "artisan" | "agence";
  const inviteToken = meta.invite_token as string | null | undefined;

  // Detect OAuth provider (Google etc.) — identities[0].provider = "google"
  const isOAuthLogin =
    Array.isArray(user.identities) &&
    user.identities.length > 0 &&
    user.identities[0].provider !== "email";

  // Create profile using admin client (bypasses RLS)
  const admin = createSupabaseAdmin();

  // For OAuth logins, check if profile already exists before creating it.
  // This avoids overwriting data on subsequent logins (idempotent).
  if (isOAuthLogin) {
    const { data: existingProfile } = await admin
      .from("profiles")
      .select("id, suspended")
      .eq("id", user.id)
      .maybeSingle();

    if (existingProfile?.suspended) {
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/auth/login?error=account_suspended`);
    }

    if (!existingProfile) {
      // First Google login → create profile with plan free
      const { error: insertError } = await admin.from("profiles").insert({
        id: user.id,
        email: user.email!,
        full_name: meta.full_name ?? meta.name ?? null,
        account_type: "artisan",
        plan: "free",
        created_at: new Date().toISOString(),
        utm_source: oauthUtmSource,
        utm_medium: oauthUtmMedium,
        utm_campaign: oauthUtmCampaign,
      });
      if (insertError) {
        console.error("[auth/callback] profile insert failed:", insertError);
      }

      // Send onboarding email for new Google users (fire-and-forget)
      // Sanitize the name before embedding in HTML to prevent injection if
      // a malicious OAuth identity provider sends crafted metadata.
      const rawNameOAuth = ((meta.full_name ?? meta.name) as string | undefined)?.split(" ")[0] ?? "là";
      const firstNameOAuth = rawNameOAuth.replace(/[<>&"]/g, (c) =>
        ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c)
      );
      resend.emails.send({
        from: "bonjour@devis-flow.fr",
        to: user.email!,
        subject: `${firstNameOAuth}, votre compte DevisFlow est activé 🎉`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
            <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 4px">
              Devis<span style="color:#f97316">Flow</span>
            </p>
            <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Générateur de devis IA pour artisans</p>
            <h1 style="font-size:20px;color:#1e3a5f;margin:0 0 8px">Bienvenue ${firstNameOAuth} ! 🎉</h1>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px">
              Votre compte est activé. Vous avez <strong>7 jours d'essai gratuit</strong> pour tout tester — sans carte bancaire.
            </p>
            <a href="${SITE_URL}/devis"
               style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
              Créer mon premier devis →
            </a>
            <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin-top:24px;">
              Une question ? Répondez directement à cet email — on vous répond sous 24h.<br>L'équipe DevisFlow
            </p>
          </div>
        `,
      }).catch((e: unknown) => console.error("[onboarding email google]", e));
    }

    // OAuth flow → toujours rediriger vers /devis
    return NextResponse.redirect(`${origin}/devis`);
  }

  // Resolve invite → get agence_id if token present
  let agenceId: string | null = null;
  if (inviteToken) {
    const { data: invite } = await admin
      .from("agence_invitations")
      .select("agence_id")
      .eq("token", inviteToken)
      .is("accepted_at", null)
      .single();

    if (invite) {
      agenceId = invite.agence_id;
      // Mark invitation as accepted
      await admin
        .from("agence_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("token", inviteToken);
    }
  }

  // Resolve a team invite (Intermédiaire "multi-utilisateurs") if a token is
  // present. Distinct table/mechanism from agence_invitations above — the
  // same `invite` query param is reused for both, but a token only ever
  // matches one of the two tables. Only resolved (and only ever consumed)
  // on the very first creation of this profile — never on a repeated
  // confirmation-link click — so member_of can be written as a standalone,
  // targeted update below instead of a field in the upsert payload (which
  // would otherwise get silently reset to null on any later re-run, since
  // the invite row would already be marked accepted by then).
  const { data: existingProfileForInvite } = await admin
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  const isInitialProfileCreation = !existingProfileForInvite;

  let teamInviteOwnerId: string | null = null;
  let teamInviteId: string | null = null;
  if (isInitialProfileCreation && inviteToken) {
    const { data: teamInvite } = await admin
      .from("team_invites")
      .select("id, owner_id")
      .eq("token", inviteToken)
      .is("accepted_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle<{ id: string; owner_id: string }>();

    if (teamInvite) {
      // Defensive re-check of the MAX_TEAM_MEMBERS cap at accept time — the
      // cap is already enforced when the invite is sent (see
      // /api/team/invite), but re-checking here closes the window where an
      // owner could still send another invite while this one is in flight,
      // or where two pending invites are accepted concurrently.
      const { count: currentMemberCount } = await admin
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("member_of", teamInvite.owner_id);

      if ((currentMemberCount ?? 0) < MAX_TEAM_MEMBERS) {
        teamInviteOwnerId = teamInvite.owner_id;
        teamInviteId = teamInvite.id;
      } else {
        console.warn(`[auth/callback] team invite ${teamInvite.id} accepted but owner ${teamInvite.owner_id} is already at the ${MAX_TEAM_MEMBERS}-member cap — creating a standard account instead`);
      }
    }
  }

  if (isInitialProfileCreation && inviteToken && !agenceId && !teamInviteOwnerId) {
    // Never block signup on a bad invite token — just log and create a
    // standard solo account, same as if no token had been provided at all.
    console.warn("[auth/callback] invite token present but invalid/expired/already used — creating standard account");
  }

  // Upsert profile (safe to re-run on repeated confirmations)
  // For agence accounts, store the agency name in both full_name and company_name
  const { error: upsertError } = await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      full_name: meta.full_name ?? null,
      company_name: accountType === "agence" ? (meta.full_name ?? null) : null,
      account_type: accountType,
      agence_id: agenceId,
      utm_source: cleanUtm((meta.utm_source as string | undefined) ?? null),
      utm_medium: cleanUtm((meta.utm_medium as string | undefined) ?? null),
      utm_campaign: cleanUtm((meta.utm_campaign as string | undefined) ?? null),
    },
    { onConflict: "id" }
  );
  if (upsertError) {
    console.error("[auth/callback] profile upsert failed:", upsertError);
  }

  // Second, targeted write — see comment above on why this isn't part of
  // the upsert payload. Only reached on initial profile creation.
  if (teamInviteOwnerId && teamInviteId) {
    const { error: memberOfError } = await admin
      .from("profiles")
      .update({ member_of: teamInviteOwnerId })
      .eq("id", user.id);
    if (memberOfError) {
      console.error("[auth/callback] failed to set member_of from team invite:", memberOfError);
    } else {
      await admin
        .from("team_invites")
        .update({ accepted_at: new Date().toISOString() })
        .eq("id", teamInviteId);
    }
  }

  // Send onboarding email (fire-and-forget — don't block redirect)
  // Sanitize name embedded in HTML.
  const rawFirstName = (meta.full_name as string | undefined)?.split(" ")[0] ?? "là";
  const firstName = rawFirstName.replace(/[<>&"]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] ?? c)
  );
  const isAgence = accountType === "agence";
  const onboardingCta = isAgence
    ? `${SITE_URL}/agence/invitations`
    : `${SITE_URL}/devis`;
  const onboardingCtaLabel = isAgence ? "Inviter mes premiers artisans →" : "Créer mon premier devis →";
  const steps = isAgence
    ? [
        "Invitez vos artisans par email depuis votre tableau de bord",
        "Suivez tous leurs devis en temps réel",
        "Exportez vos rapports mensuels en un clic",
      ]
    : [
        "Renseignez vos informations artisan une seule fois",
        "Décrivez les travaux — l'IA génère le devis en 30 secondes",
        "Envoyez par email ou WhatsApp, votre client signe en ligne",
      ];

  resend.emails.send({
    from: "bonjour@devis-flow.fr",
    to: user.email!,
    subject: `${firstName}, votre compte DevisFlow est activé 🎉`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9fafb;border-radius:16px;">
        <p style="font-size:24px;font-weight:900;color:#1e3a5f;margin:0 0 4px">
          Devis<span style="color:#f97316">Flow</span>
        </p>
        <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Générateur de devis IA pour artisans</p>

        <h1 style="font-size:20px;color:#1e3a5f;margin:0 0 8px">Bienvenue ${firstName} ! 🎉</h1>
        <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 24px">
          Votre compte est activé. Vous avez <strong>7 jours d'essai gratuit</strong> pour tout tester — sans carte bancaire.
        </p>

        <div style="background:#fff;border-radius:12px;padding:20px 24px;margin-bottom:24px;border:1px solid #e5e7eb;">
          <p style="font-weight:700;color:#1e3a5f;font-size:14px;margin:0 0 12px">Pour commencer :</p>
          ${steps.map((s, i) => `
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:10px;">
              <span style="background:#f97316;color:#fff;border-radius:50%;width:22px;height:22px;display:inline-flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0;margin-top:1px">${i + 1}</span>
              <span style="color:#374151;font-size:14px;line-height:1.5">${s}</span>
            </div>`).join("")}
        </div>

        <a href="${onboardingCta}"
           style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 28px;border-radius:12px;text-decoration:none;">
          ${onboardingCtaLabel}
        </a>

        <p style="color:#9ca3af;font-size:12px;line-height:1.5;margin-top:24px;">
          Une question ? Répondez directement à cet email — on vous répond sous 24h.<br>
          L'équipe DevisFlow
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0">
        <p style="color:#9ca3af;font-size:11px;">
          DevisFlow · <a href="${SITE_URL}" style="color:#9ca3af">devis-flow.fr</a>
        </p>
      </div>
    `,
  }).catch((e) => console.error("[onboarding email]", e));

  const redirectAfter = meta.redirect_after as string | null | undefined;
  if (redirectAfter === "checkout") {
    try {
      const session = await createCheckoutSession({ userId: user.id, userEmail: user.email! });
      return NextResponse.redirect(session.url);
    } catch (err) {
      console.error("[auth/callback] checkout session creation failed:", err);
      return NextResponse.redirect(`${origin}/dashboard`);
    }
  }
  if (redirectAfter === "devis") {
    return NextResponse.redirect(`${origin}/devis`);
  }

  const dest = accountType === "agence" ? "/agence" : "/dashboard";
  return NextResponse.redirect(`${origin}${dest}`);
}
