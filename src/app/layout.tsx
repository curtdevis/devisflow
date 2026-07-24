import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import CookieBanner from "./_components/CookieBanner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "DevisFlow — Logiciel Devis Artisan IA | Essai Gratuit 7 Jours",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/logo-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: "/favicon.ico",
  },
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
    <html lang="fr" className={`${geistSans.variable} ${instrumentSerif.variable} h-full antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://vpkafkilducttjucrzze.supabase.co" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://devisflow.lemonsqueezy.com" />
        <link rel="dns-prefetch" href="https://va.vercel-scripts.com" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/logo-512.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#1e3a5f" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
        <Analytics />
        <CookieBanner />
      </body>
    </html>
  );
}
