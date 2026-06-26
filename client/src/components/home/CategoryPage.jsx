// src/pages/CategoriesPage.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ChevronRight, Search, TrendingUp, Sparkles, ArrowRight,
  Star, Heart, ShoppingBag, Loader2, Grid3x3, Flame
} from "lucide-react";
import axios from "axios";
import appConfig from "../../config/appConfig";
import { productCategories } from "../../categories/productCategories";
// ─── Category definitions ──────────────────────────────────────────────────

const slugify = (text = "") =>
  text.toLowerCase().trim()
    .replace(/[^\w\s&-]/g, "")
    .replace(/[\s&]+/g, "-")
    .replace(/-+/g, "-");

const formatPrice = (n) => {
  if (!n) return "₦0";
  if (n >= 1_000_000) return `₦${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `₦${(n / 1_000).toFixed(0)}K`;
  return `₦${n.toLocaleString()}`;
};

// ─── Mini product card ─────────────────────────────────────────────────────
function MiniProductCard({ product, accent }) {
  const [liked, setLiked] = useState(false);
  const slug = product?.name?.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
  const price = product?.salePrice || product?.price;

  return (
    <Link
      to={`/product/${slug}`}
      className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative overflow-hidden bg-gray-50">
        <img
          src={product?.images?.[0]?.url || "https://via.placeholder.com/300"}
          alt={product?.name}
          className="w-full h-36 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product?.salePrice && (
          <span
            className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ background: accent }}
          >
            SALE
          </span>
        )}
        <button
          onClick={(e) => { e.preventDefault(); setLiked(!liked); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            size={12}
            className={liked ? "fill-red-500 text-red-500" : "text-gray-300"}
          />
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1">
        <p className="text-xs text-gray-400 truncate mb-0.5">{product?.subCategory}</p>
        <p className="text-xs font-semibold text-gray-800 line-clamp-2 leading-tight mb-2 flex-1">
          {product?.name}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-gray-900">{formatPrice(price)}</span>
          <span className="flex items-center gap-0.5 text-[10px] text-amber-500">
            <Star size={10} className="fill-amber-400" />
            {product?.ratings || "4.5"}
          </span>
        </div>
      </div>
    </Link>
  );
}

// ─── Mini product skeleton ─────────────────────────────────────────────────
function MiniSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-36 sm:h-40 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded-full w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3.5 bg-gray-100 rounded-full w-1/3" />
      </div>
    </div>
  );
}

// ─── Category section ──────────────────────────────────────────────────────
function CategorySection({ category, products, loading }) {
  const { id, name, icon, accent, badge, badgeText, subcategories } = category;
  const slugId = id;
  const primaryColor = appConfig?.colors?.primary || "#8B1E3F";

  const displayProducts = products.slice(0, 5);
  const isEmpty = !loading && products.length === 0;

  return (
    <section className="mb-12">
      {/* Section header */}
      <div className="flex items-center justify-between mb-4 gap-3">
        <div className="flex items-center gap-3">
          {/* Icon pill */}
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-sm"
            style={{ background: badge }}
          >
            {icon}
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black text-gray-900 leading-tight">
              {name}
            </h2>
            <p className="text-xs text-gray-400">
              {loading ? "Loading..." : `${products.length} products`}
            </p>
          </div>
        </div>

        <Link
          to={`/category/${slugId}`}
          className="flex items-center gap-1.5 text-sm font-semibold flex-shrink-0 px-3 py-1.5 rounded-xl border transition-all hover:shadow-sm"
          style={{
            color: accent,
            borderColor: badge,
            background: badge,
          }}
        >
          <span className="hidden sm:inline">See all</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Subcategory pills */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1 scrollbar-hide">
        {subcategories?.map((sub) => (
          <Link
            key={sub}
            to={`/category/${slugId}?sub=${encodeURIComponent(sub)}`}
            className="flex-shrink-0 text-xs font-medium px-3 py-1.5 rounded-full border transition-colors hover:shadow-sm"
            style={{
              color: badgeText,
              background: badge,
              borderColor: "transparent",
            }}
          >
            {sub}
          </Link>
        ))}
      </div>

      {/* Products grid */}
      {isEmpty ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-10 text-center">
          <p className="text-sm text-gray-400">No products yet in this category</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {loading
            ? [...Array(5)].map((_, i) => <MiniSkeleton key={i} />)
            : displayProducts.map((p) => (
                <MiniProductCard key={p._id} product={p} accent={accent} />
              ))
          }
          {/* "View more" card */}
          {!loading && products.length > 5 && (
            <Link
              to={`/category/${slugId}`}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 flex flex-col items-center justify-center min-h-[180px] gap-3"
              style={{ background: badge }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110"
                style={{ background: accent }}
              >
                <ArrowRight size={20} className="text-white" />
              </div>
              <div className="text-center px-3">
                <p className="text-sm font-bold" style={{ color: accent }}>
                  +{products.length - 5} more
                </p>
                <p className="text-xs mt-0.5" style={{ color: badgeText }}>
                  View all
                </p>
              </div>
            </Link>
          )}
        </div>
      )}
    </section>
  );
}

// ─── Hero banner ───────────────────────────────────────────────────────────
function HeroBanner({ primaryColor }) {
  return (
    <div
      className="relative overflow-hidden rounded-3xl mb-8 p-6 sm:p-10"
      style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}cc 100%)` }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
      <div className="absolute top-4 right-24 w-16 h-16 rounded-full bg-white/10" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} className="text-orange-300" />
            <span className="text-orange-200 text-xs font-semibold uppercase tracking-wider">
              Shop by Category
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight mb-2">
            Everything you need,<br className="hidden sm:block" />
            <span className="text-white/80"> all in one place</span>
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-md">
            Discover thousands of products across {productCategories?.length} categories from trusted vendors.
          </p>
        </div>
        <div className="flex items-center gap-4 sm:gap-6 flex-shrink-0">
          {[
            { value: "12K+", label: "Products" },
            { value: "500+", label: "Vendors" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-2xl sm:text-3xl font-black text-white">{value}</p>
              <p className="text-xs text-white/50 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Category quick-nav grid ───────────────────────────────────────────────
function CategoryQuickNav() {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Grid3x3 size={16} className="text-gray-400" />
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Browse Categories</h2>
      </div>
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
        {productCategories?.map((cat) => (
          <Link
            key={cat.id}
            to={`/category/${cat.id}`}
            className="group flex flex-col items-center gap-2 p-2 sm:p-3 rounded-2xl border border-gray-100 bg-white hover:border-gray-200 hover:shadow-md transition-all duration-200"
          >
            <div
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center text-xl sm:text-2xl group-hover:scale-110 transition-transform"
              style={{ background: cat.badge }}
            >
              {cat.icon}
            </div>
            <p className="text-[9px] sm:text-[10px] font-semibold text-gray-600 text-center leading-tight line-clamp-2">
              {cat.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── Search bar ────────────────────────────────────────────────────────────
function GlobalSearch({ onSearch, primaryColor }) {
  const [value, setValue] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (value.trim()) navigate(`/search?q=${encodeURIComponent(value.trim())}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm mb-8 focus-within:border-gray-300 transition-colors"
    >
      <Search size={18} className="text-gray-400 flex-shrink-0" />
      <input
        type="text"
        placeholder="Search across all categories..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
      />
      <button
        type="submit"
        className="flex-shrink-0 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all hover:opacity-90 active:scale-95"
        style={{ background: primaryColor }}
      >
        Search
      </button>
    </form>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [productsByCategory, setProductsByCategory] = useState({});
  const [loading, setLoading] = useState(true);
  const primaryColor = appConfig?.colors?.primary || "#8B1E3F";

  useEffect(() => {
    fetchAllProducts();
  }, []);

  const fetchAllProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );

      const all = res.data?.products || res.data || [];

      // Group by category slug
      const grouped = {};
      productCategories?.forEach((cat) => { grouped[cat.id] = []; });

      all.forEach((product) => {
        const catSlug = slugify(product?.category || "");
        if (grouped[catSlug] !== undefined) {
          grouped[catSlug].push(product);
        }
      });

      setProductsByCategory(grouped);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

        {/* Hero */}
        <HeroBanner primaryColor={primaryColor} />

        {/* Global search */}
        <GlobalSearch primaryColor={primaryColor} />

        {/* Quick nav */}
        <CategoryQuickNav />

        {/* Divider */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <TrendingUp size={14} className="text-gray-400" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              All Categories
            </span>
          </div>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Category sections */}
        {productCategories?.map((category) => (
          <CategorySection
            key={category.id}
            category={category}
            products={productsByCategory[category.id] || []}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );
}