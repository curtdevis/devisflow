import { createBrowserClient, createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use in "use client" components */
export const createSupabaseBrowser = () => createBrowserClient(URL, ANON);

/** Use in Server Components and Route Handlers (cookies() is async in Next.js 16) */
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

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  account_type: "artisan" | "agence";
  agence_id: string | null;
  company_name: string | null;
  siret: string | null;
  phone: string | null;
  address: string | null;
};
