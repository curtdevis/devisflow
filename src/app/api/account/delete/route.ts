import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function DELETE() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  // Delete user's devis first (in case no FK cascade)
  await admin.from("devis").delete().eq("user_id", user.id);

  // Delete profile (cascades other tables if FK is set)
  await admin.from("profiles").delete().eq("id", user.id);

  // Delete the Supabase auth user — this is irreversible
  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error("[delete-account]", deleteError.message);
    return NextResponse.json({ error: "Erreur lors de la suppression du compte." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
