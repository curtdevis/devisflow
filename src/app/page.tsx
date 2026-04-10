import Link from "next/link";
import NavAuth from "./_components/NavAuth";
import CheckoutButton, { LS_CHECKOUT } from "./_components/CheckoutButton";

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
    href: LS_CHECKOUT,
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
  { q: "Comment fonctionne l'essai gratuit ?", a: "L'essai gratuit de 7 jours vous donne accès à toutes les fonctionnalités de DevisFlow. Aucune carte bancaire requise. Vous pouvez annuler à tout moment, sans engagement." },
  { q: "Mes devis sont-ils conformes à la réglementation 2026 ?", a: "Oui. Tous les devis générés par DevisFlow sont au format professionnel PDF structuré, prêts pour la réglementation de facturation électronique 2026." },
  { q: "Comment fonctionne la relance automatique ?", a: "Si votre client n'a pas répondu à votre devis, DevisFlow lui envoie automatiquement un email de relance à J+3 puis à J+7. Personnalisable ou désactivable à tout moment." },
  { q: "Puis-je utiliser DevisFlow depuis mon téléphone ?", a: "Absolument. DevisFlow est conçu mobile-first. Créez un devis depuis le chantier en 30 secondes, envoyez-le par WhatsApp directement." },
  { q: "L'IA comprend-elle mon métier ?", a: "Oui. DevisFlow est formé sur les métiers du BTP : plomberie, électricité, peinture, maçonnerie, menuiserie, chauffage, carrelage. Il connaît les prix du marché et les mentions légales spécifiques." },
  { q: "Puis-je convertir un devis en facture ?", a: "Oui. En un clic depuis votre tableau de bord, transformez n'importe quel devis accepté en facture professionnelle, avec numérotation automatique." },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes typewriter {
          0%,20% { width: 0; }
          60%,100% { width: 100%; }
        }
        @keyframes blink { 50% { opacity: 0; } }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-soft {
          0%,100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        @keyframes scan {
          0% { top: 0; opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-fadein { animation: fadeInUp 0.7s ease both; }
        .animate-fadein-d1 { animation: fadeInUp 0.7s 0.15s ease both; }
        .animate-fadein-d2 { animation: fadeInUp 0.7s 0.3s ease both; }
        .animate-fadein-d3 { animation: fadeInUp 0.7s 0.45s ease both; }
        .mockup-line { animation: fadeInUp 0.5s ease both; }
        .hero-glow {
          background: radial-gradient(ellipse 80% 60% at 50% 0%, rgba(249,115,22,0.18) 0%, transparent 70%),
                      radial-gradient(ellipse 60% 40% at 80% 80%, rgba(96,165,250,0.12) 0%, transparent 60%);
        }
        .comparison-check { color: #10b981; font-size: 18px; }
        .comparison-cross { color: #ef4444; font-size: 18px; }
        .comparison-partial { color: #f59e0b; font-size: 18px; }
        .video-play:hover { transform: scale(1.08); }
        .video-play { transition: transform 0.2s; }
        .feature-card:hover { transform: translateY(-3px); box-shadow: 0 20px 40px rgba(15,23,42,0.12); }
        .feature-card { transition: transform 0.2s, box-shadow 0.2s; }
        .stat-number { font-variant-numeric: tabular-nums; }
      `}</style>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm text-gray-500 font-medium">
            <a href="#pourquoi" className="hover:text-gray-900 transition-colors">Pourquoi DevisFlow</a>
            <a href="#comment" className="hover:text-gray-900 transition-colors">Comment ça marche</a>
            <a href="#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
            <Link href="/contact" className="hover:text-gray-900 transition-colors">Agences</Link>
          </div>
          <div className="flex items-center gap-3">
            <NavAuth />
            <CheckoutButton
              className="text-sm font-bold text-white px-5 py-2.5 rounded-xl shadow-sm transition-all hover:shadow-md hover:scale-105"
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
          <div className="absolute inset-0 hero-glow" />
          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left: copy */}
              <div className="animate-fadein">
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-7" style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "var(--orange)" }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  Nouveau — IA spécialisée BTP
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.08] tracking-tight mb-6">
                  Votre devis pro<br />
                  en <span style={{ color: "var(--orange)" }}>30 secondes</span><br />
                  avec l&apos;IA
                </h1>
                <p className="text-lg text-blue-200 leading-relaxed mb-8 max-w-lg">
                  DevisFlow génère des devis professionnels pour votre métier — depuis votre téléphone, sur le chantier.
                  Envoyez, relancez, signez. Sans tableur. Sans effort.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <CheckoutButton
                    className="inline-flex items-center justify-center gap-2 text-white font-bold text-lg px-8 py-4 rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95"
                    style={{ backgroundColor: "var(--orange)" }}
                  >
                    Essai gratuit 7 jours →
                  </CheckoutButton>
                  <a href="#comment" className="inline-flex items-center justify-center gap-2 text-white font-semibold text-base px-8 py-4 rounded-xl border border-white/25 hover:bg-white/10 transition-colors">
                    Voir comment ça marche
                  </a>
                </div>
                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-blue-300">
                  <span className="flex items-center gap-1.5">{LOCK_ICON} Sans CB requise</span>
                  <span>·</span>
                  <span>Annulation à tout moment</span>
                  <span>·</span>
                  <span>Accès immédiat</span>
                </div>
              </div>

              {/* Right: animated devis mockup */}
              <div className="animate-fadein-d1 hidden lg:block">
                <div className="relative">
                  {/* Glow behind card */}
                  <div className="absolute -inset-4 rounded-3xl opacity-30" style={{ background: "radial-gradient(ellipse at center, rgba(249,115,22,0.4) 0%, transparent 70%)" }} />

                  {/* Mockup card */}
                  <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/10">
                    {/* Card header */}
                    <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: "var(--navy)" }}>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400 opacity-80" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
                        <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
                      </div>
                      <span className="text-xs text-blue-300 font-mono">devis-flow.fr/devis</span>
                      <div />
                    </div>

                    {/* Fake form → devis transition */}
                    <div className="p-6 space-y-3 bg-gray-50">
                      {/* AI generation indicator */}
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "var(--orange)" }}>✦</div>
                        <span className="text-xs font-semibold text-gray-500">IA génère votre devis…</span>
                        <span className="flex gap-0.5">
                          {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-orange-400" style={{ animation: `pulse-soft 1.2s ${i*0.2}s ease infinite` }} />)}
                        </span>
                      </div>

                      {/* Fake devis lines appearing */}
                      {[
                        { label: "DEVIS", sub: "N° DEV-202601-4872", style: { animation: "fadeInUp 0.4s 0.2s both" } },
                        { label: "Remplacement chauffe-eau 200L", sub: "1 × 450,00 €", style: { animation: "fadeInUp 0.4s 0.5s both" } },
                        { label: "Main d'œuvre — 4h", sub: "4 × 55,00 €", style: { animation: "fadeInUp 0.4s 0.8s both" } },
                        { label: "Raccordements et évacuations", sub: "1 × 80,00 €", style: { animation: "fadeInUp 0.4s 1.1s both" } },
                      ].map((item, i) => (
                        <div key={i} className="bg-white rounded-xl px-4 py-3 border border-gray-100 flex justify-between items-center" style={item.style}>
                          <div>
                            <p className="text-xs font-bold text-gray-800">{item.label}</p>
                            <p className="text-xs text-gray-400">{item.sub}</p>
                          </div>
                          {i === 0 && <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: "var(--navy)" }}>Pro ✓</span>}
                        </div>
                      ))}

                      {/* Total */}
                      <div className="rounded-xl px-4 py-3 text-white flex justify-between items-center" style={{ animation: "fadeInUp 0.4s 1.4s both", backgroundColor: "var(--navy)" }}>
                        <span className="text-sm font-bold">Total TTC</span>
                        <span className="text-lg font-extrabold">750,00 €</span>
                      </div>

                      {/* Send button */}
                      <div style={{ animation: "fadeInUp 0.4s 1.7s both" }}>
                        <div className="w-full py-2.5 rounded-xl text-white text-sm font-bold text-center" style={{ backgroundColor: "var(--orange)" }}>
                          📧 Envoyer au client →
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="border-b border-gray-100" style={{ backgroundColor: "var(--navy-dark)" }}>
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
              {[
                { value: "800+", label: "artisans actifs" },
                { value: "30 s", label: "génération en moyenne" },
                { value: "4,9/5", label: "satisfaction client" },
                { value: "98%", label: "conformité e-facture 2026" },
              ].map(s => (
                <div key={s.label}>
                  <p className="text-2xl font-extrabold stat-number" style={{ color: "var(--orange)" }}>{s.value}</p>
                  <p className="text-xs text-blue-300 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof avatars ── */}
        <section className="py-5 px-4 bg-white border-b border-gray-100">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-10 text-center">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {["M","S","J","K","P"].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: "var(--navy)" }}>{i}</div>
                ))}
              </div>
              <p className="text-sm text-gray-600"><strong className="text-gray-900">800+ artisans</strong> font confiance à DevisFlow</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <div className="flex items-center gap-2">
              <span className="text-orange-400">★★★★★</span>
              <p className="text-sm text-gray-600"><strong className="text-gray-900">4,9/5</strong> — 200+ avis vérifiés</p>
            </div>
            <div className="hidden sm:block w-px h-8 bg-gray-200" />
            <p className="text-sm text-gray-600"><strong className="text-gray-900">15 000+</strong> devis générés</p>
          </div>
        </section>

        {/* ── Pourquoi DevisFlow ── */}
        <section id="pourquoi" className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Pourquoi DevisFlow</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 leading-tight" style={{ color: "var(--navy)" }}>
                L&apos;avantage IA pour les artisans
              </h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">
                Conçu pour les artisans qui veulent gagner en efficacité sans sacrifier le professionnalisme.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-8">
              {[
                {
                  icon: "⚡",
                  color: "#f97316",
                  title: "Vitesse × 22",
                  sub: "30 secondes vs 2 heures",
                  desc: "Notre IA génère un devis complet, avec le détail des lignes, les calculs TVA et les mentions légales, en moins de 30 secondes. Vous répondez avant vos concurrents.",
                  highlight: "73% des clients choisissent le premier artisan qui répond",
                },
                {
                  icon: "🧠",
                  color: "#3b82f6",
                  title: "IA de métier",
                  sub: "Formée sur le BTP français",
                  desc: "Plomberie, électricité, peinture, maçonnerie, menuiserie — DevisFlow connaît vos prix, vos unités, vos mentions légales. Une bibliothèque de prestations clé en main.",
                  highlight: "8 corps de métier couverts, prix du marché intégrés",
                },
                {
                  icon: "📱",
                  color: "#10b981",
                  title: "Depuis le chantier",
                  sub: "100% mobile, zéro paperasse",
                  desc: "Créez et envoyez votre devis depuis votre téléphone pendant que vous êtes sur place. Le client reçoit un lien pour signer en ligne immédiatement.",
                  highlight: "Signature électronique incluse, envoi WhatsApp en 1 tap",
                },
              ].map(f => (
                <div key={f.title} className="feature-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6" style={{ backgroundColor: `${f.color}15` }}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-extrabold mb-1" style={{ color: "var(--navy)" }}>{f.title}</h3>
                  <p className="text-sm font-semibold mb-4" style={{ color: f.color }}>{f.sub}</p>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{f.desc}</p>
                  <div className="rounded-xl px-4 py-3 text-xs font-semibold text-white" style={{ backgroundColor: f.color }}>
                    {f.highlight}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA 1 ── */}
        <div className="py-10 px-4 text-center bg-gray-50 border-y border-gray-100">
          <p className="text-gray-700 font-semibold mb-4">Prêt à gagner 14h par mois sur votre administratif ?</p>
          <CheckoutButton className="inline-block text-white font-bold px-8 py-3.5 rounded-xl shadow transition-transform hover:scale-105 text-base" style={{ backgroundColor: "var(--orange)" }}>
            Commencer l&apos;essai gratuit 7 jours →
          </CheckoutButton>
        </div>

        {/* ── How it works ── */}
        <section id="comment" className="py-24 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Simple comme bonjour</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>
                Un devis professionnel en 3 étapes
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-10">
              {[
                { step: "1", title: "Sélectionnez votre métier", desc: "Choisissez parmi 8 corps de métier. DevisFlow affiche immédiatement les prestations types de votre profession, prêtes à cliquer.", time: "< 30 secondes" },
                { step: "2", title: "Renseignez le client", desc: "Nom, adresse, email. Si c'est un client existant, l'autocomplétation le retrouve en une lettre. Saisie unique, retrouvé partout.", time: "< 1 minute" },
                { step: "3", title: "Envoyez et signez", desc: "PDF généré, envoyé par email ou WhatsApp. Le client signe électroniquement depuis son téléphone. Retrouvez tout dans votre tableau de bord.", time: "Instantané" },
              ].map(s => (
                <div key={s.step} className="relative">
                  {/* Step connector */}
                  <div className="flex flex-col items-center sm:items-start gap-4">
                    <div className="flex items-center gap-4 w-full">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-extrabold text-xl text-white shrink-0" style={{ backgroundColor: "var(--orange)" }}>
                        {s.step}
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full border" style={{ color: "var(--navy)", borderColor: "var(--navy)", backgroundColor: "rgba(30,58,95,0.06)" }}>
                        {s.time}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold mb-2" style={{ color: "var(--navy)" }}>{s.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Comparison table ── */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Comparatif</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>
                DevisFlow vs les alternatives
              </h2>
              <p className="text-gray-500 max-w-lg mx-auto">Pourquoi 800+ artisans ont choisi DevisFlow plutôt qu&apos;Excel ou un logiciel traditionnel.</p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left px-6 py-4 text-gray-500 font-medium w-2/5">Fonctionnalité</th>
                    <th className="px-4 py-4 text-center font-extrabold rounded-t-xl" style={{ color: "white", backgroundColor: "var(--navy)" }}>DevisFlow</th>
                    <th className="px-4 py-4 text-center text-gray-500 font-medium">Excel / Word</th>
                    <th className="px-4 py-4 text-center text-gray-500 font-medium">Logiciels trad.</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Génération en 30 secondes", "✓", "✗", "✗"],
                    ["IA adaptée au métier BTP", "✓", "✗", "✗"],
                    ["Depuis le téléphone", "✓", "~", "~"],
                    ["Relances automatiques", "✓", "✗", "~"],
                    ["Signature électronique", "✓", "✗", "~"],
                    ["Conformité e-facture 2026", "✓", "✗", "✓"],
                    ["Conversion devis → facture", "✓", "Manuelle", "✓"],
                    ["Base clients intégrée", "✓", "✗", "✓"],
                    ["Prix / mois", "29€", "0€ (mais 2h/devis)", "60-200€"],
                  ].map(([feat, a, b, c]) => (
                    <tr key={feat} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-gray-700 font-medium">{feat}</td>
                      <td className="px-4 py-4 text-center font-bold" style={{ color: a === "✓" ? "#10b981" : "var(--navy)" }}>
                        {a === "✓" ? "✓" : a}
                      </td>
                      <td className="px-4 py-4 text-center" style={{ color: b === "✗" ? "#ef4444" : b === "~" ? "#f59e0b" : "#6b7280" }}>
                        {b}
                      </td>
                      <td className="px-4 py-4 text-center" style={{ color: c === "✗" ? "#ef4444" : c === "~" ? "#f59e0b" : "#6b7280" }}>
                        {c}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ── Video placeholder ── */}
        <section className="py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.04)" }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Démo</p>
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>Voir DevisFlow en action</h2>
            <p className="text-gray-500 mb-10 max-w-lg mx-auto">De la description des travaux au PDF envoyé — regardez le flux complet en moins de 2 minutes.</p>

            <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gray-900 aspect-video max-w-3xl mx-auto cursor-pointer group">
              {/* Fake thumbnail with gradient */}
              <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #1e40af 100%)" }} />
              {/* Grid pattern */}
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

              {/* Play button */}
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                <div className="video-play w-20 h-20 rounded-full flex items-center justify-center shadow-2xl border-2 border-white/20" style={{ backgroundColor: "var(--orange)" }}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="white">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                </div>
                <p className="text-white font-semibold text-lg">Voir la démo complète</p>
                <p className="text-blue-300 text-sm">1 min 47 sec — Devis plombier de A à Z</p>
              </div>

              {/* Duration badge */}
              <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs font-mono px-2 py-1 rounded">1:47</div>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-24 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Témoignages</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--navy)" }}>
                Ils ont adopté DevisFlow
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-8">
              {TESTIMONIALS.map(t => (
                <div key={t.name} className="feature-card bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                  <div className="flex mb-4">
                    {Array.from({length: t.stars}).map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#f97316" stroke="none">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                      </svg>
                    ))}
                  </div>
                  <p className="text-gray-600 italic mb-6 leading-relaxed text-sm">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ backgroundColor: "var(--navy)" }}>
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
        <section className="py-12 px-4 border-y border-gray-100 bg-gray-50">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xl font-extrabold" style={{ color: "var(--navy)" }}>Essai gratuit 7 jours</p>
              <p className="text-gray-500 text-sm mt-1">Sans carte bancaire — annulation en 1 clic</p>
            </div>
            <CheckoutButton className="shrink-0 inline-block text-white font-bold px-8 py-4 rounded-xl shadow-lg transition-transform hover:scale-105" style={{ backgroundColor: "var(--orange)" }}>
              Commencer gratuitement →
            </CheckoutButton>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="tarifs" className="py-24 px-4" style={{ backgroundColor: "var(--navy)" }}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest mb-3 text-orange-400">Tarifs</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Simple et transparent</h2>
              <p className="text-blue-200 text-lg">Essai gratuit 7 jours — annulation à tout moment</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {PLANS.map(plan => (
                <div key={plan.name} className={`rounded-2xl p-8 ${plan.highlighted ? "bg-white" : "bg-white/10 border border-white/20"}`}>
                  {plan.badge && (
                    <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4 text-white" style={{ backgroundColor: plan.highlighted ? "var(--orange)" : "rgba(255,255,255,0.2)" }}>
                      {plan.badge}
                    </span>
                  )}
                  <h3 className={`text-xl font-bold mb-1 ${plan.highlighted ? "" : "text-white"}`} style={plan.highlighted ? { color: "var(--navy)" } : {}}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.highlighted ? "text-gray-500" : "text-blue-200"}`}>{plan.description}</p>
                  <div className="mb-8 flex items-end gap-1">
                    <span className={`text-5xl font-extrabold ${plan.highlighted ? "" : "text-white"}`} style={plan.highlighted ? { color: "var(--navy)" } : {}}>
                      {plan.priceLabel}
                    </span>
                    {plan.period && <span className={`text-lg mb-1 ${plan.highlighted ? "text-gray-400" : "text-blue-200"}`}>{plan.period}</span>}
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map(f => (
                      <li key={f} className={`flex items-center gap-3 text-sm ${plan.highlighted ? "text-gray-600" : "text-blue-100"}`}>
                        <span style={{ color: "var(--orange)" }}>✓</span>{f}
                      </li>
                    ))}
                  </ul>
                  {plan.href === LS_CHECKOUT ? (
                    <CheckoutButton
                      className={`block w-full text-center font-bold py-3.5 rounded-xl transition-colors ${plan.highlighted ? "text-white" : "text-white border border-white/30 hover:bg-white/10"}`}
                      style={plan.highlighted ? { backgroundColor: "var(--orange)" } : {}}
                    >
                      {plan.cta}
                    </CheckoutButton>
                  ) : (
                    <Link href={plan.href} className={`block w-full text-center font-bold py-3.5 rounded-xl transition-colors text-white border border-white/30 hover:bg-white/10`}>
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
        <section id="faq" className="py-24 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-14">
              <p className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-extrabold" style={{ color: "var(--navy)" }}>Questions fréquentes</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map(faq => (
                <details key={faq.q} className="group bg-white border border-gray-100 rounded-2xl shadow-sm hover:border-gray-200 transition-colors">
                  <summary className="flex items-center justify-between gap-4 cursor-pointer px-6 py-5 font-semibold text-gray-800 list-none text-sm sm:text-base">
                    {faq.q}
                    <span className="text-gray-400 group-open:rotate-45 transition-transform shrink-0 text-xl font-light">+</span>
                  </summary>
                  <p className="px-6 pb-5 text-gray-500 leading-relaxed text-sm">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* ── SEO Guide ── */}
        <section className="py-20 px-4 border-y border-gray-100" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10" style={{ color: "var(--navy)" }}>
              Guide du devis professionnel artisan
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              {[
                { title: "Comment créer un devis professionnel rapidement ?", body: "Un bon devis artisan doit inclure vos coordonnées, celles du client, le détail des travaux, le coût de la main d'œuvre et des matériaux. Avec DevisFlow, l'IA génère tout en 30 secondes depuis votre téléphone. Idéal pour plombiers, électriciens, peintres et maçons." },
                { title: "Facturation électronique 2026 : ce qu'il faut savoir", body: "Dès septembre 2026, la facturation électronique est obligatoire pour toutes les entreprises françaises. DevisFlow génère des devis au format structuré conforme, vous prépare sans effort supplémentaire à cette évolution réglementaire." },
                { title: "Comment relancer un client après un devis ?", body: "73% des devis non signés ne le sont pas par désintérêt, mais parce que le client a oublié. DevisFlow envoie des relances automatiques à J+3 et J+7. Vous vous concentrez sur votre chantier, DevisFlow gère le suivi commercial." },
              ].map(a => (
                <article key={a.title} className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                  <h3 className="text-base font-bold mb-3" style={{ color: "var(--navy)" }}>{a.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{a.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ── */}
        <section className="py-24 px-4 text-center" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1e40af 100%)" }}>
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Prêt à prendre l&apos;avantage IA ?
            </h2>
            <p className="text-blue-200 text-lg mb-10">
              Rejoignez 800+ artisans qui ont transformé leur gestion des devis.
            </p>
            <CheckoutButton className="inline-block text-white font-bold text-lg px-12 py-5 rounded-xl shadow-xl transition-transform hover:scale-105" style={{ backgroundColor: "var(--orange)" }}>
              Commencer mon essai gratuit →
            </CheckoutButton>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-blue-400">
              {LOCK_ICON} Sans CB · Essai 7 jours · Annulation à tout moment
            </p>
          </div>
        </section>
      </main>

      {/* ── JSON-LD ── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: FAQS.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      })}} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org", "@type": "SoftwareApplication",
        name: "DevisFlow", applicationCategory: "BusinessApplication", operatingSystem: "Web",
        url: "https://devis-flow.fr",
        description: "Générateur de devis professionnels par IA pour artisans et TPE françaises. Conformité e-facture 2026.",
        offers: { "@type": "Offer", price: "29", priceCurrency: "EUR", priceSpecification: { "@type": "UnitPriceSpecification", price: "29", priceCurrency: "EUR", unitText: "MONTH" } },
        aggregateRating: { "@type": "AggregateRating", ratingValue: "4.9", bestRating: "5", worstRating: "1", ratingCount: "200" },
      })}} />

      {/* ── Footer ── */}
      <footer className="py-12 px-4 text-center text-sm text-blue-200" style={{ backgroundColor: "var(--navy-dark)" }}>
        <p className="font-extrabold text-white text-lg mb-1">Devis<span style={{ color: "var(--orange)" }}>Flow</span></p>
        <p className="mb-6 text-blue-300 text-sm">Le générateur de devis IA pour les artisans français</p>
        <div className="flex flex-wrap justify-center gap-6 text-xs text-blue-400 mb-6">
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
