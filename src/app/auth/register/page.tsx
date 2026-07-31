"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { captureAttribution } from "@/lib/attribution";

function RegisterForm() {
  const params = useSearchParams();
  const inviteToken = params.get("invite");
  const redirectAfter = params.get("redirect");
  const typeParam = params.get("type");

  const [selectedAccountType, setAccountType] = useState<"artisan" | "agence">(
    typeParam === "agence" ? "agence" : "artisan"
  );
  // Invite token always forces an artisan account, regardless of the toggle below.
  const accountType = inviteToken ? "artisan" : selectedAccountType;
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [artisanCount, setArtisanCount] = useState("1");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteAgenceName, setInviteAgenceName] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleGoogleSignIn() {
    setError("");
    setGoogleLoading(true);
    const supabase = createSupabaseBrowser();
    const attribution = captureAttribution();
    const callbackUrl = new URL(`${window.location.origin}/auth/callback`);
    if (attribution.utm_source) callbackUrl.searchParams.set("utm_source", attribution.utm_source);
    if (attribution.utm_medium) callbackUrl.searchParams.set("utm_medium", attribution.utm_medium);
    if (attribution.utm_campaign) callbackUrl.searchParams.set("utm_campaign", attribution.utm_campaign);
    if (attribution.ref) callbackUrl.searchParams.set("ref", attribution.ref);
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl.toString() },
    });
    if (authError) {
      setError("Connexion Google impossible pour le moment.");
      setGoogleLoading(false);
    }
  }

  // If an invite token is present, lock account type to artisan and show agency name
  useEffect(() => {
    if (!inviteToken) return;
    async function resolveInvite() {
      const res = await fetch(`/api/invite-artisan?token=${inviteToken}`);
      if (res.ok) {
        const data = await res.json();
        setInviteAgenceName(data.agence_name ?? null);
        if (data.email) setEmail(data.email);
      }
    }
    resolveInvite();
  }, [inviteToken]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      setLoading(false);
      return;
    }

    const attribution = captureAttribution();
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email, password, fullName, accountType,
        inviteToken: inviteToken ?? null,
        redirectAfter: redirectAfter ?? null,
        artisanCount: accountType === "agence" ? artisanCount : null,
        ...attribution,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Erreur lors de la création du compte.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  }

  const inputClass =
    "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm";

  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ backgroundColor: "var(--navy)" }}
      >
        <div className="w-full max-w-md text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#f97316"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12c0 1.1.9 2 2 2h8" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              <path d="m16 19 2 2 4-4" />
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-3">
            Vérifiez votre email
          </h1>
          <p className="text-blue-200 mb-6">
            Un lien de confirmation a été envoyé à{" "}
            <strong className="text-white">{email}</strong>.<br />
            Cliquez sur le lien pour activer votre compte
            {redirectAfter === "checkout" && (
              <span> et accéder au paiement</span>
            )}
            {redirectAfter === "devis" && (
              <span> et créer votre premier devis</span>
            )}.
          </p>
          <Link
            href="/auth/login"
            className="text-sm font-semibold text-orange-400 hover:underline"
          >
            ← Retour à la connexion
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: "var(--navy)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <p className="mt-2 text-blue-200 text-sm">
            Créez votre compte — essai gratuit 7 jours
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          <h1 className="text-xl font-bold text-white mb-6">Créer un compte</h1>

          {/* Invite banner */}
          {inviteAgenceName && (
            <div className="mb-5 rounded-xl px-4 py-3 text-sm text-white bg-orange-500/20 border border-orange-400/30">
              Vous avez été invité par{" "}
              <strong>{inviteAgenceName}</strong> à rejoindre DevisFlow.
            </div>
          )}

          {error && (
            <p className="mb-4 text-sm text-red-300 bg-red-500/10 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Account type — hidden when invite token present */}
            {!inviteToken && (
              <div>
                <label className="block text-sm text-blue-200 mb-2">
                  Type de compte
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["artisan", "agence"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setAccountType(type)}
                      className={`py-3 rounded-xl text-sm font-semibold border transition-all ${
                        accountType === type
                          ? "border-orange-400 text-white"
                          : "border-white/20 text-blue-300 hover:border-white/40"
                      }`}
                      style={
                        accountType === type
                          ? { backgroundColor: "rgba(249,115,22,0.2)" }
                          : {}
                      }
                    >
                      {type === "artisan"
                        ? "🔨 Artisan / TPE — 29€/mois"
                        : "🏢 Cabinet ou groupement — à partir de 299€/mois"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-blue-200 mb-1">
                {accountType === "agence" ? "Nom du cabinet / groupement" : "Votre nom"}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={
                  accountType === "agence" ? "Cabinet Dupont Expertise" : "Jean Dupont"
                }
                className={inputClass}
              />
            </div>

            {accountType === "agence" && (
              <div>
                <label className="block text-sm text-blue-200 mb-1">
                  Nombre d&apos;artisans à gérer
                </label>
                <select
                  value={artisanCount}
                  onChange={(e) => setArtisanCount(e.target.value)}
                  className={inputClass}
                  style={{ appearance: "none" }}
                >
                  <option value="1">1 (solo)</option>
                  <option value="2-5">2 à 5 artisans</option>
                  <option value="6-10">6 à 10 artisans</option>
                  <option value="11-20">11 à 20 artisans</option>
                  <option value="21-50">21 à 50 artisans</option>
                  <option value="51-100">51 à 100 artisans</option>
                  <option value="100-500">100 à 500 artisans</option>
                  <option value="500+">Plus de 500 artisans</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm text-blue-200 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.fr"
                className={inputClass}
                readOnly={!!inviteAgenceName && !!email}
              />
            </div>

            <div>
              <label className="block text-sm text-blue-200 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="8 caractères minimum"
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60 mt-2"
              style={{ backgroundColor: "var(--orange)" }}
            >
              {loading ? "Création…" : "Créer mon compte →"}
            </button>
          </form>

          {!inviteToken && (
            <>
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
                {googleLoading ? "Connexion…" : "S'inscrire avec Google"}
              </button>
            </>
          )}

          <p className="mt-6 text-xs text-center text-blue-400">
            En créant un compte, vous acceptez nos{" "}
            <Link href="/cgu" className="underline">
              CGU
            </Link>{" "}
            et notre{" "}
            <Link href="/confidentialite" className="underline">
              politique de confidentialité
            </Link>
            .
          </p>

          <p className="mt-3 text-sm text-center text-blue-300">
            Déjà un compte ?{" "}
            <Link
              href="/auth/login"
              className="font-semibold text-white hover:underline"
            >
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
