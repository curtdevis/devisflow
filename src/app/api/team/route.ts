import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

// GET — list the authenticated owner's current team members + pending invites.
// Read-only, scoped to the caller's own id (owner_id / member_of), so it's
// safe regardless of current plan/tier — no data belonging to anyone else
// can be returned.
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const admin = createSupabaseAdmin();
  const nowIso = new Date().toISOString();

  const [{ data: members, error: membersError }, { data: invites, error: invitesError }] = await Promise.all([
    admin
      .from("profiles")
      .select("id, full_name, email, created_at")
      .eq("member_of", user.id)
      .order("created_at", { ascending: true }),
    admin
      .from("team_invites")
      .select("id, email, created_at, expires_at")
      .eq("owner_id", user.id)
      .is("accepted_at", null)
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: true }),
  ]);

  if (membersError || invitesError) {
    console.error("[team] query error:", membersError?.message, invitesError?.message);
    return NextResponse.json({ error: "Erreur lors du chargement de l'équipe." }, { status: 500 });
  }

  return NextResponse.json({ members: members ?? [], invites: invites ?? [] });
}
