import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { verifyWebhookSignature, parseWebhookPayload, planFromEvent } from "@/lib/lemon-squeezy";

/**
 * POST /api/webhooks/lemon-squeezy
 *
 * Lemon Squeezy webhook receiver.
 * Configure in LS dashboard:
 *   URL:    https://devis-flow.fr/api/webhooks/lemon-squeezy
 *   Events: order_created, subscription_created, subscription_updated,
 *           subscription_cancelled, subscription_expired, subscription_resumed
 *   Secret: LEMON_SQUEEZY_WEBHOOK_SECRET
 */
export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[ls-webhook] LEMON_SQUEEZY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature, secret)) {
    console.warn("[ls-webhook] Invalid signature — rejected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = parseWebhookPayload(rawPayload);
  if (!event) {
    return NextResponse.json({ received: true });
  }

  const { eventName, userId, customerId, customerPortal, subscriptionId } = event;
  console.log(`[ls-webhook] event=${eventName} user=${userId ?? "unknown"} sub=${subscriptionId ?? "-"}`);

  if (!userId) {
    console.warn("[ls-webhook] No user_id in custom_data — cannot sync account");
    return NextResponse.json({ received: true });
  }

  const admin = createSupabaseAdmin();
  const newPlan = planFromEvent(eventName);

  if (newPlan === "paid") {
    const { error } = await admin
      .from("profiles")
      .update({
        plan: "paid",
        lemon_squeezy_customer_id: customerId ?? null,
        lemon_squeezy_customer_portal: customerPortal ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[ls-webhook] Failed to activate plan:", error.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
    console.log(`[ls-webhook] Plan → paid for user ${userId}`);
  }

  if (newPlan === "free") {
    const { error } = await admin
      .from("profiles")
      .update({
        plan: "free",
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    if (error) {
      console.error("[ls-webhook] Failed to downgrade plan:", error.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }
    console.log(`[ls-webhook] Plan → free for user ${userId}`);
  }

  if (eventName === "subscription_updated") {
    // Keep portal URL fresh if provided
    if (customerPortal) {
      await admin
        .from("profiles")
        .update({
          lemon_squeezy_customer_portal: customerPortal,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId);
    }
    console.log(`[ls-webhook] Subscription updated for user ${userId}`);
  }

  return NextResponse.json({ received: true });
}
