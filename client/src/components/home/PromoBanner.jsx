
import appConfig from "../../config/appConfig";

export default function PromoBanner() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div
        className="rounded-[2rem] overflow-hidden relative h-[220px] md:h-[300px]"
        style={{
          background: `linear-gradient(135deg, ${appConfig.colors.primary}, #111827)`,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-between px-8 md:px-14">
          <div className="text-white max-w-xl">
            <h1 className="text-1xl md:text-2xl font-black leading-tight">
              Upgrade Your Lifestyle
            </h1>

            <p className="mt-4 text-white/80 text-sm md:text-lg">
              Discover premium gadgets, fashion, beauty and more.
            </p>

            <button className="bg-white text-black px-7 py-4 rounded-2xl font-bold mt-6 hover:scale-105 transition">
              Shop Collection
            </button>
          </div>

          <img
            src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop"
            className="hidden md:block w-[320px] rounded-3xl shadow-2xl"
          />
        </div>
      </div>
    </section>
  );
}