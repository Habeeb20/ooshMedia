import CategorySidebar from "./CategorySidebar";
import PromoCards from "./Promocard";
import HeroSwiper from "./HeroSwiper";
import CategoryDropdown from "./CtageoryDropdown";


export default function HeroSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-5">
      <div className="grid lg:grid-cols-12 gap-4">
        <div className="hidden lg:block lg:col-span-3">
          {/* <CategorySidebar /> */}
              <CategoryDropdown />
        </div>

        <div className="lg:col-span-6">
          <HeroSwiper />
        </div>

    

        <div className="lg:col-span-3">
          <PromoCards />
        </div>
      </div>
    </section>
  );
}