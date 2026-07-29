"use client";

import { useState } from "react";
import Link from "next/link";

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  account_type: string;
  plan: string | null;
  siret: string | null;
  phone: string | null;
  address: string | null;
  profession: string | null;
  avatar_url: string | null;
  agence_id: string | null;
  created_at: string;
  suspended: boolean | null;
  lemon_squeezy_customer_id: string | null;
}

interface DevisRow {
  id: string;
  created_at: string;
  devis_number: string | null;
  client_name: string;
  client_email: string | null;
  total_ttc: number;
  profession: string | null;
  signed_at: string | null;
  status: string | null;
}

const TRIAL_DAYS = 7;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatEuro(n: number) {
  return n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

export default function CompteClient({
  profile,
  devis,
  agenceName,
}: {
  profile: Profile;
  devis: DevisRow[];
  agenceName: string | null;
}) {
  const [suspended, setSuspended] = useState(!!profile.suspended);
  const [pending, setPending] = useState(false);

  const displayName = profile.company_name ?? profile.full_name ?? "—";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const totalGenerated = devis.length;
  const signedDevis = devis.filter((d) => !!d.signed_at);
  const totalSigned = signedDevis.length;
  const conversionRate = totalGenerated > 0 ? Math.round((totalSigned / totalGenerated) * 100) : 0;
  const totalVolumeAll = devis.reduce((s, d) => s + (d.total_ttc ?? 0), 0);
  const totalVolumeSigned = signedDevis.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  const daysSinceSignup = (Date.now() - new Date(profile.created_at).getTime()) / (1000 * 60 * 60 * 24);
  const trialExpired = profile.plan !== "paid" && daysSinceSignup > TRIAL_DAYS;

  let paymentLabel = "Payant actif";
  let paymentColor = "bg-green-100 text-green-700";
  if (profile.plan !== "paid") {
    if (trialExpired) {
      paymentLabel = "Impayé / essai expiré";
      paymentColor = "bg-red-100 text-red-700";
    } else {
      paymentLabel = "Essai en cours";
      paymentColor = "bg-orange-100 text-orange-700";
    }
  }

  async function toggleSuspended() {
    setPending(true);
    try {
      const res = await fetch("/api/admin/accounts/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: profile.id, suspended: !suspended }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      setSuspended((prev) => !prev);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 sm:p-6">
      <div className="max-w-5xl mx-auto">
        <Link href="/admin" className="text-sm text-gray-500 hover:text-gray-700 mb-4 inline-block">
          ← Retour au dashboard
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6 flex flex-col sm:flex-row sm:items-center gap-5 justify-between">
          <div className="flex items-center gap-4">
            {profile.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt={displayName} className="w-16 h-16 rounded-full object-cover border border-gray-100" />
            ) : (
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white shrink-0"
                style={{ backgroundColor: "#1e3a5f" }}
              >
                {initials || "?"}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-[#1e3a5f]">{displayName}</h1>
              <p className="text-sm text-gray-400">
                {profile.full_name && profile.company_name ? `${profile.full_name} · ` : ""}
                Inscrit le {formatDate(profile.created_at)}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  {profile.account_type === "agence" ? "Agence" : "Artisan"}
                </span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${paymentColor}`}>{paymentLabel}</span>
                {suspended && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Suspendu</span>
                )}
                {agenceName && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700">
                    Rattaché à {agenceName}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={toggleSuspended}
            disabled={pending}
            className={`text-sm font-semibold px-4 py-2.5 rounded-lg disabled:opacity-50 whitespace-nowrap ${
              suspended ? "text-white" : "border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-red-600"
            }`}
            style={suspended ? { backgroundColor: "#10b981" } : {}}
          >
            {pending ? "…" : suspended ? "Réactiver le compte" : "Suspendre le compte"}
          </button>
        </div>

        {/* Contact info */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h2 className="font-bold text-[#1e3a5f] mb-4">Coordonnées</h2>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Email</p>
              <p className="text-gray-700">{profile.email ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Téléphone</p>
              <p className="text-gray-700">{profile.phone ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Adresse</p>
              <p className="text-gray-700">{profile.address ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">SIRET</p>
              <p className="text-gray-700">{profile.siret ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Métier</p>
              <p className="text-gray-700">{profile.profession ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Client Lemon Squeezy</p>
              <p className="text-gray-700">{profile.lemon_squeezy_customer_id ?? "—"}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
          {[
            { label: "Devis générés", value: totalGenerated, color: "#1e3a5f" },
            { label: "Devis acceptés", value: `${totalSigned} (${conversionRate}%)`, color: "#10b981" },
            { label: "Volume total TTC", value: formatEuro(totalVolumeAll), color: "#6366f1" },
            { label: "Volume signé TTC", value: formatEuro(totalVolumeSigned), color: "#f97316" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-lg sm:text-2xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Devis list */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
            <h2 className="font-bold text-[#1e3a5f]">Historique des devis ({devis.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3">Date</th>
                  <th className="text-left px-4 py-3">N°</th>
                  <th className="text-left px-4 py-3">Client</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Métier</th>
                  <th className="text-right px-4 py-3">Total TTC</th>
                  <th className="text-right px-4 py-3">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {devis.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                      Aucun devis généré pour l&apos;instant
                    </td>
                  </tr>
                ) : (
                  devis.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">{formatDate(d.created_at)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs">{d.devis_number ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-700">{d.client_name}</td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        {d.profession ? (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{d.profession}</span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#f97316]">{formatEuro(d.total_ttc)}</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                            d.signed_at ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {d.signed_at ? "Signé" : "En attente"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
