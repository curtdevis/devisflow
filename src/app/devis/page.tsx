"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";

// ── Profession data ────────────────────────────────────────────────────────────

const PROFESSIONS = [
  { id: "plombier",     label: "Plombier",      icon: "🔧" },
  { id: "electricien", label: "Électricien",    icon: "⚡" },
  { id: "peintre",     label: "Peintre",        icon: "🖌️" },
  { id: "macon",       label: "Maçon",          icon: "🧱" },
  { id: "menuisier",   label: "Menuisier",      icon: "🪚" },
  { id: "chauffagiste",label: "Chauffagiste",   icon: "🔥" },
  { id: "carreleur",   label: "Carreleur",      icon: "🏗️" },
  { id: "autre",       label: "Autre",          icon: "🛠️" },
];

const QUICK_ITEMS: Record<string, Array<{ description: string; unitPrice: number; unit: string }>> = {
  plombier: [
    { description: "Remplacement robinet", unitPrice: 45, unit: "u" },
    { description: "Débouchage canalisation", unitPrice: 120, unit: "u" },
    { description: "Installation douche complète", unitPrice: 350, unit: "u" },
    { description: "Remplacement chauffe-eau 200L", unitPrice: 450, unit: "u" },
    { description: "Réparation fuite apparent", unitPrice: 85, unit: "u" },
    { description: "Pose WC suspendu", unitPrice: 280, unit: "u" },
    { description: "Installation lave-vaisselle", unitPrice: 95, unit: "u" },
    { description: "Tuyauterie cuivre (par ml)", unitPrice: 35, unit: "ml" },
  ],
  electricien: [
    { description: "Installation tableau électrique", unitPrice: 650, unit: "u" },
    { description: "Pose prise + interrupteur", unitPrice: 45, unit: "u" },
    { description: "Installation éclairage LED", unitPrice: 85, unit: "u" },
    { description: "Mise aux normes installation", unitPrice: 1200, unit: "forfait" },
    { description: "Pose VMC simple flux", unitPrice: 380, unit: "u" },
    { description: "Installation climatisation split", unitPrice: 1500, unit: "u" },
    { description: "Passage câble (par ml)", unitPrice: 12, unit: "ml" },
    { description: "Borne recharge EV", unitPrice: 800, unit: "u" },
  ],
  peintre: [
    { description: "Peinture intérieure (m²)", unitPrice: 18, unit: "m²" },
    { description: "Peinture plafond (m²)", unitPrice: 15, unit: "m²" },
    { description: "Enduit de finition (m²)", unitPrice: 12, unit: "m²" },
    { description: "Pose papier peint (m²)", unitPrice: 22, unit: "m²" },
    { description: "Peinture façade (m²)", unitPrice: 25, unit: "m²" },
    { description: "Décapage ancienne peinture", unitPrice: 20, unit: "m²" },
    { description: "Impression bouche-pores (m²)", unitPrice: 10, unit: "m²" },
    { description: "Laque boiserie (ml)", unitPrice: 15, unit: "ml" },
  ],
  macon: [
    { description: "Démolition cloison (m²)", unitPrice: 35, unit: "m²" },
    { description: "Cloison plâtre BA13 (m²)", unitPrice: 65, unit: "m²" },
    { description: "Carrelage sol pose (m²)", unitPrice: 45, unit: "m²" },
    { description: "Ragréage sol (m²)", unitPrice: 15, unit: "m²" },
    { description: "Enduit façade (m²)", unitPrice: 40, unit: "m²" },
    { description: "Isolation thermique (m²)", unitPrice: 55, unit: "m²" },
    { description: "Chape béton (m²)", unitPrice: 30, unit: "m²" },
    { description: "Reprise fissure façade", unitPrice: 180, unit: "u" },
  ],
  menuisier: [
    { description: "Pose porte intérieure", unitPrice: 280, unit: "u" },
    { description: "Fenêtre PVC double vitrage", unitPrice: 650, unit: "u" },
    { description: "Placard sur mesure", unitPrice: 450, unit: "u" },
    { description: "Parquet flottant (m²)", unitPrice: 35, unit: "m²" },
    { description: "Porte d'entrée sécurisée", unitPrice: 850, unit: "u" },
    { description: "Volet roulant électrique", unitPrice: 380, unit: "u" },
    { description: "Escalier bois sur mesure", unitPrice: 2800, unit: "u" },
    { description: "Cuisine (par ml)", unitPrice: 800, unit: "ml" },
  ],
  chauffagiste: [
    { description: "Chaudière gaz condensation", unitPrice: 2200, unit: "u" },
    { description: "Remplacement radiateur", unitPrice: 280, unit: "u" },
    { description: "Entretien chaudière annuel", unitPrice: 120, unit: "u" },
    { description: "Dépannage chauffage", unitPrice: 150, unit: "forfait" },
    { description: "Plancher chauffant (m²)", unitPrice: 65, unit: "m²" },
    { description: "Robinet thermostatique", unitPrice: 55, unit: "u" },
    { description: "Purge et équilibrage", unitPrice: 180, unit: "forfait" },
    { description: "Chaudière à granulés", unitPrice: 4500, unit: "u" },
  ],
  carreleur: [
    { description: "Carrelage sol (m²)", unitPrice: 50, unit: "m²" },
    { description: "Carrelage mural (m²)", unitPrice: 55, unit: "m²" },
    { description: "Faïence salle de bain", unitPrice: 1200, unit: "forfait" },
    { description: "Dépose ancien carrelage (m²)", unitPrice: 20, unit: "m²" },
    { description: "Mosaïque décorative (m²)", unitPrice: 85, unit: "m²" },
    { description: "Joint carrelage (m²)", unitPrice: 15, unit: "m²" },
    { description: "Préparation surface (m²)", unitPrice: 12, unit: "m²" },
    { description: "Plinthes carrelage (ml)", unitPrice: 18, unit: "ml" },
  ],
  autre: [],
};

// ── Types ──────────────────────────────────────────────────────────────────────

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
  id?: string | null;          // DB row id — returned by /api/generate-devis, used for invoice conversion
  devisNumber: string;
  date: string;
  validUntil: string;
  artisan: { name: string; siret: string; address?: string; phone?: string; email?: string; logoBase64?: string };
  client: { name: string; address: string; phone: string; email: string };
  lines: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  notes: string;
  legalMentions: string;
}

interface ClientSuggestion {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
}

const EMPTY_MATERIAL: Material = { description: "", quantity: "1", unitPrice: "" };
const DRAFT_KEY = "devisflow_draft_v2";

const inputClass = "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow text-sm";

// ── Progress bar ───────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const steps = ["Votre entreprise", "Votre client", "Les travaux"];
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-0">
          <div
            className="h-full transition-all duration-500"
            style={{ backgroundColor: "var(--orange)", width: `${((step - 1) / 2) * 100}%` }}
          />
        </div>
        {steps.map((label, i) => {
          const s = i + 1;
          const done = s < step;
          const active = s === step;
          return (
            <div key={label} className="flex flex-col items-center gap-2 z-10 bg-gray-50 px-2">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all ${
                  done ? "text-white border-transparent" :
                  active ? "text-white border-transparent" :
                  "text-gray-400 bg-white border-gray-200"
                }`}
                style={done || active ? { backgroundColor: done ? "#10b981" : "var(--orange)" } : {}}
              >
                {done ? "✓" : s}
              </div>
              <span className={`text-xs font-semibold hidden sm:block ${active ? "" : "text-gray-400"}`} style={active ? { color: "var(--navy)" } : {}}>
                {label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function DevisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("");
  const [form, setForm] = useState<FormData>({
    clientName: "", clientAddress: "", clientPhone: "", clientEmail: "",
    workDescription: "", materials: [{ ...EMPTY_MATERIAL }],
    laborHours: "", hourlyRate: "", tvaRate: "20", validityDays: "30",
    artisanName: "", artisanSiret: "", artisanAddress: "", artisanPhone: "", artisanEmail: "",
    customNotes: "",
  });
  const [logoBase64, setLogoBase64] = useState("");
  const [logoError, setLogoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DevisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dashboardHref, setDashboardHref] = useState("/dashboard");
  const [reminders, setReminders] = useState({ enabled: true, frequencyDays: "3", maxCount: "2", tone: "professionnel" });
  const [clients, setClients] = useState<ClientSuggestion[]>([]);
  const [clientSuggestions, setClientSuggestions] = useState<ClientSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);

  // Load draft first (sync) then profile — profile only fills artisan fields that are still empty
  useEffect(() => {
    // 1. Restore draft from localStorage
    let draftForm: Partial<FormData> = {};
    let draftProfession = "";
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.profession) { draftProfession = draft.profession; setProfession(draft.profession); }
        if (draft.form) { draftForm = draft.form; setForm(prev => ({ ...prev, ...draft.form })); }
      }
    } catch { /* ignore */ }

    // 2. Load profile and clients — profile fills artisan fields only if still empty after draft
    async function init() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const type = user.user_metadata?.account_type;
      setDashboardHref(type === "agence" ? "/agence" : "/dashboard");

      const [{ data: profile }, clientsRes] = await Promise.all([
        supabase.from("profiles").select("full_name,siret,phone,address,email").eq("id", user.id).single(),
        fetch("/api/clients"),
      ]);

      if (profile) {
        setForm(prev => ({
          ...prev,
          // Profile fields win over empty defaults but not over saved draft values
          artisanName: prev.artisanName || profile.full_name || "",
          artisanSiret: prev.artisanSiret || profile.siret || "",
          artisanPhone: prev.artisanPhone || profile.phone || "",
          artisanAddress: prev.artisanAddress || profile.address || "",
          artisanEmail: prev.artisanEmail || profile.email || user.email || "",
        }));
      }

      if (clientsRes.ok) {
        const data = await clientsRes.json();
        setClients(data);
      }
    }
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ form, profession }));
        setDraftSaved(true);
        setTimeout(() => setDraftSaved(false), 2000);
      } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(timer);
  }, [form, profession]);

  // Client autocomplete
  useEffect(() => {
    const q = form.clientName.trim().toLowerCase();
    if (q.length < 2) { setClientSuggestions([]); return; }
    const filtered = clients.filter(c => c.name.toLowerCase().includes(q));
    setClientSuggestions(filtered.slice(0, 5));
  }, [form.clientName, clients]);

  // Real-time totals
  const materialsTotal = form.materials.reduce((s, m) => {
    return s + parseFloat(m.quantity || "0") * parseFloat(m.unitPrice || "0");
  }, 0);
  const laborTotal = parseFloat(form.laborHours || "0") * parseFloat(form.hourlyRate || "0");
  const subtotalHT = materialsTotal + laborTotal;
  const tvaRate = parseFloat(form.tvaRate);
  const tvaAmount = subtotalHT * (tvaRate / 100);
  const totalTTC = subtotalHT + tvaAmount;

  function updateField<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function updateMaterial(index: number, field: keyof Material, value: string) {
    setForm(prev => {
      const mats = [...prev.materials];
      mats[index] = { ...mats[index], [field]: value };
      return { ...prev, materials: mats };
    });
  }

  function addMaterial() {
    setForm(prev => ({ ...prev, materials: [...prev.materials, { ...EMPTY_MATERIAL }] }));
  }

  function removeMaterial(index: number) {
    setForm(prev => ({ ...prev, materials: prev.materials.filter((_, i) => i !== index) }));
  }

  function addQuickItem(item: { description: string; unitPrice: number }) {
    setForm(prev => ({
      ...prev,
      materials: [...prev.materials.filter(m => m.description || m.unitPrice), { description: item.description, quantity: "1", unitPrice: String(item.unitPrice) }],
    }));
  }

  function selectClient(c: ClientSuggestion) {
    setForm(prev => ({
      ...prev,
      clientName: c.name,
      clientEmail: c.email ?? prev.clientEmail,
      clientPhone: c.phone ?? prev.clientPhone,
      clientAddress: c.address ?? prev.clientAddress,
    }));
    setShowSuggestions(false);
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg","image/png","image/svg+xml"].includes(file.type)) { setLogoError("Format non supporté. JPG, PNG ou SVG."); return; }
    if (file.size > 2 * 1024 * 1024) { setLogoError("Fichier trop volumineux (max 2 MB)."); return; }
    setLogoError("");
    const reader = new FileReader();
    reader.onload = ev => setLogoBase64(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      // Auto-save client
      if (form.clientName) {
        fetch("/api/clients", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: form.clientName, email: form.clientEmail, phone: form.clientPhone, address: form.clientAddress }),
        }).catch(() => {});
      }

      const res = await fetch("/api/generate-devis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          profession,
          logoBase64,
          reminderEnabled: reminders.enabled && !!form.clientEmail,
          reminderFrequencyDays: parseInt(reminders.frequencyDays),
          reminderMaxCount: parseInt(reminders.maxCount),
          reminderTone: reminders.tone,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de la génération du devis.");
      }
      const data = await res.json();
      setResult(data);
      localStorage.removeItem(DRAFT_KEY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  }

  if (result) {
    return <DevisPreview result={result} onReset={() => router.push(dashboardHref)} />;
  }

  const quickItems = QUICK_ITEMS[profession] ?? [];

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{`
        .suggestion-item:hover { background: rgba(30,58,95,0.06); }
      `}</style>

      <header className="sticky top-0 z-50 border-b border-white/10" style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex items-center gap-3">
            {draftSaved && <span className="text-xs text-blue-300">Brouillon sauvegardé ✓</span>}
            <Link href={dashboardHref} className="text-sm font-semibold px-4 py-2 rounded-lg text-white border border-white/30 hover:bg-white/10 transition-colors">
              Mon espace →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "var(--navy)" }}>Nouveau devis</h1>
          <p className="text-gray-500 text-sm">Complétez les 3 étapes — votre devis IA sera prêt en 30 secondes.</p>
        </div>

        <ProgressBar step={step} />

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit}>

          {/* ══════════════════════════════════════════════
              STEP 1 — Votre entreprise
          ══════════════════════════════════════════════ */}
          {step === 1 && (
            <div className="space-y-6">
              {/* Profession selector */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-5" style={{ color: "var(--navy)" }}>Votre métier</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {PROFESSIONS.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setProfession(p.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 text-sm font-semibold transition-all hover:scale-105 ${
                        profession === p.id ? "text-white border-transparent" : "border-gray-100 text-gray-600 bg-gray-50 hover:border-gray-200"
                      }`}
                      style={profession === p.id ? { backgroundColor: "var(--navy)" } : {}}
                    >
                      <span className="text-2xl">{p.icon}</span>
                      <span>{p.label}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Artisan info */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-5" style={{ color: "var(--navy)" }}>Vos informations</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Raison sociale / Nom *</label>
                    <input type="text" required placeholder="Jean Dupont Plomberie" value={form.artisanName}
                      onChange={e => updateField("artisanName", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">SIRET *</label>
                    <input type="text" required placeholder="123 456 789 00012" value={form.artisanSiret}
                      onChange={e => updateField("artisanSiret", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" placeholder="06 12 34 56 78" value={form.artisanPhone}
                      onChange={e => updateField("artisanPhone", e.target.value)} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input type="text" placeholder="12 rue des Artisans, 75011 Paris" value={form.artisanAddress}
                      onChange={e => updateField("artisanAddress", e.target.value)} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email professionnel</label>
                    <input type="email" placeholder="contact@votre-entreprise.fr" value={form.artisanEmail}
                      onChange={e => updateField("artisanEmail", e.target.value)} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Logo <span className="text-gray-400 font-normal">(optionnel — JPG, PNG ou SVG, max 2 MB)</span>
                    </label>
                    <input type="file" accept="image/jpeg,image/png,image/svg+xml" onChange={handleLogoUpload}
                      className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:text-white cursor-pointer"
                    />
                    <style>{`input[type="file"]::file-selector-button { background-color: var(--navy); color: white; }`}</style>
                    {logoError && <p className="text-red-500 text-xs mt-1">{logoError}</p>}
                    {logoBase64 && !logoError && (
                      <div className="mt-3 p-3 border border-gray-100 rounded-xl bg-gray-50 inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={logoBase64} alt="Aperçu logo" style={{ maxHeight: 80, maxWidth: 240 }} className="object-contain" />
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="flex justify-end">
                <button type="button" onClick={() => { if (!form.artisanName || !form.artisanSiret) { setError("Veuillez renseigner votre nom et SIRET."); return; } setError(null); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all hover:scale-105 hover:shadow-lg"
                  style={{ backgroundColor: "var(--orange)" }}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 2 — Votre client
          ══════════════════════════════════════════════ */}
          {step === 2 && (
            <div className="space-y-6">
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-5" style={{ color: "var(--navy)" }}>Informations client</h2>
                <div className="grid sm:grid-cols-2 gap-4">

                  {/* Client name with autocomplete */}
                  <div className="sm:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nom du client *</label>
                    <input type="text" required placeholder="Marie Martin" value={form.clientName}
                      onChange={e => { updateField("clientName", e.target.value); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                      className={inputClass} autoComplete="off" />
                    {showSuggestions && clientSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-1 overflow-hidden">
                        {clientSuggestions.map(c => (
                          <button key={c.id} type="button" onClick={() => selectClient(c)}
                            className="suggestion-item w-full text-left px-4 py-3 border-b border-gray-50 last:border-0">
                            <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>{c.name}</p>
                            {(c.email || c.phone) && <p className="text-xs text-gray-400">{[c.email, c.phone].filter(Boolean).join(" · ")}</p>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input type="text" required placeholder="12 rue des Fleurs, 75001 Paris" value={form.clientAddress}
                      onChange={e => updateField("clientAddress", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" placeholder="06 12 34 56 78" value={form.clientPhone}
                      onChange={e => updateField("clientPhone", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" placeholder="client@email.com" value={form.clientEmail}
                      onChange={e => updateField("clientEmail", e.target.value)} className={inputClass} />
                  </div>
                </div>
              </section>

              <div className="flex justify-between">
                <button type="button" onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="font-semibold px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <button type="button" onClick={() => { if (!form.clientName || !form.clientAddress) { setError("Veuillez renseigner le nom et l'adresse du client."); return; } setError(null); setStep(3); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all hover:scale-105"
                  style={{ backgroundColor: "var(--orange)" }}>
                  Continuer →
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════
              STEP 3 — Les travaux
          ══════════════════════════════════════════════ */}
          {step === 3 && (
            <div className="space-y-6">

              {/* Quick items */}
              {quickItems.length > 0 && (
                <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                  <h2 className="text-lg font-bold mb-2" style={{ color: "var(--navy)" }}>
                    Prestations rapides — {PROFESSIONS.find(p => p.id === profession)?.label}
                  </h2>
                  <p className="text-sm text-gray-400 mb-5">Cliquez pour ajouter instantanément à votre devis.</p>
                  <div className="flex flex-wrap gap-2">
                    {quickItems.map(item => (
                      <button key={item.description} type="button" onClick={() => addQuickItem(item)}
                        className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-colors text-gray-700 font-medium">
                        <span className="text-xs text-gray-400">{item.unitPrice} €/{item.unit}</span>
                        <span>{item.description}</span>
                        <span className="text-gray-400 text-xs font-bold">+</span>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {/* Work description */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-5" style={{ color: "var(--navy)" }}>Description des travaux *</h2>
                <textarea required rows={4}
                  placeholder="Ex : Remplacement du chauffe-eau électrique 200L. Dépose de l'ancien appareil, fourniture et pose, raccordements, mise en service."
                  value={form.workDescription}
                  onChange={e => updateField("workDescription", e.target.value)}
                  className={`${inputClass} resize-none`} />
                <p className="text-xs text-gray-400 mt-2">Plus vous êtes précis, plus le devis sera détaillé.</p>
              </section>

              {/* Materials */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-5" style={{ color: "var(--navy)" }}>Matériaux et fournitures</h2>
                <div className="space-y-3">
                  {form.materials.map((mat, i) => (
                    <div key={i} className="flex gap-2 items-start">
                      <div className="flex-1">
                        <input type="text" placeholder="Description" value={mat.description}
                          onChange={e => updateMaterial(i, "description", e.target.value)} className={inputClass} />
                      </div>
                      <div className="w-20">
                        <input type="number" min="0" step="any" placeholder="Qté" value={mat.quantity}
                          onChange={e => updateMaterial(i, "quantity", e.target.value)} className={inputClass} />
                      </div>
                      <div className="w-28">
                        <input type="number" min="0" step="any" placeholder="Prix HT €" value={mat.unitPrice}
                          onChange={e => updateMaterial(i, "unitPrice", e.target.value)} className={inputClass} />
                      </div>
                      <div className="w-20 pt-3 text-xs font-semibold text-right" style={{ color: "var(--navy)" }}>
                        {(parseFloat(mat.quantity || "0") * parseFloat(mat.unitPrice || "0")).toFixed(0)} €
                      </div>
                      {form.materials.length > 1 && (
                        <button type="button" onClick={() => removeMaterial(i)}
                          className="mt-3 text-gray-300 hover:text-red-400 transition-colors text-xl leading-none">×</button>
                      )}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addMaterial} className="mt-4 text-sm font-semibold transition-colors" style={{ color: "var(--navy)" }}>
                  + Ajouter un matériau
                </button>
              </section>

              {/* Labor & TVA */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-5" style={{ color: "var(--navy)" }}>Main d&apos;œuvre et TVA</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Heures de travail *</label>
                    <input type="number" required min="0" step="0.5" placeholder="Ex : 8" value={form.laborHours}
                      onChange={e => updateField("laborHours", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taux horaire HT (€) *</label>
                    <input type="number" required min="0" step="any" placeholder="Ex : 55" value={form.hourlyRate}
                      onChange={e => updateField("hourlyRate", e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Taux de TVA *</label>
                    <select value={form.tvaRate} onChange={e => updateField("tvaRate", e.target.value as "10" | "20")} className={inputClass}>
                      <option value="10">10% — Rénovation</option>
                      <option value="20">20% — Taux normal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Validité du devis</label>
                    <select value={form.validityDays} onChange={e => updateField("validityDays", e.target.value)} className={inputClass}>
                      <option value="15">15 jours</option>
                      <option value="30">30 jours</option>
                      <option value="60">60 jours</option>
                      <option value="90">90 jours</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* Live totals */}
              {(subtotalHT > 0) && (
                <section className="rounded-2xl p-6 border-2" style={{ borderColor: "var(--orange)", backgroundColor: "rgba(249,115,22,0.04)" }}>
                  <h3 className="font-bold mb-4" style={{ color: "var(--navy)" }}>Estimation en temps réel</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Matériaux HT</span><span className="font-semibold">{materialsTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Main d&apos;œuvre HT</span><span className="font-semibold">{laborTotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Sous-total HT</span><span>{subtotalHT.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>TVA ({form.tvaRate}%)</span><span>{tvaAmount.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-lg font-extrabold pt-2 border-t border-orange-200" style={{ color: "var(--navy)" }}>
                      <span>Total TTC estimé</span><span>{totalTTC.toFixed(2)} €</span>
                    </div>
                  </div>
                </section>
              )}

              {/* Custom notes */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-bold mb-1" style={{ color: "var(--navy)" }}>
                  Notes personnalisées <span className="text-xs font-normal text-gray-400 ml-2">optionnel</span>
                </h2>
                <p className="text-sm text-gray-400 mb-4">Remplace les notes générées automatiquement par l&apos;IA.</p>
                <textarea rows={3} placeholder="Ex: Paiement à réception, travaux garantis 2 ans, déplacement inclus..."
                  value={form.customNotes} onChange={e => updateField("customNotes", e.target.value)}
                  className={`${inputClass} resize-none`} />
              </section>

              {/* Reminders */}
              <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold" style={{ color: "var(--navy)" }}>Relances automatiques</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Rappelle votre client par email si le devis est sans réponse</p>
                  </div>
                  <button type="button" onClick={() => setReminders(prev => ({ ...prev, enabled: !prev.enabled }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${reminders.enabled ? "bg-orange-500" : "bg-gray-200"}`}>
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${reminders.enabled ? "translate-x-5" : "translate-x-0.5"}`} />
                  </button>
                </div>
                {reminders.enabled && (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {!form.clientEmail && (
                      <div className="sm:col-span-3 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                        ⚠ Renseignez l&apos;email du client (étape 2) pour activer les relances.
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relancer tous les</label>
                      <select value={reminders.frequencyDays} onChange={e => setReminders(prev => ({ ...prev, frequencyDays: e.target.value }))} className={inputClass}>
                        <option value="2">2 jours</option>
                        <option value="3">3 jours</option>
                        <option value="5">5 jours</option>
                        <option value="7">7 jours</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de relances</label>
                      <select value={reminders.maxCount} onChange={e => setReminders(prev => ({ ...prev, maxCount: e.target.value }))} className={inputClass}>
                        <option value="1">1 relance</option>
                        <option value="2">2 relances</option>
                        <option value="3">3 relances</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ton de la relance</label>
                      <select value={reminders.tone} onChange={e => setReminders(prev => ({ ...prev, tone: e.target.value }))} className={inputClass}>
                        <option value="professionnel">Professionnel</option>
                        <option value="amical">Amical</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>
                )}
              </section>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-10">
                <button type="button" onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className="font-semibold px-6 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                  ← Retour
                </button>
                <div className="flex flex-col items-center gap-2">
                  <button type="submit" disabled={loading}
                    className="text-white font-bold text-lg px-12 py-4 rounded-xl shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed hover:scale-105"
                    style={{ backgroundColor: loading ? "#9ca3af" : "var(--orange)" }}>
                    {loading ? (
                      <span className="flex items-center gap-3">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Génération en cours…
                      </span>
                    ) : "Générer mon devis IA →"}
                  </button>
                  <p className="text-xs text-gray-400">Votre devis sera généré en moins de 30 secondes</p>
                </div>
              </div>
            </div>
          )}
        </form>
      </main>
    </div>
  );
}

// ── Signature pad ──────────────────────────────────────────────────────────────

function SignaturePad({ onSign }: { onSign: (dataUrl: string) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signed, setSigned] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw() {
    setIsDrawing(false);
    lastPos.current = null;
  }

  function clear() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setSigned(false);
  }

  function confirm() {
    const canvas = canvasRef.current; if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    setSigned(true);
    onSign(dataUrl);
  }

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden" style={{ touchAction: "none" }}>
      <canvas ref={canvasRef} width={600} height={150} className="w-full cursor-crosshair bg-white"
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw} />
      <div className="flex gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
        <button type="button" onClick={clear} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
          Effacer
        </button>
        <div className="flex-1" />
        {!signed ? (
          <button type="button" onClick={confirm}
            className="text-xs font-bold text-white px-4 py-1.5 rounded-lg"
            style={{ backgroundColor: "var(--navy)" }}>
            Valider la signature
          </button>
        ) : (
          <span className="text-xs font-bold text-green-600">✓ Signé</span>
        )}
      </div>
    </div>
  );
}

// ── Devis Preview ──────────────────────────────────────────────────────────────

function DevisPreview({ result, onReset }: { result: DevisResult; onReset: () => void }) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmail, setModalEmail] = useState(result.client.email ?? "");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [convertingInvoice, setConvertingInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  async function sendEmail() {
    if (!modalEmail) return;
    setEmailSending(true); setEmailError("");
    try {
      const res = await fetch("/api/send-devis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: modalEmail, devis: result }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? "Erreur envoi."); }
      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally { setEmailSending(false); }
  }

  function openWhatsApp() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`Bonjour ${result.client.name}, voici votre devis DevisFlow : ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleSign(dataUrl: string) {
    setSignatureData(dataUrl);
    setSignedAt(new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }));
    setShowSignature(false);
  }

  async function convertToInvoice() {
    if (!result.id) {
      setInvoiceNumber("ERR_NO_ID");
      return;
    }
    setConvertingInvoice(true);
    try {
      const res = await fetch("/api/create-invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devisId: result.id }),
      });
      const data = await res.json();
      if (res.ok) setInvoiceNumber(data.invoiceNumber);
    } catch { /* ignore */ } finally { setConvertingInvoice(false); }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Email modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            {emailSent ? (
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--navy)" }}>Email envoyé !</h3>
                <p className="text-gray-500 text-sm mb-6">Devis envoyé à <strong>{modalEmail}</strong>.</p>
                <button onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                  className="font-semibold px-6 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--navy)" }}>Fermer</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--navy)" }}>Envoyer le devis par email</h3>
                <p className="text-sm text-gray-400 mb-5">Le devis complet sera envoyé en HTML professionnel.</p>
                <input type="email" autoFocus value={modalEmail} onChange={e => setModalEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent mb-4"
                  onKeyDown={e => e.key === "Enter" && sendEmail()} />
                {emailError && <p className="text-red-500 text-sm mb-4">{emailError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                  <button onClick={sendEmail} disabled={emailSending || !modalEmail}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: "var(--orange)" }}>
                    {emailSending ? "Envoi…" : "Envoyer →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header chrome */}
      <header className="print-hidden sticky top-0 z-40 border-b border-white/10" style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3 flex-wrap">
          <Link href="/" className="text-xl font-bold text-white shrink-0">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={onReset} className="text-sm text-blue-200 hover:text-white transition-colors">← Nouveau</button>
            <button onClick={() => window.print()}
              className="text-sm font-semibold text-white px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--orange)" }}>
              🖨️ <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => { setShowEmailModal(true); setEmailSent(false); setEmailError(""); }}
              className="text-sm font-semibold px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
              ✉️ <span className="hidden sm:inline">Email</span>
            </button>
            <button onClick={openWhatsApp}
              className="text-sm font-semibold px-3 py-2 rounded-lg text-white" style={{ backgroundColor: "#25d366" }}>
              💬 <span className="hidden sm:inline">WhatsApp</span>
            </button>
            {!signatureData && (
              <button onClick={() => setShowSignature(s => !s)}
                className="text-sm font-semibold px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                ✍️ <span className="hidden sm:inline">Signer</span>
              </button>
            )}
            {!invoiceNumber && result.id && (
              <button onClick={convertToInvoice} disabled={convertingInvoice}
                className="text-sm font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60" style={{ backgroundColor: "#7c3aed" }}>
                {convertingInvoice ? "…" : "🧾 Facture"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Invoice conversion banner */}
      {invoiceNumber && (
        <div className="print-hidden px-4 py-3 text-sm font-semibold text-white text-center" style={{ backgroundColor: "#7c3aed" }}>
          ✓ Facture créée : <strong>{invoiceNumber}</strong> — <Link href="/dashboard/factures" className="underline">Voir mes factures →</Link>
        </div>
      )}

      {/* Signature pad */}
      {showSignature && !signatureData && (
        <div className="print-hidden max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold mb-1" style={{ color: "var(--navy)" }}>Signature client</h3>
            <p className="text-sm text-gray-400 mb-4">Le client signe ci-dessous (souris ou doigt sur mobile)</p>
            <SignaturePad onSign={handleSign} />
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-10 print:p-0 print:max-w-none">
        {/* Success banner */}
        <div className="print-hidden flex items-center justify-between gap-3 rounded-xl px-5 py-4 mb-8 text-white" style={{ backgroundColor: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">Devis généré et sauvegardé !</p>
              <p className="text-blue-200 text-sm">Imprimez ou envoyez, puis retrouvez-le dans votre dashboard.</p>
            </div>
          </div>
          <Link href="/dashboard" className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap">
            Dashboard →
          </Link>
        </div>

        {/* Devis document */}
        <div className="devis-document bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-extrabold mb-1" style={{ color: "var(--navy)" }}>DEVIS</h1>
              <p className="text-sm text-gray-500">N°&nbsp;{result.devisNumber}</p>
              <p className="text-sm text-gray-500">Émis le {result.date}</p>
              <p className="text-sm text-gray-500">Valable jusqu&apos;au {result.validUntil}</p>
            </div>
            {result.artisan.logoBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.artisan.logoBase64} alt={result.artisan.name} style={{ maxHeight: 80, maxWidth: 200 }} className="object-contain" />
            )}
          </div>

          {/* Parties */}
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Prestataire</p>
              <p className="font-bold text-gray-900">{result.artisan.name}</p>
              <p className="text-sm text-gray-500">SIRET : {result.artisan.siret}</p>
              {result.artisan.address && <p className="text-sm text-gray-500">{result.artisan.address}</p>}
              {result.artisan.phone && <p className="text-sm text-gray-500">{result.artisan.phone}</p>}
              {result.artisan.email && <p className="text-sm text-gray-500">{result.artisan.email}</p>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Client</p>
              <p className="font-bold text-gray-900">{result.client.name}</p>
              <p className="text-sm text-gray-500">{result.client.address}</p>
              {result.client.phone && <p className="text-sm text-gray-500">{result.client.phone}</p>}
              {result.client.email && <p className="text-sm text-gray-500">{result.client.email}</p>}
            </div>
          </div>

          {/* Line items */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: "var(--navy)", color: "white" }}>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-bold">Description</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide font-bold w-16">Qté</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide font-bold w-28">PU HT</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide font-bold w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9fafb" : "white" }}>
                    <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{line.description}</td>
                    <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{line.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{line.unitPrice.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 border-b border-gray-100">{line.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between text-sm text-gray-500 py-1">
                <span>Sous-total HT</span><span>{result.subtotalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 py-1">
                <span>TVA ({result.tvaRate}%)</span><span>{result.tvaAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold pt-3 mt-2 border-t-2 border-gray-300" style={{ color: "var(--navy)" }}>
                <span>Total TTC</span><span>{result.totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {result.notes && (
            <div className="mb-8 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--navy)" }}>Notes</p>
              <p className="text-sm text-gray-600 leading-relaxed">{result.notes}</p>
            </div>
          )}

          {/* Signature blocks */}
          <div className="grid sm:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Bon pour accord — Signature client</p>
              {signatureData ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureData} alt="Signature client" className="max-h-20 border border-gray-100 rounded" />
                  <p className="text-xs text-gray-400 mt-2">Signé le {signedAt}</p>
                </div>
              ) : (
                <div>
                  <div className="h-20 border border-dashed border-gray-300 rounded-lg" />
                  <p className="text-xs text-gray-400 mt-2">Date :</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Cachet et signature prestataire</p>
              <div className="h-20 border border-dashed border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Legal */}
          {result.legalMentions && (
            <p className="mt-8 text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-6">{result.legalMentions}</p>
          )}
          <p className="mt-4 text-xs text-gray-300 text-right">Propulsé par DevisFlow</p>
        </div>
      </main>
    </div>
  );
}
