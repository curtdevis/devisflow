import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";
import { createCheckoutSession, type PlanTier } from "@/lib/lemon-squeezy";

const VALID_TIERS: PlanTier[] = ["solo", "intermediaire"];

export async function POST(request: NextRequest) {
  // Authenticate via server session (cookies) — never trust client-supplied user_id
  const supabase = await createSupabaseServer();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const userId = user.id;
  const userEmail = user.email ?? "";

  // Only the plan tier is read from the client (picks which product to check
  // out for) — the actual plan/tier granted after payment is always derived
  // server-side from the Lemon Squeezy webhook's own variant_id, never trusted
  // from this request. user_id is never taken from the client either.
  const body = await request.json().catch(() => ({}));
  const requestedTier = body?.tier;
  const tier: PlanTier = VALID_TIERS.includes(requestedTier) ? requestedTier : "solo";

  try {
    const session = await createCheckoutSession({ userId, userEmail, tier });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
