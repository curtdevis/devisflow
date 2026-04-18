"use client";

import { useState, useEffect, useRef } from "react";
import { buildDevisHtml, type DevisResult } from "@/lib/devis-html";

interface Props {
  invoiceId: string;
  invoiceNumber: string;
  clientName: string;
  status: string;
  result: DevisResult | null;
}

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string; border: string }> = {
  pending: { label: "En attente", color: "#b45309", bg: "#fef3c7", border: "#fcd34d" },
  paid:    { label: "Payée",      color: "#065f46", bg: "#d1fae5", border: "#6ee7b7" },
  overdue: { label: "En retard",  color: "#991b1b", bg: "#fee2e2", border: "#fca5a5" },
};

export default function FactureActions({ invoiceId, invoiceNumber, clientName, status: initialStatus, result }: Props) {
  const [status, setStatus] = useState(initialStatus);
  const [markingPaid, setMarkingPaid] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [blobUrl, setBlobUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const st = STATUS_LABELS[status] ?? STATUS_LABELS.pending;

  useEffect(() => {
    if (!showModal || !result) return;
    const html = buildDevisHtml({ ...result, isInvoice: true });
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    setBlobUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [showModal, result]);

  async function handleMarkPaid() {
    if (status === "paid") return;
    setMarkingPaid(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paid" }),
      });
      if (res.ok) setStatus("paid");
    } finally {
      setMarkingPaid(false);
    }
  }

  function handlePrint() {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.focus();
      iframeRef.current.contentWindow.print();
    } else if (result) {
      const html = buildDevisHtml({ ...result, isInvoice: true });
      const blob = new Blob([html], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const iframe = document.createElement("iframe");
      iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;";
      iframe.src = url;
      iframe.onload = () => {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        setTimeout(() => { document.body.removeChild(iframe); URL.revokeObjectURL(url); }, 3000);
      };
      document.body.appendChild(iframe);
    }
  }

  return (
    <>
      <td className="px-3 py-4 text-center">
        <span
          className="inline-block text-xs font-bold px-3 py-1 rounded-full border"
          style={{ color: st.color, backgroundColor: st.bg, borderColor: st.border }}
        >
          {st.label}
        </span>
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-1.5 flex-wrap">
          {/* Voir PDF */}
          {result && (
            <button
              onClick={() => setShowModal(true)}
              title="Voir la facture"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: "var(--navy)" }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              Voir
            </button>
          )}

          {/* Marquer comme payée */}
          {status !== "paid" && (
            <button
              onClick={handleMarkPaid}
              disabled={markingPaid}
              title="Marquer comme payée"
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors disabled:opacity-50"
            >
              {markingPaid ? "…" : "✓ Payée"}
            </button>
          )}
        </div>
      </td>

      {/* Preview modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.65)" }}
          onClick={() => setShowModal(false)}
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
                <p className="font-bold text-white">Facture {invoiceNumber}</p>
                <p className="text-blue-200 text-xs mt-0.5">{clientName}</p>
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
                  onClick={() => setShowModal(false)}
                  className="text-white/60 hover:text-white text-2xl leading-none px-1 transition-colors"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Iframe */}
            <div className="flex-1 bg-gray-100 overflow-hidden">
              {blobUrl ? (
                <iframe
                  ref={iframeRef}
                  src={blobUrl}
                  className="w-full h-full border-none bg-white"
                  title={`Facture ${invoiceNumber}`}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                  Chargement…
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
