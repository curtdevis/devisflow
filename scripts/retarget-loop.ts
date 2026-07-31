import { sleep } from "workflow";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { buildRetargetingEmailHtml } from "@/lib/prospecting-personalize";
import { notifyAdmin, escapeHtml } from "@/lib/admin-notify";

const SEND_FROM = "DevisFlow <equipe@devis-flow.fr>";
// Bounded per pass so one iteration can't blow past a step's practical
// runtime or spike Resend volume — the loop below re-runs every 10 minutes,
// so any backlog beyond this drains within a couple of passes.
const MAX_PER_PASS = 20;
const LOOP_INTERVAL = "10m";
// Vercel Hobby crons can't run more than once/day (see route.ts), so this
// workflow is triggered once daily and self-loops via sleep() instead —
// that's a Workflow DevKit mechanism, not a Vercel Cron Job, so the Hobby
// restriction doesn't apply to it. Runs for one day, then naturally ends;
// the next day's cron trigger starts a fresh loop.
const LOOP_DURATION_MS = 24 * 60 * 60 * 1000;

interface RetargetPassResult {
  retargeted: number;
  checked: number;
  eligible: number;
}

/**
 * One pass: find prospects who clicked a cold-outreach email (site_visits.ref
 * matches prospecting_sent.tracking_ref) but never signed up, and send each
 * one follow-up email offering a genuine 14-day trial instead of the
 * standard 7 — only actually honored because retargeted_at gets set below
 * (see resolveTrialDays in src/app/auth/callback/route.ts).
 */
async function retargetPassStep(): Promise<RetargetPassResult> {
  "use step";
  const admin = createSupabaseAdmin();
  const resend = new Resend(process.env.RESEND_API_KEY);

  const { data: candidates, error: candidatesError } = await admin
    .from("prospecting_sent")
    .select("id, email, company_name, category, tracking_ref")
    .not("tracking_ref", "is", null)
    .is("retargeted_at", null)
    .limit(500);

  if (candidatesError) {
    console.error("[retarget] candidates query failed:", candidatesError.message);
    return { retargeted: 0, checked: 0, eligible: 0 };
  }
  if (!candidates || candidates.length === 0) {
    return { retargeted: 0, checked: 0, eligible: 0 };
  }

  const refs = candidates.map((c) => c.tracking_ref as string);
  const { data: clickedVisits, error: visitsError } = await admin
    .from("site_visits")
    .select("ref")
    .in("ref", refs);

  if (visitsError) {
    console.error("[retarget] visits query failed:", visitsError.message);
    return { retargeted: 0, checked: candidates.length, eligible: 0 };
  }

  const clickedRefs = new Set((clickedVisits ?? []).map((v) => v.ref as string));
  const clickedCandidates = candidates.filter((c) => clickedRefs.has(c.tracking_ref as string));

  if (clickedCandidates.length === 0) {
    return { retargeted: 0, checked: candidates.length, eligible: 0 };
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
    .slice(0, MAX_PER_PASS);

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

  return { retargeted, checked: candidates.length, eligible: eligible.length };
}

export async function retargetLoopWorkflow() {
  "use workflow";

  const endAt = Date.now() + LOOP_DURATION_MS;
  let totalRetargeted = 0;

  while (Date.now() < endAt) {
    const result = await retargetPassStep();
    totalRetargeted += result.retargeted;
    await sleep(LOOP_INTERVAL);
  }

  console.log(`[retarget-loop] finished 24h loop — ${totalRetargeted} prospects retargeted`);
  return { totalRetargeted };
}
