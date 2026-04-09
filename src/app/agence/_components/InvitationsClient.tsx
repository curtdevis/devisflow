"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Invitation } from "../invitations/page";

const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

function getStatus(inv: Invitation): "accepted" | "expired" | "pending" {
  if (inv.accepted_at) return "accepted";
  if (Date.now() - new Date(inv.created_at).getTime() > SEVEN_DAYS) return "expired";
  return "pending";
}

export default function InvitationsClient({
  invitations,
  agenceId,
  agenceName,
}: {
  invitations: Invitation[];
  agenceId: string;
  agenceName: string;
}) {
  const [list, setList] = useState(invitations);
  const [email, setEmail] = useState("");
  const [bulkEmails, setBulkEmails] = useState("");
  const [sending, setSending] = useState(false);
  const [showBulk, setShowBulk] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  async function sendInvite(emailsToSend: string[]) {
    setSending(true);
    let successCount = 0;
    for (const e of emailsToSend) {
      const trimmed = e.trim();
      if (!trimmed || !trimmed.includes("@")) continue;
      try {
        const res = await fetch("/api/invite-artisan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: trimmed, agenceId, agenceName }),
        });
        if (res.ok) {
          successCount++;
          const newInvite: Invitation = {
            id: crypto.randomUUID(),
            token: "",
            email: trimmed,
            agence_name: agenceName,
            accepted_at: null,
            created_at: new Date().toISOString(),
          };
          setList((prev) => [newInvite, ...prev]);
        } else {
          const err = await res.json().catch(() => ({}));
          toast.error(`Erreur pour ${trimmed}: ${err.error ?? "Erreur inconnue"}`);
        }
      } catch {
        toast.error(`Erreur réseau pour ${trimmed}`);
      }
    }
    if (successCount > 0) {
      toast.success(
        successCount === 1
          ? "Invitation envoyée !"
          : `${successCount} invitations envoyées !`
      );
    }
    setSending(false);
    setEmail("");
    setBulkEmails("");
    setShowBulk(false);
  }

  async function handleResend(token: string, invEmail: string) {
    setActionId(token);
    try {
      const res = await fetch("/api/agence/invitations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, agenceId, agenceName, email: invEmail }),
      });
      if (res.ok) {
        toast.success("Invitation renvoyée !");
        setList((prev) =>
          prev.map((inv) =>
            inv.token === token ? { ...inv, created_at: new Date().toISOString() } : inv
          )
        );
      } else {
        toast.error("Erreur lors du renvoi.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setActionId(null);
    }
  }

  async function handleCancel(token: string) {
    if (!confirm("Annuler cette invitation ?")) return;
    setActionId(token);
    try {
      const res = await fetch("/api/agence/invitations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        setList((prev) => prev.filter((inv) => inv.token !== token));
        toast.success("Invitation annulée.");
      } else {
        toast.error("Erreur lors de l'annulation.");
      }
    } catch {
      toast.error("Erreur réseau.");
    } finally {
      setActionId(null);
    }
  }

  const pending = list.filter((i) => getStatus(i) === "pending");
  const accepted = list.filter((i) => getStatus(i) === "accepted");
  const expired = list.filter((i) => getStatus(i) === "expired");

  return (
    <div className="space-y-6">
      {/* Send invitation form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-gray-900">Inviter un artisan</h2>
            <p className="text-sm text-gray-400 mt-0.5">L&apos;artisan recevra un email pour créer son compte</p>
          </div>
          <button
            onClick={() => setShowBulk((v) => !v)}
            className="text-sm font-medium text-gray-500 hover:text-gray-700 underline"
          >
            {showBulk ? "Invitation simple" : "Invitation en masse"}
          </button>
        </div>

        {!showBulk ? (
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && email && sendInvite([email])}
              placeholder="artisan@exemple.fr"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
            />
            <button
              onClick={() => sendInvite([email])}
              disabled={!email || sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#f97316" }}
            >
              {sending ? (
                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              ) : null}
              Inviter
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <textarea
              value={bulkEmails}
              onChange={(e) => setBulkEmails(e.target.value)}
              placeholder={"artisan1@exemple.fr\nartisan2@exemple.fr\nartisan3@exemple.fr"}
              rows={5}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 font-mono resize-y"
            />
            <p className="text-xs text-gray-400">Une adresse email par ligne</p>
            <button
              onClick={() => {
                const emails = bulkEmails.split("\n").filter((e) => e.trim().includes("@"));
                if (emails.length === 0) { toast.error("Aucune adresse email valide."); return; }
                sendInvite(emails);
              }}
              disabled={!bulkEmails || sending}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm disabled:opacity-50 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "#f97316" }}
            >
              {sending ? "Envoi en cours..." : `Envoyer ${bulkEmails.split("\n").filter((e) => e.trim().includes("@")).length} invitation(s)`}
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "En attente", value: pending.length, color: "#f97316", bg: "#fff7ed" },
          { label: "Acceptées", value: accepted.length, color: "#10b981", bg: "#f0fdf4" },
          { label: "Expirées", value: expired.length, color: "#9ca3af", bg: "#f9fafb" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
            <p className="text-2xl font-extrabold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Invitation list */}
      {list.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
          <p className="text-4xl mb-3">✉️</p>
          <p className="font-medium text-gray-700 mb-1">Aucune invitation envoyée</p>
          <p className="text-sm text-gray-400">Invitez vos premiers artisans ci-dessus.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-900">Toutes les invitations</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {list.map((inv) => {
              const status = getStatus(inv);
              const isActing = actionId === inv.token;
              return (
                <div key={inv.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold text-white shrink-0"
                    style={{
                      backgroundColor:
                        status === "accepted" ? "#10b981" : status === "expired" ? "#d1d5db" : "#f97316",
                    }}
                  >
                    {status === "accepted" ? "✓" : status === "expired" ? "✕" : "✉"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{inv.email}</p>
                    <p className="text-xs text-gray-400">
                      Envoyée le {new Date(inv.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <StatusBadge status={status} />
                  {status !== "accepted" && (
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleResend(inv.token, inv.email)}
                        disabled={isActing}
                        title="Renvoyer"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors disabled:opacity-50"
                      >
                        <svg className={`w-4 h-4 ${isActing ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleCancel(inv.token)}
                        disabled={isActing}
                        title="Annuler"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: "accepted" | "expired" | "pending" }) {
  const map = {
    accepted: { label: "Acceptée", cls: "bg-green-50 text-green-700" },
    expired: { label: "Expirée", cls: "bg-gray-100 text-gray-500" },
    pending: { label: "En attente", cls: "bg-orange-50 text-orange-600" },
  };
  const { label, cls } = map[status];
  return (
    <span className={`shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}
