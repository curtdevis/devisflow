import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DevisLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface SendDevisRequest {
  recipientEmail: string;
  devis: {
    devisNumber: string;
    date: string;
    validUntil: string;
    artisan: { name: string; siret: string };
    client: { name: string; address: string; phone: string; email: string };
    lines: DevisLine[];
    subtotalHT: number;
    tvaRate: number;
    tvaAmount: number;
    totalTTC: number;
    notes: string;
    legalMentions: string;
  };
}

export async function POST(req: NextRequest) {
  let body: SendDevisRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide." }, { status: 400 });
  }

  const { recipientEmail, devis } = body;

  if (!recipientEmail || !devis) {
    return NextResponse.json({ error: "Données manquantes." }, { status: 400 });
  }

  const linesRows = devis.lines
    .map(
      (line, i) => `
      <tr style="background: ${i % 2 === 0 ? "#f9fafb" : "#ffffff"};">
        <td style="padding: 10px 14px; color: #374151; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${line.description}</td>
        <td style="padding: 10px 14px; text-align: right; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${line.quantity}</td>
        <td style="padding: 10px 14px; text-align: right; color: #6b7280; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${line.unitPrice.toFixed(2)} €</td>
        <td style="padding: 10px 14px; text-align: right; font-weight: 600; color: #111827; font-size: 13px; border-bottom: 1px solid #e5e7eb;">${line.total.toFixed(2)} €</td>
      </tr>`
    )
    .join("");

  const notesBlock = devis.notes
    ? `<div style="margin: 24px 0; padding: 14px 18px; background: #f3f4f6; border-left: 4px solid #1e3a5f; border-radius: 4px;">
        <p style="margin: 0 0 4px; font-size: 11px; font-weight: 700; color: #1e3a5f; text-transform: uppercase; letter-spacing: 0.05em;">Notes</p>
        <p style="margin: 0; font-size: 13px; color: #4b5563; line-height: 1.6;">${devis.notes}</p>
       </div>`
    : "";

  const emailHtml = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background: #f3f4f6; font-family: Arial, sans-serif;">
  <div style="max-width: 680px; margin: 32px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 4px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background: #1e3a5f; padding: 28px 36px;">
      <p style="margin: 0 0 4px; font-size: 22px; font-weight: 800; color: white;">
        Devis<span style="color: #f97316;">Flow</span>
      </p>
      <p style="margin: 0; font-size: 14px; color: #93c5fd;">Votre devis professionnel est prêt</p>
    </div>

    <!-- Intro -->
    <div style="padding: 28px 36px 0;">
      <p style="font-size: 15px; color: #111827; margin: 0 0 6px;">Bonjour <strong>${devis.client.name}</strong>,</p>
      <p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin: 0 0 24px;">
        Veuillez trouver ci-dessous votre devis <strong>N° ${devis.devisNumber}</strong> établi par <strong>${devis.artisan.name}</strong>,
        d'un montant total de <strong style="color: #1e3a5f;">${devis.totalTTC.toFixed(2)} € TTC</strong>.
      </p>

      <!-- Meta -->
      <div style="display: flex; gap: 24px; margin-bottom: 28px; flex-wrap: wrap;">
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 140px;">
          <p style="margin: 0 0 2px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Émis le</p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${devis.date}</p>
        </div>
        <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 140px;">
          <p style="margin: 0 0 2px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Valable jusqu'au</p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${devis.validUntil}</p>
        </div>
        <div style="background: #fff7ed; border: 1px solid #fed7aa; border-radius: 8px; padding: 12px 18px; flex: 1; min-width: 140px;">
          <p style="margin: 0 0 2px; font-size: 11px; color: #c2410c; text-transform: uppercase; letter-spacing: 0.05em;">Total TTC</p>
          <p style="margin: 0; font-size: 16px; font-weight: 800; color: #1e3a5f;">${devis.totalTTC.toFixed(2)} €</p>
        </div>
      </div>
    </div>

    <!-- Lines table -->
    <div style="padding: 0 36px;">
      <table style="width: 100%; border-collapse: collapse; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
        <thead>
          <tr style="background: #1e3a5f;">
            <th style="padding: 10px 14px; text-align: left; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em;">Description</th>
            <th style="padding: 10px 14px; text-align: right; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; width: 50px;">Qté</th>
            <th style="padding: 10px 14px; text-align: right; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; width: 90px;">PU HT</th>
            <th style="padding: 10px 14px; text-align: right; color: white; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; width: 90px;">Total HT</th>
          </tr>
        </thead>
        <tbody>${linesRows}</tbody>
      </table>
    </div>

    <!-- Totals -->
    <div style="padding: 20px 36px; display: flex; justify-content: flex-end;">
      <table style="width: 260px; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">Sous-total HT</td>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; text-align: right;">${devis.subtotalHT.toFixed(2)} €</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280;">TVA (${devis.tvaRate}%)</td>
          <td style="padding: 6px 0; font-size: 13px; color: #6b7280; text-align: right;">${devis.tvaAmount.toFixed(2)} €</td>
        </tr>
        <tr style="border-top: 2px solid #e5e7eb;">
          <td style="padding: 10px 0 4px; font-size: 16px; font-weight: 800; color: #1e3a5f;">Total TTC</td>
          <td style="padding: 10px 0 4px; font-size: 16px; font-weight: 800; color: #1e3a5f; text-align: right;">${devis.totalTTC.toFixed(2)} €</td>
        </tr>
      </table>
    </div>

    <!-- Notes -->
    <div style="padding: 0 36px;">
      ${notesBlock}
    </div>

    <!-- Signature -->
    <div style="padding: 24px 36px; margin: 0 36px 28px; border: 1px dashed #d1d5db; border-radius: 8px; background: #fafafa;">
      <p style="margin: 0 0 8px; font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em;">Bon pour accord — Signature client</p>
      <p style="margin: 0; font-size: 13px; color: #6b7280;">Pour accepter ce devis, veuillez répondre à cet email avec la mention <strong>« Bon pour accord »</strong> ou signer et retourner ce document.</p>
    </div>

    <!-- Legal -->
    <div style="padding: 0 36px 28px;">
      <p style="font-size: 11px; color: #9ca3af; line-height: 1.6; border-top: 1px solid #e5e7eb; padding-top: 16px; margin: 0;">
        ${devis.legalMentions}
      </p>
    </div>

    <!-- Footer -->
    <div style="background: #f9fafb; padding: 16px 36px; border-top: 1px solid #e5e7eb; text-align: center;">
      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
        Devis généré par <strong style="color: #1e3a5f;">DevisFlow</strong> — Le générateur de devis IA pour les artisans français
      </p>
    </div>
  </div>
</body>
</html>`;

  try {
    const response = await resend.emails.send({
      from: "DevisFlow <noreply@devis-flow.fr>",
      to: recipientEmail,
      replyTo: devis.artisan.name
        ? undefined
        : undefined,
      subject: `Votre devis N° ${devis.devisNumber} — ${devis.totalTTC.toFixed(2)} € TTC`,
      html: emailHtml,
    });

    console.log("[send-devis] Email sent:", response);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[send-devis] Resend error:", err);
    return NextResponse.json(
      { error: "Erreur lors de l'envoi de l'email." },
      { status: 500 }
    );
  }
}
