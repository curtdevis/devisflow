import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const supabase = await createSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
  }

  const user = data.user;
  const meta = user.user_metadata ?? {};
  const accountType = (meta.account_type ?? "artisan") as "artisan" | "agence";
  const inviteToken = meta.invite_token as string | null | undefined;

  // Create profile using admin client (bypasses RLS)
  const admin = createSupabaseAdmin();

  // Resolve invite → get agence_id if token present
  let agenceId: string | null = null;
  if (inviteToken) {
    const { data: invite } = await admin
      .from("agence_invitations")
      .select("agence_id")
      .eq("token", inviteToken)
      .is("accepted_at", null)
      .single();

    if (invite) {
      agenceId = invite.agence_id;
      // Mark invitation as accepted
      await admin
        .from("agence_invitations")
        .update({ accepted_at: new Date().toISOString() })
        .eq("token", inviteToken);
    }
  }

  // Upsert profile (safe to re-run on repeated confirmations)
  // For agence accounts, store the agency name in both full_name and company_name
  await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      full_name: meta.full_name ?? null,
      company_name: accountType === "agence" ? (meta.full_name ?? null) : null,
      account_type: accountType,
      agence_id: agenceId,
    },
    { onConflict: "id" }
  );

  const redirectAfter = meta.redirect_after as string | null | undefined;
  if (redirectAfter === "checkout") {
    const checkoutUrl = `https://devisflow.lemonsqueezy.com/checkout/buy/c410da6a-48e2-4e35-aeb0-dea0ebb29cb5?checkout[custom][user_id]=${user.id}`;
    return NextResponse.redirect(checkoutUrl);
  }

  const dest = accountType === "agence" ? "/agence" : "/dashboard";
  return NextResponse.redirect(`${origin}${dest}`);
}
