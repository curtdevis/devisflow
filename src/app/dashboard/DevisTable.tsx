"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────

interface DevisLine {
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
}

export interface DevisRow {
  id: string;
  created_at: string;
  devis_number: string | null;
  artisan_name: string | null;
  artisan_email: string | null;
  artisan_siret: string | null;
  client_name: string;
  client_email: string | null;
  total_ttc: number;
  profession: string | null;
  result_json: DevisResult | null;
}

// ── HTML generator (mirrors the /devis DevisPreview exactly) ─────────────────

function h(s: string | number | null | undefined): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function pdfTitle(devisNumber: string | null | undefined, clientName: string): string {
  const num = devisNumber ?? "DEVIS";
  const client = clientName.replace(/\s+/g, "_");
  return `Devis_${num}_${client}`;
}

function buildDevisHtml(result: DevisResult): string {
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
         <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#1e3a5f;margin:0 0 8px;"}>Notes</p>
         <p style="font-size:13px;color:#4b5563;line-height:1.65;margin:0;">${h(result.notes)}</p>
       </div>`
    : "";

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>${pdfTitle(result.devisNumber, result.client.name)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; font-family: Arial, sans-serif; color: #111827; background: #fff; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>
<div style="max-width:860px;margin:0 auto;padding:48px 40px;background:#fff;">

  <!-- Document header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <h1 style="font-size:32px;font-weight:900;color:#1e3a5f;margin:0 0 8px;">DEVIS</h1>
      <p style="font-size:13px;color:#6b7280;margin:2px 0;">N°&nbsp;${h(result.devisNumber)}</p>
      <p style="font-size:13px;color:#6b7280;margin:2px 0;">Émis le ${h(result.date)}</p>
      <p style="font-size:13px;color:#6b7280;margin:2px 0;">Valable jusqu'au ${h(result.validUntil)}</p>
    </div>
  </div>

  <!-- Parties -->
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

  <!-- Line items -->
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

  <!-- Totals -->
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

  <!-- Notes -->
  ${notesBlock}

  <!-- Signature blocks -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:40px;padding-top:32px;border-top:1px solid #e5e7eb;">
    <div>
      <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Bon pour accord — Signature client</p>
      <div style="height:80px;border:1px dashed #d1d5db;border-radius:4px;"></div>
      <p style="font-size:10px;color:#9ca3af;margin:6px 0 0;">Date :</p>
    </div>
    <div>
      <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Cachet et signature prestataire</p>
      <div style="height:80px;border:1px dashed #d1d5db;border-radius:4px;"></div>
    </div>
  </div>

  <!-- Legal mentions -->
  ${result.legalMentions ? `<p style="margin-top:32px;font-size:11px;color:#9ca3af;line-height:1.6;border-top:1px solid #f3f4f6;padding-top:24px;">${h(result.legalMentions)}</p>` : ""}

  <!-- Footer -->
  <p style="margin-top:16px;font-size:11px;color:#d1d5db;text-align:right;">Propulsé par DevisFlow</p>

</div>
</body>
</html>`;
}

// Fallback HTML when result_json is not available (old rows before migration)
function buildSummaryHtml(row: DevisRow): string {
  const date = new Date(row.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "long", year: "numeric",
  });
  return `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${pdfTitle(row.devis_number, row.client_name)}</title>
  <style>*{box-sizing:border-box;}body{margin:0;padding:0;font-family:Arial,sans-serif;background:#fff;color:#111;}</style>
  </head><body>
  <div style="max-width:860px;margin:0 auto;padding:48px 40px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
      <div><h1 style="font-size:32px;font-weight:900;color:#1e3a5f;margin:0 0 8px;">DEVIS</h1>
        <p style="font-size:13px;color:#6b7280;margin:2px 0;">N°&nbsp;${h(row.devis_number)}</p>
        <p style="font-size:13px;color:#6b7280;margin:2px 0;">Émis le ${h(date)}</p>
      </div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:40px;">
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#f97316;margin:0 0 10px;">Prestataire</p>
        <p style="font-weight:700;margin:0 0 4px;">${h(row.artisan_name)}</p>
        ${row.artisan_siret ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">SIRET : ${h(row.artisan_siret)}</p>` : ""}
        ${row.artisan_email ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(row.artisan_email)}</p>` : ""}
      </div>
      <div>
        <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#f97316;margin:0 0 10px;">Client</p>
        <p style="font-weight:700;margin:0 0 4px;">${h(row.client_name)}</p>
        ${row.client_email ? `<p style="font-size:13px;color:#6b7280;margin:2px 0;">${h(row.client_email)}</p>` : ""}
      </div>
    </div>
    ${row.profession ? `<div style="background:#f9fafb;border-radius:8px;padding:16px;margin-bottom:32px;"><p style="font-size:13px;color:#374151;">${h(row.profession)}</p></div>` : ""}
    <div style="display:flex;justify-content:flex-end;">
      <div style="width:288px;border-top:2px solid #1e3a5f;padding-top:12px;">
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:900;color:#1e3a5f;">
          <span>Total TTC</span><span>${row.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
        </div>
      </div>
    </div>
    <p style="margin-top:48px;font-size:11px;color:#d1d5db;text-align:right;">Propulsé par DevisFlow</p>
  </div></body></html>`;
}

function getHtml(row: DevisRow): string {
  return row.result_json ? buildDevisHtml(row.result_json) : buildSummaryHtml(row);
}

// ── Print via hidden iframe ───────────────────────────────────────────────────

function printRow(row: DevisRow) {
  const html = getHtml(row);
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
  iframe.src = url;
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 3000);
  };
  document.body.appendChild(iframe);
}

function printMultiple(rows: DevisRow[]) {
  // Concatenate all devis into one print job with page breaks
  const pages = rows
    .map((row, i) => {
      const inner = row.result_json
        ? `<div style="max-width:860px;margin:0 auto;padding:48px 40px;">${buildDevisHtml(row.result_json).replace(/^[\s\S]*?<body>/, "").replace(/<\/body>[\s\S]*$/, "").replace(/<div style="max-width:860px[^>]*>/, "").replace(/<\/div>\s*<\/body>[\s\S]*$/, "")}</div>`
        : buildSummaryHtml(row).replace(/^[\s\S]*?<body>/, "").replace(/<\/body>[\s\S]*$/, "");
      const pb = i < rows.length - 1 ? ' style="page-break-after:always;"' : "";
      return `<div${pb}>${inner}</div>`;
    })
    .join("\n");

  const bulkTitle = rows.length === 1
    ? pdfTitle(rows[0].devis_number, rows[0].client_name)
    : `Devis_selection_${rows.length}`;

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${bulkTitle}</title>
<style>*{box-sizing:border-box;}body{margin:0;padding:0;font-family:Arial,sans-serif;background:#fff;}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact;}}</style>
</head><body>${pages}</body></html>`;

  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
  iframe.src = url;
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
      URL.revokeObjectURL(url);
    }, 3000);
  };
  document.body.appendChild(iframe);
}

// ── Preview Modal ─────────────────────────────────────────────────────────────

function PreviewModal({
  row,
  onClose,
}: {
  row: DevisRow;
  onClose: () => void;
}) {
  const [blobUrl, setBlobUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const html = getHtml(row);
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [row]);

  function handlePrint() {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else {
      printRow(row);
    }
  }

  const label = row.result_json?.devisNumber ?? row.devis_number ?? "Devis";
  const date = new Date(row.created_at).toLocaleDateString("fr-FR");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
      onClick={onClose}
    >
      <div
        className="flex flex-col w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden bg-white"
        style={{ height: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0 border-b border-gray-100"
          style={{ backgroundColor: "var(--navy)" }}
        >
          <div>
            <p className="font-bold text-white">{label}</p>
            <p className="text-blue-200 text-xs mt-0.5">{row.client_name} · {date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 rounded-xl text-white border border-white/30 hover:bg-white/10 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
                <rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              className="text-white/60 hover:text-white text-2xl leading-none px-1 transition-colors"
            >
              ×
            </button>
          </div>
        </div>

        {/* Iframe fills remaining height */}
        <div className="flex-1 bg-gray-100 overflow-hidden">
          {blobUrl ? (
            <iframe
              ref={iframeRef}
              src={blobUrl}
              className="w-full h-full border-none bg-white"
              title={`Aperçu ${label}`}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400 text-sm">
              Chargement…
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Invoice conversion ────────────────────────────────────────────────────────

function ConvertInvoiceButton({ devisId }: { devisId: string }) {
  const [loading, setLoading] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);
  const [error, setError] = useState(false);

  async function convert() {
    setLoading(true);
    try {
      const res = await fetch("/api/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devisId }),
      });
      const data = await res.json();
      if (res.ok) setInvoiceNumber(data.invoiceNumber);
      else setError(true);
    } catch { setError(true); }
    finally { setLoading(false); }
  }

  if (invoiceNumber) {
    return (
      <a href="/dashboard/factures" className="flex items-center gap-1 text-xs font-bold px-2.5 py-1.5 rounded-lg text-purple-700 bg-purple-50 border border-purple-200 whitespace-nowrap hover:bg-purple-100 transition-colors">
        🧾 {invoiceNumber}
      </a>
    );
  }

  return (
    <button onClick={convert} disabled={loading}
      title="Convertir en facture"
      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${error ? "border-red-200 text-red-500" : "border-purple-200 text-purple-600 hover:bg-purple-50"} disabled:opacity-50`}>
      {loading ? "…" : error ? "Erreur" : "🧾 Facture"}
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

type SortKey = "date" | "amount" | "client";

export default function DevisTable({ devis }: { devis: DevisRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<DevisRow | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(false); }
  }

  const filtered = devis
    .filter((d) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        d.client_name.toLowerCase().includes(q) ||
        (d.client_email ?? "").toLowerCase().includes(q) ||
        (d.devis_number ?? "").toLowerCase().includes(q) ||
        (d.profession ?? "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortKey === "date") cmp = a.created_at.localeCompare(b.created_at);
      else if (sortKey === "amount") cmp = (a.total_ttc ?? 0) - (b.total_ttc ?? 0);
      else if (sortKey === "client") cmp = a.client_name.localeCompare(b.client_name);
      return sortAsc ? cmp : -cmp;
    });

  const allSelected = filtered.length > 0 && selected.size === filtered.length && filtered.every((d) => selected.has(d.id));
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map((d) => d.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedRows = filtered.filter((d) => selected.has(d.id));

  if (devis.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-4xl mb-3">📋</p>
        <p className="font-semibold">Aucun devis pour l&apos;instant</p>
        <p className="text-sm mt-1">Créez votre premier devis en moins de 30 secondes.</p>
        <Link
          href="/devis"
          className="inline-block mt-4 text-sm font-bold px-5 py-2 rounded-xl text-white"
          style={{ backgroundColor: "var(--orange)" }}
        >
          Créer un devis →
        </Link>
      </div>
    );
  }

  function SortIcon({ k }: { k: SortKey }) {
    if (sortKey !== k) return <span className="text-gray-300 ml-0.5">↕</span>;
    return <span className="ml-0.5" style={{ color: "var(--orange)" }}>{sortAsc ? "↑" : "↓"}</span>;
  }

  return (
    <>
      {/* ── Search bar ── */}
      <div className="px-6 py-3 border-b border-gray-100">
        <input
          type="search"
          placeholder="Rechercher par client, n° devis, travaux…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
        />
        {search && filtered.length === 0 && (
          <p className="mt-2 text-sm text-gray-400">Aucun résultat pour &quot;{search}&quot;</p>
        )}
      </div>

      {/* ── Action bar (visible when ≥1 selected) ── */}
      {someSelected && (
        <div
          className="flex items-center justify-between px-6 py-3 border-b border-gray-100"
          style={{ backgroundColor: "rgba(30,58,95,0.05)" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
            {selected.size} devis sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                selectedRows.length === 1
                  ? printRow(selectedRows[0])
                  : printMultiple(selectedRows)
              }
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl hover:opacity-90 transition-opacity"
              style={{ backgroundColor: "var(--navy)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger PDF{selected.size > 1 ? ` (${selected.size})` : ""}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-gray-600 px-2 transition-colors"
            >
              Désélectionner
            </button>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs text-gray-400 uppercase tracking-wide border-b border-gray-100">
              <th className="px-4 py-3 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded cursor-pointer accent-[#1e3a5f]"
                  title="Tout sélectionner"
                />
              </th>
              <th className="text-left px-3 py-3">N°</th>
              <th className="text-left px-3 py-3">
                <button onClick={() => toggleSort("date")} className="flex items-center hover:text-gray-600 transition-colors">
                  Date <SortIcon k="date" />
                </button>
              </th>
              <th className="text-left px-3 py-3">
                <button onClick={() => toggleSort("client")} className="flex items-center hover:text-gray-600 transition-colors">
                  Client <SortIcon k="client" />
                </button>
              </th>
              <th className="text-left px-3 py-3 hidden sm:table-cell">Travaux</th>
              <th className="text-right px-3 py-3">
                <button onClick={() => toggleSort("amount")} className="flex items-center ml-auto hover:text-gray-600 transition-colors">
                  Total TTC <SortIcon k="amount" />
                </button>
              </th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d, i) => {
              const isSelected = selected.has(d.id);
              return (
                <tr
                  key={d.id}
                  className={`border-b border-gray-50 transition-colors ${
                    isSelected
                      ? "bg-blue-50/70"
                      : i % 2 === 0
                      ? "hover:bg-gray-50"
                      : "bg-gray-50/40 hover:bg-gray-50"
                  }`}
                >
                  <td className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(d.id)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#1e3a5f]"
                    />
                  </td>
                  <td className="px-3 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                    {d.devis_number ?? `#${String(i + 1).padStart(3, "0")}`}
                  </td>
                  <td className="px-3 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-semibold" style={{ color: "var(--navy)" }}>
                      {d.client_name}
                    </p>
                    {d.client_email && (
                      <p className="text-xs text-gray-400">{d.client_email}</p>
                    )}
                  </td>
                  <td className="px-3 py-4 text-gray-500 hidden sm:table-cell max-w-[180px] truncate">
                    {d.profession ?? "—"}
                  </td>
                  <td className="px-3 py-4 text-right font-bold whitespace-nowrap" style={{ color: "var(--navy)" }}>
                    {d.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5 flex-wrap">
                      {/* Visualiser */}
                      <button
                        onClick={() => setPreview(d)}
                        title="Visualiser le devis"
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        style={{ color: "var(--navy)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        Voir
                      </button>
                      {/* Télécharger single */}
                      <button
                        onClick={() => printRow(d)}
                        title="Télécharger PDF"
                        className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-400 hover:text-gray-700 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="7 10 12 15 17 10"/>
                          <line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                      {/* Convert to invoice */}
                      <ConvertInvoiceButton devisId={d.id} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Preview modal ── */}
      {preview && (
        <PreviewModal row={preview} onClose={() => setPreview(null)} />
      )}
    </>
  );
}
