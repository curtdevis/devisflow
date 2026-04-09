import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * Lemon Squeezy webhook handler.
 *
 * Setup in LS dashboard:
 *   URL: https://devis-flow.fr/api/webhooks/lemon-squeezy
 *   Events: order_created, subscription_cancelled
 *   Secret: set LEMON_SQUEEZY_WEBHOOK_SECRET in .env.local
 *
 * Custom checkout data — pass user_id when opening checkout:
 *   https://devisflow.lemonsqueezy.com/checkout/buy/<id>?checkout[custom][user_id]=<uuid>
 */

function verifySignature(rawBody: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"));
  } catch {
    return false;
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;
  if (!secret) {
    console.error("[ls-webhook] LEMON_SQUEEZY_WEBHOOK_SECRET not set");
    return NextResponse.json({ error: "Webhook secret not configured" }, { status: 500 });
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-signature") ?? "";

  if (!verifySignature(rawBody, signature, secret)) {
    console.warn("[ls-webhook] Invalid signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const eventName = (payload.meta as Record<string, unknown>)?.event_name as string | undefined;
  const customData = (payload.meta as Record<string, unknown>)?.custom_data as Record<string, string> | undefined;
  const userId = customData?.user_id;

  console.log(`[ls-webhook] event=${eventName} user_id=${userId ?? "unknown"}`);

  if (!userId) {
    console.warn("[ls-webhook] No user_id in custom_data — cannot link to account");
    return NextResponse.json({ received: true });
  }

  const admin = createSupabaseAdmin();

  if (eventName === "order_created") {
    const data = payload.data as Record<string, unknown> | undefined;
    const attributes = data?.attributes as Record<string, unknown> | undefined;
    const customerId = attributes?.customer_id as number | string | undefined;

    // Build the customer portal URL (LS provides this in the order)
    const customerPortal = (attributes?.urls as Record<string, string> | undefined)?.customer_portal ?? null;

    const { error } = await admin.from("profiles").update({
      plan: "paid",
      lemon_squeezy_customer_id: customerId ? String(customerId) : null,
      lemon_squeezy_customer_portal: customerPortal,
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    if (error) {
      console.error("[ls-webhook] Failed to update profile:", error.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log(`[ls-webhook] Plan set to 'paid' for user ${userId}`);
  }

  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    const { error } = await admin.from("profiles").update({
      plan: "free",
      updated_at: new Date().toISOString(),
    }).eq("id", userId);

    if (error) {
      console.error("[ls-webhook] Failed to downgrade plan:", error.message);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    console.log(`[ls-webhook] Plan reset to 'free' for user ${userId}`);
  }

  return NextResponse.json({ received: true });
}
