import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import LogoutButton from "../LogoutButton";
import TeamManager from "./TeamManager";

export default async function TeamPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, plan, tier")
    .eq("id", user.id)
    .single<{ full_name: string | null; plan: string | null; tier: string | null }>();

  const isIntermediaire = profile?.plan === "paid" && profile?.tier === "intermediaire";

  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-blue-200 text-sm hidden sm:block">{profile?.full_name ?? user.email}</span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        {/* Nav */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { href: "/dashboard", label: "Devis" },
            { href: "/dashboard/factures", label: "Factures" },
            { href: "/dashboard/clients", label: "Clients" },
            { href: "/dashboard/team", label: "Équipe", active: true },
            { href: "/account", label: "Mon compte" },
          ].map(n => (
            <Link key={n.href} href={n.href}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${n.active ? "text-white" : "text-gray-600 bg-white border border-gray-200 hover:bg-gray-50"}`}
              style={n.active ? { backgroundColor: "var(--navy)" } : {}}>
              {n.label}
            </Link>
          ))}
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>Mon équipe</h1>
          <p className="text-gray-500 text-sm mt-1">
            Invitez jusqu&apos;à 2 collaborateurs — leurs devis et clients rejoignent votre espace, sans essai ni abonnement séparé.
          </p>
        </div>

        {isIntermediaire ? (
          <TeamManager />
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-3xl mb-3">👥</p>
            <h2 className="font-bold text-lg mb-2" style={{ color: "var(--navy)" }}>
              Fonctionnalité réservée au plan Intermédiaire
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
              Passez à l&apos;abonnement Intermédiaire (79 €/mois) pour inviter votre équipe et partager vos devis, clients et export comptable.
            </p>
            <Link
              href="/#tarifs"
              className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl shadow transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Voir les abonnements →
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
