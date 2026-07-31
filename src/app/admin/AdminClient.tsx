"use client";

import { useEffect, useMemo, useState } from "react";
import { getHtml, type DevisRow as BaseDevisRow } from "@/lib/devis-html";
import { printHtmlDocument } from "@/lib/print-html";
import { buildCsv } from "@/lib/csv-export";
import LiveActivity from "./LiveActivity";
import TrafficChart from "./TrafficChart";
import PageEngagement from "./PageEngagement";
import Campaigns from "./Campaigns";

type DevisRow = BaseDevisRow & { artisan_phone: string | null };

interface AgenceRow {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  plan: string | null;
  tier: string | null;
  created_at: string;
}

interface AccountRow {
  id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  account_type: string;
  plan: string | null;
  tier: string | null;
  profession: string | null;
  created_at: string;
  suspended: boolean | null;
}

const TIER_LABEL: Record<string, string> = { solo: "Solo", intermediaire: "Intermédiaire", agence: "Agence" };
const TIER_MRR: Record<string, number> = { solo: 29, intermediaire: 79, agence: 0 };

interface ClientRow {
  id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  created_at: string;
}

type DateFilter = "all" | "week" | "month";
type AccountTypeFilter = "all" | "artisan" | "agence";
type AccountStatusFilter = "all" | "active" | "suspended" | "trial_expired";

const TRIAL_DAYS = 7;

function isTrialExpired(account: AccountRow): boolean {
  if (account.plan === "paid") return false;
  const daysSince = (Date.now() - new Date(account.created_at).getTime()) / (1000 * 60 * 60 * 24);
  return daysSince > TRIAL_DAYS;
}

function startOfWeek(now: Date): Date {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const day = d.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diffToMonday);
  return d;
}

function startOfMonth(now: Date): Date {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function downloadCsv(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

interface StatsSnapshot {
  id: string;
  devis_count: number;
  artisans_count: number;
  volume_ttc: number;
  created_at: string;
}

export default function AdminClient({
  devis,
  userCount,
  agences,
  statsResetAt,
  accounts,
  allClients,
}: {
  devis: DevisRow[];
  userCount: number;
  agences: AgenceRow[];
  statsResetAt: string | null;
  accounts: AccountRow[];
  allClients: ClientRow[];
}) {
  const [agenceList, setAgenceList] = useState(agences);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [accountList, setAccountList] = useState(accounts);
  const [accountSearch, setAccountSearch] = useState("");
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountTypeFilter>("all");
  const [accountStatusFilter, setAccountStatusFilter] = useState<AccountStatusFilter>("all");
  const [pendingAccountId, setPendingAccountId] = useState<string | null>(null);
  const [clientSearch, setClientSearch] = useState("");
  const [liveVisitors, setLiveVisitors] = useState<number | null>(null);
  const [resetting, setResetting] = useState(false);
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [snapshots, setSnapshots] = useState<StatsSnapshot[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/admin/live-visitors");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setLiveVisitors(data.liveVisitors);
      } catch {
        // Silent — the widget just keeps showing the last known value.
      }
    }
    poll();
    const interval = setInterval(poll, 10_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  async function handleResetStats() {
    if (
      !confirm(
        "Réinitialiser les compteurs (Devis générés, Artisans uniques, Volume TTC) ? Les devis eux-mêmes ne sont pas touchés — les valeurs actuelles sont sauvegardées avant réinitialisation."
      )
    ) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/stats/reset", { method: "POST" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erreur lors de la réinitialisation.");
        return;
      }
      window.location.reload();
    } finally {
      setResetting(false);
    }
  }

  async function toggleSnapshots() {
    const next = !showSnapshots;
    setShowSnapshots(next);
    if (next && snapshots === null) {
      try {
        const res = await fetch("/api/admin/stats/snapshots");
        if (res.ok) {
          const data = await res.json();
          setSnapshots(data.snapshots ?? []);
        }
      } catch {
        setSnapshots([]);
      }
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  }

  async function setAgencePlan(id: string, plan: "paid" | "free") {
    setPendingId(id);
    try {
      const res = await fetch("/api/admin/agences/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, plan }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      setAgenceList((prev) => prev.map((a) => (a.id === id ? { ...a, plan } : a)));
    } finally {
      setPendingId(null);
    }
  }

  async function toggleAccountSuspended(id: string, suspended: boolean) {
    setPendingAccountId(id);
    try {
      const res = await fetch("/api/admin/accounts/suspend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, suspended }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error ?? "Erreur lors de la mise à jour.");
        return;
      }
      setAccountList((prev) => prev.map((a) => (a.id === id ? { ...a, suspended } : a)));
    } finally {
      setPendingAccountId(null);
    }
  }

  const filteredAccounts = useMemo(() => {
    const q = accountSearch.trim().toLowerCase();
    return accountList.filter((a) => {
      const matchSearch =
        !q ||
        (a.email ?? "").toLowerCase().includes(q) ||
        (a.full_name ?? "").toLowerCase().includes(q) ||
        (a.company_name ?? "").toLowerCase().includes(q);

      const matchType = accountTypeFilter === "all" || a.account_type === accountTypeFilter;

      const matchStatus =
        accountStatusFilter === "all"
          ? true
          : accountStatusFilter === "suspended"
          ? !!a.suspended
          : accountStatusFilter === "trial_expired"
          ? !a.suspended && isTrialExpired(a)
          : !a.suspended && !isTrialExpired(a);

      return matchSearch && matchType && matchStatus;
    });
  }, [accountList, accountSearch, accountTypeFilter, accountStatusFilter]);

  const filteredClients = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    if (!q) return allClients;
    return allClients.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.email ?? "").toLowerCase().includes(q) ||
        (c.phone ?? "").toLowerCase().includes(q) ||
        (c.address ?? "").toLowerCase().includes(q)
    );
  }, [allClients, clientSearch]);

  const filteredDevis = useMemo(() => {
    const q = search.trim().toLowerCase();
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);

    return devis.filter((d) => {
      const matchSearch =
        !q ||
        d.artisan_name?.toLowerCase().includes(q) ||
        (d.artisan_email ?? "").toLowerCase().includes(q) ||
        d.client_name.toLowerCase().includes(q) ||
        (d.client_email ?? "").toLowerCase().includes(q);

      const createdAt = new Date(d.created_at);
      const matchDate =
        dateFilter === "all"
          ? true
          : dateFilter === "week"
          ? createdAt >= weekStart
          : createdAt >= monthStart;

      return matchSearch && matchDate;
    });
  }, [devis, search, dateFilter]);

  function exportAllCsv() {
    const csv = buildCsv(
      ["Date", "Artisan", "Email artisan", "Téléphone", "Métier", "Client", "Email client", "Total TTC", "Statut", "Motif refus"],
      filteredDevis.map((d) => [
        new Date(d.created_at).toLocaleDateString("fr-FR"),
        d.artisan_name ?? "",
        d.artisan_email ?? "",
        d.artisan_phone ?? "",
        d.profession ?? "",
        d.client_name,
        d.client_email ?? "",
        d.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        d.signed_at ? "Signé" : d.status === "refused" ? "Refusé" : "En attente",
        d.refusal_reason ?? "",
      ])
    );
    const today = new Date().toISOString().slice(0, 10);
    downloadCsv(csv, `admin-devis-${today}.csv`);
  }

  // The 3 stat cards only count devis created after the last reset (if any);
  // the devis table below always shows everything, unaffected by resets.
  const statsDevis = statsResetAt ? devis.filter((d) => new Date(d.created_at) > new Date(statsResetAt)) : devis;
  const uniqueArtisans = new Set(statsDevis.map((d) => d.artisan_email ?? d.artisan_name)).size;
  const totalVolume = statsDevis.reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  // MRR breakdown by tier — solo/intermediaire are fixed self-serve prices,
  // agence is sold on quote (no fixed number to sum) so it's counted separately.
  const paidByTier = useMemo(() => {
    const counts: Record<string, number> = { solo: 0, intermediaire: 0, agence: 0 };
    for (const a of accountList) {
      if (a.plan !== "paid") continue;
      // account_type is always accurate and overrides tier here — the tier
      // column isn't guaranteed to be backfilled to "agence" for every agence
      // signup (it's only set for the self-serve LS checkout path).
      const t = a.account_type === "agence" ? "agence" : a.tier && a.tier in counts ? a.tier : "solo";
      counts[t]++;
    }
    return counts;
  }, [accountList]);
  const mrrSelfServe = paidByTier.solo * TIER_MRR.solo + paidByTier.intermediaire * TIER_MRR.intermediaire;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f]">Dashboard Admin</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Déconnexion
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div className="bg-white rounded-2xl shadow p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-gray-500 mb-1 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
              Visiteurs en ligne
            </p>
            <p className="text-2xl sm:text-3xl font-bold text-green-600">{liveVisitors ?? "—"}</p>
          </div>
          {[
            { label: "Devis générés", value: statsDevis.length, color: "#1e3a5f" },
            { label: "Artisans uniques", value: uniqueArtisans, color: "#f97316" },
            { label: "Utilisateurs total", value: userCount, color: "#10b981" },
            {
              label: "Volume TTC total",
              value: totalVolume.toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " €",
              color: "#6366f1",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl shadow p-4 sm:p-6">
              <p className="text-xs sm:text-sm text-gray-500 mb-1">{s.label}</p>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl shadow p-4 sm:p-6 mb-6 sm:mb-8">
          <p className="text-xs sm:text-sm text-gray-500 mb-3">MRR (revenu récurrent mensuel) — auto-service</p>
          <div className="flex flex-wrap items-end gap-6">
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: "#10b981" }}>
              {mrrSelfServe.toLocaleString("fr-FR")} €<span className="text-sm font-normal text-gray-400">/mois</span>
            </p>
            <div className="flex gap-4 text-xs sm:text-sm text-gray-500">
              <span><strong className="text-[#1e3a5f]">{paidByTier.solo}</strong> Solo (29€)</span>
              <span><strong className="text-[#1e3a5f]">{paidByTier.intermediaire}</strong> Intermédiaire (79€)</span>
              <span><strong className="text-[#1e3a5f]">{paidByTier.agence}</strong> Agence (sur devis, hors total)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-6 sm:mb-8 -mt-3 sm:-mt-5">
          {statsResetAt && (
            <p className="text-xs text-gray-400">
              Compteurs réinitialisés le{" "}
              {new Date(statsResetAt).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
          <button
            onClick={handleResetStats}
            disabled={resetting}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
          >
            {resetting ? "…" : "Réinitialiser les compteurs"}
          </button>
          <button
            onClick={toggleSnapshots}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-[#1e3a5f] transition-colors"
          >
            {showSnapshots ? "Masquer l'historique" : "Voir l'historique des réinitialisations"}
          </button>
        </div>

        {showSnapshots && (
          <div className="bg-white rounded-2xl shadow overflow-hidden mb-6 sm:mb-8">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
              <h2 className="font-bold text-[#1e3a5f]">Historique des réinitialisations</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="text-left px-4 py-3">Réinitialisé le</th>
                    <th className="text-right px-4 py-3">Devis générés</th>
                    <th className="text-right px-4 py-3">Artisans uniques</th>
                    <th className="text-right px-4 py-3">Volume TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {snapshots === null ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
                  ) : snapshots.length === 0 ? (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Aucune réinitialisation pour l&apos;instant</td></tr>
                  ) : (
                    snapshots.map((s) => (
                      <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(s.created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </td>
                        <td className="px-4 py-3 text-right font-medium text-[#1e3a5f]">{s.devis_count}</td>
                        <td className="px-4 py-3 text-right font-medium text-[#f97316]">{s.artisans_count}</td>
                        <td className="px-4 py-3 text-right font-medium text-[#6366f1]">
                          {s.volume_ttc.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mb-6 sm:mb-8">
          <LiveActivity />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6 sm:mb-8">
          <div className="lg:col-span-3 bg-white rounded-2xl shadow p-4 sm:p-6">
            <TrafficChart />
          </div>
          <div className="lg:col-span-2 bg-white rounded-2xl shadow p-4 sm:p-6">
            <PageEngagement />
          </div>
        </div>

        <Campaigns />

        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h2 className="font-bold text-[#1e3a5f]">Comptes Cabinet &amp; Groupement ({agenceList.length})</h2>
            <p className="text-xs text-gray-400">Vente sur devis — activez l&apos;accès après paiement confirmé</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3">Inscrit le</th>
                  <th className="text-left px-4 py-3">Cabinet</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agenceList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Aucun compte agence pour l&apos;instant
                    </td>
                  </tr>
                ) : (
                  agenceList.map((a) => {
                    const isPaid = a.plan === "paid";
                    return (
                      <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(a.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1e3a5f]">
                          {a.company_name ?? a.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{a.email}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              isPaid ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {isPaid ? "Actif" : "En attente"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          {isPaid ? (
                            <button
                              onClick={() => setAgencePlan(a.id, "free")}
                              disabled={pendingId === a.id}
                              className="text-xs font-semibold text-gray-500 hover:text-red-600 underline disabled:opacity-50"
                            >
                              Désactiver
                            </button>
                          ) : (
                            <button
                              onClick={() => setAgencePlan(a.id, "paid")}
                              disabled={pendingId === a.id}
                              className="text-xs font-bold text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                              style={{ backgroundColor: "#f97316" }}
                            >
                              {pendingId === a.id ? "…" : "Activer"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-[#1e3a5f]">
                Comptes utilisateurs ({filteredAccounts.length}{filteredAccounts.length !== accountList.length ? ` / ${accountList.length}` : ""})
              </h2>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="search"
                value={accountSearch}
                onChange={(e) => setAccountSearch(e.target.value)}
                placeholder="Rechercher par nom, email ou société…"
                className="flex-1 min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value as AccountTypeFilter)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">Tous les types</option>
                <option value="artisan">Artisan</option>
                <option value="agence">Agence</option>
              </select>
              <select
                value={accountStatusFilter}
                onChange={(e) => setAccountStatusFilter(e.target.value as AccountStatusFilter)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">Tous les statuts</option>
                <option value="active">Actif</option>
                <option value="trial_expired">Essai expiré</option>
                <option value="suspended">Suspendu</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3">Inscrit le</th>
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3">Type</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Plan</th>
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                      Aucun compte ne correspond à ces critères
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((a) => {
                    const suspended = !!a.suspended;
                    const expired = !suspended && isTrialExpired(a);
                    return (
                      <tr
                        key={a.id}
                        onClick={() => window.open(`/admin/comptes/${a.id}`, "_blank")}
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                          {new Date(a.created_at).toLocaleDateString("fr-FR", {
                            day: "2-digit", month: "2-digit", year: "2-digit",
                          })}
                        </td>
                        <td className="px-4 py-3 font-medium text-[#1e3a5f]">
                          {a.company_name ?? a.full_name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{a.email ?? "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                            {a.account_type === "agence" ? "Agence" : "Artisan"}
                          </span>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell text-gray-500 text-xs">
                          {a.plan === "paid"
                            ? a.account_type === "agence"
                              ? "Agence"
                              : (TIER_LABEL[a.tier ?? "solo"] ?? "Payant")
                            : "Gratuit"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                              suspended
                                ? "bg-red-100 text-red-700"
                                : expired
                                ? "bg-orange-100 text-orange-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {suspended ? "Suspendu" : expired ? "Essai expiré" : "Actif"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => toggleAccountSuspended(a.id, !suspended)}
                            disabled={pendingAccountId === a.id}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-lg disabled:opacity-50 ${
                              suspended
                                ? "text-white"
                                : "border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-red-600"
                            }`}
                            style={suspended ? { backgroundColor: "#10b981" } : {}}
                          >
                            {pendingAccountId === a.id ? "…" : suspended ? "Réactiver" : "Suspendre"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden mb-6 sm:mb-8">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-[#1e3a5f]">
                Tous les clients ({filteredClients.length}{filteredClients.length !== allClients.length ? ` / ${allClients.length}` : ""})
              </h2>
            </div>
            <input
              type="search"
              value={clientSearch}
              onChange={(e) => setClientSearch(e.target.value)}
              placeholder="Rechercher par nom, email, téléphone ou adresse…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
          </div>
          <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  <th className="text-left px-4 py-3">Ajouté le</th>
                  <th className="text-left px-4 py-3">Nom</th>
                  <th className="text-left px-4 py-3 hidden sm:table-cell">Email</th>
                  <th className="text-left px-4 py-3 hidden md:table-cell">Téléphone</th>
                  <th className="text-left px-4 py-3">Adresse</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredClients.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                      Aucun client ne correspond à ces critères
                    </td>
                  </tr>
                ) : (
                  filteredClients.map((c) => (
                    <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                        {new Date(c.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "2-digit", year: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1e3a5f]">{c.name}</td>
                      <td className="px-4 py-3 text-gray-500 hidden sm:table-cell text-xs">{c.email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-500 hidden md:table-cell text-xs">{c.phone ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600 text-xs">{c.address ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-gray-100 flex flex-col gap-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <h2 className="font-bold text-[#1e3a5f]">
                Tous les devis ({filteredDevis.length}{filteredDevis.length !== devis.length ? ` / ${devis.length}` : ""})
              </h2>
              <button
                onClick={exportAllCsv}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-[#1e3a5f] transition-colors"
              >
                ⬇ Exporter tout en CSV
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher par artisan, email ou client…"
                className="flex-1 min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
              />
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as DateFilter)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
              >
                <option value="all">Toutes les dates</option>
                <option value="week">Cette semaine</option>
                <option value="month">Ce mois</option>
              </select>
            </div>
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
                  <th className="text-left px-4 py-3">Statut</th>
                  <th className="text-right px-4 py-3">Total TTC</th>
                  <th className="text-right px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredDevis.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-400">
                      Aucun devis ne correspond à ces critères
                    </td>
                  </tr>
                ) : (
                  filteredDevis.map((d) => (
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
                      <td className="px-4 py-3">
                        {d.signed_at ? (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-100 text-green-700">Signé</span>
                        ) : d.status === "refused" ? (
                          <div>
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-700">Refusé</span>
                            {d.refusal_reason && (
                              <p className="text-xs text-gray-400 mt-1 max-w-[160px] truncate" title={d.refusal_reason}>
                                {d.refusal_reason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">En attente</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#f97316]">
                        {d.total_ttc.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => printHtmlDocument(getHtml(d))}
                          className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-500 hover:text-[#1e3a5f] transition-colors whitespace-nowrap"
                        >
                          Télécharger PDF
                        </button>
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
