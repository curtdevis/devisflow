import { NextResponse } from "next/server";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

interface DevisExportRow {
  devis_number: string | null;
  client_name: string;
  created_at: string;
  total_ttc: number;
  signed_at: string | null;
  client_email: string | null;
}

function escapeCsvField(value: string): string {
  // Prevent CSV injection: prefix formula-starting characters with a single quote.
  // Affected characters: = + - @ (all interpreted as formula starters by Excel/Calc).
  if (value.length > 0 && /^[=+\-@\t\r]/.test(value)) {
    value = "'" + value;
  }
  if (value.includes('"') || value.includes(",") || value.includes("\n") || value.includes(";")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
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

export async function GET() {
  // Auth check
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Non authentifié." }, { status: 401 });
  }

  // Fetch all devis for this user
  const { data: devis, error } = await createSupabaseAdmin()
    .from("devis")
    .select("devis_number, client_name, created_at, total_ttc, signed_at, client_email")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[devis/export] DB error:", error.message);
    return NextResponse.json({ error: "Erreur lors de la récupération des données." }, { status: 500 });
  }

  const rows = (devis ?? []) as DevisExportRow[];

  // Build CSV with UTF-8 BOM for Excel français
  const BOM = "\uFEFF";
  const SEPARATOR = ";"; // French Excel default

  const headers = ["Numéro", "Client", "Date", "Montant TTC", "Statut", "Email client"];
  const headerLine = headers.map(escapeCsvField).join(SEPARATOR);

  const dataLines = rows.map((row) => {
    const cols = [
      row.devis_number ?? "",
      row.client_name ?? "",
      formatDate(row.created_at),
      formatAmount(row.total_ttc),
      getStatus(row),
      row.client_email ?? "",
    ];
    return cols.map(escapeCsvField).join(SEPARATOR);
  });

  const csvContent = BOM + [headerLine, ...dataLines].join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
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
