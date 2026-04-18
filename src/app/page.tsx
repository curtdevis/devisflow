import Link from "next/link";
import NavAuth from "./_components/NavAuth";
import CheckoutButton from "./_components/CheckoutButton";

const LOCK_ICON = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

const TESTIMONIALS = [
  { name: "Mohamed B.", job: "Plombier indépendant, Lyon", quote: "Je perdais 3h par devis avant. Maintenant c'est 2 minutes. J'ai signé 5 nouveaux chantiers ce mois-ci.", stars: 5 },
  { name: "Sophie L.", job: "Électricienne, Bordeaux", quote: "Mes clients sont impressionnés par le rendu pro. Les relances automatiques m'ont fait récupérer 2 devis oubliés.", stars: 5 },
  { name: "Jean-Pierre M.", job: "Peintre en bâtiment, Marseille", quote: "Simple, rapide, pas cher. Je crée mes devis depuis le chantier sur mon téléphone. Révolutionnaire.", stars: 5 },
];

const PLANS = [
  {
    name: "Artisan Solo",
    priceLabel: "29€",
    period: "/mois",
    description: "Pour les artisans indépendants et auto-entrepreneurs",
    features: [
      "Devis IA illimités en 30 secondes",
      "Logo et branding à votre nom",
      "Relances automatiques personnalisables",
      "Envoi par email et WhatsApp",
      "Signature électronique client",
      "Historique de vos devis",
      "Export PDF professionnel",
      "Conformité e-facture 2026",
    ],
    cta: "Commencer l'essai gratuit 7 jours",
    href: "checkout",
    highlighted: true,
    badge: "Le plus populaire",
    showLsNote: true,
  },
  {
    name: "Cabinet & Groupement",
    priceLabel: "Sur devis",
    period: "",
    description: "Cabinets comptables, fédérations d'artisans, groupements BTP",
    features: [
      "Tout le plan Artisan Solo",
      "Invitations artisans par email",
      "Dashboard multi-artisans centralisé",
      "Suivi de tous les devis en temps réel",
      "Statistiques d'activité par artisan",
      "Support prioritaire dédié",
    ],
    cta: "Créer un compte Cabinet",
    href: "/auth/register?type=agence",
    highlighted: false,
    badge: null,
    showLsNote: false,
  },
];

const FAQS = [
  { q: "Comment fonctionne l'essai gratuit ?", a: "Créez votre compte gratuitement en 30 secondes. Vous accédez à toutes les fonctionnalités pendant 7 jours. À l'issue de l'essai, un abonnement à 29 €/mois est proposé pour continuer. Vous choisissez librement, sans engagement." },
  { q: "Mes devis sont-ils conformes à la réglementation 2026 ?", a: "Oui. Tous les devis générés par DevisFlow sont au format professionnel PDF structuré, prêts pour la réglementation de facturation électronique 2026." },
  { q: "Comment fonctionne la relance automatique ?", a: "Si votre client n'a pas répondu, DevisFlow lui envoie automatiquement des emails de relance selon la fréquence que vous choisissez (tous les 2, 3, 5 ou 7 jours). Nombre de relances et ton (professionnel, amical, urgent) configurables. Désactivable à tout moment." },
  { q: "Puis-je utiliser DevisFlow depuis mon téléphone ?", a: "Absolument. DevisFlow est conçu mobile-first. Créez un devis depuis le chantier en 30 secondes, envoyez-le par WhatsApp directement." },
  { q: "L'IA comprend-elle mon métier ?", a: "Oui. DevisFlow est formé sur les métiers du BTP : plomberie, électricité, peinture, maçonnerie, menuiserie, chauffage, carrelage. Il connaît les prix du marché et les mentions légales spécifiques." },
  { q: "Puis-je convertir un devis en facture ?", a: "Oui. En un clic depuis votre tableau de bord, transformez n'importe quel devis accepté en facture professionnelle, avec numérotation automatique." },
];

const FEATURES = [
  {
    num: "01",
    accent: "#f97316",
    bg: "rgba(249,115,22,0.08)",
    title: "Vitesse × 22",
    sub: "30 s vs 2 heures",
    desc: "L'IA génère un devis complet — lignes, TVA, mentions légales — en moins de 30 secondes. Vous répondez avant vos concurrents.",
    badge: "73% des clients choisissent le premier artisan qui répond",
  },
  {
    num: "02",
    accent: "#3b82f6",
    bg: "rgba(59,130,246,0.08)",
    title: "IA de métier",
    sub: "Formée sur le BTP français",
    desc: "Plomberie, électricité, peinture, maçonnerie… DevisFlow connaît vos prix, vos unités et vos mentions légales.",
    badge: "8 corps de métier, prix du marché intégrés",
  },
  {
    num: "03",
    accent: "#10b981",
    bg: "rgba(16,185,129,0.08)",
    title: "Depuis le chantier",
    sub: "100 % mobile",
    desc: "Créez et envoyez votre devis depuis votre téléphone. Le client reçoit un lien pour signer en ligne immédiatement.",
    badge: "Signature électronique + WhatsApp en 1 tap",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <a href="#pourquoi" className="hover:text-gray-900 transition-colors">Pourquoi</a>
            <a href="#demo" className="hover:text-gray-900 transition-colors">Démo</a>
            <a href="#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
            <Link href="/comparatif" className="hover:text-gray-900 transition-colors">Comparatif</Link>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Agences</Link>
          </div>
          <div className="flex items-center gap-3">
            <NavAuth />
            <CheckoutButton
              className="text-sm font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "var(--orange)" }}
            >
              Essai gratuit →
            </CheckoutButton>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "var(--navy)" }}>
          {/* Glow + grid */}
          <div className="absolute inset-0 hero-glow" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 lg:py-28">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">

              {/* Copy */}
              <div className="animate-fadein">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "var(--orange)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  IA spécialisée BTP · Conforme 2026
                </div>

                {/* H1 */}
                <h1 className="text-white mb-5" style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", lineHeight: 1.1, fontWeight: 800, letterSpacing: "-0.02em" }}>
                  Votre devis pro en{" "}
                  <span style={{ color: "var(--orange)" }}>30 secondes</span>
                  <br />avec l&apos;IA
                </h1>

                <p className="text-blue-200 leading-relaxed mb-8 max-w-md" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}>
                  Générez, envoyez et signez des devis professionnels depuis votre téléphone — sur le chantier, en moins d&apos;une minute.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <CheckoutButton
                    className="btn-orange inline-flex items-center justify-center font-bold text-white px-7 py-3.5 rounded-xl shadow-lg transition-all hover:opacity-90 hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: "var(--orange)", fontSize: "1rem" }}
                  >
                    Essai gratuit 7 jours →
                  </CheckoutButton>
                  <a href="#comment" className="inline-flex items-center justify-center font-semibold text-white px-7 py-3.5 rounded-xl border border-white/20 hover:bg-white/10 transition-colors text-sm">
                    Voir comment ça marche
                  </a>
                </div>

                <p className="mt-4 text-sm text-blue-300/80">Sans carte bancaire · Annulation à tout moment</p>
              </div>

              {/* Video mockup — desktop only */}
              <div className="animate-fadein-d1 hidden lg:block">
                <div className="relative">
                  <div className="absolute -inset-6 rounded-3xl opacity-30" style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.5) 0%, transparent 70%)" }} />
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                    <div className="flex items-center gap-1.5 px-4 py-2.5" style={{ backgroundColor: "rgba(15,23,42,0.95)" }}>
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                      <div className="flex-1 mx-3 h-5 rounded bg-white/10 flex items-center px-2">
                        <span className="text-xs text-blue-300 font-mono">devis-flow.fr/devis</span>
                      </div>
                    </div>
                    {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
                    <video autoPlay muted loop playsInline preload="auto" className="w-full block" style={{ maxHeight: "400px", objectFit: "contain", backgroundColor: "#000" }} src="/demo.mp4" />
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded-md tracking-wide">DÉMO IA</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <div style={{ backgroundColor: "var(--navy-dark)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="max-w-4xl mx-auto px-4 py-5">
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 sm:gap-x-16">
              {[
                { v: "800+", l: "artisans actifs" },
                { v: "30 s", l: "génération moyenne" },
                { v: "4,9/5", l: "satisfaction client" },
                { v: "98%",  l: "conformité 2026" },
              ].map(s => (
                <div key={s.l} className="text-center">
                  <p className="text-2xl sm:text-3xl font-extrabold stat-number leading-none" style={{ color: "var(--orange)" }}>{s.v}</p>
                  <p className="text-xs text-blue-300/70 mt-1 uppercase tracking-wider">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Social proof ── */}
        <div className="bg-white border-b border-gray-100 py-3 px-4">
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {["M","S","J","K","P"].map(l => (
                  <div key={l} className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold" style={{ backgroundColor: "var(--navy)" }}>{l}</div>
                ))}
              </div>
              <span><strong className="text-gray-900">800+ artisans</strong> nous font confiance</span>
            </div>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-orange-400">★★★★★</span>
              <span><strong className="text-gray-900">4,9/5</strong> · 200+ avis</span>
            </div>
            <span className="text-gray-200 hidden sm:inline">|</span>
            <span><strong className="text-gray-900">15 000+</strong> devis générés</span>
          </div>
        </div>

        {/* ── Pourquoi DevisFlow ── */}
        <section id="pourquoi" className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Pourquoi DevisFlow</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3" style={{ color: "var(--navy)" }}>
                L&apos;avantage IA pour les artisans
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto text-sm sm:text-base">
                Conçu pour gagner en efficacité sans sacrifier le professionnalisme.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-5">
              {FEATURES.map(f => (
                <div key={f.num} className="card-lift bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="h-[3px]" style={{ backgroundColor: f.accent }} />
                  <div className="p-6">
                    <h3 className="text-base font-extrabold mb-0.5" style={{ color: "var(--navy)" }}>{f.title}</h3>
                    <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: f.accent }}>{f.sub}</p>
                    <p className="text-gray-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                    <p className="text-xs font-semibold px-3 py-2 rounded-lg" style={{ backgroundColor: f.bg, color: f.accent }}>{f.badge}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA 1 ── */}
        <div className="py-8 px-4 text-center bg-gray-50 border-y border-gray-100">
          <p className="text-gray-700 font-semibold mb-3 text-sm sm:text-base">Prêt à gagner 14h par mois sur votre administratif ?</p>
          <CheckoutButton className="btn-orange inline-flex items-center text-white font-bold px-7 py-3 rounded-xl shadow transition-all hover:opacity-90 text-sm" style={{ backgroundColor: "var(--orange)" }}>
            Commencer l&apos;essai gratuit 7 jours →
          </CheckoutButton>
        </div>

        {/* ── How it works ── */}
        <section id="comment" className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Simple comme bonjour</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>
                Un devis professionnel en 3 étapes
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Sélectionnez votre métier", desc: "Choisissez parmi 8 corps de métier. DevisFlow affiche immédiatement les prestations types de votre profession.", time: "< 30 s" },
                { step: "2", title: "Renseignez le client", desc: "Nom, adresse, email. L'autocomplétation retrouve vos clients existants en une lettre.", time: "< 1 min" },
                { step: "3", title: "Envoyez et signez", desc: "PDF généré, envoyé par email ou WhatsApp. Le client signe depuis son téléphone en 10 secondes.", time: "Instantané" },
              ].map(s => (
                <div key={s.step} className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-lg text-white shrink-0" style={{ backgroundColor: "var(--orange)" }}>
                      {s.step}
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full border" style={{ color: "var(--navy)", borderColor: "rgba(30,58,95,0.2)", backgroundColor: "rgba(30,58,95,0.05)" }}>
                      {s.time}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold mb-1.5" style={{ color: "var(--navy)" }}>{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison table ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Comparatif</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>
                DevisFlow vs Obat, Henrri et Excel
              </h2>
              <p className="text-gray-500 max-w-md mx-auto text-sm">Pourquoi 800+ artisans ont choisi DevisFlow.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm min-w-[520px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-5 py-4 text-gray-500 font-medium w-2/5">Fonctionnalité</th>
                    <th className="px-4 py-4 text-center font-extrabold text-white" style={{ backgroundColor: "var(--navy)" }}>DevisFlow</th>
                    <th className="px-4 py-4 text-center text-gray-500 font-medium bg-gray-50">Obat / Henrri</th>
                    <th className="px-4 py-4 text-center text-gray-500 font-medium">Excel / Word</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Génération IA en 30 secondes", "✓", "✗", "✗"],
                    ["IA spécialisée BTP", "✓", "✗", "✗"],
                    ["Mobile — depuis le chantier", "✓", "~", "~"],
                    ["Relances automatiques", "✓", "~", "✗"],
                    ["Signature électronique", "✓", "~", "✗"],
                    ["Conformité e-facture 2026", "✓", "✓", "✗"],
                    ["Conversion devis → facture", "✓", "✓", "Manuelle"],
                    ["Base clients intégrée", "✓", "✓", "✗"],
                    ["Prix / mois", "29€", "40-89€", "0€ (2h/devis)"],
                  ].map(([feat, a, b, c]) => (
                    <tr key={feat} className="border-b border-gray-50 hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 text-gray-700 font-medium text-sm">{feat}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-sm" style={{ color: a === "✓" ? "#10b981" : "var(--navy)" }}>{a}</td>
                      <td className="px-4 py-3.5 text-center text-sm bg-gray-50/50" style={{ color: b === "✗" ? "#ef4444" : b === "~" ? "#f59e0b" : "#6b7280" }}>{b}</td>
                      <td className="px-4 py-3.5 text-center text-sm" style={{ color: c === "✗" ? "#ef4444" : c === "~" ? "#f59e0b" : "#6b7280" }}>{c}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Video démo ── */}
        <section id="demo" className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.04)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Démo complète</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>Voyez DevisFlow en action</h2>
              <p className="text-gray-500 text-sm">Du formulaire au PDF signé en moins de 2 minutes.</p>
            </div>
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-black">
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video controls muted loop playsInline preload="none" className="w-full block" style={{ maxHeight: "65vh", objectFit: "contain", backgroundColor: "#000" }} src="/demo.mp4" />
            </div>
            <div className="mt-6 text-center">
              <CheckoutButton className="btn-orange inline-flex items-center text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all hover:opacity-90 text-sm" style={{ backgroundColor: "var(--orange)" }}>
                Essayer gratuitement — 7 jours →
              </CheckoutButton>
              <p className="mt-2 text-xs text-gray-400">Sans carte bancaire · Accès immédiat</p>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>Témoignages</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>
                Ils ont adopté DevisFlow
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="card-lift bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col">
                  {/* Stars */}
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ))}
                  </div>
                  {/* Quote */}
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 mb-5">&ldquo;{t.quote}&rdquo;</p>
                  {/* Author */}
                  <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-extrabold shrink-0" style={{ backgroundColor: "var(--navy)" }}>
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>{t.name}</p>
                      <p className="text-xs text-gray-400">{t.job}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA 2 ── */}
        <section className="relative overflow-hidden py-14 px-4" style={{ backgroundColor: "var(--navy)" }}>
          <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 70% 100% at 100% 50%, rgba(249,115,22,0.15) 0%, transparent 70%)" }} />
          <div className="relative max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
                Prêt à gagner 14h par mois ?
              </h2>
              <p className="text-blue-300 text-sm">Essai gratuit 7 jours · Annulation en 1 clic · Sans CB</p>
            </div>
            <CheckoutButton className="btn-orange shrink-0 inline-flex items-center text-white font-bold px-7 py-3.5 rounded-xl shadow-lg transition-all hover:opacity-90 whitespace-nowrap text-sm sm:text-base" style={{ backgroundColor: "var(--orange)" }}>
              Commencer gratuitement →
            </CheckoutButton>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="tarifs" className="py-16 sm:py-20 px-4" style={{ backgroundColor: "var(--navy)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2 text-orange-400">Tarifs</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Simple et transparent</h2>
              <p className="text-blue-200 text-sm">Essai gratuit 7 jours — annulation à tout moment</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {PLANS.map(plan => (
                <div key={plan.name} className={`rounded-2xl p-7 ${plan.highlighted ? "bg-white shadow-xl" : "bg-white/8 border border-white/15"}`}>
                  {plan.badge && (
                    <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 text-white" style={{ backgroundColor: plan.highlighted ? "var(--orange)" : "rgba(255,255,255,0.2)" }}>
                      {plan.badge}
                    </span>
                  )}
                  <h3 className={`text-lg font-bold mb-1 ${plan.highlighted ? "" : "text-white"}`} style={plan.highlighted ? { color: "var(--navy)" } : {}}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-5 ${plan.highlighted ? "text-gray-500" : "text-blue-300"}`}>{plan.description}</p>
                  <div className="mb-6 flex items-end gap-1">
                    <span className={`font-extrabold ${plan.highlighted ? "" : "text-white"}`} style={{ fontSize: "2.75rem", lineHeight: 1, ...(plan.highlighted ? { color: "var(--navy)" } : {}) }}>
                      {plan.priceLabel}
                    </span>
                    {plan.period && <span className={`text-base mb-1 ${plan.highlighted ? "text-gray-400" : "text-blue-300"}`}>{plan.period}</span>}
                  </div>
                  <ul className="space-y-2.5 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-start gap-2.5 text-sm ${plan.highlighted ? "text-gray-600" : "text-blue-100"}`}>
                        <span className="shrink-0 mt-0.5" style={{ color: "var(--orange)" }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {plan.href === "checkout" ? (
                    <CheckoutButton
                      className={`btn-orange block w-full text-center font-bold py-3 rounded-xl transition-all ${plan.highlighted ? "text-white hover:opacity-90" : "text-white border border-white/25 hover:bg-white/10"}`}
                      style={plan.highlighted ? { backgroundColor: "var(--orange)" } : {}}
                    >
                      {plan.cta}
                    </CheckoutButton>
                  ) : (
                    <Link href={plan.href} className="block w-full text-center font-bold py-3 rounded-xl text-white border border-white/25 hover:bg-white/10 transition-colors text-sm">
                      {plan.cta}
                    </Link>
                  )}
                  {plan.showLsNote && (
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                      {LOCK_ICON} Paiement sécurisé par Lemon Squeezy
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-16 sm:py-20 px-4 bg-white">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>Questions fréquentes</h2>
            </div>
            <div className="space-y-2">
              {FAQS.map(faq => (
                <details key={faq.q} className="group border border-gray-100 rounded-xl shadow-sm hover:border-gray-200 transition-colors bg-white">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-5 py-4 font-semibold text-gray-800 list-none text-sm">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform shrink-0 text-xl font-light leading-none">+</span>
                  </summary>
                  <p className="px-5 pb-4 text-gray-500 leading-relaxed text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEO articles ── */}
        <section className="py-14 px-4 border-y border-gray-100" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-extrabold text-center mb-8" style={{ color: "var(--navy)" }}>
              Guide du devis professionnel artisan
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                { title: "Comment créer un devis professionnel rapidement ?", body: "Un bon devis artisan doit inclure vos coordonnées, celles du client, le détail des travaux, le coût de la main d'œuvre et des matériaux. Avec DevisFlow, l'IA génère tout en 30 secondes depuis votre téléphone." },
                { title: "Facturation électronique 2026 : ce qu'il faut savoir", body: "Dès septembre 2026, la facturation électronique est obligatoire pour toutes les entreprises françaises. DevisFlow génère des devis au format structuré conforme, sans effort supplémentaire." },
                { title: "Comment relancer un client après un devis ?", body: "73% des devis non signés ne le sont pas par désintérêt, mais parce que le client a oublié. DevisFlow envoie des relances automatiques à J+3 et J+7 — vous gérez votre chantier, DevisFlow gère le suivi." },
              ].map(a => (
                <article key={a.title} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <h3 className="text-sm font-bold mb-2" style={{ color: "var(--navy)" }}>{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-20 px-4 text-center" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1e3a8a 100%)" }}>
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Prêt à prendre l&apos;avantage IA ?
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-8">
              Rejoignez 800+ artisans qui ont transformé leur gestion des devis.
            </p>
            <CheckoutButton className="btn-orange inline-flex items-center text-white font-bold text-base px-10 py-4 rounded-xl shadow-xl transition-all hover:opacity-90 hover:scale-105 active:scale-95" style={{ backgroundColor: "var(--orange)" }}>
              Commencer mon essai gratuit →
            </CheckoutButton>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-blue-400">
              {LOCK_ICON} Essai 7 jours · Annulation à tout moment
            </p>
          </div>
        </section>
      </main>

      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />

      {/* ── Footer ── */}
      <footer className="py-10 px-4 text-center text-sm text-blue-200" style={{ backgroundColor: "var(--navy-dark)" }}>
        <p className="font-extrabold text-white text-lg mb-1">Devis<span style={{ color: "var(--orange)" }}>Flow</span></p>
        <p className="mb-5 text-blue-300 text-sm">Le générateur de devis IA pour les artisans français</p>
        <div className="flex flex-wrap justify-center gap-5 text-xs text-blue-400 mb-5">
          <Link href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/cgu" className="hover:text-white transition-colors">CGU</Link>
          <Link href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </div>
        <p className="text-xs text-blue-500">© {new Date().getFullYear()} DevisFlow — Tous droits réservés</p>
      </footer>
    </div>
  );
}
