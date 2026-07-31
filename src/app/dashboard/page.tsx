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
import { isTrialExpired, trialDaysLeft } from "@/lib/trial";

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

  // Intermédiaire team members share the owner's workspace — everything they
  // read is the owner's data, same attribution used when writing (generate-devis).
  const effectiveOwnerId = profile?.member_of ?? user.id;

  // A team member's own profile is never itself paid — the plan/tier that
  // actually grants access lives on the owner's profile. Resolve once and
  // reuse for every plan-gated feature below. Deliberately does NOT fall
  // back to agence_id coverage — export comptable is not part of the
  // Cabinet & Groupement per-artisan bundle, only Intermédiaire's.
  let accessPlan = profile?.plan ?? null;
  let accessTier = profile?.tier ?? null;
  if (profile?.member_of) {
    const { data: ownerProfile } = await createSupabaseAdmin()
      .from("profiles")
      .select("plan, tier")
      .eq("id", profile.member_of)
      .single<{ plan: string | null; tier: string | null }>();
    accessPlan = ownerProfile?.plan ?? null;
    accessTier = ownerProfile?.tier ?? null;
  }

  // Separate from accessPlan above: only answers "is someone else already
  // paying for this account", for the trial/upgrade banner below. Unlike
  // accessPlan it DOES include agence_id coverage — an artisan linked to a
  // paid Cabinet & Groupement account has no trial clock either (see
  // coveredByAgence in generate-devis/route.ts) and must not be told their
  // trial is ending when it was never running.
  let trialCovered = accessPlan === "paid";
  if (!trialCovered && profile?.agence_id) {
    const { data: agenceProfile } = await createSupabaseAdmin()
      .from("profiles")
      .select("plan")
      .eq("id", profile.agence_id)
      .single<{ plan: string | null }>();
    trialCovered = agenceProfile?.plan === "paid";
  }

  // Export comptable détaillé (HT / TVA / TTC) is exclusive to paid Intermediaire/Agence tiers.
  const canExportComptable = accessPlan === "paid" && (accessTier === "intermediaire" || accessTier === "agence");

  // Team management ("multi-utilisateurs") nav entry — owner only (Intermédiaire).
  // Team members never manage the team themselves, only the paying owner does.
  const isIntermediaire = profile?.plan === "paid" && profile?.tier === "intermediaire";

  // Use admin client to bypass RLS — server-side only, user already verified above
  // Try full query with result_json first; fall back without it if the column doesn't exist yet
  const { data: devisData, error: devisError } = await createSupabaseAdmin()
    .from("devis")
    .select(
      "id, created_at, devis_number, artisan_name, artisan_email, artisan_siret, client_name, client_email, total_ttc, profession, result_json, signed_at, status, refusal_reason"
    )
    .eq("user_id", effectiveOwnerId)
    .order("created_at", { ascending: false })
    .limit(200);
  let devis = devisData;

  if (devisError) {
    const fallback = await createSupabaseAdmin()
      .from("devis")
      .select(
        "id, created_at, devis_number, artisan_name, artisan_email, artisan_siret, client_name, client_email, total_ttc, profession, signed_at, status, refusal_reason"
      )
      .eq("user_id", effectiveOwnerId)
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

  // Trial banner state — computed once here rather than inline in JSX
  // (Date.now() must not be called during render).
  const trialExpired = isTrialExpired(user.created_at, profile?.trial_days);
  const daysLeft = trialDaysLeft(user.created_at, profile?.trial_days);
  const trialUrgent = trialExpired || daysLeft <= 1;

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
            ...(isIntermediaire ? [{ href: "/dashboard/team", label: "Équipe" }] : []),
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

        {/* Trial / upgrade banner for free, uncovered users */}
        {!trialCovered && (
          <div className={`mb-6 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${trialUrgent ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-100"}`}>
            <div>
              <p className="font-bold text-sm" style={{ color: trialUrgent ? "#b91c1c" : "#9a3412" }}>
                {trialExpired
                  ? "⛔ Essai gratuit terminé"
                  : daysLeft <= 1
                  ? "⚠️ Dernier jour d'essai gratuit"
                  : `⏳ Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#78350f" }}>
                {trialExpired
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
        )}

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
              <div className="flex items-center gap-2">
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
                {canExportComptable ? (
                  <a
                    href="/api/devis/export?format=comptable"
                    download
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border transition-colors hover:bg-gray-50"
                    style={{ color: "var(--navy)", borderColor: "#1e3a5f" }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>
                      <path d="M9 12h4"/>
                    </svg>
                    Export comptable
                  </a>
                ) : (
                  <Link
                    href="/#tarifs"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl border border-dashed transition-colors hover:bg-orange-50"
                    style={{ color: "var(--orange)", borderColor: "var(--orange)" }}
                    title="Export comptable détaillé (HT / TVA / TTC) — disponible avec le plan Intermédiaire"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="10" rx="2"/>
                      <path d="M7 11V8a5 5 0 0 1 10 0v3"/>
                    </svg>
                    Export comptable — passer à Intermédiaire
                  </Link>
                )}
              </div>
            )}
          </div>
          <DevisTable devis={devisList} />
        </div>
      </main>
    </div>
  );
}
