"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface DevisRow {
  id: string;
  created_at: string;
  artisan_name: string;
  artisan_email: string | null;
  artisan_phone: string | null;
  artisan_siret: string | null;
  client_name: string;
  client_email: string | null;
  total_ttc: number;
  profession: string | null;
}

const PASSWORD = "devisflow2026";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [devis, setDevis] = useState<DevisRow[]>([]);
  const [loading, setLoading] = useState(false);

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      setAuthed(true);
      setError("");
    } else {
      setError("Mot de passe incorrect.");
    }
  }

  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    supabase
      .from("devis")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) console.error(error);
        else setDevis(data ?? []);
        setLoading(false);
      });
  }, [authed]);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
        <form
          onSubmit={handleLogin}
          className="bg-white rounded-2xl shadow-lg p-10 flex flex-col gap-4 w-full max-w-sm"
        >
          <h1 className="text-2xl font-bold text-[#1e3a5f] text-center">
            Admin DevisFlow
          </h1>
          <input
            type="password"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Mot de passe"
            className="border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
            autoFocus
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="bg-[#1e3a5f] text-white rounded-lg py-3 font-semibold hover:bg-[#16305a] transition"
          >
            Connexion
          </button>
        </form>
      </div>
    );
  }

  const uniqueArtisans = new Set(devis.map((d) => d.artisan_email ?? d.artisan_name)).size;

  return (
    <div className="min-h-screen bg-[#f8fafc] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-[#1e3a5f]">
            Dashboard DevisFlow
          </h1>
          <button
            onClick={() => setAuthed(false)}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Déconnexion
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Total devis générés</p>
            <p className="text-4xl font-bold text-[#1e3a5f]">{devis.length}</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-6">
            <p className="text-sm text-gray-500 mb-1">Artisans uniques</p>
            <p className="text-4xl font-bold text-[#f97316]">{uniqueArtisans}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow overflow-hidden">
          {loading ? (
            <div className="p-10 text-center text-gray-400">Chargement…</div>
          ) : devis.length === 0 ? (
            <div className="p-10 text-center text-gray-400">
              Aucun devis pour l&apos;instant.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-[#f1f5f9] text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Artisan</th>
                    <th className="px-4 py-3">Email artisan</th>
                    <th className="px-4 py-3">Téléphone</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-4 py-3 text-right">Total TTC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {devis.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-gray-500">
                        {new Date(d.created_at).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium text-[#1e3a5f]">
                        {d.artisan_name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.artisan_email ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.artisan_phone ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.client_name}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#f97316]">
                        {d.total_ttc.toLocaleString("fr-FR", {
                          style: "currency",
                          currency: "EUR",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
