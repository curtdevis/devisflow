"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const URL_ERROR_MESSAGES: Record<string, string> = {
  missing_code: "Connexion impossible. Réessayez.",
  auth_failed: "Connexion impossible. Réessayez.",
  account_suspended: "Votre compte a été suspendu. Contactez le support pour plus d'informations.",
};

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") || null;
  const urlError = params.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(urlError ? URL_ERROR_MESSAGES[urlError] ?? "" : "");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    const supabase = createSupabaseBrowser();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (authError) {
      setError("Connexion Google impossible pour le moment.");
      setGoogleLoading(false);
    }
    // On success, Supabase redirects to Google — no further action here.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createSupabaseBrowser();
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
      return;
    }

    // Read account_type from DB profile (source of truth) — user_metadata can be stale
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, suspended")
      .eq("id", data.user.id)
      .single();

    if (profile?.suspended) {
      await supabase.auth.signOut();
      setError("Votre compte a été suspendu. Contactez le support pour plus d'informations.");
      setLoading(false);
      return;
    }

    const accountType =
      (profile?.account_type as string | undefined) ??
      data.user?.user_metadata?.account_type;

    if (redirect === "checkout" && data.user) {
      fetch("/api/billing/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" })
        .then((res) => (res.ok ? res.json() : Promise.reject(res)))
        .then((body) => {
          if (body?.url) window.open(body.url, "_blank", "noopener,noreferrer");
          else throw new Error("no url");
        })
        .catch(() => {
          // Redirect to dashboard still happens below either way — the trial
          // banner there has its own working CheckoutButton to retry with.
          alert("Le paiement n'a pas pu s'ouvrir. Vous pouvez réessayer depuis votre tableau de bord.");
        });
      router.push(accountType === "agence" ? "/agence" : "/dashboard");
    } else {
      const dest = redirect || (accountType === "agence" ? "/agence" : "/dashboard");
      router.push(dest);
    }
    router.refresh();
  }

  const inputClass =
    "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm";

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--navy)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <p className="mt-2 text-blue-200 text-sm">
            Connectez-vous à votre espace
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Connexion</h1>

          {error && (
            <p className="mb-4 text-sm text-red-300 bg-red-500/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-blue-200 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm text-blue-200 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
              style={{ backgroundColor: "var(--orange)" }}
            >
              {loading ? "Connexion…" : "Se connecter →"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-blue-300">ou</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white py-3 text-sm font-semibold text-gray-700 transition-all hover:bg-gray-50 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.79 2.71v2.26h2.9c1.7-1.56 2.69-3.87 2.69-6.61z" />
              <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.71H.98v2.33C2.46 15.98 5.48 18 9 18z" />
              <path fill="#FBBC05" d="M3.95 10.71A5.4 5.4 0 0 1 3.68 9c0-.6.1-1.18.27-1.71V4.96H.98A9 9 0 0 0 0 9c0 1.45.35 2.83.98 4.04l2.97-2.33z" />
              <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.46 2.02.98 4.96l2.97 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
            </svg>
            {googleLoading ? "Connexion…" : "Continuer avec Google"}
          </button>

          <p className="mt-4 text-sm text-center">
            <Link
              href="/auth/reset-password"
              className="text-blue-300 hover:text-white transition-colors"
            >
              Mot de passe oublié ?
            </Link>
          </p>

          <p className="mt-5 text-sm text-center text-blue-300">
            Pas encore de compte ?{" "}
            <Link
              href="/auth/register"
              className="font-semibold text-white hover:underline"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
