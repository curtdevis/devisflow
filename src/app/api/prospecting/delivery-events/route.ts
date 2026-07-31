import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { createSupabaseAdmin } from "@/lib/supabase-server";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Resend delivery-outcome webhook — fires on email.delivered / email.bounced
 * / email.complained. Without this, "sent" in prospecting_sent only ever
 * meant "the Resend API call didn't error", never "actually reached an
 * inbox" — Resend accepts a message synchronously and reports what really
 * happened to it (bounce, complaint, confirmed delivery) asynchronously.
 * Matches events back to a row via resend_id (captured in sendEmailStep,
 * scripts/daily-prospecting.ts).
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

  let newStatus: "delivered" | "bounced" | "complained";
  if (event.type === "email.delivered") newStatus = "delivered";
  else if (event.type === "email.bounced") newStatus = "bounced";
  else if (event.type === "email.complained") newStatus = "complained";
  else return NextResponse.json({ ignored: true });

  const admin = createSupabaseAdmin();
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
