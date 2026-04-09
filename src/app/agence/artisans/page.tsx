import { redirect } from "next/navigation";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import ArtisansClient from "../_components/ArtisansClient";

export type ArtisanFull = {
  id: string;
  full_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  siret: string | null;
  profession: string | null;
  devisThisMonth: number;
  volumeThisMonth: number;
  devisTotal: number;
  volumeTotal: number;
  lastActivity: string | null;
  isActive: boolean;
};

export default async function ArtisansPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const { data: artisans } = await admin
    .from("profiles")
    .select("id, full_name, company_name, email, phone, siret, profession")
    .eq("agence_id", user.id)
    .order("full_name");

  const artisanList = (artisans ?? []) as (Pick<
    Profile,
    "id" | "full_name" | "company_name" | "email" | "phone" | "siret"
  > & { profession: string | null })[];

  const artisanIds = artisanList.map((a) => a.id);

  const { data: allDevis } =
    artisanIds.length > 0
      ? await admin
          .from("devis")
          .select("id, created_at, total_ttc, user_id")
          .in("user_id", artisanIds)
          .order("created_at", { ascending: false })
          .limit(1000)
      : { data: [] };

  type RawDevis = { id: string; created_at: string; total_ttc: number | null; user_id: string };
  const devisList = (allDevis ?? []) as RawDevis[];

  const artisansFull: ArtisanFull[] = artisanList.map((a) => {
    const own = devisList.filter((d) => d.user_id === a.id);
    const ownMonth = own.filter((d) => d.created_at >= monthStart);
    return {
      id: a.id,
      full_name: a.full_name,
      company_name: a.company_name,
      email: a.email,
      phone: a.phone,
      siret: a.siret,
      profession: a.profession,
      devisThisMonth: ownMonth.length,
      volumeThisMonth: ownMonth.reduce((s, d) => s + (d.total_ttc ?? 0), 0),
      devisTotal: own.length,
      volumeTotal: own.reduce((s, d) => s + (d.total_ttc ?? 0), 0),
      lastActivity: own.length > 0 ? own[0].created_at : null,
      isActive: own.some((d) => d.created_at >= thirtyDaysAgo),
    };
  });

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Mes artisans</h1>
          <p className="text-gray-500 text-sm mt-1">
            {artisansFull.length} artisan{artisansFull.length !== 1 ? "s" : ""} liés à votre agence
          </p>
        </div>
      </div>
      <ArtisansClient artisans={artisansFull} agenceId={user.id} />
    </div>
  );
}
