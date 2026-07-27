"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { buildDevisHtml, buildSummaryHtml, getHtml, h, pdfTitle, type DevisRow } from "@/lib/devis-html";

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

  const html = `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>${h(bulkTitle)}</title>
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
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const blobUrl = useMemo(() => {
    const html = getHtml(row);
    const blob = new Blob([html], { type: "text/html" });
    return URL.createObjectURL(blob);
  }, [row]);

  useEffect(() => {
    return () => URL.revokeObjectURL(blobUrl);
  }, [blobUrl]);

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
          <iframe
            ref={iframeRef}
            src={blobUrl}
            className="w-full h-full border-none bg-white"
            title={`Aperçu ${label}`}
          />
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

function SortIcon({ k, sortKey, sortAsc }: { k: SortKey; sortKey: SortKey; sortAsc: boolean }) {
  if (sortKey !== k) return <span className="text-gray-300 ml-0.5">↕</span>;
  return <span className="ml-0.5" style={{ color: "var(--orange)" }}>{sortAsc ? "↑" : "↓"}</span>;
}

function CopyLinkButton({ devisId }: { devisId: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    const url = `${window.location.origin}/sign/${devisId}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      onClick={copy}
      title="Copier le lien de signature"
      className={`flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors whitespace-nowrap ${copied ? "border-green-200 text-green-600 bg-green-50" : "border-gray-200 text-gray-500 hover:bg-gray-50"}`}
    >
      {copied ? "✓ Copié" : "🔗 Lien"}
    </button>
  );
}

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
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedRows = filtered.filter((d) => selected.has(d.id));

  if (devis.length === 0) {
    return (
      <div className="px-6 py-12">
        <div className="max-w-xl mx-auto text-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4" style={{ backgroundColor: "rgba(30,58,95,0.07)" }}>📋</div>
          <h3 className="text-xl font-extrabold mb-2" style={{ color: "var(--navy)" }}>Bienvenue sur DevisFlow !</h3>
          <p className="text-gray-500 text-sm">Créez votre premier devis professionnel en moins de 30 secondes.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-5 mb-8 max-w-2xl mx-auto">
          {[
            { step: "1", icon: "⚡", title: "Décrivez la mission", desc: "Sélectionnez votre métier et décrivez les travaux en langage naturel." },
            { step: "2", icon: "🤖", title: "L'IA génère le devis", desc: "Lignes de prestation, calculs TVA, mentions légales — en 30 secondes." },
            { step: "3", icon: "✉️", title: "Envoyez et signez", desc: "Par email ou WhatsApp. Le client signe en ligne depuis son téléphone." },
          ].map(s => (
            <div key={s.step} className="bg-gray-50 rounded-2xl p-5 text-center border border-gray-100">
              <div className="text-2xl mb-2">{s.icon}</div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "var(--orange)" }}>Étape {s.step}</p>
              <p className="font-bold text-sm mb-1" style={{ color: "var(--navy)" }}>{s.title}</p>
              <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/devis"
            className="inline-flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-xl shadow-sm transition-transform hover:scale-105 text-sm"
            style={{ backgroundColor: "var(--orange)" }}
          >
            Créer mon premier devis →
          </Link>
          <p className="mt-3 text-xs text-gray-400">Sans carte bancaire pendant l&apos;essai · Résultat en 30 secondes</p>
        </div>
      </div>
    );
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
        <table className="w-full text-sm min-w-[600px]">
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
                  Date <SortIcon k="date" sortKey={sortKey} sortAsc={sortAsc} />
                </button>
              </th>
              <th className="text-left px-3 py-3">
                <button onClick={() => toggleSort("client")} className="flex items-center hover:text-gray-600 transition-colors">
                  Client <SortIcon k="client" sortKey={sortKey} sortAsc={sortAsc} />
                </button>
              </th>
              <th className="text-left px-3 py-3 hidden sm:table-cell">Travaux</th>
              <th className="text-left px-3 py-3 hidden md:table-cell">Statut</th>
              <th className="text-right px-3 py-3">
                <button onClick={() => toggleSort("amount")} className="flex items-center ml-auto hover:text-gray-600 transition-colors">
                  Total TTC <SortIcon k="amount" sortKey={sortKey} sortAsc={sortAsc} />
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
                  <td className="px-3 py-4 hidden md:table-cell">
                    {d.signed_at ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
                        ✓ Signé
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-500">
                        En attente
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-4 text-right font-bold whitespace-nowrap" style={{ color: "var(--navy)" }}>
                    {d.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5 flex-nowrap">
                      {/* Visualiser */}
                      <button
                        onClick={() => setPreview(d)}
                        title="Visualiser le devis"
                        className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors whitespace-nowrap"
                        style={{ color: "var(--navy)" }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                          <circle cx="12" cy="12" r="3"/>
                        </svg>
                        <span className="hidden sm:inline">Voir</span>
                      </button>
                      {/* Télécharger single — icon only on mobile */}
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
                      {/* Sign link — only for unsigned devis */}
                      {!d.signed_at && <CopyLinkButton devisId={d.id} />}
                      {/* Convert to invoice — only for signed devis */}
                      {d.signed_at && <ConvertInvoiceButton devisId={d.id} />}
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
