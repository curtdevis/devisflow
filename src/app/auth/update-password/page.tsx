"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

const inputClass =
  "w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState("");
  const [ready, setReady] = useState<"loading" | "ok" | "invalid">("loading");

  useEffect(() => {
    const supabase = createSupabaseBrowser();
    // Give Supabase time to process the URL hash token
    const timeout = setTimeout(async () => {
      const { data } = await supabase.auth.getSession();
      setReady(data.session ? "ok" : "invalid");
    }, 800);
    return () => clearTimeout(timeout);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");
    const supabase = createSupabaseBrowser();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setStatus("idle");
      return;
    }

    setStatus("done");
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (ready === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--navy)" }}>
        <div className="animate-spin h-8 w-8 border-2 border-orange-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (ready === "invalid") {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--navy)" }}>
        <div className="w-full max-w-md text-center">
          <Link href="/" className="text-3xl font-extrabold text-white block mb-8">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-xl font-bold text-white mb-3">Lien invalide ou expiré</h1>
            <p className="text-blue-200 text-sm leading-relaxed mb-6">
              Ce lien de réinitialisation n&apos;est plus valide. Demandez un nouveau lien depuis la page de connexion.
            </p>
            <Link
              href="/auth/reset-password"
              className="inline-block w-full py-3 rounded-xl text-white font-bold transition-all hover:opacity-90"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Demander un nouveau lien →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "var(--navy)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <p className="mt-2 text-blue-200 text-sm">Nouveau mot de passe</p>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8">
          {status === "done" ? (
            <div className="text-center">
              <div className="text-4xl mb-4">✅</div>
              <h1 className="text-xl font-bold text-white mb-3">Mot de passe mis à jour !</h1>
              <p className="text-blue-200 text-sm">Redirection vers votre tableau de bord…</p>
            </div>
          ) : (
            <>
              <h1 className="text-xl font-bold text-white mb-2">Choisissez un nouveau mot de passe</h1>
              <p className="text-blue-300 text-sm mb-6">Minimum 8 caractères.</p>

              {error && (
                <p className="mb-4 text-sm text-red-300 bg-red-500/10 rounded-xl px-4 py-3">{error}</p>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-blue-200 mb-1">Nouveau mot de passe</label>
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

                <div>
                  <label className="block text-sm text-blue-200 mb-1">Confirmer le mot de passe</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Répétez le mot de passe"
                    className={inputClass}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full text-white font-bold py-3 rounded-xl transition-all disabled:opacity-60"
                  style={{ backgroundColor: "var(--orange)" }}
                >
                  {status === "loading" ? "Mise à jour…" : "Enregistrer le mot de passe →"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
