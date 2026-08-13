



// import { useNavigate } from "react-router-dom";
// import appConfig from "../../config/appConfig";
// import im from "../../assets/chicken3.png"
// export default function PromoBanner() {
//   const navigate = useNavigate();

//   return (
//     <section className="max-w-7xl mx-auto px-4 mt-10">
//       <div
//         onClick={() => navigate("/category/groceries-food")}
//         className="rounded-[2rem] overflow-hidden relative h-[220px] md:h-[300px] cursor-pointer"
//         style={{
//           background: `linear-gradient(135deg, ${appConfig.colors.primary}, #111827)`,
//         }}
//       >
//         <div className="absolute inset-0 flex items-center justify-between px-8 md:px-14">
//           <div className="text-white max-w-xl">
//             <h1 className="text-1xl md:text-2xl font-black leading-tight">
//              Quench the Hunger
//             </h1>

//             <p className="mt-4 text-white/80 text-sm md:text-lg">
//             Freshly made, Fuel your hunger with every bite
//             </p>

//             <button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 navigate("/category/groceries-food");
//               }}
//               className="bg-white text-black px-7 py-4 rounded-2xl font-bold mt-6 hover:scale-105 transition"
//             >
//              Order Now
//             </button>
//           </div>

//           <img
//             src={im}
//             alt="Fresh groceries and food"
//             className="hidden md:block w-[490px] rounded-3xl shadow-2xl"
//           />
//         </div>
//       </div>
//     </section>
//   );
// }




import { useNavigate } from "react-router-dom";
import appConfig from "../../config/appConfig";
import im from "../../assets/chicken3.png";

export default function PromoBanner() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div
        onClick={() => navigate("/food")}
        // onClick={() => navigate("/category/groceries-food")}
        className="group rounded-[2rem] overflow-hidden relative min-h-[220px] sm:h-[280px] md:h-[320px] cursor-pointer shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${appConfig.colors.primary}, #111827)`,
        }}
      >
        {/* subtle decorative glow */}
        <div className="absolute -right-10 -top-10 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative h-full flex items-center justify-between gap-3 px-4 sm:px-10 md:px-14 py-6 sm:py-8">
          {/* Text content */}
          <div className="text-white max-w-[55%] sm:max-w-md z-10">
            <span className="hidden sm:inline-block text-[11px] md:text-xs font-semibold tracking-wider uppercase bg-white/15 backdrop-blur-sm px-3 py-1 rounded-full mb-3">
              Limited Time
            </span>

            <h1 className="text-xl sm:text-3xl md:text-4xl font-black leading-tight tracking-tight">
              Quench the Hunger
            </h1>

            <p className="mt-2 sm:mt-3 text-white/80 text-xs sm:text-base md:text-lg leading-relaxed">
              Freshly made, fuel your hunger with every bite.
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/food");
              }}
              className="bg-white text-black px-4 py-2.5 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-base mt-4 sm:mt-6 hover:scale-105 active:scale-95 transition-transform shadow-lg"
            >
              Order Now
            </button>
          </div>

          {/* Image — visible on all screen sizes, scales up with viewport */}
          <div className="relative z-10 shrink-0">
            <img
              src={im}
              alt="Fresh groceries and food"
              className="w-[150px] sm:w-[280px] md:w-[320px] lg:w-[420px] rounded-2xl sm:rounded-3xl shadow-2xl object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>
      </div>
    </section>
  );
}