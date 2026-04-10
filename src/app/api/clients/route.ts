import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function GET() {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { data, error } = await createSupabaseAdmin()
      .from("clients")
      .select("id, name, email, phone, address, created_at")
      .eq("user_id", user.id)
      .order("name");

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (err) {
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

    const admin = createSupabaseAdmin();

    // Upsert by name + user_id to avoid duplicates
    const { data: existing } = await admin
      .from("clients")
      .select("id")
      .eq("user_id", user.id)
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
      .insert({ user_id: user.id, name: name.trim(), email: email || null, phone: phone || null, address: address || null })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
