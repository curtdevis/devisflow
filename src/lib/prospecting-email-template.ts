/** Subject line to use when sending prospecting emails */
export const PROSPECTING_SUBJECT = "Vos devis en 30 secondes — essai gratuit 7 jours";

/** Full HTML body for prospecting emails. No personalisation required — works with "Bonjour," only. */
export const PROSPECTING_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>DevisFlow — Générez vos devis en 30 secondes</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f6f9;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#1e3a5f;padding:28px 40px;">
              <img src="https://devis-flow.fr/logo.png" alt="DevisFlow" height="50" style="height:50px;width:auto;display:block;" />
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:40px 40px 32px 40px;color:#1a1a1a;">

              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;">Bonjour,</p>

              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;">
                Je m'appelle Nathan, fondateur de <strong style="color:#1e3a5f;">DevisFlow</strong> — un outil pensé pour les artisans comme vous.
              </p>

              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;">
                Combien de temps passez-vous chaque semaine à rédiger des devis ? Entre les calculs, la mise en page et les relances clients, c'est souvent des heures perdues.
              </p>

              <p style="margin:0 0 20px 0;font-size:16px;line-height:1.6;">
                <strong>DevisFlow génère des devis professionnels en moins de 30 secondes</strong>, directement depuis votre téléphone ou ordinateur :
              </p>

              <!-- BENEFITS LIST -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 28px 0;width:100%;">
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#1a1a1a;">
                    &#10003; &nbsp;Devis PDF prêt à envoyer en 30 secondes
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#1a1a1a;">
                    &#10003; &nbsp;Calcul automatique HT / TVA / TTC
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#1a1a1a;">
                    &#10003; &nbsp;Envoi direct par email ou WhatsApp
                  </td>
                </tr>
                <tr>
                  <td style="padding:6px 0;font-size:15px;color:#1a1a1a;">
                    &#10003; &nbsp;Mentions légales françaises incluses
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 32px 0;font-size:16px;line-height:1.6;">
                Essayez gratuitement pendant 7 jours.
              </p>

              <!-- CTA BUTTON -->
              <table cellpadding="0" cellspacing="0" style="margin:0 auto 36px auto;">
                <tr>
                  <td align="center" style="background-color:#f97316;border-radius:8px;">
                    <a href="https://devis-flow.fr"
                       style="display:inline-block;padding:16px 36px;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;letter-spacing:0.3px;">
                      Essayer gratuitement 7 jours &rarr;
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 8px 0;font-size:15px;line-height:1.6;color:#444444;">
                Si vous avez des questions, répondez simplement à cet email — je vous réponds personnellement.
              </p>

              <p style="margin:0;font-size:15px;line-height:1.6;color:#444444;">
                À bientôt,
              </p>

            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:2px solid #f97316;margin:0;" />
            </td>
          </tr>

          <!-- SIGNATURE -->
          <tr>
            <td style="padding:24px 40px 32px 40px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="vertical-align:middle;padding-right:16px;">
                    <img src="https://devis-flow.fr/logo.png" alt="DevisFlow" height="50" style="height:50px;width:auto;display:block;" />
                  </td>
                  <td style="vertical-align:middle;">
                    <p style="margin:0;font-size:15px;font-weight:bold;color:#1e3a5f;">Nathan Makambo | Fondateur — DevisFlow</p>
                    <p style="margin:2px 0 0 0;font-size:13px;color:#666666;">
                      <a href="mailto:noreply@devis-flow.fr" style="color:#f97316;text-decoration:none;">noreply@devis-flow.fr</a>
                      &nbsp;|&nbsp;
                      <a href="https://devis-flow.fr" style="color:#f97316;text-decoration:none;">devis-flow.fr</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#f4f6f9;padding:16px 40px;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;">
                Se désinscrire : répondez <strong>STOP</strong> à cet email
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
