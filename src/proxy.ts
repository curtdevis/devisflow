// Next.js 16: Middleware is now called Proxy (proxy.ts)
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — IMPORTANT: always use getUser() not getSession() in proxy.
  // A stale/invalid session cookie (e.g. after a Supabase JWT signing-key
  // rotation) makes getUser() reject with a raw GoTrue error instead of
  // returning { user: null } — treat that the same as "not authenticated"
  // instead of letting it break the request.
  let user = null;
  try {
    const { data } = await supabase.auth.getUser();
    user = data.user;
  } catch (err) {
    console.error("[proxy] session refresh failed, treating as unauthenticated:", err);
  }

  const { pathname } = request.nextUrl;

  const PROTECTED = ["/dashboard", "/agence", "/account"];
  const isProtectedDevis = pathname === "/devis" || pathname.startsWith("/devis/");
  const isProtected = isProtectedDevis || PROTECTED.some((p) => pathname.startsWith(p));

  // Unauthenticated → redirect to login
  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    const redirectRes = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
      redirectRes.cookies.set(name, value);
    });
    return redirectRes;
  }

  if (user) {
    const accountType = user.user_metadata?.account_type as string | undefined;

    // Already logged in → skip auth pages (except /auth/callback)
    if (
      pathname.startsWith("/auth/") &&
      !pathname.startsWith("/auth/callback")
    ) {
      const dest = accountType === "agence" ? "/agence" : "/dashboard";
      const redirectRes = NextResponse.redirect(new URL(dest, request.url));
      // Copy refreshed session cookies so the destination page can read the session
      supabaseResponse.cookies.getAll().forEach(({ name, value }) => {
        redirectRes.cookies.set(name, value);
      });
      return redirectRes;
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    // API routes handle their own auth (createSupabaseServer().auth.getUser()
    // inside each route) — none of the proxy's redirect logic below applies
    // to them, so they don't need to go through this session refresh at all.
    "/((?!api|_next/static|_next/image|favicon\\.ico|\\.well-known/workflow|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
