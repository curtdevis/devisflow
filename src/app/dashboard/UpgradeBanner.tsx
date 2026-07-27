"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function UpgradeBanner() {
  const params = useSearchParams();
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("upgraded") === "1") {
      setShow(true);
      // Clean URL without reload
      const url = new URL(window.location.href);
      url.searchParams.delete("upgraded");
      router.replace(url.pathname + url.search, { scroll: false });
    }
  }, [params, router]);

  if (!show) return null;

  return (
    <div className="mb-6 rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-green-50 border border-green-200">
      <div>
        <p className="font-bold text-sm text-green-800">
          🎉 Bienvenue dans Artisan Solo !
        </p>
        <p className="text-xs mt-0.5 text-green-700">
          Votre abonnement est actif. Vous avez accès à toutes les fonctionnalités sans limite.
        </p>
      </div>
      <button
        onClick={() => setShow(false)}
        className="shrink-0 text-xs text-green-600 hover:text-green-800 font-semibold"
      >
        Fermer ×
      </button>
    </div>
  );
}
