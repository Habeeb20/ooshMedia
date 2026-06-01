import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

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
  const { categorySlug } = useParams(); // Get category from URL (e.g., /category/electronics)

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("All Products");

  // SLUGIFY FUNCTION
  const slugify = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s&-]/g, "")     // Keep & and -
      .replace(/[\s&]+/g, "-")       // Replace spaces and & with -
      .replace(/-+/g, "-");          // Remove multiple dashes
  };

  
  // Decode URL slug back to normal text for comparison
  const decodeSlug = (slug) => {
    return decodeURIComponent(slug || "")
      .replace(/-/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  };

  
  // FETCH PRODUCTS
  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );

      let allProducts = response.data?.products || response.data || [];

      // Filter products by category if categorySlug exists
      if (categorySlug) {
        const filteredProducts = allProducts.filter((product) => {
          const productCategorySlug = slugify(product?.category);
          return productCategorySlug === categorySlug;
        });

        setProducts(filteredProducts);

        // Set category name for header
        if (filteredProducts.length > 0) {
          setCategoryName(filteredProducts[0]?.category || "Category");
        } else {
          setCategoryName("No Products Found");
        }
      } else {
        setProducts(allProducts);
        setCategoryName("Recommended For You");
      }
    } catch (error) {
      console.log("PRODUCT FETCH ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [categorySlug]); // Re-fetch when category changes

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10 pb-20">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900">
            {categoryName}
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            {categorySlug
              ? `Showing products in this category`
              : "Discover premium products from trusted vendors"}
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
                No products available in this category at the moment.
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
                              background: appConfig.colors.primary,
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
                            color: appConfig.colors.primary,
                          }}
                        >
                          ₦
                          {(product?.salePrice || product?.price)?.toLocaleString()}
                        </p>

                        {product?.salePrice && (
                          <p className="line-through text-gray-400 text-sm">
                            ₦{product?.price?.toLocaleString()}
                          </p>
                        )}
                      </div>

                      {/* STOCK + RATINGS */}
                      <div className="mt-3 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          Stock:{" "}
                          <span className="font-bold text-gray-800 ml-1">
                            {product?.stockQuantity}
                          </span>
                        </p>

                        <div className="flex items-center gap-1 text-amber-400">
                          <Star fill="currentColor" size={14} />
                          <span className="text-xs text-gray-700">
                            {product?.ratings || 0}
                          </span>
                        </div>
                      </div>

                      {/* SOLD PROGRESS */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${product?.sold || 0}%`,
                              background: appConfig.colors.primary,
                            }}
                          />
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          {product?.sold || 0}% sold
                        </p>
                      </div>
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