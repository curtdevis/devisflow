"use client";

import { useEffect, useState, useCallback } from "react";
import { MAX_TEAM_MEMBERS } from "@/lib/team-limits";

interface Member {
  id: string;
  full_name: string | null;
  email: string;
  created_at: string;
}

interface Invite {
  id: string;
  email: string;
  created_at: string;
  expires_at: string;
}

export default function TeamManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members ?? []);
        setInvites(data.invites ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const slotsUsed = members.length + invites.length;
  const slotsLeft = Math.max(0, MAX_TEAM_MEMBERS - slotsUsed);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de l'envoi de l'invitation.");
        return;
      }
      setSuccess(`Invitation envoyée à ${email}.`);
      setEmail("");
      await load();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemove(type: "member" | "invite", id: string) {
    setError("");
    setSuccess("");
    setRemovingId(id);
    try {
      const res = await fetch("/api/team/remove", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, id }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Erreur lors de la suppression.");
        return;
      }
      await load();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Invite form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-lg" style={{ color: "var(--navy)" }}>Inviter un collaborateur</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(30,58,95,0.08)", color: "var(--navy)" }}>
            {slotsUsed} / {MAX_TEAM_MEMBERS} places utilisées
          </span>
        </div>

        {error && (
          <p className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{error}</p>
        )}
        {success && (
          <p className="mb-4 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">{success}</p>
        )}

        {slotsLeft > 0 ? (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="collegue@exemple.fr"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              type="submit"
              disabled={inviting}
              className="text-white font-bold px-6 py-3 rounded-xl transition-all disabled:opacity-60 whitespace-nowrap"
              style={{ backgroundColor: "var(--orange)" }}
            >
              {inviting ? "Envoi…" : "Inviter →"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            Limite de {MAX_TEAM_MEMBERS} membres atteinte. Retirez un membre ou une invitation en attente pour en inviter un nouveau.
          </p>
        )}
      </div>

      {/* Members + invites list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-lg" style={{ color: "var(--navy)" }}>Membres de l&apos;équipe</h2>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center text-gray-400 text-sm">Chargement…</div>
        ) : members.length === 0 && invites.length === 0 ? (
          <div className="px-6 py-10 text-center text-gray-400">
            <p className="text-3xl mb-2">👥</p>
            <p className="text-sm">Aucun collaborateur pour le moment.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {members.map((m) => (
              <li key={m.id} className="px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "var(--navy)" }}>
                    {(m.full_name ?? m.email)[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--navy)" }}>{m.full_name ?? m.email}</p>
                    <p className="text-xs text-gray-400 truncate">{m.email}</p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 shrink-0">
                    Actif
                  </span>
                </div>
                <button
                  onClick={() => handleRemove("member", m.id)}
                  disabled={removingId === m.id}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
                >
                  {removingId === m.id ? "…" : "Retirer"}
                </button>
              </li>
            ))}
            {invites.map((i) => (
              <li key={i.id} className="px-6 py-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-gray-400 text-sm font-bold shrink-0 bg-gray-100">
                    ✉
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate" style={{ color: "var(--navy)" }}>{i.email}</p>
                    <p className="text-xs text-gray-400 truncate">
                      Expire le {new Date(i.expires_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 shrink-0">
                    En attente
                  </span>
                </div>
                <button
                  onClick={() => handleRemove("invite", i.id)}
                  disabled={removingId === i.id}
                  className="text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-50 shrink-0"
                >
                  {removingId === i.id ? "…" : "Annuler"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
