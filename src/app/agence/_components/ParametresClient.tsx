"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

type ProfileData = {
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  siret: string | null;
  address: string | null;
};

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all";

export default function ParametresClient({
  userId,
  userEmail,
  profile,
}: {
  userId: string;
  userEmail: string;
  profile: ProfileData;
}) {
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name ?? "");
  const [companyName, setCompanyName] = useState(profile.company_name ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [siret, setSiret] = useState(profile.siret ?? "");
  const [address, setAddress] = useState(profile.address ?? "");
  const [saving, setSaving] = useState(false);

  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);

  const [notifDevis, setNotifDevis] = useState(true);
  const [notifInvites, setNotifInvites] = useState(true);
  const [notifReports, setNotifReports] = useState(false);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const supabase = createSupabaseBrowser();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        company_name: companyName || null,
        phone: phone || null,
        siret: siret || null,
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);
    setSaving(false);
    if (error) {
      toast.error("Erreur lors de la sauvegarde : " + error.message);
    } else {
      toast.success("Profil mis à jour !");
      router.refresh();
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPwd.length < 8) { toast.error("8 caractères minimum."); return; }
    if (newPwd !== confirmPwd) { toast.error("Les mots de passe ne correspondent pas."); return; }
    setSavingPwd(true);
    const { error } = await createSupabaseBrowser().auth.updateUser({ password: newPwd });
    setSavingPwd(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Mot de passe modifié !");
      setNewPwd(""); setConfirmPwd("");
    }
  }

  return (
    <div className="space-y-6">
      {/* Agency profile */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-lg font-bold"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {(companyName || fullName || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Profil de l&apos;agence</h2>
            <p className="text-sm text-gray-400">{userEmail}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de l&apos;agence *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Cabinet Dupont &amp; Associés"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du responsable</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jean Dupont"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="01 23 45 67 89"
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={userEmail}
                readOnly
                className={`${inputClass} bg-gray-50 cursor-not-allowed text-gray-400`}
              />
            </div>
            <div className="sm:col-span-2">
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

          <button
            type="submit"
            disabled={saving}
            className="text-white font-bold px-6 py-2.5 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#f97316" }}
          >
            {saving ? "Sauvegarde..." : "Enregistrer le profil"}
          </button>
        </form>
      </section>

      {/* Notifications */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">Notifications email</h2>
        <div className="space-y-4">
          {[
            { label: "Nouveau devis généré", desc: "Notifié à chaque devis créé par un artisan", val: notifDevis, set: setNotifDevis },
            { label: "Invitation acceptée", desc: "Notifié quand un artisan rejoint votre agence", val: notifInvites, set: setNotifInvites },
            { label: "Rapport mensuel", desc: "Récapitulatif automatique chaque 1er du mois", val: notifReports, set: setNotifReports },
          ].map(({ label, desc, val, set }) => (
            <label key={label} className="flex items-start gap-4 cursor-pointer group">
              <button
                type="button"
                role="switch"
                aria-checked={val}
                onClick={() => { set(!val); toast.success("Préférence mise à jour."); }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full shrink-0 mt-0.5 transition-colors ${
                  val ? "" : "bg-gray-200"
                }`}
                style={val ? { backgroundColor: "#f97316" } : {}}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    val ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* Security */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-5">Sécurité</h2>
        <form onSubmit={changePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</label>
            <input
              type="password"
              value={newPwd}
              onChange={(e) => setNewPwd(e.target.value)}
              placeholder="8 caractères minimum"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPwd}
              onChange={(e) => setConfirmPwd(e.target.value)}
              placeholder="Répétez le nouveau mot de passe"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={savingPwd || !newPwd}
            className="font-bold px-6 py-2.5 rounded-xl text-white hover:opacity-90 transition-opacity disabled:opacity-60"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {savingPwd ? "Modification..." : "Changer le mot de passe"}
          </button>
        </form>
      </section>

      {/* Branding info */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-bold text-gray-900 mb-2">Branding artisans</h2>
        <p className="text-sm text-gray-500 mb-4">
          Les devis générés par vos artisans afficheront automatiquement le nom de votre agence en bas de page.
        </p>
        <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
            style={{ backgroundColor: "#1e3a5f" }}
          >
            {(companyName || "A").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{companyName || "Votre agence"}</p>
            <p className="text-xs text-gray-400">Affiché sur tous les devis de vos artisans</p>
          </div>
        </div>
      </section>

      {/* API access */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-bold text-gray-900 mb-1">Accès API</h2>
            <p className="text-sm text-gray-500">
              Intégrez DevisFlow dans vos outils existants via notre API REST.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 shrink-0">
            Bientôt
          </span>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded-xl">
          <p className="text-xs font-mono text-gray-400">
            API Key : <span className="text-gray-300">••••••••••••••••••••••••••••••••</span>
          </p>
        </div>
        <button
          onClick={() => toast.info("La fonctionnalité API sera disponible prochainement.")}
          className="mt-3 text-sm font-medium text-gray-500 hover:text-gray-700 underline"
        >
          Demander un accès anticipé →
        </button>
      </section>
    </div>
  );
}
