

import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";



const lagosMarkets = [
  { id: 1, name: "Ladipo Market", location: "Mushin", knownFor: "Car Spare Parts", description: "The largest auto spare parts market in West Africa.", category: "Auto Parts", emoji: "🔧" },
  { id: 2, name: "Computer Village", location: "Ikeja", knownFor: "Phones, Laptops & Electronics", description: "Nigeria's biggest tech hub for new and fairly used devices.", category: "Electronics & Tech", emoji: "💻" },
  { id: 3, name: "Alaba International Market", location: "Ojo", knownFor: "Electronics & Home Appliances", description: "Massive market for TVs, generators, refrigerators.", category: "Electronics", emoji: "📺" },
  { id: 4, name: "Balogun Market", location: "Lagos Island", knownFor: "Fashion, Clothing & Textiles", description: "Biggest market for Ankara, lace, aso-ebi and fashion.", category: "Fashion", emoji: "👗" },
  { id: 5, name: "Idumota Market", location: "Lagos Island", knownFor: "Textiles & General Goods", description: "Popular for fabrics, clothing and wholesale goods.", category: "Fashion", emoji: "🧵" },
  { id: 6, name: "Mile 12 Market", location: "Mile 12", knownFor: "Foodstuff & Provisions", description: "The largest food market in Lagos.", category: "Foodstuff", emoji: "🥦" },
  { id: 7, name: "Oshodi Market", location: "Oshodi", knownFor: "General Goods & Food", description: "One of the biggest and busiest general markets.", category: "General", emoji: "🛍️" },
  { id: 8, name: "Trade Fair Complex", location: "Badagry Expressway", knownFor: "Building Materials & Wholesale", description: "Huge market for building materials and furniture.", category: "Building Materials", emoji: "🏗️" },
  { id: 9, name: "Tejuosho Market", location: "Yaba", knownFor: "General Goods & Fashion", description: "Popular for clothing and household items.", category: "General", emoji: "🛒" },
  { id: 10, name: "Jankara Market", location: "Lagos Island", knownFor: "Fabrics & Household Items", description: "Known for affordable fabrics and household goods.", category: "Fashion", emoji: "🎀" },
];

const VISIBLE_MARKETS = 6;

const SORT_OPTIONS = [
  { value: "newest", label: "Newest Arrivals" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "top_rated", label: "Top Rated" },
];

function slugify(name) {
  return name?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-");
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

function effectivePrice(p) {
  return p.salePrice && p.salePrice < p.price ? p.salePrice : p.price;
}

/* ── Market "stamp" badge — the page's signature element ── */
function MarketStamp({ emoji, size = "md" }) {
  const dims = size === "lg" ? "w-14 h-14 text-2xl" : size === "sm" ? "w-9 h-9 text-sm" : "w-11 h-11 text-lg";
  return (
    <span
      className={`inline-flex items-center justify-center ${dims} rounded-full border-2 border-dashed border-[#C9A15A]/60 bg-[#F3E4C8]/40 shrink-0 transition-transform duration-300 group-hover:rotate-[18deg]`}
    >
      {emoji}
    </span>
  );
}

function ProductCard({ product, onClick }) {
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const discount = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <div
      onClick={() => onClick(product)}
      className="group bg-white rounded-2xl overflow-hidden border border-[#F1E7DC] cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_32px_rgba(67,15,34,0.15)]"
    >
      <div className="relative aspect-square bg-[#FBF7F2] overflow-hidden">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-4xl bg-[#F3E4C8]/50">📦</div>
        )}

        {isOnSale && (
          <span className="absolute top-2.5 left-2.5 bg-[#B5442E] text-white text-[11px] font-extrabold px-2.5 py-1 rounded-full shadow-sm">
            -{discount}%
          </span>
        )}

        {product.status === "out_of_stock" && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-sm">
            Out of Stock
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 p-3 flex justify-center bg-gradient-to-t from-[#430F22]/90 to-transparent opacity-0 translate-y-2 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0">
          <button className="bg-[#C9A15A] text-[#2B0A16] font-extrabold text-xs tracking-wide px-5 py-2 rounded-full">
            View Details
          </button>
        </div>
      </div>

      <div className="p-3.5 sm:p-4">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[#A67C3D] mb-1">
          {product.category}
        </p>
        <h3 className="font-serif text-sm sm:text-[0.95rem] font-semibold text-[#241014] leading-snug line-clamp-2 mb-1.5 min-h-[2.5em]">
          {product.name}
        </h3>
        {product.seller?.sellerProfile?.market && (
          <p className="text-xs text-[#7A6068] mb-2 truncate">📍 {product.seller.sellerProfile.market}</p>
        )}
        <div className="flex items-center gap-2 mb-1">
          {isOnSale ? (
            <>
              <span className="font-serif text-base font-bold text-[#B5442E]">{formatPrice(product.salePrice)}</span>
              <span className="text-xs text-[#B7A5AB] line-through">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="font-serif text-base font-bold text-[#430F22]">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.ratings > 0 && (
          <div className="text-xs text-[#C9A15A]">
            {"★".repeat(Math.round(product.ratings))}
            {"☆".repeat(5 - Math.round(product.ratings))}
            <span className="text-[#7A6068] ml-1 text-[11px]">({product.sold || 0} sold)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-[#F1E7DC]">
      <div className="aspect-square animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-[#F1E7DC] via-[#E7DACB] to-[#F1E7DC]" />
      <div className="p-4 flex flex-col gap-2.5">
        <div className="h-3 w-1/2 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-[#F1E7DC] via-[#E7DACB] to-[#F1E7DC]" />
        <div className="h-3 w-full rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-[#F1E7DC] via-[#E7DACB] to-[#F1E7DC]" />
        <div className="h-3 w-2/3 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-[#F1E7DC] via-[#E7DACB] to-[#F1E7DC]" />
        <div className="h-3 w-1/3 rounded animate-shimmer bg-[length:200%_100%] bg-gradient-to-r from-[#F1E7DC] via-[#E7DACB] to-[#F1E7DC]" />
      </div>
    </div>
  );
}

function MarketModal({ open, onClose, onSelect, selectedMarket }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-sm flex items-end sm:items-center sm:justify-center animate-[fadeIn_0.18s_ease]"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl max-h-[85vh] sm:max-h-[80vh] overflow-y-auto p-6 sm:p-7 animate-[slideUp_0.22s_ease]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#241014]">All Lagos Markets</h2>
            <p className="text-sm text-[#7A6068] mt-1">Select a market to browse its products</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#FBF7F2] text-[#7A6068] flex items-center justify-center hover:bg-[#F1E7DC] transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
          {lagosMarkets.map((m) => (
            <button
              key={m.id}
              onClick={() => { onSelect(m); onClose(); }}
              className={`group text-left flex gap-3 items-start p-4 rounded-2xl border-2 transition-all duration-150 hover:-translate-y-0.5 ${
                selectedMarket?.id === m.id
                  ? "border-[#430F22] bg-[#F3E4C8]/40"
                  : "border-[#F1E7DC] bg-[#FBF7F2] hover:border-[#C9A15A]"
              }`}
            >
              <MarketStamp emoji={m.emoji} />
              <div className="min-w-0">
                <p className="font-serif font-bold text-sm text-[#241014]">{m.name}</p>
                <p className="text-xs text-[#7A6068] mt-0.5">📍 {m.location}</p>
                <p className="text-xs text-[#7A6068] mt-1 leading-relaxed">{m.knownFor}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Checkbox row used inside the filter panel ── */
function FilterCheckbox({ checked, onChange, label, count, indent }) {
  return (
    <label
      className={`flex items-center justify-between gap-3 py-2 cursor-pointer group ${indent ? "pl-6" : ""}`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span
          className={`w-[18px] h-[18px] rounded-[5px] border-2 flex items-center justify-center shrink-0 transition-colors ${
            checked ? "bg-[#430F22] border-[#430F22]" : "border-[#D9C9B8] bg-white group-hover:border-[#A67C3D]"
          }`}
        >
          {checked && (
            <svg viewBox="0 0 12 10" className="w-2.5 h-2.5" fill="none">
              <path d="M1 5L4.2 8.2L11 1" stroke="#F3E4C8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className={`text-sm truncate ${checked ? "text-[#241014] font-semibold" : "text-[#4A3B40]"}`}>{label}</span>
      </span>
      <input type="checkbox" checked={checked} onChange={onChange} className="sr-only" />
      {typeof count === "number" && (
        <span className="text-[11px] font-bold text-[#A67C3D] bg-[#F3E4C8]/70 rounded-full px-2 py-0.5 shrink-0">{count}</span>
      )}
    </label>
  );
}

function FilterPanel({
  open,
  onClose,
  categoryMap,
  selectedCategories,
  toggleCategory,
  selectedSubCategories,
  toggleSubCategory,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
  onClear,
  activeCount,
}) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  const categories = Object.entries(categoryMap).sort((a, b) => b[1].count - a[1].count);

  return (
      <div
      className="fixed inset-0 z-[200] bg-black/55 backdrop-blur-sm flex items-end sm:items-stretch sm:justify-start animate-[fadeIn_0.18s_ease]"
      onClick={onClose}
    >
      <div
        className="w-full sm:w-[380px] bg-[#FBF7F2] rounded-t-3xl sm:rounded-none max-h-[88vh] sm:max-h-none sm:h-full overflow-y-auto animate-[slideUp_0.22s_ease] sm:animate-[slideInLeft_0.22s_ease] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F1E7DC] sticky top-0 bg-[#FBF7F2] z-10">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#241014]">Filter Products</h2>
            {activeCount > 0 && (
              <p className="text-xs text-[#A67C3D] font-semibold mt-0.5">{activeCount} active filter{activeCount > 1 ? "s" : ""}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white text-[#7A6068] flex items-center justify-center hover:bg-[#F1E7DC] transition-colors shrink-0"
          >
            ✕
          </button>
        </div>

        <div className="px-6 py-5 flex-1">
          {/* Price range */}
          <div className="mb-7">
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#A67C3D] mb-3">Price Range (₦)</h3>
            <div className="flex items-center gap-2.5">
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4D6C4] text-sm text-[#241014] placeholder:text-[#B7A5AB] focus:outline-none focus:ring-2 focus:ring-[#C9A15A]/50"
              />
              <span className="text-[#B7A5AB] text-sm shrink-0">to</span>
              <input
                type="number"
                min="0"
                inputMode="numeric"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#E4D6C4] text-sm text-[#241014] placeholder:text-[#B7A5AB] focus:outline-none focus:ring-2 focus:ring-[#C9A15A]/50"
              />
            </div>
          </div>

          {/* Category / subcategory checkboxes */}
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-[#A67C3D] mb-1.5">Category</h3>
            {categories.length === 0 ? (
              <p className="text-sm text-[#B7A5AB] py-2">No categories available yet.</p>
            ) : (
              <div className="divide-y divide-[#F1E7DC]">
                {categories.map(([cat, info]) => {
                  const isChecked = selectedCategories.includes(cat);
                  const subEntries = Object.entries(info.subCategories);
                  return (
                    <div key={cat} className="py-1">
                      <FilterCheckbox
                        checked={isChecked}
                        onChange={() => toggleCategory(cat)}
                        label={cat}
                        count={info.count}
                      />
                      {isChecked && subEntries.length > 0 && (
                        <div className="pb-1.5">
                          {subEntries.map(([sub, count]) => (
                            <FilterCheckbox
                              key={sub}
                              indent
                              checked={selectedSubCategories.includes(sub)}
                              onChange={() => toggleSubCategory(sub)}
                              label={sub}
                              count={count}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#F1E7DC] sticky bottom-0 bg-[#FBF7F2] flex gap-3">
          <button
            onClick={onClear}
            className="flex-1 py-3 rounded-full text-sm font-bold text-[#7A6068] bg-white border border-[#E4D6C4] hover:bg-[#F1E7DC] transition-colors"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-full text-sm font-bold text-[#F3E4C8] bg-[#430F22] hover:bg-[#5C1730] transition-colors"
          >
            Show Results
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ── search / filter / sort state ──
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedSubCategories, setSelectedSubCategories] = useState([]);
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleProductClick = useCallback((product) => {
    const slug = slugify(product.name) + "-" + product._id.slice(-6);
    navigate(`/product/${slug}`, { state: { product } });
  }, [navigate]);

  // Build category -> { count, subCategories: { name: count } } map from live product data
  const categoryMap = useMemo(() => {
    const map = {};
    products.forEach((p) => {
      if (!p.category) return;
      if (!map[p.category]) map[p.category] = { count: 0, subCategories: {} };
      map[p.category].count += 1;
      if (p.subCategory) {
        map[p.category].subCategories[p.subCategory] = (map[p.category].subCategories[p.subCategory] || 0) + 1;
      }
    });
    return map;
  }, [products]);

  const toggleCategory = useCallback((cat) => {
    setSelectedCategories((prev) => {
      const next = prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat];
      // drop subcategory selections that belong to a category being deselected
      if (prev.includes(cat)) {
        const droppedSubs = Object.keys(categoryMap[cat]?.subCategories || {});
        setSelectedSubCategories((subs) => subs.filter((s) => !droppedSubs.includes(s)));
      }
      return next;
    });
  }, [categoryMap]);

  const toggleSubCategory = useCallback((sub) => {
    setSelectedSubCategories((prev) => (prev.includes(sub) ? prev.filter((s) => s !== sub) : [...prev, sub]));
  }, []);

  const clearAllFilters = useCallback(() => {
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategories([]);
    setSelectedSubCategories([]);
    setSortBy("newest");
  }, []);

  const activeFilterCount =
    (minPrice !== "" ? 1 : 0) +
    (maxPrice !== "" ? 1 : 0) +
    selectedCategories.length +
    selectedSubCategories.length;

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    const min = minPrice !== "" ? Number(minPrice) : null;
    const max = maxPrice !== "" ? Number(maxPrice) : null;

    const result = products.filter((p) => {
      const matchesMarket = selectedMarket ? p.seller?.sellerProfile?.market === selectedMarket.name : true;

      const matchesSearch = q
        ? p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q) ||
          p.subCategory?.toLowerCase().includes(q) ||
          p.brand?.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
        : true;

      const price = effectivePrice(p);
      const matchesMin = min !== null ? price >= min : true;
      const matchesMax = max !== null ? price <= max : true;

      const matchesCategory = selectedCategories.length ? selectedCategories.includes(p.category) : true;
      const matchesSubCategory = selectedSubCategories.length ? selectedSubCategories.includes(p.subCategory) : true;

      return matchesMarket && matchesSearch && matchesMin && matchesMax && matchesCategory && matchesSubCategory;
    });

    const sorted = [...result].sort((a, b) => {
      if (sortBy === "price_low") return effectivePrice(a) - effectivePrice(b);
      if (sortBy === "price_high") return effectivePrice(b) - effectivePrice(a);
      if (sortBy === "top_rated") return (b.ratings || 0) - (a.ratings || 0);
      // newest
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

    return sorted;
  }, [products, search, minPrice, maxPrice, selectedMarket, selectedCategories, selectedSubCategories, sortBy]);

  const visibleMarkets = lagosMarkets.slice(0, VISIBLE_MARKETS);
  const currentSortLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700;800&family=Inter:wght@400;500;600&display=swap');
        .font-serif { font-family: 'Fraunces', serif; }
        body { font-family: 'Inter', sans-serif; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .animate-shimmer { animation: shimmer 1.5s infinite linear; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { scrollbar-width: none; }
      `}</style>

      {/*
        pt-16 clears a fixed navbar of height h-16 (64px), imported separately in App.jsx.
        Adjust this value to match your navbar's actual height so content sits
        beneath it instead of underneath/behind it.
      */}
      <div className="pt-0 bg-[#FBF7F2] min-h-screen">

        {/* HERO */}
        {/* <section className="relative overflow-hidden bg-gradient-to-br from-[#430F22] via-[#4E1129] to-[#2B0A16] px-5 sm:px-8 lg:px-[5%] py-14 sm:py-20">
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(45deg, #C9A15A 0, #C9A15A 1px, transparent 1px, transparent 16px), repeating-linear-gradient(-45deg, #C9A15A 0, #C9A15A 1px, transparent 1px, transparent 16px)",
            }}
          />
          <div className="absolute -right-20 -top-20 w-[420px] h-[420px] rounded-full bg-[#C9A15A]/10 blur-3xl pointer-events-none" />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-1.5 bg-[#C9A15A]/15 border border-[#C9A15A]/40 text-[#E9C98A] text-[11px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
              🇳🇬 Lagos' Premier Marketplace
            </span>
            <h1 className="font-serif text-[2.1rem] sm:text-5xl lg:text-[3.4rem] font-bold text-white leading-[1.08] tracking-tight mb-4">
              Shop directly from<br />
              <em className="not-italic text-[#D9BA7C]">Lagos' best markets</em>
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-lg mb-8">
              Discover thousands of products from verified sellers across Ladipo, Computer Village,
              Balogun, and every major market in Lagos — all in one place.
            </p>

         
            <div className="relative max-w-md">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-sm">🔍</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search product name, brand, or description..."
                className="w-full pl-10 pr-4 py-3.5 rounded-full bg-white/10 border border-white/20 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-[#C9A15A]/60 focus:bg-white/15 transition-colors"
              />
            </div>

            <div className="flex gap-8 sm:gap-10 flex-wrap mt-8">
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#D9BA7C]">
                  {products.length > 0 ? `${products.length}+` : "10K+"}
                </div>
                <div className="text-white/50 text-xs mt-0.5">Products Listed</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#D9BA7C]">10</div>
                <div className="text-white/50 text-xs mt-0.5">Lagos Markets</div>
              </div>
              <div>
                <div className="font-serif text-2xl sm:text-3xl font-bold text-[#D9BA7C]">100%</div>
                <div className="text-white/50 text-xs mt-0.5">Verified Sellers</div>
              </div>
            </div>
          </div>
        </section> */}

        {/* MOBILE SEARCH (secondary — mirrors hero search for quick access while scrolled past the hero) */}
        <div className=" px-5 py-4 bg-white border-b border-[#F1E7DC]">
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B7A5AB] text-sm">🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products, markets..."
              className="w-full pl-9 pr-4 py-2.5 rounded-full bg-[#FBF7F2] border border-[#F1E7DC] text-sm text-[#241014] placeholder:text-[#B7A5AB] focus:outline-none focus:ring-2 focus:ring-[#C9A15A]/50"
            />
          </div>
        </div>

        {/* FILTER BAR — sticky just below the fixed navbar (top-16 = navbar height) */}
        <div className="sticky top-16 z-40 bg-white border-b border-[#F1E7DC] shadow-sm">
          <div className="flex items-center overflow-x-auto no-scrollbar px-5 sm:px-8 lg:px-[5%]">
            <button
              onClick={() => setSelectedMarket(null)}
              className={`flex items-center gap-1.5 shrink-0 px-4 py-3.5 text-sm font-medium border-b-[3px] transition-colors whitespace-nowrap ${
                !selectedMarket
                  ? "text-[#430F22] font-bold border-[#430F22]"
                  : "text-[#7A6068] border-transparent hover:text-[#430F22]"
              }`}
            >
              <span className="text-base">🏪</span>
              All Markets
              <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${!selectedMarket ? "bg-[#430F22] text-white" : "bg-[#F3E4C8] text-[#A67C3D]"}`}>
                {products.length}
              </span>
            </button>

            {visibleMarkets.map((market) => {
              const count = products.filter((p) => p.seller?.sellerProfile?.market === market.name).length;
              const active = selectedMarket?.id === market.id;
              return (
                <button
                  key={market.id}
                  onClick={() => setSelectedMarket(market)}
                  className={`flex items-center gap-1.5 shrink-0 px-4 py-3.5 text-sm font-medium border-b-[3px] transition-colors whitespace-nowrap ${
                    active ? "text-[#430F22] font-bold border-[#430F22]" : "text-[#7A6068] border-transparent hover:text-[#430F22]"
                  }`}
                >
                  <span className="text-base">{market.emoji}</span>
                  {market.name.split(" ")[0]}
                  {count > 0 && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${active ? "bg-[#430F22] text-white" : "bg-[#F3E4C8] text-[#A67C3D]"}`}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}

            <button
              onClick={() => setModalOpen(true)}
              className="shrink-0 ml-auto pl-5 pr-1 py-3.5 text-sm font-bold text-[#B5442E] hover:opacity-70 transition-opacity whitespace-nowrap"
            >
              All Markets ＋
            </button>
          </div>
        </div>

        {/* MAIN */}
        <main className="px-5 sm:px-8 lg:px-[5%] py-8 sm:py-10 pb-20">
          {selectedMarket && (
            <div className="flex items-center justify-between gap-3 flex-wrap bg-gradient-to-r from-[#430F22] to-[#5C1730] rounded-2xl px-5 sm:px-6 py-4 mb-7">
              <div className="flex items-center gap-3.5">
                <span className="text-2xl bg-white/10 rounded-xl px-3 py-2">{selectedMarket.emoji}</span>
                <div>
                  <div className="font-serif font-bold text-white text-[1.05rem]">{selectedMarket.name}</div>
                  <div className="text-white/60 text-xs mt-0.5">
                    📍 {selectedMarket.location} · {selectedMarket.knownFor}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedMarket(null)}
                className="text-sm font-semibold text-white bg-white/15 border border-white/30 rounded-full px-4 py-1.5 hover:bg-white/25 transition-colors"
              >
                ✕ Clear filter
              </button>
            </div>
          )}

          <div className="flex items-end justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#241014] tracking-tight">
                {selectedMarket ? `${selectedMarket.name} Products` : "All Products"}
              </h2>
              <p className="text-sm text-[#7A6068] mt-1">
                {selectedMarket ? selectedMarket.description : "Browse products from all Lagos markets"}
              </p>
            </div>
            {!loading && (
              <span className="text-sm font-bold text-[#A67C3D] bg-[#F3E4C8] px-3.5 py-1.5 rounded-full">
                {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
              </span>
            )}
          </div>

          {/* CONTROLS ROW — Filters trigger + Sort dropdown */}
          <div className="flex items-center gap-2.5 mb-3 flex-wrap">
            <button
              onClick={() => setFilterPanelOpen(true)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-colors ${
                activeFilterCount > 0
                  ? "bg-[#430F22] border-[#430F22] text-white"
                  : "bg-white border-[#E4D6C4] text-[#241014] hover:border-[#C9A15A]"
              }`}
            >
              <span aria-hidden>⚙️</span>
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#C9A15A] text-[#2B0A16] text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen((o) => !o)}
                onBlur={() => setTimeout(() => setSortMenuOpen(false), 120)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold bg-white border-2 border-[#E4D6C4] text-[#241014] hover:border-[#C9A15A] transition-colors"
              >
                <span aria-hidden>↕️</span>
                {currentSortLabel}
                <span className={`text-[10px] transition-transform ${sortMenuOpen ? "rotate-180" : ""}`}>▼</span>
              </button>
              {sortMenuOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] w-56 bg-white rounded-2xl border border-[#F1E7DC] shadow-[0_10px_32px_rgba(67,15,34,0.15)] py-1.5 z-30">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onMouseDown={() => { setSortBy(opt.value); setSortMenuOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        sortBy === opt.value ? "text-[#430F22] font-bold bg-[#F3E4C8]/50" : "text-[#4A3B40] hover:bg-[#FBF7F2]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="text-sm font-semibold text-[#B5442E] hover:opacity-70 transition-opacity px-2"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Active filter chips */}
          {(selectedCategories.length > 0 || selectedSubCategories.length > 0 || minPrice !== "" || maxPrice !== "") && (
            <div className="flex flex-wrap gap-2 mb-6">
              {selectedCategories.map((cat) => (
                <span key={cat} className="inline-flex items-center gap-1.5 bg-[#F3E4C8] text-[#5C1730] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {cat}
                  <button onClick={() => toggleCategory(cat)} className="hover:opacity-60">✕</button>
                </span>
              ))}
              {selectedSubCategories.map((sub) => (
                <span key={sub} className="inline-flex items-center gap-1.5 bg-[#F3E4C8]/60 text-[#5C1730] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {sub}
                  <button onClick={() => toggleSubCategory(sub)} className="hover:opacity-60">✕</button>
                </span>
              ))}
              {(minPrice !== "" || maxPrice !== "") && (
                <span className="inline-flex items-center gap-1.5 bg-[#F3E4C8] text-[#5C1730] text-xs font-semibold px-3 py-1.5 rounded-full">
                  {formatPrice(Number(minPrice) || 0)} – {maxPrice !== "" ? formatPrice(Number(maxPrice)) : "∞"}
                  <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="hover:opacity-60">✕</button>
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-3.5 sm:gap-5">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            ) : error ? (
              <div className="col-span-full text-center py-20 px-5">
                <div className="text-5xl mb-4">⚠️</div>
                <div className="font-serif text-lg font-bold text-[#241014] mb-2">Couldn't load products</div>
                <p className="text-sm text-[#7A6068]">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="col-span-full text-center py-20 px-5">
                <div className="text-5xl mb-4">🔍</div>
                <div className="font-serif text-lg font-bold text-[#241014] mb-2">No products found</div>
                <p className="text-sm text-[#7A6068] mb-4">
                  {selectedMarket ? `No products from ${selectedMarket.name} match your filters.` : "Try adjusting your search or filters."}
                </p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm font-bold text-white bg-[#430F22] rounded-full px-5 py-2.5 hover:bg-[#5C1730] transition-colors"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              filteredProducts.map((product) => (
                <ProductCard key={product._id} product={product} onClick={handleProductClick} />
              ))
            )}
          </div>
        </main>

        <MarketModal open={modalOpen} onClose={() => setModalOpen(false)} onSelect={setSelectedMarket} selectedMarket={selectedMarket} />

        <FilterPanel
          open={filterPanelOpen}
          onClose={() => setFilterPanelOpen(false)}
          categoryMap={categoryMap}
          selectedCategories={selectedCategories}
          toggleCategory={toggleCategory}
          selectedSubCategories={selectedSubCategories}
          toggleSubCategory={toggleSubCategory}
          minPrice={minPrice}
          maxPrice={maxPrice}
          setMinPrice={setMinPrice}
          setMaxPrice={setMaxPrice}
          onClear={clearAllFilters}
          activeCount={activeFilterCount}
        />
      </div>
    </>
  );
}


















