import { Globe } from "lucide-react";

export default function CurrencySelector({ currency, setCurrency, currencies, loading }) {
  return (
    <div className="inline-flex items-center gap-2 bg-gray-100 rounded-2xl px-3 py-2">
      <Globe size={16} className="text-gray-500" />
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        disabled={loading}
        className="bg-transparent text-sm font-semibold text-gray-700 outline-none disabled:opacity-50"
      >
        {currencies.map((c) => (
          <option key={c.code} value={c.code}>
            {c.code} — {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}