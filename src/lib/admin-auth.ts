import { cookies } from "next/headers";

/** Shared admin gate for API routes — same admin_session cookie pattern as /admin itself. */
export async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get("admin_session");
  const adminPassword = process.env.ADMIN_PASSWORD;
  return !!adminPassword && session?.value === adminPassword;
}
