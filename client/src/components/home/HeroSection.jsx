
import { CompanyAdDisplay } from "../../pages/ads/EcommerceAdsBanner";
import CategoryDropdown from "./CtageoryDropdown";
import HeroSwiper from "./HeroSwiper";
import PromoCards from "./Promocard";

export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-4 md:mt-6">
      <div className="grid lg:grid-cols-12 gap-3 lg:gap-4 items-start">
        {/* Category sidebar - desktop only */}
        <div className="hidden lg:block lg:col-span-3">
          <CategoryDropdown />
        </div>

        {/* Hero swiper - center */}
        <div className="col-span-12 lg:col-span-6">
          <HeroSwiper />
          {/* Mobile-only quick category scroll */}
          <div className="flex items-center gap-3 mt-3 overflow-x-auto no-scrollbar lg:hidden pb-1">
            {["📱 Electronics", "👗 Fashion", "🏠 Home", "🍔 Food", "💄 Beauty", "⚽ Sports"].map(item => (
              <button
                key={item}
                className="flex-shrink-0 px-3 py-2 bg-white rounded-xl text-xs font-bold text-gray-700 border border-gray-100 hover:border-[#8B1E3F] hover:text-[#8B1E3F] transition-colors shadow-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Promo cards - right */}
        <div className="hidden lg:block lg:col-span-3">
          <PromoCards />
          <CompanyAdDisplay/>
        </div>
      </div>
    </section>
  );
}