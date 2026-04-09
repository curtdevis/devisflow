"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { ArtisanFull } from "../artisans/page";

export default function ArtisansClient({
  artisans,
  agenceId,
}: {
  artisans: ArtisanFull[];
  agenceId: string;
}) {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [removing, setRemoving] = useState<string | null>(null);
  const [localList, setLocalList] = useState(artisans);

  const filtered = useMemo(() => {
    return localList.filter((a) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        a.full_name?.toLowerCase().includes(q) ||
        a.company_name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.profession?.toLowerCase().includes(q);
      const matchStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && a.isActive) ||
        (filterStatus === "inactive" && !a.isActive);
      return matchSearch && matchStatus;
    });
  }, [localList, search, filterStatus]);

  async function handleRemove(artisanId: string, name: string) {
    if (!confirm(`Retirer ${name} de votre agence ?`)) return;
    setRemoving(artisanId);
    try {
      const res = await fetch("/api/agence/remove-artisan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ artisanId }),
      });
      if (res.ok) {
        setLocalList((prev) => prev.filter((a) => a.id !== artisanId));
        toast.success(`${name} a été retiré de votre agence.`);
      } else {
        toast.error("Erreur lors de la suppression.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setRemoving(null);
    }
  }

  function exportCSV() {
    const header = ["Nom", "Entreprise", "Email", "Téléphone", "SIRET", "Profession", "Devis total", "Volume total TTC", "Dernière activité", "Statut"];
    const rows = filtered.map((a) => [
      a.full_name ?? "",
      a.company_name ?? "",
      a.email ?? "",
      a.phone ?? "",
      a.siret ?? "",
      a.profession ?? "",
      a.devisTotal,
      a.volumeTotal.toFixed(2),
      a.lastActivity ? new Date(a.lastActivity).toLocaleDateString("fr-FR") : "",
      a.isActive ? "Actif" : "Inactif",
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `artisans-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé.");
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un artisan..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status filter */}
        <div className="flex rounded-xl border border-gray-200 overflow-hidden bg-white">
          {(["all", "active", "inactive"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-2.5 text-sm font-medium transition-colors ${
                filterStatus === s ? "text-white" : "text-gray-500 hover:bg-gray-50"
              }`}
              style={filterStatus === s ? { backgroundColor: "#1e3a5f" } : {}}
            >
              {s === "all" ? "Tous" : s === "active" ? "Actifs" : "Inactifs"}
            </button>
          ))}
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0-3-3m3 3 3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          Export CSV
        </button>

        <Link
          href="/agence/invitations"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-semibold text-sm hover:opacity-90 transition-opacity shrink-0"
          style={{ backgroundColor: "#f97316" }}
        >
          + Inviter un artisan
        </Link>
      </div>

      {/* Count */}
      <p className="text-sm text-gray-500 mb-4">
        {filtered.length} artisan{filtered.length !== 1 ? "s" : ""}
        {search && ` pour "${search}"`}
      </p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <p className="text-4xl mb-3">👷</p>
          <p className="text-gray-500 font-medium mb-2">
            {search ? "Aucun artisan trouvé" : "Aucun artisan lié à votre agence"}
          </p>
          <p className="text-gray-400 text-sm mb-6">
            {search ? "Essayez une autre recherche." : "Invitez vos premiers artisans pour commencer."}
          </p>
          {!search && (
            <Link
              href="/agence/invitations"
              className="inline-flex items-center gap-2 text-white font-semibold px-5 py-2.5 rounded-xl"
              style={{ backgroundColor: "#f97316" }}
            >
              + Inviter un artisan
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((a) => (
            <ArtisanCard
              key={a.id}
              artisan={a}
              onRemove={() => handleRemove(a.id, a.full_name ?? a.email ?? "Artisan")}
              removing={removing === a.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ArtisanCard({
  artisan,
  onRemove,
  removing,
}: {
  artisan: ArtisanFull;
  onRemove: () => void;
  removing: boolean;
}) {
  const initial = (artisan.full_name ?? artisan.email ?? "A").charAt(0).toUpperCase();
  const colors = ["#1e3a5f", "#0d4f8b", "#1d4ed8", "#7c3aed", "#059669", "#dc2626"];
  const colorIdx = initial.charCodeAt(0) % colors.length;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
      {/* Header */}
      <div className="flex items-start gap-3 mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold shrink-0"
          style={{ backgroundColor: colors[colorIdx] }}
        >
          {initial}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 truncate">{artisan.full_name ?? "—"}</p>
          <p className="text-xs text-gray-500 truncate">{artisan.company_name ?? artisan.email ?? ""}</p>
          {artisan.profession && (
            <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium">
              {artisan.profession}
            </span>
          )}
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
            artisan.isActive
              ? "bg-green-50 text-green-700"
              : "bg-gray-100 text-gray-500"
          }`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${artisan.isActive ? "bg-green-500" : "bg-gray-400"}`} />
          {artisan.isActive ? "Actif" : "Inactif"}
        </span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-0.5">Devis ce mois</p>
          <p className="text-lg font-extrabold" style={{ color: "#1e3a5f" }}>{artisan.devisThisMonth}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <p className="text-xs text-gray-400 mb-0.5">Volume TTC</p>
          <p className="text-lg font-extrabold" style={{ color: "#f97316" }}>
            {artisan.volumeThisMonth > 0
              ? artisan.volumeThisMonth.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €"
              : "—"}
          </p>
        </div>
      </div>

      {/* Last activity */}
      {artisan.lastActivity && (
        <p className="text-xs text-gray-400 mb-4">
          Dernière activité :{" "}
          {new Date(artisan.lastActivity).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/agence/devis?artisan=${artisan.id}`}
          className="flex-1 text-center text-sm font-medium py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ color: "#1e3a5f" }}
        >
          Voir devis
        </Link>
        <button
          onClick={onRemove}
          disabled={removing}
          className="px-3 py-2 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Retirer de l'agence"
        >
          {removing ? (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
