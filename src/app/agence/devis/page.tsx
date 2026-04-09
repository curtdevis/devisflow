import { redirect } from "next/navigation";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import { Suspense } from "react";
import DevisTableClient from "../_components/DevisTableClient";

export type AgenceDevisRow = {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string | null;
  artisan_id: string;
  artisan_display: string;
  client_name: string | null;
  client_email: string | null;
  total_ttc: number | null;
  profession: string | null;
};

export type ArtisanOption = { id: string; label: string };

export default async function AllDevisPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();

  const { data: artisans } = await admin
    .from("profiles")
    .select("id, full_name, company_name, email")
    .eq("agence_id", user.id)
    .order("full_name");

  type RawArtisan = Pick<Profile, "id" | "full_name" | "company_name" | "email">;
  const artisanList = (artisans ?? []) as RawArtisan[];
  const artisanIds = artisanList.map((a) => a.id);

  const artisanMap: Record<string, string> = {};
  artisanList.forEach((a) => {
    artisanMap[a.id] = a.company_name ?? a.full_name ?? a.email ?? "Artisan";
  });

  const { data: rawDevis } =
    artisanIds.length > 0
      ? await admin
          .from("devis")
          .select("id, created_at, devis_number, artisan_name, client_name, client_email, total_ttc, profession, user_id")
          .in("user_id", artisanIds)
          .order("created_at", { ascending: false })
          .limit(2000)
      : { data: [] };

  type RawDevis = {
    id: string;
    created_at: string;
    devis_number: string | null;
    artisan_name: string | null;
    client_name: string | null;
    client_email: string | null;
    total_ttc: number | null;
    profession: string | null;
    user_id: string;
  };

  const devisList: AgenceDevisRow[] = ((rawDevis ?? []) as RawDevis[]).map((d) => ({
    id: d.id,
    created_at: d.created_at,
    devis_number: d.devis_number,
    artisan_name: d.artisan_name,
    artisan_id: d.user_id,
    artisan_display: artisanMap[d.user_id] ?? d.artisan_name ?? "Artisan",
    client_name: d.client_name,
    client_email: d.client_email,
    total_ttc: d.total_ttc,
    profession: d.profession,
  }));

  const artisanOptions: ArtisanOption[] = artisanList.map((a) => ({
    id: a.id,
    label: a.company_name ?? a.full_name ?? a.email ?? "Artisan",
  }));

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Tous les devis</h1>
        <p className="text-gray-500 text-sm mt-1">
          {devisList.length} devis de tous vos artisans
        </p>
      </div>
      <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-2xl" />}>
        <DevisTableClient devis={devisList} artisanOptions={artisanOptions} />
      </Suspense>
    </div>
  );
}
