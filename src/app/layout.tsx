import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevisFlow — Générateur de devis IA pour artisans | Conforme e-facture 2026",
  description:
    "Créez des devis professionnels en 30 secondes avec l'IA. Conforme e-facture 2026. Essai gratuit 14 jours. Pour plombiers, électriciens, peintres et tous artisans.",
  keywords: [
    "devis artisan",
    "générateur devis IA",
    "logiciel devis plombier",
    "devis électricien",
    "e-facture 2026",
    "devis professionnel",
  ],
  metadataBase: new URL("https://devis-flow.fr"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "DevisFlow — Générateur de devis IA pour artisans | Conforme e-facture 2026",
    description:
      "Créez des devis professionnels en 30 secondes avec l'IA. Conforme e-facture 2026. Essai gratuit 14 jours.",
    url: "https://devis-flow.fr",
    siteName: "DevisFlow",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "DevisFlow — Générateur de devis IA pour artisans",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DevisFlow — Générateur de devis IA pour artisans",
    description:
      "Créez des devis professionnels en 30 secondes avec l'IA. Conforme e-facture 2026. Essai gratuit 14 jours.",
    images: ["/logo-512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-white text-gray-900">
        {children}
      </body>
    </html>
  );
}
