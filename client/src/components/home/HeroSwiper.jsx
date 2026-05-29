import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";

import appConfig from "../../config/appConfig";

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
  {
    image:
      "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1400&auto=format&fit=crop",
    title: "Luxury Experience",
    subtitle: "Premium shopping for professionals",
  },
];

export default function HeroSwiper() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      autoplay={{
        delay: 2000,
        disableOnInteraction: false,
      }}
      pagination={{ clickable: true }}
      loop={true}
      className="rounded-3xl overflow-hidden h-[450px]"
    >
      {slides.map((slide, index) => (
        <SwiperSlide key={index}>
          <div className="relative h-full">
            <img
              src={slide.image}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-black/45 flex items-center">
              <div className="px-10 text-white max-w-lg">
                <h1 className="text-5xl font-black leading-tight">
                  {slide.title}
                </h1>

                <p className="mt-4 text-lg text-gray-200">
                  {slide.subtitle}
                </p>

                <button
                  className="mt-7 px-8 py-4 rounded-xl font-bold text-lg text-white"
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