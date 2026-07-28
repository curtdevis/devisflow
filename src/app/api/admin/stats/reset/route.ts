import { NextResponse } from "next/server";
import { createSupabaseAdmin } from "@/lib/supabase-server";
import { isAdminAuthed } from "@/lib/admin-auth";

/**
 * Resets the 3 dashboard stat cards (Devis générés, Artisans uniques,
 * Volume TTC total) to zero WITHOUT deleting or altering any devis row —
 * it just records a new reset_at cutoff; the cards then only count devis
 * created after that point. The current totals are snapshotted first so
 * nothing is lost.
 */
export async function POST() {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createSupabaseAdmin();

  const { data: reset } = await admin.from("admin_stats_reset").select("reset_at").eq("id", 1).maybeSingle();
  const since = reset?.reset_at ?? null;

  let query = admin.from("devis").select("artisan_name, artisan_email, total_ttc");
  if (since) query = query.gt("created_at", since);
  const { data: devis, error: devisError } = await query;

  if (devisError) {
    return NextResponse.json({ error: devisError.message }, { status: 500 });
  }

  const rows = devis ?? [];
  const artisansCount = new Set(rows.map((d) => d.artisan_email ?? d.artisan_name)).size;
  const volumeTtc = rows.reduce((sum, d) => sum + (d.total_ttc ?? 0), 0);

  const { error: snapshotError } = await admin.from("admin_stats_snapshots").insert({
    devis_count: rows.length,
    artisans_count: artisansCount,
    volume_ttc: volumeTtc,
  });
  if (snapshotError) {
    return NextResponse.json({ error: snapshotError.message }, { status: 500 });
  }

  const { error: resetError } = await admin
    .from("admin_stats_reset")
    .upsert({ id: 1, reset_at: new Date().toISOString() });
  if (resetError) {
    return NextResponse.json({ error: resetError.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
