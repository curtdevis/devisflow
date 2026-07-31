/**
 * Lemon Squeezy agent — source of truth for all billing logic.
 *
 * ENV VARS required (add to .env.local + Vercel):
 *   LEMON_SQUEEZY_API_KEY                    — API key from LS dashboard > API
 *   LEMON_SQUEEZY_STORE_ID                   — numeric store ID (LS dashboard URL: /stores/<id>)
 *   LEMON_SQUEEZY_VARIANT_ID                 — numeric variant ID of the "Artisan Solo" product (tier: solo)
 *   LEMON_SQUEEZY_VARIANT_ID_INTERMEDIAIRE   — numeric variant ID of the "Intermédiaire" product (tier: intermediaire)
 *   LEMON_SQUEEZY_WEBHOOK_SECRET             — webhook signing secret
 *
 * Checkout sessions are always created with test_mode: false so the
 * live store is used regardless of the LS dashboard test-mode toggle.
 */

import crypto from "crypto";

const LS_API_BASE = "https://api.lemonsqueezy.com/v1";

export type PlanTier = "solo" | "intermediaire";

// Which self-serve tier a variant ID maps to — the ONLY source of truth for
// "what did the customer actually pay for" is this map applied to the
// variant_id Lemon Squeezy sends in the webhook payload. Never trust a
// client-supplied tier for this purpose (see webhooks/lemon-squeezy/route.ts) —
// a request could otherwise claim "intermediaire" while paying the solo price.
function variantIdForTier(tier: PlanTier): string {
  const envVar = tier === "intermediaire" ? "LEMON_SQUEEZY_VARIANT_ID_INTERMEDIAIRE" : "LEMON_SQUEEZY_VARIANT_ID";
  const id = process.env[envVar];
  if (!id) throw new Error(`[ls] ${envVar} not configured`);
  return id;
}

/** Maps a Lemon Squeezy variant_id (from a webhook payload) back to our plan tier. Returns null if unrecognized. */
export function tierFromVariantId(variantId: string | undefined): PlanTier | null {
  if (!variantId) return null;
  if (variantId === process.env.LEMON_SQUEEZY_VARIANT_ID) return "solo";
  if (variantId === process.env.LEMON_SQUEEZY_VARIANT_ID_INTERMEDIAIRE) return "intermediaire";
  return null;
}

// ── Internal helpers ────────────────────────────────────────────────────────

function apiKey(): string {
  const k = process.env.LEMON_SQUEEZY_API_KEY;
  if (!k) throw new Error("[ls] LEMON_SQUEEZY_API_KEY not configured");
  return k;
}

async function lsRequest<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${LS_API_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/vnd.api+json",
      Accept: "application/vnd.api+json",
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`[ls] API ${method} ${path} → ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Types ───────────────────────────────────────────────────────────────────

export interface LSCheckoutSession {
  url: string;
  id: string;
}

export interface LSSubscription {
  id: string;
  status: "active" | "cancelled" | "expired" | "past_due" | "unpaid" | "on_trial" | "paused";
  renews_at: string | null;
  ends_at: string | null;
  customer_portal_url: string | null;
}

export interface LSWebhookPayload {
  meta: {
    event_name: string;
    custom_data?: Record<string, string>;
    test_mode?: boolean;
  };
  data: {
    id: string;
    type: string;
    attributes: Record<string, unknown>;
  };
}

export type LSWebhookEvent =
  | "order_created"
  | "subscription_created"
  | "subscription_updated"
  | "subscription_cancelled"
  | "subscription_expired"
  | "subscription_resumed"
  | "subscription_paused";

// ── Checkout ────────────────────────────────────────────────────────────────

/**
 * Creates a live checkout session via the LS API.
 * Always forces test_mode: false so the production store is used.
 */
export async function createCheckoutSession(params: {
  userId: string;
  userEmail: string;
  tier?: PlanTier;
}): Promise<LSCheckoutSession> {
  const tier = params.tier ?? "solo";
  const storeId = process.env.LEMON_SQUEEZY_STORE_ID;
  if (!storeId) {
    throw new Error("[ls] LEMON_SQUEEZY_STORE_ID not configured");
  }
  const variantId = variantIdForTier(tier);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";
  const planLabel = tier === "intermediaire" ? "Intermédiaire" : "Artisan Solo";

  const payload = {
    data: {
      type: "checkouts",
      attributes: {
        // Forces live mode regardless of LS dashboard test-mode toggle
        test_mode: false,
        checkout_data: {
          email: params.userEmail,
          custom: {
            user_id: params.userId,
          },
        },
        product_options: {
          redirect_url: `${siteUrl}/dashboard?upgraded=1`,
          receipt_link_url: `${siteUrl}/dashboard`,
          receipt_thank_you_note: `Merci ! Votre abonnement DevisFlow ${planLabel} est actif.`,
        },
        checkout_options: {
          embed: false,
          media: true,
          logo: true,
          desc: true,
          discount: false,
          button_color: "#f97316",
        },
      },
      relationships: {
        store: { data: { type: "stores", id: String(storeId) } },
        variant: { data: { type: "variants", id: String(variantId) } },
      },
    },
  };

  type LSCheckoutResponse = { data: { id: string; attributes: { url: string } } };
  const response = await lsRequest<LSCheckoutResponse>("POST", "/checkouts", payload);
  return {
    id: response.data.id,
    url: response.data.attributes.url,
  };
}

// ── Subscription ────────────────────────────────────────────────────────────

/** Fetches a subscription by its LS ID. */
export async function getSubscription(subscriptionId: string): Promise<LSSubscription> {
  type LSSubResponse = {
    data: {
      id: string;
      attributes: {
        status: LSSubscription["status"];
        renews_at: string | null;
        ends_at: string | null;
        urls?: { customer_portal?: string };
      };
    };
  };
  const response = await lsRequest<LSSubResponse>("GET", `/subscriptions/${subscriptionId}`);
  const attrs = response.data.attributes;
  return {
    id: response.data.id,
    status: attrs.status,
    renews_at: attrs.renews_at ?? null,
    ends_at: attrs.ends_at ?? null,
    customer_portal_url: attrs.urls?.customer_portal ?? null,
  };
}

// ── Webhook ─────────────────────────────────────────────────────────────────

/** Verifies the HMAC-SHA256 signature sent by Lemon Squeezy. */
export function verifyWebhookSignature(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(rawBody);
  const digest = hmac.digest("hex");
  try {
    return crypto.timingSafeEqual(
      Buffer.from(digest, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

/**
 * Parses a verified webhook payload into a normalised event object.
 * Returns null if the event is unknown or payload is malformed.
 */
export function parseWebhookPayload(raw: unknown): {
  eventName: LSWebhookEvent;
  userId: string | undefined;
  customerId: string | undefined;
  subscriptionId: string | undefined;
  customerPortal: string | null;
  status: string | undefined;
  testMode: boolean;
  variantId: string | undefined;
} | null {
  const payload = raw as LSWebhookPayload;
  const eventName = payload?.meta?.event_name as LSWebhookEvent | undefined;
  if (!eventName) return null;

  const userId = payload.meta.custom_data?.user_id;
  const attrs = payload.data?.attributes as Record<string, unknown> | undefined;
  const customerId = attrs?.customer_id ? String(attrs.customer_id) : undefined;
  const subscriptionId = payload.data?.id;
  const customerPortal =
    (attrs?.urls as Record<string, string> | undefined)?.customer_portal ?? null;
  const status = attrs?.status as string | undefined;
  const testMode = payload.meta.test_mode === true;
  // "order_created" nests the purchased variant under first_order_item;
  // subscription_* events have variant_id directly on the attributes.
  const firstOrderItem = attrs?.first_order_item as Record<string, unknown> | undefined;
  const variantId = attrs?.variant_id
    ? String(attrs.variant_id)
    : firstOrderItem?.variant_id
      ? String(firstOrderItem.variant_id)
      : undefined;

  return { eventName, userId, customerId, subscriptionId, customerPortal, status, testMode, variantId };
}

// ── Plan logic ──────────────────────────────────────────────────────────────

/** Returns the Supabase plan value for a given LS webhook event. */
export function planFromEvent(
  eventName: LSWebhookEvent
): "paid" | "free" | null {
  if (eventName === "order_created" || eventName === "subscription_created" || eventName === "subscription_resumed") {
    return "paid";
  }
  if (
    eventName === "subscription_cancelled" ||
    eventName === "subscription_expired"
  ) {
    return "free";
  }
  return null;
}
