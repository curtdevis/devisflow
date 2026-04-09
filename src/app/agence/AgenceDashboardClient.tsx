"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface ArtisanRow {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string;
  phone: string | null;
  siret: string | null;
  devisCount: number;
  lastActivity: string | null;
  isActive: boolean;
}

export interface DevisRow {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string;
  client_name: string;
  total_ttc: number;
  profession: string | null;
  user_id: string | null;
}

interface Props {
  artisans: ArtisanRow[];
  devis: DevisRow[];
}

export default function AgenceDashboardClient({ artisans, devis }: Props) {
  const router = useRouter();
  const [filterArtisanId, setFilterArtisanId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [confirmRemove, setConfirmRemove] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const filteredDevis = filterArtisanId
    ? devis.filter((d) => d.user_id === filterArtisanId)
    : devis;

  const selectedArtisan = artisans.find((a) => a.id === filterArtisanId);

  async function handleRemove(artisanId: string) {
    setRemoving(artisanId);
    setRemoveError(null);
    const res = await fetch("/api/agence/remove-artisan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ artisanId }),
    });
    setRemoving(null);
    if (res.ok) {
      setConfirmRemove(null);
      if (filterArtisanId === artisanId) setFilterArtisanId(null);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setRemoveError(data.error ?? "Erreur lors de la suppression.");
      setConfirmRemove(null);
    }
  }

  return (
    <div className="space-y-6">
      {removeError && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-sm text-red-600">
          {removeError}
        </div>
      )}

      {/* ── Artisans table ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold" style={{ color: "var(--navy)" }}>
            Artisans ({artisans.length})
          </h2>
        </div>

        {artisans.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <p className="text-4xl mb-2">👷</p>
            <p>Invitez des artisans pour commencer.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3">Nom / Société</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Email</th>
                  <th className="text-left px-4 py-3 hidden lg:table-cell">Téléphone</th>
                  <th className="text-center px-4 py-3">Devis</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Dernière activité</th>
                  <th className="text-center px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {artisans.map((a) => (
                  <tr
                    key={a.id}
                    className={`hover:bg-gray-50/70 transition-colors ${
                      filterArtisanId === a.id ? "bg-orange-50/60" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <p className="font-semibold" style={{ color: "var(--navy)" }}>
                        {a.full_name ?? "—"}
                      </p>
                      {a.company_name && (
                        <p className="text-xs text-gray-400 mt-0.5">{a.company_name}</p>
                      )}
                      {a.siret && (
                        <p className="text-xs text-gray-300 font-mono mt-0.5">
                          SIRET {a.siret}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">
                      {a.email}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">
                      {a.phone ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-bold" style={{ color: "var(--navy)" }}>
                      {a.devisCount}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden md:table-cell">
                      {a.lastActivity
                        ? new Date(a.lastActivity).toLocaleDateString("fr-FR")
                        : "Jamais"}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          a.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {a.isActive ? "Actif" : "Inactif"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            setFilterArtisanId(
                              filterArtisanId === a.id ? null : a.id
                            )
                          }
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors whitespace-nowrap"
                          style={
                            filterArtisanId === a.id
                              ? {
                                  borderColor: "var(--orange)",
                                  color: "var(--orange)",
                                  backgroundColor: "rgba(249,115,22,0.08)",
                                }
                              : { borderColor: "#d1d5db", color: "var(--navy)" }
                          }
                        >
                          {filterArtisanId === a.id ? "Tout voir" : "Ses devis"}
                        </button>

                        {confirmRemove === a.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleRemove(a.id)}
                              disabled={removing === a.id}
                              className="text-xs font-bold px-2 py-1.5 rounded-lg bg-red-500 text-white disabled:opacity-60 whitespace-nowrap"
                            >
                              {removing === a.id ? "…" : "Confirmer"}
                            </button>
                            <button
                              onClick={() => setConfirmRemove(null)}
                              className="text-xs px-2 py-1.5 rounded-lg text-gray-400 hover:text-gray-600"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmRemove(a.id)}
                            className="text-xs text-gray-300 hover:text-red-400 transition-colors px-1 py-1.5"
                            title="Retirer de l'agence"
                          >
                            Retirer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Recent devis feed ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold" style={{ color: "var(--navy)" }}>
            {selectedArtisan
              ? `Devis de ${selectedArtisan.full_name ?? selectedArtisan.email} (${filteredDevis.length})`
              : `20 derniers devis (tous artisans)`}
          </h2>
          {filterArtisanId && (
            <button
              onClick={() => setFilterArtisanId(null)}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              ← Tout afficher
            </button>
          )}
        </div>

        {filteredDevis.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            <p className="text-4xl mb-2">📋</p>
            <p>Aucun devis pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">N° devis</th>
                  <th className="text-left px-4 py-3">Artisan</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-right px-4 py-3">Total TTC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDevis.map((d) => {
                  const art = artisans.find((a) => a.id === d.user_id);
                  return (
                    <tr key={d.id} className="hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(d.created_at).toLocaleDateString("fr-FR")}
                      </td>
                      <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">
                        {d.devis_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium" style={{ color: "var(--navy)" }}>
                        {art?.full_name ?? d.artisan_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{d.client_name}</td>
                      <td
                        className="px-4 py-3 text-right font-bold whitespace-nowrap"
                        style={{ color: "var(--navy)" }}
                      >
                        {d.total_ttc.toLocaleString("fr-FR", {
                          minimumFractionDigits: 2,
                        })}{" "}
                        €
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
