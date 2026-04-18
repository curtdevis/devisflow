"use client";

interface DevisRow {
  id: string;
  created_at: string;
  artisan_name: string;
  artisan_email: string | null;
  artisan_phone: string | null;
  client_name: string;
  total_ttc: number;
  profession: string | null;
}

export default function AdminClient({
  devis,
  userCount,
}: {
  devis: DevisRow[];
  userCount: number;
}) {
  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  const uniqueArtisans = new Set(devis.map((d) => d.artisan_email ?? d.artisan_name)).size;
  const totalVolume = devis.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">Dashboard Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Devis générés", value: devis.length, color: "#1e3a5f" },
            { label: "Artisans uniques", value: uniqueArtisans, color: "#f97316" },
            { label: "Utilisateurs total", value: userCount, color: "#10b981" },
            {
              label: "Volume TTC total",
              value: totalVolume.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €",
              color: "#6366f1",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow p-6">
              <p className="text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-[#1e3a5f]">Tous les devis ({devis.length})</h2>
            <p className="text-xs text-gray-400">500 derniers</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">Artisan</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Métier</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-right px-4 py-3">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {devis.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {new Date(d.created_at).toLocaleDateString("fr-FR", {
                        day: "2-digit", month: "2-digit", year: "2-digit",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1e3a5f]">{d.artisan_name}</td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{d.artisan_email ?? "—"}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {d.profession ? (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{d.profession}</span>
                      ) : <span className="text-gray-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.client_name}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#f97316]">
                      {d.total_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
