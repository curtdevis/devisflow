import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import LogoutButton from "../LogoutButton";

interface InvoiceRow {
  id: string;
  invoice_number: string;
  created_at: string;
  status: string;
  paid_at: string | null;
  devis_id: string;
  devis: {
    client_name: string;
    client_email: string | null;
    total_ttc: number;
  } | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: "En attente", color: "#b45309", bg: "#fef3c7" },
  paid: { label: "Payée", color: "#065f46", bg: "#d1fae5" },
  overdue: { label: "En retard", color: "#991b1b", bg: "#fee2e2" },
};

export default async function FacturesPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase.from("profiles").select("full_name").eq("id", user.id).single();

  const { data: invoices } = await createSupabaseAdmin()
    .from("invoices")
    .select("id, invoice_number, created_at, status, paid_at, devis_id, devis!devis_id(client_name, client_email, total_ttc)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  const list = (invoices ?? []) as unknown as InvoiceRow[];
  const totalPaid = list.filter(i => i.status === "paid").reduce((s, i) => s + (i.devis?.total_ttc ?? 0), 0);
  const totalPending = list.filter(i => i.status === "pending").reduce((s, i) => s + (i.devis?.total_ttc ?? 0), 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">{profile?.full_name ?? user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { href: "/dashboard", label: "Devis" },
            { href: "/dashboard/factures", label: "Factures", active: true },
            { href: "/dashboard/clients", label: "Clients" },
          ].map(n => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${n.active ? "text-white" : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"}`}
              style={n.active ? { backgroundColor: "var(--navy)" } : {}}>
              {n.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>Mes factures</h1>
            <p className="text-gray-500 text-sm mt-1">{list.length} facture{list.length !== 1 ? "s" : ""} générée{list.length !== 1 ? "s" : ""}</p>
          </div>
          <Link href="/devis" className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl shadow transition-transform hover:scale-105" style={{ backgroundColor: "var(--orange)" }}>
            + Nouveau devis
          </Link>
        </div>

        {/* Stats */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Factures émises", value: list.length },
            { label: "Montant payé", value: `${totalPaid.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €` },
            { label: "En attente", value: `${totalPending.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €` },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-lg" style={{ color: "var(--navy)" }}>Historique des factures</h2>
          </div>
          {list.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🧾</p>
              <p className="font-semibold">Aucune facture pour l&apos;instant</p>
              <p className="text-sm mt-1">Convertissez un devis accepté en facture depuis votre tableau de bord.</p>
              <Link href="/dashboard" className="inline-block mt-4 text-sm font-bold px-5 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--orange)" }}>
                Voir mes devis →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-6 py-3">N° Facture</th>
                    <th className="text-left px-3 py-3">Date</th>
                    <th className="text-left px-3 py-3">Client</th>
                    <th className="text-right px-3 py-3">Montant TTC</th>
                    <th className="text-center px-3 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((inv, i) => {
                    const st = STATUS_LABELS[inv.status] ?? STATUS_LABELS.pending;
                    return (
                      <tr key={inv.id} className={`border-b border-gray-50 ${i % 2 === 0 ? "hover:bg-gray-50" : "bg-gray-50/40 hover:bg-gray-50"}`}>
                        <td className="px-6 py-4 font-mono text-xs font-bold" style={{ color: "var(--navy)" }}>{inv.invoice_number}</td>
                        <td className="px-3 py-4 text-gray-500">{new Date(inv.created_at).toLocaleDateString("fr-FR")}</td>
                        <td className="px-3 py-4">
                          <p className="font-semibold" style={{ color: "var(--navy)" }}>{inv.devis?.client_name ?? "—"}</p>
                          {inv.devis?.client_email && <p className="text-xs text-gray-400">{inv.devis.client_email}</p>}
                        </td>
                        <td className="px-3 py-4 text-right font-bold" style={{ color: "var(--navy)" }}>
                          {(inv.devis?.total_ttc ?? 0).toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                        </td>
                        <td className="px-3 py-4 text-center">
                          <span className="inline-block text-xs font-bold px-3 py-1 rounded-full" style={{ color: st.color, backgroundColor: st.bg }}>
                            {st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
