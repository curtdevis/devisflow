import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use in Server Components and Route Handlers */
export async function createSupabaseServer() {
  const store = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cs) => {
        try {
          cs.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Server Components cannot set cookies — only Route Handlers can
        }
      },
    },
  });
}

/** Bypasses Row Level Security — server-side only, never expose to browser */
export const createSupabaseAdmin = () =>
  createClient(URL, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

/** Cabinet & Groupement is sold "sur devis" (manual sales process, activated
 * from /admin) — API routes that perform agence actions (inviting artisans,
 * managing invitations) must check this directly, since the plan gate on
 * /agence/* only blocks page rendering, not the underlying routes. */
export async function requirePaidAgence(userId: string): Promise<boolean> {
  const admin = createSupabaseAdmin();
  const { data: profile } = await admin
    .from("profiles")
    .select("account_type, plan")
    .eq("id", userId)
    .single<{ account_type: string; plan: string | null }>();
  return profile?.account_type === "agence" && profile?.plan === "paid";
}

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  display_name: string | null;
  account_type: "artisan" | "agence";
  agence_id: string | null;
  member_of: string | null;
  company_name: string | null;
  siret: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  plan: string | null;
  tier: string | null;
  trial_days: number;
  lemon_squeezy_customer_portal: string | null;
  profession: string | null;
  updated_at: string | null;
};
