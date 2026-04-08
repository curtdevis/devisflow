import { createBrowserClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/** Use in "use client" components */
export const createSupabaseBrowser = () => createBrowserClient(URL, ANON);

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
