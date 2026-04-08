import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Créer un devis — DevisFlow",
  description:
    "Générez un devis professionnel en 30 secondes grâce à l'IA. Renseignez vos informations, décrivez vos travaux et obtenez un devis au format PDF professionnel.",
  alternates: {
    canonical: "/devis",
  },
  openGraph: {
    title: "Créer un devis — DevisFlow",
    description:
      "Générez un devis professionnel en 30 secondes grâce à l'IA. Format PDF professionnel.",
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
