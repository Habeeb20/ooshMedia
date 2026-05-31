import appConfig from "../../config/appConfig";
import { Phone, HelpCircle, Package, ChevronRight } from "lucide-react";

export default function Topbar() {
  return (
    <div className="text-white text-xs" style={{ background: appConfig.colors.primary }}>
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
        <p className="font-medium tracking-wide truncate">{appConfig.tagline}</p>
        <div className="hidden md:flex items-center gap-1 divide-x divide-white/20 text-white/90">
          {[
            { icon: Package, label: `Sell on ${appConfig.name}` },
            { icon: HelpCircle, label: "Help Center" },
            { icon: Phone, label: "Track Order" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 px-3 py-0.5 hover:text-white transition-colors"
            >
              <Icon size={12} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}