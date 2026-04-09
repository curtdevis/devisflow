"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import type { AgenceDevisRow, ArtisanOption } from "../devis/page";

const PAGE_SIZE = 20;

export default function DevisTableClient({
  devis,
  artisanOptions,
}: {
  devis: AgenceDevisRow[];
  artisanOptions: ArtisanOption[];
}) {
  const searchParams = useSearchParams();
  const [search, setSearch] = useState("");
  const [artisanFilter, setArtisanFilter] = useState(searchParams.get("artisan") ?? "");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const a = searchParams.get("artisan");
    if (a) { setArtisanFilter(a); setShowFilters(true); }
  }, [searchParams]);

  const filtered = useMemo(() => {
    return devis.filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        d.client_name?.toLowerCase().includes(q) ||
        d.artisan_display.toLowerCase().includes(q) ||
        d.devis_number?.toLowerCase().includes(q);
      const matchArtisan = !artisanFilter || d.artisan_id === artisanFilter;
      const matchFrom = !dateFrom || d.created_at >= dateFrom;
      const matchTo = !dateTo || d.created_at.slice(0, 10) <= dateTo;
      const matchMin = !amountMin || (d.total_ttc ?? 0) >= parseFloat(amountMin);
      const matchMax = !amountMax || (d.total_ttc ?? 0) <= parseFloat(amountMax);
      return matchSearch && matchArtisan && matchFrom && matchTo && matchMin && matchMax;
    });
  }, [devis, search, artisanFilter, dateFrom, dateTo, amountMin, amountMax]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageData = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function resetFilters() {
    setSearch(""); setArtisanFilter(""); setDateFrom(""); setDateTo("");
    setAmountMin(""); setAmountMax(""); setPage(1);
  }

  function exportCSV() {
    const header = ["Date", "N° Devis", "Artisan", "Client", "Profession", "Montant TTC"];
    const rows = filtered.map((d) => [
      new Date(d.created_at).toLocaleDateString("fr-FR"),
      d.devis_number ?? "",
      d.artisan_display,
      d.client_name ?? "",
      d.profession ?? "",
      d.total_ttc?.toFixed(2) ?? "0",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devis-agence-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé.");
  }

  const totalFiltered = filtered.reduce((s, d) => s + (d.total_ttc ?? 0), 0);
  const hasFilters = !!(search || artisanFilter || dateFrom || dateTo || amountMin || amountMax);

  return (
    <div>
      {/* Search + filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher client, artisan, N° devis..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || hasFilters ? "border-orange-400 text-orange-600 bg-orange-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 12h12M10 20h4" />
          </svg>
          Filtres {hasFilters && <span className="w-2 h-2 rounded-full bg-orange-500" />}
        </button>
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4-4 4m0 0-4-4m4 4V4" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Advanced filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Artisan</label>
            <select
              value={artisanFilter}
              onChange={(e) => { setArtisanFilter(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            >
              <option value="">Tous les artisans</option>
              {artisanOptions.map((a) => (
                <option key={a.id} value={a.id}>{a.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date de début</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Date de fin</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Montant min (€)</label>
            <input
              type="number"
              value={amountMin}
              onChange={(e) => { setAmountMin(e.target.value); setPage(1); }}
              placeholder="0"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Montant max (€)</label>
            <input
              type="number"
              value={amountMax}
              onChange={(e) => { setAmountMax(e.target.value); setPage(1); }}
              placeholder="∞"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={resetFilters}
              className="w-full py-2 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      {/* Summary bar */}
      <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
        <span>{filtered.length} devis{hasFilters ? " filtrés" : ""}</span>
        {filtered.length > 0 && (
          <span className="font-semibold text-gray-700">
            Total : {totalFiltered.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € TTC
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {pageData.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">Aucun devis trouvé</p>
            {hasFilters && (
              <button onClick={resetFilters} className="mt-3 text-sm text-orange-500 hover:underline">
                Effacer les filtres
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Artisan</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Profession</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Montant TTC</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {pageData.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3.5 text-gray-600 whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-medium text-gray-900">{d.artisan_display}</p>
                        {d.devis_number && (
                          <p className="text-xs text-gray-400">{d.devis_number}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-gray-900">{d.client_name ?? "—"}</p>
                        {d.client_email && (
                          <p className="text-xs text-gray-400 truncate max-w-[200px]">{d.client_email}</p>
                        )}
                      </td>
                      <td className="px-4 py-3.5 hidden lg:table-cell">
                        {d.profession ? (
                          <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {d.profession}
                          </span>
                        ) : "—"}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span className="font-bold" style={{ color: "#1e3a5f" }}>
                          {d.total_ttc?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) ?? "—"} €
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <a
                          href={`/api/generate-devis?preview=${d.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                          style={{ color: "#1e3a5f" }}
                        >
                          Voir
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <div className="sm:hidden divide-y divide-gray-50">
              {pageData.map((d) => (
                <div key={d.id} className="px-4 py-3.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{d.client_name ?? "Client"}</p>
                      <p className="text-xs text-gray-500">{d.artisan_display}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(d.created_at).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <span className="font-bold text-sm shrink-0" style={{ color: "#1e3a5f" }}>
                      {d.total_ttc?.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) ?? "—"} €
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">
            Page {page} sur {totalPages} · {filtered.length} résultats
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              ← Précédent
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const start = Math.max(1, page - 2);
              const p = start + i;
              if (p > totalPages) return null;
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${
                    p === page ? "text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  style={p === page ? { backgroundColor: "#1e3a5f" } : {}}
                >
                  {p}
                </button>
              );
            })}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl border border-gray-200 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 transition-colors"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
