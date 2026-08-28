import { TrendingUp, ArrowRight, Sparkles } from "lucide-react";
import appConfig from "../../config/appConfig";

export default function PriceCheckerBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-12">
      <a
        href="https://estores.ng/pricechecker"
        target="_blank"
        rel="noopener noreferrer"
        className="group relative block overflow-hidden rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300"
        style={{
          background: `linear-gradient(135deg, ${appConfig.colors.primary} 0%, #4a0e1f 100%)`,
        }}
      >
        {/* Decorative background accents */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />

        <div className="relative px-6 py-8 md:px-12 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left: copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full mb-4">
              <Sparkles size={14} className="text-amber-300" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">
                Updated Daily
              </span>
            </div>

            <h2 className="text-2xl md:text-4xl font-black text-white leading-tight">
              Know the Real Price.<br className="hidden md:block" /> Before You Buy.
            </h2>

            <p className="text-white/80 mt-3 text-sm md:text-base max-w-xl mx-auto md:mx-0">
              Compare live prices across trusted vendors on Estores and shop
              with confidence — no guesswork, no overpaying.
            </p>
          </div>

          {/* Right: CTA */}
          <div className="flex-shrink-0">
            <span
              className="inline-flex items-center gap-3 bg-white px-7 py-4 rounded-2xl font-black text-base md:text-lg shadow-md group-hover:gap-4 group-hover:scale-105 transition-all duration-300"
              style={{ color: appConfig.colors.primary }}
            >
              <TrendingUp size={22} />
              Check Prices Today
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </div>
      </a>
    </section>
  );
}