// import { ChevronRight } from "lucide-react";
// import { productCategories } from "../../categories/productCategories";




// import appConfig from "../../config/appConfig";

// export default function CategorySidebar() {
//   return (
//     <div className="bg-white rounded-2xl p-3 shadow-sm h-full">
//       {productCategories.map((category) => (
//         <div
//           key={category.id}
//           className="flex items-center justify-between px-3 py-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
//         >
//           <div className="flex items-center gap-3">
//             <span className="text-xl">{category.icon}</span>

//             <span className="font-medium text-[15px]">
//               {category.name}
//             </span>
//           </div>

//           <ChevronRight
//             size={18}
//             color={appConfig.colors.gray}
//           />
//         </div>
//       ))}
//     </div>
//   );
// }





import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import ProductCard from "./ProductCard"


export default function CategorySlider({
  title,
  products,
  bg = "white",
  titleColor = "#111827",
}) {
  return (
    <section className="mt-10">
      <div
        className="rounded-3xl overflow-hidden shadow-sm"
        style={{ background: bg }}
      >
        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-5">
          <h2
            className="text-2xl md:text-3xl font-black"
            style={{ color: titleColor }}
          >
            {title}
          </h2>

          <button className="font-semibold text-sm md:text-base">
            VIEW ALL
          </button>
        </div>

        {/* SWIPER */}
        <div className="px-4 pb-6">
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            autoplay={{
              delay: 2500,
              disableOnInteraction: false,
            }}
            spaceBetween={20}
            slidesPerView={2}
            breakpoints={{
              480: {
                slidesPerView: 2,
              },
              640: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
              1280: {
                slidesPerView: 5,
              },
            }}
          >
            {products?.map((product) => (
              <SwiperSlide key={product.id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}