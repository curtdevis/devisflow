import { redirect } from "next/navigation";
import { createSupabaseServer, createSupabaseAdmin } from "@/lib/supabase-server";
import InvitationsClient from "../_components/InvitationsClient";

export type Invitation = {
  id: string;
  token: string;
  email: string;
  agence_name: string;
  accepted_at: string | null;
  created_at: string;
};

export default async function InvitationsPage() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const admin = createSupabaseAdmin();

  const { data: profile } = await admin
    .from("profiles")
    .select("full_name, company_name")
    .eq("id", user.id)
    .single<{ full_name: string | null; company_name: string | null }>();

  const agenceName = profile?.company_name ?? profile?.full_name ?? "Notre agence";

  const { data: invitations } = await admin
    .from("agence_invitations")
    .select("id, token, email, agence_name, accepted_at, created_at")
    .eq("agence_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  const invitationList = (invitations ?? []) as Invitation[];

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-gray-900">Invitations</h1>
        <p className="text-gray-500 text-sm mt-1">
          Invitez vos artisans à rejoindre votre espace agence
        </p>
      </div>
      <InvitationsClient
        invitations={invitationList}
        agenceId={user.id}
        agenceName={agenceName}
      />
    </div>
  );
}
