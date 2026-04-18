import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion — DevisFlow",
  description: "Connectez-vous à votre compte DevisFlow pour créer et gérer vos devis professionnels.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
