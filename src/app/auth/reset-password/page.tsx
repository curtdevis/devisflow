"use client";

import { useState } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent">("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    const supabase = createSupabaseBrowser();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/update-password`,
    });

    if (resetError) {
      setError("Erreur lors de l'envoi. Vérifiez votre email.");
      setStatus("idle");
      return;
    }

    setStatus("sent");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--navy)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <p className="mt-2 text-blue-200 text-sm">Réinitialisation du mot de passe</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          {status === "sent" ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h1 className="text-xl font-bold text-white mb-3">Email envoyé !</h1>
              <p className="text-blue-200 text-sm leading-relaxed mb-6">
                Consultez votre boîte mail — un lien pour réinitialiser votre mot de passe vous a été envoyé à <strong className="text-white">{email}</strong>.
              </p>
              <Link href="/auth/login" className="text-sm text-orange-400 hover:underline">
                ← Retour à la connexion
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-2">Mot de passe oublié ?</h1>
              <p className="text-blue-300 text-sm mb-6">
                Entrez votre email — nous vous enverrons un lien pour créer un nouveau mot de passe.
              </p>

              {error && (
                <p className="mb-4 text-sm text-red-300 bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
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

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
                  style={{ backgroundColor: "var(--orange)" }}
                >
                  {status === "loading" ? "Envoi en cours…" : "Envoyer le lien →"}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-blue-300">
                <Link href="/auth/login" className="font-semibold text-white hover:underline">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
