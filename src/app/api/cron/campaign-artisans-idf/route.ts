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

function buildEmail(prospect: { nom: string; metier: string }): { subject: string; html: string } {
  const label = metierLabel(prospect.metier);
  const prenom = prospect.nom.split(" ")[0];

  const subject = `${prenom}, vos devis en 30 secondes — essai gratuit`;

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif;">
  <div style="max-width:580px;margin:32px auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

    <div style="background:#1e3a5f;padding:24px 32px;">
      <p style="margin:0;font-size:20px;font-weight:800;color:white;">
        Devis<span style="color:#f97316;">Flow</span>
      </p>
      <p style="margin:4px 0 0;font-size:13px;color:#93c5fd;">Le générateur de devis IA pour les artisans</p>
    </div>

    <div style="padding:28px 32px;">
      <p style="font-size:15px;color:#111827;margin:0 0 16px;">Bonjour,</p>

      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 16px;">
        En tant que <strong>${label}</strong>, vous passez probablement plusieurs heures par semaine
        à rédiger vos devis — pour des clients qui parfois ne répondent même pas.
      </p>

      <p style="font-size:15px;color:#374151;line-height:1.7;margin:0 0 24px;">
        <strong>DevisFlow</strong> change ça : décrivez vos travaux en langage naturel,
        l'IA génère un devis professionnel en <strong>30 secondes</strong>.
        Vos clients signent directement depuis leur téléphone.
      </p>

      <div style="background:#f9fafb;border-left:4px solid #f97316;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
        <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1e3a5f;text-transform:uppercase;letter-spacing:0.05em;">Ce que vous gagnez</p>
        <ul style="margin:0;padding-left:18px;color:#374151;font-size:14px;line-height:1.8;">
          <li>Devis en 30 secondes au lieu de 30 minutes</li>
          <li>Signature électronique — plus d'impression, de scan</li>
          <li>Relances automatiques J+3 et J+7</li>
          <li>Conformité e-facture obligatoire en 2026</li>
        </ul>
      </div>

      <div style="text-align:center;margin-bottom:24px;">
        <a href="${SITE_URL}?utm_source=cold&utm_medium=email&utm_campaign=artisans-idf-avril"
           style="display:inline-block;background:#f97316;color:#fff;font-weight:700;font-size:15px;padding:14px 32px;border-radius:10px;text-decoration:none;">
          Essayer gratuitement 7 jours →
        </a>
        <p style="margin:10px 0 0;font-size:12px;color:#9ca3af;">Sans carte bancaire · Sans engagement</p>
      </div>

      <p style="font-size:14px;color:#6b7280;line-height:1.6;margin:0;">
        Des questions ? Répondez directement à cet email — je vous répond sous 24h.<br>
        Nathan — fondateur DevisFlow
      </p>
    </div>

    <div style="background:#f9fafb;padding:16px 32px;border-top:1px solid #e5e7eb;text-align:center;">
      <p style="margin:0;font-size:11px;color:#9ca3af;line-height:1.6;">
        DevisFlow · <a href="${SITE_URL}" style="color:#9ca3af;">devis-flow.fr</a><br>
        Vous recevez cet email car votre activité est référencée dans les annuaires professionnels.<br>
        <a href="${SITE_URL}/unsubscribe?email={{email}}" style="color:#9ca3af;">Se désinscrire</a>
      </p>
    </div>
  </div>
</body>
</html>`;

  return { subject, html };
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
      const { subject, html } = buildEmail(prospect);
      const personalizedHtml = html.replace("{{email}}", encodeURIComponent(prospect.email));

      const { error } = await resend.emails.send({
        from: "Nathan — DevisFlow <bonjour@devis-flow.fr>",
        to: prospect.email,
        replyTo: "contact@devis-flow.fr",
        subject,
        html: personalizedHtml,
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
