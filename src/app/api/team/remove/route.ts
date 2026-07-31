import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

// POST — owner removes a linked team member (member_of → null) or cancels a
// pending invitation (deletes the team_invites row). Not gated by current
// tier/plan — an owner who downgraded must still be able to clean up their
// own team, only the ownership check (below) matters for authorization.
export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });

  const { type, id } = body as { type?: unknown; id?: unknown };
  if ((type !== "member" && type !== "invite") || typeof id !== "string" || !id) {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const ownerId = user.id;

  if (type === "member") {
    const { data: member } = await admin
      .from("profiles")
      .select("id, member_of")
      .eq("id", id)
      .maybeSingle<{ id: string; member_of: string | null }>();

    if (!member || member.member_of !== ownerId) {
      return NextResponse.json({ error: "Membre introuvable." }, { status: 404 });
    }

    const { error } = await admin.from("profiles").update({ member_of: null }).eq("id", id);
    if (error) {
      console.error("[team/remove] member update error:", error.message);
      return NextResponse.json({ error: "Erreur lors du retrait du membre." }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  }

  // type === "invite"
  const { data: invite } = await admin
    .from("team_invites")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle<{ id: string; owner_id: string }>();

  if (!invite || invite.owner_id !== ownerId) {
    return NextResponse.json({ error: "Invitation introuvable." }, { status: 404 });
  }

  const { error } = await admin.from("team_invites").delete().eq("id", id);
  if (error) {
    console.error("[team/remove] invite delete error:", error.message);
    return NextResponse.json({ error: "Erreur lors de l'annulation de l'invitation." }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
