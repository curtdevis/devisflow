import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Resend delivery-outcome webhook — fires on email.delivered / email.bounced
 * / email.complained / email.opened. Without this, "sent" in
 * prospecting_sent only ever meant "the Resend API call didn't error",
 * never "actually reached an inbox" — Resend accepts a message
 * synchronously and reports what really happened to it (bounce, complaint,
 * confirmed delivery, open) asynchronously. Matches events back to a row
 * via resend_id (captured in sendEmailStep, scripts/daily-prospecting.ts).
 *
 * email.opened requires open_tracking to be enabled on the domain (done via
 * PATCH /domains/{id} on 2026-08-01 — click_tracking deliberately stays
 * off, see migrations.sql section 15). It's tracked in a separate
 * opened_at column rather than folded into delivery_status: a delivered
 * email opening later isn't a status transition, it's an independent
 * signal, and an email.opened arriving before its email.delivered (real
 * ordering isn't guaranteed) shouldn't downgrade/overwrite delivery_status.
 *
 * Webhook created via the Resend API (POST /webhooks) rather than the
 * dashboard — id 98755a9b-2823-485f-94cb-e3985248b08e. Signing secret is
 * RESEND_DELIVERY_WEBHOOK_SECRET in Vercel prod env (distinct from
 * RESEND_WEBHOOK_SECRET, which src/app/api/prospecting/inbound/route.ts
 * uses for the separate email.received event).
 */
export async function POST(request: NextRequest) {
  const webhookSecret = process.env.RESEND_DELIVERY_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("[prospecting/delivery-events] RESEND_DELIVERY_WEBHOOK_SECRET manquant");
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
    console.error("[prospecting/delivery-events] Signature webhook invalide:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  if (event.type === "email.opened") {
    const { error } = await admin
      .from("prospecting_sent")
      .update({ opened_at: new Date().toISOString() })
      .eq("resend_id", event.data.email_id)
      .is("opened_at", null); // first open only — don't keep bumping the timestamp on repeat opens
    if (error) {
      console.error("[prospecting/delivery-events] Mise à jour opened_at échouée:", error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  let newStatus: "delivered" | "bounced" | "complained";
  if (event.type === "email.delivered") newStatus = "delivered";
  else if (event.type === "email.bounced") newStatus = "bounced";
  else if (event.type === "email.complained") newStatus = "complained";
  else return NextResponse.json({ ignored: true });

  const { error } = await admin
    .from("prospecting_sent")
    .update({ delivery_status: newStatus, delivery_updated_at: new Date().toISOString() })
    .eq("resend_id", event.data.email_id);

  if (error) {
    console.error("[prospecting/delivery-events] Mise à jour échouée:", error);
    return NextResponse.json({ error: "DB update failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
