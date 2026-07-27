import Link from "next/link";

export function KPICard({
  label,
  value,
  prev,
  suffix,
  icon,
  color,
  isCurrency,
  isPercent,
  comingSoon,
}: {
  label: string;
  value: number;
  prev: number;
  suffix?: string;
  icon: string;
  color: string;
  isCurrency?: boolean;
  isPercent?: boolean;
  comingSoon?: boolean;
}) {
  const diff = prev > 0 ? ((value - prev) / prev) * 100 : value > 0 ? 100 : 0;
  const isUp = diff >= 0;

  const display = isCurrency
    ? value.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + " €"
    : isPercent
    ? `${value}%`
    : value.toString() + (suffix ? ` ${suffix}` : "");

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
          style={{ backgroundColor: color + "15" }}
        >
          {icon}
        </div>
        {!comingSoon && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              isUp ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
            }`}
          >
            {isUp ? "↑" : "↓"} {Math.abs(diff).toFixed(0)}%
          </span>
        )}
        {comingSoon && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">
            Bientôt
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold text-gray-900 mb-1">{display}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

export function EmptyState({
  icon,
  text,
  action,
}: {
  icon: string;
  text: string;
  action?: { href: string; label: string };
}) {
  return (
    <div className="py-8 text-center">
      <p className="text-3xl mb-2">{icon}</p>
      <p className="text-sm text-gray-500 mb-3">{text}</p>
      {action && (
        <Link
          href={action.href}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg text-white"
          style={{ backgroundColor: "#f97316" }}
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
