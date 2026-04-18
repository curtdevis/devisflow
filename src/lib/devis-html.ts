// Shared HTML builder for devis and invoices (used by DevisTable and FactureActions)

export interface DevisLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface DevisResult {
  devisNumber: string;
  date: string;
  validUntil: string;
  artisan: {
    name: string;
    siret: string;
    address?: string;
    phone?: string;
    email?: string;
    logoBase64?: string;
  };
  client: { name: string; address: string; phone: string; email: string };
  lines: DevisLine[];
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  notes: string;
  legalMentions: string;
  isInvoice?: boolean;
}

export function h(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function pdfTitle(devisNumber: string | null | undefined, clientName: string): string {
  const num = devisNumber ?? "DOCUMENT";
  const client = clientName.replace(/[^\w\u00C0-\u024F]/g, "_");
  return `${num}_${client}`;
}

export function buildDevisHtml(result: DevisResult): string {
  const isInvoice = result.isInvoice === true;
  const docLabel = isInvoice ? "FACTURE" : "DEVIS";

  const logoTag = result.artisan.logoBase64
    ? `<img src="${result.artisan.logoBase64}" alt="${h(result.artisan.name)}"
         style="max-height:80px;max-width:200px;object-fit:contain;display:block;margin-bottom:8px;">`
    : "";

  const linesRows = result.lines
    .map(
      (line, i) => `
      <tr style="background:${i % 2 === 0 ? "#f9fafb" : "#ffffff"}">
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#374151;">${h(line.description)}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#4b5563;text-align:right;">${line.quantity}</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;color:#4b5563;text-align:right;">${line.unitPrice.toFixed(2)} €</td>
        <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;font-weight:600;color:#111827;text-align:right;">${line.total.toFixed(2)} €</td>
      </tr>`
    )
    .join("");

  const notesBlock = result.notes
    ? `<div style="margin-bottom:32px;padding:16px;border:1px solid #e5e7eb;border-radius:8px;background:#f9fafb;">
         <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1e3a5f;margin:0 0 8px;">Notes</p>
         <p style="font-size:13px;color:#4b5563;line-height:1.65;margin:0;">${h(result.notes)}</p>
       </div>`
    : "";

  const dateSection = isInvoice
    ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">Date : ${h(result.date)}</p>`
    : `<p style="font-size:13px;color:#6b7280;margin:2px 0;">Émis le ${h(result.date)}</p>
       <p style="font-size:13px;color:#6b7280;margin:2px 0;">Valable jusqu'au ${h(result.validUntil)}</p>`;

  const signatureBlock = isInvoice
    ? ""
    : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:40px;padding-top:32px;border-top:1px solid #e5e7eb;">
        <div>
          <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Bon pour accord — Signature client</p>
          <div style="height:80px;border:1px dashed #d1d5db;border-radius:4px;"></div>
          <p style="font-size:10px;color:#9ca3af;margin:6px 0 0;">Date :</p>
        </div>
        <div>
          <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Cachet et signature prestataire</p>
          <div style="height:80px;border:1px dashed #d1d5db;border-radius:4px;"></div>
        </div>
      </div>`;

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${h(result.devisNumber)} — ${h(result.client.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #111827; background: #fff; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style>
</head>
<body>
<div style="max-width:860px;margin:0 auto;padding:48px 40px;background:#fff;">

  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <h1 style="font-size:32px;font-weight:900;color:#1e3a5f;margin:0 0 8px;">${docLabel}</h1>
      <p style="font-size:13px;color:#6b7280;margin:2px 0;">N°&nbsp;${h(result.devisNumber)}</p>
      ${dateSection}
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:40px;">
    <div>
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#f97316;margin:0 0 10px;">Prestataire</p>
      ${logoTag}
      <p style="font-weight:700;font-size:15px;margin:0 0 4px;">${h(result.artisan.name)}</p>
      <p style="font-size:13px;color:#6b7280;margin:2px 0;">SIRET : ${h(result.artisan.siret)}</p>
      ${result.artisan.address ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(result.artisan.address)}</p>` : ""}
      ${result.artisan.phone ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(result.artisan.phone)}</p>` : ""}
      ${result.artisan.email ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(result.artisan.email)}</p>` : ""}
    </div>
    <div>
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1.2px;color:#f97316;margin:0 0 10px;">Client</p>
      <p style="font-weight:700;font-size:15px;margin:0 0 4px;">${h(result.client.name)}</p>
      <p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(result.client.address)}</p>
      ${result.client.phone ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(result.client.phone)}</p>` : ""}
      ${result.client.email ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(result.client.email)}</p>` : ""}
    </div>
  </div>

  <div style="margin-bottom:32px;">
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#1e3a5f;color:#fff;">
          <th style="padding:12px 16px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;">Description</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;width:64px;">Qté</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;width:112px;">PU HT</th>
          <th style="padding:12px 16px;text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:0.8px;font-weight:700;width:112px;">Total HT</th>
        </tr>
      </thead>
      <tbody>${linesRows}</tbody>
    </table>
  </div>

  <div style="display:flex;justify-content:flex-end;margin-bottom:40px;">
    <div style="width:288px;">
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#6b7280;padding:4px 0;">
        <span>Sous-total HT</span><span>${result.subtotalHT.toFixed(2)} €</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:14px;color:#6b7280;padding:4px 0;">
        <span>TVA (${result.tvaRate}%)</span><span>${result.tvaAmount.toFixed(2)} €</span>
      </div>
      <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:#1e3a5f;padding-top:12px;margin-top:8px;border-top:2px solid #9ca3af;">
        <span>Total TTC</span><span>${result.totalTTC.toFixed(2)} €</span>
      </div>
    </div>
  </div>

  ${notesBlock}
  ${signatureBlock}
  ${result.legalMentions ? `<p style="margin-top:32px;font-size:11px;color:#9ca3af;line-height:1.6;border-top:1px solid #f3f4f6;padding-top:24px;">${h(result.legalMentions)}</p>` : ""}
  <p style="margin-top:16px;font-size:11px;color:#d1d5db;text-align:right;">Propulsé par DevisFlow</p>

</div>
</body>
</html>`;
}
