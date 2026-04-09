"use client";

import { useState } from "react";
import Link from "next/link";

interface ContactForm {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  clientCount: string;
  message: string;
}

const inputClass =
  "w-full rounded-xl border border-gray-200 px-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-shadow text-sm";

export default function ContactPage() {
  const [form, setForm] = useState<ContactForm>({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    clientCount: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  function updateField(key: keyof ContactForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Erreur lors de l'envoi.");
      }

      setStatus("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b border-white/10"
        style={{ backgroundColor: "var(--navy)" }}
      >
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <Link
            href="/devis"
            className="text-sm font-semibold text-white px-4 py-2 rounded-lg"
            style={{ backgroundColor: "var(--orange)" }}
          >
            Essai gratuit artisans
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* Left — pitch */}
          <div>
            <span
              className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-6"
              style={{ backgroundColor: "rgba(249,115,22,0.12)", color: "var(--orange)" }}
            >
              Cabinets · Fédérations · Groupements BTP
            </span>
            <h1
              className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4"
              style={{ color: "var(--navy)" }}
            >
              Demander une démo pour votre cabinet ou groupement
            </h1>
            <p className="text-gray-500 text-lg mb-8 leading-relaxed">
              Nous vous rappelons sous 24h pour vous présenter DevisFlow et répondre à vos questions.
            </p>

            {/* What to expect */}
            <div className="space-y-5">
              {[
                {
                  icon: "📞",
                  title: "Appel de découverte 30 min",
                  desc: "Un expert DevisFlow vous contacte pour comprendre vos besoins spécifiques.",
                },
                {
                  icon: "🖥️",
                  title: "Démo personnalisée",
                  desc: "Nous adaptons la démonstration à votre métier — cabinet comptable, fédération ou groupement BTP.",
                },
                {
                  icon: "📋",
                  title: "Offre sur mesure",
                  desc: "Tarification adaptée au nombre d'artisans gérés, avec option marque blanche disponible.",
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
                    style={{ backgroundColor: "rgba(30,58,95,0.08)" }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 mb-0.5">{item.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pricing reminder */}
            <div
              className="mt-10 rounded-2xl p-6 border border-white/10"
              style={{ backgroundColor: "var(--navy)" }}
            >
              <p className="text-blue-200 text-xs uppercase tracking-wider font-semibold mb-1">
                Tarif Agences &amp; Groupements
              </p>
              <p className="text-white text-2xl font-extrabold mb-1">
                À partir de 299€<span className="text-base font-normal text-blue-200">/mois</span>
              </p>
              <p className="text-blue-200 text-sm">Jusqu&apos;à 500 artisans gérés · Multi-utilisateurs · Marque blanche</p>
            </div>
          </div>

          {/* Right — form */}
          <div>
            {status === "success" ? (
              <div className="bg-white rounded-2xl p-10 shadow-sm border border-gray-100 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h2 className="text-2xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>
                  Demande envoyée !
                </h2>
                <p className="text-gray-500 mb-6 leading-relaxed">
                  Nous avons bien reçu votre demande. Un expert DevisFlow vous contactera sous 24h ouvrées.
                </p>
                <Link
                  href="/"
                  className="inline-block font-semibold px-6 py-3 rounded-xl text-white"
                  style={{ backgroundColor: "var(--navy)" }}
                >
                  Retour à l&apos;accueil
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 space-y-5"
              >
                <h2 className="text-lg font-bold" style={{ color: "var(--navy)" }}>
                  Vos informations
                </h2>

                {status === "error" && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                    {errorMsg}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom du cabinet / groupement *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Cabinet Dupont &amp; Associés"
                    value={form.companyName}
                    onChange={(e) => updateField("companyName", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Votre nom *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Marie Dupont"
                    value={form.contactName}
                    onChange={(e) => updateField("contactName", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email professionnel *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="m.dupont@cabinet.fr"
                      value={form.email}
                      onChange={(e) => updateField("email", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="06 12 34 56 78"
                      value={form.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre d&apos;artisans / clients gérés *
                  </label>
                  <select
                    required
                    value={form.clientCount}
                    onChange={(e) => updateField("clientCount", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Sélectionnez une fourchette</option>
                    <option value="1">1 (solo)</option>
                    <option value="2-5">2 à 5</option>
                    <option value="6-10">6 à 10</option>
                    <option value="11-20">11 à 20</option>
                    <option value="21-50">21 à 50</option>
                    <option value="51-100">51 à 100</option>
                    <option value="100-500">100 à 500</option>
                    <option value="500+">Plus de 500</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message <span className="text-gray-400 font-normal">(optionnel)</span>
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Décrivez vos besoins, contraintes techniques, ou posez vos questions..."
                    value={form.message}
                    onChange={(e) => updateField("message", e.target.value)}
                    className={`${inputClass} resize-none`}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="w-full text-white font-bold py-4 rounded-xl transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "var(--orange)" }}
                >
                  {status === "loading" ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Envoi en cours…
                    </span>
                  ) : (
                    "Demander ma démo gratuite →"
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center">
                  Rappel sous 24h · Sans engagement · Données confidentielles
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
