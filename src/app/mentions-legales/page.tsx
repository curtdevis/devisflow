import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — DevisFlow",
  description: "Mentions légales de DevisFlow, éditeur du logiciel de devis pour artisans.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <Link href="/" className="text-sm text-blue-200 hover:text-white transition-colors">
            ← Retour à l&apos;accueil
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>
          Mentions légales
        </h1>
        <p className="text-gray-400 text-sm mb-10">Dernière mise à jour : avril 2026</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>1. Éditeur du site</h2>
            <p>
              Le site <strong>devis-flow.fr</strong> est édité par la société <strong>DevisFlow</strong>,
              entreprise immatriculée en France.
            </p>
            <ul className="mt-3 space-y-1 text-sm">
              <li><strong>Raison sociale :</strong> DevisFlow</li>
              <li><strong>Forme juridique :</strong> SAS (Société par Actions Simplifiée)</li>
              <li><strong>Siège social :</strong> France</li>
              <li><strong>Email :</strong> <a href="mailto:contact@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>contact@devis-flow.fr</a></li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>2. Directeur de la publication</h2>
            <p>Le directeur de la publication est le représentant légal de la société DevisFlow.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>3. Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong>, 340 Pine Street, Suite 701,
              San Francisco, CA 94104, États-Unis. (<a href="https://vercel.com" className="underline" style={{ color: "var(--orange)" }}>vercel.com</a>)
            </p>
            <p className="mt-2">
              Les données utilisateurs sont stockées sur <strong>Supabase</strong>, infrastructure hébergée
              sur AWS EU (Europe) conformément au RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>4. Propriété intellectuelle</h2>
            <p>
              L&apos;ensemble du contenu du site devis-flow.fr (textes, images, logos, interface, code source)
              est protégé par le droit d&apos;auteur et appartient à DevisFlow ou à ses concédants de licence.
              Toute reproduction, représentation, modification ou exploitation non autorisée est interdite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>5. Données personnelles</h2>
            <p>
              Le traitement de vos données personnelles est décrit dans notre{" "}
              <Link href="/confidentialite" className="underline" style={{ color: "var(--orange)" }}>
                Politique de confidentialité
              </Link>.
              Conformément au RGPD, vous disposez de droits d&apos;accès, de rectification et de suppression
              de vos données. Pour exercer ces droits, contactez : <a href="mailto:privacy@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>privacy@devis-flow.fr</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>6. Cookies</h2>
            <p>
              Le site utilise des cookies techniques strictement nécessaires au fonctionnement du service
              (authentification, session). Aucun cookie publicitaire ou de tracking tiers n&apos;est utilisé
              sans votre consentement explicite.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>7. Responsabilité</h2>
            <p>
              DevisFlow s&apos;efforce de maintenir les informations publiées sur ce site à jour et exactes.
              Toutefois, DevisFlow ne saurait être tenu responsable des erreurs, omissions ou de
              l&apos;indisponibilité du service. Les devis générés par l&apos;IA sont fournis à titre indicatif
              et l&apos;utilisateur est seul responsable de leur validation avant envoi à ses clients.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>8. Droit applicable</h2>
            <p>
              Le présent site et ses conditions d&apos;utilisation sont régis par le droit français.
              Tout litige sera soumis à la compétence exclusive des tribunaux français.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold mb-3" style={{ color: "var(--navy)" }}>9. Contact</h2>
            <p>
              Pour toute question relative aux présentes mentions légales :{" "}
              <a href="mailto:contact@devis-flow.fr" className="underline" style={{ color: "var(--orange)" }}>
                contact@devis-flow.fr
              </a>
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4 text-sm text-gray-400">
          <Link href="/cgu" className="hover:text-gray-600 underline">CGU</Link>
          <Link href="/confidentialite" className="hover:text-gray-600 underline">Politique de confidentialité</Link>
          <Link href="/contact" className="hover:text-gray-600 underline">Contact</Link>
        </div>
      </main>
    </div>
  );
}
