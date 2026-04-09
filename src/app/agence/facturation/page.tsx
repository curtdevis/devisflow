import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";

export default async function FacturationPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, company_name, plan, lemon_squeezy_customer_portal")
    .eq("id", user.id)
    .single<{ full_name: string | null; company_name: string | null; plan: string | null; lemon_squeezy_customer_portal: string | null }>();

  const { data: artisans } = await admin
    .from("profiles")
    .select("id")
    .eq("agence_id", user.id);
  const artisanCount = (artisans ?? []).length;

  const { data: devisThisMonth } = await admin
    .from("devis")
    .select("id", { count: "exact", head: true })
    .in("user_id", (artisans ?? []).map((a: { id: string }) => a.id))
    .gte("created_at", new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString());

  const devisCount = (devisThisMonth as unknown as { count: number } | null)?.count ?? 0;

  const plan = (profile as { plan?: string } | null)?.plan ?? "free";
  const portalUrl = (profile as { lemon_squeezy_customer_portal?: string } | null)?.lemon_squeezy_customer_portal ?? "";

  const ARTISAN_LIMIT = 50;
  const DEVIS_LIMIT_PER_MONTH = 500;

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Facturation</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre abonnement et vos factures</p>
      </div>

      {/* Current plan */}
      <div
        className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #0d4f8b 100%)" }}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <span className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-white/20 mb-3">
                ABONNEMENT ACTIF
              </span>
              <h2 className="text-2xl font-extrabold mb-1">Cabinet &amp; Groupement</h2>
              <p className="text-blue-200 text-sm">Accès illimité au tableau de bord agence</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-extrabold">299 €</p>
              <p className="text-blue-300 text-sm">/ mois HT</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: "Artisans liés", value: `${artisanCount}/${ARTISAN_LIMIT}` },
              { label: "Devis ce mois", value: `${devisCount}/${DEVIS_LIMIT_PER_MONTH}` },
              { label: "Prochaine facturation", value: getNextBillingDate() },
            ].map((s) => (
              <div key={s.label} className="bg-white/10 rounded-xl p-3">
                <p className="text-xs text-blue-300 mb-1">{s.label}</p>
                <p className="font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {portalUrl ? (
              <a
                href={portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                style={{ color: "#1e3a5f" }}
              >
                Gérer mon abonnement →
              </a>
            ) : (
              <a
                href="https://app.lemonsqueezy.com/my-orders"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
                style={{ color: "#1e3a5f" }}
              >
                Gérer mon abonnement →
              </a>
            )}
            <a
              href="mailto:support@devis-flow.fr"
              className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-white/20 transition-colors"
            >
              Contacter le support
            </a>
          </div>
        </div>

        {/* Decorative */}
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute -right-8 -bottom-20 w-48 h-48 rounded-full bg-white/5" />
      </div>

      {/* Usage bars */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-5">Utilisation du plan</h3>
        <div className="space-y-5">
          <UsageBar
            label="Artisans liés"
            used={artisanCount}
            limit={ARTISAN_LIMIT}
            icon="👷"
          />
          <UsageBar
            label="Devis générés ce mois"
            used={devisCount}
            limit={DEVIS_LIMIT_PER_MONTH}
            icon="📋"
          />
        </div>
      </div>

      {/* Included features */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
        <h3 className="font-bold text-gray-900 mb-4">Inclus dans votre plan</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Tableau de bord agence complet",
            "Gestion de jusqu'à 50 artisans",
            "Tous les devis de tous vos artisans",
            "Rapports mensuels exportables",
            "Invitations par email illimitées",
            "Support prioritaire",
            "Conformité e-facture Factur-X",
            "Export CSV & PDF",
          ].map((f) => (
            <div key={f} className="flex items-center gap-2.5 text-sm text-gray-700">
              <span className="text-green-500 shrink-0">✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Invoice history placeholder */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-gray-900 mb-4">Historique des factures</h3>
        <div className="py-8 text-center">
          <p className="text-3xl mb-3">🧾</p>
          <p className="text-gray-500 text-sm mb-1">Les factures sont gérées par Lemon Squeezy</p>
          <p className="text-gray-400 text-xs mb-4">Accédez à votre portail client pour télécharger vos factures</p>
          <a
            href={portalUrl || "https://app.lemonsqueezy.com/my-orders"}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-semibold text-sm px-5 py-2.5 rounded-xl"
            style={{ backgroundColor: "#f97316" }}
          >
            Voir mes factures →
          </a>
        </div>
      </div>
    </div>
  );
}

function getNextBillingDate() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(1);
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function UsageBar({
  label,
  used,
  limit,
  icon,
}: {
  label: string;
  used: number;
  limit: number;
  icon: string;
}) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  const color = pct >= 90 ? "#ef4444" : pct >= 70 ? "#f97316" : "#10b981";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <span className="text-sm font-bold text-gray-900">
          {used} <span className="text-gray-400 font-normal">/ {limit}</span>
        </span>
      </div>
      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}
