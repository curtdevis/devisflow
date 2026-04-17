import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { createCheckoutSession } from "@/lib/lemon-squeezy";

/**
 * POST /api/billing/checkout
 *
 * Creates a live Lemon Squeezy checkout session for the authenticated user.
 * Forces test_mode: false — always charges real money.
 *
 * Response: { url: string }
 */
export async function POST(request: NextRequest) {
  // Read user_id from request body (sent by CheckoutButton after client-side auth check)
  let userId: string | undefined;
  let userEmail: string | undefined;

  try {
    const body = await request.json().catch(() => ({}));
    userId = body.user_id as string | undefined;
  } catch {
    // ignore
  }

  if (!userId) {
    return NextResponse.json({ error: "user_id required" }, { status: 400 });
  }

  // Verify the user actually exists in Supabase
  const admin = createSupabaseAdmin();
  const { data: { user }, error } = await admin.auth.admin.getUserById(userId);
  if (error || !user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  userEmail = user.email ?? "";

  try {
    const session = await createCheckoutSession({ userId, userEmail });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[billing/checkout]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
