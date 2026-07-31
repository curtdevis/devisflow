import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import { buildCsv } from "@/lib/csv-export";

interface DevisExportRow {
  devis_number: string | null;
  client_name: string;
  created_at: string;
  total_ttc: number;
  signed_at: string | null;
  client_email: string | null;
}

// Accounting export adds HT/TVA/TTC columns sourced from result_json, which is
// the same JSON blob generate-devis/route.ts persists (subtotalHT, tvaRate,
// tvaAmount, totalTTC computed server-side at generation time — reliable, not
// re-derived here).
interface DevisExportRowComptable extends DevisExportRow {
  result_json: {
    subtotalHT?: number;
    tvaRate?: number;
    tvaAmount?: number;
    totalTTC?: number;
  } | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  return amount.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getStatus(row: DevisExportRow): string {
  if (row.signed_at) return "Signé";
  return "En attente";
}

export async function GET(req: NextRequest) {
  // Auth check
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  const format = req.nextUrl.searchParams.get("format");
  const isComptable = format === "comptable";

  const admin = createSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("plan, tier, member_of")
    .eq("id", user.id)
    .single<{ plan: string | null; tier: string | null; member_of: string | null }>();

  // Intermédiaire team members share the owner's workspace — export the
  // owner's devis, same attribution used everywhere else in the dashboard.
  const effectiveOwnerId = profile?.member_of ?? user.id;

  if (isComptable) {
    // Export comptable is exclusive to paid Intermediaire/Agence tiers — gate
    // server-side, never trust a query param alone to decide access. A team
    // member's own profile is never paid (member_of === null on the account
    // that pays) — check the effective owner's plan/tier instead, same as
    // the trial-coverage check in generate-devis/reminders.
    let accessTier = profile?.tier ?? null;
    let accessPlan = profile?.plan ?? null;
    if (profile?.member_of) {
      const { data: ownerProfile } = await admin
        .from("profiles")
        .select("plan, tier")
        .eq("id", profile.member_of)
        .single<{ plan: string | null; tier: string | null }>();
      accessPlan = ownerProfile?.plan ?? null;
      accessTier = ownerProfile?.tier ?? null;
    }
    const hasAccountingAccess = accessPlan === "paid" && (accessTier === "intermediaire" || accessTier === "agence");

    if (!hasAccountingAccess) {
      return NextResponse.json(
        { error: "L'export comptable détaillé (HT / TVA / TTC) est réservé aux plans Intermédiaire et Agence." },
        { status: 403 }
      );
    }
  }

  // Fetch all devis for this user. Always select result_json too — the
  // Supabase query builder needs a single literal select string to type
  // correctly, and the extra column is cheap; it's simply unused for the
  // basic (non-comptable) export below.
  const { data: devis, error } = await admin
    .from("devis")
    .select("devis_number, client_name, created_at, total_ttc, signed_at, client_email, result_json")
    .eq("user_id", effectiveOwnerId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[devis/export] DB error:", error.message);
    return NextResponse.json({ error: "Erreur lors de la récupération des données." }, { status: 500 });
  }

  const today = new Date().toISOString().slice(0, 10);

  if (isComptable) {
    const rows = (devis ?? []) as unknown as DevisExportRowComptable[];

    const csvContent = buildCsv(
      ["Numéro", "Client", "Date", "Montant HT", "Taux TVA", "Montant TVA", "Montant TTC", "Statut", "Email client"],
      rows.map((row) => {
        const rj = row.result_json;
        // Prefer the figures computed at generation time; total_ttc column is
        // always reliable as a fallback, HT/TVA are left blank rather than
        // guessed when the detail isn't available (older rows, edge cases).
        const montantHT = typeof rj?.subtotalHT === "number" ? formatAmount(rj.subtotalHT) : "";
        const tauxTva = typeof rj?.tvaRate === "number" ? `${rj.tvaRate}%` : "";
        const montantTva = typeof rj?.tvaAmount === "number" ? formatAmount(rj.tvaAmount) : "";
        const montantTTC = formatAmount(typeof rj?.totalTTC === "number" ? rj.totalTTC : row.total_ttc);

        return [
          row.devis_number ?? "",
          row.client_name ?? "",
          formatDate(row.created_at),
          montantHT,
          tauxTva,
          montantTva,
          montantTTC,
          getStatus(row),
          row.client_email ?? "",
        ];
      })
    );

    const filename = `devis-export-comptable-${today}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const rows = (devis ?? []) as DevisExportRow[];

  const csvContent = buildCsv(
    ["Numéro", "Client", "Date", "Montant TTC", "Statut", "Email client"],
    rows.map((row) => [
      row.devis_number ?? "",
      row.client_name ?? "",
      formatDate(row.created_at),
      formatAmount(row.total_ttc),
      getStatus(row),
      row.client_email ?? "",
    ])
  );

  const filename = `devis-export-${today}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
