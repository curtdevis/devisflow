"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createSupabaseBrowser } from "@/lib/supabase";

interface Material {
  description: string;
  quantity: string;
  unitPrice: string;
}

interface FormData {
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  workDescription: string;
  materials: Material[];
  laborHours: string;
  hourlyRate: string;
  tvaRate: "10" | "20";
  validityDays: string;
  artisanName: string;
  artisanSiret: string;
  artisanAddress: string;
  artisanPhone: string;
  artisanEmail: string;
  customNotes: string;
}

interface DevisResult {
  devisNumber: string;
  date: string;
  validUntil: string;
  artisan: {
    name: string;
    siret: string;
    address?: string;
    phone?: string;
    email?: string;
    logoBase64?: string;
  };
  client: { name: string; address: string; phone: string; email: string };
  lines: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  notes: string;
  legalMentions: string;
}

const EMPTY_MATERIAL: Material = { description: "", quantity: "1", unitPrice: "" };

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:border-transparent transition-shadow text-sm";

const focusStyle = { "--tw-ring-color": "var(--navy)" } as React.CSSProperties;

export default function DevisPage() {
  const [form, setForm] = useState<FormData>({
    clientName: "",
    clientAddress: "",
    clientPhone: "",
    clientEmail: "",
    workDescription: "",
    materials: [{ ...EMPTY_MATERIAL }],
    laborHours: "",
    hourlyRate: "",
    tvaRate: "20",
    validityDays: "30",
    artisanName: "",
    artisanSiret: "",
    artisanAddress: "",
    artisanPhone: "",
    artisanEmail: "",
    customNotes: "",
  });

  const [logoBase64, setLogoBase64] = useState<string>("");
  const [logoError, setLogoError] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DevisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-fill artisan info from Supabase profile
  useEffect(() => {
    async function loadProfile() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, siret, phone, address, email")
        .eq("id", user.id)
        .single();
      if (!profile) return;
      setForm((prev) => ({
        ...prev,
        artisanName: profile.full_name ?? prev.artisanName,
        artisanSiret: profile.siret ?? prev.artisanSiret,
        artisanPhone: profile.phone ?? prev.artisanPhone,
        artisanAddress: profile.address ?? prev.artisanAddress,
        artisanEmail: profile.email ?? user.email ?? prev.artisanEmail,
      }));
    }
    loadProfile();
  }, []);

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMaterial(index: number, field: keyof Material, value: string) {
    setForm((prev) => {
      const mats = [...prev.materials];
      mats[index] = { ...mats[index], [field]: value };
      return { ...prev, materials: mats };
    });
  }

  function addMaterial() {
    setForm((prev) => ({
      ...prev,
      materials: [...prev.materials, { ...EMPTY_MATERIAL }],
    }));
  }

  function removeMaterial(index: number) {
    setForm((prev) => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index),
    }));
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/svg+xml"];
    if (!allowed.includes(file.type)) {
      setLogoError("Format non supporté. Utilisez JPG, PNG ou SVG.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setLogoError("Fichier trop volumineux (max 2 MB).");
      return;
    }
    setLogoError("");
    const reader = new FileReader();
    reader.onload = (ev) => setLogoBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();


    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/generate-devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, logoBase64 }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la génération du devis.");
      }

      const data = await res.json();
      setResult(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <DevisPreview result={result} onReset={() => setResult(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ backgroundColor: "var(--navy)" }}
      >
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <span className="text-blue-200 text-sm">Nouveau devis</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* ── Your info ── */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2
              className="text-lg font-bold mb-5"
              style={{ color: "var(--navy)" }}
            >
              Vos informations
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raison sociale / Nom *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Jean Dupont Plomberie"
                  value={form.artisanName}
                  onChange={(e) => updateField("artisanName", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  SIRET *
                </label>
                <input
                  type="text"
                  required
                  placeholder="123 456 789 00012"
                  value={form.artisanSiret}
                  onChange={(e) => updateField("artisanSiret", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={form.artisanPhone}
                  onChange={(e) => updateField("artisanPhone", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse
                </label>
                <input
                  type="text"
                  placeholder="12 rue des Artisans, 75011 Paris"
                  value={form.artisanAddress}
                  onChange={(e) => updateField("artisanAddress", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email professionnel
                </label>
                <input
                  type="email"
                  placeholder="contact@jean-dupont-plomberie.fr"
                  value={form.artisanEmail}
                  onChange={(e) => updateField("artisanEmail", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>

              {/* Logo upload */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logo <span className="text-gray-400 font-normal">(optionnel — JPG, PNG ou SVG, max 2 MB)</span>
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/svg+xml"
                  onChange={handleLogoUpload}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white cursor-pointer"
                  style={{ ["--file-bg" as string]: "var(--navy)" }}
                />
                <style>{`input[type="file"]::file-selector-button { background-color: var(--navy); color: white; }`}</style>
                {logoError && (
                  <p className="text-red-500 text-xs mt-1">{logoError}</p>
                )}
                {logoBase64 && !logoError && (
                  <div className="mt-3 p-3 border border-gray-100 rounded-xl bg-gray-50 inline-block">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={logoBase64}
                      alt="Aperçu logo"
                      style={{ maxHeight: 80, maxWidth: 240 }}
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Client info ── */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2
              className="text-lg font-bold mb-5"
              style={{ color: "var(--navy)" }}
            >
              Informations client
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du client *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Marie Martin"
                  value={form.clientName}
                  onChange={(e) => updateField("clientName", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse *
                </label>
                <input
                  type="text"
                  required
                  placeholder="12 rue des Fleurs, 75001 Paris"
                  value={form.clientAddress}
                  onChange={(e) => updateField("clientAddress", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  placeholder="06 12 34 56 78"
                  value={form.clientPhone}
                  onChange={(e) => updateField("clientPhone", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="client@email.com"
                  value={form.clientEmail}
                  onChange={(e) => updateField("clientEmail", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
            </div>
          </section>

          {/* ── Work description ── */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2
              className="text-lg font-bold mb-5"
              style={{ color: "var(--navy)" }}
            >
              Description des travaux
            </h2>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Décrivez les travaux à réaliser *
            </label>
            <textarea
              required
              rows={5}
              placeholder="Ex : Remplacement du chauffe-eau électrique 200L dans la salle de bain du 1er étage. Dépose de l'ancien appareil, fourniture et pose d'un chauffe-eau Thermor 200L, raccordements eau et électrique, mise en service et tests."
              value={form.workDescription}
              onChange={(e) => updateField("workDescription", e.target.value)}
              className={`${inputClass} resize-none`}
              style={focusStyle}
            />
            <p className="text-xs text-gray-400 mt-2">
              Plus vous êtes précis, plus le devis généré sera détaillé et professionnel.
            </p>
          </section>

          {/* ── Materials ── */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2
              className="text-lg font-bold mb-5"
              style={{ color: "var(--navy)" }}
            >
              Matériaux et fournitures
            </h2>
            <div className="space-y-3">
              {form.materials.map((mat, i) => (
                <div key={i} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Description (ex: Chauffe-eau Thermor 200L)"
                      value={mat.description}
                      onChange={(e) =>
                        updateMaterial(i, "description", e.target.value)
                      }
                      className={inputClass}
                      style={focusStyle}
                    />
                  </div>
                  <div className="w-20">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Qté"
                      value={mat.quantity}
                      onChange={(e) =>
                        updateMaterial(i, "quantity", e.target.value)
                      }
                      className={inputClass}
                      style={focusStyle}
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="Prix HT €"
                      value={mat.unitPrice}
                      onChange={(e) =>
                        updateMaterial(i, "unitPrice", e.target.value)
                      }
                      className={inputClass}
                      style={focusStyle}
                    />
                  </div>
                  {form.materials.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeMaterial(i)}
                      className="mt-3 text-gray-300 hover:text-red-400 transition-colors text-xl leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addMaterial}
              className="mt-4 text-sm font-semibold transition-colors"
              style={{ color: "var(--navy)" }}
            >
              + Ajouter un matériau
            </button>
          </section>

          {/* ── Labor & TVA ── */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2
              className="text-lg font-bold mb-5"
              style={{ color: "var(--navy)" }}
            >
              Main d&apos;œuvre et TVA
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Heures de travail *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.5"
                  placeholder="Ex : 8"
                  value={form.laborHours}
                  onChange={(e) => updateField("laborHours", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux horaire HT (€) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="any"
                  placeholder="Ex : 55"
                  value={form.hourlyRate}
                  onChange={(e) => updateField("hourlyRate", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux de TVA *
                </label>
                <select
                  value={form.tvaRate}
                  onChange={(e) =>
                    updateField("tvaRate", e.target.value as "10" | "20")
                  }
                  className={inputClass}
                  style={focusStyle}
                >
                  <option value="10">10% — Travaux rénovation</option>
                  <option value="20">20% — Taux normal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Validité du devis (jours)
                </label>
                <select
                  value={form.validityDays}
                  onChange={(e) => updateField("validityDays", e.target.value)}
                  className={inputClass}
                  style={focusStyle}
                >
                  <option value="15">15 jours</option>
                  <option value="30">30 jours</option>
                  <option value="60">60 jours</option>
                  <option value="90">90 jours</option>
                </select>
              </div>
            </div>
          </section>

          {/* ── Custom notes ── */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2
              className="text-lg font-bold mb-1"
              style={{ color: "var(--navy)" }}
            >
              Notes personnalisées
              <span className="ml-2 text-xs font-normal text-gray-400">optionnel</span>
            </h2>
            <p className="text-sm text-gray-400 mb-4">
              Si renseigné, ce texte remplacera les notes générées automatiquement par l&apos;IA.
            </p>
            <textarea
              rows={3}
              placeholder="Ex: Paiement à réception, travaux garantis 2 ans, inclus déplacement..."
              value={form.customNotes}
              onChange={(e) => updateField("customNotes", e.target.value)}
              className={`${inputClass} resize-none`}
              style={focusStyle}
            />
          </section>

          {/* ── Submit ── */}
          <div className="flex flex-col items-center gap-3 pb-10">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ backgroundColor: loading ? "#9ca3af" : "var(--orange)" }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Génération en cours…
                </span>
              ) : (
                "Générer mon devis IA →"
              )}
            </button>
            <p className="text-xs text-gray-400">
              Votre devis sera généré en moins de 30 secondes
            </p>
            <a
              href="https://devisflow.lemonsqueezy.com/checkout/buy/c410da6a-48e2-4e35-aeb0-dea0ebb29cb5"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
              style={{ color: "var(--orange)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Essai gratuit 14 jours — Paiement sécurisé par Lemon Squeezy
            </a>
          </div>
        </form>
      </main>

    </div>
  );
}

// ── Devis Preview ──────────────────────────────────────────────────────────────

function DevisPreview({
  result,
  onReset,
}: {
  result: DevisResult;
  onReset: () => void;
}) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmail, setModalEmail] = useState(result.client.email ?? "");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  async function sendEmail() {
    if (!modalEmail) return;
    setEmailSending(true);
    setEmailError("");
    try {
      const res = await fetch("/api/send-devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: modalEmail, devis: result }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'envoi.");
      }
      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally {
      setEmailSending(false);
    }
  }

  function openWhatsApp() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(
      `Bonjour ${result.client.name}, veuillez trouver votre devis DevisFlow ci-joint : ${url}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ── Email modal ── */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            {emailSent ? (
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--navy)" }}>
                  Email envoyé !
                </h3>
                <p className="text-gray-500 text-sm mb-6">
                  Le devis a été envoyé à <strong>{modalEmail}</strong>.
                </p>
                <button
                  onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                  className="font-semibold px-6 py-2 rounded-xl text-white"
                  style={{ backgroundColor: "var(--navy)" }}
                >
                  Fermer
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--navy)" }}>
                  Envoyer le devis par email
                </h3>
                <p className="text-sm text-gray-400 mb-5">
                  Le devis complet sera envoyé en HTML professionnel.
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse email du destinataire
                </label>
                <input
                  type="email"
                  autoFocus
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent mb-4"
                  onKeyDown={(e) => e.key === "Enter" && sendEmail()}
                />
                {emailError && (
                  <p className="text-red-500 text-sm mb-4">{emailError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={sendEmail}
                    disabled={emailSending || !modalEmail}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed transition-opacity"
                    style={{ backgroundColor: "var(--orange)" }}
                  >
                    {emailSending ? "Envoi…" : "Envoyer →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Screen-only chrome (hidden when printing) ── */}
      <header className="print-hidden sticky top-0 z-40 border-b border-white/10"
        style={{ backgroundColor: "var(--navy)" }}
      >
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3">
          <Link href="/" className="text-xl font-bold text-white shrink-0">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            <button
              onClick={onReset}
              className="text-sm text-blue-200 hover:text-white transition-colors shrink-0"
            >
              ← Nouveau
            </button>
            <button
              onClick={() => window.print()}
              className="text-sm font-semibold text-white px-3 py-2 rounded-lg shrink-0"
              style={{ backgroundColor: "var(--orange)" }}
            >
              🖨️ <span className="hidden sm:inline">Imprimer / PDF</span>
            </button>
            <button
              onClick={() => { setShowEmailModal(true); setEmailSent(false); setEmailError(""); }}
              className="text-sm font-semibold px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors shrink-0"
            >
              ✉️ <span className="hidden sm:inline">Email</span>
            </button>
            <button
              onClick={openWhatsApp}
              className="text-sm font-semibold px-3 py-2 rounded-lg text-white shrink-0"
              style={{ backgroundColor: "#25d366" }}
            >
              💬 <span className="hidden sm:inline">WhatsApp</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-10 print:p-0 print:max-w-none">
        {/* Success banner — hidden on print */}
        <div
          className="print-hidden flex items-center gap-3 rounded-xl px-5 py-4 mb-8 text-white"
          style={{ backgroundColor: "var(--navy)" }}
        >
          <span className="text-2xl">✅</span>
          <div>
            <p className="font-bold">Devis généré avec succès !</p>
            <p className="text-blue-200 text-sm">
              Votre devis professionnel est prêt. Cliquez sur &ldquo;Imprimer / PDF&rdquo; pour le télécharger.
            </p>
          </div>
        </div>

        {/* ── Devis document — this is what prints ── */}
        <div className="devis-document bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">

          {/* Document header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-extrabold mb-1" style={{ color: "var(--navy)" }}>
                DEVIS
              </h1>
              <p className="text-gray-500 text-sm">N° {result.devisNumber}</p>
              <p className="text-gray-500 text-sm">Émis le {result.date}</p>
              <p className="text-gray-500 text-sm">Valable jusqu&apos;au {result.validUntil}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--orange)" }}>
                Prestataire
              </p>
              {result.artisan.logoBase64 && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={result.artisan.logoBase64}
                  alt={result.artisan.name}
                  style={{ maxHeight: 80, maxWidth: 200 }}
                  className="object-contain mb-2"
                />
              )}
              <p className="font-bold text-gray-900">{result.artisan.name}</p>
              <p className="text-gray-500 text-sm">SIRET : {result.artisan.siret}</p>
              {result.artisan.address && (
                <p className="text-gray-500 text-sm">{result.artisan.address}</p>
              )}
              {result.artisan.phone && (
                <p className="text-gray-500 text-sm">{result.artisan.phone}</p>
              )}
              {result.artisan.email && (
                <p className="text-gray-500 text-sm">{result.artisan.email}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--orange)" }}>
                Client
              </p>
              <p className="font-bold text-gray-900">{result.client.name}</p>
              <p className="text-gray-500 text-sm">{result.client.address}</p>
              {result.client.phone && (
                <p className="text-gray-500 text-sm">{result.client.phone}</p>
              )}
              {result.client.email && (
                <p className="text-gray-500 text-sm">{result.client.email}</p>
              )}
            </div>
          </div>

          {/* Lines table */}
          <div className="mb-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="text-left text-white text-xs uppercase tracking-wider"
                  style={{ backgroundColor: "var(--navy)" }}
                >
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3 text-right w-16">Qté</th>
                  <th className="px-4 py-3 text-right w-28">PU HT</th>
                  <th className="px-4 py-3 text-right w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9fafb" : "#ffffff" }}>
                    <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{line.description}</td>
                    <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{line.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{line.unitPrice.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800 border-b border-gray-100">{line.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-10">
            <div className="w-72 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Sous-total HT</span>
                <span>{result.subtotalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>TVA ({result.tvaRate}%)</span>
                <span>{result.tvaAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold pt-3 border-t-2 border-gray-300"
                style={{ color: "var(--navy)" }}
              >
                <span>Total TTC</span>
                <span>{result.totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {result.notes && (
            <div className="mb-8 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--navy)" }}>
                Notes
              </p>
              <p className="text-gray-600 text-sm leading-relaxed">{result.notes}</p>
            </div>
          )}

          {/* Signature block */}
          <div className="grid grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Bon pour accord — Signature client
              </p>
              <div className="h-20 border border-dashed border-gray-300" />
              <p className="text-xs text-gray-400 mt-2">Date :</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-3">
                Cachet et signature prestataire
              </p>
              <div className="h-20 border border-dashed border-gray-300" />
            </div>
          </div>

          {/* Legal mentions */}
          <p className="mt-8 text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-6">
            {result.legalMentions}
          </p>

          {/* DevisFlow credit */}
          <p className="mt-4 text-xs text-gray-300 text-right">
            Propulsé par DevisFlow
          </p>
        </div>

        {/* ── Screen-only action buttons ── */}
        <div className="print-hidden mt-8 flex flex-wrap gap-4 justify-center pb-12">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-xl"
            style={{ backgroundColor: "var(--navy)" }}
          >
            🖨️ Imprimer / Télécharger PDF
          </button>
          <button
            onClick={() => { setShowEmailModal(true); setEmailSent(false); setEmailError(""); }}
            className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl border-2 transition-colors"
            style={{ borderColor: "var(--navy)", color: "var(--navy)" }}
          >
            ✉️ Envoyer par email
          </button>
          <button
            onClick={openWhatsApp}
            className="flex items-center gap-2 font-semibold px-6 py-3 rounded-xl text-white"
            style={{ backgroundColor: "#25d366" }}
          >
            💬 Envoyer via WhatsApp
          </button>
        </div>
      </main>
    </div>
  );
}
