import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import AgenceSidebar from "./_components/AgenceSidebar";
import AgenceHeader from "./_components/AgenceHeader";
import { Toaster } from "sonner";

export default async function AgenceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

  // No profile at all — edge case (e.g. callback not yet run), send to login
  if (!profile) redirect("/auth/login");

  // Wrong account type: show a clear access-denied page instead of a silent redirect
  if (profile.account_type !== "agence") {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "#f9fafb" }}
      >
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl"
            style={{ backgroundColor: "#1e3a5f15" }}
          >
            🏢
          </div>
          <h1
            className="text-2xl font-extrabold mb-3"
            style={{ color: "#1e3a5f" }}
          >
            Espace réservé aux cabinets
          </h1>
          <p className="text-gray-500 mb-2 text-sm leading-relaxed">
            Cet espace est réservé aux <strong>cabinets comptables</strong> et{" "}
            <strong>groupements d&apos;artisans</strong> ayant souscrit au plan
            Cabinet &amp; Groupement (299 €/mois).
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Votre compte est de type <strong>Artisan</strong>. Rendez-vous sur
            votre tableau de bord artisan.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#f97316" }}
            >
              → Mon tableau de bord
            </Link>
            <a
              href="mailto:contact@devis-flow.fr"
              className="inline-flex items-center justify-center gap-2 font-semibold text-sm px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Passer au plan Cabinet
            </a>
          </div>
        </div>
      </div>
    );
  }

  const agenceName =
    profile.company_name ?? profile.full_name ?? "Mon Agence";

  return (
    <div className="min-h-screen bg-gray-50">
      <AgenceSidebar agenceName={agenceName} />
      <div className="lg:ml-60">
        <AgenceHeader
          agenceName={agenceName}
          userEmail={user.email ?? ""}
          userId={user.id}
        />
        <main className="pt-16 min-h-screen">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}
