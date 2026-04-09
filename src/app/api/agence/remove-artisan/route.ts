import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body?.artisanId) {
    return NextResponse.json({ error: "artisanId requis" }, { status: 400 });
  }

  const { artisanId } = body as { artisanId: string };

  // Authenticate the requester
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Verify the requester is an agence
  const { data: agenceProfile } = await admin
    .from("profiles")
    .select("account_type")
    .eq("id", user.id)
    .single();

  if (agenceProfile?.account_type !== "agence") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  // Verify the artisan actually belongs to this agence
  const { data: artisanProfile } = await admin
    .from("profiles")
    .select("agence_id")
    .eq("id", artisanId)
    .single();

  if (!artisanProfile || artisanProfile.agence_id !== user.id) {
    return NextResponse.json({ error: "Artisan introuvable dans votre agence" }, { status: 404 });
  }

  // Unlink: set agence_id to null
  const { error } = await admin
    .from("profiles")
    .update({ agence_id: null })
    .eq("id", artisanId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
