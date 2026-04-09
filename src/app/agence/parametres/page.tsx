import { redirect } from "next/navigation";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import type { Profile } from "@/lib/supabase-server";
import ParametresClient from "../_components/ParametresClient";

export default async function ParametresPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, company_name, email, phone, siret, address")
    .eq("id", user.id)
    .single<Pick<Profile, "full_name" | "company_name" | "email" | "phone" | "siret" | "address">>();

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Paramètres</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre profil agence et vos préférences</p>
      </div>
      <ParametresClient
        userId={user.id}
        userEmail={user.email ?? ""}
        profile={{
          full_name: profile?.full_name ?? null,
          company_name: profile?.company_name ?? null,
          phone: profile?.phone ?? null,
          siret: profile?.siret ?? null,
          address: profile?.address ?? null,
        }}
      />
    </div>
  );
}
