import { redirect } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import LogoutButton from "./LogoutButton";
import CheckoutButton from "@/app/_components/CheckoutButton";
import DevisTable from "./DevisTable";
import type { DevisRow } from "@/lib/devis-html";
import UpgradeBanner from "./UpgradeBanner";

export default async function DashboardPage() {
  const supabase = await createSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // Use admin client to bypass RLS — server-side only, user already verified above
  // Try full query with result_json first; fall back without it if the column doesn't exist yet
  let { data: devis, error: devisError } = await createSupabaseAdmin()
    .from("devis")
    .select(
      "id, created_at, devis_number, artisan_name, artisan_email, artisan_siret, client_name, client_email, total_ttc, profession, result_json, signed_at, status, refusal_reason"
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (devisError) {
    const fallback = await createSupabaseAdmin()
      .from("devis")
      .select(
        "id, created_at, devis_number, artisan_name, artisan_email, artisan_siret, client_name, client_email, total_ttc, profession, signed_at, status, refusal_reason"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);
    devis = fallback.data as typeof devis;
  }

  const devisList = (devis ?? []) as DevisRow[];
  const totalTTC = devisList.reduce((s, d) => s + (d.total_ttc ?? 0), 0);
  const signedCount = devisList.filter((d) => d.signed_at).length;
  const conversionRate = devisList.length > 0 ? Math.round((signedCount / devisList.length) * 100) : 0;
  const avgTTC = devisList.length > 0 ? totalTTC / devisList.length : 0;

  // ── Analytics artisan ────────────────────────────────────────────────────────
  // CA total signé
  const caSigne = devisList
    .filter((d) => d.signed_at)
    .reduce((s, d) => s + (d.total_ttc ?? 0), 0);

  // Taux d'acceptation : signés / envoyés (tous les devis sont considérés envoyés)
  const sentCount = devisList.length;
  const tauxAcceptation = sentCount > 0 ? Math.round((signedCount / sentCount) * 100) : 0;

  // Délai moyen de signature (jours entre created_at et signed_at)
  const signedWithDelay = devisList.filter(
    (d) => d.signed_at && d.created_at
  );
  const delaiMoyen =
    signedWithDelay.length > 0
      ? Math.round(
          signedWithDelay.reduce((sum, d) => {
            const created = new Date(d.created_at).getTime();
            const signed = new Date(d.signed_at!).getTime();
            return sum + (signed - created) / (1000 * 60 * 60 * 24);
          }, 0) / signedWithDelay.length
        )
      : null;

  // Devis ce mois-ci
  const now = new Date();
  const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const devisCeMois = devisList.filter((d) => d.created_at >= firstOfMonth).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">
              {profile?.full_name ?? user.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Nav tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { href: "/dashboard", label: "Devis", active: true },
            { href: "/dashboard/factures", label: "Factures" },
            { href: "/dashboard/clients", label: "Clients" },
            { href: "/account", label: "Mon compte" },
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
            <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>
              Mon espace artisan
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Bonjour{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
            </p>
          </div>
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl shadow transition-transform hover:scale-105"
            style={{ backgroundColor: "var(--orange)" }}
          >
            + Nouveau devis
          </Link>
        </div>

        {/* Post-upgrade success banner */}
        <Suspense>
          <UpgradeBanner />
        </Suspense>

        {/* Trial / upgrade banner for free users */}
        {profile?.plan !== "paid" && (() => {
          const daysSince = (Date.now() - new Date(user!.created_at).getTime()) / (1000 * 60 * 60 * 24);
          const isExpired = daysSince > 7;
          const daysLeft = Math.max(0, Math.ceil(7 - daysSince));
          const urgent = isExpired || daysLeft <= 1;
          return (
            <div className={`mb-6 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${urgent ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-100"}`}>
              <div>
                <p className="font-bold text-sm" style={{ color: urgent ? "#b91c1c" : "#9a3412" }}>
                  {isExpired
                    ? "⛔ Essai gratuit terminé"
                    : daysLeft <= 1
                    ? "⚠️ Dernier jour d'essai gratuit"
                    : `⏳ Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#78350f" }}>
                  {isExpired
                    ? "Passez à Artisan Solo pour recommencer à générer des devis."
                    : "Passez à Artisan Solo pour continuer à utiliser DevisFlow après votre essai."}
                </p>
              </div>
              <CheckoutButton
                className="shrink-0 text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 text-center"
                style={{ backgroundColor: "#f97316" }}
              >
                Passer à Artisan Solo — 29 €/mois →
              </CheckoutButton>
            </div>
          );
        })()}

        {/* ── Analytics artisan ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: "CA total signé",
              value: caSigne > 0
                ? `${caSigne.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`
                : "—",
              sub: "devis acceptés",
            },
            {
              label: "Taux d'acceptation",
              value: sentCount > 0 ? `${tauxAcceptation} %` : "—",
              sub: `${signedCount} signé${signedCount > 1 ? "s" : ""} / ${sentCount} envoyé${sentCount > 1 ? "s" : ""}`,
            },
            {
              label: "Délai moyen signature",
              value: delaiMoyen !== null ? `${delaiMoyen} j` : "—",
              sub: delaiMoyen !== null ? "entre création et signature" : "aucune signature",
            },
            {
              label: "Devis ce mois-ci",
              value: String(devisCeMois),
              sub: now.toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
            },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
              <p className="text-xs text-gray-400 mb-1 leading-tight">{s.label}</p>
              <p className="text-2xl font-extrabold leading-tight" style={{ color: "var(--navy)" }}>
                {s.value}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Devis générés", value: String(devisList.length), sub: "total" },
            { label: "Devis signés", value: String(signedCount), sub: `sur ${devisList.length}` },
            { label: "Taux de conversion", value: `${conversionRate} %`, sub: devisList.length > 0 ? "acceptés" : "—" },
            {
              label: "Volume total TTC",
              value: `${totalTTC.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`,
              sub: "cumulé",
            },
            {
              label: "Panier moyen",
              value: avgTTC > 0 ? `${avgTTC.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €` : "—",
              sub: "par devis",
            },
            {
              label: "Dernier devis",
              value: devisList[0]
                ? new Date(devisList[0].created_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" })
                : "—",
              sub: devisList[0] ? new Date(devisList[0].created_at).getFullYear().toString() : "",
            },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm col-span-1">
              <p className="text-xs text-gray-400 mb-1 truncate">{s.label}</p>
              <p className="text-xl font-extrabold leading-tight" style={{ color: "var(--navy)" }}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>
            </div>
          ))}
        </div>

        {/* Devis table */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
            <h2 className="font-bold text-lg" style={{ color: "var(--navy)" }}>
              Mes devis
            </h2>
            {devisList.length > 0 && (
              <a
                href="/api/devis/export"
                download
                className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
                style={{ color: "var(--navy)", borderColor: "#1e3a5f" }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Exporter CSV
              </a>
            )}
          </div>
          <DevisTable devis={devisList} />
        </div>
      </main>
    </div>
  );
}
