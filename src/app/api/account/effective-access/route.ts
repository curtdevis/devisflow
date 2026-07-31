import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { DEFAULT_TRIAL_DAYS, isTrialExpired, trialDaysLeft } from "@/lib/trial";

/**
 * GET /api/account/effective-access
 *
 * Resolves the CALLER's effective plan/trial/reminder-tier status, taking
 * into account the same coverage mechanisms enforced server-side in
 * /api/generate-devis, /api/reminders and /api/devis/export: the account's
 * own plan, Cabinet & Groupement coverage (agence_id → paid agence), and
 * Intermédiaire "multi-utilisateurs" coverage (member_of → paid
 * Intermédiaire owner).
 *
 * Client components (CheckoutButton, the /devis trial wall) can't resolve
 * this themselves from the browser Supabase client — RLS only lets a user
 * read their own `profiles` row, so a team member has no way to see that
 * their owner's subscription is active. Without this endpoint, client-side
 * gates fall back to the caller's own (always "free") plan/created_at and
 * wrongly show an expired-trial wall to a legitimately covered team member
 * or agence-linked artisan. This mirrors /api/generate-devis's logic
 * exactly so the two never disagree.
 */
export async function GET() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("plan, tier, agence_id, member_of, created_at, trial_days")
    .eq("id", user.id)
    .single<{
      plan: string | null;
      tier: string | null;
      agence_id: string | null;
      member_of: string | null;
      created_at: string;
      trial_days: number;
    }>();

  let coveredByAgence = false;
  if (profile?.agence_id) {
    const { data: agenceProfile } = await admin
      .from("profiles")
      .select("plan")
      .eq("id", profile.agence_id)
      .single<{ plan: string | null }>();
    coveredByAgence = agenceProfile?.plan === "paid";
  }

  let coveredByMember = false;
  if (!coveredByAgence && profile?.member_of) {
    const { data: ownerProfile } = await admin
      .from("profiles")
      .select("plan, tier")
      .eq("id", profile.member_of)
      .single<{ plan: string | null; tier: string | null }>();
    coveredByMember = ownerProfile?.plan === "paid" && ownerProfile?.tier === "intermediaire";
  }

  const ownPlanPaid = profile?.plan === "paid";
  const plan = ownPlanPaid || coveredByAgence || coveredByMember ? "paid" : "free";

  let trialExpired = false;
  let trialDaysLeftValue = 0;
  if (!ownPlanPaid && !coveredByAgence && !coveredByMember) {
    const createdAt = profile?.created_at ?? user.created_at;
    trialExpired = isTrialExpired(createdAt, profile?.trial_days);
    trialDaysLeftValue = trialDaysLeft(createdAt, profile?.trial_days);
  }

  // Mirrors the HIGH_TIER_REMINDER_CAP eligibility in /api/generate-devis —
  // coveredByAgence is intentionally excluded, Cabinet & Groupement bundles
  // Artisan Solo parity only, not Intermédiaire's unlimited reminders.
  const reminderTierHigh = profile?.tier === "intermediaire" || profile?.tier === "agence" || coveredByMember;

  return NextResponse.json({
    plan,
    trialExpired,
    trialDaysLeft: trialDaysLeftValue,
    trialDays: profile?.trial_days ?? DEFAULT_TRIAL_DAYS,
    reminderTierHigh,
  });
}
