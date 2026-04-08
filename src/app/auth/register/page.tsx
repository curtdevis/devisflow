"use client";

import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const inviteToken = params.get("invite");

  const [accountType, setAccountType] = useState<"artisan" | "agence">("artisan");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [inviteAgenceName, setInviteAgenceName] = useState<string | null>(null);

  // If an invite token is present, lock account type to artisan and show agency name
  useEffect(() => {
    if (!inviteToken) return;
    setAccountType("artisan");
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

    const supabase = createSupabaseBrowser();
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
          invite_token: inviteToken ?? null,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) {
      setError(
        signUpError.message.includes("already registered")
          ? "Cet email est déjà utilisé. Connectez-vous."
          : signUpError.message
      );
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
            Cliquez sur le lien pour activer votre compte.
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
            Créez votre compte — essai gratuit 14 jours
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
                        ? "🔨 Artisan — 29€/mois"
                        : "🏢 Agence — 299€/mois"}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm text-blue-200 mb-1">
                {accountType === "agence" ? "Nom de l'agence" : "Votre nom"}
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

          <p className="mt-6 text-xs text-center text-blue-400">
            En créant un compte, vous acceptez nos{" "}
            <a href="#" className="underline">
              CGV
            </a>{" "}
            et notre{" "}
            <a href="#" className="underline">
              politique de confidentialité
            </a>
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
