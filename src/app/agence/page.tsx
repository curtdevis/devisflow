import { redirect } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { createSupabaseServer } from "@/lib/supabase-server";
import { KPICard, EmptyState } from "./_components/OverviewCards";
import { getOverviewData } from "./getOverviewData";

// recharts is heavy and only needed here — dynamic import keeps it out of
// the shared bundle that public marketing pages would otherwise inherit.
const OverviewClient = dynamic(() => import("./_components/OverviewClient"));

export default async function AgenceOverviewPage() {
  const supabase = await createSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login"); // layout already guards this, belt-and-suspenders

  const {
    artisanList,
    kpiDevisCount,
    kpiDevisPrev,
    kpiVolume,
    kpiVolumePrev,
    activeArtisansThisMonth,
    activeArtisansPrevMonth,
    kpiAcceptance,
    kpiAcceptancePrev,
    chartData,
    topArtisans,
    recentDevis,
    devisLast30Days,
  } = await getOverviewData(user.id);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Vue d&apos;ensemble</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <KPICard
          label="Artisans actifs"
          value={activeArtisansThisMonth}
          prev={activeArtisansPrevMonth}
          suffix={`/ ${artisanList.length}`}
          icon="👷"
          color="#1e3a5f"
        />
        <KPICard
          label="Devis ce mois"
          value={kpiDevisCount}
          prev={kpiDevisPrev}
          icon="📋"
          color="#f97316"
        />
        <KPICard
          label="Volume TTC"
          value={kpiVolume}
          prev={kpiVolumePrev}
          isCurrency
          icon="💰"
          color="#10b981"
        />
        <KPICard
          label="Taux d'acceptation"
          value={kpiAcceptance}
          prev={kpiAcceptancePrev}
          isPercent
          icon="✅"
          color="#6366f1"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-8">
        <Link
          href="/agence/invitations"
          className="inline-flex items-center gap-2 text-white font-semibold text-sm px-4 py-2.5 rounded-xl shadow-sm hover:opacity-90 transition-opacity"
          style={{ backgroundColor: "#f97316" }}
        >
          + Inviter un artisan
        </Link>
        <Link
          href="/agence/devis"
          className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ color: "#1e3a5f" }}
        >
          📋 Tous les devis
        </Link>
        <Link
          href="/agence/rapports"
          className="inline-flex items-center gap-2 font-semibold text-sm px-4 py-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
          style={{ color: "#1e3a5f" }}
        >
          📊 Exporter rapport
        </Link>
      </div>

      {/* Main grid */}
      <div className="grid xl:grid-cols-3 gap-6">
        {/* Chart (takes 2 cols) */}
        <div className="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-gray-900">Activité — 30 derniers jours</h2>
              <p className="text-xs text-gray-400 mt-0.5">Devis générés par jour</p>
            </div>
            <span className="text-sm font-semibold text-gray-500">
              {devisLast30Days} devis
            </span>
          </div>
          <OverviewClient chartData={chartData} />
        </div>

        {/* Top 5 artisans */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Top artisans</h2>
            <Link href="/agence/artisans" className="text-xs font-semibold hover:underline" style={{ color: "#f97316" }}>
              Voir tous →
            </Link>
          </div>
          {topArtisans.length === 0 ? (
            <EmptyState
              icon="👷"
              text="Aucun artisan actif ce mois-ci"
              action={{ href: "/agence/invitations", label: "Inviter un artisan" }}
            />
          ) : (
            <ol className="space-y-3">
              {topArtisans.map((a, idx) => (
                <li key={a.id} className="flex items-center gap-3">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0"
                    style={{
                      backgroundColor: idx === 0 ? "#f97316" : idx === 1 ? "#1e3a5f" : "#e5e7eb",
                      color: idx < 2 ? "#fff" : "#6b7280",
                    }}
                  >
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {a.full_name ?? a.email ?? "Artisan"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {a.devisThisMonth} devis · {a.volumeThisMonth.toLocaleString("fr-FR", { minimumFractionDigits: 0 })} €
                    </p>
                  </div>
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${a.isActive ? "bg-green-400" : "bg-gray-200"}`}
                  />
                </li>
              ))}
            </ol>
          )}
        </div>
      </div>

      {/* Recent activity */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-900">Activité récente</h2>
          <Link href="/agence/devis" className="text-xs font-semibold hover:underline" style={{ color: "#f97316" }}>
            Tous les devis →
          </Link>
        </div>
        {recentDevis.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-500 text-sm">Aucun devis généré pour l&apos;instant</p>
            <Link
              href="/agence/invitations"
              className="mt-4 inline-flex items-center gap-2 text-white font-semibold text-sm px-4 py-2 rounded-xl"
              style={{ backgroundColor: "#f97316" }}
            >
              Inviter des artisans →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentDevis.map((d) => {
              const artisan = artisanList.find((a) => a.id === d.user_id);
              return (
                <div key={d.id} className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ backgroundColor: "#1e3a5f" }}
                  >
                    {(artisan?.full_name ?? "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      Devis pour {d.client_name ?? "Client inconnu"}
                    </p>
                    <p className="text-xs text-gray-400">
                      par {artisan?.full_name ?? d.artisan_name ?? "Artisan"} · {d.profession ?? ""}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold" style={{ color: "#1e3a5f" }}>
                      {d.total_ttc?.toLocaleString("fr-FR", { minimumFractionDigits: 2 }) ?? "—"} €
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(d.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
