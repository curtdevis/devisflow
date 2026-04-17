import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevisFlow — Logiciel Devis Artisan IA | Essai Gratuit 7 Jours",
  description:
    "Générez des devis professionnels en 30 secondes avec l'IA. Conforme facture électronique 2026 (Factur-X). Pour plombiers, électriciens, peintres, maçons, carreleurs, chauffagistes. Essai gratuit 7 jours — sans carte bancaire.",
  keywords: [
    "logiciel devis artisan",
    "générateur devis plombier",
    "générateur devis électricien",
    "générateur devis peintre",
    "devis professionnel gratuit artisan",
    "application devis batiment france",
    "facture electronique artisan 2026",
    "devis artisan IA",
    "logiciel devis artisan gratuit",
    "devis maçon",
    "devis carreleur",
    "devis chauffagiste",
    "devis professionnel PDF",
    "générateur devis IA",
    "devis plombier",
    "devis electricien",
    "facture électronique 2026",
    "Factur-X artisan",
    "devis bâtiment",
    "application devis TPE PME",
  ],
  metadataBase: new URL("https://devis-flow.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DevisFlow — Logiciel Devis Artisan IA | Essai Gratuit 7 Jours",
    description:
      "Générez des devis professionnels en 30 secondes avec l'IA. Conforme facture électronique 2026. Pour tous artisans — plombiers, électriciens, maçons, peintres. Essai gratuit 7 jours.",
    url: "https://devis-flow.fr",
    siteName: "DevisFlow",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "DevisFlow — Logiciel Devis Artisan IA",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevisFlow — Logiciel Devis Artisan IA | Essai Gratuit 7 Jours",
    description:
      "Générez des devis professionnels en 30 secondes avec l'IA. Conforme facture électronique 2026. Essai gratuit 7 jours.",
    images: ["/logo-512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "",
  },
  other: {
    "geo.region": "FR",
    "geo.placename": "France",
    "content-language": "fr",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "DevisFlow",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: "https://devis-flow.fr",
  description:
    "Logiciel SaaS de génération de devis professionnels par intelligence artificielle pour artisans français. Conforme réglementation facture électronique 2026.",
  offers: {
    "@type": "Offer",
    price: "29",
    priceCurrency: "EUR",
    priceValidUntil: "2027-12-31",
    description: "Abonnement mensuel artisan — essai gratuit 7 jours",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "127",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@type": "Organization",
    name: "DevisFlow",
    url: "https://devis-flow.fr",
  },
  inLanguage: "fr-FR",
  audience: {
    "@type": "BusinessAudience",
    audienceType: "Artisans, TPE, PME françaises",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
