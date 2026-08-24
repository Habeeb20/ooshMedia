import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { ChevronRight } from "lucide-react";
import appConfig from "../../../config/AppConfig";


const slugify = (text) =>
  text
    ?.toLowerCase()
    ?.replace(/[^\w ]+/g, "")
    ?.replace(/ +/g, "-");

export default function CarPartsCategoryGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllBrands, setShowAllBrands] = useState(false);

  useEffect(() => {
    const fetchParts = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
        );
        const allProducts = response.data?.products || response.data || [];

        const carParts = allProducts.filter(
          (p) =>
            p?.category?.toLowerCase() === "automotive" &&
            p?.part === true &&
            p?.whatPart === "Car Parts"
        );

        setProducts(carParts);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchParts();
  }, []);

  // Group by subCategoryPart (e.g. Engine, Gear Boxes, Lamps...)
  const categories = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const key = p?.subCategoryPart || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return Object.entries(map).map(([name, items]) => ({
      name,
      count: items.length,
      thumbnail: items[0]?.images?.[0]?.url,
    }));
  }, [products]);

  // Group by maker (e.g. Toyota, Honda...)
  const brands = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      const key = p?.maker || "Other";
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });
    return Object.entries(map).map(([name, items]) => ({
      name,
      count: items.length,
      thumbnail: items[0]?.images?.[0]?.url,
    }));
  }, [products]);

  const visibleCategories = showAllCategories ? categories : categories.slice(0, 16);
  const visibleBrands = showAllBrands ? brands : brands.slice(0, 16);

  if (loading) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 mt-10 space-y-16">
      {/* ================= CATEGORIES ================= */}
      <section>
        <div className="text-center mb-8">
          <p
            className="text-xs md:text-sm font-semibold uppercase tracking-wider"
            style={{ color: appConfig.colors.primary }}
          >
            Get the best of auto spare parts here. Buy in peace and not in pieces!
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleCategories.map((cat) => (
            <Link
              key={cat.name}
              to={`/category/automotive/part/${slugify(cat.name)}`}
              className="group relative h-40 rounded-2xl overflow-hidden"
            >
              <img
                src={cat.thumbnail || "https://via.placeholder.com/400x300"}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1526]/90 via-[#0B1526]/20 to-transparent" />
              <div className="absolute bottom-3 left-4 text-white">
                <p className="font-bold text-sm md:text-base">{cat.name}</p>
                <p
                  className="text-xs font-semibold mt-0.5"
                  style={{ color: appConfig.colors.primary }}
                >
                  {cat.count} products
                </p>
              </div>
            </Link>
          ))}
        </div>

        {categories.length > 16 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllCategories((s) => !s)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              {showAllCategories ? "Show Less" : "More Categories"}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {categories.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">
            No car part categories available yet.
          </p>
        )}
      </section>

      {/* ================= JOIN LISTINGS BANNER ================= */}
      <section
        className="rounded-3xl px-6 md:px-10 py-12"
        style={{ background: "#0B1526" }}
      >
        <div className="text-center">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: appConfig.colors.primary }}
          >
            Get Listed
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-2">
            Join Listings
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            Are you a spare parts dealer or mechanic? Here's your chance to become famous.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 max-w-4xl mx-auto">
          {[
            {
              icon: "📈",
              title: "Dealers",
              desc: "Join our online community of spare part dealers and get listed on our website for a small fee.",
            },
            {
              icon: "🔧",
              title: "Mechanics",
              desc: "Be a part of our list of certified mechanics. Get listed on our website for a small fee.",
            },
            {
              icon: "👤",
              title: "Customers",
              desc: "For more information on our spare products, join our list of mail subscriptions to get daily updates.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl p-5"
              style={{ background: "#111E33" }}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3"
                style={{ background: `${appConfig.colors.primary}30` }}
              >
                {item.icon}
              </div>
              <p className="text-white font-bold text-sm">{item.title}</p>
              <p className="text-gray-400 text-xs mt-2 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <button
            className="px-6 py-3 rounded-xl font-bold text-sm text-white"
            style={{ background: appConfig.colors.primary }}
          >
            Sign Up Now →
          </button>
        </div>
      </section>

      {/* ================= BRANDS ================= */}
      <section>
        <div className="text-center mb-8">
          <p
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: appConfig.colors.primary }}
          >
            Brands
          </p>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mt-1">
            Popular Brands
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Get price and buy auto spare parts of any brand of your choice.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {visibleBrands.map((brand) => (
            <Link
              key={brand.name}
              to={`/category/automotive/brand/${slugify(brand.name)}`}
              className="group relative h-32 rounded-2xl overflow-hidden"
            >
              <img
                src={brand.thumbnail || "https://via.placeholder.com/400x300"}
                alt={brand.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B1526]/90 via-[#0B1526]/10 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-sm">{brand.name}</p>
              </div>
            </Link>
          ))}
        </div>

        {brands.length > 16 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowAllBrands((s) => !s)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-gray-300 text-sm font-semibold hover:bg-gray-50 transition"
            >
              {showAllBrands ? "Show Less" : "More Brands"}
              <ChevronRight size={16} />
            </button>
          </div>
        )}

        {brands.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">
            No brands available yet.
          </p>
        )}
      </section>
    </div>
  );
}