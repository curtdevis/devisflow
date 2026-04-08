import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase";

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
  await admin.from("profiles").upsert(
    {
      id: user.id,
      email: user.email!,
      full_name: meta.full_name ?? null,
      account_type: accountType,
      agence_id: agenceId,
    },
    { onConflict: "id" }
  );

  const dest = accountType === "agence" ? "/agence" : "/dashboard";
  return NextResponse.redirect(`${origin}${dest}`);
}
