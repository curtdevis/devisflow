import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createSupabaseAdmin } from "@/lib/supabase-server";

async function isAuthed() {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && session?.value === adminPassword;
}

export async function POST(req: NextRequest) {
  if (!(await isAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const { id, plan } = body ?? {};
  if (!id || (plan !== "paid" && plan !== "free")) {
    return NextResponse.json({ error: "id et plan ('paid' | 'free') requis" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("id, account_type")
    .eq("id", id)
    .single<{ id: string; account_type: string }>();

  if (!profile || profile.account_type !== "agence") {
    return NextResponse.json({ error: "Compte agence introuvable" }, { status: 404 });
  }

  const { error } = await admin.from("profiles").update({ plan }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
