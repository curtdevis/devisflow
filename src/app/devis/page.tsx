"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createSupabaseBrowser } from "@/lib/supabase-browser";
import { calculateDevisTotals, calculateLaborCost, calculateMaterialsSubtotal } from "@/lib/devis-calculations";
import { DevisPreview, type DevisResult } from "./DevisPreview";
import CheckoutButton from "@/app/_components/CheckoutButton";

// ── Profession data ────────────────────────────────────────────────────────────

const PROFESSIONS = [
  { id: "plombier",     label: "Plombier",      icon: "🔧" },
  { id: "electricien", label: "Électricien",    icon: "⚡" },
  { id: "peintre",     label: "Peintre",        icon: "🖌️" },
  { id: "macon",       label: "Maçon",          icon: "🧱" },
  { id: "menuisier",   label: "Menuisier",      icon: "🪚" },
  { id: "chauffagiste",label: "Chauffagiste",   icon: "🔥" },
  { id: "carreleur",   label: "Carreleur",      icon: "🏗️" },
  { id: "couvreur",    label: "Couvreur",       icon: "🏠" },
  { id: "serrurier",   label: "Serrurier",      icon: "🔑" },
  { id: "vitrier",     label: "Vitrier",        icon: "🪟" },
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
    { description: "Pose spots encastrables (lot de 5)", unitPrice: 175, unit: "u" },
    { description: "Passage câble (par ml)", unitPrice: 12, unit: "ml" },
    { description: "Borne recharge EV", unitPrice: 800, unit: "u" },
    { description: "Installation domotique", unitPrice: 1200, unit: "forfait" },
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
    { description: "Terrassement — décapage/nivellement (m²)", unitPrice: 18, unit: "m²" },
    { description: "Fondations béton armé (m³)", unitPrice: 320, unit: "m³" },
    { description: "Élévation murs parpaings (m²)", unitPrice: 75, unit: "m²" },
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
    { description: "Installation climatisation split", unitPrice: 1500, unit: "u" },
    { description: "Installation climatisation gainable", unitPrice: 3200, unit: "u" },
    { description: "Entretien climatisation annuel", unitPrice: 100, unit: "u" },
    { description: "Recharge gaz climatisation", unitPrice: 150, unit: "u" },
  ],
  carreleur: [
    { description: "Carrelage sol (m²)", unitPrice: 50, unit: "m²" },
    { description: "Carrelage mural (m²)", unitPrice: 55, unit: "m²" },
    { description: "Faïence salle de bain", unitPrice: 1200, unit: "forfait" },
    { description: "Dépose ancien carrelage (m²)", unitPrice: 20, unit: "m²" },
    { description: "Ragréage sol (m²)", unitPrice: 12, unit: "m²" },
    { description: "Mosaïque décorative (m²)", unitPrice: 85, unit: "m²" },
    { description: "Joint carrelage (m²)", unitPrice: 15, unit: "m²" },
    { description: "Préparation surface (m²)", unitPrice: 12, unit: "m²" },
    { description: "Plinthes carrelage (ml)", unitPrice: 18, unit: "ml" },
  ],
  couvreur: [
    { description: "Réfection toiture (m²)", unitPrice: 90, unit: "m²" },
    { description: "Pose tuiles (m²)", unitPrice: 75, unit: "m²" },
    { description: "Réparation fuite toiture", unitPrice: 220, unit: "forfait" },
    { description: "Nettoyage toiture (m²)", unitPrice: 8, unit: "m²" },
    { description: "Démoussage toiture (m²)", unitPrice: 12, unit: "m²" },
    { description: "Pose gouttière (ml)", unitPrice: 35, unit: "ml" },
    { description: "Isolation combles perdus (m²)", unitPrice: 30, unit: "m²" },
    { description: "Zinguerie (ml)", unitPrice: 45, unit: "ml" },
  ],
  serrurier: [
    { description: "Ouverture de porte", unitPrice: 90, unit: "u" },
    { description: "Remplacement serrure", unitPrice: 150, unit: "u" },
    { description: "Pose serrure 3 points", unitPrice: 380, unit: "u" },
    { description: "Installation porte blindée", unitPrice: 1800, unit: "u" },
    { description: "Changement cylindre", unitPrice: 80, unit: "u" },
    { description: "Blindage de porte", unitPrice: 950, unit: "u" },
    { description: "Dépannage volet roulant", unitPrice: 130, unit: "forfait" },
    { description: "Copie de clé sécurisée", unitPrice: 25, unit: "u" },
  ],
  vitrier: [
    { description: "Remplacement vitre simple", unitPrice: 90, unit: "u" },
    { description: "Double vitrage sur mesure (m²)", unitPrice: 180, unit: "m²" },
    { description: "Réparation vitre cassée", unitPrice: 120, unit: "u" },
    { description: "Pose miroir sur mesure (m²)", unitPrice: 150, unit: "m²" },
    { description: "Survitrage isolation phonique (m²)", unitPrice: 160, unit: "m²" },
    { description: "Vitrage sécurité feuilleté (m²)", unitPrice: 200, unit: "m²" },
    { description: "Remplacement joint de vitrage (ml)", unitPrice: 15, unit: "ml" },
    { description: "Vitrine magasin", unitPrice: 850, unit: "u" },
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

// ── Trial banner ───────────────────────────────────────────────────────────────

function TrialBanner({ plan }: { plan: string | null }) {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);
  useEffect(() => {
    if (plan === "paid") return;
    createSupabaseBrowser().auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const daysSince = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
      const left = Math.max(0, Math.ceil(TRIAL_DAYS - daysSince));
      setDaysLeft(left);
    });
  }, [plan]);

  if (plan === "paid" || daysLeft === null) return null;

  return (
    <div className={`mb-6 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-4 flex-wrap ${daysLeft <= 1 ? "bg-red-50 border border-red-200" : "bg-orange-50 border border-orange-200"}`}>
      <span style={{ color: daysLeft <= 1 ? "#b91c1c" : "#9a3412" }}>
        {daysLeft <= 1
          ? "⚠️ Dernier jour d'essai ! Passez à Artisan Solo pour continuer."
          : `⏳ Essai gratuit — ${daysLeft} jour${daysLeft > 1 ? "s" : ""} restant${daysLeft > 1 ? "s" : ""}`}
      </span>
      <CheckoutButton
        className="text-xs font-bold px-3 py-1.5 rounded-lg text-white whitespace-nowrap"
        style={{ backgroundColor: "#f97316" }}
      >
        Passer à Artisan Solo →
      </CheckoutButton>
    </div>
  );
}

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

const TRIAL_DAYS = 7;

export default function DevisPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [profession, setProfession] = useState("");
  const [trialExpired, setTrialExpired] = useState(false);
  const [userPlan, setUserPlan] = useState<string | null>(null);
  // True when this account is eligible for the high (20 / "illimité")
  // reminder cap — either directly (own tier) or via Intermédiaire
  // "multi-utilisateurs" coverage. Resolved server-side via
  // /api/account/effective-access since a team member's own profile.tier is
  // never "intermediaire" (only the owner's is) — see that route for why.
  const [highReminderTier, setHighReminderTier] = useState(false);
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

  // ── API intégrations ─────────────────────────────────────────────────────────
  const [clientAddrSuggestions, setClientAddrSuggestions] = useState<string[]>([]);
  const [showClientAddr, setShowClientAddr] = useState(false);
  const [artisanAddrSuggestions, setArtisanAddrSuggestions] = useState<string[]>([]);
  const [showArtisanAddr, setShowArtisanAddr] = useState(false);
  const [siretLoading, setSiretLoading] = useState(false);
  const [siretFound, setSiretFound] = useState<boolean | null>(null);
  const [holidayWarning, setHolidayWarning] = useState<string | null>(null);

  // Load draft first (sync) then profile — profile only fills artisan fields that are still empty
  useEffect(() => {
    // 1. Restore draft from localStorage
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft = JSON.parse(saved);
        if (draft.profession) setProfession(draft.profession);
        if (draft.form) setForm(prev => ({ ...prev, ...draft.form }));
      }
    } catch { /* ignore */ }

    // 2. Load profile and clients — profile fills artisan fields only if still empty after draft
    async function init() {
      const supabase = createSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();

      // Require login before generating a quote
      if (!user) {
        router.push("/auth/register?redirect=devis");
        return;
      }

      const type = user.user_metadata?.account_type;
      setDashboardHref(type === "agence" ? "/agence" : "/dashboard");

      type ProfileRow = { full_name: string | null; siret: string | null; phone: string | null; address: string | null; email: string | null; plan: string | null; tier: string | null };
      const [{ data: profile }, clientsRes, accessRes] = await Promise.all([
        supabase.from("profiles").select("full_name,siret,phone,address,email,plan,tier").eq("id", user.id).single<ProfileRow>(),
        fetch("/api/clients"),
        fetch("/api/account/effective-access"),
      ]);

      // Effective plan/trial/reminder-tier — accounts for Cabinet &
      // Groupement (agence_id) and Intermédiaire "multi-utilisateurs"
      // (member_of) coverage, not just this user's own plan/created_at.
      // Falls back to the raw own-profile check if the endpoint can't be
      // reached, matching the previous (pre-coverage-aware) behaviour.
      if (accessRes.ok) {
        const access: { plan: string; trialExpired: boolean; reminderTierHigh: boolean } = await accessRes.json();
        setUserPlan(access.plan);
        setTrialExpired(access.trialExpired);
        setHighReminderTier(access.reminderTierHigh);
      } else {
        const plan = profile?.plan ?? "free";
        setUserPlan(plan);
        setHighReminderTier(profile?.tier === "intermediaire" || profile?.tier === "agence");
        if (plan !== "paid") {
          const createdAt = new Date(user.created_at).getTime();
          const daysSince = (Date.now() - createdAt) / (1000 * 60 * 60 * 24);
          if (daysSince > TRIAL_DAYS) {
            setTrialExpired(true);
          }
        }
      }

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

  // API Adresse — client address autocomplete (api-adresse.data.gouv.fr)
  useEffect(() => {
    if (form.clientAddress.length < 4) { setClientAddrSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(form.clientAddress)}&limit=5`);
        const data = await res.json();
        setClientAddrSuggestions(data.features?.map((f: { properties: { label: string } }) => f.properties.label) ?? []);
      } catch { setClientAddrSuggestions([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.clientAddress]);

  // API Adresse — artisan address autocomplete
  useEffect(() => {
    if (form.artisanAddress.length < 4) { setArtisanAddrSuggestions([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(form.artisanAddress)}&limit=5`);
        const data = await res.json();
        setArtisanAddrSuggestions(data.features?.map((f: { properties: { label: string } }) => f.properties.label) ?? []);
      } catch { setArtisanAddrSuggestions([]); }
    }, 350);
    return () => clearTimeout(timer);
  }, [form.artisanAddress]);

  // recherche-entreprises.api.gouv.fr — SIRET lookup → autofill artisan info
  useEffect(() => {
    const siret = form.artisanSiret.replace(/[\s.]/g, "");
    if (siret.length !== 14) { setSiretFound(null); setSiretLoading(false); return; }
    setSiretLoading(true);
    setSiretFound(null);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siret}&per_page=1`);
        const data = await res.json();
        const first = data.results?.[0];
        if (first) {
          const nom = first.nom_raison_sociale || first.nom_complet || "";
          const addr = [first.siege?.adresse, first.siege?.code_postal, first.siege?.libelle_commune].filter(Boolean).join(" ");
          setForm(prev => ({
            ...prev,
            artisanName: prev.artisanName || nom,
            artisanAddress: prev.artisanAddress || addr,
          }));
          setSiretFound(true);
        } else {
          setSiretFound(false);
        }
      } catch { setSiretFound(false); }
      finally { setSiretLoading(false); }
    }, 700);
    return () => clearTimeout(timer);
  }, [form.artisanSiret]);

  // Nager.Date — public holiday warning on validity end date
  useEffect(() => {
    if (!form.validityDays) { setHolidayWarning(null); return; }
    const end = new Date();
    end.setDate(end.getDate() + parseInt(form.validityDays));
    const year = end.getFullYear();
    const dateStr = `${year}-${String(end.getMonth() + 1).padStart(2, "0")}-${String(end.getDate()).padStart(2, "0")}`;
    fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/FR`)
      .then(r => r.json())
      .then((holidays: Array<{ date: string; localName: string }>) => {
        const match = holidays.find(h => h.date === dateStr);
        setHolidayWarning(match ? match.localName : null);
      })
      .catch(() => setHolidayWarning(null));
  }, [form.validityDays]);

  // Real-time totals
  const materialsTotal = calculateMaterialsSubtotal(
    form.materials.map(m => ({ quantity: parseFloat(m.quantity || "0"), unitPrice: parseFloat(m.unitPrice || "0") }))
  );
  const laborTotal = calculateLaborCost(parseFloat(form.laborHours || "0"), parseFloat(form.hourlyRate || "0"));
  const subtotalHT = materialsTotal + laborTotal;
  const tvaRate = parseFloat(form.tvaRate);
  const { tvaAmount, totalTTC } = calculateDevisTotals(subtotalHT, tvaRate);

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

  // Trial expired wall — show upgrade prompt instead of form
  if (trialExpired && userPlan !== "paid") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f9fafb" }}>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">⏳</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: "#1e3a5f" }}>
            Votre essai gratuit est terminé
          </h1>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed">
            Vous avez profité de {TRIAL_DAYS} jours d&apos;accès gratuit. Passez à l&apos;abonnement Artisan Solo pour continuer à générer des devis sans limite.
          </p>
          <CheckoutButton
            className="w-full py-4 rounded-xl text-white font-extrabold text-base shadow-md transition-all hover:scale-[1.02] active:scale-95 mb-3"
            style={{ backgroundColor: "#f97316" }}
          >
            Passer à Artisan Solo — 29 €/mois →
          </CheckoutButton>
          <Link
            href="/dashboard"
            className="block text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
    );
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

        {/* Trial banner for free users */}
        <TrialBanner plan={userPlan} />

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
                    <div className="relative">
                      <input type="text" required placeholder="123 456 789 00012" value={form.artisanSiret}
                        onChange={e => updateField("artisanSiret", e.target.value)} className={`${inputClass} pr-20`} />
                      {siretLoading && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 animate-pulse pointer-events-none">Recherche…</span>}
                      {siretFound === true && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-green-600 pointer-events-none">✓ Trouvé</span>}
                      {siretFound === false && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-red-400 pointer-events-none">✗ Inconnu</span>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                    <input type="tel" placeholder="06 12 34 56 78" value={form.artisanPhone}
                      onChange={e => updateField("artisanPhone", e.target.value)} className={inputClass} />
                  </div>
                  <div className="sm:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                    <input type="text" placeholder="12 rue des Artisans, 75011 Paris" value={form.artisanAddress}
                      onChange={e => { updateField("artisanAddress", e.target.value); setShowArtisanAddr(true); }}
                      onFocus={() => setShowArtisanAddr(true)}
                      onBlur={() => setTimeout(() => setShowArtisanAddr(false), 150)}
                      className={inputClass} autoComplete="off" />
                    {showArtisanAddr && artisanAddrSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-1 overflow-hidden">
                        {artisanAddrSuggestions.map(addr => (
                          <button key={addr} type="button"
                            onClick={() => { updateField("artisanAddress", addr); setArtisanAddrSuggestions([]); setShowArtisanAddr(false); }}
                            className="suggestion-item w-full text-left px-4 py-2.5 text-sm text-gray-700 border-b border-gray-50 last:border-0">
                            📍 {addr}
                          </button>
                        ))}
                      </div>
                    )}
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

                  <div className="sm:col-span-2 relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresse *</label>
                    <input type="text" required placeholder="12 rue des Fleurs, 75001 Paris" value={form.clientAddress}
                      onChange={e => { updateField("clientAddress", e.target.value); setShowClientAddr(true); }}
                      onFocus={() => setShowClientAddr(true)}
                      onBlur={() => setTimeout(() => setShowClientAddr(false), 150)}
                      className={inputClass} autoComplete="off" />
                    {showClientAddr && clientAddrSuggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl shadow-lg z-20 mt-1 overflow-hidden">
                        {clientAddrSuggestions.map(addr => (
                          <button key={addr} type="button"
                            onClick={() => { updateField("clientAddress", addr); setClientAddrSuggestions([]); setShowClientAddr(false); }}
                            className="suggestion-item w-full text-left px-4 py-2.5 text-sm text-gray-700 border-b border-gray-50 last:border-0">
                            📍 {addr}
                          </button>
                        ))}
                      </div>
                    )}
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
                    {holidayWarning && (
                      <p className="mt-1.5 text-xs text-amber-600 font-medium">⚠️ La date d&apos;expiration tombe un jour férié ({holidayWarning})</p>
                    )}
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
                        {highReminderTier ? (
                          <>
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
                              <option key={n} value={n}>{n} relance{n > 1 ? "s" : ""}</option>
                            ))}
                            <option value="20">Illimité</option>
                          </>
                        ) : (
                          <>
                            <option value="1">1 relance</option>
                            <option value="2">2 relances</option>
                            <option value="3">3 relances</option>
                          </>
                        )}
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
