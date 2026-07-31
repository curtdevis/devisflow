"use client";

import { useRef } from "react";
import Link from "next/link";
import CheckoutButton from "@/app/_components/CheckoutButton";
import { useAccountProfile } from "./useAccountProfile";

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow text-sm";

const TIER_LABEL: Record<string, string> = { solo: "Artisan Solo", intermediaire: "Intermédiaire" };
const TIER_PRICE: Record<string, string> = { solo: "29 €/mois", intermediaire: "79 €/mois" };

export default function AccountPage() {
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    loading,
    userEmail,
    userId,
    displayName,
    setDisplayName,
    companyName,
    setCompanyName,
    siret,
    setSiret,
    phone,
    setPhone,
    address,
    setAddress,
    avatarUrl,
    plan,
    tier,
    portalUrl,
    savingProfile,
    profileMsg,
    uploadingAvatar,
    saveProfile,
    handleAvatarChange,
    newPwd,
    setNewPwd,
    confirmPwd,
    setConfirmPwd,
    savingPwd,
    pwdMsg,
    changePassword,
    deleteConfirm,
    setDeleteConfirm,
    deletingAccount,
    showDeleteSection,
    setShowDeleteSection,
    deleteAccount,
  } = useAccountProfile();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: "var(--navy)" }}
      >
        <div className="animate-spin h-8 w-8 border-2 border-orange-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  const initial = (displayName.charAt(0) || userEmail.charAt(0) || "?").toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ backgroundColor: "var(--navy)" }}
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-blue-200 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/devis"
              className="text-sm font-bold text-white px-4 py-2 rounded-lg transition-colors hover:opacity-90"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Nouveau devis →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-extrabold" style={{ color: "var(--navy)" }}>
            Paramètres du compte
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez votre profil, votre sécurité et votre abonnement.
          </p>
        </div>

        {/* ── Profile ── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6" style={{ color: "var(--navy)" }}>
            Mon profil
          </h2>

          <form onSubmit={saveProfile} className="space-y-5">
            {/* Avatar */}
            <div className="flex items-center gap-5">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white overflow-hidden shrink-0 border-4 border-gray-100"
                style={{ backgroundColor: "var(--navy)" }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="Photo de profil" className="w-full h-full object-cover" />
                ) : (
                  initial
                )}
              </div>
              <div>
                <input
                  type="file"
                  ref={fileRef}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-60"
                  style={{ color: "var(--navy)" }}
                >
                  {uploadingAvatar ? "Envoi en cours…" : "Changer la photo"}
                </button>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG ou WebP — max 2 MB</p>
              </div>
            </div>

            {/* Fields */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom affiché *
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Jean Dupont"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={userEmail}
                  readOnly
                  className={`${inputClass} bg-gray-50 cursor-not-allowed text-gray-500`}
                />
                <p className="text-xs text-gray-400 mt-1">
                  L&apos;email ne peut pas être modifié ici.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de l&apos;entreprise
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Jean Dupont Plomberie"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SIRET</label>
                <input
                  type="text"
                  value={siret}
                  onChange={(e) => setSiret(e.target.value)}
                  placeholder="123 456 789 00012"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="06 12 34 56 78"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 rue des Artisans, 75011 Paris"
                  className={inputClass}
                />
              </div>
            </div>

            {profileMsg && (
              <p
                className={`text-sm px-4 py-2 rounded-xl ${
                  profileMsg.ok ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                }`}
              >
                {profileMsg.ok ? "✓ " : "⚠ "}
                {profileMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingProfile}
              className="text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: "var(--orange)" }}
            >
              {savingProfile ? "Sauvegarde…" : "Sauvegarder le profil"}
            </button>
          </form>
        </section>

        {/* ── Security ── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6" style={{ color: "var(--navy)" }}>
            Sécurité
          </h2>

          <form onSubmit={changePassword} className="space-y-4 max-w-md">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                type="password"
                minLength={8}
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="8 caractères minimum"
                className={inputClass}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                minLength={8}
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="Répétez le nouveau mot de passe"
                className={inputClass}
              />
            </div>

            {pwdMsg && (
              <p
                className={`text-sm px-4 py-2 rounded-xl ${
                  pwdMsg.ok ? "text-green-700 bg-green-50" : "text-red-700 bg-red-50"
                }`}
              >
                {pwdMsg.ok ? "✓ " : "⚠ "}
                {pwdMsg.text}
              </p>
            )}

            <button
              type="submit"
              disabled={savingPwd}
              className="text-white font-bold px-6 py-2.5 rounded-xl transition-all disabled:opacity-60 hover:opacity-90"
              style={{ backgroundColor: "var(--navy)" }}
            >
              {savingPwd ? "Modification…" : "Modifier le mot de passe"}
            </button>
          </form>
        </section>

        {/* ── Subscription ── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-6" style={{ color: "var(--navy)" }}>
            Abonnement
          </h2>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: plan === "paid" ? "var(--orange)" : "#6b7280" }}
                >
                  {plan === "paid" ? `${TIER_LABEL[tier] ?? "Artisan Solo"} — Actif` : "Essai gratuit"}
                </span>
                {plan === "paid" && (
                  <span className="text-sm text-gray-500">{TIER_PRICE[tier] ?? "29 €/mois"}</span>
                )}
              </div>
              {plan !== "paid" && (
                <p className="text-sm text-gray-500 max-w-sm">
                  Passez à Artisan Solo pour bénéficier des relances automatiques, de l&apos;historique illimité et du branding personnalisé.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {plan === "paid" ? (
                <>
                  {portalUrl ? (
                    <a
                      href={portalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
                      style={{ color: "var(--navy)" }}
                    >
                      Gérer mon abonnement →
                    </a>
                  ) : (
                    <a
                      href="/api/billing/portal"
                      className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
                      style={{ color: "var(--navy)" }}
                    >
                      Gérer mon abonnement →
                    </a>
                  )}
                  <p className="text-xs text-gray-400 text-center">
                    Résiliation possible depuis le portail client
                  </p>
                </>
              ) : (
                <CheckoutButton
                  className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 text-center"
                  style={{ backgroundColor: "var(--orange)" }}
                >
                  Passer à Artisan Solo — 29 €/mois →
                </CheckoutButton>
              )}
            </div>
          </div>

          {plan === "paid" && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <p className="text-sm font-semibold text-gray-700 mb-1">Résilier mon abonnement</p>
              <p className="text-xs text-gray-400 mb-3">
                Votre abonnement restera actif jusqu&apos;à la fin de la période en cours. Aucun remboursement partiel.
              </p>
              {portalUrl ? (
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Résilier mon abonnement →
                </a>
              ) : (
                <a
                  href="/api/billing/portal"
                  className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                >
                  Résilier mon abonnement →
                </a>
              )}
            </div>
          )}
        </section>

        {/* ── Données personnelles (RGPD) ── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--navy)" }}>
            Vos données personnelles
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Conformément au RGPD, vous pouvez exporter l&apos;intégralité de vos données (profil, devis, clients) dans un fichier au format lisible.
          </p>
          <a
            href="/api/account/export"
            download
            className="inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ color: "var(--navy)" }}
          >
            Exporter mes données →
          </a>
        </section>

        {/* ── Danger zone ── */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
          <h2 className="text-lg font-bold mb-2 text-red-600">Zone dangereuse</h2>
          <p className="text-sm text-gray-500 mb-4">
            La suppression de votre compte est <strong>irréversible</strong>. Tous vos devis, factures et données seront définitivement supprimés.
          </p>

          {plan === "paid" && (
            <div className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
              ⚠️ Vous avez un abonnement actif. Résiliez-le d&apos;abord depuis le portail ci-dessus avant de supprimer votre compte.
            </div>
          )}

          {!showDeleteSection ? (
            <button
              type="button"
              onClick={() => setShowDeleteSection(true)}
              className="text-sm font-semibold px-4 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="space-y-3 max-w-sm">
              <p className="text-sm text-gray-600">
                Tapez <strong>SUPPRIMER</strong> pour confirmer :
              </p>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="SUPPRIMER"
                className={inputClass}
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={deleteAccount}
                  disabled={deletingAccount || deleteConfirm !== "SUPPRIMER"}
                  className="text-sm font-bold px-5 py-2.5 rounded-xl text-white bg-red-600 hover:bg-red-700 disabled:opacity-40 transition-colors"
                >
                  {deletingAccount ? "Suppression…" : "Confirmer la suppression"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowDeleteSection(false); setDeleteConfirm(""); }}
                  className="text-sm font-semibold px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
