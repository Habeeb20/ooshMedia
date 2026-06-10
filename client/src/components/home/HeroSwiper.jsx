


import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import appConfig from "../../config/appConfig";

const slides = [
  {
    image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1400&auto=format&fit=crop",
    title: "Massive Discounts",
    subtitle: "Up to 70% OFF premium products",
  },
  {
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1400&auto=format&fit=crop",
    title: "Latest Gadgets",
    subtitle: "Modern devices for smart living",
  },
  // {
  //   image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
  //   title: "Luxury Experience",
  //   subtitle: "Premium shopping for professionals",
  // },
];

export default function HeroSwiper() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{
        delay: 3000,
        disableOnInteraction: false,
      }}
      pagination={{ 
        clickable: true,
        bulletClass: "swiper-pagination-bullet !bg-white/70",
        bulletActiveClass: "!bg-white",
      }}
      loop={true}
      className="rounded-3xl overflow-hidden w-full h-[66vh]  aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1]"
      style={{ maxHeight: "550px" }}
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full md: w-80">
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover md: w-[80vh]"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
              <div className="px-6 md:px-10 lg:px-16 text-white max-w-2xl">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  {slide.title}
                </h1>

                <p className="mt-3 md:mt-5 text-base md:text-lg lg:text-xl text-gray-200 font-medium">
                  {slide.subtitle}
                </p>

                <button
                  className="mt-6 md:mt-8 px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: appConfig.colors.primary,
                  }}
                >
                  Shop Now
                </button>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}






// import { Swiper, SwiperSlide } from "swiper/react";
// import { Autoplay, Pagination } from "swiper/modules";
// import "swiper/css";
// import "swiper/css/pagination";
// import appConfig from "../../config/appConfig";

// const slides = [
//   {
//     image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1400&auto=format&fit=crop",
//     title: "Massive Discounts",
//     subtitle: "Up to 70% OFF premium products",
//     tag: "🔥 Limited Time",
//   },
//   {
//     image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1400&auto=format&fit=crop",
//     title: "Latest Gadgets",
//     subtitle: "Modern devices for smart living",
//     tag: "✨ New Arrivals",
//   },
// ];

// export default function HeroSwiper() {
//   return (
//     <div className="w-full px-0">
//       <Swiper
//         modules={[Autoplay, Pagination]}
//         autoplay={{ delay: 3500, disableOnInteraction: false }}
//         pagination={{
//           clickable: true,
//           bulletClass: "swiper-pagination-bullet custom-bullet",
//           bulletActiveClass: "custom-bullet-active",
//         }}
//         loop={true}
//         className="w-full rounded-2xl md:rounded-3xl overflow-hidden"
//         style={{ height: "clamp(200px, 38vw, 520px)" }}
//       >
//         {slides.map((slide, index) => (
//           <SwiperSlide key={index}>
//             <div className="relative w-full h-full">
//               <img
//                 src={slide.image}
//                 alt={slide.title}
//                 className="w-full h-full object-cover object-center"
//               />

//               {/* Overlay */}
//               <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-transparent" />

//               {/* Content */}
//               <div className="absolute inset-0 flex items-center">
//                 <div className="px-5 sm:px-8 md:px-12 lg:px-16 text-white max-w-xl">
//                   <span className="inline-block text-xs sm:text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30 px-3 py-1 rounded-full mb-3">
//                     {slide.tag}
//                   </span>

//                   <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
//                     {slide.title}
//                   </h1>

//                   <p className="mt-2 sm:mt-4 text-sm sm:text-base md:text-lg text-gray-200 font-medium">
//                     {slide.subtitle}
//                   </p>

//                   <button
//                     className="mt-4 sm:mt-7 px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all hover:scale-105 active:scale-95 shadow-lg"
//                     style={{ background: appConfig.colors.primary }}
//                   >
//                     Shop Now
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </SwiperSlide>
//         ))}
//       </Swiper>

//       <style>{`
//         .custom-bullet {
//           width: 6px;
//           height: 6px;
//           background: rgba(255,255,255,0.5);
//           opacity: 1;
//           transition: all 0.3s;
//         }
//         .custom-bullet-active {
//           width: 20px;
//           border-radius: 4px;
//           background: white !important;
//           opacity: 1;
//         }
//       `}</style>
//     </div>
//   );
// }