"use client";

import { useState } from "react";
import Link from "next/link";
import { SignaturePad } from "./SignaturePad";

export interface DevisResult {
  id?: string | null;          // DB row id — returned by /api/generate-devis, used for invoice conversion
  devisNumber: string;
  date: string;
  validUntil: string;
  artisan: { name: string; siret: string; address?: string; phone?: string; email?: string; logoBase64?: string };
  client: { name: string; address: string; phone: string; email: string };
  lines: { description: string; quantity: number; unitPrice: number; total: number }[];
  subtotalHT: number;
  tvaRate: number;
  tvaAmount: number;
  totalTTC: number;
  notes: string;
  legalMentions: string;
}

export function DevisPreview({ result, onReset }: { result: DevisResult; onReset: () => void }) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [modalEmail, setModalEmail] = useState(result.client.email ?? "");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [signatureData, setSignatureData] = useState<string | null>(null);
  const [signedAt, setSignedAt] = useState<string | null>(null);
  const [showSignature, setShowSignature] = useState(false);
  const [convertingInvoice, setConvertingInvoice] = useState(false);
  const [invoiceNumber, setInvoiceNumber] = useState<string | null>(null);

  async function sendEmail() {
    if (!modalEmail) return;
    setEmailSending(true); setEmailError("");
    try {
      const res = await fetch("/api/send-devis", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipientEmail: modalEmail, devis: result }),
      });
      if (!res.ok) { const d = await res.json().catch(() => ({})); throw new Error(d.error ?? "Erreur envoi."); }
      setEmailSent(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Erreur inconnue.");
    } finally { setEmailSending(false); }
  }

  function openWhatsApp() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(`Bonjour ${result.client.name}, voici votre devis DevisFlow : ${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  function handleSign(dataUrl: string) {
    setSignatureData(dataUrl);
    setSignedAt(new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }));
    setShowSignature(false);
  }

  async function convertToInvoice() {
    if (!result.id) {
      setInvoiceNumber("ERR_NO_ID");
      return;
    }
    setConvertingInvoice(true);
    try {
      const res = await fetch("/api/create-invoice", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ devisId: result.id }),
      });
      const data = await res.json();
      if (res.ok) setInvoiceNumber(data.invoiceNumber);
    } catch { /* ignore */ } finally { setConvertingInvoice(false); }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Email modal */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            {emailSent ? (
              <div className="text-center">
                <div className="text-4xl mb-3">✅</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: "var(--navy)" }}>Email envoyé !</h3>
                <p className="text-gray-500 text-sm mb-6">Devis envoyé à <strong>{modalEmail}</strong>.</p>
                <button onClick={() => { setShowEmailModal(false); setEmailSent(false); }}
                  className="font-semibold px-6 py-2 rounded-xl text-white" style={{ backgroundColor: "var(--navy)" }}>Fermer</button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-1" style={{ color: "var(--navy)" }}>Envoyer le devis par email</h3>
                <p className="text-sm text-gray-400 mb-5">Le devis complet sera envoyé en HTML professionnel.</p>
                <input type="email" autoFocus value={modalEmail} onChange={e => setModalEmail(e.target.value)}
                  placeholder="client@email.com"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent mb-4"
                  onKeyDown={e => e.key === "Enter" && sendEmail()} />
                {emailError && <p className="text-red-500 text-sm mb-4">{emailError}</p>}
                <div className="flex gap-3">
                  <button onClick={() => setShowEmailModal(false)}
                    className="flex-1 py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Annuler</button>
                  <button onClick={sendEmail} disabled={emailSending || !modalEmail}
                    className="flex-1 py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-60" style={{ backgroundColor: "var(--orange)" }}>
                    {emailSending ? "Envoi…" : "Envoyer →"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Header chrome */}
      <header className="print-hidden sticky top-0 z-40 border-b border-white/10" style={{ backgroundColor: "var(--navy)" }}>
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-3 flex-wrap">
          <Link href="/" className="text-xl font-bold text-white shrink-0">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
          <div className="flex gap-2 items-center flex-wrap">
            <button onClick={onReset} className="text-sm text-blue-200 hover:text-white transition-colors">← Nouveau</button>
            <button onClick={() => window.print()}
              className="text-sm font-semibold text-white px-3 py-2 rounded-lg" style={{ backgroundColor: "var(--orange)" }}>
              🖨️ <span className="hidden sm:inline">PDF</span>
            </button>
            <button onClick={() => { setShowEmailModal(true); setEmailSent(false); setEmailError(""); }}
              className="text-sm font-semibold px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
              ✉️ <span className="hidden sm:inline">Email</span>
            </button>
            <button onClick={openWhatsApp}
              className="text-sm font-semibold px-3 py-2 rounded-lg text-white" style={{ backgroundColor: "#25d366" }}>
              💬 <span className="hidden sm:inline">WhatsApp</span>
            </button>
            {!signatureData && (
              <button onClick={() => setShowSignature(s => !s)}
                className="text-sm font-semibold px-3 py-2 rounded-lg border border-white/30 text-white hover:bg-white/10 transition-colors">
                ✍️ <span className="hidden sm:inline">Signer</span>
              </button>
            )}
            {!invoiceNumber && result.id && (
              <button onClick={convertToInvoice} disabled={convertingInvoice}
                className="text-sm font-semibold px-3 py-2 rounded-lg text-white disabled:opacity-60" style={{ backgroundColor: "#7c3aed" }}>
                {convertingInvoice ? "…" : "🧾 Facture"}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Invoice conversion banner */}
      {invoiceNumber && (
        <div className="print-hidden px-4 py-3 text-sm font-semibold text-white text-center" style={{ backgroundColor: "#7c3aed" }}>
          ✓ Facture créée : <strong>{invoiceNumber}</strong> — <Link href="/dashboard/factures" className="underline">Voir mes factures →</Link>
        </div>
      )}

      {/* Signature pad */}
      {showSignature && !signatureData && (
        <div className="print-hidden max-w-4xl mx-auto px-4 mt-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="font-bold mb-1" style={{ color: "var(--navy)" }}>Signature client</h3>
            <p className="text-sm text-gray-400 mb-4">Le client signe ci-dessous (souris ou doigt sur mobile)</p>
            <SignaturePad onSign={handleSign} />
          </div>
        </div>
      )}

      <main className="max-w-4xl mx-auto px-4 py-10 print:p-0 print:max-w-none">
        {/* Success banner */}
        <div className="print-hidden flex items-center justify-between gap-3 rounded-xl px-5 py-4 mb-8 text-white" style={{ backgroundColor: "var(--navy)" }}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold">Devis généré et sauvegardé !</p>
              <p className="text-blue-200 text-sm">Imprimez ou envoyez, puis retrouvez-le dans votre dashboard.</p>
            </div>
          </div>
          <Link href="/dashboard" className="shrink-0 text-sm font-semibold px-4 py-2 rounded-lg border border-white/30 hover:bg-white/10 transition-colors whitespace-nowrap">
            Dashboard →
          </Link>
        </div>

        {/* Devis document */}
        <div className="devis-document bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12">
          {/* Header */}
          <div className="flex justify-between items-start mb-10">
            <div>
              <h1 className="text-3xl font-extrabold mb-1" style={{ color: "var(--navy)" }}>DEVIS</h1>
              <p className="text-sm text-gray-500">N°&nbsp;{result.devisNumber}</p>
              <p className="text-sm text-gray-500">Émis le {result.date}</p>
              <p className="text-sm text-gray-500">Valable jusqu&apos;au {result.validUntil}</p>
            </div>
            {result.artisan.logoBase64 && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={result.artisan.logoBase64} alt={result.artisan.name} style={{ maxHeight: 80, maxWidth: 200 }} className="object-contain" />
            )}
          </div>

          {/* Parties */}
          <div className="grid sm:grid-cols-2 gap-8 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Prestataire</p>
              <p className="font-bold text-gray-900">{result.artisan.name}</p>
              <p className="text-sm text-gray-500">SIRET : {result.artisan.siret}</p>
              {result.artisan.address && <p className="text-sm text-gray-500">{result.artisan.address}</p>}
              {result.artisan.phone && <p className="text-sm text-gray-500">{result.artisan.phone}</p>}
              {result.artisan.email && <p className="text-sm text-gray-500">{result.artisan.email}</p>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "var(--orange)" }}>Client</p>
              <p className="font-bold text-gray-900">{result.client.name}</p>
              <p className="text-sm text-gray-500">{result.client.address}</p>
              {result.client.phone && <p className="text-sm text-gray-500">{result.client.phone}</p>}
              {result.client.email && <p className="text-sm text-gray-500">{result.client.email}</p>}
            </div>
          </div>

          {/* Line items */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr style={{ backgroundColor: "var(--navy)", color: "white" }}>
                  <th className="text-left px-4 py-3 text-xs uppercase tracking-wide font-bold">Description</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide font-bold w-16">Qté</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide font-bold w-28">PU HT</th>
                  <th className="px-4 py-3 text-right text-xs uppercase tracking-wide font-bold w-28">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {result.lines.map((line, i) => (
                  <tr key={i} style={{ backgroundColor: i % 2 === 0 ? "#f9fafb" : "white" }}>
                    <td className="px-4 py-3 text-gray-700 border-b border-gray-100">{line.description}</td>
                    <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{line.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-600 border-b border-gray-100">{line.unitPrice.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900 border-b border-gray-100">{line.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="flex justify-between text-sm text-gray-500 py-1">
                <span>Sous-total HT</span><span>{result.subtotalHT.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 py-1">
                <span>TVA ({result.tvaRate}%)</span><span>{result.tvaAmount.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-lg font-extrabold pt-3 mt-2 border-t-2 border-gray-300" style={{ color: "var(--navy)" }}>
                <span>Total TTC</span><span>{result.totalTTC.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {result.notes && (
            <div className="mb-8 p-4 border border-gray-200 rounded-xl bg-gray-50">
              <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: "var(--navy)" }}>Notes</p>
              <p className="text-sm text-gray-600 leading-relaxed">{result.notes}</p>
            </div>
          )}

          {/* Signature blocks */}
          <div className="grid sm:grid-cols-2 gap-8 mt-10 pt-8 border-t border-gray-200">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Bon pour accord — Signature client</p>
              {signatureData ? (
                <div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={signatureData} alt="Signature client" className="max-h-20 border border-gray-100 rounded" />
                  <p className="text-xs text-gray-400 mt-2">Signé le {signedAt}</p>
                </div>
              ) : (
                <div>
                  <div className="h-20 border border-dashed border-gray-300 rounded-lg" />
                  <p className="text-xs text-gray-400 mt-2">Date :</p>
                </div>
              )}
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-3">Cachet et signature prestataire</p>
              <div className="h-20 border border-dashed border-gray-300 rounded-lg" />
            </div>
          </div>

          {/* Legal */}
          {result.legalMentions && (
            <p className="mt-8 text-xs text-gray-400 leading-relaxed border-t border-gray-100 pt-6">{result.legalMentions}</p>
          )}
          <p className="mt-4 text-xs text-gray-300 text-right">Propulsé par DevisFlow</p>
        </div>
      </main>
    </div>
  );
}
