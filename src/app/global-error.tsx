"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="fr">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", backgroundColor: "#f9fafb" }}>
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
          <div style={{ textAlign: "center", maxWidth: "28rem" }}>
            <p style={{ fontSize: "5rem", fontWeight: 800, color: "#1e3a5f", opacity: 0.15, marginBottom: "1rem" }}>500</p>
            <div style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>⚙️</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: "#1e3a5f", marginBottom: "0.75rem" }}>
              Erreur critique
            </h1>
            <p style={{ color: "#6b7280", marginBottom: "2rem", lineHeight: 1.6 }}>
              Une erreur inattendue a interrompu l&apos;application. L&apos;équipe a été notifiée.
            </p>
            <button
              onClick={reset}
              style={{ backgroundColor: "#f97316", color: "white", fontWeight: 700, padding: "0.75rem 1.5rem", borderRadius: "0.75rem", border: "none", cursor: "pointer", fontSize: "1rem" }}
            >
              Réessayer
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
