import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Démo — DevisFlow pour agences et groupements",
  description:
    "Vous gérez plusieurs artisans ? Découvrez DevisFlow en marque blanche pour cabinets comptables, fédérations et groupements BTP. Demandez une démo personnalisée.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact & Démo — DevisFlow pour agences et groupements",
    description:
      "Découvrez DevisFlow en marque blanche pour cabinets comptables, fédérations et groupements BTP. Demandez une démo personnalisée.",
    url: "https://devis-flow.fr/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
