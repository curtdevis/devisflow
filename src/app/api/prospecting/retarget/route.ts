import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { buildRetargetingEmailHtml } from "@/lib/prospecting-personalize";
import { notifyAdmin, escapeHtml } from "@/lib/admin-notify";

const resend = new Resend(process.env.RESEND_API_KEY);
const SEND_FROM = "DevisFlow <equipe@devis-flow.fr>";
// Bounded per run so a single invocation can't blow past Vercel's function
// timeout or spike Resend volume — the cron (vercel.json) re-runs often
// enough that any backlog drains within a few cycles.
const MAX_PER_RUN = 20;

/**
 * Automatic retargeting: a prospect who clicked the original cold-outreach
 * email (site_visits.ref matches prospecting_sent.tracking_ref — see
 * migrations.sql section 13) but never signed up gets ONE follow-up email
 * offering a genuine 14-day trial instead of the standard 7 (only actually
 * honored because retargeted_at gets set below — see resolveTrialDays in
 * src/app/auth/callback/route.ts). Runs on a frequent cron (vercel.json) so
 * the whole thing is automatic — no manual trigger needed — rather than
 * gated behind an arbitrary delay after the click.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  const { data: candidates, error: candidatesError } = await admin
    .from("prospecting_sent")
    .select("id, email, company_name, category, tracking_ref")
    .not("tracking_ref", "is", null)
    .is("retargeted_at", null)
    .limit(500);

  if (candidatesError) {
    return NextResponse.json({ error: candidatesError.message }, { status: 500 });
  }
  if (!candidates || candidates.length === 0) {
    return NextResponse.json({ retargeted: 0, checked: 0 });
  }

  const refs = candidates.map((c) => c.tracking_ref as string);
  const { data: clickedVisits, error: visitsError } = await admin
    .from("site_visits")
    .select("ref")
    .in("ref", refs);

  if (visitsError) {
    return NextResponse.json({ error: visitsError.message }, { status: 500 });
  }

  const clickedRefs = new Set((clickedVisits ?? []).map((v) => v.ref as string));
  const clickedCandidates = candidates.filter((c) => clickedRefs.has(c.tracking_ref as string));

  if (clickedCandidates.length === 0) {
    return NextResponse.json({ retargeted: 0, checked: candidates.length });
  }

  const emails = clickedCandidates.map((c) => c.email);
  const [{ data: blacklisted }, { data: existingProfiles }] = await Promise.all([
    admin.from("prospecting_blacklist").select("email").in("email", emails),
    admin.from("profiles").select("email").in("email", emails),
  ]);
  const blacklistedSet = new Set((blacklisted ?? []).map((b) => (b.email as string).toLowerCase()));
  const signedUpSet = new Set((existingProfiles ?? []).map((p) => (p.email as string)?.toLowerCase()));

  const eligible = clickedCandidates
    .filter((c) => !blacklistedSet.has(c.email.toLowerCase()) && !signedUpSet.has(c.email.toLowerCase()))
    .slice(0, MAX_PER_RUN);

  let retargeted = 0;
  for (const prospect of eligible) {
    const ref = prospect.tracking_ref as string;
    const { error: sendError } = await resend.emails.send({
      from: SEND_FROM,
      to: prospect.email,
      replyTo: "equipe@devis-flow.fr",
      subject: `${prospect.company_name}, 14 jours d'essai offerts`,
      html: buildRetargetingEmailHtml(prospect.company_name, ref),
      headers: {
        "List-Unsubscribe": "<mailto:equipe@devis-flow.fr?subject=STOP>",
      },
    });

    if (sendError) {
      console.error(`[retarget] send failed for ${prospect.email}:`, sendError.message);
      continue;
    }

    await admin
      .from("prospecting_sent")
      .update({ retargeted_at: new Date().toISOString() })
      .eq("id", prospect.id);

    retargeted++;
    notifyAdmin(
      `Retargeting envoyé — ${prospect.company_name}`,
      `<p><strong>Entreprise :</strong> ${escapeHtml(prospect.company_name)}</p>
       <p><strong>Email :</strong> ${escapeHtml(prospect.email)}</p>
       <p><strong>Métier :</strong> ${escapeHtml(prospect.category ?? "—")}</p>
       <p>A cliqué sur l'email de prospection sans s'inscrire — relancé avec l'offre 14 jours d'essai.</p>`
    );
  }

  return NextResponse.json({ retargeted, checked: candidates.length, eligible: eligible.length });
}
