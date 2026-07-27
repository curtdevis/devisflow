"use client";

import { useEffect } from "react";

/**
 * DevisFlow only uses strictly necessary cookies (Supabase session) plus
 * cookie-less Vercel Analytics — see /confidentialite §7. No consent is
 * legally required for that, but this banner keeps the site transparent
 * about it and gives visitors an explicit way to review what's used.
 *
 * Both the library and its CSS are dynamically imported inside the effect
 * (not statically at module scope) so neither ships in the initial bundle
 * or the global stylesheet — a "box" layout + long description previously
 * made this banner's own text the page's LCP element on slow connections.
 * Layout is now a compact bottom bar with a short description, which keeps
 * it too small to ever compete with real hero content for LCP.
 */
export default function CookieBanner() {
  useEffect(() => {
    let cancelled = false;

    Promise.all([
      import("vanilla-cookieconsent"),
      import("vanilla-cookieconsent/dist/cookieconsent.css"),
    ]).then(([CookieConsent]) => {
      if (cancelled) return;
      CookieConsent.run({
        guiOptions: {
          consentModal: { layout: "cloud", position: "bottom", equalWeightButtons: false },
          preferencesModal: { layout: "box", position: "right" },
        },
        categories: {
          necessary: { readOnly: true, enabled: true },
        },
        language: {
          default: "fr",
          translations: {
            fr: {
              consentModal: {
                title: "Cookies",
                description:
                  "Uniquement des cookies strictement nécessaires (authentification). Aucun tracking.",
                acceptAllBtn: "J'ai compris",
                showPreferencesBtn: "Détails",
                footer: '<a href="/confidentialite">Politique de confidentialité</a>',
              },
              preferencesModal: {
                title: "Préférences cookies",
                acceptAllBtn: "J'ai compris",
                savePreferencesBtn: "Enregistrer",
                closeIconLabel: "Fermer",
                sections: [
                  {
                    title: "Cookies strictement nécessaires",
                    description:
                      "Uniquement le cookie de session Supabase, indispensable pour rester connecté à votre compte. Ce cookie ne peut pas être désactivé.",
                    linkedCategory: "necessary",
                  },
                ],
              },
            },
          },
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
