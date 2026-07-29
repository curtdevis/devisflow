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
  const { id, suspended } = body ?? {};
  if (!id || typeof suspended !== "boolean") {
    return NextResponse.json({ error: "id et suspended (boolean) requis" }, { status: 400 });
  }

  const admin = createSupabaseAdmin();
  const { error } = await admin.from("profiles").update({ suspended }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
