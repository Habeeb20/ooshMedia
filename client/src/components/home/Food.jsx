
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// import axios from "axios";

// import {
//   Loader2,
//   Heart,
//   Eye,
//   ShoppingCart,
//   Star,
// } from "lucide-react";

// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Autoplay } from "swiper/modules";

// import "swiper/css";
// import "swiper/css/navigation";

// import appConfig from "../../config/appConfig";
// import { productCategories } from "../../categories/productCategories";

// export default function Food() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // SLUGIFY
//   const slugify = (text) => {
//     return text
//       ?.toLowerCase()
//       ?.replace(/[^\w ]+/g, "")
//       ?.replace(/ +/g, "-");
//   };

//   // FIND FASHION CATEGORY
//   const fashionCategory =
//     productCategories.find((cat) =>
//       cat.name
//         .toLowerCase()
//         .includes("groceries")
//     ) || {};

//   // FETCH PRODUCTS
//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
//       );

//       const allProducts =
//         response.data?.products ||
//         response.data ||
//         [];

//       // FILTER FASHION PRODUCTS
//       const fashionProducts =
//         allProducts.filter((product) =>
//           product?.category
//             ?.toLowerCase()
//             ?.includes("groceries")
//         );

//       setProducts(fashionProducts);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   return (
//     <section className="max-w-7xl mx-auto px-4 mt-10">
//       <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
//         {/* HEADER */}
//         <div
//           className="px-5 md:px-7 py-5 flex items-center justify-between"
//           style={{
//             background: `${appConfig.colors.primary}10`,
//           }}
//         >
//           <div>
//             <h2
//               className="text-xl md:text-3xl font-black flex items-center gap-3"
//               style={{
//                 color: appConfig.colors.primary,
//               }}
//             >
//               👗 Groceries & Food
//             </h2>

//             <p className="text-gray-500 text-xs md:text-sm mt-1">
//              Delicious Food and Meals
//             </p>
//           </div>
// <Link to='/category/groceries-food'>
//    <button
//             className="hidden md:flex px-5 py-3 rounded-xl text-white font-semibold"
//             style={{
//               background: appConfig.colors.primary,
//             }}
//           >
//             View All
//           </button>
// </Link>
       
//         </div>

//         {/* LOADING */}
//         {loading ? (
//           <div className="flex justify-center py-20">
//             <Loader2
//               className="animate-spin"
//               size={45}
//               color={appConfig.colors.primary}
//             />
//           </div>
//         ) : (
//           <div className="p-4">
//             <Swiper
//               modules={[Navigation, Autoplay]}
//               navigation
//               autoplay={{
//                 delay: 2500,
//                 disableOnInteraction: false,
//               }}
//               spaceBetween={18}
//               slidesPerView={2}
//               breakpoints={{
//                 480: {
//                   slidesPerView: 2,
//                 },

//                 640: {
//                   slidesPerView: 3,
//                 },

//                 768: {
//                   slidesPerView: 3,
//                 },

//                 1024: {
//                   slidesPerView: 4,
//                 },

//                 1280: {
//                   slidesPerView: 5,
//                 },
//               }}
//             >
//               {products.map((product) => {
//                 const slug = slugify(
//                   product?.name
//                 );

//                 return (
//                   <SwiperSlide
//                     key={product._id}
//                   >
//                     <div className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
//                       {/* IMAGE */}
//                       <Link
//                         to={`/product/${slug}`}
//                       >
//                         <div className="relative overflow-hidden">
//                           <img
//                             src={
//                               product?.images?.[0]
//                                 ?.url ||
//                               "https://via.placeholder.com/500"
//                             }
//                             alt={product?.name}
//                             className="h-52 md:h-64 w-full object-cover group-hover:scale-105 transition duration-500"
//                           />

//                           {/* SALE */}
//                           {product?.salePrice && (
//                             <div
//                               className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
//                               style={{
//                                 background:
//                                   appConfig.colors
//                                     .primary,
//                               }}
//                             >
//                               SALE
//                             </div>
//                           )}

//                           {/* ACTIONS */}
//                           <div className="absolute top-3 right-3 flex flex-col gap-2">
//                             <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
//                               <Heart size={16} />
//                             </button>

//                             <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
//                               <Eye size={16} />
//                             </button>
//                           </div>
//                         </div>
//                       </Link>

//                       {/* CONTENT */}
//                       <div className="p-4">
//                         {/* CATEGORY */}
//                         <p
//                           className="text-xs font-semibold uppercase tracking-wider"
//                           style={{
//                             color:
//                               appConfig.colors
//                                 .primary,
//                           }}
//                         >
//                           {
//                             product?.category
//                           }
//                         </p>

//                         {/* NAME */}
//                         <Link
//                           to={`/product/${slug}`}
//                         >
//                           <h3 className="font-semibold text-sm md:text-base mt-2 text-gray-800 line-clamp-2 hover:text-[#8B1E3F] transition">
//                             {product?.name}
//                           </h3>
//                         </Link>

//                         {/* PRICE */}
//                         <div className="mt-3">
//                           <p
//                             className="text-lg md:text-2xl font-black"
//                             style={{
//                               color:
//                                 appConfig.colors
//                                   .primary,
//                             }}
//                           >
//                             ₦
//                             {(
//                               product?.salePrice ||
//                               product?.price
//                             )?.toLocaleString()}
//                           </p>

//                           {product?.salePrice && (
//                             <p className="line-through text-gray-400 text-sm">
//                               ₦
//                               {product?.price?.toLocaleString()}
//                             </p>
//                           )}
//                         </div>

//                         {/* STOCK + RATING */}
//                         <div className="mt-3 flex items-center justify-between">
//                           <p className="text-xs text-gray-500">
//                             Stock:
//                             <span className="font-bold text-gray-800 ml-1">
//                               {
//                                 product?.stockQuantity
//                               }
//                             </span>
//                           </p>

//                           <div className="flex items-center gap-1 text-amber-400">
//                             <Star
//                               fill="currentColor"
//                               size={14}
//                             />

//                             <span className="text-xs text-gray-700">
//                               {product?.ratings ||
//                                 0}
//                             </span>
//                           </div>
//                         </div>

//                         {/* BUTTON */}
//                         {/* <button
//                           className="w-full py-3 rounded-xl mt-4 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
//                           style={{
//                             background:
//                               appConfig.colors
//                                 .primary,
//                           }}
//                         >
//                           <ShoppingCart
//                             size={18}
//                           />
//                           Add To Cart
//                         </button> */}
//                       </div>
//                     </div>
//                   </SwiperSlide>
//                 );
//               })}
//             </Swiper>

//             {/* EMPTY */}
//             {products.length === 0 && (
//               <div className="text-center py-16">
//                 <h2 className="text-2xl font-bold text-gray-700">
//                   No Fashion Products Found
//                 </h2>

//                 <p className="text-gray-500 mt-3">
//                   Fashion products will appear
//                   here.
//                 </p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </section>
//   );
// }











import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

import {
  Loader2,
  Heart,
  Eye,
  ShoppingCart,
  Star,
} from "lucide-react";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

import appConfig from "../../config/appConfig";
import { productCategories } from "../../categories/productCategories";

export default function Food() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // SLUGIFY
  const slugify = (text) => {
    return text
      ?.toLowerCase()
      ?.replace(/[^\w ]+/g, "")
      ?.replace(/ +/g, "-");
  };

  // FIND CATEGORY
  const fashionCategory =
    productCategories.find((cat) =>
      cat.name
        .toLowerCase()
        .includes("groceries")
    ) || {};

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );

      const allProducts =
        response.data?.products ||
        response.data ||
        [];

      // FILTER GROCERIES PRODUCTS
      const fashionProducts =
        allProducts.filter((product) =>
          product?.category
            ?.toLowerCase()
            ?.includes("groceries")
        );

      setProducts(fashionProducts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        {/* HEADER */}
        <div
          className="px-5 md:px-7 py-5 flex items-center justify-between"
          style={{
            background: `${appConfig.colors.primary}10`,
          }}
        >
          <div>
            <h2
              className="text-xl md:text-3xl font-black flex items-center gap-3"
              style={{
                color: appConfig.colors.primary,
              }}
            >
              👗 Groceries & Food
            </h2>

            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Delicious Food and Meals
            </p>
          </div>
          <Link to='/category/groceries-food'>
            <button
              className="hidden md:flex px-5 py-3 rounded-xl text-white font-semibold"
              style={{
                background: appConfig.colors.primary,
              }}
            >
              View All
            </button>
          </Link>
        </div>

        {/* LOADING */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2
              className="animate-spin"
              size={45}
              color={appConfig.colors.primary}
            />
          </div>
        ) : (
          <div className="p-4">
            <Swiper
              modules={[Navigation, Autoplay]}
              navigation
              autoplay={{
                delay: 2500,
                disableOnInteraction: false,
              }}
              spaceBetween={18}
              slidesPerView={2}
              className="!pb-4" // Adds a bit of padding for card shadows
              breakpoints={{
                480: { slidesPerView: 2 },
                640: { slidesPerView: 3 },
                768: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
            >
              {products.map((product) => {
                const slug = slugify(product?.name);

                return (
                  <SwiperSlide
                    key={product._id}
                    className="!h-auto" // CRITICAL: Makes swiper slides equal height natively
                  >
                    {/* CARD CONTAINER */}
                    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                      
                      {/* IMAGE */}
                      <Link to={`/product/${slug}`}>
                        <div className="relative overflow-hidden aspect-square md:aspect-[4/5] bg-gray-50">
                          <img
                            src={
                              product?.images?.[0]?.url ||
                              "https://via.placeholder.com/500"
                            }
                            alt={product?.name}
                            className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                          />

                          {/* SALE BADGE */}
                          {product?.salePrice && (
                            <div
                              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white z-10"
                              style={{ background: appConfig.colors.primary }}
                            >
                              SALE
                            </div>
                          )}

                          {/* ACTIONS */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 z-10">
                            <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
                              <Heart size={16} />
                            </button>
                            <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </Link>

                      {/* CONTENT BODY */}
                      <div className="p-4 flex flex-col flex-grow justify-between gap-2">
                        
                        {/* TOP SECTION: Meta & Title */}
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-wider"
                            style={{ color: appConfig.colors.primary }}
                          >
                            {product?.category || "Groceries"}
                          </p>

                          <Link to={`/product/${slug}`}>
                            {/* Fixed minimum height prevents 1-line titles from shrinking the card layout */}
                            <h3 className="font-semibold text-sm md:text-base mt-1 text-gray-800 line-clamp-2 hover:text-[#8B1E3F] transition min-h-[2.5rem] md:min-h-[3rem] leading-tight">
                              {product?.name}
                            </h3>
                          </Link>
                        </div>

                        {/* BOTTOM SECTION: Price & Stock Info */}
                        <div className="mt-auto space-y-2">
                          {/* PRICE */}
                          <div>
                            <p
                              className="text-base md:text-xl font-black leading-none"
                              style={{ color: appConfig.colors.primary }}
                            >
                              ₦{(product?.salePrice || product?.price)?.toLocaleString()}
                            </p>
                            {product?.salePrice ? (
                              <p className="line-through text-gray-400 text-xs mt-0.5">
                                ₦{product?.price?.toLocaleString()}
                              </p>
                            ) : (
                              // Blank placeholder keeps spacing identical when no sale item exists
                              <div className="h-4" />
                            )}
                          </div>

                          {/* STOCK + RATING */}
                          <div className="flex items-center justify-between pt-1 border-t border-gray-50">
                            <p className="text-xs text-gray-500">
                              Stock:
                              <span className="font-bold text-gray-800 ml-1">
                                {product?.stockQuantity ?? 0}
                              </span>
                            </p>

                            <div className="flex items-center gap-1 text-amber-400">
                              <Star fill="currentColor" size={14} />
                              <span className="text-xs text-gray-700">
                                {product?.ratings || 0}
                              </span>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* EMPTY STATE */}
            {products.length === 0 && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-700">
                  No Products Found
                </h2>
                <p className="text-gray-500 mt-3">
                  Products will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}