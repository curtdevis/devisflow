import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

// Team members (profiles.member_of set) share the owner's client base — all
// client reads/writes are attributed to the owner's account, same as devis
// (see generate-devis/route.ts). Falls back to the caller's own id when not
// a team member, so this is a no-op for every existing (non-Intermédiaire) account.
async function resolveClientsOwnerId(userId: string): Promise<string> {
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("member_of")
    .eq("id", userId)
    .maybeSingle<{ member_of: string | null }>();
  return profile?.member_of ?? userId;
}

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const ownerId = await resolveClientsOwnerId(user.id);

    const { data, error } = await createSupabaseAdmin()
      .from("clients")
      .select("id, name, email, phone, address, created_at")
      .eq("user_id", ownerId)
      .order("name");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { name, email, phone, address } = await req.json();
    if (!name) return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });

    const ownerId = await resolveClientsOwnerId(user.id);
    const admin = createSupabaseAdmin();

    // Upsert by name + owner id to avoid duplicates
    const { data: existing } = await admin
      .from("clients")
      .select("id")
      .eq("user_id", ownerId)
      .ilike("name", name.trim())
      .single();

    if (existing) {
      // Update existing client info
      const { data, error } = await admin
        .from("clients")
        .update({ email: email || null, phone: phone || null, address: address || null })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json(data);
    }

    const { data, error } = await admin
      .from("clients")
      .insert({ user_id: ownerId, name: name.trim(), email: email || null, phone: phone || null, address: address || null })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
