import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  SlidersHorizontal,
  ArrowRight,
  Star,
  AlertTriangle,
  ImageOff,
  Leaf,
  BadgeCheck,
  MapPin,
  Package,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   Endpoint — single source of truth. Farmers are derived client-side from
   the `seller` object already embedded on each herbal product, so there's
   no second network call needed.
   ──────────────────────────────────────────────────────────────────────── */
const PRODUCTS_API = "https://api.estores.ng/api/products/all";
const PRODUCT_BASE = "https://estores.estores.ng/product";

/* ────────────────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────────────────── */
const money = (n) =>
  n == null || n === 0 ? "Contact for price" : `₦${Number(n).toLocaleString("en-NG")}`;

const initials = (a, b) => `${a?.[0] || ""}${b?.[0] || ""}`.toUpperCase();

// A handful of fields in this schema (entityCategory, openingHours) have
// shown up heavily double/triple-escaped in real payloads — this guards the
// UI from ever rendering that raw JSON-looking garbage to a customer.
const isCleanString = (s) =>
  typeof s === "string" && s.trim().length > 0 && !/[\\[\]{}]/.test(s) && s.length < 60;

const getProductImage = (prod) => {
  const img =
    prod.images?.[0]?.url ||
    (typeof prod.images?.[0] === "string" ? prod.images[0] : null) ||
    prod.image ||
    prod.thumbnail ||
    prod.gallery?.[0]?.url ||
    prod.coverImage ||
    null;
  return img;
};
const getProductName = (prod) => prod.name || prod.title || prod.productName || "Untitled item";
const getProductPrice = (prod) =>
  prod.price ?? prod.sellingPrice ?? prod.amount ?? prod.unitPrice ?? null;
const getProductCategory = (prod) => {
  const raw =
    prod.category?.name ||
    prod.category ||
    prod.productCategory?.name ||
    prod.productCategory ||
    prod.categoryName ||
    "";
  return typeof raw === "string" ? raw : "";
};
const getProductText = (prod) =>
  [getProductName(prod), prod.description, getProductCategory(prod)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

// ── Farmer (seller) helpers — derived from userSchema.businessProfile ────
const getFarmerName = (seller) =>
  seller?.businessProfile?.businessName ||
  [seller?.firstName, seller?.lastName].filter(Boolean).join(" ") ||
  "Herbal Farmer";

const getFarmerImage = (seller) => {
  const img = seller?.businessProfile?.gallery?.find((g) => (g.type || "image") === "image");
  return img?.url || seller?.profilePicture || null;
};

const getFarmerAddress = (seller) => seller?.businessProfile?.businessAddress || "";

const getFarmerRating = (seller) => {
  const reviews = seller?.businessProfile?.reviews || [];
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
  return sum / reviews.length;
};

const getFarmerCategories = (seller) =>
  (seller?.businessProfile?.entityCategory || []).filter(isCleanString).slice(0, 2);

const CATEGORY_KEYWORDS = {
  All: [],
  "Teas & Infusions": ["tea", "infusion", "brew"],
  "Tinctures & Extracts": ["tincture", "extract", "essence"],
  "Skincare & Oils": ["oil", "balm", "skincare", "cream"],
  "Spices & Roots": ["spice", "root", "ginger", "turmeric"],
  Supplements: ["supplement", "capsule", "powder", "vitamin"],
};

/* ────────────────────────────────────────────────────────────────────────
   Reusable bits
   ──────────────────────────────────────────────────────────────────────── */
function SkeletonCard({ tall = true }) {
  return (
    <div
      className={`rounded-2xl border border-[#DCE6D6] bg-gradient-to-r from-[#ECF1E7] via-[#F6F8F3] to-[#ECF1E7] bg-[length:400%_100%] animate-[shimmer_1.6s_ease_infinite] ${
        tall ? "h-72" : "h-64"
      }`}
    />
  );
}

function StatusBlock({ icon: Icon = AlertTriangle, title, message, onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center text-center gap-2 py-14 text-[#7C8577]">
      <Icon size={26} className="text-[#16241C]" />
      <h3 className="font-serif text-lg text-[#14201A]" style={{ fontFamily: "'Fraunces', serif" }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2 rounded-full bg-[#16241C] text-[#F5F7F1] text-sm font-semibold hover:bg-black transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function FarmerCard({ seller, productCount, index, active, onSelect }) {
  const img = getFarmerImage(seller);
  const rating = getFarmerRating(seller);
  const categories = getFarmerCategories(seller);

  return (
    <motion.button
      type="button"
      onClick={() => onSelect(seller._id)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className={`group block text-left rounded-2xl overflow-hidden bg-white border transition-all duration-300 ${
        active
          ? "border-[#4F7A52] ring-2 ring-[#4F7A52]/30 shadow-lg"
          : "border-[#DCE6D6] hover:border-[#7FA87A] hover:shadow-xl"
      }`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#ECF1E7]">
        {img ? (
          <img
            src={img}
            alt={getFarmerName(seller)}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center text-2xl font-semibold text-[#7C8577]"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {initials(seller.firstName, seller.lastName)}
          </div>
        )}

        {index === 0 && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#16241C]/85 text-[#F5F7F1] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Leaf size={10} /> Trending
          </span>
        )}

        <span
          className="absolute bottom-3 right-3 bg-white/95 text-[#14201A] text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm flex items-center gap-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          <Package size={11} /> {productCount}
        </span>
      </div>

      <div className="p-4">
        <div className="flex items-center gap-1.5">
          <h3
            className="font-semibold text-[#14201A] text-[15px] leading-snug truncate"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {getFarmerName(seller)}
          </h3>
          {seller?.businessProfile?.verified && (
            <BadgeCheck size={15} className="text-[#4F7A52] shrink-0" />
          )}
        </div>

        {getFarmerAddress(seller) && (
          <p className="flex items-center gap-1 text-xs text-[#7C8577] mt-1 truncate">
            <MapPin size={11} className="shrink-0" />
            {getFarmerAddress(seller)}
          </p>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {categories.map((c) => (
              <span
                key={c}
                className="bg-[#ECF1E7] text-[#4F7A52] text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {rating != null && (
          <div className="flex items-center gap-1 mt-2 text-xs text-[#14201A]">
            <Star size={12} fill="#7FA87A" stroke="#7FA87A" />
            <span className="font-medium">{rating.toFixed(1)}</span>
            <span className="text-[#7C8577]">({seller.businessProfile.reviews.length})</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}

function ProductCard({ prod, index }) {
  const img = getProductImage(prod);
  const slug = prod.slug || prod._id;
  const href = `${PRODUCT_BASE}/${encodeURIComponent(slug)}`;

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      className="group block"
    >
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#ECF1E7] border border-[#DCE6D6] group-hover:border-[#7FA87A] transition-colors">
        {img ? (
          <img
            src={img}
            alt={getProductName(prod)}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#7C8577]">
            <ImageOff size={22} />
          </div>
        )}
      </div>
      <div className="pt-3">
        <h4 className="text-sm font-semibold text-[#14201A] truncate">{getProductName(prod)}</h4>
        {getFarmerName(prod.seller) && (
          <p className="text-xs text-[#7C8577] mt-0.5 truncate">by {getFarmerName(prod.seller)}</p>
        )}
        <p
          className="text-xs font-semibold text-[#14201A] mt-1"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {money(getProductPrice(prod))}
        </p>
      </div>
    </motion.a>
  );
}

/* ────────────────────────────────────────────────────────────────────────
   Main page
   ──────────────────────────────────────────────────────────────────────── */
export default function HerbalMarketplace() {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const farmersRef = useRef(null);
  const productsRef = useRef(null);
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load products");
      const herbal = (json.products || []).filter((prod) =>
        getProductCategory(prod).toLowerCase().includes("herbal")
      );
      setAllProducts(herbal);
    } catch (err) {
      setError(err.message || "Something went wrong loading the herbal marketplace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Category pills filter the herbal products by keyword; farmers are then
  // derived from whatever's left, so picking a category naturally narrows
  // both sections together.
  const categoryFilteredProducts = useMemo(() => {
    if (activeCategory === "All") return allProducts;
    const keywords = CATEGORY_KEYWORDS[activeCategory] || [];
    return allProducts.filter((prod) => {
      const text = getProductText(prod);
      return keywords.some((k) => text.includes(k));
    });
  }, [allProducts, activeCategory]);

  const farmers = useMemo(() => {
    const map = new Map();
    categoryFilteredProducts.forEach((prod) => {
      const seller = prod.seller;
      if (!seller?._id) return;
      if (!map.has(seller._id)) {
        map.set(seller._id, { seller, productCount: 1 });
      } else {
        map.get(seller._id).productCount += 1;
      }
    });
    return Array.from(map.values());
  }, [categoryFilteredProducts]);

  const visibleProducts = useMemo(() => {
    if (!selectedFarmerId) return categoryFilteredProducts;
    return categoryFilteredProducts.filter((prod) => prod.seller?._id === selectedFarmerId);
  }, [categoryFilteredProducts, selectedFarmerId]);

  const selectedFarmerName = useMemo(() => {
    if (!selectedFarmerId) return null;
    return farmers.find((f) => f.seller._id === selectedFarmerId)?.seller;
  }, [selectedFarmerId, farmers]);

  const handleSelectFarmer = (id) => {
    setSelectedFarmerId((prev) => (prev === id ? null : id));
    scrollTo(productsRef);
  };

  return (
    <div className="min-h-screen bg-[#F5F7F1] text-[#14201A]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        @keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      {/* <header className="sticky top-0 z-30 bg-[#F5F7F1]/90 backdrop-blur-md border-b border-[#DCE6D6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <span
            className="flex items-center gap-1.5 text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            <Leaf size={20} className="text-[#4F7A52]" />
            Verdure
          </span>

          <nav className="hidden md:flex items-center gap-9 text-sm font-medium tracking-wide">
            {[
              ["Home", "#"],
              ["Farmers", "#farmers-section"],
              ["Products", "#products-section"],
              ["About", "#"],
              ["Contact", "#"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-[#3B4A3D] hover:text-[#14201A] transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:flex p-2 text-[#3B4A3D] hover:text-[#14201A] transition-colors" aria-label="Wishlist">
              <Heart size={19} />
            </button>
            <button className="hidden sm:flex p-2 text-[#3B4A3D] hover:text-[#14201A] transition-colors" aria-label="Bag">
              <ShoppingBag size={19} />
            </button>
            <button className="hidden sm:flex p-2 text-[#3B4A3D] hover:text-[#14201A] transition-colors" aria-label="Account">
              <User size={19} />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-[#14201A]"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#DCE6D6] bg-[#F5F7F1] px-5 py-4 flex flex-col gap-4 text-sm font-medium">
            {["Home", "Farmers", "Products", "About", "Contact"].map((label) => (
              <a key={label} href="#" onClick={() => setMenuOpen(false)} className="text-[#3B4A3D]">
                {label}
              </a>
            ))}
            <div className="flex items-center gap-5 pt-2 border-t border-[#DCE6D6]">
              <Heart size={18} />
              <ShoppingBag size={18} />
              <User size={18} />
            </div>
          </div>
        )}
      </header> */}

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div
          className="relative h-[440px] sm:h-[520px] md:h-[600px] flex items-end sm:items-center justify-center px-5"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(127,168,122,0.28), transparent 55%), radial-gradient(circle at 80% 75%, rgba(127,168,122,0.16), transparent 45%), linear-gradient(135deg, #16241C 0%, #0E1712 60%, #090D0A 100%)",
          }}
        >
          <div
            className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            }}
          />

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="relative z-10 max-w-2xl mx-auto text-center pb-10 sm:pb-0"
          >
            <p
              className="text-[#B7D2AF] text-[11px] sm:text-xs tracking-[0.25em] uppercase font-semibold mb-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Discover farmers tailored to your wellness needs
            </p>
            <h1
              className="text-white text-[2.1rem] leading-[1.1] sm:text-5xl md:text-6xl font-semibold mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Nourish Naturally, <em className="italic text-[#B7D2AF]">Rooted</em> in Trust
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto mb-8">
              Where soil, tradition, and craft come together — meet the farmers behind your
              herbal remedies and shop what they grow, straight from source.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => scrollTo(farmersRef)}
                className="w-full sm:w-auto px-7 py-3 border border-white/70 text-white text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-white hover:text-[#14201A] transition-colors"
              >
                Meet Our Farmers
              </button>
              <button
                onClick={() => scrollTo(productsRef)}
                className="w-full sm:w-auto px-7 py-3 bg-[#B7D2AF] text-[#14201A] text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-white transition-colors"
              >
                Shop Herbal Products
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Category pills ────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-7 relative z-10">
        <div className="flex items-center gap-2.5 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {Object.keys(CATEGORY_KEYWORDS).map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setSelectedFarmerId(null);
              }}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium border transition-colors shrink-0 shadow-sm ${
                activeCategory === cat
                  ? "bg-[#16241C] border-[#16241C] text-white"
                  : "bg-white border-[#DCE6D6] text-[#3B4A3D] hover:border-[#7FA87A]"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="ml-auto shrink-0 p-2.5 rounded-full bg-white border border-[#DCE6D6] text-[#3B4A3D] hover:border-[#7FA87A] transition-colors">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ── Trending farmers ───────────────────────────────────────────── */}
      <section id="farmers-section" ref={farmersRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p
              className="text-[11px] tracking-[0.2em] uppercase text-[#7FA87A] font-semibold mb-1.5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Rooted in trust
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
              Meet Our Farmers
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <StatusBlock title="Couldn't load farmers" message={error} onRetry={fetchProducts} />
          ) : farmers.length === 0 ? (
            <StatusBlock
              icon={Leaf}
              title="No herbal farmers here yet"
              message="Try a different category, or check back soon as more farmers join."
            />
          ) : (
            farmers
              .slice(0, 6)
              .map(({ seller, productCount }, i) => (
                <FarmerCard
                  key={seller._id}
                  seller={seller}
                  productCount={productCount}
                  index={i}
                  active={selectedFarmerId === seller._id}
                  onSelect={handleSelectFarmer}
                />
              ))
          )}
        </div>
      </section>

      {/* ── Herbal products ────────────────────────────────────────────── */}
      <section id="products-section" ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 sm:pb-28">
        <div className="text-center mb-10">
          <p
            className="text-[11px] tracking-[0.2em] uppercase text-[#7FA87A] font-semibold mb-1.5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            The harvest
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            Featured Products
          </h2>
          <p className="text-sm text-[#7C8577] max-w-sm mx-auto">
            Handpicked herbal remedies and botanicals, grown and prepared by real farmers
          </p>

          {selectedFarmerName && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="text-xs font-semibold text-[#14201A] bg-[#ECF1E7] px-3 py-1.5 rounded-full">
                Showing products from {getFarmerName(selectedFarmerName)}
              </span>
              <button
                onClick={() => setSelectedFarmerId(null)}
                className="text-xs font-semibold text-[#4F7A52] underline underline-offset-2"
              >
                Clear
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} tall={false} />)
          ) : error ? (
            <StatusBlock title="Couldn't load products" message={error} onRetry={fetchProducts} />
          ) : visibleProducts.length === 0 ? (
            <StatusBlock
              icon={ShoppingBag}
              title="No herbal products just yet"
              message="Our farmers are still stocking this category — check back soon."
            />
          ) : (
            visibleProducts.slice(0, 8).map((prod, i) => <ProductCard key={prod._id} prod={prod} index={i} />)
          )}
        </div>
      </section>
    </div>
  );
}