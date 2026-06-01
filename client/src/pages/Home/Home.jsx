

import Topbar from "../../components/home/Topbar";
import Navbar from "../../components/home/NavbarHome";
import HeroSection from "../../components/home/HeroSection";
import PromoBanner from "../../components/home/PromoBanner";
import FashionDeals from "../../components/home/FashionDeals";
import FeatureGrid from "./FeaturedGrid";
import ProductsGrid from "../product/ProductGrid";
import appConfig from "../../config/appConfig";
import { Truck, ShieldCheck, RefreshCw, Headphones } from "lucide-react";
import { FlashSaleSection,
   DiscountDealsSection, TrendingNowSection,
  TopSellersSection, TopProductsSection, AnniversaryDealsSection,
  CompanyAdDisplay
 } from "../ads/EcommerceAdsBanner";
const TRUST_BADGES = [
  { icon: Truck, label: "Fast Delivery", desc: "Same day in Lagos" },
  { icon: ShieldCheck, label: "Secure Payment", desc: "100% protected" },
  { icon: RefreshCw, label: "Easy Returns", desc: "7-day returns" },
  { icon: Headphones, label: "24/7 Support", desc: "Always available" },
];

function TrustBar() {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-4">
      <div className="bg-white rounded-2xl border border-gray-100 grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
        {TRUST_BADGES.map(({ icon: Icon, label, desc }) => (
          <div key={label} className="flex items-center gap-3 px-5 py-4">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: appConfig.colors.primary + "12" }}>
              <Icon size={17} style={{ color: appConfig.colors.primary }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="bg-[#f4f4f6] min-h-screen overflow-x-hidden">
      {/* Nav */}
      <Topbar />
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Trust badges */}
      <TrustBar />

      {/* Feature grid */}
      <FeatureGrid />

      {/* Promo banner */}
      <PromoBanner />

      {/* Products */}
      <ProductsGrid />

      {/* Fashion deals */}
      <FashionDeals />

        <FlashSaleSection />
    <DiscountDealsSection />
    <TrendingNowSection />
    <TopSellersSection />
    <TopProductsSection />
    <AnniversaryDealsSection />

      {/* Footer strip */}
      <div className="text-white text-center py-4 text-xs mt-8" style={{ background: appConfig.colors.primary }}>
        <p>© {new Date().getFullYear()} {appConfig.name}. All rights reserved.</p>
      </div>
    </div>
  );
}






















































// import {
//   FlashSaleSection, DiscountDealsSection, TrendingNowSection,
//   TopSellersSection, TopProductsSection, AnniversaryDealsSection,
//   CompanyAdDisplay
// } from './components/ads/EcommerceAdsBanner';

// // In your homepage layout:
// <div style={{ display: 'flex', gap: 20 }}>
//   <div style={{ flex: 1 }}>
//     <FlashSaleSection />
//     <DiscountDealsSection />
//     <TrendingNowSection />
//     <TopSellersSection />
//     <TopProductsSection />
//     <AnniversaryDealsSection />
//   </div>
//   <CompanyAdDisplay /> {/* shows sidebar on desktop, popup on mobile */}
// </div>