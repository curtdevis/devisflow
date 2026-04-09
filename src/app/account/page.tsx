"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { LS_CHECKOUT } from "@/app/_components/CheckoutButton";

interface Profile {
  full_name: string | null;
  display_name: string | null;
  company_name: string | null;
  siret: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  plan: string | null;
  lemon_squeezy_customer_portal: string | null;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-shadow text-sm";

export default function AccountPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  // Profile fields
  const [displayName, setDisplayName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [siret, setSiret] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [plan, setPlan] = useState("free");
  const [portalUrl, setPortalUrl] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password fields
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createSupabaseBrowser();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      setUserEmail(user.email ?? "");
      setUserId(user.id);

      const { data: p } = await supabase
        .from("profiles")
        .select(
          "full_name, display_name, company_name, siret, phone, address, avatar_url, plan, lemon_squeezy_customer_portal"
        )
        .eq("id", user.id)
        .single();

      if (p) {
        const profile = p as Profile;
        setDisplayName(profile.display_name ?? profile.full_name ?? "");
        setCompanyName(profile.company_name ?? "");
        setSiret(profile.siret ?? "");
        setPhone(profile.phone ?? "");
        setAddress(profile.address ?? "");
        setAvatarUrl(profile.avatar_url ?? "");
        setPlan(profile.plan ?? "free");
        setPortalUrl(profile.lemon_squeezy_customer_portal ?? "");
      }

      setLoading(false);
    }
    load();
  }, [router]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    const supabase = createSupabaseBrowser();
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName || null,
        company_name: companyName || null,
        siret: siret || null,
        phone: phone || null,
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId);

    setSavingProfile(false);
    setProfileMsg(
      error
        ? { ok: false, text: "Erreur lors de la sauvegarde." }
        : { ok: true, text: "Profil mis à jour." }
    );
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Format non supporté. Utilisez JPG, PNG ou WebP.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Fichier trop volumineux (max 2 MB).");
      return;
    }

    setUploadingAvatar(true);
    const supabase = createSupabaseBrowser();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (uploadError) {
      alert("Erreur lors de l'upload : " + uploadError.message);
      setUploadingAvatar(false);
      return;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const finalUrl = `${publicUrl}?t=${Date.now()}`;
    await supabase.from("profiles").update({ avatar_url: finalUrl }).eq("id", userId);
    setAvatarUrl(finalUrl);
    setUploadingAvatar(false);
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdMsg(null);

    if (newPwd.length < 8) {
      setPwdMsg({ ok: false, text: "8 caractères minimum." });
      return;
    }
    if (newPwd !== confirmPwd) {
      setPwdMsg({ ok: false, text: "Les mots de passe ne correspondent pas." });
      return;
    }

    setSavingPwd(true);
    const { error } = await createSupabaseBrowser().auth.updateUser({ password: newPwd });
    setSavingPwd(false);

    if (error) {
      setPwdMsg({ ok: false, text: error.message });
    } else {
      setPwdMsg({ ok: true, text: "Mot de passe modifié avec succès." });
      setNewPwd("");
      setConfirmPwd("");
    }
  }

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
                  {plan === "paid" ? "Artisan Solo" : "Essai gratuit"}
                </span>
                {plan === "paid" && (
                  <span className="text-sm text-gray-500">29 €/mois</span>
                )}
              </div>
              {plan !== "paid" && (
                <p className="text-sm text-gray-500 max-w-sm">
                  Passez à Artisan Solo pour bénéficier des relances automatiques, de l&apos;historique illimité et du branding personnalisé.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              {plan === "paid" && portalUrl ? (
                <a
                  href={portalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
                  style={{ color: "var(--navy)" }}
                >
                  Gérer mon abonnement →
                </a>
              ) : plan === "paid" ? (
                <a
                  href="https://app.lemonsqueezy.com/my-orders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-center"
                  style={{ color: "var(--navy)" }}
                >
                  Gérer mon abonnement →
                </a>
              ) : (
                <a
                  href={`${LS_CHECKOUT}?checkout[custom][user_id]=${userId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-bold text-white px-5 py-2.5 rounded-xl transition-colors hover:opacity-90 text-center"
                  style={{ backgroundColor: "var(--orange)" }}
                >
                  Passer à Artisan Solo — 29 €/mois →
                </a>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
