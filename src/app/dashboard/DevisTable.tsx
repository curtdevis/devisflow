"use client";

import { useState } from "react";
import Link from "next/link";

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
}

// ── HTML generator for print / PDF ──────────────────────────────────────────

function esc(s: string | null | undefined): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function devisPageHtml(d: DevisRow): string {
  const date = new Date(d.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
<div style="font-family:Arial,sans-serif;color:#111;max-width:780px;margin:0 auto;padding:56px 48px;">

  <!-- Letterhead -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:40px;">
    <div>
      <span style="font-size:26px;font-weight:900;color:#1e3a5f;">Devis</span><span style="font-size:26px;font-weight:900;color:#f97316;">Flow</span>
    </div>
    <div style="text-align:right;">
      <p style="font-size:22px;font-weight:900;color:#1e3a5f;margin:0;">DEVIS</p>
      <p style="color:#6b7280;font-size:13px;margin:4px 0 0;">N°&nbsp;${esc(d.devis_number)}</p>
      <p style="color:#6b7280;font-size:13px;margin:2px 0 0;">Émis le ${esc(date)}</p>
    </div>
  </div>

  <!-- Parties -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-bottom:32px;">
    <div>
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#f97316;letter-spacing:1.2px;margin:0 0 8px;">Prestataire</p>
      <p style="font-weight:700;margin:0 0 4px;">${esc(d.artisan_name)}</p>
      ${d.artisan_siret ? `<p style="color:#6b7280;font-size:13px;margin:2px 0;">SIRET : ${esc(d.artisan_siret)}</p>` : ""}
      ${d.artisan_email ? `<p style="color:#6b7280;font-size:13px;margin:2px 0;">${esc(d.artisan_email)}</p>` : ""}
    </div>
    <div>
      <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#f97316;letter-spacing:1.2px;margin:0 0 8px;">Client</p>
      <p style="font-weight:700;margin:0 0 4px;">${esc(d.client_name)}</p>
      ${d.client_email ? `<p style="color:#6b7280;font-size:13px;margin:2px 0;">${esc(d.client_email)}</p>` : ""}
    </div>
  </div>

  <!-- Divider -->
  <hr style="border:none;border-top:2px solid #1e3a5f;margin:0 0 28px;">

  <!-- Work description -->
  ${
    d.profession
      ? `<div style="background:#f9fafb;border-radius:8px;padding:16px 20px;margin-bottom:32px;">
           <p style="font-size:10px;font-weight:700;text-transform:uppercase;color:#1e3a5f;letter-spacing:1px;margin:0 0 8px;">Description des travaux</p>
           <p style="color:#374151;line-height:1.65;margin:0;">${esc(d.profession)}</p>
         </div>`
      : ""
  }

  <!-- Total -->
  <div style="display:flex;justify-content:flex-end;margin-top:40px;">
    <div style="width:300px;">
      <div style="border-top:2px solid #1e3a5f;padding-top:14px;display:flex;justify-content:space-between;align-items:baseline;">
        <span style="font-size:18px;font-weight:900;color:#1e3a5f;">Total TTC</span>
        <span style="font-size:22px;font-weight:900;color:#1e3a5f;">${d.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €</span>
      </div>
    </div>
  </div>

  <!-- Signature -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:32px;margin-top:56px;padding-top:28px;border-top:1px solid #e5e7eb;">
    <div>
      <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Bon pour accord — Signature client</p>
      <div style="height:72px;border:1px dashed #d1d5db;border-radius:4px;"></div>
      <p style="font-size:10px;color:#9ca3af;margin:6px 0 0;">Date :</p>
    </div>
    <div>
      <p style="font-size:10px;color:#9ca3af;text-transform:uppercase;letter-spacing:1px;margin:0 0 12px;">Cachet et signature prestataire</p>
      <div style="height:72px;border:1px dashed #d1d5db;border-radius:4px;"></div>
    </div>
  </div>

  <!-- Footer -->
  <p style="margin-top:40px;font-size:10px;color:#d1d5db;text-align:right;">
    Document généré par DevisFlow · devis-flow.fr
  </p>
</div>`;
}

function buildPrintDocument(items: DevisRow[]): string {
  const pages = items
    .map(
      (d, i) =>
        `<div${i < items.length - 1 ? ' style="page-break-after:always;"' : ""}>${devisPageHtml(d)}</div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<title>Devis</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; padding: 0; background: #fff; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>${pages}</body>
</html>`;
}

function printItems(items: DevisRow[]) {
  const html = buildPrintDocument(items);
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

// ── Preview Modal ────────────────────────────────────────────────────────────

function PreviewModal({
  devis,
  onClose,
  onPrint,
}: {
  devis: DevisRow;
  onClose: () => void;
  onPrint: () => void;
}) {
  const date = new Date(devis.created_at).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10"
        >
          <div>
            <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>
              {devis.devis_number ?? "Devis"}
            </p>
            <p className="text-xs text-gray-400">{date}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--navy)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>
              </svg>
              Imprimer / PDF
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl leading-none px-2"
            >
              ×
            </button>
          </div>
        </div>

        {/* Modal body */}
        <div className="p-8">
          {/* Parties */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--orange)" }}>
                Prestataire
              </p>
              <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>
                {devis.artisan_name ?? "—"}
              </p>
              {devis.artisan_siret && (
                <p className="text-xs text-gray-400 mt-0.5">SIRET : {devis.artisan_siret}</p>
              )}
              {devis.artisan_email && (
                <p className="text-xs text-gray-400 mt-0.5">{devis.artisan_email}</p>
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--orange)" }}>
                Client
              </p>
              <p className="font-bold text-sm" style={{ color: "var(--navy)" }}>
                {devis.client_name}
              </p>
              {devis.client_email && (
                <p className="text-xs text-gray-400 mt-0.5">{devis.client_email}</p>
              )}
            </div>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Description */}
          {devis.profession && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "var(--navy)" }}>
                Description des travaux
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">{devis.profession}</p>
            </div>
          )}

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-64 border-t-2 pt-3" style={{ borderColor: "var(--navy)" }}>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-base" style={{ color: "var(--navy)" }}>
                  Total TTC
                </span>
                <span className="text-xl font-extrabold" style={{ color: "var(--navy)" }}>
                  {devis.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                </span>
              </div>
            </div>
          </div>

          {/* Note about summary */}
          <p className="mt-6 text-xs text-gray-400 text-center">
            Aperçu résumé · Pour le détail complet des lignes,{" "}
            <Link href="/devis" className="underline hover:text-gray-600">
              régénérez le devis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function DevisTable({ devis }: { devis: DevisRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [preview, setPreview] = useState<DevisRow | null>(null);

  const allSelected = devis.length > 0 && selected.size === devis.length;
  const someSelected = selected.size > 0;

  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(devis.map((d) => d.id)));
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const selectedRows = devis.filter((d) => selected.has(d.id));

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

  return (
    <>
      {/* ── Action bar ── */}
      {someSelected && (
        <div
          className="flex items-center justify-between px-6 py-3 border-b"
          style={{ backgroundColor: "rgba(30,58,95,0.04)", borderColor: "#e5e7eb" }}
        >
          <span className="text-sm font-semibold" style={{ color: "var(--navy)" }}>
            {selected.size} devis sélectionné{selected.size > 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => printItems(selectedRows)}
              className="flex items-center gap-1.5 text-sm font-semibold text-white px-4 py-2 rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: "var(--navy)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Télécharger PDF{selected.size > 1 ? ` (${selected.size})` : ""}
            </button>
            <button
              onClick={() => setSelected(new Set())}
              className="text-sm text-gray-400 hover:text-gray-600 px-2 py-2 transition-colors"
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
              <th className="text-left px-3 py-3">Date</th>
              <th className="text-left px-3 py-3">Client</th>
              <th className="text-left px-3 py-3 hidden sm:table-cell">Travaux</th>
              <th className="text-right px-3 py-3">Total TTC</th>
              <th className="text-right px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {devis.map((d, i) => {
              const isSelected = selected.has(d.id);
              return (
                <tr
                  key={d.id}
                  className={`border-b border-gray-50 transition-colors ${
                    isSelected
                      ? "bg-blue-50/60"
                      : i % 2 === 0
                      ? "hover:bg-gray-50"
                      : "bg-gray-50/40 hover:bg-gray-50"
                  }`}
                >
                  {/* Checkbox */}
                  <td className="px-4 py-4 w-10">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleOne(d.id)}
                      className="w-4 h-4 rounded cursor-pointer accent-[#1e3a5f]"
                    />
                  </td>

                  {/* Devis number */}
                  <td className="px-3 py-4 font-mono text-xs text-gray-400 whitespace-nowrap">
                    {d.devis_number ?? `#${String(i + 1).padStart(3, "0")}`}
                  </td>

                  {/* Date */}
                  <td className="px-3 py-4 text-gray-600 whitespace-nowrap">
                    {new Date(d.created_at).toLocaleDateString("fr-FR")}
                  </td>

                  {/* Client */}
                  <td className="px-3 py-4">
                    <p className="font-semibold" style={{ color: "var(--navy)" }}>
                      {d.client_name}
                    </p>
                    {d.client_email && (
                      <p className="text-xs text-gray-400">{d.client_email}</p>
                    )}
                  </td>

                  {/* Travaux */}
                  <td className="px-3 py-4 text-gray-500 hidden sm:table-cell max-w-[200px] truncate">
                    {d.profession ?? "—"}
                  </td>

                  {/* Total */}
                  <td className="px-3 py-4 text-right font-bold whitespace-nowrap" style={{ color: "var(--navy)" }}>
                    {d.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Visualiser */}
                      <button
                        onClick={() => setPreview(d)}
                        title="Visualiser"
                        className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors hover:bg-gray-50"
                        style={{ borderColor: "#e5e7eb", color: "var(--navy)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                        </svg>
                        Voir
                      </button>

                      {/* Télécharger (single) */}
                      <button
                        onClick={() => printItems([d])}
                        title="Télécharger PDF"
                        className="p-1.5 rounded-lg border transition-colors hover:bg-gray-50 text-gray-400 hover:text-gray-700"
                        style={{ borderColor: "#e5e7eb" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Preview Modal ── */}
      {preview && (
        <PreviewModal
          devis={preview}
          onClose={() => setPreview(null)}
          onPrint={() => printItems([preview])}
        />
      )}
    </>
  );
}
