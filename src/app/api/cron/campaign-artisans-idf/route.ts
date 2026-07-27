import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://devis-flow.fr";

// One-shot campaign — only fires on 2026-04-20, ignored every other day
const CAMPAIGN_DATE = "2026-04-20";

const PROSPECTS = [
  { nom: "Plombier Paris Express", metier: "plombier", email: "contact@plombier-paris-express.com" },
  { nom: "Artisan André Père et Fils", metier: "plombier", email: "contact@artisan-andre.fr" },
  { nom: "Bruno Plombier Chauffagiste", metier: "plombier", email: "contact@bruno-plombier-chauffagiste.fr" },
  { nom: "EBP Artisan Plombier", metier: "plombier", email: "boreedouard@gmail.com" },
  { nom: "L'Atelier Du Plombier Paris", metier: "plombier", email: "services@atelier-du-plombier.com" },
  { nom: "Le Plombier Royal", metier: "plombier", email: "contact@plombier-royal.fr" },
  { nom: "PARIS HOME RÉNOVATION", metier: "plombier", email: "parishomerenovation75@sfr.fr" },
  { nom: "Electricien Paris IDF", metier: "electricien", email: "contact@electricien-paris-idf.com" },
  { nom: "Testelec", metier: "electricien", email: "testelec@orange.fr" },
  { nom: "BELMARD BÂTIMENT", metier: "electricien", email: "belmard.batiment@gmail.com" },
  { nom: "BAT'INOV", metier: "electricien", email: "contact@bat-inov.com" },
  { nom: "EFFI-ELEC", metier: "electricien", email: "contact@effi-elec.fr" },
  { nom: "JS Elec", metier: "electricien", email: "js.elec95@orange.fr" },
  { nom: "Eagles Prod France", metier: "electricien", email: "eaglesprodfrance@yahoo.com" },
  { nom: "E.D.C. Multi Services", metier: "electricien", email: "edcmultiservices@gmail.com" },
  { nom: "Almeida Maçonnerie Rénovation", metier: "macon", email: "contact@almeida.fr" },
  { nom: "TD Rénovation Paris", metier: "macon", email: "contact.tdrenovation@gmail.com" },
  { nom: "IACUBOV GROUPE RENOVATION", metier: "macon", email: "contact@iacubov-groupe-renovation.fr" },
  { nom: "GLEFEBVRE SAS", metier: "macon", email: "plomberie@glefebvre.fr" },
  { nom: "MC2 RENOVATION", metier: "macon", email: "mc2.renovation@hotmail.com" },
  { nom: "Artisans de France", metier: "macon", email: "contact@lesartisansdefrance.com" },
  { nom: "Entreprise Corbet", metier: "plombier", email: "entreprisecorbet@wanadoo.fr" },
  { nom: "2.P.C.J.", metier: "plombier", email: "contact@2pcj.fr" },
  { nom: "Ets Picard & Fils", metier: "plombier", email: "picard.devis@gmail.com" },
  { nom: "Leforge et Fils", metier: "plombier", email: "leforge.devis@gmail.com" },
  { nom: "ADS Sanitaire 95", metier: "plombier", email: "adssanitaire@gmail.com" },
  { nom: "ALS Plombier 92", metier: "plombier", email: "contact@artisan-plombier-92.fr" },
  { nom: "Les Travaux du Particulier", metier: "plombier", email: "contact@travauxduparticulier.fr" },
  { nom: "ArchiPeinture", metier: "peintre", email: "projet@archipeinture.fr" },
  { nom: "Degarde Pascal", metier: "peintre", email: "p.degarde@free.fr" },
  { nom: "David Bonnaire Bâtiment", metier: "peintre", email: "contact@bonnaire-batiment.com" },
  { nom: "Diers Peinture", metier: "peintre", email: "hervediers77@gmail.com" },
  { nom: "Entreprise BAUD", metier: "peintre", email: "baudartisan91@gmail.com" },
  { nom: "Groupe CPR 77", metier: "peintre", email: "contact@groupecpr.fr" },
  { nom: "Groupe CPR 95", metier: "peintre", email: "contact95@groupecpr.fr" },
  { nom: "Groupe CPR 94", metier: "peintre", email: "contact94@groupecpr.fr" },
  { nom: "Groupe CPR 91", metier: "peintre", email: "contact91@groupecpr.fr" },
  { nom: "ML Rénov 92", metier: "carreleur", email: "mlrenov@gmail.com" },
  { nom: "AM-Rénovations", metier: "carreleur", email: "contact@am-renovation.com" },
];

function metierLabel(metier: string): string {
  const labels: Record<string, string> = {
    plombier: "plombier",
    electricien: "électricien",
    macon: "maçon",
    peintre: "peintre en bâtiment",
    carreleur: "carreleur",
  };
  return labels[metier] ?? metier;
}

function buildEmail(prospect: { nom: string; metier: string; email: string }): { subject: string; html: string; text: string } {
  const label = metierLabel(prospect.metier);
  const prenom = prospect.nom.split(" ")[0];
  const utmUrl = `${SITE_URL}?utm_source=cold&utm_medium=email&utm_campaign=artisans-idf-avril`;
  const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(prospect.email)}`;

  const subject = `${prenom}, vos devis en 30 secondes`;

  const html = `<!DOCTYPE html>
<html lang="fr" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <title>DevisFlow</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;-webkit-text-size-adjust:100%;mso-line-height-rule:exactly;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:#f3f4f6;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    G&eacute;n&eacute;rez vos devis en 30 secondes avec l&rsquo;IA &mdash; essai gratuit 7 jours, sans carte bancaire.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f4f6;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="580" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;width:100%;background:white;border-radius:12px;overflow:hidden;">

          <!-- En-tête avec logo -->
          <tr>
            <td style="background:#1e3a5f;padding:24px 32px;">
              <a href="${SITE_URL}" style="text-decoration:none;display:block;">
                <img src="${SITE_URL}/logo.png" alt="DevisFlow" width="160" height="auto"
                     style="display:block;border:0;outline:none;max-width:160px;height:auto;"
                     onerror="this.style.display='none';this.nextElementSibling.style.display='block';">
                <span style="display:none;font-size:22px;font-weight:800;color:white;font-family:Arial,sans-serif;">
                  Devis<span style="color:#f97316;">Flow</span>
                </span>
              </a>
              <p style="margin:8px 0 0;font-size:13px;color:#93c5fd;font-family:Arial,sans-serif;">Le g&eacute;n&eacute;rateur de devis IA pour les artisans</p>
            </td>
          </tr>

          <!-- Corps -->
          <tr>
            <td style="padding:28px 32px;">
              <p style="font-size:15px;color:#111827;margin:0 0 16px;font-family:Arial,sans-serif;">Bonjour,</p>

              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;font-family:Arial,sans-serif;">
                En tant que <strong>${label}</strong>, vous passez probablement plusieurs heures par semaine
                &agrave; r&eacute;diger vos devis &mdash; pour des clients qui parfois ne r&eacute;pondent m&ecirc;me pas.
              </p>

              <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;font-family:Arial,sans-serif;">
                <strong>DevisFlow</strong> change &ccedil;a&nbsp;: d&eacute;crivez vos travaux en langage naturel,
                notre IA g&eacute;n&egrave;re un devis professionnel en <strong>30 secondes</strong>.
                Vos clients signent directement depuis leur t&eacute;l&eacute;phone.
              </p>

              <!-- Encart avantages -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f9fafb;border-left:4px solid #f97316;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.05em;font-family:Arial,sans-serif;">Ce que vous gagnez</p>
                    <p style="margin:0;font-size:14px;color:#374151;line-height:1.9;font-family:Arial,sans-serif;">
                      &bull;&nbsp; Devis en 30 secondes au lieu de 30 minutes<br>
                      &bull;&nbsp; Signature &eacute;lectronique &mdash; plus d&rsquo;impression, de scan<br>
                      &bull;&nbsp; Relances automatiques J+3 et J+7<br>
                      &bull;&nbsp; Conformit&eacute; e-facture obligatoire en 2026
                    </p>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <a href="${utmUrl}"
                       style="display:inline-block;background:#f97316;color:#ffffff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;font-family:Arial,sans-serif;">
                      Essayer gratuitement 7 jours &#8594;
                    </a>
                    <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;font-family:Arial,sans-serif;">Sans carte bancaire &middot; Sans engagement</p>
                  </td>
                </tr>
              </table>

              <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0 0 24px;font-family:Arial,sans-serif;">
                Des questions&nbsp;? R&eacute;pondez directement &agrave; cet email, je vous r&eacute;ponds sous 24h.
              </p>

              <!-- Signature -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #e5e7eb;padding-top:20px;width:100%;">
                <tr>
                  <td style="padding-right:16px;vertical-align:middle;width:72px;">
                    <img src="${SITE_URL}/logo.png" alt="DevisFlow" width="60" height="60"
                         style="display:block;border-radius:8px;border:0;object-fit:contain;background:#1e3a5f;padding:4px;"
                         onerror="this.style.display='none';">
                  </td>
                  <td style="vertical-align:middle;border-left:2px solid #e5e7eb;padding-left:16px;">
                    <p style="margin:0;font-size:14px;font-weight:700;color:#111827;font-family:Arial,sans-serif;">Nathan Makambo</p>
                    <p style="margin:2px 0;font-size:12px;color:#6b7280;font-family:Arial,sans-serif;">Fondateur &amp; CEO, DevisFlow</p>
                    <p style="margin:4px 0 0;font-size:12px;font-family:Arial,sans-serif;">
                      <a href="mailto:contact@devis-flow.fr" style="color:#f97316;text-decoration:none;">contact@devis-flow.fr</a>
                      &nbsp;&middot;&nbsp;
                      <a href="${SITE_URL}" style="color:#f97316;text-decoration:none;">devis-flow.fr</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Pied de page -->
          <tr>
            <td style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.8;font-family:Arial,sans-serif;">
                DevisFlow &mdash; Paris, France &middot; <a href="${SITE_URL}" style="color:#9ca3af;text-decoration:none;">devis-flow.fr</a><br>
                Vous recevez cet email car votre activit&eacute; est r&eacute;f&eacute;renc&eacute;e dans les annuaires professionnels.<br>
                <a href="${unsubUrl}" style="color:#9ca3af;">Se d&eacute;sinscrire</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = `Bonjour,

En tant que ${label}, vous passez probablement plusieurs heures par semaine a rediger vos devis -- pour des clients qui parfois ne repondent meme pas.

DevisFlow change ca : decrivez vos travaux en langage naturel, notre IA genere un devis professionnel en 30 secondes. Vos clients signent directement depuis leur telephone.

Ce que vous gagnez :
- Devis en 30 secondes au lieu de 30 minutes
- Signature electronique -- plus d'impression, de scan
- Relances automatiques J+3 et J+7
- Conformite e-facture obligatoire en 2026

Essayer gratuitement 7 jours (sans carte bancaire) :
${utmUrl}

Des questions ? Repondez directement a cet email, je vous reponds sous 24h.

--
Nathan Makambo
Fondateur & CEO, DevisFlow
contact@devis-flow.fr | devis-flow.fr

---
Vous recevez cet email car votre activite est referencee dans les annuaires professionnels.
Se desinscrire : ${unsubUrl}`;

  return { subject, html, text };
}

export async function GET(request: NextRequest) {
  // Guard: only Vercel cron calls (or manual with secret)
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // One-shot guard: only run on campaign date
  const today = new Date().toISOString().slice(0, 10);
  if (today !== CAMPAIGN_DATE) {
    console.log(`[campaign-artisans-idf] Skipped — today is ${today}, campaign date is ${CAMPAIGN_DATE}`);
    return NextResponse.json({ skipped: true, today, campaignDate: CAMPAIGN_DATE });
  }

  console.log(`[campaign-artisans-idf] Sending to ${PROSPECTS.length} prospects…`);

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const prospect of PROSPECTS) {
    try {
      const { subject, html, text } = buildEmail(prospect);
      const unsubUrl = `${SITE_URL}/unsubscribe?email=${encodeURIComponent(prospect.email)}`;

      const { error } = await resend.emails.send({
        from: "DevisFlow <bonjour@devis-flow.fr>",
        to: prospect.email,
        replyTo: "contact@devis-flow.fr",
        subject,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<mailto:contact@devis-flow.fr?subject=unsubscribe>, <${unsubUrl}>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
          "X-Entity-Ref-ID": `campaign-artisans-idf-${prospect.email}`,
        },
      });

      if (error) {
        console.error(`[campaign] FAIL ${prospect.email}:`, error);
        results.push({ email: prospect.email, ok: false, error: error.message });
      } else {
        console.log(`[campaign] OK ${prospect.email}`);
        results.push({ email: prospect.email, ok: true });
      }

      // 300ms pause between sends to stay under Resend rate limits
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown";
      results.push({ email: prospect.email, ok: false, error: msg });
    }
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;
  console.log(`[campaign-artisans-idf] Done — ${sent} sent, ${failed} failed`);

  return NextResponse.json({ sent, failed, results });
}
