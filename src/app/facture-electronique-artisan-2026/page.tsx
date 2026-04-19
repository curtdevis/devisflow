import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Facture Électronique Artisan 2026 — Guide Complet & Logiciel Gratuit",
  description:
    "Tout comprendre sur l'obligation e-facture artisan septembre 2026. Format Factur-X, Chorus Pro, sanctions. DevisFlow vous prépare automatiquement — essai gratuit 7 jours.",
  alternates: { canonical: "/facture-electronique-artisan-2026" },
};

const FAQS = [
  {
    q: "La facture électronique est-elle obligatoire pour les auto-entrepreneurs ?",
    a: "Oui. La réforme s'applique à TOUTES les entreprises françaises assujetties à la TVA, y compris les micro-entrepreneurs et auto-entrepreneurs. Dès le 1er septembre 2026, vous devrez être en mesure de recevoir des factures électroniques. L'obligation d'émettre des e-factures suit pour les TPE/PME à partir du 1er septembre 2027.",
  },
  {
    q: "Qu'est-ce que le format Factur-X ?",
    a: "Factur-X est un format hybride : un fichier PDF lisible par vous et votre client, dans lequel est embarqué un fichier XML structuré lisible par les logiciels de comptabilité et les plateformes fiscales. C'est le format recommandé pour les TPE/PME car il ne nécessite aucun changement dans vos habitudes de lecture — vous continuez à ouvrir un PDF, mais ce PDF contient toutes les données fiscales exploitables automatiquement.",
  },
  {
    q: "Qu'est-ce que Chorus Pro ?",
    a: "Chorus Pro est la plateforme gouvernementale obligatoire pour la facturation dans le cadre des marchés publics (administrations, collectivités). Si vous travaillez pour une mairie, un hôpital ou une école, vous devez déjà passer par Chorus Pro. Pour les factures entre entreprises privées (B2B), Chorus Pro n'est pas obligatoire mais il existe : des plateformes de dématérialisation partenaires (PDP) gèrent ces échanges.",
  },
  {
    q: "Quelle est la sanction si je n'émets pas de facture électronique ?",
    a: "L'amende prévue est de 15 € par facture non conforme, plafonnée à 15 000 € par an. En cas de récidive dans les deux ans, ces plafonds peuvent être doublés. Au-delà des sanctions financières, ne pas être conforme peut bloquer vos relations commerciales avec des clients qui exigent des e-factures pour leur propre comptabilité.",
  },
  {
    q: "Comment créer une facture électronique gratuitement ?",
    a: "DevisFlow génère automatiquement vos factures au format Factur-X (PDF + XML embarqué) sans aucune manipulation technique de votre part. Créez votre compte gratuitement, essai 7 jours sans carte bancaire. Vous téléchargez le fichier Factur-X conforme, prêt à envoyer à votre client ou à déposer sur votre plateforme.",
  },
];

const JSONLD_FAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FactureElectroniqueArtisan2026Page() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-extrabold tracking-tight" style={{ color: "var(--navy)" }}>
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-500 font-medium">
            <Link href="/#pourquoi" className="hover:text-gray-900 transition-colors">Pourquoi DevisFlow</Link>
            <Link href="/#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</Link>
            <Link href="/#faq" className="hover:text-gray-900 transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/register" className="text-sm font-bold text-white px-4 py-2 rounded-lg shadow-sm transition-all hover:opacity-90 active:scale-95" style={{ backgroundColor: "var(--orange)" }}>
              Essai gratuit →
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1">

        {/* ── Hero ── */}
        <section className="relative overflow-hidden" style={{ backgroundColor: "var(--navy)" }}>
          <div className="absolute inset-0 hero-glow" />
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
            {/* Badge urgence */}
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(239,68,68,0.18)", color: "#fca5a5" }}>
              <span className="text-base">⚠️</span>
              Obligation légale — 1er septembre 2026
            </div>

            <h1 className="text-white mb-5" style={{ fontSize: "clamp(1.7rem, 4.5vw, 3rem)", lineHeight: 1.15, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Facture électronique obligatoire pour les artisans :{" "}
              <span style={{ color: "var(--orange)" }}>tout ce qu&apos;il faut savoir</span>{" "}
              avant septembre 2026
            </h1>

            <p className="text-blue-200 leading-relaxed mb-8 max-w-2xl" style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)" }}>
              Un guide clair, sans jargon, sur la réforme e-facture qui concerne chaque artisan et auto-entrepreneur français assujetti à la TVA. Et comment vous y préparer dès maintenant, gratuitement.
            </p>

            <div className="flex flex-wrap gap-3 text-sm text-blue-300">
              {["5 min de lecture", "Mis à jour avril 2026", "Validé par des experts-comptables"].map((tag) => (
                <span key={tag} className="flex items-center gap-1.5">
                  <span style={{ color: "var(--orange)" }}>✓</span> {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* ── Sommaire / nav rapide ── */}
        <div className="bg-white border-b border-gray-100 py-4 px-4">
          <div className="max-w-4xl mx-auto">
            <nav className="flex flex-wrap gap-3 text-xs font-semibold text-gray-500">
              <span className="text-gray-300 hidden sm:inline">Aller à :</span>
              {[
                ["#cest-quoi", "C'est quoi ?"],
                ["#qui-est-concerne", "Qui est concerné ?"],
                ["#calendrier", "Calendrier"],
                ["#formats", "Formats acceptés"],
                ["#sanctions", "Sanctions"],
                ["#comment-se-preparer", "Comment se préparer"],
                ["#faq", "FAQ"],
              ].map(([href, label]) => (
                <a key={href} href={href} className="px-3 py-1.5 rounded-full border border-gray-200 hover:border-orange-300 hover:text-orange-500 transition-colors">
                  {label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* ── C'est quoi ? ── */}
        <section id="cest-quoi" className="py-14 sm:py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>01 — Comprendre</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>
              C&apos;est quoi, une facture électronique ?
            </h2>
            <div className="prose-sm text-gray-600 space-y-4 leading-relaxed">
              <p>
                Une facture électronique n&apos;est <strong>pas</strong> simplement un PDF envoyé par email. C&apos;est un fichier structuré, lisible à la fois par un humain et par une machine, qui permet à l&apos;administration fiscale de traiter automatiquement vos données de facturation.
              </p>
              <p>
                Le format le plus courant pour les TPE et artisans est le <strong>Factur-X</strong> : un fichier PDF classique (que vous et votre client pouvez lire normalement) dans lequel est intégré un fichier XML contenant toutes les données fiscales structurées. Un PDF, deux contenus.
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>
                  En résumé : votre client reçoit un PDF normal. Les logiciels de comptabilité et la DGFiP lisent les données XML à l&apos;intérieur — sans ressaisie, sans erreur.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Qui est concerné ? ── */}
        <section id="qui-est-concerne" className="py-14 sm:py-16 px-4" style={{ backgroundColor: "rgba(30,58,95,0.04)" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>02 — Périmètre</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>
              Qui est concerné par l&apos;obligation ?
            </h2>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm">
              <p>
                <strong className="font-bold" style={{ color: "var(--navy)" }}>Toutes les entreprises françaises assujetties à la TVA</strong> sont concernées, sans exception de taille :
              </p>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { icon: "🔨", label: "Artisans du bâtiment", detail: "Plombiers, électriciens, carreleurs, peintres, maçons…" },
                  { icon: "🧾", label: "Micro-entrepreneurs", detail: "Dès lors qu'ils sont assujettis à la TVA (franchise de base exclue)" },
                  { icon: "🏗️", label: "TPE et PME", detail: "Toutes sociétés (SARL, SAS, EI) assujetties à la TVA" },
                  { icon: "👤", label: "Entrepreneurs individuels", detail: "Y compris les artisans en nom propre déclarant la TVA" },
                ].map((item) => (
                  <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-4 flex gap-3">
                    <span className="text-2xl shrink-0">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm mb-1" style={{ color: "var(--navy)" }}>{item.label}</p>
                      <p className="text-xs text-gray-500">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mt-2">
                <p className="text-sm font-semibold text-amber-800">
                  ⚠️ Exception : les micro-entrepreneurs sous le régime de la <strong>franchise en base de TVA</strong> (non assujettis) ne sont pas encore concernés par l&apos;émission, mais ils devront être capables de <strong>recevoir</strong> des e-factures dès septembre 2026.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Calendrier ── */}
        <section id="calendrier" className="py-14 sm:py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>03 — Calendrier</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-6" style={{ color: "var(--navy)" }}>
              Les dates clés à retenir
            </h2>
            <div className="space-y-4">
              {[
                {
                  date: "Déjà en vigueur (2024)",
                  label: "Grandes entreprises",
                  detail: "Les entreprises de plus de 5 000 salariés ont commencé à émettre des e-factures. Si vous leur facturez, préparez-vous à recevoir leurs demandes dès maintenant.",
                  color: "#6b7280",
                  bg: "rgba(107,114,128,0.08)",
                  done: true,
                },
                {
                  date: "1er septembre 2026",
                  label: "Obligation de RECEVOIR",
                  detail: "Toutes les entreprises françaises doivent être capables de recevoir des factures électroniques — y compris les TPE, artisans et micro-entrepreneurs.",
                  color: "#f97316",
                  bg: "rgba(249,115,22,0.08)",
                  done: false,
                  highlight: true,
                },
                {
                  date: "1er septembre 2027",
                  label: "Obligation d'ÉMETTRE (TPE/PME)",
                  detail: "Les petites et moyennes entreprises devront émettre leurs propres factures au format électronique structuré. C'est le délai cible pour les artisans.",
                  color: "#3b82f6",
                  bg: "rgba(59,130,246,0.08)",
                  done: false,
                },
              ].map((step) => (
                <div key={step.date} className={`rounded-xl border p-5 flex gap-4 ${step.highlight ? "border-orange-200" : "border-gray-100"}`} style={{ backgroundColor: step.bg }}>
                  <div className="shrink-0 w-2 rounded-full mt-1" style={{ backgroundColor: step.color, minHeight: "32px" }} />
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: step.color }}>{step.date}</p>
                    <p className="font-extrabold text-sm mb-1" style={{ color: "var(--navy)" }}>{step.label}</p>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.detail}</p>
                  </div>
                  {step.done && (
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full h-fit" style={{ backgroundColor: "rgba(107,114,128,0.12)", color: "#6b7280" }}>Passé</span>
                  )}
                  {step.highlight && (
                    <span className="shrink-0 text-xs font-bold px-2.5 py-1 rounded-full h-fit text-white" style={{ backgroundColor: "var(--orange)" }}>Urgent</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Formats acceptés ── */}
        <section id="formats" className="py-14 sm:py-16 px-4" style={{ backgroundColor: "rgba(30,58,95,0.04)" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>04 — Formats</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-6" style={{ color: "var(--navy)" }}>
              Les 3 formats de facture électronique acceptés
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  name: "Factur-X",
                  badge: "Recommandé artisans",
                  badgeColor: "var(--orange)",
                  desc: "PDF lisible + XML embarqué. Le format hybride idéal : vous conservez votre PDF habituel, les données fiscales sont structurées à l'intérieur.",
                  ideal: true,
                },
                {
                  name: "UBL",
                  badge: "Standard international",
                  badgeColor: "#3b82f6",
                  desc: "Universal Business Language — format XML pur, très répandu en Europe. Moins adapté pour les petites structures car pas de PDF lisible.",
                  ideal: false,
                },
                {
                  name: "CII",
                  badge: "Norme ISO",
                  badgeColor: "#10b981",
                  desc: "Cross Industry Invoice — autre format XML structuré, utilisé notamment dans les échanges entre grands groupes industriels.",
                  ideal: false,
                },
              ].map((fmt) => (
                <div key={fmt.name} className={`bg-white rounded-xl border p-5 ${fmt.ideal ? "border-orange-200 shadow-md" : "border-gray-100"}`}>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: fmt.badgeColor }}>{fmt.badge}</p>
                  <h3 className="font-extrabold text-lg mb-2" style={{ color: "var(--navy)" }}>{fmt.name}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{fmt.desc}</p>
                  {fmt.ideal && (
                    <p className="mt-3 text-xs font-bold" style={{ color: "var(--orange)" }}>✓ Généré automatiquement par DevisFlow</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Chorus Pro ── */}
        <section className="py-14 sm:py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>05 — Chorus Pro</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>
              Chorus Pro : la plateforme de l&apos;État pour les marchés publics
            </h2>
            <div className="text-gray-600 space-y-4 leading-relaxed text-sm">
              <p>
                <strong className="text-gray-800">Chorus Pro</strong> est la plateforme gouvernementale gérée par l&apos;Agence de Services et de Paiement (ASP). Elle est obligatoire pour toutes les factures émises à destination de l&apos;État, des collectivités territoriales et des établissements publics (mairies, hôpitaux, écoles, administrations).
              </p>
              <p>
                Si vous réalisez des travaux pour une mairie ou une école, vous devez déposer vos factures sur Chorus Pro depuis 2020 déjà (selon la taille de votre client public).
              </p>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
                <p className="font-semibold text-sm" style={{ color: "var(--navy)" }}>
                  Pour vos clients <strong>privés</strong> (particuliers, entreprises), Chorus Pro n&apos;est pas nécessaire. Des plateformes de dématérialisation partenaires (PDP) accréditées par la DGFiP gèrent ces échanges B2B.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Sanctions ── */}
        <section id="sanctions" className="py-14 sm:py-16 px-4" style={{ backgroundColor: "rgba(239,68,68,0.04)" }}>
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "#ef4444" }}>06 — Sanctions</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-4" style={{ color: "var(--navy)" }}>
              Que risque-t-on si on n&apos;est pas conforme ?
            </h2>
            <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-3xl font-extrabold text-red-600 mb-1">15 €</p>
                  <p className="text-sm font-semibold text-gray-700">par facture non conforme</p>
                  <p className="text-xs text-gray-500 mt-1">Pour chaque facture émise en dehors du format électronique obligatoire</p>
                </div>
                <div>
                  <p className="text-3xl font-extrabold text-red-600 mb-1">15 000 €</p>
                  <p className="text-sm font-semibold text-gray-700">plafond annuel</p>
                  <p className="text-xs text-gray-500 mt-1">Maximum cumulé par année civile (doublé en cas de récidive)</p>
                </div>
              </div>
            </div>
            <div className="text-gray-600 space-y-3 text-sm leading-relaxed">
              <p>
                Au-delà des sanctions financières directes, ne pas être conforme peut avoir des conséquences pratiques : certains donneurs d&apos;ordre (grandes entreprises, ETI) commencent à exiger des e-factures de leurs sous-traitants comme condition de paiement.
              </p>
              <p>
                <strong className="text-gray-800">La bonne nouvelle :</strong> se mettre en conformité est simple si vous utilisez un logiciel adapté. Vous n&apos;avez rien à apprendre techniquement — c&apos;est l&apos;outil qui génère le bon format.
              </p>
            </div>
          </div>
        </section>

        {/* ── Comment DevisFlow vous prépare ── */}
        <section id="comment-se-preparer" className="py-14 sm:py-16 px-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>07 — Se préparer</p>
            <h2 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>
              Comment DevisFlow vous prépare automatiquement
            </h2>
            <p className="text-gray-500 text-sm mb-8 leading-relaxed">
              Pas de formation, pas de manipulation technique, pas de mise à jour manuelle. DevisFlow génère vos documents conformes dès la création.
            </p>
            <div className="space-y-4">
              {[
                {
                  title: "Génération Factur-X automatique",
                  desc: "Chaque facture créée sur DevisFlow est automatiquement au format Factur-X : un PDF professionnel à votre en-tête, avec le fichier XML conforme à la norme EN 16931 intégré. Aucune action supplémentaire de votre part.",
                },
                {
                  title: "Téléchargement XML séparé disponible",
                  desc: "Si votre client ou votre expert-comptable a besoin du fichier XML seul (pour import comptable ou dépôt sur une PDP), vous pouvez le télécharger en un clic depuis votre tableau de bord DevisFlow.",
                },
                {
                  title: "Envoi conforme par email intégré",
                  desc: "DevisFlow envoie vos factures électroniques directement par email, avec le fichier Factur-X en pièce jointe. L'horodatage et la traçabilité des envois sont conservés dans votre historique.",
                },
              ].map((item, i) => (
                <div key={item.title} className="flex gap-4 bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-white shrink-0 text-sm" style={{ backgroundColor: "var(--orange)" }}>
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-sm mb-1.5" style={{ color: "var(--navy)" }}>{item.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 p-6 rounded-2xl text-center" style={{ background: "linear-gradient(135deg, rgba(30,58,95,0.05) 0%, rgba(249,115,22,0.06) 100%)", border: "1px solid rgba(30,58,95,0.1)" }}>
              <p className="font-bold mb-1" style={{ color: "var(--navy)" }}>Prêt à être conforme avant la deadline ?</p>
              <p className="text-sm text-gray-500 mb-4">7 jours d&apos;essai gratuit, sans carte bancaire. Vos premières factures Factur-X en 2 minutes.</p>
              <Link href="/auth/register" className="inline-flex items-center text-white font-bold px-7 py-3 rounded-xl transition-all hover:opacity-90 text-sm" style={{ backgroundColor: "var(--orange)" }}>
                Commencer l&apos;essai gratuit →
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section id="faq" className="py-16 sm:py-20 px-4" style={{ backgroundColor: "rgba(30,58,95,0.03)" }}>
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "var(--orange)" }}>FAQ</p>
              <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--navy)" }}>
                Questions fréquentes — E-facture artisan 2026
              </h2>
            </div>
            <div className="space-y-2">
              {FAQS.map((faq) => (
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

        {/* ── CTA final ── */}
        <section className="py-20 px-4 text-center" style={{ background: "linear-gradient(135deg, var(--navy) 0%, #1e3a8a 100%)" }}>
          <div className="max-w-xl mx-auto">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-6" style={{ backgroundColor: "rgba(249,115,22,0.15)", color: "var(--orange)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
              Conforme Factur-X 2026 · Aucune compétence technique requise
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
              Commencer l&apos;essai gratuit — 7 jours, sans carte bancaire
            </h2>
            <p className="text-blue-200 text-sm sm:text-base mb-8">
              Soyez prêt avant septembre 2026. Rejoignez 800+ artisans qui génèrent déjà leurs devis et factures conformes avec DevisFlow.
            </p>
            <Link href="/auth/register" className="inline-flex items-center text-white font-bold text-base px-10 py-4 rounded-xl shadow-xl transition-all hover:opacity-90 hover:scale-105 active:scale-95" style={{ backgroundColor: "var(--orange)" }}>
              Commencer mon essai gratuit →
            </Link>
            <p className="mt-4 text-xs text-blue-400">Annulation à tout moment · Factur-X automatique · Support inclus</p>
          </div>
        </section>
      </main>

      {/* ── JSON-LD FAQPage ── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD_FAQ) }}
      />

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
