import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);

function extractEmail(from: string): string {
  const match = from.match(/<([^>]+)>/);
  return (match ? match[1] : from).toLowerCase().trim();
}

/**
 * Resend inbound webhook — fires on `email.received` when a prospect replies
 * to equipe@devis-flow.fr. Detects "STOP" (in the subject via the one-click
 * List-Unsubscribe mailto, or anywhere in a freeform reply) and blacklists
 * the sender so scripts/weekly-prospecting.ts never contacts them again.
 *
 * Manual setup required in the Resend dashboard (not doable from code):
 * 1. Domains > devis-flow.fr > enable Receiving, add the MX record it gives you.
 * 2. Webhooks > Add endpoint > URL: https://devis-flow.fr/api/prospecting/inbound,
 *    event: "email.received". Copy the signing secret into Vercel as
 *    RESEND_WEBHOOK_SECRET.
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[prospecting/inbound] RESEND_WEBHOOK_SECRET manquant");
    return NextResponse.json({ error: "Not configured" }, { status: 500 });
  }

  const payload = await request.text();
  const svixId = request.headers.get("svix-id");
  const svixTimestamp = request.headers.get("svix-timestamp");
  const svixSignature = request.headers.get("svix-signature");
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing signature headers" }, { status: 400 });
  }

  let event;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret,
    });
  } catch (err) {
    console.error("[prospecting/inbound] Signature webhook invalide:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ ignored: true });
  }

  const fromEmail = extractEmail(event.data.from);
  const subjectHasStop = /\bstop\b/i.test(event.data.subject ?? "");

  let bodyHasStop = false;
  if (!subjectHasStop) {
    try {
      const full = await resend.emails.receiving.get(event.data.email_id);
      bodyHasStop = /\bstop\b/i.test(`${full.data?.text ?? ""} ${full.data?.html ?? ""}`);
    } catch (err) {
      console.error("[prospecting/inbound] Lecture du corps de l'email échouée:", err);
    }
  }

  if (subjectHasStop || bodyHasStop) {
    const admin = createSupabaseAdmin();
    await admin
      .from("prospecting_blacklist")
      .upsert({ email: fromEmail, reason: "Réponse STOP" }, { onConflict: "email" });
    console.log(`[prospecting/inbound] ${fromEmail} ajouté à la liste noire (STOP)`);
  }

  return NextResponse.json({ ok: true });
}
