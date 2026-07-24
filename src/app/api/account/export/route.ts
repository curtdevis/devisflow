import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

/**
 * GET /api/account/export
 *
 * RGPD right to data portability — returns all personal data held about
 * the authenticated user as a single downloadable JSON file.
 */
export async function GET() {
  const supabase = await createSupabaseServer();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  const [{ data: profile }, { data: devis }, { data: clients }, { data: invoices }] = await Promise.all([
    admin.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    admin.from("devis").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    admin.from("clients").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    admin.from("invoices").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
  ]);

  const exportData = {
    export_generated_at: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
    },
    profile: profile ?? null,
    devis: devis ?? [],
    clients: clients ?? [],
    invoices: invoices ?? [],
  };

  const filename = `devisflow-donnees-${user.id.slice(0, 8)}-${new Date().toISOString().slice(0, 10)}.json`;

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
