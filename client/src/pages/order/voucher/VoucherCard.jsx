import { useState } from "react";
import { Copy, Check, Utensils, HeartPulse, Bus, ShoppingBasket, Ticket } from "lucide-react";

const CATEGORY_THEME = {
  food: { gradient: "from-orange-500 to-amber-400", icon: Utensils, label: "Food" },
  groceries: { gradient: "from-green-600 to-lime-500", icon: ShoppingBasket, label: "Groceries" },
  medical: { gradient: "from-sky-600 to-cyan-400", icon: HeartPulse, label: "Medical" },
  transport: { gradient: "from-yellow-500 to-neutral-800", icon: Bus, label: "Transport" },
};

export default function VoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false);

  const theme = CATEGORY_THEME[voucher?.category] || {
    gradient: "from-[#8B1E3F] to-[#c2436b]",
    icon: Ticket,
    label: voucher?.category,
  };
  const Icon = theme.icon;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(voucher.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be unavailable in some browsers/contexts — fail silently
    }
  };

  const perUserNaira = ((voucher.perUserShareKobo || 0) / 100).toLocaleString();
  const totalNaira = ((voucher.totalAmountKobo || 0) / 100).toLocaleString();
  const slotsUsed = voucher.slotsUsed ?? voucher.redemptions?.length ?? 0;

  return (
    <div className={`relative w-full max-w-sm mx-auto rounded-3xl bg-gradient-to-br ${theme.gradient} text-white p-6 shadow-xl overflow-hidden`}>
      <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10" />
      <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-white/10" />

      <div className="relative flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Icon size={22} />
          <span className="font-semibold uppercase tracking-wide text-sm">{theme.label} Voucher</span>
        </div>
        <span className="text-xs bg-white/20 rounded-full px-3 py-1 capitalize">
          {voucher.status?.replace("_", " ")}
        </span>
      </div>

      <div className="relative mb-6">
        <p className="text-xs text-white/70 mb-1">Voucher Code</p>
        <div className="flex items-center justify-between bg-white/15 rounded-2xl px-4 py-3">
          <span className="font-mono text-xl tracking-widest">{voucher.code || "PENDING"}</span>
          {voucher.code && (
            <button onClick={handleCopy} className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors">
              {copied ? <Check size={18} /> : <Copy size={18} />}
            </button>
          )}
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-white/70 text-xs">Total Funded</p>
          <p className="font-bold">₦{totalNaira}</p>
        </div>
        <div>
          <p className="text-white/70 text-xs">Per User</p>
          <p className="font-bold">₦{perUserNaira}</p>
        </div>
        <div>
          <p className="text-white/70 text-xs">Slots</p>
          <p className="font-bold">{slotsUsed} / {voucher.numberOfUsers} used</p>
        </div>
        <div>
          <p className="text-white/70 text-xs">Expires</p>
          <p className="font-bold">{new Date(voucher.expiresAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
