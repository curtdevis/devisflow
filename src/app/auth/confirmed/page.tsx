import Link from "next/link";

export default function ConfirmedPage() {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: "var(--navy)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold text-white">
            Devis<span style={{ color: "var(--orange)" }}>Flow</span>
          </Link>
        </div>

        <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-8 text-center">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ backgroundColor: "rgba(249,115,22,0.15)" }}
          >
            ✅
          </div>

          <h1 className="text-xl font-bold text-white mb-2">
            Votre compte est activé !
          </h1>
          <p className="text-blue-200 text-sm mb-8">
            Vous pouvez maintenant vous connecter.
          </p>

          <Link
            href="/auth/login"
            className="inline-block w-full text-white font-bold py-3 rounded-xl transition-all hover:opacity-90"
            style={{ backgroundColor: "var(--orange)" }}
          >
            Se connecter →
          </Link>
        </div>
      </div>
    </div>
  );
}
