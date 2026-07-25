import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import AgenceSidebar from "./_components/AgenceSidebar";
import AgenceHeader from "./_components/AgenceHeader";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
  title: "Espace Agence — DevisFlow",
};

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

  const admin = createSupabaseAdmin();

  let { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  // Profile missing — auto-create from user metadata (happens when email
  // confirmation is skipped or the /auth/callback round-trip was interrupted).
  // Never redirect to /auth/login here — that creates a proxy redirect loop.
  if (!profile) {
    const meta = user.user_metadata ?? {};
    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email!,
        full_name: meta.full_name ?? null,
        company_name: meta.full_name ?? null,
        account_type: (meta.account_type as string) === "agence" ? "agence" : "artisan",
        plan: "free",
      },
      { onConflict: "id" }
    );
    const { data: created } = await admin
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single<Profile>();
    profile = created;
  }

  // Still no profile after auto-create → DB issue, send to home (not /auth/login to avoid loop)
  if (!profile) redirect("/");

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

  // Right account type, but subscription not yet activated. Cabinet &
  // Groupement is sold "sur devis" (manual sales process) — access is
  // unlocked by an admin flipping `plan` to "paid" after the deal closes,
  // not by any self-serve checkout. See /admin for the activation panel.
  if (profile.plan !== "paid") {
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
            ⏳
          </div>
          <h1
            className="text-2xl font-extrabold mb-3"
            style={{ color: "#1e3a5f" }}
          >
            Compte en attente de validation
          </h1>
          <p className="text-gray-500 mb-2 text-sm leading-relaxed">
            Votre compte <strong>{profile.company_name ?? profile.full_name ?? user.email}</strong>{" "}
            a bien été créé. L&apos;accès au tableau de bord Cabinet &amp;
            Groupement s&apos;active une fois votre abonnement (299 €/mois)
            confirmé par notre équipe.
          </p>
          <p className="text-gray-400 text-sm mb-8">
            Vous n&apos;avez pas encore été contacté ? Écrivez-nous, nous
            activons généralement les comptes sous 24h.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:contact@devis-flow.fr"
              className="inline-flex items-center justify-center gap-2 font-bold text-sm px-6 py-3 rounded-xl text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#f97316" }}
            >
              Contacter l&apos;équipe
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
