import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

interface Profile {
  full_name: string | null;
  display_name: string | null;
  company_name: string | null;
  siret: string | null;
  phone: string | null;
  address: string | null;
  avatar_url: string | null;
  plan: string | null;
  tier: string | null;
  lemon_squeezy_customer_portal: string | null;
}

export function useAccountProfile() {
  const router = useRouter();

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
  const [tier, setTier] = useState("solo");
  const [portalUrl, setPortalUrl] = useState("");

  const [savingProfile, setSavingProfile] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Password fields
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [savingPwd, setSavingPwd] = useState(false);
  const [pwdMsg, setPwdMsg] = useState<{ ok: boolean; text: string } | null>(null);

  // Delete account
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);

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
          "full_name, display_name, company_name, siret, phone, address, avatar_url, plan, tier, lemon_squeezy_customer_portal"
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
        setTier(profile.tier ?? "solo");
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

  async function deleteAccount() {
    if (deleteConfirm !== "SUPPRIMER") return;
    setDeletingAccount(true);
    try {
      const res = await fetch("/api/account/delete", { method: "DELETE" });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? "Erreur lors de la suppression.");
        setDeletingAccount(false);
        return;
      }
      await createSupabaseBrowser().auth.signOut();
      router.push("/?deleted=1");
    } catch {
      alert("Une erreur est survenue.");
      setDeletingAccount(false);
    }
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

  return {
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
  };
}
