"use client";

import { useEffect } from "react";
import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";

/**
 * DevisFlow only uses strictly necessary cookies (Supabase session) plus
 * cookie-less Vercel Analytics — see /confidentialite §7. No consent is
 * legally required for that, but this banner keeps the site transparent
 * about it and gives visitors an explicit way to review what's used.
 */
export default function CookieBanner() {
  useEffect(() => {
    CookieConsent.run({
      guiOptions: {
        consentModal: { layout: "box", position: "bottom left", equalWeightButtons: false },
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
                "DevisFlow utilise uniquement des cookies strictement nécessaires au fonctionnement du service (authentification). Aucun cookie publicitaire ou de suivi comportemental n'est déposé. Voir notre politique de confidentialité.",
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
  }, []);

  return null;
}
