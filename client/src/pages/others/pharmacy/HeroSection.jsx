import { useNavigate } from "react-router-dom";
import { Pill, Stethoscope, HeartPulse, Syringe, Thermometer, Cross, ShieldCheck, ArrowRight, FileText } from "lucide-react";
import appConfig from "../../../config/appConfig";
import { withAlpha } from "./colorUtils";

// The floating tiles show an icon by default. To use photos instead, import them and set `image`:
//   import tile1 from "../../../assets/pharmacy1.jpeg";   ->   { icon: Pill, image: tile1, ... }
const TILES = [
  { icon: Pill, image: null, className: "plate-1 top-[40%] left-[4%] sm:left-[8%] w-[54px] sm:w-[85px] md:w-[100px] hidden xs:block" },
  { icon: Stethoscope, image: null, className: "plate-2 top-[4%] left-[30%] sm:left-[28%] w-[60px] sm:w-[95px] md:w-[115px]" },
  { icon: HeartPulse, image: null, className: "plate-3 -top-[2%] left-[54%] sm:left-[50%] w-[52px] sm:w-[80px] md:w-[95px]" },
  { icon: Syringe, image: null, className: "plate-4 top-[8%] right-[8%] sm:right-[12%] w-[62px] sm:w-[100px] md:w-[120px]" },
  { icon: Thermometer, image: null, className: "plate-5 top-[30%] right-[4%] w-[50px] sm:w-[75px] md:w-[90px] hidden sm:block" },
  {
    icon: Cross, image: null, large: true,
    className: "plate-6 -top-[110px] right-[2%] left-auto translate-x-0 sm:top-auto sm:bottom-15 sm:left-[36%] sm:right-auto sm:translate-x-0 w-[120px] sm:w-[220px] md:w-[260px] shadow-2xl",
  },
];

export default function HeroSection() {
  const navigate = useNavigate();
  const brand = appConfig.colors.primary;

  // Smooth-scroll to a section on this page. If it isn't on the page (someone lands on the hero from
  // another route), go to the homepage with a hash and scroll once it has rendered.
  const goToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate(`/#${id}`);
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  return (
    <section className=" mb-10">
      {/* Curved brand shape, pushed further right/down on mobile so it clears the text entirely */}
      <div
        className="absolute -top-[160px] -right-[260px]
          w-[440px] h-[440px]
          sm:-top-[300px] sm:-right-[280px] sm:w-[700px] sm:h-[700px]
          md:-top-[360px] md:-right-[300px] md:w-[900px] md:h-[900px]
          lg:-top-[400px] lg:-right-[320px] lg:w-[1000px] lg:h-[1000px]
          rounded-full pointer-events-none"
        style={{ backgroundColor: brand }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
          {/* Copy: capped narrow on mobile so it never touches the curve; single line on desktop */}
          <div className="relative z-10 w-full md:max-w-xl md:pt-12 text-left pl-1 sm:pl-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold"
              style={{ backgroundColor: withAlpha(brand, 0.1), color: brand }}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Trusted pharmacies near you
            </span>

            <h1 className="mt-4 text-2xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-gray-900 max-w-[180px] sm:max-w-none md:whitespace-nowrap">
              Your Health,
              <br />
              <span style={{ color: brand }}>Delivered</span>
            </h1>

            <p className="mt-3 text-xs font-semibold sm:text-sm md:text-base text-gray-500 max-w-[170px] sm:max-w-xs">
              Browse medicines and health essentials, order in minutes, and get them wherever you are.
            </p>
            <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-500 max-w-[170px] sm:max-w-xs">
              Pharmacy &nbsp;·&nbsp; Health &nbsp;·&nbsp; Wellness
            </p>

            <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row gap-3 max-w-[180px] sm:max-w-none">
              <button
                onClick={() => goToSection("popular-medicines")}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full text-white text-xs sm:text-sm tracking-wide uppercase font-semibold shadow-lg hover:scale-105 active:scale-95 transition-transform"
                style={{ backgroundColor: brand }}
              >
                Order Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => goToSection("prescription-lookup")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm tracking-wide uppercase font-semibold bg-white border-2 hover:scale-105 active:scale-95 transition-transform"
                style={{ borderColor: brand, color: brand }}
              >
                <FileText className="w-4 h-4" />
                Check a Prescription
              </button>
            </div>
          </div>

          {/* Floating tile cluster: sits over the coloured half only */}
          <div className="relative z-10 w-full flex-1 h-[240px] sm:h-[380px] md:h-[480px] mt-4 md:mt-0" aria-hidden="true">
            {TILES.map(({ icon: Icon, image, className, large }, i) => (
              <div
                key={i}
                className={`plate absolute rounded-full shadow-xl aspect-square border-4 border-white bg-white overflow-hidden flex items-center justify-center cursor-pointer ${className}`}
              >
                {image ? (
                  <img src={image} alt="" className="w-full h-full object-cover" />
                ) : (
                  <span
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: `radial-gradient(circle at 30% 25%, #fff 0%, ${withAlpha(brand, large ? 0.22 : 0.14)} 100%)` }}
                  >
                    <Icon className={large ? "w-[46%] h-[46%]" : "w-[44%] h-[44%]"} style={{ color: brand }} strokeWidth={2.2} />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes plateRelaySpin {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        .plate {
          animation: plateRelaySpin 8s linear infinite;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }
        .plate-1 { animation-delay: 0s; }
        .plate-2 { animation-delay: 1.3s; }
        .plate-3 { animation-delay: 2.6s; }
        .plate-4 { animation-delay: 4s; }
        .plate-5 { animation-delay: 5.3s; }
        .plate-6 { animation-delay: 6.6s; }
        .plate:hover {
          animation-play-state: paused;
          transform: scale(1.08) translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.22);
          z-index: 20;
        }
        @media (prefers-reduced-motion: reduce) {
          .plate { animation: none; }
        }
      `}</style>
    </section>
  );
}