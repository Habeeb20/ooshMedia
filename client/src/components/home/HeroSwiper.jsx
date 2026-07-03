


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
//   },
//   {
//     image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1400&auto=format&fit=crop",
//     title: "Latest Gadgets",
//     subtitle: "Modern devices for smart living",
//   },
//   // {
//   //   image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
//   //   title: "Luxury Experience",
//   //   subtitle: "Premium shopping for professionals",
//   // },
// ];

// export default function HeroSwiper() {
//   return (
//     <Swiper
//       modules={[Autoplay, Pagination]}
//       autoplay={{
//         delay: 3000,
//         disableOnInteraction: false,
//       }}
//       pagination={{ 
//         clickable: true,
//         bulletClass: "swiper-pagination-bullet !bg-white/70",
//         bulletActiveClass: "!bg-white",
//       }}
//       loop={true}
//       className="rounded-3xl overflow-hidden w-full h-[66vh]  aspect-[16/9] md:aspect-[21/9] lg:aspect-[2.5/1]"
//       style={{ maxHeight: "550px" }}
//     >
//       {slides.map((slide, index) => (
//         <SwiperSlide key={index}>
//           <div className="relative w-full h-full md: w-80">
//             {/* Background Image */}
//             <img
//               src={slide.image}
//               alt={slide.title}
//               className="w-full h-full object-cover md: w-[80vh]"
//             />

//             {/* Overlay */}
//             <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent flex items-center">
//               <div className="px-6 md:px-10 lg:px-16 text-white max-w-2xl">
//                 <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
//                   {slide.title}
//                 </h1>

//                 <p className="mt-3 md:mt-5 text-base md:text-lg lg:text-xl text-gray-200 font-medium">
//                   {slide.subtitle}
//                 </p>

//                 <button
//                   className="mt-6 md:mt-8 px-8 py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg transition-all hover:scale-105 active:scale-95"
//                   style={{
//                     background: appConfig.colors.primary,
//                   }}
//                 >
//                   Shop Now
//                 </button>
//               </div>
//             </div>
//           </div>
//         </SwiperSlide>
//       ))}
//     </Swiper>
//   );
// }
















import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import appConfig from "../../config/appConfig";
import { Link } from "react-router-dom";

const slides = [
  {
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1400&auto=format&fit=crop",
    title: "Massive Discounts",
    subtitle: "Up to 70% OFF premium products",
  },
  {
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1400&auto=format&fit=crop",
    title: "Latest Gadgets",
    subtitle: "Modern devices for smart living",
  },
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
      className="rounded-2xl md:rounded-3xl overflow-hidden w-full h-[40vh] sm:h-[50vh] md:h-[60vh] lg:h-[70vh]"
      style={{ maxHeight: "550px", minHeight: "260px" }}
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="relative w-full h-full">
            {/* Background Image */}
            <img
              src={slide.image}
              alt={slide.title}
              loading={index === 0 ? "eager" : "lazy"}
              className="w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-black/80 sm:from-black/70 via-black/40 sm:via-black/50 to-transparent flex items-end sm:items-center">
              <div className="px-5 pb-8 sm:pb-0 sm:px-8 md:px-10 lg:px-16 text-white max-w-2xl">
                <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
                  {slide.title}
                </h1>

                <p className="mt-2 sm:mt-3 md:mt-5 text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 font-medium">
                  {slide.subtitle}
                </p>
<Link to='/categories'>
  <button
                  className="mt-4 sm:mt-6 md:mt-8 px-6 py-3 sm:px-8 sm:py-3.5 md:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base md:text-lg transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: appConfig.colors.primary,
                  }}
                >
                  Shop Now
                </button>
</Link>
              
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}