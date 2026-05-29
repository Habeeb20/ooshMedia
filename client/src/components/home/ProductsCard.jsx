// import ProductCard from "./ProductCard";

// const products = [
//   {
//     id: 1,
//     title: "iPhone 15 Pro Max",
//     price: "₦1,850,000",
//     oldPrice: "₦2,000,000",
//     image:
//       "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     title: "MacBook Pro M3",
//     price: "₦3,200,000",
//     oldPrice: "₦3,500,000",
//     image:
//       "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     title: "Sony Headphones",
//     price: "₦220,000",
//     oldPrice: "₦280,000",
//     image:
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     title: "Gaming Chair",
//     price: "₦450,000",
//     oldPrice: "₦520,000",
//     image:
//       "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=1200&auto=format&fit=crop",
//   },
// ];

// export default function ProductsGrid() {
//   return (
//     <section className="max-w-7xl mx-auto px-4 mt-10 pb-20">
//       <div className="flex justify-between items-center mb-6">
//         <h2 className="text-3xl font-black">
//           Recommended For You
//         </h2>

//         <button className="font-semibold">
//           View More
//         </button>
//       </div>

//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//         {products.map((product) => (
//           <ProductCard
//             key={product.id}
//             product={product}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }


import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  Loader2,
  Heart,
  Eye,
  ShoppingCart,
  Star,
} from "lucide-react";

import axios from "axios";
import appConfig from "../../config/appConfig";

export default function ProductsGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // SLUGIFY FUNCTION
  const slugify = (text) => {
    return text
      ?.toLowerCase()
      ?.replace(/[^\w ]+/g, "")
      ?.replace(/ +/g, "-");
  };

  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );

      setProducts(
        response.data?.products || response.data || []
      );
    } catch (error) {
      console.log("PRODUCT FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            Recommended For You
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Discover premium products from trusted vendors
          </p>
        </div>

        <button
          className="hidden md:flex px-5 py-3 rounded-xl text-white font-semibold"
          style={{
            background: appConfig.colors.primary,
          }}
        >
          View More
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
        <>
          {/* EMPTY STATE */}
          {products.length === 0 ? (
            <div className="bg-white rounded-3xl py-20 text-center shadow-sm">
              <h2 className="text-2xl font-bold text-gray-700">
                No Products Found
              </h2>

              <p className="text-gray-500 mt-3">
                Products will appear here when available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((product) => {
                const slug = slugify(product?.name);

                return (
                  <div
                    key={product._id}
                    className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100"
                  >
                    {/* IMAGE */}
                    <Link to={`/product/${slug}`}>
                      <div className="relative overflow-hidden">
                        <img
                          src={
                            product?.images?.[0]?.url ||
                            "https://via.placeholder.com/500"
                          }
                          alt={product?.name}
                          className="h-52 md:h-64 w-full object-cover group-hover:scale-105 transition duration-500"
                        />

                        {/* SALE TAG */}
                        {product?.salePrice && (
                          <div
                            className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                            style={{
                              background:
                                appConfig.colors.primary,
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
                          color: appConfig.colors.primary,
                        }}
                      >
                        {product?.category}
                      </p>

                      {/* PRODUCT NAME */}
                      <Link to={`/product/${slug}`}>
                        <h3 className="font-semibold text-sm md:text-base mt-2 text-gray-800 line-clamp-2 hover:text-[#8B1E3F] transition">
                          {product?.name}
                        </h3>
                      </Link>

                      {/* DESCRIPTION */}
                      <p className="text-gray-500 text-xs md:text-sm mt-2 line-clamp-2">
                        {product?.description}
                      </p>

                      {/* PRICE */}
                      <div className="mt-4">
                        <p
                          className="text-lg md:text-2xl font-black"
                          style={{
                            color:
                              appConfig.colors.primary,
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

                      {/* STOCK + RATINGS */}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Stock:
                          <span className="font-bold text-gray-800 ml-1">
                            {product?.stockQuantity}
                          </span>
                        </p>

                        <div className="flex items-center gap-1 text-amber-400">
                          <Star
                            fill="currentColor"
                            size={14}
                          />

                          <span className="text-xs text-gray-700">
                            {product?.ratings || 0}
                          </span>
                        </div>
                      </div>

                      {/* SOLD */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${
                                product?.sold || 0
                              }%`,
                              background:
                                appConfig.colors.primary,
                            }}
                          />
                        </div>

                        <p className="text-[11px] text-gray-500 mt-1">
                          {product?.sold || 0} sold
                        </p>
                      </div>

                      {/* BUTTON */}
                      <button
                        className="w-full py-3 rounded-xl mt-4 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                        style={{
                          background:
                            appConfig.colors.primary,
                        }}
                      >
                        <ShoppingCart size={18} />
                        Add To Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </section>
  );
}