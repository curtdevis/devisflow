"use client";

import { useState } from "react";

interface Props {
  agenceId: string;
  agenceName: string;
}

export default function InviteForm({ agenceId, agenceName }: Props) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/invite-artisan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, agenceId, agenceName }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Erreur lors de l'envoi.");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setEmail("");
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 text-white font-bold px-5 py-3 rounded-xl transition-transform hover:scale-105"
        style={{ backgroundColor: "var(--navy)" }}
      >
        + Inviter un artisan
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6 w-full sm:w-80">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-sm" style={{ color: "var(--navy)" }}>
          Inviter un artisan
        </h3>
        <button
          onClick={() => { setOpen(false); setSuccess(false); setError(""); }}
          className="text-gray-400 hover:text-gray-600 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {success ? (
        <div className="text-center py-4">
          <p className="text-green-600 font-semibold text-sm">Invitation envoyée ✓</p>
          <p className="text-gray-400 text-xs mt-1">{email}</p>
          <button
            onClick={() => setSuccess(false)}
            className="mt-3 text-xs font-semibold"
            style={{ color: "var(--orange)" }}
          >
            Inviter un autre
          </button>
        </div>
      ) : (
        <form onSubmit={handleInvite} className="space-y-3">
          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="artisan@exemple.fr"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2"
            style={{ "--tw-ring-color": "var(--navy)" } as React.CSSProperties}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full text-white font-bold text-sm py-3 rounded-xl disabled:opacity-60"
            style={{ backgroundColor: "var(--orange)" }}
          >
            {loading ? "Envoi…" : "Envoyer l'invitation →"}
          </button>
          <p className="text-xs text-gray-400 text-center">
            L&apos;artisan recevra un email avec un lien d&apos;inscription.
          </p>
        </form>
      )}
    </div>
  );
}
