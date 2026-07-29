"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { use } from "react";
import { getHtml, type DevisResult } from "@/lib/devis-html";
import { printHtmlDocument } from "@/lib/print-html";

interface DevisData {
  id: string;
  devis_number: string | null;
  artisan_name: string;
  client_name: string;
  total_ttc: number;
  signed_at: string | null;
  result_json: DevisResult | null;
}

/**
 * Dedicated, near-blank download target linked directly from the "Télécharger
 * le devis (PDF)" button in send-devis emails. Triggers the print/save dialog
 * immediately on load instead of showing the full devis page first — clicking
 * the email button should feel like a direct download, not a site visit.
 */
export default function TelechargerDevisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");

  useEffect(() => {
    fetch(`/api/devis/${id}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((devis: DevisData) => {
        printHtmlDocument(
          getHtml({
            id: devis.id,
            created_at: devis.result_json?.date ?? "",
            devis_number: devis.devis_number,
            artisan_name: devis.artisan_name,
            artisan_email: devis.result_json?.artisan.email ?? null,
            artisan_siret: devis.result_json?.artisan.siret ?? null,
            client_name: devis.client_name,
            client_email: devis.result_json?.client.email ?? null,
            total_ttc: devis.total_ttc,
            profession: null,
            result_json: devis.result_json,
            signed_at: devis.signed_at,
          })
        );
        setStatus("done");
      })
      .catch(() => setStatus("error"));
  }, [id]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: "#f9fafb" }}>
      <div className="text-center max-w-sm">
        <Link href="/" className="text-xl font-extrabold mb-8 inline-block">
          Devis<span style={{ color: "#f97316" }}>Flow</span>
        </Link>

        {status === "loading" && (
          <>
            <div className="w-10 h-10 border-4 border-orange-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Préparation de votre devis…</p>
          </>
        )}

        {status === "done" && (
          <>
            <p className="text-5xl mb-4">📄</p>
            <h1 className="text-lg font-bold mb-1" style={{ color: "#1e3a5f" }}>Téléchargement lancé</h1>
            <p className="text-gray-500 text-sm">
              Choisissez « Enregistrer au format PDF » dans la fenêtre d&apos;impression pour sauvegarder votre devis.
            </p>
            <Link
              href={`/sign/${id}`}
              className="inline-block mt-6 text-sm font-semibold underline"
              style={{ color: "#1e3a5f" }}
            >
              Voir et signer le devis en ligne →
            </Link>
          </>
        )}

        {status === "error" && (
          <>
            <p className="text-5xl mb-4">🔍</p>
            <h1 className="text-lg font-bold mb-1" style={{ color: "#1e3a5f" }}>Devis introuvable</h1>
            <p className="text-gray-500 text-sm">Ce lien est invalide ou a expiré.</p>
          </>
        )}
      </div>
    </div>
  );
}
