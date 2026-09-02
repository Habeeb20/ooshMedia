import { useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import im from "../../assets/drinks/_ (6).jpeg"


export default function DrinksPromoBanner() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div
        onClick={() => navigate("/drinks")}
        className="group rounded-[2rem] overflow-hidden relative min-h-[220px] sm:h-[280px] md:h-[320px] cursor-pointer shadow-xl"
       style={{
          background: `linear-gradient(135deg, ${appConfig.colors.primary}, #111827)`,
        }}
      >
        {/* decorative glows — cool, watery */}
        <div className="absolute -right-10 -top-16 w-64 h-64 bg-cyan-300/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-14 -bottom-14 w-48 h-48 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 top-0 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        {/* floating bubble accents */}
        <div className="absolute right-[18%] top-[20%] w-3 h-3 rounded-full bg-white/30 blur-[1px] animate-pulse pointer-events-none hidden sm:block" />
        <div className="absolute right-[24%] top-[45%] w-2 h-2 rounded-full bg-white/25 blur-[1px] pointer-events-none hidden sm:block" />
        <div className="absolute right-[12%] top-[60%] w-4 h-4 rounded-full bg-white/20 blur-[1px] pointer-events-none hidden sm:block" />

        <div className="relative h-full flex items-center justify-between gap-3 px-4 sm:px-10 md:px-14 py-6 sm:py-8">
          {/* Text content */}
          <div className="text-white max-w-[55%] sm:max-w-md z-10">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] md:text-xs font-semibold tracking-wider uppercase bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              Ice Cold Deals
            </span>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Chilled drinks from our partner spots
            </h1>

            <p className="mt-2 sm:mt-3 text-white/80 text-xs sm:text-base md:text-lg leading-relaxed">
              Quench your thirst, one cold sip at a time.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/Edrinks");
              }}
              className="bg-white text-cyan-900 px-4 py-2.5 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-base mt-4 sm:mt-6 hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              Order Now
            </button>
          </div>

          {/* Image */}
          <div className="relative z-10 shrink-0">
            <div className="absolute inset-0 bg-cyan-300/30 blur-2xl rounded-full scale-90 pointer-events-none" />
            <img
              src={im}
              alt="Chilled drinks"
              className="relative w-[150px] sm:w-[280px] md:w-[320px] lg:w-[420px] rounded-2xl sm:rounded-3xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}