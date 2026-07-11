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
  Sparkles,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────
   Endpoints
   ──────────────────────────────────────────────────────────────────────── */
const PROVIDERS_API = "https://backend-efixit.ereligion.ng/api/provider/providers";
const PRODUCTS_API = "https://api.estores.ng/api/products/all";
const PROVIDER_PROFILE_BASE = "http://localhost:5174";
const PRODUCT_BASE = "https://estores.estores.ng/product";

/* ────────────────────────────────────────────────────────────────────────
   Small helpers — kept defensive since both APIs return fairly loose shapes
   ──────────────────────────────────────────────────────────────────────── */
const money = (n) =>
  n == null || n === 0 ? "Contact for price" : `₦${Number(n).toLocaleString("en-NG")}`;

const initials = (a, b) => `${a?.[0] || ""}${b?.[0] || ""}`.toUpperCase();

const getProviderImage = (p) =>
  p.profilePicture || p.providerProfile?.gallery?.[0]?.url || null;

const getProviderBusinessName = (p) =>
  p.providerProfile?.businessName || `${p.firstName} ${p.lastName}`;

const getProviderPrice = (p) => p.providerProfile?.services?.[0]?.price ?? null;

const getProviderText = (p) =>
  [
    p.providerProfile?.businessName,
    p.firstName,
    p.lastName,
    ...(p.providerProfile?.specialties || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

// Product shape varies a fair bit across the estores catalog, so try a
// handful of common field names before giving up.
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
const getProductBrand = (prod) =>
  prod.seller?.businessProfile?.businessName || prod.brand || prod.seller?.businessName || "";
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

const CATEGORY_KEYWORDS = {
  All: [],
  "Hair Styling": ["hair", "braid", "weave", "wig", "loc", "barb"],
  "Makeup Artistry": ["makeup", "mua", "glam"],
  "Nails & Spa": ["nail", "manicure", "pedicure", "spa", "massage"],
  Skincare: ["skin", "facial", "glow", "derma"],
  Bridal: ["bridal", "wedding"],
};

/* ────────────────────────────────────────────────────────────────────────
   Reusable bits
   ──────────────────────────────────────────────────────────────────────── */
function SkeletonCard({ tall = true }) {
  return (
    <div
      className={`rounded-2xl border border-[#E8E0D5] bg-gradient-to-r from-[#F1EBE2] via-[#FAF7F2] to-[#F1EBE2] bg-[length:400%_100%] animate-[shimmer_1.6s_ease_infinite] ${
        tall ? "h-72" : "h-64"
      }`}
    />
  );
}

function StatusBlock({ icon: Icon = AlertTriangle, title, message, onRetry }) {
  return (
    <div className="col-span-full flex flex-col items-center text-center gap-2 py-14 text-[#8A7C6E]">
      <Icon size={26} className="text-[#2B1B12]" />
      <h3 className="font-serif text-lg text-[#1C140F]" style={{ fontFamily: "'Fraunces', serif" }}>
        {title}
      </h3>
      <p className="text-sm max-w-xs">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-2 px-5 py-2 rounded-full bg-[#1C140F] text-[#F8F4EE] text-sm font-semibold hover:bg-black transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}

function ProviderCard({ p, index }) {
  const img = getProviderImage(p);
  const price = getProviderPrice(p);
  const href = `${PROVIDER_PROFILE_BASE}/providers/${encodeURIComponent(p.email)}`;

  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay: index * 0.06 }}
      className="group block rounded-2xl overflow-hidden bg-white border border-[#E8E0D5] hover:border-[#C9A876] hover:shadow-xl transition-all duration-300"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-[#F1EBE2]">
        {img ? (
          <img
            src={img}
            alt={getProviderBusinessName(p)}
            className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl font-semibold text-[#8A7C6E]" style={{ fontFamily: "'Fraunces', serif" }}>
            {initials(p.firstName, p.lastName)}
          </div>
        )}

        {index === 0 && (
          <span className="absolute top-3 left-3 flex items-center gap-1 bg-[#1C140F]/85 text-[#F8F4EE] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Sparkles size={10} /> Trending
          </span>
        )}

        <span
          className="absolute bottom-3 right-3 bg-white/95 text-[#1C140F] text-[11px] font-semibold px-2 py-1 rounded-md shadow-sm"
          style={{ fontFamily: "'IBM Plex Mono', monospace" }}
        >
          {money(price)}
        </span>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[#1C140F] text-[15px] leading-snug truncate" style={{ fontFamily: "'Fraunces', serif" }}>
          {getProviderBusinessName(p)}
        </h3>
        <p className="text-xs text-[#8A7C6E] mt-1">
          by {p.firstName} {p.lastName}
        </p>
        {p.averageRating > 0 && (
          <div className="flex items-center gap-1 mt-2 text-xs text-[#1C140F]">
            <Star size={12} fill="#C9A876" stroke="#C9A876" />
            <span className="font-medium">{p.averageRating.toFixed(1)}</span>
            <span className="text-[#8A7C6E]">({p.reviews?.length || 0})</span>
          </div>
        )}
      </div>
    </motion.a>
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
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-[#F1EBE2] border border-[#E8E0D5] group-hover:border-[#C9A876] transition-colors">
        {img ? (
          <img
            src={img}
            alt={getProductName(prod)}
            className="w-full h-full object-cover group-hover:scale-[1.05] transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#8A7C6E]">
            <ImageOff size={22} />
          </div>
        )}
      </div>
      <div className="pt-3">
        <h4 className="text-sm font-semibold text-[#1C140F] truncate">{getProductName(prod)}</h4>
        {getProductBrand(prod) && (
          <p className="text-xs text-[#8A7C6E] mt-0.5 truncate">{getProductBrand(prod)}</p>
        )}
        <p
          className="text-xs font-semibold text-[#1C140F] mt-1"
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
export default function BeautyMarketplace() {
  const [providers, setProviders] = useState([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [providersError, setProvidersError] = useState(null);

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState(null);

  const [activeCategory, setActiveCategory] = useState("All");
  const [menuOpen, setMenuOpen] = useState(false);

  const servicesRef = useRef(null);
  const productsRef = useRef(null);
  const scrollTo = (ref) => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const fetchProviders = async () => {
    setLoadingProviders(true);
    setProvidersError(null);
    try {
      const res = await fetch(PROVIDERS_API);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load professionals");
      const beauty = (json.data || []).filter(
        (p) => p.providerProfile?.serviceType?.toLowerCase() === "beauty"
      );
      setProviders(beauty);
    } catch (err) {
      setProvidersError(err.message || "Something went wrong loading professionals");
    } finally {
      setLoadingProviders(false);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const res = await fetch(PRODUCTS_API);
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      if (!json.success) throw new Error(json.message || "Failed to load products");
      const beauty = (json.products || []).filter((prod) =>
        getProductCategory(prod).toLowerCase().includes("beauty")
      );
      setProducts(beauty);
    } catch (err) {
      setProductsError(err.message || "Something went wrong loading products");
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProviders();
    fetchProducts();
  }, []);

  const filteredProviders = useMemo(() => {
    if (activeCategory === "All") return providers;
    const keywords = CATEGORY_KEYWORDS[activeCategory] || [];
    return providers.filter((p) => {
      const text = getProviderText(p);
      return keywords.some((k) => text.includes(k));
    });
  }, [providers, activeCategory]);

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#1C140F]" style={{ fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,500&family=Manrope:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
        @keyframes shimmer { 0% { background-position: 100% 50%; } 100% { background-position: 0 50%; } }
        html { scroll-behavior: smooth; }
      `}</style>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      {/* <header className="sticky top-0 z-30 bg-[#F8F4EE]/90 backdrop-blur-md border-b border-[#E8E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <span
            className="text-xl sm:text-2xl font-semibold tracking-tight"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Busibody
          </span>

          <nav className="hidden md:flex items-center gap-9 text-sm font-medium tracking-wide">
            {[
              ["Home", "#"],
              ["Services", "#services-section"],
              ["Products", "#products-section"],
              ["About", "#"],
              ["Contact", "#"],
            ].map(([label, href]) => (
              <a key={label} href={href} className="text-[#3B2A20] hover:text-[#1C140F] transition-colors">
                {label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="hidden sm:flex p-2 text-[#3B2A20] hover:text-[#1C140F] transition-colors" aria-label="Wishlist">
              <Heart size={19} />
            </button>
            <button className="hidden sm:flex p-2 text-[#3B2A20] hover:text-[#1C140F] transition-colors" aria-label="Bag">
              <ShoppingBag size={19} />
            </button>
            <button className="hidden sm:flex p-2 text-[#3B2A20] hover:text-[#1C140F] transition-colors" aria-label="Account">
              <User size={19} />
            </button>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="md:hidden p-2 text-[#1C140F]"
              aria-label="Menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t border-[#E8E0D5] bg-[#F8F4EE] px-5 py-4 flex flex-col gap-4 text-sm font-medium">
            {["Home", "Services", "Products", "About", "Contact"].map((label) => (
              <a key={label} href="#" onClick={() => setMenuOpen(false)} className="text-[#3B2A20]">
                {label}
              </a>
            ))}
            <div className="flex items-center gap-5 pt-2 border-t border-[#E8E0D5]">
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
              "radial-gradient(circle at 20% 20%, rgba(201,168,118,0.25), transparent 55%), radial-gradient(circle at 80% 75%, rgba(201,168,118,0.15), transparent 45%), linear-gradient(135deg, #241811 0%, #140D08 60%, #0D0906 100%)",
          }}
        >
          {/* subtle texture */}
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
              className="text-[#D8C4A0] text-[11px] sm:text-xs tracking-[0.25em] uppercase font-semibold mb-4"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Discover professionals tailored to your unique style
            </p>
            <h1
              className="text-white text-[2.1rem] leading-[1.1] sm:text-5xl md:text-6xl font-semibold mb-4"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              Elevate Your <em className="italic text-[#D8C4A0]">Beauty</em> Experience
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-md mx-auto mb-8">
              Where talent, convenience, and craft come together in your community — book trusted
              beauty professionals and shop artisan essentials in one place.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => scrollTo(servicesRef)}
                className="w-full sm:w-auto px-7 py-3 border border-white/70 text-white text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-white hover:text-[#1C140F] transition-colors"
              >
                Explore Services
              </button>
              <button
                onClick={() => scrollTo(productsRef)}
                className="w-full sm:w-auto px-7 py-3 bg-[#D8C4A0] text-[#1C140F] text-xs font-semibold tracking-widest uppercase rounded-full hover:bg-white transition-colors"
              >
                Shop Products
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
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-full text-sm font-medium border transition-colors shrink-0 shadow-sm ${
                activeCategory === cat
                  ? "bg-[#1C140F] border-[#1C140F] text-white"
                  : "bg-white border-[#E8E0D5] text-[#3B2A20] hover:border-[#C9A876]"
              }`}
            >
              {cat}
            </button>
          ))}
          <button className="ml-auto shrink-0 p-2.5 rounded-full bg-white border border-[#E8E0D5] text-[#3B2A20] hover:border-[#C9A876] transition-colors">
            <SlidersHorizontal size={16} />
          </button>
        </div>
      </div>

      {/* ── Trending services ─────────────────────────────────────────── */}
      <section id="services-section" ref={servicesRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 sm:pt-16">
        <div className="flex items-end justify-between mb-7">
          <div>
            <p
              className="text-[11px] tracking-[0.2em] uppercase text-[#C9A876] font-semibold mb-1.5"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              Curated professionals
            </p>
            <h2 className="text-2xl sm:text-3xl font-semibold" style={{ fontFamily: "'Fraunces', serif" }}>
              Trending Services
            </h2>
          </div>
          <a href="#" className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-[#3B2A20] hover:text-[#1C140F] transition-colors">
            View All Services <ArrowRight size={15} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {loadingProviders ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
          ) : providersError ? (
            <StatusBlock title="Couldn't load professionals" message={providersError} onRetry={fetchProviders} />
          ) : filteredProviders.length === 0 ? (
            <StatusBlock
              icon={Sparkles}
              title="No beauty professionals here yet"
              message="Try a different category, or check back soon as more providers join."
            />
          ) : (
            filteredProviders.slice(0, 6).map((p, i) => <ProviderCard key={p._id} p={p} index={i} />)
          )}
        </div>
      </section>

      {/* ── Boutique products ─────────────────────────────────────────── */}
      <section id="products-section" ref={productsRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-20 sm:pb-28">
        <div className="text-center mb-10">
          <p
            className="text-[11px] tracking-[0.2em] uppercase text-[#C9A876] font-semibold mb-1.5"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            The boutique
          </p>
          <h2 className="text-2xl sm:text-3xl font-semibold mb-2" style={{ fontFamily: "'Fraunces', serif" }}>
            Featured Products
          </h2>
          <p className="text-sm text-[#8A7C6E] max-w-sm mx-auto">
            Handpicked essentials from artisan makers and renowned labels
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-9">
          {loadingProducts ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} tall={false} />)
          ) : productsError ? (
            <StatusBlock title="Couldn't load products" message={productsError} onRetry={fetchProducts} />
          ) : products.length === 0 ? (
            <StatusBlock
              icon={ShoppingBag}
              title="No beauty products just yet"
              message="Our boutique sellers are still stocking this category — check back soon."
            />
          ) : (
            products.slice(0, 8).map((prod, i) => <ProductCard key={prod._id} prod={prod} index={i} />)
          )}
        </div>

        {!loadingProducts && !productsError && products.length > 0 && (
          <div className="flex justify-center mt-10 sm:hidden">
            <a
              href="#"
              className="flex items-center gap-1.5 text-sm font-semibold text-[#1C140F] border-b border-[#1C140F] pb-0.5"
            >
              View all products <ArrowRight size={14} />
            </a>
          </div>
        )}
      </section>
    </div>
  );
}