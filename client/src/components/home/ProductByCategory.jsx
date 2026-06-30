





// // src/pages/ProductsGrid.jsx
// import { useEffect, useState, useMemo, useRef } from "react";
// import { Link, useParams } from "react-router-dom";
// import {
//   Loader2, Heart, Eye, Star, Search, SlidersHorizontal,
//   ChevronDown, X, LayoutGrid, List, ChevronRight, Package,
//   ArrowUpDown, Sparkles, TrendingUp,
// } from "lucide-react";
// import axios from "axios";
// import appConfig from "../../config/appConfig";
// import { productCategories } from "../../categories/productCategories";


// // ─── Helpers ───────────────────────────────────────────────────────────────
// const slugify = (text = "") =>
//   text.toLowerCase().trim()
//     .replace(/[^\w\s&-]/g, "")
//     .replace(/[\s&]+/g, "-")
//     .replace(/-+/g, "-");

// const slugifyProduct = (text = "") =>
//   text.toLowerCase().trim()
//     .replace(/[^a-z0-9\s-]/g, "")
//     .replace(/\s+/g, "-");

// const formatPrice = (n) =>
//   n >= 1_000_000
//     ? `₦${(n / 1_000_000).toFixed(2)}M`
//     : `₦${n?.toLocaleString("en-NG")}`;

// // ─── Skeleton card ─────────────────────────────────────────────────────────
// function SkeletonCard() {
//   return (
//     <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
//       <div className="h-48 bg-gray-100" />
//       <div className="p-4 space-y-2">
//         <div className="h-3 bg-gray-100 rounded-full w-1/3" />
//         <div className="h-4 bg-gray-100 rounded-full w-3/4" />
//         <div className="h-3 bg-gray-100 rounded-full w-1/2" />
//         <div className="h-5 bg-gray-100 rounded-full w-1/3 mt-2" />
//       </div>
//     </div>
//   );
// }

// // ─── Product card ──────────────────────────────────────────────────────────
// function ProductCard({ product, viewMode, primaryColor }) {
//   const [wishlisted, setWishlisted] = useState(false);
//   const slug = slugifyProduct(product?.name || "");
//   const displayPrice = product?.salePrice || product?.price;
//   const discount = product?.salePrice
//     ? Math.round(((product.price - product.salePrice) / product.price) * 100)
//     : null;

//   if (viewMode === "list") {
//     return (
//       <Link
//         to={`/product/${slug}`}
//         className="group flex bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md overflow-hidden transition-all duration-200"
//       >
//         {/* Image */}
//         <div className="relative w-32 sm:w-44 flex-shrink-0 overflow-hidden bg-gray-50">
//           <img
//             src={product?.images?.[0]?.url || "https://via.placeholder.com/400"}
//             alt={product?.name}
//             className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
//             style={{ minHeight: "120px" }}
//           />
//           {discount && (
//             <span
//               className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
//               style={{ background: primaryColor }}
//             >
//               -{discount}%
//             </span>
//           )}
//         </div>
//         {/* Info */}
//         <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
//           <div>
//             <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
//               {product?.subCategory}
//             </p>
//             <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-1">
//               {product?.name}
//             </h3>
//             <p className="text-xs text-gray-400 line-clamp-1">{product?.description}</p>
//           </div>
//           <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
//             <div className="flex items-baseline gap-2">
//               <span className="text-base font-bold text-gray-900">
//                 {formatPrice(displayPrice)}
//               </span>
//               {product?.salePrice && (
//                 <span className="text-xs text-gray-400 line-through">
//                   {formatPrice(product.price)}
//                 </span>
//               )}
//             </div>
//             <div className="flex items-center gap-3 text-xs text-gray-400">
//               <span className="flex items-center gap-0.5">
//                 <Star size={11} className="text-amber-400 fill-amber-400" />
//                 {product?.ratings || 0}
//               </span>
//               <span>Stock: {product?.stockQuantity}</span>
//             </div>
//           </div>
//         </div>
//       </Link>
//     );
//   }

//   return (
//     <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
//       {/* Image */}
//       <Link to={`/product/${slug}`} className="relative block overflow-hidden bg-gray-50">
//         <img
//           src={product?.images?.[0]?.url || "https://via.placeholder.com/400"}
//           alt={product?.name}
//           className="w-full h-44 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
//         />

//         {/* Badges */}
//         <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
//           {discount && (
//             <span
//               className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
//               style={{ background: primaryColor }}
//             >
//               -{discount}%
//             </span>
//           )}
//           {product?.stockQuantity <= 5 && product?.stockQuantity > 0 && (
//             <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
//               Low stock
//             </span>
//           )}
//           {product?.stockQuantity === 0 && (
//             <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
//               Sold out
//             </span>
//           )}
//         </div>

//         {/* Wishlist */}
//         <button
//           onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
//           className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
//         >
//           <Heart
//             size={14}
//             className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
//           />
//         </button>
//       </Link>

//       {/* Content */}
//       <div className="p-3.5 flex flex-col flex-1">
//         <p
//           className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
//           style={{ color: primaryColor }}
//         >
//           {product?.subCategory}
//         </p>

//         <Link to={`/product/${slug}`}>
//           <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug hover:text-opacity-75 transition mb-2">
//             {product?.name}
//           </h3>
//         </Link>

//         {/* Rating row */}
//         <div className="flex items-center gap-1 mb-3">
//           {[...Array(5)].map((_, i) => (
//             <Star
//               key={i}
//               size={11}
//               className={i < Math.round(product?.ratings || 0)
//                 ? "fill-amber-400 text-amber-400"
//                 : "text-gray-200 fill-gray-200"
//               }
//             />
//           ))}
//           <span className="text-[11px] text-gray-400 ml-0.5">({product?.ratings || 0})</span>
//         </div>

//         <div className="mt-auto">
//           {/* Price */}
//           <div className="flex items-baseline gap-2 mb-2.5">
//             <span className="text-base font-bold text-gray-900">
//               {formatPrice(displayPrice)}
//             </span>
//             {product?.salePrice && (
//               <span className="text-xs text-gray-400 line-through">
//                 {formatPrice(product.price)}
//               </span>
//             )}
//           </div>

//           {/* Sold progress */}
//           <div>
//             <div className="flex justify-between text-[10px] text-gray-400 mb-1">
//               <span>Sold: {product?.sold || 0}%</span>
//               <span>Stock: {product?.stockQuantity}</span>
//             </div>
//             <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//               <div
//                 className="h-full rounded-full transition-all"
//                 style={{
//                   width: `${Math.min(product?.sold || 0, 100)}%`,
//                   background: primaryColor,
//                 }}
//               />
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── SubcategorySection ────────────────────────────────────────────────────
// function SubcategorySection({ title, products, viewMode, primaryColor }) {
//   return (
//     <div className="mb-10">
//       <div className="flex items-center gap-3 mb-4">
//         <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{title}</h2>
//         <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
//           {products.length}
//         </span>
//         <div className="flex-1 h-px bg-gray-100" />
//       </div>
//       {viewMode === "list" ? (
//         <div className="flex flex-col gap-3">
//           {products.map((p) => (
//             <ProductCard key={p._id} product={p} viewMode="list" primaryColor={primaryColor} />
//           ))}
//         </div>
//       ) : (
//         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//           {products.map((p) => (
//             <ProductCard key={p._id} product={p} viewMode="grid" primaryColor={primaryColor} />
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

// // ─── Main component ────────────────────────────────────────────────────────
// export default function ProductsGrid() {
//   const { categorySlug } = useParams();

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeSub, setActiveSub] = useState("");
//   const [search, setSearch] = useState("");
//   const [sortBy, setSortBy] = useState("newest");
//   const [viewMode, setViewMode] = useState("grid");
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [subDropdownOpen, setSubDropdownOpen] = useState(false);
//   const subDropRef = useRef(null);

//   const primaryColor = appConfig?.colors?.primary || "#8B1E3F";

//   // Find current category
//   const currentCategory = useMemo(
//     () => productCategories.find((c) => c.id === categorySlug) || null,
//     [categorySlug]
//   );

//   // Fetch products
//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const res = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
//       );
//       let all = res.data?.products || res.data || [];

//       if (categorySlug) {
//         all = all.filter((p) => slugify(p?.category) === categorySlug);
//       }
//       setProducts(all);
//     } catch (err) {
//       console.error("Fetch error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//     setActiveSub("");
//     setSearch("");
//   }, [categorySlug]);

//   // Close sub dropdown on outside click
//   useEffect(() => {
//     const handler = (e) => {
//       if (subDropRef.current && !subDropRef.current.contains(e.target)) {
//         setSubDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   // Derived counts per subcategory
//   const subCounts = useMemo(() => {
//     const counts = {};
//     products.forEach((p) => {
//       counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
//     });
//     return counts;
//   }, [products]);

//   // Filtered + sorted products
//   const filtered = useMemo(() => {
//     let res = products.filter((p) => {
//       const matchSub = !activeSub || p.subCategory === activeSub;
//       const matchSearch =
//         !search ||
//         p.name?.toLowerCase().includes(search.toLowerCase()) ||
//         p.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
//         p.description?.toLowerCase().includes(search.toLowerCase());
//       return matchSub && matchSearch;
//     });

//     res.sort((a, b) => {
//       if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
//       if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
//       if (sortBy === "price-asc") return (a.salePrice || a.price) - (b.salePrice || b.price);
//       if (sortBy === "price-desc") return (b.salePrice || b.price) - (a.salePrice || a.price);
//       if (sortBy === "popular") return (b.sold || 0) - (a.sold || 0);
//       if (sortBy === "rating") return (b.ratings || 0) - (a.ratings || 0);
//       return 0;
//     });

//     return res;
//   }, [products, activeSub, search, sortBy]);

//   // Group filtered by subcategory (only if no activeSub filter)
//   const groupedBySub = useMemo(() => {
//     if (activeSub) return { [activeSub]: filtered };
//     const subs = currentCategory?.subcategories || [];
//     const groups = {};
//     subs.forEach((sub) => {
//       const items = filtered.filter((p) => p.subCategory === sub);
//       if (items.length) groups[sub] = items;
//     });
//     // Any product with a sub not in CATEGORIES list
//     const extra = filtered.filter(
//       (p) => !subs.includes(p.subCategory)
//     );
//     if (extra.length) groups["Other"] = extra;
//     return groups;
//   }, [filtered, activeSub, currentCategory]);

//   const subcategories = currentCategory?.subcategories || [];

//   return (
//     <div className="min-h-screen bg-gray-100">
//       {/* ── Page header ─────────────────────────────────────────── */}
//       <div className="bg-white border-b border-gray-200">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
//           {/* Breadcrumb */}
//           <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
//             <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
//             <ChevronRight size={12} />
//             <Link to="/categories" className="hover:text-gray-600 transition-colors">Categories</Link>
//             {currentCategory && (
//               <>
//                 <ChevronRight size={12} />
//                 <span style={{ color: primaryColor }} className="font-medium">
//                   {currentCategory.name}
//                 </span>
//               </>
//             )}
//             {activeSub && (
//               <>
//                 <ChevronRight size={12} />
//                 <span className="text-gray-600 font-medium">{activeSub}</span>
//               </>
//             )}
//           </div>

//           <div className="flex items-start justify-between gap-4 flex-wrap">
//             <div>
//               <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
//                 {currentCategory?.icon && (
//                   <span className="text-2xl">{currentCategory.icon}</span>
//                 )}
//                 {currentCategory?.name || "All Products"}
//               </h1>
//               <p className="text-sm text-gray-400 mt-1">
//                 {loading
//                   ? "Loading products..."
//                   : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}${activeSub ? ` in "${activeSub}"` : ""}`}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
//         <div className="flex gap-5">

//           {/* ── Sidebar ─────────────────────────────────────────── */}
//           {/* Mobile overlay */}
//           {sidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black/40 z-30 lg:hidden"
//               onClick={() => setSidebarOpen(false)}
//             />
//           )}

//           <aside
//             className={`
//               fixed top-0 left-0 h-full z-40 bg-white shadow-2xl pt-6 px-4 w-64 transition-transform duration-300
//               lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:w-56 lg:flex-shrink-0 lg:bg-white
//               lg:rounded-2xl lg:border lg:border-gray-100 lg:h-fit lg:self-start lg:sticky lg:top-4
//               ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
//             `}
//           >
//             {/* Mobile close */}
//             <div className="flex items-center justify-between mb-5 lg:hidden">
//               <p className="font-bold text-gray-900 text-sm">Filter by Category</p>
//               <button
//                 onClick={() => setSidebarOpen(false)}
//                 className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
//               >
//                 <X size={16} />
//               </button>
//             </div>

//             <div className="lg:p-4">
//               <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
//                 Subcategories
//               </p>

//               {/* All */}
//               <button
//                 onClick={() => { setActiveSub(""); setSidebarOpen(false); }}
//                 className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-all ${
//                   activeSub === ""
//                     ? "text-white shadow-sm"
//                     : "text-gray-600 hover:bg-gray-50"
//                 }`}
//                 style={activeSub === "" ? { background: primaryColor } : {}}
//               >
//                 <span>All products</span>
//                 <span
//                   className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
//                     activeSub === "" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
//                   }`}
//                 >
//                   {products.length}
//                 </span>
//               </button>

//               {subcategories.map((sub) => {
//                 const count = subCounts[sub] || 0;
//                 const isActive = activeSub === sub;
//                 return (
//                   <button
//                     key={sub}
//                     onClick={() => { setActiveSub(sub); setSidebarOpen(false); }}
//                     className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all ${
//                       isActive
//                         ? "text-white shadow-sm"
//                         : "text-gray-600 hover:bg-gray-50"
//                     }`}
//                     style={isActive ? { background: primaryColor } : {}}
//                   >
//                     <span className="truncate text-left">{sub}</span>
//                     <span
//                       className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
//                         isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
//                       }`}
//                     >
//                       {count}
//                     </span>
//                   </button>
//                 );
//               })}
//             </div>
//           </aside>

//           {/* ── Main content ─────────────────────────────────────── */}
//           <div className="flex-1 min-w-0">

//             {/* ── Controls bar (horizontal flex) ───────────────── */}
//             <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-5 flex items-center gap-2 flex-wrap sm:flex-nowrap">

//               {/* Mobile sidebar toggle */}
//               <button
//                 onClick={() => setSidebarOpen(true)}
//                 className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex-shrink-0 transition-colors"
//               >
//                 <SlidersHorizontal size={15} />
//                 <span className="hidden xs:inline">Filter</span>
//               </button>

//               {/* Search — flex-1 to fill */}
//               <div className="relative flex-1 min-w-0">
//                 <Search
//                   size={15}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Search products..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                   className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
//                   style={{ "--tw-ring-color": `${primaryColor}33` }}
//                 />
//                 {search && (
//                   <button
//                     onClick={() => setSearch("")}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                   >
//                     <X size={13} />
//                   </button>
//                 )}
//               </div>

//               {/* Subcategory dropdown */}
//               <div className="relative flex-shrink-0" ref={subDropRef}>
//                 <button
//                   onClick={() => setSubDropdownOpen(!subDropdownOpen)}
//                   className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 bg-gray-50 transition-colors whitespace-nowrap"
//                 >
//                   <span className="hidden sm:inline max-w-[110px] truncate">
//                     {activeSub || "Subcategory"}
//                   </span>
//                   <span className="sm:hidden">Sub</span>
//                   <ChevronDown size={14} className={`transition-transform ${subDropdownOpen ? "rotate-180" : ""}`} />
//                 </button>
//                 {subDropdownOpen && (
//                   <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 py-1.5 min-w-[180px]">
//                     <button
//                       onClick={() => { setActiveSub(""); setSubDropdownOpen(false); }}
//                       className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
//                         activeSub === "" ? "text-gray-900" : "text-gray-500"
//                       }`}
//                     >
//                       All subcategories
//                     </button>
//                     <div className="h-px bg-gray-100 my-1" />
//                     {subcategories.map((sub) => (
//                       <button
//                         key={sub}
//                         onClick={() => { setActiveSub(sub); setSubDropdownOpen(false); }}
//                         className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${
//                           activeSub === sub ? "font-semibold text-gray-900" : "text-gray-600"
//                         }`}
//                       >
//                         <span>{sub}</span>
//                         {activeSub === sub && (
//                           <span
//                             className="w-1.5 h-1.5 rounded-full"
//                             style={{ background: primaryColor }}
//                           />
//                         )}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>

//               {/* Sort */}
//               <div className="relative flex-shrink-0">
//                 <ArrowUpDown
//                   size={13}
//                   className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
//                 />
//                 <select
//                   value={sortBy}
//                   onChange={(e) => setSortBy(e.target.value)}
//                   className="pl-8 pr-7 py-2.5 text-sm border border-gray-200 rounded-xl appearance-none bg-gray-50 text-gray-600 focus:outline-none cursor-pointer"
//                 >
//                   <option value="newest">Newest</option>
//                   <option value="oldest">Oldest</option>
//                   <option value="price-asc">Price ↑</option>
//                   <option value="price-desc">Price ↓</option>
//                   <option value="popular">Popular</option>
//                   <option value="rating">Top Rated</option>
//                 </select>
//               </div>

//               {/* View toggle */}
//               <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
//                 <button
//                   onClick={() => setViewMode("grid")}
//                   className={`p-2.5 transition-colors ${
//                     viewMode === "grid" ? "text-white" : "bg-gray-50 text-gray-400 hover:text-gray-600"
//                   }`}
//                   style={viewMode === "grid" ? { background: primaryColor } : {}}
//                 >
//                   <LayoutGrid size={15} />
//                 </button>
//                 <button
//                   onClick={() => setViewMode("list")}
//                   className={`p-2.5 transition-colors ${
//                     viewMode === "list" ? "text-white" : "bg-gray-50 text-gray-400 hover:text-gray-600"
//                   }`}
//                   style={viewMode === "list" ? { background: primaryColor } : {}}
//                 >
//                   <List size={15} />
//                 </button>
//               </div>
//             </div>

//             {/* ── Active filters chips ──────────────────────────── */}
//             {(activeSub || search) && (
//               <div className="flex items-center gap-2 mb-4 flex-wrap">
//                 <span className="text-xs text-gray-400 font-medium">Active filters:</span>
//                 {activeSub && (
//                   <button
//                     onClick={() => setActiveSub("")}
//                     className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
//                     style={{ background: primaryColor }}
//                   >
//                     {activeSub}
//                     <X size={11} />
//                   </button>
//                 )}
//                 {search && (
//                   <button
//                     onClick={() => setSearch("")}
//                     className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700"
//                   >
//                     "{search}"
//                     <X size={11} />
//                   </button>
//                 )}
//                 <button
//                   onClick={() => { setActiveSub(""); setSearch(""); }}
//                   className="text-xs text-gray-400 hover:text-gray-600 underline"
//                 >
//                   Clear all
//                 </button>
//               </div>
//             )}

//             {/* ── Content ──────────────────────────────────────── */}
//             {loading ? (
//               <div>
//                 <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse mb-4" />
//                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
//                   {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
//                 </div>
//               </div>
//             ) : filtered.length === 0 ? (
//               <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
//                 <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
//                   <Package size={28} className="text-gray-300" />
//                 </div>
//                 <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
//                 <p className="text-sm text-gray-400 mb-4">
//                   {search ? `No results for "${search}"` : "No products in this category yet."}
//                 </p>
//                 {(search || activeSub) && (
//                   <button
//                     onClick={() => { setSearch(""); setActiveSub(""); }}
//                     className="text-sm font-semibold text-white px-5 py-2 rounded-xl"
//                     style={{ background: primaryColor }}
//                   >
//                     Clear filters
//                   </button>
//                 )}
//               </div>
//             ) : (
//               Object.entries(groupedBySub).map(([sub, items]) => (
//                 <SubcategorySection
//                   key={sub}
//                   title={sub}
//                   products={items}
//                   viewMode={viewMode}
//                   primaryColor={primaryColor}
//                 />
//               ))
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }











// src/pages/ProductsGrid.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Loader2, Heart, Eye, Star, Search, SlidersHorizontal,
  ChevronDown, X, LayoutGrid, List, ChevronRight, ChevronLeft, Package,
  ArrowUpDown, Sparkles, TrendingUp, MapPin, Store,
} from "lucide-react";
import axios from "axios";
import appConfig from "../../config/appConfig";
import { productCategories } from "../../categories/productCategories";
import { statesAndLgas } from "../../../stateAndLga";


// ─── Helpers ───────────────────────────────────────────────────────────────
const slugify = (text = "") =>
  text.toLowerCase().trim()
    .replace(/[^\w\s&-]/g, "")
    .replace(/[\s&]+/g, "-")
    .replace(/-+/g, "-");

const slugifyProduct = (text = "") =>
  text.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");

const formatPrice = (n) =>
  n >= 1_000_000
    ? `₦${(n / 1_000_000).toFixed(2)}M`
    : `₦${n?.toLocaleString("en-NG")}`;

// ─── Skeleton card ─────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-48 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded-full w-1/3" />
        <div className="h-4 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-5 bg-gray-100 rounded-full w-1/3 mt-2" />
      </div>
    </div>
  );
}

// ─── Product card ──────────────────────────────────────────────────────────
function ProductCard({ product, viewMode, primaryColor }) {
  const [wishlisted, setWishlisted] = useState(false);
  const slug = slugifyProduct(product?.name || "");
  const displayPrice = product?.salePrice || product?.price;
  const discount = product?.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : null;

  if (viewMode === "list") {
    return (
      <Link
        to={`/product/${slug}`}
        className="group flex bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md overflow-hidden transition-all duration-200"
      >
        {/* Image */}
        <div className="relative w-32 sm:w-44 flex-shrink-0 overflow-hidden bg-gray-50">
          <img
            src={product?.images?.[0]?.url || "https://via.placeholder.com/400"}
            alt={product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            style={{ minHeight: "120px" }}
          />
          {discount && (
            <span
              className="absolute top-2 left-2 text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: primaryColor }}
            >
              -{discount}%
            </span>
          )}
        </div>
        {/* Info */}
        <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-1">
              {product?.subCategory}
            </p>
            <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-1">
              {product?.name}
            </h3>
            <p className="text-xs text-gray-400 line-clamp-1">{product?.description}</p>
          </div>
          <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-gray-900">
                {formatPrice(displayPrice)}
              </span>
              {product?.salePrice && (
                <span className="text-xs text-gray-400 line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs text-gray-400">
              <span className="flex items-center gap-0.5">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                {product?.ratings || 0}
              </span>
              <span>Stock: {product?.stockQuantity}</span>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-200 flex flex-col">
      {/* Image */}
      <Link to={`/product/${slug}`} className="relative block overflow-hidden bg-gray-50">
        <img
          src={product?.images?.[0]?.url || "https://via.placeholder.com/400"}
          alt={product?.name}
          className="w-full h-44 sm:h-52 object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {discount && (
            <span
              className="text-white text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ background: primaryColor }}
            >
              -{discount}%
            </span>
          )}
          {product?.stockQuantity <= 5 && product?.stockQuantity > 0 && (
            <span className="bg-red-50 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-100">
              Low stock
            </span>
          )}
          {product?.stockQuantity === 0 && (
            <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded-full">
              Sold out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setWishlisted(!wishlisted); }}
          className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:scale-110 transition-transform"
        >
          <Heart
            size={14}
            className={wishlisted ? "fill-red-500 text-red-500" : "text-gray-400"}
          />
        </button>
      </Link>

      {/* Content */}
      <div className="p-3.5 flex flex-col flex-1">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-1.5"
          style={{ color: primaryColor }}
        >
          {product?.subCategory}
        </p>

        <Link to={`/product/${slug}`}>
          <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug hover:text-opacity-75 transition mb-2">
            {product?.name}
          </h3>
        </Link>

        {/* Rating row */}
        <div className="flex items-center gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={11}
              className={i < Math.round(product?.ratings || 0)
                ? "fill-amber-400 text-amber-400"
                : "text-gray-200 fill-gray-200"
              }
            />
          ))}
          <span className="text-[11px] text-gray-400 ml-0.5">({product?.ratings || 0})</span>
        </div>

        <div className="mt-auto">
          {/* Price */}
          <div className="flex items-baseline gap-2 mb-2.5">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(displayPrice)}
            </span>
            {product?.salePrice && (
              <span className="text-xs text-gray-400 line-through">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          {/* Sold progress */}
          <div>
            <div className="flex justify-between text-[10px] text-gray-400 mb-1">
              <span>Sold: {product?.sold || 0}%</span>
              <span>Stock: {product?.stockQuantity}</span>
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(product?.sold || 0, 100)}%`,
                  background: primaryColor,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SubcategorySection ────────────────────────────────────────────────────
function SubcategorySection({ title, products, viewMode, primaryColor }) {
  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">{title}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
          {products.length}
        </span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>
      {viewMode === "list" ? (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} viewMode="list" primaryColor={primaryColor} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} viewMode="grid" primaryColor={primaryColor} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Horizontal scroll carousel wrapper (generic) ──────────────────────────
function ScrollCarousel({ children }) {
  const ref = useRef(null);
  const scroll = (dir) => ref.current?.scrollBy({ left: dir * 240, behavior: "smooth" });

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-1)}
        className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-8 h-8 bg-white border border-gray-200 shadow-md rounded-full items-center justify-center hover:shadow-lg transition-all"
      >
        <ChevronLeft size={14} className="text-gray-600" />
      </button>
      <div
        ref={ref}
        className="flex gap-2.5 overflow-x-auto pb-1 scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {children}
      </div>
      <button
        onClick={() => scroll(1)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex w-8 h-8 bg-white border border-gray-200 shadow-md rounded-full items-center justify-center hover:shadow-lg transition-all"
      >
        <ChevronRight size={14} className="text-gray-600" />
      </button>
    </div>
  );
}

// ─── Top subcategory carousel ───────────────────────────────────────────────
function SubcategoryCarousel({ subcategories, subCounts, activeSub, setActiveSub, totalCount, primaryColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5 px-1">
        Browse subcategories
      </p>
      <ScrollCarousel>
        <button
          onClick={() => setActiveSub("")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeSub === "" ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          style={activeSub === "" ? { background: primaryColor } : {}}
        >
          All
          <span
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
              activeSub === "" ? "bg-white/20 text-white" : "bg-white text-gray-500"
            }`}
          >
            {totalCount}
          </span>
        </button>

        {subcategories.map((sub) => {
          const isActive = activeSub === sub;
          const count = subCounts[sub] || 0;
          return (
            <button
              key={sub}
              onClick={() => setActiveSub(sub)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              style={isActive ? { background: primaryColor } : {}}
            >
              {sub}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </ScrollCarousel>
    </div>
  );
}

// ─── State carousel — pick a state, see seller-location-filtered products ──
function StateCarousel({ states, stateCounts, activeState, setActiveState, primaryColor }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-3">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5 px-1 flex items-center gap-1.5">
        <MapPin size={11} />
        Browse by state
      </p>
      <ScrollCarousel>
        <button
          onClick={() => setActiveState("")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeState === "" ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          style={activeState === "" ? { background: primaryColor } : {}}
        >
          All states
        </button>

        {states.map((state) => {
          const isActive = activeState === state;
          const count = stateCounts[state] || 0;
          if (count === 0) return null; // only show states that actually have sellers/products
          return (
            <button
              key={state}
              onClick={() => setActiveState(state)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              style={isActive ? { background: primaryColor } : {}}
            >
              {state}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </ScrollCarousel>
    </div>
  );
}

// ─── LGA carousel — appears once a state is selected ────────────────────────
function LgaCarousel({ lgas, lgaCounts, activeLga, setActiveLga, primaryColor }) {
  if (!lgas?.length) return null;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-2.5 px-1 flex items-center gap-1.5">
        <Store size={11} />
        Browse by LGA
      </p>
      <ScrollCarousel>
        <button
          onClick={() => setActiveLga("")}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
            activeLga === "" ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
          }`}
          style={activeLga === "" ? { background: appConfig?.colors?.primary } : {}}
        >
          All LGAs
        </button>

        {lgas.map((lga) => {
          const isActive = activeLga === lga;
          const count = lgaCounts[lga] || 0;
          return (
            <button
              key={lga}
              onClick={() => setActiveLga(lga)}
              className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                isActive ? "text-white shadow-sm" : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              style={isActive ? { background: primaryColor } : {}}
            >
              {lga}
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-white text-gray-500"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </ScrollCarousel>
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────
export default function ProductsGrid() {
  const { categorySlug } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSub, setActiveSub] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [subDropdownOpen, setSubDropdownOpen] = useState(false);
  const subDropRef = useRef(null);

  // ── new: state / lga seller-location filters ──
  const [activeState, setActiveState] = useState("");
  const [activeLga, setActiveLga] = useState("");

  const primaryColor = appConfig?.colors?.primary || "#8B1E3F";

  // Find current category
  const currentCategory = useMemo(
    () => productCategories.find((c) => c.id === categorySlug) || null,
    [categorySlug]
  );

  // Fetch products — sellers are populated so we can read seller.state / seller.lga
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );
      let all = res.data?.products || res.data || [];

      if (categorySlug) {
        all = all.filter((p) => slugify(p?.category) === categorySlug);
      }
      setProducts(all);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    setActiveSub("");
    setSearch("");
    setActiveState("");
    setActiveLga("");
  }, [categorySlug]);

  // Reset LGA whenever state changes
  useEffect(() => {
    setActiveLga("");
  }, [activeState]);

  // Close sub dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (subDropRef.current && !subDropRef.current.contains(e.target)) {
        setSubDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Derived counts per subcategory
  const subCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      counts[p.subCategory] = (counts[p.subCategory] || 0) + 1;
    });
    return counts;
  }, [products]);

  // ── seller state / lga helpers ──
  // seller may come back populated as an object ({ state, lga, ... }) or as a bare id;
  // these helpers handle both safely.
  const getSellerState = (p) => (typeof p.seller === "object" ? p.seller?.state : null);
  const getSellerLga = (p) => (typeof p.seller === "object" ? p.seller?.lga : null);

  // Count of products per state (based on seller location)
  const stateCounts = useMemo(() => {
    const counts = {};
    products.forEach((p) => {
      const st = getSellerState(p);
      if (st) counts[st] = (counts[st] || 0) + 1;
    });
    return counts;
  }, [products]);

  // LGAs available for the currently selected state, scoped to products that exist there
  const lgasForActiveState = useMemo(() => {
    if (!activeState) return [];
    const allLgas = statesAndLgas?.[activeState] || [];
    const lgasWithProducts = new Set(
      products
        .filter((p) => getSellerState(p) === activeState)
        .map((p) => getSellerLga(p))
        .filter(Boolean)
    );
    return allLgas.filter((lga) => lgasWithProducts.has(lga));
  }, [activeState, products]);

  const lgaCounts = useMemo(() => {
    const counts = {};
    products
      .filter((p) => getSellerState(p) === activeState)
      .forEach((p) => {
        const lga = getSellerLga(p);
        if (lga) counts[lga] = (counts[lga] || 0) + 1;
      });
    return counts;
  }, [products, activeState]);

  // List of all states that have at least one product/seller — drives the carousel
  const statesWithSellers = useMemo(() => Object.keys(statesAndLgas || {}), []);

  // Filtered + sorted products
  const filtered = useMemo(() => {
    let res = products.filter((p) => {
      const matchSub = !activeSub || p.subCategory === activeSub;
      const matchSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.subCategory?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());
      const matchState = !activeState || getSellerState(p) === activeState;
      const matchLga = !activeLga || getSellerLga(p) === activeLga;
      return matchSub && matchSearch && matchState && matchLga;
    });

    res.sort((a, b) => {
      if (sortBy === "newest") return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest") return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "price-asc") return (a.salePrice || a.price) - (b.salePrice || b.price);
      if (sortBy === "price-desc") return (b.salePrice || b.price) - (a.salePrice || a.price);
      if (sortBy === "popular") return (b.sold || 0) - (a.sold || 0);
      if (sortBy === "rating") return (b.ratings || 0) - (a.ratings || 0);
      return 0;
    });

    return res;
  }, [products, activeSub, search, sortBy, activeState, activeLga]);

  // Group filtered by subcategory (only if no activeSub filter)
  const groupedBySub = useMemo(() => {
    if (activeSub) return { [activeSub]: filtered };
    const subs = currentCategory?.subcategories || [];
    const groups = {};
    subs.forEach((sub) => {
      const items = filtered.filter((p) => p.subCategory === sub);
      if (items.length) groups[sub] = items;
    });
    // Any product with a sub not in CATEGORIES list
    const extra = filtered.filter(
      (p) => !subs.includes(p.subCategory)
    );
    if (extra.length) groups["Other"] = extra;
    return groups;
  }, [filtered, activeSub, currentCategory]);

  const subcategories = currentCategory?.subcategories || [];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2 flex-wrap">
            <Link to="/" className="hover:text-gray-600 transition-colors">Home</Link>
            <ChevronRight size={12} />
            <Link to="/categories" className="hover:text-gray-600 transition-colors">Categories</Link>
            {currentCategory && (
              <>
                <ChevronRight size={12} />
                <span style={{ color: primaryColor }} className="font-medium">
                  {currentCategory.name}
                </span>
              </>
            )}
            {activeSub && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium">{activeSub}</span>
              </>
            )}
            {activeState && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium">{activeState}</span>
              </>
            )}
            {activeLga && (
              <>
                <ChevronRight size={12} />
                <span className="text-gray-600 font-medium">{activeLga}</span>
              </>
            )}
          </div>

          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900 flex items-center gap-2">
                {currentCategory?.icon && (
                  <span className="text-2xl">{currentCategory.icon}</span>
                )}
                {currentCategory?.name || "All Products"}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {loading
                  ? "Loading products..."
                  : `${filtered.length} product${filtered.length !== 1 ? "s" : ""}${activeSub ? ` in "${activeSub}"` : ""}${activeState ? ` · sellers in ${activeState}${activeLga ? `, ${activeLga}` : ""}` : ""}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">

        {/* ═══════════════════════════════════════════════════════════
            TOP SUBCATEGORY CAROUSEL (new — sidebar kept below as-is)
        ═══════════════════════════════════════════════════════════ */}
        {subcategories.length > 0 && (
          <SubcategoryCarousel
            subcategories={subcategories}
            subCounts={subCounts}
            activeSub={activeSub}
            setActiveSub={setActiveSub}
            totalCount={products.length}
            primaryColor={primaryColor}
          />
        )}

        {/* ═══════════════════════════════════════════════════════════
            STATE CAROUSEL — filter products by seller's state
        ═══════════════════════════════════════════════════════════ */}
        <StateCarousel
          states={statesWithSellers}
          stateCounts={stateCounts}
          activeState={activeState}
          setActiveState={setActiveState}
          primaryColor={primaryColor}
        />

        {/* ═══════════════════════════════════════════════════════════
            LGA CAROUSEL — appears once a state is picked
        ═══════════════════════════════════════════════════════════ */}
        <LgaCarousel
          lgas={lgasForActiveState}
          lgaCounts={lgaCounts}
          activeLga={activeLga}
          setActiveLga={setActiveLga}
          primaryColor={primaryColor}
        />

        <div className="flex gap-5">

          {/* ── Sidebar (kept exactly as before) ───────────────── */}
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-30 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          <aside
            className={`
              fixed top-0 left-0 h-full z-40 bg-white shadow-2xl pt-6 px-4 w-64 transition-transform duration-300
              lg:static lg:translate-x-0 lg:shadow-none lg:z-auto lg:w-56 lg:flex-shrink-0 lg:bg-white
              lg:rounded-2xl lg:border lg:border-gray-100 lg:h-fit lg:self-start lg:sticky lg:top-4
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}
          >
            {/* Mobile close */}
            <div className="flex items-center justify-between mb-5 lg:hidden">
              <p className="font-bold text-gray-900 text-sm">Filter by Category</p>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400"
              >
                <X size={16} />
              </button>
            </div>

            <div className="lg:p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400 mb-3">
                Subcategories
              </p>

              {/* All */}
              <button
                onClick={() => { setActiveSub(""); setSidebarOpen(false); }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium mb-1 transition-all ${
                  activeSub === ""
                    ? "text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
                style={activeSub === "" ? { background: primaryColor } : {}}
              >
                <span>All products</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    activeSub === "" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {products.length}
                </span>
              </button>

              {subcategories.map((sub) => {
                const count = subCounts[sub] || 0;
                const isActive = activeSub === sub;
                return (
                  <button
                    key={sub}
                    onClick={() => { setActiveSub(sub); setSidebarOpen(false); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium mb-0.5 transition-all ${
                      isActive
                        ? "text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                    style={isActive ? { background: primaryColor } : {}}
                  >
                    <span className="truncate text-left">{sub}</span>
                    <span
                      className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full font-semibold flex-shrink-0 ${
                        isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          {/* ── Main content ─────────────────────────────────────── */}
          <div className="flex-1 min-w-0">

            {/* ── Controls bar (horizontal flex) ───────────────── */}
            <div className="bg-white rounded-2xl border border-gray-100 p-3 mb-5 flex items-center gap-2 flex-wrap sm:flex-nowrap">

              {/* Mobile sidebar toggle */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 flex-shrink-0 transition-colors"
              >
                <SlidersHorizontal size={15} />
                <span className="hidden xs:inline">Filter</span>
              </button>

              {/* Search — flex-1 to fill */}
              <div className="relative flex-1 min-w-0">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent bg-gray-50 text-gray-800 placeholder-gray-400 transition-all"
                  style={{ "--tw-ring-color": `${primaryColor}33` }}
                />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Subcategory dropdown */}
              <div className="relative flex-shrink-0" ref={subDropRef}>
                <button
                  onClick={() => setSubDropdownOpen(!subDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 bg-gray-50 transition-colors whitespace-nowrap"
                >
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {activeSub || "Subcategory"}
                  </span>
                  <span className="sm:hidden">Sub</span>
                  <ChevronDown size={14} className={`transition-transform ${subDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {subDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1.5 bg-white border border-gray-200 rounded-2xl shadow-xl z-20 py-1.5 min-w-[180px]">
                    <button
                      onClick={() => { setActiveSub(""); setSubDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-medium transition-colors hover:bg-gray-50 ${
                        activeSub === "" ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      All subcategories
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    {subcategories.map((sub) => (
                      <button
                        key={sub}
                        onClick={() => { setActiveSub(sub); setSubDropdownOpen(false); }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gray-50 flex items-center justify-between ${
                          activeSub === sub ? "font-semibold text-gray-900" : "text-gray-600"
                        }`}
                      >
                        <span>{sub}</span>
                        {activeSub === sub && (
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: primaryColor }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Sort */}
              <div className="relative flex-shrink-0">
                <ArrowUpDown
                  size={13}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-8 pr-7 py-2.5 text-sm border border-gray-200 rounded-xl appearance-none bg-gray-50 text-gray-600 focus:outline-none cursor-pointer"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="price-asc">Price ↑</option>
                  <option value="price-desc">Price ↓</option>
                  <option value="popular">Popular</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "grid" ? "text-white" : "bg-gray-50 text-gray-400 hover:text-gray-600"
                  }`}
                  style={viewMode === "grid" ? { background: primaryColor } : {}}
                >
                  <LayoutGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2.5 transition-colors ${
                    viewMode === "list" ? "text-white" : "bg-gray-50 text-gray-400 hover:text-gray-600"
                  }`}
                  style={viewMode === "list" ? { background: primaryColor } : {}}
                >
                  <List size={15} />
                </button>
              </div>
            </div>

            {/* ── Active filters chips ──────────────────────────── */}
            {(activeSub || search || activeState || activeLga) && (
              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <span className="text-xs text-gray-400 font-medium">Active filters:</span>
                {activeSub && (
                  <button
                    onClick={() => setActiveSub("")}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: primaryColor }}
                  >
                    {activeSub}
                    <X size={11} />
                  </button>
                )}
                {activeState && (
                  <button
                    onClick={() => setActiveState("")}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: primaryColor }}
                  >
                    <MapPin size={10} />
                    {activeState}
                    <X size={11} />
                  </button>
                )}
                {activeLga && (
                  <button
                    onClick={() => setActiveLga("")}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: primaryColor }}
                  >
                    <Store size={10} />
                    {activeLga}
                    <X size={11} />
                  </button>
                )}
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-200 text-gray-700"
                  >
                    "{search}"
                    <X size={11} />
                  </button>
                )}
                <button
                  onClick={() => { setActiveSub(""); setSearch(""); setActiveState(""); setActiveLga(""); }}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* ── Content ──────────────────────────────────────── */}
            {loading ? (
              <div>
                <div className="h-5 w-24 bg-gray-200 rounded-full animate-pulse mb-4" />
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 py-20 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Package size={28} className="text-gray-300" />
                </div>
                <h3 className="text-base font-bold text-gray-800 mb-1">No products found</h3>
                <p className="text-sm text-gray-400 mb-4">
                  {search
                    ? `No results for "${search}"`
                    : activeState
                    ? `No sellers found in ${activeState}${activeLga ? `, ${activeLga}` : ""} for this category.`
                    : "No products in this category yet."}
                </p>
                {(search || activeSub || activeState || activeLga) && (
                  <button
                    onClick={() => { setSearch(""); setActiveSub(""); setActiveState(""); setActiveLga(""); }}
                    className="text-sm font-semibold text-white px-5 py-2 rounded-xl"
                    style={{ background: primaryColor }}
                  >
                    Clear filters
                  </button>
                )}
              </div>
            ) : (
              Object.entries(groupedBySub).map(([sub, items]) => (
                <SubcategorySection
                  key={sub}
                  title={sub}
                  products={items}
                  viewMode={viewMode}
                  primaryColor={primaryColor}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}