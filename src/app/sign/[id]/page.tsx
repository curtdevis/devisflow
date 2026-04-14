"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { use } from "react";

interface DevisLine {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface DevisData {
  id: string;
  devis_number: string | null;
  artisan_name: string;
  client_name: string;
  total_ttc: number;
  status: string | null;
  signature_data: string | null;
  signed_at: string | null;
  result_json: {
    date: string;
    validUntil: string;
    lines: DevisLine[];
    subtotalHT: number;
    tvaRate: number;
    tvaAmount: number;
    totalTTC: number;
    notes: string;
    artisan: { name: string; siret: string; address?: string; phone?: string; email?: string };
    client: { name: string; address: string; phone: string; email: string };
  } | null;
}

export default function SignPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [devis, setDevis] = useState<DevisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");

  // Signature pad
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasStrokes, setHasStrokes] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    fetch(`/api/devis/${id}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setDevis(data); setLoading(false); if (data.status === "signed") setSigned(true); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  function getPos(e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e, canvas);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    const canvas = canvasRef.current; if (!canvas) return;
    e.preventDefault();
    const ctx = canvas.getContext("2d"); if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current!.x, lastPos.current!.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1e3a5f";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.stroke();
    lastPos.current = pos;
    setHasStrokes(true);
  }

  function endDraw() { setIsDrawing(false); lastPos.current = null; }

  function clearPad() {
    const canvas = canvasRef.current; if (!canvas) return;
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  }

  async function confirmSign() {
    const canvas = canvasRef.current; if (!canvas || !hasStrokes) return;
    setSigning(true); setSignError("");
    try {
      const dataUrl = canvas.toDataURL("image/png");
      const res = await fetch(`/api/devis/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature_data: dataUrl, signed_at: new Date().toISOString(), status: "signed" }),
      });
      if (!res.ok) throw new Error("Erreur serveur");
      setSigned(true);
    } catch {
      setSignError("Une erreur est survenue. Veuillez réessayer.");
    } finally { setSigning(false); }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#f9fafb" }}>
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Chargement du devis…</p>
        </div>
      </div>
    );
  }

  if (notFound || !devis) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: "#f9fafb" }}>
        <div className="text-center max-w-sm">
          <p className="text-5xl mb-4">🔍</p>
          <h1 className="text-xl font-bold mb-2" style={{ color: "#1e3a5f" }}>Devis introuvable</h1>
          <p className="text-gray-500 text-sm">Ce lien est invalide ou a expiré.</p>
          <Link href="/" className="inline-block mt-6 text-sm font-bold text-white px-5 py-2.5 rounded-xl" style={{ backgroundColor: "#f97316" }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    );
  }

  const r = devis.result_json;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header style={{ backgroundColor: "#1e3a5f" }}>
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-extrabold text-white">
            Devis<span style={{ color: "#f97316" }}>Flow</span>
          </Link>
          <span className="text-blue-300 text-xs">Signature sécurisée</span>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Devis summary */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#f97316" }}>Devis</p>
              <h1 className="text-xl font-extrabold" style={{ color: "#1e3a5f" }}>N° {devis.devis_number ?? "—"}</h1>
              {r && <p className="text-sm text-gray-400 mt-0.5">Émis le {r.date} · Valable jusqu'au {r.validUntil}</p>}
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">Total TTC</p>
              <p className="text-2xl font-extrabold" style={{ color: "#1e3a5f" }}>
                {devis.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-gray-100">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>Prestataire</p>
              <p className="font-semibold text-sm" style={{ color: "#1e3a5f" }}>{r?.artisan.name ?? devis.artisan_name}</p>
              {r?.artisan.siret && <p className="text-xs text-gray-400">SIRET : {r.artisan.siret}</p>}
              {r?.artisan.phone && <p className="text-xs text-gray-400">{r.artisan.phone}</p>}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#f97316" }}>Client</p>
              <p className="font-semibold text-sm" style={{ color: "#1e3a5f" }}>{r?.client.name ?? devis.client_name}</p>
              {r?.client.address && <p className="text-xs text-gray-400">{r.client.address}</p>}
            </div>
          </div>
        </div>

        {/* Lines */}
        {r?.lines && r.lines.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-bold uppercase tracking-wide text-white" style={{ backgroundColor: "#1e3a5f" }}>
                  <th className="text-left px-4 py-3">Description</th>
                  <th className="text-right px-3 py-3 hidden sm:table-cell">Qté</th>
                  <th className="text-right px-3 py-3 hidden sm:table-cell">PU HT</th>
                  <th className="text-right px-4 py-3">Total HT</th>
                </tr>
              </thead>
              <tbody>
                {r.lines.map((line, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-3 text-gray-700">{line.description}</td>
                    <td className="px-3 py-3 text-right text-gray-500 hidden sm:table-cell">{line.quantity}</td>
                    <td className="px-3 py-3 text-right text-gray-500 hidden sm:table-cell">{line.unitPrice.toFixed(2)} €</td>
                    <td className="px-4 py-3 text-right font-semibold" style={{ color: "#1e3a5f" }}>{line.total.toFixed(2)} €</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-4 flex justify-end border-t border-gray-100">
              <div className="w-64 space-y-1 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Sous-total HT</span><span>{r.subtotalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>TVA ({r.tvaRate}%)</span><span>{r.tvaAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-extrabold text-base pt-2 border-t border-gray-200" style={{ color: "#1e3a5f" }}>
                  <span>Total TTC</span><span>{r.totalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {r?.notes && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#1e3a5f" }}>Notes</p>
            <p className="text-sm text-gray-600 leading-relaxed">{r.notes}</p>
          </div>
        )}

        {/* Signature block */}
        <div className="bg-white rounded-2xl border-2 shadow-sm p-6" style={{ borderColor: signed ? "#10b981" : "#f97316" }}>
          {signed ? (
            <div className="text-center py-4">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-xl font-extrabold mb-1" style={{ color: "#065f46" }}>Devis signé !</h2>
              <p className="text-gray-500 text-sm">
                Votre accord a été enregistré le {devis.signed_at ? new Date(devis.signed_at).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" }) : "aujourd'hui"}.
              </p>
              {devis.signature_data?.startsWith("data:image/png;base64,") && (
                <div className="mt-4 inline-block border border-gray-200 rounded-xl overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={devis.signature_data} alt="Signature" className="max-h-20" />
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 className="text-lg font-extrabold mb-1" style={{ color: "#1e3a5f" }}>Signer ce devis</h2>
              <p className="text-sm text-gray-500 mb-5">
                En signant, vous acceptez le devis N° {devis.devis_number} pour un montant de{" "}
                <strong>{devis.total_ttc.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} € TTC</strong> — bon pour accord.
              </p>

              <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden mb-4" style={{ touchAction: "none" }}>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  className="w-full cursor-crosshair bg-white"
                  onMouseDown={startDraw} onMouseMove={draw} onMouseUp={endDraw} onMouseLeave={endDraw}
                  onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={endDraw}
                />
                <div className="flex items-center gap-2 px-3 py-2 border-t border-gray-100 bg-gray-50">
                  <p className="text-xs text-gray-400 flex-1">Signez dans le cadre ci-dessus</p>
                  <button type="button" onClick={clearPad} className="text-xs text-gray-400 hover:text-gray-700 transition-colors">
                    Effacer
                  </button>
                </div>
              </div>

              {signError && <p className="text-red-500 text-sm mb-4">{signError}</p>}

              <button
                type="button"
                onClick={confirmSign}
                disabled={!hasStrokes || signing}
                className="w-full py-4 rounded-xl text-white font-extrabold text-base shadow-md transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95"
                style={{ backgroundColor: "#f97316" }}
              >
                {signing ? "Enregistrement…" : "✍️ Valider ma signature — Bon pour accord"}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 pb-6">
          Propulsé par <Link href="/" className="font-semibold" style={{ color: "#1e3a5f" }}>DevisFlow</Link>
        </p>
      </main>
    </div>
  );
}
