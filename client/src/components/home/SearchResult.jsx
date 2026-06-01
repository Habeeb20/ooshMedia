import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Loader2, Heart, Eye, Star, ShoppingCart } from "lucide-react";
import axios from "axios";
import appConfig from "../../config/appConfig";


export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const slugify = (text) => {
    return text
      ?.toLowerCase()
      ?.replace(/[^\w ]+/g, "")
      ?.replace(/ +/g, "-");
  };

  useEffect(() => {
    const searchProducts = async () => {
      if (!query) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
        );

        const allProducts = response.data?.products || response.data || [];

        const filtered = allProducts.filter((product) =>
          product?.name?.toLowerCase().includes(query.toLowerCase()) ||
          product?.description?.toLowerCase().includes(query.toLowerCase()) ||
          product?.category?.toLowerCase().includes(query.toLowerCase())
        );

        setProducts(filtered);
      } catch (error) {
        console.log("Search Error:", error);
      } finally {
        setLoading(false);
      }
    };

    searchProducts();
  }, [query]);

  return (
    <section className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">
          Search Results for: <span className="text-[#8B1E3F]">"{query}"</span>
        </h1>
        <p className="text-gray-500 mt-1">{products.length} products found</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin" size={45} color={appConfig.colors.primary} />
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm">
          <h2 className="text-2xl font-bold text-gray-700">No products found</h2>
          <p className="text-gray-500 mt-3">Try different keywords or browse categories</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const slug = slugify(product.name);
            return (
              <div
                key={product._id}
                className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all group border border-gray-100"
              >
                <Link to={`/product/${slug}`}>
                  <div className="relative overflow-hidden">
                    <img
                      src={product?.images?.[0]?.url || "https://via.placeholder.com/500"}
                      alt={product.name}
                      className="h-52 md:h-64 w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                </Link>

                <div className="p-4">
                  <p className="text-xs font-semibold uppercase" style={{ color: appConfig.colors.primary }}>
                    {product.category}
                  </p>

                  <Link to={`/product/${slug}`}>
                    <h3 className="font-semibold mt-2 line-clamp-2 hover:text-[#8B1E3F]">
                      {product.name}
                    </h3>
                  </Link>

                  <div className="mt-4">
                    <p className="text-2xl font-black" style={{ color: appConfig.colors.primary }}>
                      ₦{(product.salePrice || product.price).toLocaleString()}
                    </p>
                  </div>

                  <Link
                    to={`/product/${slug}`}
                    className="w-full mt-4 py-3 rounded-2xl text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
                    style={{ background: appConfig.colors.primary }}
                  >
                    <ShoppingCart size={18} />
                    View Product
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}