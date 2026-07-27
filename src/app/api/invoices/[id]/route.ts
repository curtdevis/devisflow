import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "id requis" }, { status: 400 });

  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps invalide" }, { status: 400 });
  }

  const input = (typeof body === "object" && body !== null ? body : {}) as Record<string, unknown>;

  const admin = createSupabaseAdmin();

  // Verify invoice belongs to this user
  const { data: invoice, error: fetchErr } = await admin
    .from("invoices")
    .select("id, status, user_id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (fetchErr || !invoice) {
    return NextResponse.json({ error: "Facture introuvable" }, { status: 404 });
  }

  const allowed: Record<string, unknown> = {};

  if (input.status !== undefined) {
    const validStatuses = ["pending", "paid", "overdue"];
    if (!validStatuses.includes(input.status as string)) {
      return NextResponse.json({ error: "Statut invalide" }, { status: 422 });
    }
    allowed.status = input.status;
    if (input.status === "paid") {
      allowed.paid_at = new Date().toISOString();
    } else {
      allowed.paid_at = null;
    }
  }

  if (Object.keys(allowed).length === 0) {
    return NextResponse.json({ error: "Aucun champ valide à mettre à jour" }, { status: 400 });
  }

  const { error } = await admin.from("invoices").update(allowed).eq("id", id);

  if (error) {
    console.error("[PATCH /api/invoices/:id]", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: allowed.status, paid_at: allowed.paid_at ?? null });
}
