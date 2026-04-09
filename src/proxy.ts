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

  // Refresh session — IMPORTANT: always use getUser() not getSession() in proxy
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const PROTECTED = ["/devis", "/dashboard", "/agence", "/account"];
  const AGENCE_ONLY = "/agence";
  const ARTISAN_ONLY = "/dashboard";

  // Unauthenticated → redirect to login
  if (PROTECTED.some((p) => pathname.startsWith(p)) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  if (user) {
    const accountType = user.user_metadata?.account_type as string | undefined;

    // Artisans trying to access agence dashboard → redirect to artisan dashboard
    if (pathname.startsWith(AGENCE_ONLY) && accountType !== "agence") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Agences trying to access artisan dashboard → redirect to agence dashboard
    if (pathname.startsWith(ARTISAN_ONLY) && accountType === "agence") {
      return NextResponse.redirect(new URL("/agence", request.url));
    }

    // Already logged in → skip auth pages (except /auth/callback)
    if (
      pathname.startsWith("/auth/") &&
      !pathname.startsWith("/auth/callback")
    ) {
      const dest = accountType === "agence" ? "/agence" : "/dashboard";
      return NextResponse.redirect(new URL(dest, request.url));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
