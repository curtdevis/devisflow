import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DevisFlow — Logiciel Devis Artisan IA | France",
  description:
    "Créez des devis professionnels en 30 secondes avec l'IA. Format PDF professionnel. Essai gratuit 7 jours. Pour plombiers, électriciens, peintres et tous artisans.",
  keywords: [
    "devis artisan",
    "générateur devis IA",
    "logiciel devis plombier",
    "devis électricien",
    "devis professionnel PDF",
    "devis professionnel",
    "devis plombier",
    "devis electricien",
    "devis peintre",
    "logiciel devis artisan gratuit",
    "application devis batiment",
  ],
  metadataBase: new URL("https://devis-flow.fr"),
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "DevisFlow — Logiciel Devis Artisan IA | France",
    description:
      "Créez des devis professionnels en 30 secondes avec l'IA. Format PDF professionnel. Essai gratuit 7 jours.",
    url: "https://devis-flow.fr",
    siteName: "DevisFlow",
    images: [
      {
        url: "/logo-512.png",
        width: 512,
        height: 512,
        alt: "DevisFlow — Logiciel Devis Artisan IA | France",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "DevisFlow — Logiciel Devis Artisan IA | France",
    description:
      "Créez des devis professionnels en 30 secondes avec l'IA. Format PDF professionnel. Essai gratuit 7 jours.",
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
        <Analytics />
      </body>
    </html>
  );
}
