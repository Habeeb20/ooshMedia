// import { useState, useEffect, useMemo } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Search, SlidersHorizontal, X, Star, ChevronDown,
//   Gauge, Wrench, RefreshCcw, PackageX, AlertTriangle,
//   Heart, MapPin, BadgeCheck,
// } from "lucide-react";

// /* ----------------------------------------------------------------
//    CONFIG
//    ---------------------------------------------------------------- */
// const API_BASE = (() => {
//   try {
//     return import.meta.env?.VITE_BACKEND_URL || "";
//   } catch {
//     return "";
//   }
// })();

// const ENDPOINT = `${API_BASE}/api/inventory/all`;

// // Only show automotive parts that are flagged as car parts
// const matchesCarPart = (p) =>
//   p?.category?.toLowerCase() === "automotive" &&
//   p?.part === true &&
//   p?.whatPart === "Car Parts";

// const PAGE_SIZE = 9;

// const slugify = (str = "") =>
//   str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

// const productSlug = (p) => p.slug || `${slugify(p.name)}-${p._id}`;

// /* ----------------------------------------------------------------
//    DEMO FALLBACK DATA (used only if the live endpoint can't be reached,
//    so the layout can still be reviewed)
//    ---------------------------------------------------------------- */
// const DEMO_PRODUCTS = [
//   {
//     _id: "demo1",
//     seller: { businessProfile: { businessName: "Lagos Auto Traders", verified: true }, state: "Lagos", lga: "Ikeja" },
//     name: "Car Brake",
//     description: "Car brake for Toyota cars, perfectly made for all kinds of vehicles",
//     price: 200000,
//     category: "automotive",
//     subCategory: "Car Accessories",
//     stockQuantity: 20,
//     lowStockThreshold: 10,
//     part: true,
//     whatPart: "Car Parts",
//     subCategoryPart: "Brake Discs / Rotors",
//     condition: "New",
//     yearOfMake: "2018",
//     gearTransmission: "Manual",
//     fuelType: "Petrol",
//     maker: "Toyota",
//     images: [{ url: "", isPrimary: true }],
//     sku: "PROD-1785163514966",
//     brand: "IronGrip",
//     status: "active",
//     views: 340,
//     likes: 12,
//     ratings: 4.5,
//     sold: 8,
//   },
//   {
//     _id: "demo2",
//     seller: { businessProfile: { businessName: "Vortex Wheels NG", verified: true }, state: "Abuja", lga: "Wuse" },
//     name: "Sequential LED Tail Light Set",
//     description: "Direct-fit LED tail lights with sequential turn signal, plug and play install.",
//     price: 68900,
//     salePrice: 58900,
//     category: "automotive",
//     subCategory: "Lighting",
//     stockQuantity: 6,
//     lowStockThreshold: 10,
//     part: true,
//     whatPart: "Car Parts",
//     subCategoryPart: "Lighting & Bulbs",
//     condition: "New",
//     yearOfMake: "2021",
//     gearTransmission: "Automatic",
//     fuelType: "Petrol",
//     maker: "Honda",
//     images: [{ url: "", isPrimary: true }],
//     sku: "PROD-1785163514777",
//     brand: "Nightbeam",
//     status: "active",
//     views: 210,
//     likes: 30,
//     ratings: 4.8,
//     sold: 21,
//   },
//   {
//     _id: "demo3",
//     seller: { businessProfile: { businessName: "ApexBoost Garage", verified: false }, state: "Port Harcourt", lga: "GRA" },
//     name: "Twin-Turbo Intercooler Kit",
//     description: "Bolt-on intercooler kit built for reliable daily boost, includes piping and clamps.",
//     price: 312000,
//     category: "automotive",
//     subCategory: "Engine",
//     stockQuantity: 3,
//     lowStockThreshold: 5,
//     part: true,
//     whatPart: "Car Parts",
//     subCategoryPart: "Turbo & Forced Induction",
//     condition: "Used - Like New",
//     yearOfMake: "2019",
//     gearTransmission: "Manual",
//     fuelType: "Diesel",
//     maker: "Ford",
//     images: [{ url: "", isPrimary: true }],
//     sku: "PROD-1785163514888",
//     brand: "ApexBoost",
//     status: "active",
//     views: 95,
//     likes: 5,
//     ratings: 4.1,
//     sold: 2,
//   },
// ];

// /* ----------------------------------------------------------------
//    HELPERS
//    ---------------------------------------------------------------- */
// const naira = (n) =>
//   typeof n === "number" ? `₦${n.toLocaleString("en-NG")}` : "—";

// function useProducts() {
//   const [state, setState] = useState({ status: "loading", products: [], isDemo: false });

//   useEffect(() => {
//     let cancelled = false;

//     async function load() {
//       try {
//         const res = await fetch(ENDPOINT);
//         if (!res.ok) throw new Error(`Request failed (${res.status})`);
//         const data = await res.json();
//         const list = Array.isArray(data) ? data : data.products || data.data || [];
//         if (!cancelled) setState({ status: "ready", products: list, isDemo: false });
//       } catch (err) {
//         if (!cancelled) {
//           setState({ status: "ready", products: DEMO_PRODUCTS, isDemo: true });
//         }
//       }
//     }

//     load();
//     return () => { cancelled = true; };
//   }, []);

//   return state;
// }

// /* ----------------------------------------------------------------
//    SMALL UI PIECES
//    ---------------------------------------------------------------- */
// function Eyebrow({ children }) {
//   return (
//     <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">
//       <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
//       {children}
//     </span>
//   );
// }

// function Stars({ rating = 0 }) {
//   const rounded = Math.round(rating);
//   return (
//     <div className="flex gap-0.5">
//       {Array.from({ length: 5 }).map((_, i) => (
//         <Star
//           key={i}
//           size={13}
//           className={i < rounded ? "fill-amber-400 text-amber-400" : "text-gray-300"}
//         />
//       ))}
//     </div>
//   );
// }

// function FilterSelect({ label, value, options, onChange }) {
//   return (
//     <label className="block">
//       <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
//       <div className="relative mt-1.5">
//         <select
//           value={value}
//           onChange={(e) => onChange(e.target.value)}
//           className="w-full appearance-none rounded-xl bg-white border border-gray-200 text-sm text-gray-900 pl-3 pr-9 py-2.5 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300 transition-colors"
//         >
//           <option value="">All</option>
//           {options.map((opt) => (
//             <option key={opt} value={opt}>{opt}</option>
//           ))}
//         </select>
//         <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
//       </div>
//     </label>
//   );
// }

// /* ----------------------------------------------------------------
//    FILTER PANEL (shared between desktop sidebar + mobile drawer)
//    ---------------------------------------------------------------- */
// function FilterPanel({ facets, filters, setFilter, resetFilters, activeCount }) {
//   return (
//     <div className="flex flex-col gap-5">
//       <div className="flex items-center justify-between">
//         <h3 className="text-gray-900 font-extrabold text-sm">Filter parts</h3>
//         {activeCount > 0 && (
//           <button
//             onClick={resetFilters}
//             className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
//           >
//             <RefreshCcw size={12} /> Reset ({activeCount})
//           </button>
//         )}
//       </div>

//       <FilterSelect label="Maker" value={filters.maker} options={facets.makers} onChange={(v) => setFilter("maker", v)} />
//       <FilterSelect label="Part subcategory" value={filters.subCategoryPart} options={facets.subCategoryParts} onChange={(v) => setFilter("subCategoryPart", v)} />
//       <FilterSelect label="Year of make" value={filters.yearOfMake} options={facets.years} onChange={(v) => setFilter("yearOfMake", v)} />
//       <FilterSelect label="Gear transmission" value={filters.gearTransmission} options={facets.transmissions} onChange={(v) => setFilter("gearTransmission", v)} />
//       <FilterSelect label="Fuel type" value={filters.fuelType} options={facets.fuelTypes} onChange={(v) => setFilter("fuelType", v)} />
//       <FilterSelect label="Condition" value={filters.condition} options={facets.conditions} onChange={(v) => setFilter("condition", v)} />

//       <div>
//         <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Max price</span>
//         <div className="mt-2">
//           <input
//             type="range"
//             min={facets.priceRange[0]}
//             max={facets.priceRange[1]}
//             step={1000}
//             value={filters.maxPrice ?? facets.priceRange[1]}
//             onChange={(e) => setFilter("maxPrice", Number(e.target.value))}
//             className="w-full accent-rose-600"
//           />
//           <div className="flex justify-between text-xs text-gray-500 mt-1">
//             <span>{naira(facets.priceRange[0])}</span>
//             <span className="text-gray-900 font-semibold">{naira(filters.maxPrice ?? facets.priceRange[1])}</span>
//           </div>
//         </div>
//       </div>

//       <label className="flex items-center gap-2 cursor-pointer select-none">
//         <input
//           type="checkbox"
//           checked={filters.inStockOnly}
//           onChange={(e) => setFilter("inStockOnly", e.target.checked)}
//           className="w-4 h-4 rounded accent-rose-600"
//         />
//         <span className="text-sm text-gray-700">In stock only</span>
//       </label>
//     </div>
//   );
// }

// /* ----------------------------------------------------------------
//    PRODUCT CARD
//    ---------------------------------------------------------------- */
// function ProductCard({ product }) {
//   const navigate = useNavigate();
//   const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
//   const seller = typeof product.seller === "object" ? product.seller : null;
//   const businessName = seller?.businessProfile?.businessName || "Verified seller";
//   const isVerified = seller?.businessProfile?.verified;
//   const location = [seller?.lga, seller?.state].filter(Boolean).join(", ");
//   const lowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold ?? 10);
//   const outOfStock = !product.stockQuantity || product.stockQuantity <= 0;

//   const goToDetails = () => navigate(`/product/${productSlug(product)}`);

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" || e.key === " ") {
//       e.preventDefault();
//       goToDetails();
//     }
//   };

//   return (
//     <div
//       role="button"
//       tabIndex={0}
//       onClick={goToDetails}
//       onKeyDown={handleKeyDown}
//       className="group flex flex-col rounded-2xl border border-gray-200 bg-white hover:border-rose-200 hover:shadow-md transition-all overflow-hidden cursor-pointer"
//     >
//       <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
//         {primaryImage ? (
//           <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
//         ) : (
//           <Wrench size={48} strokeWidth={1.2} className="text-gray-300 group-hover:text-rose-400 transition-colors" />
//         )}

//         <div className="absolute top-3 left-3 flex flex-col gap-1.5">
//           {product.condition && (
//             <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-900/80 backdrop-blur-sm text-white">
//               {product.condition}
//             </span>
//           )}
//           {product.salePrice && (
//             <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-rose-600 to-red-500 text-white">
//               Sale
//             </span>
//           )}
//         </div>

//         <button
//           aria-label="Save item"
//           onClick={(e) => e.stopPropagation()}
//           className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"
//         >
//           <Heart size={14} />
//         </button>

//         {outOfStock && (
//           <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
//             <span className="text-white text-xs font-bold uppercase tracking-wide">Out of stock</span>
//           </div>
//         )}
//       </div>

//       <div className="p-4 flex flex-col gap-3 flex-1">
//         <div>
//           <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-1">
//             {product.brand || product.maker}
//           </p>
//           <h3 className="text-gray-900 text-sm font-bold leading-snug line-clamp-2">{product.name}</h3>
//         </div>

//         {/* Fitment chips */}
//         <div className="flex flex-wrap gap-1.5">
//           {[product.maker, product.yearOfMake, product.gearTransmission, product.fuelType, product.subCategoryPart]
//             .filter(Boolean)
//             .map((tag, i) => (
//               <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-600 border border-gray-200">
//                 {tag}
//               </span>
//             ))}
//         </div>

//         <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>

//         <div className="flex items-center gap-2">
//           <Stars rating={product.ratings} />
//           <span className="text-gray-400 text-[11px]">
//             {product.sold ? `${product.sold} sold` : "No sales yet"}
//           </span>
//         </div>

//         <div className="flex items-baseline gap-2">
//           <span className="text-gray-900 font-extrabold text-base">
//             {naira(product.salePrice || product.price)}
//           </span>
//           {product.salePrice && (
//             <span className="text-gray-400 text-xs line-through">{naira(product.price)}</span>
//           )}
//         </div>

//         {lowStock && !outOfStock && (
//           <p className="text-amber-600 text-[11px] font-semibold flex items-center gap-1">
//             <AlertTriangle size={11} /> Only {product.stockQuantity} left
//           </p>
//         )}

//         <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
//           <div className="min-w-0">
//             <div className="flex items-center gap-1 min-w-0">
//               <span className="text-xs font-semibold text-gray-700 truncate">{businessName}</span>
//               {isVerified && <BadgeCheck size={13} className="text-rose-600 shrink-0" />}
//             </div>
//             {location && (
//               <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
//                 <MapPin size={10} /> {location}
//               </p>
//             )}
//           </div>
//           <button
//             disabled={outOfStock}
//             onClick={(e) => { e.stopPropagation(); goToDetails(); }}
//             className="shrink-0 px-3 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//           >
//             View part
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }

// /* ----------------------------------------------------------------
//    SKELETON / EMPTY / ERROR STATES
//    ---------------------------------------------------------------- */
// function CardSkeleton() {
//   return (
//     <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
//       <div className="aspect-[4/3] bg-gray-200" />
//       <div className="p-4 flex flex-col gap-3">
//         <div className="h-3 w-1/3 bg-gray-200 rounded" />
//         <div className="h-4 w-4/5 bg-gray-200 rounded" />
//         <div className="h-3 w-2/3 bg-gray-200 rounded" />
//         <div className="h-5 w-1/2 bg-gray-200 rounded" />
//       </div>
//     </div>
//   );
// }

// function EmptyState({ onReset }) {
//   return (
//     <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
//       <span className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
//         <PackageX size={24} className="text-gray-400" />
//       </span>
//       <h3 className="text-gray-900 font-bold text-base mb-1">No parts match those filters</h3>
//       <p className="text-gray-500 text-sm max-w-xs mb-5">
//         Try widening your search or clearing a filter to see more available parts.
//       </p>
//       <button
//         onClick={onReset}
//         className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 transition-all"
//       >
//         Clear all filters
//       </button>
//     </div>
//   );
// }

// /* ----------------------------------------------------------------
//    MAIN COMPONENT
//    ---------------------------------------------------------------- */
// export default function CarPartsListing() {
//   const { status, products, isDemo } = useProducts();
//   const [search, setSearch] = useState("");
//   const [sort, setSort] = useState("newest");
//   const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
//   const [page, setPage] = useState(1);

//   const [filters, setFilters] = useState({
//     maker: "", subCategoryPart: "", yearOfMake: "", gearTransmission: "",
//     fuelType: "", condition: "", maxPrice: null, inStockOnly: false,
//   });

//   const setFilter = (key, value) => {
//     setFilters((f) => ({ ...f, [key]: value }));
//     setPage(1);
//   };

//   const resetFilters = () => {
//     setFilters({
//       maker: "", subCategoryPart: "", yearOfMake: "", gearTransmission: "",
//       fuelType: "", condition: "", maxPrice: null, inStockOnly: false,
//     });
//     setSearch("");
//     setPage(1);
//   };

//   // Restrict to automotive car parts only
//   const carParts = useMemo(() => products.filter(matchesCarPart), [products]);

//   // Build filter options straight from the live data
//   const facets = useMemo(() => {
//     const uniq = (key) => [...new Set(carParts.map((p) => p[key]).filter(Boolean))].sort();
//     const prices = carParts.map((p) => p.salePrice || p.price || 0);
//     return {
//       makers: uniq("maker"),
//       subCategoryParts: uniq("subCategoryPart"),
//       years: uniq("yearOfMake").sort((a, b) => b - a),
//       transmissions: uniq("gearTransmission"),
//       fuelTypes: uniq("fuelType"),
//       conditions: uniq("condition"),
//       priceRange: [Math.min(0, ...prices), prices.length ? Math.max(...prices) : 500000],
//     };
//   }, [carParts]);

//   const activeCount = Object.entries(filters).filter(([k, v]) => {
//     if (k === "maxPrice") return v !== null && v < facets.priceRange[1];
//     if (k === "inStockOnly") return v === true;
//     return Boolean(v);
//   }).length;

//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     let list = carParts.filter((p) => {
//       if (q) {
//         const haystack = `${p.name} ${p.description} ${p.brand} ${p.maker} ${p.subCategoryPart}`.toLowerCase();
//         if (!haystack.includes(q)) return false;
//       }
//       if (filters.maker && p.maker !== filters.maker) return false;
//       if (filters.subCategoryPart && p.subCategoryPart !== filters.subCategoryPart) return false;
//       if (filters.yearOfMake && p.yearOfMake !== filters.yearOfMake) return false;
//       if (filters.gearTransmission && p.gearTransmission !== filters.gearTransmission) return false;
//       if (filters.fuelType && p.fuelType !== filters.fuelType) return false;
//       if (filters.condition && p.condition !== filters.condition) return false;
//       if (filters.maxPrice !== null && (p.salePrice || p.price) > filters.maxPrice) return false;
//       if (filters.inStockOnly && (!p.stockQuantity || p.stockQuantity <= 0)) return false;
//       return true;
//     });

//     switch (sort) {
//       case "price_asc":
//         list = [...list].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
//         break;
//       case "price_desc":
//         list = [...list].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
//         break;
//       case "rating":
//         list = [...list].sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
//         break;
//       case "popular":
//         list = [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0));
//         break;
//       default:
//         list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
//     }
//     return list;
//   }, [carParts, search, filters, sort]);

//   const visible = filtered.slice(0, page * PAGE_SIZE);
//   const hasMore = visible.length < filtered.length;

//   return (
//     <div className="min-h-screen bg-gray-100 font-sans antialiased">
//       <section className="border-b border-gray-200 bg-white">
//         <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-12">
//           <Eyebrow>Shop &middot; Automotive</Eyebrow>
//           <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
//             <div>
//               <h1 className="text-gray-900 text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-3">
//                 <Gauge className="text-rose-600" size={28} />
//                 Car parts
//               </h1>
//               <p className="text-gray-500 text-sm mt-1.5">
//                 {status === "loading" ? "Loading available parts..." : `${filtered.length} part${filtered.length === 1 ? "" : "s"} match your search`}
//               </p>
//             </div>
//           </div>

//           {isDemo && (
//             <div className="mt-4 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2 w-fit">
//               <AlertTriangle size={13} />
//               Live inventory unreachable, showing sample data
//             </div>
//           )}

//           {/* Search + sort row */}
//           <div className="mt-6 flex flex-col sm:flex-row gap-3">
//             <div className="relative flex-1">
//               <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//               <input
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 placeholder="Search brake discs, Toyota, turbo kit..."
//                 className="w-full rounded-full bg-white border border-gray-200 text-sm text-gray-900 pl-11 pr-4 py-3 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300 transition-colors"
//               />
//             </div>

//             <button
//               onClick={() => setMobileFiltersOpen(true)}
//               className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700"
//             >
//               <SlidersHorizontal size={15} />
//               Filters {activeCount > 0 && `(${activeCount})`}
//             </button>

//             <div className="relative">
//               <select
//                 value={sort}
//                 onChange={(e) => setSort(e.target.value)}
//                 className="appearance-none rounded-full bg-white border border-gray-200 text-sm font-semibold text-gray-700 pl-4 pr-10 py-3 focus:outline-none focus:border-rose-400 transition-colors"
//               >
//                 <option value="newest">Newest</option>
//                 <option value="price_asc">Price: Low to high</option>
//                 <option value="price_desc">Price: High to low</option>
//                 <option value="rating">Top rated</option>
//                 <option value="popular">Best selling</option>
//               </select>
//               <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10 grid lg:grid-cols-[240px_1fr] gap-8">
//         {/* Desktop sidebar */}
//         <aside className="hidden lg:block">
//           <div className="sticky top-6 rounded-2xl border border-gray-200 bg-white p-5">
//             <FilterPanel facets={facets} filters={filters} setFilter={setFilter} resetFilters={resetFilters} activeCount={activeCount} />
//           </div>
//         </aside>

//         {/* Results */}
//         <div>
//           {status === "loading" ? (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
//               {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
//             </div>
//           ) : (
//             <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
//               {visible.length === 0 ? (
//                 <EmptyState onReset={resetFilters} />
//               ) : (
//                 visible.map((p) => <ProductCard key={p._id} product={p} />)
//               )}
//             </div>
//           )}

//           {hasMore && (
//             <div className="flex justify-center mt-10">
//               <button
//                 onClick={() => setPage((p) => p + 1)}
//                 className="px-6 py-3 rounded-full text-sm font-bold text-gray-700 border border-gray-300 hover:bg-white transition-colors"
//               >
//                 Load more parts
//               </button>
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Mobile filter drawer */}
//       {mobileFiltersOpen && (
//         <div className="fixed inset-0 z-50 lg:hidden">
//           <div className="absolute inset-0 bg-gray-900/50" onClick={() => setMobileFiltersOpen(false)} />
//           <div className="absolute right-0 top-0 h-full w-[86%] max-w-sm bg-gray-100 border-l border-gray-200 overflow-y-auto p-5">
//             <div className="flex items-center justify-between mb-6">
//               <span className="text-gray-900 font-extrabold text-base">Filters</span>
//               <button onClick={() => setMobileFiltersOpen(false)} className="text-gray-500 hover:text-gray-900">
//                 <X size={20} />
//               </button>
//             </div>
//             <FilterPanel facets={facets} filters={filters} setFilter={setFilter} resetFilters={resetFilters} activeCount={activeCount} />
//             <button
//               onClick={() => setMobileFiltersOpen(false)}
//               className="mt-8 w-full py-3 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500"
//             >
//               Show {filtered.length} part{filtered.length === 1 ? "" : "s"}
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, X, Star, ChevronDown, Gauge, Wrench, RefreshCcw, PackageX,
  AlertTriangle, Heart, MapPin, BadgeCheck, ShieldCheck, Truck,
  Headphones, ArrowRight, CircleDot, SlidersHorizontal,
} from "lucide-react";

/* ----------------------------------------------------------------
   CONFIG
   ---------------------------------------------------------------- */
const API_BASE = (() => {
  try {
    return import.meta.env?.VITE_BACKEND_URL || "";
  } catch {
    return "";
  }
})();

const ENDPOINT = `${API_BASE}/api/inventory/all`;

const matchesCarPart = (p) =>
  p?.category?.toLowerCase() === "automotive" &&
  p?.part === true &&
  p?.whatPart === "Car Parts";

const PAGE_SIZE = 9;

const slugify = (str = "") =>
  str.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const productSlug = (p) => p.slug || `${slugify(p.name)}-${p._id}`;

const naira = (n) =>
  typeof n === "number" ? `\u20a6${n.toLocaleString("en-NG")}` : "\u2014";

/* ----------------------------------------------------------------
   DEMO FALLBACK DATA
   ---------------------------------------------------------------- */
const DEMO_PRODUCTS = [
  {
    _id: "demo1",
    seller: { businessProfile: { businessName: "Lagos Auto Traders", verified: true }, state: "Lagos", lga: "Ikeja" },
    name: "Car Brake",
    description: "Car brake for Toyota cars, perfectly made for all kinds of vehicles",
    price: 200000,
    category: "automotive",
    subCategory: "Car Accessories",
    stockQuantity: 20,
    lowStockThreshold: 10,
    part: true,
    whatPart: "Car Parts",
    subCategoryPart: "Brake Discs / Rotors",
    condition: "New",
    yearOfMake: "2018",
    gearTransmission: "Manual",
    fuelType: "Petrol",
    maker: "Toyota",
    images: [{ url: "", isPrimary: true }],
    sku: "PROD-1785163514966",
    brand: "IronGrip",
    status: "active",
    views: 340,
    likes: 12,
    ratings: 4.5,
    sold: 8,
  },
  {
    _id: "demo2",
    seller: { businessProfile: { businessName: "Vortex Wheels NG", verified: true }, state: "Abuja", lga: "Wuse" },
    name: "Sequential LED Tail Light Set",
    description: "Direct-fit LED tail lights with sequential turn signal, plug and play install.",
    price: 68900,
    salePrice: 58900,
    category: "automotive",
    subCategory: "Lighting",
    stockQuantity: 6,
    lowStockThreshold: 10,
    part: true,
    whatPart: "Car Parts",
    subCategoryPart: "Lighting & Bulbs",
    condition: "New",
    yearOfMake: "2021",
    gearTransmission: "Automatic",
    fuelType: "Petrol",
    maker: "Honda",
    images: [{ url: "", isPrimary: true }],
    sku: "PROD-1785163514777",
    brand: "Nightbeam",
    status: "active",
    views: 210,
    likes: 30,
    ratings: 4.8,
    sold: 21,
  },
  {
    _id: "demo3",
    seller: { businessProfile: { businessName: "ApexBoost Garage", verified: false }, state: "Port Harcourt", lga: "GRA" },
    name: "Twin-Turbo Intercooler Kit",
    description: "Bolt-on intercooler kit built for reliable daily boost, includes piping and clamps.",
    price: 312000,
    category: "automotive",
    subCategory: "Engine",
    stockQuantity: 3,
    lowStockThreshold: 5,
    part: true,
    whatPart: "Car Parts",
    subCategoryPart: "Turbo & Forced Induction",
    condition: "Used - Like New",
    yearOfMake: "2019",
    gearTransmission: "Manual",
    fuelType: "Diesel",
    maker: "Ford",
    images: [{ url: "", isPrimary: true }],
    sku: "PROD-1785163514888",
    brand: "ApexBoost",
    status: "active",
    views: 95,
    likes: 5,
    ratings: 4.1,
    sold: 2,
  },
  {
    _id: "demo4",
    seller: { businessProfile: { businessName: "MotorMax Depot", verified: true }, state: "Lagos", lga: "Yaba" },
    name: "Alloy Wheel Rim 18-inch",
    description: "Forged alloy rim, lightweight and corrosion resistant, direct bolt fitment.",
    price: 148499,
    salePrice: null,
    category: "automotive",
    subCategory: "Wheels",
    stockQuantity: 0,
    lowStockThreshold: 5,
    part: true,
    whatPart: "Car Parts",
    subCategoryPart: "Wheels & Rims",
    condition: "New",
    yearOfMake: "2023",
    gearTransmission: "Automatic",
    fuelType: "Petrol",
    maker: "Toyota",
    images: [{ url: "", isPrimary: true }],
    sku: "PROD-1785163514111",
    brand: "Vortex Wheels",
    status: "active",
    views: 500,
    likes: 45,
    ratings: 4.6,
    sold: 33,
  },
];

/* ----------------------------------------------------------------
   DATA FETCH HOOK
   ---------------------------------------------------------------- */
function useProducts() {
  const [state, setState] = useState({ status: "loading", products: [], isDemo: false });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(ENDPOINT);
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || data.data || [];
        if (!cancelled) setState({ status: "ready", products: list, isDemo: false });
      } catch (err) {
        if (!cancelled) setState({ status: "ready", products: DEMO_PRODUCTS, isDemo: true });
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return state;
}

/* ----------------------------------------------------------------
   SMALL UI PIECES
   ---------------------------------------------------------------- */
function Eyebrow({ children }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-rose-600">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
      {children}
    </span>
  );
}

function Stars({ rating = 0 }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={13} className={i < rounded ? "fill-amber-400 text-amber-400" : "text-gray-300"} />
      ))}
    </div>
  );
}

function PillRow({ label, options, value, onChange }) {
  if (!options.length) return null;
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" style={{ scrollbarWidth: "none" }}>
        <button
          onClick={() => onChange("")}
          className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
            value === ""
              ? "bg-gradient-to-r from-rose-600 to-red-500 text-white border-transparent shadow-sm"
              : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600"
          }`}
        >
          All
        </button>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(value === opt ? "" : opt)}
            className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
              value === opt
                ? "bg-gradient-to-r from-rose-600 to-red-500 text-white border-transparent shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-rose-300 hover:text-rose-600"
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }) {
  return (
    <label className="block min-w-[150px] flex-1">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">{label}</span>
      <div className="relative mt-1.5">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none rounded-xl bg-white border border-gray-200 text-sm text-gray-900 pl-3 pr-9 py-2.5 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300 transition-colors"
        >
          <option value="">All</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
      </div>
    </label>
  );
}

/* ----------------------------------------------------------------
   HERO
   ---------------------------------------------------------------- */
function Hero({ onShopClick }) {
  return (
    <section className="relative overflow-hidden bg-white border-b border-gray-200">
      <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-200/30 blur-[120px] rounded-full" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left - copy */}
        <div>
          <Eyebrow>Premium auto parts</Eyebrow>

          <h1 className="mt-5 text-4xl sm:text-5xl lg:text-[3.3rem] leading-[1.05] font-extrabold text-gray-900 tracking-tight">
            Genuine car parts.
            <br />
            <span className="bg-gradient-to-r from-rose-600 to-red-500 bg-clip-text text-transparent">
              Zero guesswork.
            </span>
          </h1>

          <p className="mt-5 text-gray-500 text-base sm:text-lg leading-relaxed max-w-md">
            Shop verified parts matched to your exact vehicle, maker, and model
            year, backed by real mechanics and trusted sellers nationwide.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={onShopClick}
              className="px-6 py-3.5 rounded-full font-bold text-sm text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 transition-all shadow-lg shadow-rose-600/20"
            >
              Shop parts
            </button>
            <a
              href="#why-us"
              className="px-6 py-3.5 rounded-full font-bold text-sm text-gray-700 border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Why TorqueHub
            </a>
          </div>

          <div className="mt-10 flex items-center gap-6 sm:gap-8">
            <div>
              <p className="text-2xl font-extrabold text-gray-900">200+</p>
              <p className="text-xs text-gray-500 mt-0.5">Brands</p>
            </div>
            <div className="w-px h-9 bg-gray-200" />
            <div>
              <p className="text-2xl font-extrabold text-gray-900">4.9<span className="text-gray-400 text-base">/5</span></p>
              <p className="text-xs text-gray-500 mt-0.5">Rating</p>
            </div>
            <div className="w-px h-9 bg-gray-200" />
            <div>
              <p className="text-2xl font-extrabold text-gray-900">24</p>
              <p className="text-xs text-gray-500 mt-0.5">States</p>
            </div>
          </div>
        </div>

        {/* Right - visual: wheels & spare parts */}
        <div className="relative">
          <div className="relative rounded-3xl overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 aspect-[4/3] flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-200/40 via-transparent to-transparent" />
            <div className="relative grid grid-cols-2 gap-6 p-8">
              <CircleDot size={72} strokeWidth={1} className="text-rose-500/70 justify-self-end" />
              <Gauge size={72} strokeWidth={1} className="text-gray-400" />
              <Wrench size={72} strokeWidth={1} className="text-gray-400 justify-self-end" />
              <CircleDot size={72} strokeWidth={1} className="text-rose-500/70" />
            </div>
          </div>

          <div className="absolute -bottom-6 -left-6 sm:-left-10 bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-xl flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
              <ShieldCheck size={18} className="text-rose-600" />
            </span>
            <div>
              <p className="text-gray-900 text-sm font-bold leading-none">Verified fit</p>
              <p className="text-gray-500 text-xs mt-1">Matched to your VIN</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   PRODUCT CARD
   ---------------------------------------------------------------- */
function ProductCard({ product }) {
  const navigate = useNavigate();
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
  const seller = typeof product.seller === "object" ? product.seller : null;
  const businessName = seller?.businessProfile?.businessName || "Verified seller";
  const isVerified = seller?.businessProfile?.verified;
  const location = [seller?.lga, seller?.state].filter(Boolean).join(", ");
  const lowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold ?? 10);
  const outOfStock = !product.stockQuantity || product.stockQuantity <= 0;

  const goToDetails = () => navigate(`/product/${productSlug(product)}`);
  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      goToDetails();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goToDetails}
      onKeyDown={handleKeyDown}
      className="group flex flex-col rounded-2xl border border-gray-200 bg-white hover:border-rose-200 hover:shadow-lg transition-all overflow-hidden cursor-pointer"
    >
      <div className="relative aspect-[4/3] bg-gray-100 flex items-center justify-center overflow-hidden">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <Wrench size={48} strokeWidth={1.2} className="text-gray-300 group-hover:text-rose-400 transition-colors" />
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.condition && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gray-900/80 backdrop-blur-sm text-white">
              {product.condition}
            </span>
          )}
          {product.salePrice && (
            <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-gradient-to-r from-rose-600 to-red-500 text-white">
              Sale
            </span>
          )}
        </div>

        <button
          aria-label="Save item"
          onClick={(e) => e.stopPropagation()}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-rose-600 hover:text-white transition-colors"
        >
          <Heart size={14} />
        </button>

        {outOfStock && (
          <div className="absolute inset-0 bg-gray-900/50 flex items-center justify-center">
            <span className="text-white text-xs font-bold uppercase tracking-wide">Out of stock</span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-gray-500 text-[11px] font-semibold uppercase tracking-wide mb-1">
            {product.brand || product.maker}
          </p>
          <h3 className="text-gray-900 text-sm font-bold leading-snug line-clamp-2">{product.name}</h3>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[product.maker, product.yearOfMake, product.gearTransmission, product.fuelType]
            .filter(Boolean)
            .map((tag, i) => (
              <span key={i} className="px-2 py-0.5 rounded-md bg-gray-100 text-[10px] font-medium text-gray-600 border border-gray-200">
                {tag}
              </span>
            ))}
        </div>

        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2">{product.description}</p>

        <div className="flex items-center gap-2">
          <Stars rating={product.ratings} />
          <span className="text-gray-400 text-[11px]">
            {product.sold ? `${product.sold} sold` : "No sales yet"}
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-gray-900 font-extrabold text-base">
            {naira(product.salePrice || product.price)}
          </span>
          {product.salePrice && (
            <span className="text-gray-400 text-xs line-through">{naira(product.price)}</span>
          )}
        </div>

        {lowStock && !outOfStock && (
          <p className="text-amber-600 text-[11px] font-semibold flex items-center gap-1">
            <AlertTriangle size={11} /> Only {product.stockQuantity} left
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-xs font-semibold text-gray-700 truncate">{businessName}</span>
              {isVerified && <BadgeCheck size={13} className="text-rose-600 shrink-0" />}
            </div>
            {location && (
              <p className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                <MapPin size={10} /> {location}
              </p>
            )}
          </div>
          <button
            disabled={outOfStock}
            onClick={(e) => { e.stopPropagation(); goToDetails(); }}
            className="shrink-0 px-3 py-2 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            View part
          </button>
        </div>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------
   SKELETON / EMPTY STATES
   ---------------------------------------------------------------- */
function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="p-4 flex flex-col gap-3">
        <div className="h-3 w-1/3 bg-gray-200 rounded" />
        <div className="h-4 w-4/5 bg-gray-200 rounded" />
        <div className="h-3 w-2/3 bg-gray-200 rounded" />
        <div className="h-5 w-1/2 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <span className="w-14 h-14 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4">
        <PackageX size={24} className="text-gray-400" />
      </span>
      <h3 className="text-gray-900 font-bold text-base mb-1">No parts match those filters</h3>
      <p className="text-gray-500 text-sm max-w-xs mb-5">
        Try widening your search or clearing a filter to see more available parts.
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 transition-all"
      >
        Clear all filters
      </button>
    </div>
  );
}

/* ----------------------------------------------------------------
   WHY CHOOSE US
   ---------------------------------------------------------------- */
function WhyUs() {
  const FEATURES = [
    { icon: ShieldCheck, title: "100% quality guarantee", desc: "Every part is inspected and verified genuine before it ships to you." },
    { icon: Truck, title: "Nationwide fast delivery", desc: "Same-week delivery to all 24 states we currently serve, tracked door to door." },
    { icon: Headphones, title: "Expert support, 24/7", desc: "Real mechanics on standby to help you pick the exact right part for your car." },
  ];

  return (
    <section id="why-us" className="bg-white py-16 sm:py-20 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <Eyebrow>Why TorqueHub</Eyebrow>
        <h2 className="text-gray-900 text-2xl sm:text-3xl font-extrabold mt-3 mb-12 max-w-lg leading-tight">
          Built for drivers who don't compromise.
        </h2>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group rounded-2xl border border-gray-200 p-6 hover:border-rose-200 hover:shadow-md transition-all bg-gradient-to-b from-white to-gray-50"
            >
              <span className="w-12 h-12 rounded-xl bg-rose-100 group-hover:bg-rose-600 flex items-center justify-center mb-5 transition-colors">
                <Icon size={20} className="text-rose-600 group-hover:text-white transition-colors" />
              </span>
              <h3 className="text-gray-900 font-bold text-base mb-2">{title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   PROMO BANNER
   ---------------------------------------------------------------- */
function PromoBanner() {
  return ( 
    <section className="bg-gray-100 px-5 sm:px-8 py-16 sm:py-20">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-600 via-red-500 to-orange-400 px-6 sm:px-12 py-10 sm:py-14 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          <div className="pointer-events-none absolute -right-16 -top-16 w-72 h-72 bg-white/15 rounded-full blur-3xl" />
          <div className="pointer-events-none absolute -left-10 -bottom-20 w-56 h-56 bg-black/10 rounded-full blur-2xl" />

          <div className="relative max-w-lg">
            <p className="text-white/80 text-xs font-bold uppercase tracking-wide mb-3">Limited-time deal</p>
            <h3 className="text-white text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
              Up to 25% off brake &amp; suspension kits
            </h3>
            <p className="text-white/85 text-sm sm:text-base">
              Verified fitment, fast delivery, and trusted sellers, all in one place.
            </p>
          </div>

          <div className="relative flex items-center gap-6">
            <Gauge size={110} strokeWidth={0.8} className="hidden sm:block text-white/25" />
            <button className="shrink-0 flex items-center gap-2 px-6 py-3.5 rounded-full bg-white text-rose-600 font-bold text-sm hover:bg-gray-100 transition-colors">
              Shop deals <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------
   MAIN COMPONENT
   ---------------------------------------------------------------- */
export default function CarPartsListing() {
  const { status, products, isDemo } = useProducts();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [moreOpen, setMoreOpen] = useState(false);
  const listingRef = useRef(null);

  const [filters, setFilters] = useState({
    maker: "", subCategoryPart: "", yearOfMake: "", gearTransmission: "",
    fuelType: "", condition: "", maxPrice: null, inStockOnly: false,
  });

  const setFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      maker: "", subCategoryPart: "", yearOfMake: "", gearTransmission: "",
      fuelType: "", condition: "", maxPrice: null, inStockOnly: false,
    });
    setSearch("");
    setPage(1);
  };

  const scrollToListing = () => listingRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const carParts = useMemo(() => products.filter(matchesCarPart), [products]);

  const facets = useMemo(() => {
    const uniq = (key) => [...new Set(carParts.map((p) => p[key]).filter(Boolean))].sort();
    const prices = carParts.map((p) => p.salePrice || p.price || 0);
    return {
      makers: uniq("maker"),
      subCategoryParts: uniq("subCategoryPart"),
      years: uniq("yearOfMake").sort((a, b) => b - a),
      transmissions: uniq("gearTransmission"),
      fuelTypes: uniq("fuelType"),
      conditions: uniq("condition"),
      priceRange: [0, prices.length ? Math.max(...prices) : 500000],
    };
  }, [carParts]);

  const activeCount = Object.entries(filters).filter(([k, v]) => {
    if (k === "maxPrice") return v !== null && v < facets.priceRange[1];
    if (k === "inStockOnly") return v === true;
    return Boolean(v);
  }).length;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = carParts.filter((p) => {
      if (q) {
        const haystack = `${p.name} ${p.description} ${p.brand} ${p.maker} ${p.subCategoryPart}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.maker && p.maker !== filters.maker) return false;
      if (filters.subCategoryPart && p.subCategoryPart !== filters.subCategoryPart) return false;
      if (filters.yearOfMake && p.yearOfMake !== filters.yearOfMake) return false;
      if (filters.gearTransmission && p.gearTransmission !== filters.gearTransmission) return false;
      if (filters.fuelType && p.fuelType !== filters.fuelType) return false;
      if (filters.condition && p.condition !== filters.condition) return false;
      if (filters.maxPrice !== null && (p.salePrice || p.price) > filters.maxPrice) return false;
      if (filters.inStockOnly && (!p.stockQuantity || p.stockQuantity <= 0)) return false;
      return true;
    });

    switch (sort) {
      case "price_asc":
        list = [...list].sort((a, b) => (a.salePrice || a.price) - (b.salePrice || b.price));
        break;
      case "price_desc":
        list = [...list].sort((a, b) => (b.salePrice || b.price) - (a.salePrice || a.price));
        break;
      case "rating":
        list = [...list].sort((a, b) => (b.ratings || 0) - (a.ratings || 0));
        break;
      case "popular":
        list = [...list].sort((a, b) => (b.sold || 0) - (a.sold || 0));
        break;
      default:
        list = [...list].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    return list;
  }, [carParts, search, filters, sort]);

  const visible = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = visible.length < filtered.length;

  return (
    <div className="min-h-screen bg-gray-100 font-sans antialiased">
      <Hero onShopClick={scrollToListing} />

      <div ref={listingRef} />

      {/* FILTER SYSTEM - TOP */}
      <section className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search brake discs, Toyota, turbo kit..."
                className="w-full rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-900 pl-11 pr-4 py-3 placeholder:text-gray-400 focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-300 transition-colors"
              />
            </div>

            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 pl-4 pr-10 py-3 focus:outline-none focus:border-rose-400 transition-colors"
              >
                <option value="newest">Newest</option>
                <option value="price_asc">Price: Low to high</option>
                <option value="price_desc">Price: High to low</option>
                <option value="rating">Top rated</option>
                <option value="popular">Best selling</option>
              </select>
              <ChevronDown size={15} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <button
              onClick={() => setMoreOpen((v) => !v)}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 hover:border-rose-300 transition-colors"
            >
              <SlidersHorizontal size={15} />
              More filters {activeCount > 0 && `(${activeCount})`}
              <ChevronDown size={14} className={`transition-transform ${moreOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Part category pills */}
          <PillRow
            label="Shop by part"
            options={facets.subCategoryParts}
            value={filters.subCategoryPart}
            onChange={(v) => setFilter("subCategoryPart", v)}
          />

          {/* Condition pills */}
          <PillRow
            label="Shop by condition"
            options={facets.conditions}
            value={filters.condition}
            onChange={(v) => setFilter("condition", v)}
          />

          {/* Expandable advanced filters */}
          {moreOpen && (
            <div className="pt-2 border-t border-gray-100 flex flex-col gap-4">
              <div className="flex flex-wrap gap-4">
                <FilterSelect label="Maker" value={filters.maker} options={facets.makers} onChange={(v) => setFilter("maker", v)} />
                <FilterSelect label="Year of make" value={filters.yearOfMake} options={facets.years} onChange={(v) => setFilter("yearOfMake", v)} />
                <FilterSelect label="Gear transmission" value={filters.gearTransmission} options={facets.transmissions} onChange={(v) => setFilter("gearTransmission", v)} />
                <FilterSelect label="Fuel type" value={filters.fuelType} options={facets.fuelTypes} onChange={(v) => setFilter("fuelType", v)} />
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="flex-1 max-w-xs">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">Max price</span>
                  <input
                    type="range"
                    min={facets.priceRange[0]}
                    max={facets.priceRange[1]}
                    step={1000}
                    value={filters.maxPrice ?? facets.priceRange[1]}
                    onChange={(e) => setFilter("maxPrice", Number(e.target.value))}
                    className="w-full accent-rose-600 mt-2"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{naira(facets.priceRange[0])}</span>
                    <span className="text-gray-900 font-semibold">{naira(filters.maxPrice ?? facets.priceRange[1])}</span>
                  </div>
                </div>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={filters.inStockOnly}
                    onChange={(e) => setFilter("inStockOnly", e.target.checked)}
                    className="w-4 h-4 rounded accent-rose-600"
                  />
                  <span className="text-sm text-gray-700">In stock only</span>
                </label>

                {activeCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors sm:ml-auto"
                  >
                    <RefreshCcw size={12} /> Reset all ({activeCount})
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* RESULTS */}
      <section className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 text-xl sm:text-2xl font-extrabold">
            {status === "loading" ? "Loading parts..." : `${filtered.length} part${filtered.length === 1 ? "" : "s"} found`}
          </h2>
        </div>

        {isDemo && (
          <div className="mb-6 px-3 py-2 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 text-xs flex items-center gap-2 w-fit">
            <AlertTriangle size={13} />
            Live inventory unreachable, showing sample data
          </div>
        )}

        {status === "loading" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {visible.length === 0 ? (
              <EmptyState onReset={resetFilters} />
            ) : (
              visible.map((p) => <ProductCard key={p._id} product={p} />)
            )}
          </div>
        )}

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setPage((p) => p + 1)}
              className="px-6 py-3 rounded-full text-sm font-bold text-gray-700 border border-gray-300 hover:bg-white transition-colors"
            >
              Load more parts
            </button>
          </div>
        )}
      </section>

      <PromoBanner />
      <WhyUs />
    </div>
  );
}