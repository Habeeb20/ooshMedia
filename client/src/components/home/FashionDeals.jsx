
// import CategorySlider from "./CategorySidebar";

// const products = [
//   {
//     id: 1,
//     title: "Designer Suit",
//     price: "₦250,000",
//     oldPrice: "₦320,000",
//     image:
//       "https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     title: "Luxury Sneakers",
//     price: "₦180,000",
//     oldPrice: "₦250,000",
//     image:
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
//   },
// ];

// export default function FashionDeals() {
//   return (
//     <div className="max-w-7xl mx-auto px-4">
//       <CategorySlider
//         title="👔 Fashion Deals"
//         products={products}
//         bg="#fdf2f8"
//       />
//     </div>
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

export default function FashionProductsSlider() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // SLUGIFY
  const slugify = (text) => {
    return text
      ?.toLowerCase()
      ?.replace(/[^\w ]+/g, "")
      ?.replace(/ +/g, "-");
  };

  // FIND FASHION CATEGORY
  const fashionCategory =
    productCategories.find((cat) =>
      cat.name
        .toLowerCase()
        .includes("fashion")
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

      // FILTER FASHION PRODUCTS
      const fashionProducts =
        allProducts.filter((product) =>
          product?.category
            ?.toLowerCase()
            ?.includes("fashion")
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
              👗 Fashion Deals
            </h2>

            <p className="text-gray-500 text-xs md:text-sm mt-1">
              Trending fashion products &
              accessories
            </p>
          </div>

          <button
            className="hidden md:flex px-5 py-3 rounded-xl text-white font-semibold"
            style={{
              background: appConfig.colors.primary,
            }}
          >
            View All
          </button>
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
              breakpoints={{
                480: {
                  slidesPerView: 2,
                },

                640: {
                  slidesPerView: 3,
                },

                768: {
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
              {products.map((product) => {
                const slug = slugify(
                  product?.name
                );

                return (
                  <SwiperSlide
                    key={product._id}
                  >
                    <div className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100">
                      {/* IMAGE */}
                      <Link
                        to={`/product/${slug}`}
                      >
                        <div className="relative overflow-hidden">
                          <img
                            src={
                              product?.images?.[0]
                                ?.url ||
                              "https://via.placeholder.com/500"
                            }
                            alt={product?.name}
                            className="h-52 md:h-64 w-full object-cover group-hover:scale-105 transition duration-500"
                          />

                          {/* SALE */}
                          {product?.salePrice && (
                            <div
                              className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                              style={{
                                background:
                                  appConfig.colors
                                    .primary,
                              }}
                            >
                              SALE
                            </div>
                          )}

                          {/* ACTIONS */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2">
                            <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
                              <Heart size={16} />
                            </button>

                            <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
                              <Eye size={16} />
                            </button>
                          </div>
                        </div>
                      </Link>

                      {/* CONTENT */}
                      <div className="p-4">
                        {/* CATEGORY */}
                        <p
                          className="text-xs font-semibold uppercase tracking-wider"
                          style={{
                            color:
                              appConfig.colors
                                .primary,
                          }}
                        >
                          {
                            product?.category
                          }
                        </p>

                        {/* NAME */}
                        <Link
                          to={`/product/${slug}`}
                        >
                          <h3 className="font-semibold text-sm md:text-base mt-2 text-gray-800 line-clamp-2 hover:text-[#8B1E3F] transition">
                            {product?.name}
                          </h3>
                        </Link>

                        {/* PRICE */}
                        <div className="mt-3">
                          <p
                            className="text-lg md:text-2xl font-black"
                            style={{
                              color:
                                appConfig.colors
                                  .primary,
                            }}
                          >
                            ₦
                            {(
                              product?.salePrice ||
                              product?.price
                            )?.toLocaleString()}
                          </p>

                          {product?.salePrice && (
                            <p className="line-through text-gray-400 text-sm">
                              ₦
                              {product?.price?.toLocaleString()}
                            </p>
                          )}
                        </div>

                        {/* STOCK + RATING */}
                        <div className="mt-3 flex items-center justify-between">
                          <p className="text-xs text-gray-500">
                            Stock:
                            <span className="font-bold text-gray-800 ml-1">
                              {
                                product?.stockQuantity
                              }
                            </span>
                          </p>

                          <div className="flex items-center gap-1 text-amber-400">
                            <Star
                              fill="currentColor"
                              size={14}
                            />

                            <span className="text-xs text-gray-700">
                              {product?.ratings ||
                                0}
                            </span>
                          </div>
                        </div>

                        {/* BUTTON */}
                        {/* <button
                          className="w-full py-3 rounded-xl mt-4 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                          style={{
                            background:
                              appConfig.colors
                                .primary,
                          }}
                        >
                          <ShoppingCart
                            size={18}
                          />
                          Add To Cart
                        </button> */}
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}
            </Swiper>

            {/* EMPTY */}
            {products.length === 0 && (
              <div className="text-center py-16">
                <h2 className="text-2xl font-bold text-gray-700">
                  No Fashion Products Found
                </h2>

                <p className="text-gray-500 mt-3">
                  Fashion products will appear
                  here.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}