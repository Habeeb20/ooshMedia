import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Search, X, Pill, Activity, Leaf, Package, Sparkles } from "lucide-react";
import ProductCard from "../food/FoodproductCard";

import * as categoryConfig from "../../../config/productcategories";
import useUserLocation from "../../../config/useUserLocation";
import appConfig from "../../../config/appConfig";
import { withAlpha } from "./colorUtils";

const allCategories = categoryConfig.default || categoryConfig.productCategories || [];

// The medicine-related categories from your productcategories config
const TABS = [
  { id: "pharmacy", label: "Pharmacy", icon: Pill },
  { id: "health", label: "Health & Wellness", icon: Activity },
  { id: "herbal", label: "Herbal", icon: Leaf },
];

const PAGE_SIZE = 12;
const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
];

const labelOf = (s) => (typeof s === "string" ? s : s?.label || s?.value || "");
const subcategoriesOf = (id) =>
  [...new Set((allCategories.find((c) => c.id === id)?.subcategories || []).map(labelOf).filter(Boolean))];

const categoryOf = (p) => String(p?.category || "").toLowerCase();
const isMedical = (p) => TABS.some((t) => categoryOf(p).includes(t.id));
const priceOf = (p) => (p?.salePrice > 0 && p.salePrice < p.price ? p.salePrice : p?.price || 0);
const inStock = (p) => (p?.stockQuantity ?? 0) > 0 && p?.status !== "out_of_stock";

export default function PopularMedicines() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sort, setSort] = useState("featured");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const sectionRef = useRef(null);

  const brand = appConfig.colors.primary;
  const { location: userLocation } = useUserLocation();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`);
      const all = response.data?.products || response.data || [];
      setProducts(all.filter(isMedical));
    } catch (err) {
      console.log(err);
      setError("We couldn't load the products. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // The prescription lookup can send a drug name here ("Find in store")
  useEffect(() => {
    const onSearch = (e) => {
      setSearchTerm(String(e.detail || ""));
      setActiveTab("all");
      setActiveFilter("All");
      sectionRef.current?.scrollIntoView?.({ behavior: "smooth", block: "start" });
    };
    window.addEventListener("medicine-search", onSearch);
    return () => window.removeEventListener("medicine-search", onSearch);
  }, []);

  useEffect(() => { setVisible(PAGE_SIZE); }, [activeTab, activeFilter, searchTerm, inStockOnly, sort]);

  const subFilters = useMemo(() => (activeTab === "all" ? [] : ["All", ...subcategoriesOf(activeTab)]), [activeTab]);

  const counts = useMemo(
    () => Object.fromEntries([["all", products.length], ...TABS.map((t) => [t.id, products.filter((p) => categoryOf(p).includes(t.id)).length])]),
    [products]
  );

  const filteredProducts = useMemo(() => {
    let result = products;

    if (activeTab !== "all") result = result.filter((p) => categoryOf(p).includes(activeTab));
    if (activeFilter !== "All") {
      result = result.filter((p) => p?.subCategory?.toLowerCase() === activeFilter.toLowerCase());
    }
    if (inStockOnly) result = result.filter(inStock);

    const term = searchTerm.trim().toLowerCase();
    if (term) {
      result = result.filter((p) => {
        const name = p?.name?.toLowerCase() || "";
        const businessName = p?.seller?.businessProfile?.businessName?.toLowerCase() || "";
        const username = p?.seller?.username?.toLowerCase() || "";
        const brandName = p?.brand?.toLowerCase() || "";
        return name.includes(term) || businessName.includes(term) || username.includes(term) || brandName.includes(term);
      });
    }

    if (sort === "price-asc") result = [...result].sort((a, b) => priceOf(a) - priceOf(b));
    else if (sort === "price-desc") result = [...result].sort((a, b) => priceOf(b) - priceOf(a));
    else if (sort === "newest") result = [...result].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0));

    return result;
  }, [products, activeTab, activeFilter, searchTerm, inStockOnly, sort]);

  const filtersActive = activeTab !== "all" || activeFilter !== "All" || searchTerm || inStockOnly;
  const clearAll = () => { setActiveTab("all"); setActiveFilter("All"); setSearchTerm(""); setInStockOnly(false); setSort("featured"); };

  const pill = (active) => (active ? "text-white shadow" : "bg-gray-100 text-gray-500 hover:bg-gray-200");
  const activeStyle = (active) => (active ? { backgroundColor: brand } : undefined);

  return (
    <section id="popular-medicines" ref={sectionRef} className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 scroll-mt-6">
      {/* Heading */}
      <div className="text-center">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] sm:text-xs font-bold"
          style={{ backgroundColor: withAlpha(brand, 0.1), color: brand }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Pharmacy &amp; Health
        </span>
        <h2 className="mt-3 text-xl sm:text-3xl font-extrabold text-gray-900">Popular Medicines &amp; Health Products</h2>
        <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
          Genuine products from verified pharmacies and sellers, ready for delivery or pickup.
        </p>
      </div>

      {/* Search */}
      <div className="mt-6 max-w-lg mx-auto relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search medicines, brands or pharmacies..."
          aria-label="Search medicines"
          className="w-full pl-10 pr-10 py-3 rounded-full border border-gray-200 bg-gray-50 text-sm shadow-sm focus:outline-none focus:ring-2 focus:bg-white transition-colors"
          style={{ "--tw-ring-color": withAlpha(brand, 0.3) }}
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            aria-label="Clear search"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="mt-6 flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
        {[{ id: "all", label: "All", icon: Package }, ...TABS].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => { setActiveTab(id); setActiveFilter("All"); }}
            aria-pressed={activeTab === id}
            className={`shrink-0 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition-colors ${pill(activeTab === id)}`}
            style={activeStyle(activeTab === id)}
          >
            <Icon className="w-4 h-4" />
            {label}
            <span
              className="rounded-full px-1.5 text-[10px] sm:text-xs font-bold"
              style={activeTab === id ? { backgroundColor: "rgba(255,255,255,0.25)" } : { backgroundColor: "#fff" }}
            >
              {counts[id] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Subcategory pills */}
      {subFilters.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-2 no-scrollbar justify-start sm:justify-center">
          {subFilters.map((label) => (
            <button
              key={label}
              onClick={() => setActiveFilter(label)}
              aria-pressed={activeFilter === label}
              className={`shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize transition-colors border ${
                activeFilter === label ? "text-white shadow" : "bg-white text-gray-500 border-gray-200 hover:bg-gray-50"
              }`}
              style={activeFilter === label ? { backgroundColor: brand, borderColor: brand } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Toolbar */}
      {!loading && !error && (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <p className="text-gray-500" aria-live="polite">
            <span className="font-bold text-gray-900">{filteredProducts.length}</span>{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none text-gray-600">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300"
                style={{ accentColor: brand }}
              />
              In stock only
            </label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              aria-label="Sort products"
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-600 focus:outline-none"
            >
              {SORTS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {loading &&
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-56 sm:h-64 rounded-3xl bg-gray-100 animate-pulse" />
          ))}

        {!loading && error && (
          <div className="col-span-full flex flex-col items-center text-center py-12">
            <p className="text-sm text-gray-500 max-w-sm">{error}</p>
            <button
              onClick={fetchProducts}
              className="mt-4 px-5 py-2 rounded-full text-sm font-semibold text-white"
              style={{ backgroundColor: brand }}
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="col-span-full flex flex-col items-center text-center py-12">
            <span
              className="w-14 h-14 rounded-full flex items-center justify-center"
              style={{ backgroundColor: withAlpha(brand, 0.1), color: brand }}
            >
              <Package className="w-7 h-7" />
            </span>
            <p className="mt-4 text-sm text-gray-500">
              {searchTerm ? `No results for "${searchTerm}"` : "No products found in this category yet."}
            </p>
            {filtersActive && (
              <button onClick={clearAll} className="mt-3 text-sm font-semibold" style={{ color: brand }}>
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading && !error &&
          filteredProducts.slice(0, visible).map((product) => (
            <ProductCard key={product._id} product={product} userLocation={userLocation} />
          ))}
      </div>

      {!loading && !error && filteredProducts.length > visible && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => setVisible((n) => n + PAGE_SIZE)}
            className="px-6 py-2.5 rounded-full text-sm font-semibold bg-white border-2 hover:scale-105 active:scale-95 transition-transform"
            style={{ borderColor: brand, color: brand }}
          >
            Show more ({filteredProducts.length - visible} left)
          </button>
        </div>
      )}
    </section>
  );
}