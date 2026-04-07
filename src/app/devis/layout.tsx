import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un devis — DevisFlow",
  description:
    "Générez un devis professionnel en 30 secondes grâce à l'IA. Renseignez vos informations, décrivez vos travaux et obtenez un devis conforme e-facture 2026.",
  alternates: {
    canonical: "/devis",
  },
  openGraph: {
    title: "Créer un devis — DevisFlow",
    description:
      "Générez un devis professionnel en 30 secondes grâce à l'IA. Conforme e-facture 2026.",
    url: "https://devis-flow.fr/devis",
  },
};

export default function DevisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
