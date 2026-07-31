"use client";

import { useEffect, useState } from "react";

interface CampaignRow {
  source: string;
  medium: string;
  campaign: string;
  visits: number;
  signups: number;
}

interface IdentifiedClick {
  visitedAt: string;
  path: string;
  city: string | null;
  country: string | null;
  companyName: string | null;
  email: string | null;
  category: string | null;
  likelyBot: boolean;
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState<CampaignRow[] | null>(null);
  const [clicks, setClicks] = useState<IdentifiedClick[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [campaignsRes, clicksRes] = await Promise.all([
          fetch("/api/admin/campaigns"),
          fetch("/api/admin/campaigns/identified-clicks"),
        ]);
        if (campaignsRes.ok) {
          const data = await campaignsRes.json();
          if (!cancelled) setCampaigns(data.campaigns ?? []);
        }
        if (clicksRes.ok) {
          const data = await clicksRes.json();
          if (!cancelled) setClicks(data.clicks ?? []);
        }
      } catch {
        // Silent — table just keeps its last known data.
      }
    }
    load();
    const interval = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl shadow overflow-hidden mb-6 sm:mb-8">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-100">
        <h2 className="font-bold text-[#1e3a5f]">Campagnes (prospection, Instagram, …)</h2>
        <p className="text-xs text-gray-400 mt-1">
          Visites et inscriptions par source de trafic taguée (paramètres utm_source/medium/campaign) — 90 derniers jours
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left px-4 py-3">Source</th>
              <th className="text-left px-4 py-3">Support</th>
              <th className="text-left px-4 py-3">Campagne</th>
              <th className="text-right px-4 py-3">Visites</th>
              <th className="text-right px-4 py-3">Inscriptions</th>
              <th className="text-right px-4 py-3">Taux</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {campaigns === null ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
            ) : campaigns.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Pas encore de trafic tagué — ajoute utm_source/utm_medium/utm_campaign aux liens de tes campagnes pour les voir ici
                </td>
              </tr>
            ) : (
              campaigns.map((c) => {
                const rate = c.visits > 0 ? (c.signups / c.visits) * 100 : 0;
                return (
                  <tr key={`${c.source}-${c.medium}-${c.campaign}`} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-[#1e3a5f]">{c.source}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.medium}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{c.campaign}</td>
                    <td className="px-4 py-3 text-right">{c.visits}</td>
                    <td className="px-4 py-3 text-right font-semibold text-[#f97316]">{c.signups}</td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">{rate.toFixed(1)}%</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-4 sm:px-6 py-4 border-t border-b border-gray-100">
        <h2 className="font-bold text-[#1e3a5f]">Qui a cliqué (prospection)</h2>
        <p className="text-xs text-gray-400 mt-1">
          Clics identifiés nominativement grâce au lien de suivi unique par email envoyé — 90 derniers jours
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
              <th className="text-left px-4 py-3">Quand</th>
              <th className="text-left px-4 py-3">Entreprise</th>
              <th className="text-left px-4 py-3">Email</th>
              <th className="text-left px-4 py-3">Métier</th>
              <th className="text-left px-4 py-3">Ville</th>
              <th className="text-left px-4 py-3">Page</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {clicks === null ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Chargement…</td></tr>
            ) : clicks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Aucun clic identifié pour l&apos;instant — les emails envoyés avant la mise en place du suivi nominatif ne sont pas rattachables
                </td>
              </tr>
            ) : (
              clicks.map((c, i) => (
                <tr key={i} className={`hover:bg-gray-50 transition-colors ${c.likelyBot ? "opacity-40" : ""}`}>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {new Date(c.visitedAt).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}
                  </td>
                  <td className="px-4 py-3 font-medium text-[#1e3a5f]">
                    {c.companyName ?? <span className="text-gray-400">Non rattaché</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.email ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.category ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{c.city ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {c.path}
                    {c.likelyBot && <span className="ml-2 text-orange-500">(probablement un scan auto)</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
