import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabase-server";

/**
 * GET /api/billing/portal
 *
 * Redirects the authenticated user to their Lemon Squeezy customer portal.
 * The portal URL is stored on the profile after the first successful payment webhook.
 */
export async function GET(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", "/account");
    return NextResponse.redirect(loginUrl);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("lemon_squeezy_customer_portal")
    .eq("id", user.id)
    .single();

  const portalUrl = profile?.lemon_squeezy_customer_portal;

  if (!portalUrl) {
    // User is on free plan — no portal available
    const accountUrl = new URL("/account", request.url);
    accountUrl.searchParams.set("portal_error", "no_subscription");
    return NextResponse.redirect(accountUrl);
  }

  return NextResponse.redirect(portalUrl);
}
