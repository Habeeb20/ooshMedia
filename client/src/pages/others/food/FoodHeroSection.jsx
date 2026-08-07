









// import { useNavigate } from "react-router-dom";
// import appConfig from "../../../config/appConfig";

// import plate1 from "../../../assets/f1.jpeg";
// import plate2 from "../../../assets/f2.jpeg";
// import plate3 from "../../../assets/f3.jpeg";
// import plate4 from "../../../assets/f4.jpeg";
// import plate5 from "../../../assets/amala.jpeg";
// import plate6 from "../../../assets/dinner.jpeg";

// export default function HeroSection() {
//   const navigate = useNavigate();

//   return (
//     <section className="relative overflow-hidden">
//       {/* Curved red shape — a true circle, centered past the right edge so only
//           its left arc shows inside the section = covers roughly half the width */}
//       <div
//         className="absolute -top-[220px] -right-[220px]
//           w-[520px] h-[520px]
//           sm:-top-[300px] sm:-right-[280px] sm:w-[700px] sm:h-[700px]
//           md:-top-[360px] md:-right-[300px] md:w-[900px] md:h-[900px]
//           lg:-top-[400px] lg:-right-[320px] lg:w-[1000px] lg:h-[1000px]
//           rounded-full pointer-events-none"
//         style={{ backgroundColor: appConfig.colors.primary }}
//       />

//       <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">
//         <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
//           {/* Copy — stays clear of the curve, left-aligned */}
//           <div className="relative z-10 w-full md:max-w-md md:pt-16 text-left pl-1 sm:pl-2">
//             <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-gray-900">
//               Delicious
//               <br />
//               Quench the Hunger
//             </h1>
//             <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-500 max-w-[220px] sm:max-w-xs">
//               Restaurants &nbsp;·&nbsp; Abula &nbsp;·&nbsp; FastFood
//             </p>

//             <button
//               onClick={() => navigate("/category/groceries-food")}
//               className="mt-5 sm:mt-6 px-6 py-2.5 rounded-full text-white text-xs sm:text-sm font-bold tracking-wide uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
//               style={{ backgroundColor: appConfig.colors.primary }}
//             >
//               Order Now
//             </button>
//           </div>

//           {/* Floating plate cluster — sits over the red half only */}
//           <div className="relative z-10 w-full flex-1 h-[240px] sm:h-[380px] md:h-[480px] mt-4 md:mt-0">
//             <img
//               src={plate1}
//               alt=""
//               className="plate plate-1 absolute top-[40%] left-[4%] sm:left-[8%] w-[54px] sm:w-[85px] md:w-[100px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer hidden xs:block"
//             />
//             <img
//               src={plate2}
//               alt=""
//               className="plate plate-2 absolute top-[4%] left-[30%] sm:left-[28%] w-[60px] sm:w-[95px] md:w-[115px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
//             />
//             <img
//               src={plate3}
//               alt=""
//               className="plate plate-3 absolute -top-[2%] left-[54%] sm:left-[50%] w-[52px] sm:w-[80px] md:w-[95px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
//             />
//             <img
//               src={plate4}
//               alt=""
//               className="plate plate-4 absolute top-[8%] right-[8%] sm:right-[12%] w-[62px] sm:w-[100px] md:w-[120px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
//             />
//             <img
//               src={plate5}
//               alt=""
//               className="plate plate-5 absolute top-[48%] right-[2%] w-[50px] sm:w-[75px] md:w-[90px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer hidden sm:block"
//             />
//             <img
//               src={plate6}
//               alt="Featured dish"
//               className="plate plate-6 absolute bottom-0 left-1/2 -translate-x-1/2 sm:left-[56%] sm:translate-x-0 w-[150px] sm:w-[220px] md:w-[260px] rounded-full shadow-2xl object-cover aspect-square border-4 border-white cursor-pointer"
//             />
//           </div>
//         </div>
//       </div>

//       <style>{`
//         @keyframes plateRelaySpin {
//           0%   { transform: rotate(0deg); }
//           25%  { transform: rotate(360deg); }
//           100% { transform: rotate(360deg); }
//         }
//         .plate {
//           animation: plateRelaySpin 8s linear infinite;
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//           will-change: transform;
//         }
//         .plate-1 { animation-delay: 0s; }
//         .plate-2 { animation-delay: 1.3s; }
//         .plate-3 { animation-delay: 2.6s; }
//         .plate-4 { animation-delay: 4s; }
//         .plate-5 { animation-delay: 5.3s; }
//         .plate-6 { animation-delay: 6.6s; }
//         .plate:hover {
//           animation-play-state: paused;
//           transform: scale(1.08) translateY(-4px);
//           box-shadow: 0 12px 28px rgba(0,0,0,0.22);
//           z-index: 20;
//         }
//         @media (prefers-reduced-motion: reduce) {
//           .plate { animation: none; }
//         }
//       `}</style>
//     </section>
//   );
// }






import { useNavigate } from "react-router-dom";
import appConfig from "../../../config/appConfig";

import plate1 from "../../../assets/f1.jpeg";
import plate2 from "../../../assets/f2.jpeg";
import plate3 from "../../../assets/f3.jpeg";
import plate4 from "../../../assets/f4.jpeg";
import plate5 from "../../../assets/amala.jpeg";
import plate6 from "../../../assets/dinner.jpeg";

export default function HeroSection() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden">
      {/* Curved red shape — pushed further right/down on mobile so it clears the text entirely */}
      <div
        className="absolute -top-[160px] -right-[260px]
          w-[440px] h-[440px]
          sm:-top-[300px] sm:-right-[280px] sm:w-[700px] sm:h-[700px]
          md:-top-[360px] md:-right-[300px] md:w-[900px] md:h-[900px]
          lg:-top-[400px] lg:-right-[320px] lg:w-[1000px] lg:h-[1000px]
          rounded-full pointer-events-none"
        style={{ backgroundColor: appConfig.colors.primary }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
          {/* Copy — capped narrow on mobile so it never touches the curve; single line on desktop */}
          <div className="relative z-10 w-full md:max-w-xl md:pt-16 text-left pl-1 sm:pl-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-gray-900 max-w-[180px] sm:max-w-none md:whitespace-nowrap">
              {/* Delicious */}
              <br className="md:hidden" />
              <br/>
              <span className="">Quench the Hunger</span>
            </h1>
            <p className=" mt-3 text-xs font-semibold sm:text-sm md:text-base text-gray-500 max-w-[170px] sm:max-w-xs">
             Browse our menu, order in minutes, and enjoy fresh food wherever you are.
            </p>
            <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-500 max-w-[170px] sm:max-w-xs">
              Restaurants &nbsp;·&nbsp; Abula &nbsp;·&nbsp; FastFood
            </p>

            <button
              onClick={() => navigate("/category/groceries-food")}
              className="mt-5 sm:mt-6 px-15 py-4.5 rounded-full text-white text-xs sm:text-sm  tracking-wide uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: appConfig.colors.primary }}
            >
              Order Now
            </button>
          </div>

          {/* Floating plate cluster — sits over the red half only */}
          <div className="relative z-10 w-full flex-1 h-[240px] sm:h-[380px] md:h-[480px] mt-4 md:mt-0">
            <img
              src={plate1}
              alt=""
              className="plate plate-1 absolute top-[40%] left-[4%] sm:left-[8%] w-[54px] sm:w-[85px] md:w-[100px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer hidden xs:block"
            />
            <img
              src={plate2}
              alt=""
              className="plate plate-2 absolute top-[4%] left-[30%] sm:left-[28%] w-[60px] sm:w-[95px] md:w-[115px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
            <img
              src={plate3}
              alt=""
              className="plate plate-3 absolute -top-[2%] left-[54%] sm:left-[50%] w-[52px] sm:w-[80px] md:w-[95px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
            <img
              src={plate4}
              alt=""
              className="plate plate-4 absolute top-[8%] right-[8%] sm:right-[12%] w-[62px] sm:w-[100px] md:w-[120px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
            <img
              src={plate5}
              alt=""
              className="plate plate-5 absolute top-[30%] right-[4%] w-[50px] sm:w-[75px] md:w-[90px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer hidden sm:block"
            />
            <img
              src={plate6}
              alt="Featured dish"
              className="plate plate-6 absolute bottom-0 left-1/2 -translate-x-1/2 sm:left-[56%] sm:translate-x-0 w-[150px] sm:w-[220px] md:w-[260px] rounded-full shadow-2xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
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