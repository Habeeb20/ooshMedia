// import { useState, useEffect, useRef, useCallback } from "react";
// import { Link } from "react-router-dom";

// // ─── Category Data ────────────────────────────────────────────────────────────
// const partCategories = [
//   {
//     id: "car-parts", name: "Car Parts", icon: "🚗",
//     subcategories: ["Engine Parts","Brake System","Suspension","Transmission","Electrical","Body Parts","Wheels & Tyres","Interior Parts","Exhaust System","Cooling System"]
//   },
//   {
//     id: "electronics", name: "Electronics Parts", icon: "📱",
//     subcategories: ["Smartphones","Laptops & Computers","Tablets","Headphones & Earbuds","Smart Watches","Chargers & Cables","Speakers","Cameras","Gaming Consoles","Accessories"]
//   },
//   {
//     id: "phone-parts", name: "Phone Parts", icon: "🔧",
//     subcategories: ["Screens","Batteries","Charging Ports","Cameras","Motherboards","Speakers & Microphones","Casings","Buttons & Flex Cables"]
//   },
//   {
//     id: "home-appliances", name: "Home Appliances parts", icon: "🏠",
//     subcategories: ["Refrigerators","Washing Machines","Air Conditioners","Microwaves","Blenders","Generators","Fans","Water Heaters"]
//   },
//   {
//     id: "tools", name: "Tools & Equipment", icon: "🔩",
//     subcategories: ["Power Tools","Hand Tools","Safety Equipment","Measuring Tools","Workshop Equipment","Welding Equipment"]
//   },
//   {
//     id: "accessories", name: "Accessories", icon: "🎒",
//     subcategories: ["Bags & Cases","Mounts & Holders","Protective Gear","Cleaning Kits","Storage Solutions"]
//   },
// ];

// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
// const API_URL = `${BACKEND_URL}/api/inventory/parts`;

// // ─── Helpers ──────────────────────────────────────────────────────────────────
// const formatPrice = (n) =>
//   new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

// const getPrimary = (images) =>
//   images?.find((i) => i.isPrimary)?.url || images?.[0]?.url || null;

// function StarRating({ rating = 0 }) {
//   return (
//     <div className="flex gap-0.5">
//       {[1,2,3,4,5].map((n) => (
//         <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={rating >= n ? "#F59E0B" : "none"}
//           stroke={rating >= n ? "#F59E0B" : "#D1D5DB"} strokeWidth="2">
//           <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
//         </svg>
//       ))}
//     </div>
//   );
// }

// // ─── Product Card ─────────────────────────────────────────────────────────────
// function ProductCard({ product }) {
//   const [imgError, setImgError] = useState(false);
//     const slug = product?.name?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-");
//   const [hovered, setHovered] = useState(false);
//   const img = getPrimary(product.images);
//   const isOnSale = product.salePrice && product.salePrice < product.price;
//   const displayPrice = isOnSale ? product.salePrice : product.price;
//   const discount = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
//   const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 10);
//   const isOutOfStock = product.stockQuantity === 0 || product.status === "out_of_stock";

//   return (
//     <div
//       className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all duration-300 cursor-pointer flex flex-col"
//       style={{ boxShadow: hovered ? "0 20px 50px -10px rgba(15,23,42,0.15)" : "0 2px 12px rgba(15,23,42,0.06)" }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {/* Image */}
//       <Link to={`/product/${slug}`}>
//           <div className="relative overflow-hidden bg-rose-50" style={{ paddingBottom: "75%" }}>
//         <div className="absolute inset-0">
//           {img && !imgError ? (
//             <img
//               src={img} alt={product.name}
//               className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
//               onError={() => setImgError(true)}
//             />
//           ) : (
//             <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
//               {partCategories.find(c => c.id === product.category)?.icon || "📦"}
//             </div>
//           )}
//         </div>

//         {/* Badges */}
//         <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
//           {isOnSale && (
//             <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase">
//               -{discount}%
//             </span>
//           )}
//           {isLowStock && !isOutOfStock && (
//             <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//               Low Stock
//             </span>
//           )}
//           {isOutOfStock && (
//             <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//               Sold Out
//             </span>
//           )}
//         </div>

//         {/* Quick add */}
//         <div
//           className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-3 pt-8 transition-all duration-300"
//           style={{
//             opacity: hovered ? 1 : 0,
//             transform: hovered ? "translateY(0)" : "translateY(8px)",
//             background: "linear-gradient(to top, rgba(255,255,255,0.95) 60%, transparent)"
//           }}
//         >
//           <button
//             disabled={isOutOfStock}
//             className="flex items-center gap-1.5 bg-rose-900 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//               <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
//               <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
//             </svg>
//             {isOutOfStock ? "Out of Stock" : "Add to Cart"}
//           </button>
//         </div>
//       </div>
//       </Link>
  

//       {/* Info */}
//       <div className="p-3.5 flex flex-col gap-2 flex-1">
//         {product.brand && (
//           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.brand}</span>
//         )}
//         <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
//           {product.name}
//         </h3>
//         {product.subCategoryPart && (
//           <span className="text-[10px] text-indigo-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full self-start">
//             {product.subCategoryPart}
//           </span>
//         )}

//         <div className="flex items-center gap-1.5">
//           <StarRating rating={product.ratings} />
//           <span className="text-[10px] text-slate-400">({product.sold || 0} sold)</span>
//         </div>

//         <div className="flex items-end justify-between mt-auto pt-1">
//           <div>
//             <p className="text-base font-black text-slate-900">{formatPrice(displayPrice)}</p>
//             {isOnSale && (
//               <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
//             )}
//           </div>
//           {product.stockQuantity > 0 && !isOutOfStock && (
//             <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
//               {product.stockQuantity} left
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// // ─── Category Section ─────────────────────────────────────────────────────────
// function CategorySection({ category, products, onSubcategoryClick, activeSubcategory }) {
//   const filtered = activeSubcategory
//     ? products.filter(p => p.subCategoryPart === activeSubcategory || p.subCategory === activeSubcategory)
//     : products;

//   if (filtered.length === 0) return null;

//   return (
//     <section className="mb-16">
//       <div className="flex items-center justify-between mb-5">
//         <div className="flex items-center gap-3">
//           <span className="text-2xl">{category.icon}</span>
//           <div>
//             <h2 className="text-xl font-black text-slate-900 tracking-tight">{category.name}</h2>
//             <p className="text-xs text-slate-400 font-medium">{filtered.length} products</p>
//           </div>
//         </div>
//         <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
//           View all
//           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//             <path d="M5 12h14M12 5l7 7-7 7"/>
//           </svg>
//         </a>
//       </div>

//       {/* Subcategory chips */}
//       <div className="flex gap-2 flex-wrap mb-5">
//         <button
//           onClick={() => onSubcategoryClick(null)}
//           className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
//             !activeSubcategory
//               ? "bg-rose-900 text-white border-slate-900"
//               : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
//           }`}
//         >
//           All
//         </button>
//         {category.subcategories.map(sub => {
//           const count = products.filter(p => p.subCategoryPart === sub || p.subCategory === sub).length;
//           if (count === 0) return null;
//           return (
//             <button
//               key={sub}
//               onClick={() => onSubcategoryClick(activeSubcategory === sub ? null : sub)}
//               className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
//                 activeSubcategory === sub
//                   ? "bg-rose-600 text-white border-indigo-600"
//                   : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
//               }`}
//             >
//               {sub}
//               <span className={`text-[10px] px-1 py-0.5 rounded-full font-bold ${
//                 activeSubcategory === sub ? "bg-white/20 text-white" : "bg-rose-100 text-slate-500"
//               }`}>{count}</span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Products grid */}
//       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//         {filtered.slice(0, 10).map(p => <ProductCard key={p._id} product={p} />)}
//       </div>
//     </section>
//   );
// }

// // ─── Navbar ───────────────────────────────────────────────────────────────────
// function Navbar({ activeCategory, onCategoryClick, cartCount }) {
//   const [openMenu, setOpenMenu] = useState(null);
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [scrolled, setScrolled] = useState(false);
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 40);
//     window.addEventListener("scroll", onScroll);
//     return () => window.removeEventListener("scroll", onScroll);
//   }, []);

//   useEffect(() => {
//     const handler = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenu(null); };
//     document.addEventListener("mousedown", handler);
//     return () => document.removeEventListener("mousedown", handler);
//   }, []);

//   return (
//     <header
//       className="sticky top-0 z-50 transition-all duration-300"
//       style={{
//         background: scrolled ? "rgba(255,255,255,0.97)" : "#0F172A",
//         backdropFilter: "blur(12px)",
//         boxShadow: scrolled ? "0 1px 30px rgba(15,23,42,0.1)" : "none",
//       }}
//     >
//       {/* Top bar */}
//       <div className="container mx-auto px-4 lg:px-8">
//         <div className="flex items-center h-16 gap-6">
//           {/* Logo */}
//           <a href="#" className="flex items-center gap-2.5 shrink-0">
//             <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//                 <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
//               </svg>
//             </div>
//             <span className={`text-xl font-black tracking-tight transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
//               PartStore
//             </span>
//           </a>

//           {/* Search */}
//           <div className="flex-1 max-w-xl hidden md:block">
//             <div className="relative">
//               <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
//               </svg>
//               <input
//                 type="text"
//                 placeholder="Search parts, electronics, accessories…"
//                 className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-2xl outline-none focus:bg-white/15 focus:border-white/30 transition-all"
//                 style={{ background: scrolled ? "#F1F5F9" : undefined, color: scrolled ? "#0F172A" : undefined }}
//               />
//             </div>
//           </div>

//           {/* Right icons */}
//           <div className="flex items-center gap-2 ml-auto">
//             <button className={`relative p-2.5 rounded-xl transition-colors ${scrolled ? "hover:bg-rose-100 text-slate-700" : "hover:bg-white/10 text-white"}`}>
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
//                 <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
//               </svg>
//               {cartCount > 0 && (
//                 <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
//                   {cartCount}
//                 </span>
//               )}
//             </button>
//             <button
//               className={`md:hidden p-2.5 rounded-xl transition-colors ${scrolled ? "hover:bg-rose-100 text-slate-700" : "hover:bg-white/10 text-white"}`}
//               onClick={() => setMobileOpen(v => !v)}
//             >
//               <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 {mobileOpen
//                   ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
//                   : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
//                 }
//               </svg>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Category nav */}
//       <div
//         className="border-t transition-colors"
//         style={{ borderColor: scrolled ? "#E2E8F0" : "rgba(255,255,255,0.08)" }}
//         ref={menuRef}
//       >
//         <div className="container mx-auto px-4 lg:px-8">
//           <nav className="hidden md:flex items-center gap-1 h-11 overflow-x-auto no-scrollbar">
//             <button
//               onClick={() => onCategoryClick(null)}
//               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
//                 !activeCategory
//                   ? "bg-rose-500 text-white"
//                   : scrolled
//                     ? "text-slate-600 hover:bg-rose-100 hover:text-slate-900"
//                     : "text-slate-300 hover:bg-white/10 hover:text-white"
//               }`}
//             >
//               ✨ All Categories
//             </button>

//             {partCategories.map(cat => (
//               <div key={cat.id} className="relative">
//                 <button
//                   onClick={() => {
//                     onCategoryClick(cat.id);
//                     setOpenMenu(openMenu === cat.id ? null : cat.id);
//                   }}
//                   onMouseEnter={() => setOpenMenu(cat.id)}
//                   className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
//                     activeCategory === cat.id
//                       ? "bg-rose-500 text-white"
//                       : scrolled
//                         ? "text-slate-600 hover:bg-rose-100 hover:text-slate-900"
//                         : "text-slate-300 hover:bg-white/10 hover:text-white"
//                   }`}
//                 >
//                   <span>{cat.icon}</span>
//                   {cat.name}
//                   <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
//                     style={{ transform: openMenu === cat.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
//                     <path d="m6 9 6 6 6-6"/>
//                   </svg>
//                 </button>

//                 {/* Dropdown */}
//                 {openMenu === cat.id && (
//                   <div
//                     className="absolute top-full left-0 mt-1 bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 min-w-[220px] z-50 grid grid-cols-2 gap-1"
//                     onMouseLeave={() => setOpenMenu(null)}
//                     style={{ animation: "dropIn 0.15s ease-out" }}
//                   >
//                     <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
//                     {cat.subcategories.map(sub => (
//                       <button
//                         key={sub}
//                         onClick={() => { onCategoryClick(cat.id); setOpenMenu(null); }}
//                         className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
//                       >
//                         {sub}
//                       </button>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             ))}
//           </nav>

//           {/* Mobile nav */}
//           {mobileOpen && (
//             <div className="md:hidden pb-4 pt-2 flex flex-col gap-1">
//               <button
//                 onClick={() => { onCategoryClick(null); setMobileOpen(false); }}
//                 className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/10"
//               >
//                 ✨ All Categories
//               </button>
//               {partCategories.map(cat => (
//                 <button
//                   key={cat.id}
//                   onClick={() => { onCategoryClick(cat.id); setMobileOpen(false); }}
//                   className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
//                 >
//                   <span>{cat.icon}</span>{cat.name}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>
//       </div>
//     </header>
//   );
// }

// // ─── Hero ─────────────────────────────────────────────────────────────────────
// function Hero({ onExplore }) {
//   return (
//     <section className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-indigo-950 to-red-900 py-20 lg:py-28">
//       {/* Decorative grid */}
//       <div className="absolute inset-0 opacity-[0.04]" style={{
//         backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
//         backgroundSize: "40px 40px"
//       }} />
//       {/* Glow blobs */}
//       <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
//       <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

//       <div className="container mx-auto px-4 lg:px-8 relative z-10">
//         <div className="max-w-2xl">
//           <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
//             <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
//             <span className="text-indigo-300 text-xs font-semibold tracking-wide">Genuine Parts · Fast Shipping</span>
//           </div>
//           <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
//             Every Part You Need,<br />
//             <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(165,180,252,0.6)" }}>
//               Right Here.
//             </span>
//           </h1>
//           <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
//             Car parts, electronics, phone components & more — sourced from verified sellers across Nigeria.
//           </p>
//           <div className="flex flex-wrap gap-3">
//             <button
//               onClick={onExplore}
//               className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-6 py-3 rounded-2xl transition-all hover:-translate-y-0.5 text-sm shadow-lg shadow-indigo-500/25"
//             >
//               Shop Now
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                 <path d="M5 12h14M12 5l7 7-7 7"/>
//               </svg>
//             </button>
//             <Link to='/categories'>
//                <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition-all text-sm">
//               Browse Categories
//             </button>
//             </Link>
         
//           </div>

//           <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
//             {[["✓", "Verified Sellers"],["⚡", "Fast Delivery"],["🛡️", "Buyer Protection"]].map(([ico, txt]) => (
//               <div key={txt} className="flex items-center gap-2 text-slate-400 text-sm">
//                 <span className="text-slate-300">{ico}</span>{txt}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

// // ─── Skeleton ─────────────────────────────────────────────────────────────────
// function SkeletonCard() {
//   return (
//     <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
//       <div className="bg-rose-100" style={{ paddingBottom: "75%" }} />
//       <div className="p-3.5 flex flex-col gap-2.5">
//         <div className="h-2.5 bg-rose-100 rounded w-1/3" />
//         <div className="h-3.5 bg-rose-100 rounded w-5/6" />
//         <div className="h-3 bg-rose-100 rounded w-4/6" />
//         <div className="h-5 bg-rose-100 rounded w-2/5 mt-1" />
//       </div>
//     </div>
//   );
// }

// // ─── Main Page ────────────────────────────────────────────────────────────────
// export default function Eparts() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [subcategoryFilters, setSubcategoryFilters] = useState({});
//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");
//   const productsRef = useRef(null);

//   // Debounce search
//   useEffect(() => {
//     const t = setTimeout(() => setDebouncedSearch(search), 350);
//     return () => clearTimeout(t);
//   }, [search]);

//   useEffect(() => {
//     (async () => {
//       try {
//         setLoading(true);
//         const res = await fetch(API_URL);
//         if (!res.ok) throw new Error(`HTTP ${res.status}`);
//         const json = await res.json();
//         // Handle common API shapes: { data: [...] }, { products: [...] }, or plain array
//         const arr = Array.isArray(json) ? json : json.data || json.products || [];
//         setProducts(arr);
//       } catch (e) {
//         setError(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, []);

//   const handleCategoryClick = (catId) => {
//     setActiveCategory(catId);
//     if (catId) {
//       setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
//     }
//   };

//   const handleSubcategoryClick = useCallback((catId, sub) => {
//     setSubcategoryFilters(prev => ({ ...prev, [catId]: sub }));
//   }, []);

//   // Group products by category
//   const grouped = partCategories.map(cat => ({
//     ...cat,
//     products: products.filter(p => {
//       const matchCat = p.category === cat.id || p.whatPart === cat.id;
//       const matchSearch = !debouncedSearch ||
//         p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//         p.brand?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
//         p.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
//       return matchCat && matchSearch;
//     })
//   })).filter(cat => cat.products.length > 0);

//   const displayGroups = activeCategory
//     ? grouped.filter(g => g.id === activeCategory)
//     : grouped;

//   // Quick stats
//   const totalProducts = products.length;
//   const onSale = products.filter(p => p.salePrice && p.salePrice < p.price).length;
//   const inStock = products.filter(p => p.stockQuantity > 0).length;

//   return (
//     <div className="min-h-screen bg-rose-50" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif" }}>
//       <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
//         .no-scrollbar::-webkit-scrollbar { display: none; }
//         .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
//         * { box-sizing: border-box; }
//       `}</style>

//       <Navbar
//         activeCategory={activeCategory}
//         onCategoryClick={handleCategoryClick}
//         cartCount={0}
//       />

//       <Hero onExplore={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })} />

//       {/* Stats bar */}
//       <div className="bg-white border-b border-slate-100">
//         <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-wrap gap-6 items-center">
//           {[
//             { label: "Total Products", value: totalProducts, color: "text-slate-900" },
//             { label: "On Sale", value: onSale, color: "text-red-600" },
//             { label: "In Stock", value: inStock, color: "text-emerald-600" },
//             { label: "Categories", value: partCategories.length, color: "text-indigo-600" },
//           ].map(s => (
//             <div key={s.label} className="flex items-center gap-2">
//               <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
//               <span className="text-xs text-slate-400 font-medium">{s.label}</span>
//             </div>
//           ))}

//           {/* Search — mobile visible */}
//           <div className="ml-auto hidden sm:flex relative">
//             <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
//             </svg>
//             <input
//               value={search}
//               onChange={e => setSearch(e.target.value)}
//               placeholder="Search products…"
//               className="pl-9 pr-4 py-2 text-sm bg-rose-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 w-56 transition-all text-slate-800 placeholder-slate-400"
//             />
//             {search && (
//               <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
//                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                   <path d="M18 6 6 18M6 6l12 12"/>
//                 </svg>
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Main content */}
//       <main ref={productsRef} className="container mx-auto px-4 lg:px-8 py-10">

//         {/* Active category header */}
//         {activeCategory && (
//           <div className="flex items-center justify-between mb-8">
//             <div className="flex items-center gap-3">
//               <span className="text-3xl">{partCategories.find(c => c.id === activeCategory)?.icon}</span>
//               <div>
//                 <h1 className="text-2xl font-black text-slate-900">
//                   {partCategories.find(c => c.id === activeCategory)?.name}
//                 </h1>
//                 <p className="text-sm text-slate-400">
//                   {displayGroups[0]?.products?.length || 0} products
//                 </p>
//               </div>
//             </div>
//             <button
//               onClick={() => setActiveCategory(null)}
//               className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-semibold"
//             >
//               <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M19 12H5M12 19l-7-7 7-7"/>
//               </svg>
//               All Categories
//             </button>
//           </div>
//         )}

//         {/* Loading */}
//         {loading && (
//           <div>
//             {[0,1,2].map(s => (
//               <div key={s} className="mb-16">
//                 <div className="h-6 bg-rose-200 rounded w-40 mb-5 animate-pulse" />
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
//                   {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Error */}
//         {error && (
//           <div className="flex flex-col items-center justify-center py-24 text-center">
//             <div className="text-5xl mb-4">⚠️</div>
//             <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to load products</h3>
//             <p className="text-sm text-slate-400 mb-6">{error}</p>
//             <button
//               onClick={() => window.location.reload()}
//               className="px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors"
//             >
//               Try Again
//             </button>
//           </div>
//         )}

//         {/* Products grouped by category */}
//         {!loading && !error && (
//           <>
//             {displayGroups.length === 0 ? (
//               <div className="flex flex-col items-center justify-center py-24 text-center">
//                 <div className="text-5xl mb-4">🔍</div>
//                 <h3 className="text-lg font-bold text-slate-800 mb-2">No products found</h3>
//                 <p className="text-sm text-slate-400 mb-6">
//                   {debouncedSearch ? `No results for "${debouncedSearch}"` : "No products in this category yet."}
//                 </p>
//                 <button
//                   onClick={() => { setActiveCategory(null); setSearch(""); }}
//                   className="px-5 py-2.5 bg-rose-900 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors"
//                 >
//                   Browse All
//                 </button>
//               </div>
//             ) : (
//               displayGroups.map(cat => (
//                 <CategorySection
//                   key={cat.id}
//                   category={cat}
//                   products={cat.products}
//                   activeSubcategory={subcategoryFilters[cat.id] || null}
//                   onSubcategoryClick={(sub) => handleSubcategoryClick(cat.id, sub)}
//                 />
//               ))
//             )}
//           </>
//         )}
//       </main>

//       {/* Footer */}
//       <footer className="bg-rose-900 text-slate-400 mt-10">
//         <div className="container mx-auto px-4 lg:px-8 py-12">
//           <div className="flex flex-col md:flex-row justify-between gap-8">
//             <div>
//               <div className="flex items-center gap-2 mb-3">
//                 <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
//                   <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
//                     <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
//                   </svg>
//                 </div>
//                 <span className="text-white font-black text-lg">PartStore</span>
//               </div>
//               <p className="text-sm leading-relaxed max-w-xs">
//                 Your trusted marketplace for genuine parts and electronics across Nigeria.
//               </p>
//             </div>
//             <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
//               {[
//                 { title: "Categories", links: partCategories.map(c => c.name).slice(0,4) },
//                 { title: "Support", links: ["Help Center","Track Order","Returns","Contact Us"] },
//                 { title: "Company", links: ["About Us","Careers","Blog","Press"] },
//               ].map(col => (
//                 <div key={col.title}>
//                   <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest">{col.title}</h4>
//                   <ul className="flex flex-col gap-2">
//                     {col.links.map(l => (
//                       <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
//                     ))}
//                   </ul>
//                 </div>
//               ))}
//             </div>
//           </div>
//           <div className="border-t border-slate-800 mt-10 pt-6 text-xs text-center">
//             © {new Date().getFullYear()} PartStore. All rights reserved.
//           </div>
//         </div>
//       </footer>
//     </div>
//   );
// }




import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

// ─── Category Data ────────────────────────────────────────────────────────────
const partCategories = [
  {
    id: "car-parts", name: "Car Parts", icon: "🚗",
    subcategories: ["Engine Parts","Brake System","Suspension","Transmission","Electrical","Body Parts","Wheels & Tyres","Interior Parts","Exhaust System","Cooling System"]
  },
  {
    id: "electronics", name: "Electronics Parts", icon: "📱",
    subcategories: ["Smartphones","Laptops & Computers","Tablets","Headphones & Earbuds","Smart Watches","Chargers & Cables","Speakers","Cameras","Gaming Consoles","Accessories"]
  },
  {
    id: "phone-parts", name: "Phone Parts", icon: "🔧",
    subcategories: ["Screens","Batteries","Charging Ports","Cameras","Motherboards","Speakers & Microphones","Casings","Buttons & Flex Cables"]
  },
  {
    id: "home-appliances", name: "Home Appliances parts", icon: "🏠",
    subcategories: ["Refrigerators","Washing Machines","Air Conditioners","Microwaves","Blenders","Generators","Fans","Water Heaters"]
  },
  {
    id: "tools", name: "Tools & Equipment", icon: "🔩",
    subcategories: ["Power Tools","Hand Tools","Safety Equipment","Measuring Tools","Workshop Equipment","Welding Equipment"]
  },
  {
    id: "accessories", name: "Accessories", icon: "🎒",
    subcategories: ["Bags & Cases","Mounts & Holders","Protective Gear","Cleaning Kits","Storage Solutions"]
  },
];

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "";
const API_URL = `${BACKEND_URL}/api/inventory/parts`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatPrice = (n) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

const getPrimary = (images) =>
  images?.find((i) => i.isPrimary)?.url || images?.[0]?.url || null;

function StarRating({ rating = 0 }) {
  return (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((n) => (
        <svg key={n} width="11" height="11" viewBox="0 0 24 24" fill={rating >= n ? "#F59E0B" : "none"}
          stroke={rating >= n ? "#F59E0B" : "#D1D5DB"} strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ))}
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }) {
  const [imgError, setImgError] = useState(false);
    const slug = product?.name?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-");
  const [hovered, setHovered] = useState(false);
  const img = getPrimary(product.images);
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const displayPrice = isOnSale ? product.salePrice : product.price;
  const discount = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= (product.lowStockThreshold || 10);
  const isOutOfStock = product.stockQuantity === 0 || product.status === "out_of_stock";

  return (
    <div
      className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 transition-all duration-300 cursor-pointer flex flex-col"
      style={{ boxShadow: hovered ? "0 20px 50px -10px rgba(15,23,42,0.15)" : "0 2px 12px rgba(15,23,42,0.06)" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <Link to={`/product/${slug}`}>
          <div className="relative overflow-hidden bg-rose-50" style={{ paddingBottom: "75%" }}>
        <div className="absolute inset-0">
          {img && !imgError ? (
            <img
              src={img} alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-slate-100 to-slate-200">
              {partCategories.find(c => c.id === product.category)?.icon || "📦"}
            </div>
          )}
        </div>

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {isOnSale && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full tracking-wide uppercase">
              -{discount}%
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Low Stock
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-rose-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Quick add */}
        <div
          className="absolute bottom-0 left-0 right-0 flex items-center justify-center pb-3 pt-8 transition-all duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
            background: "linear-gradient(to top, rgba(255,255,255,0.95) 60%, transparent)"
          }}
        >
          <button
            disabled={isOutOfStock}
            className="flex items-center gap-1.5 bg-rose-900 text-white text-xs font-bold px-5 py-2 rounded-full hover:bg-rose-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
            {isOutOfStock ? "Out of Stock" : "Add to Cart"}
          </button>
        </div>
      </div>
      </Link>
  

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-2 flex-1">
        {product.brand && (
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{product.brand}</span>
        )}
        <h3 className="text-sm font-bold text-slate-800 leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {product.name}
        </h3>
        {product.subCategoryPart && (
          <span className="text-[10px] text-indigo-500 font-semibold bg-rose-50 px-2 py-0.5 rounded-full self-start">
            {product.subCategoryPart}
          </span>
        )}

        <div className="flex items-center gap-1.5">
          <StarRating rating={product.ratings} />
          <span className="text-[10px] text-slate-400">({product.sold || 0} sold)</span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-1">
          <div>
            <p className="text-base font-black text-slate-900">{formatPrice(displayPrice)}</p>
            {isOnSale && (
              <p className="text-xs text-slate-400 line-through">{formatPrice(product.price)}</p>
            )}
          </div>
          {product.stockQuantity > 0 && !isOutOfStock && (
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {product.stockQuantity} left
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Category Section ─────────────────────────────────────────────────────────
function CategorySection({ category, products, onSubcategoryClick, activeSubcategory }) {
  const filtered = activeSubcategory
    ? products.filter(p => p.subCategoryPart === activeSubcategory || p.subCategory === activeSubcategory)
    : products;

  if (filtered.length === 0) return null;

  return (
    <section className="mb-16">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{category.icon}</span>
          <div>
            <h2 className="text-xl font-black text-slate-900 tracking-tight">{category.name}</h2>
            <p className="text-xs text-slate-400 font-medium">{filtered.length} products</p>
          </div>
        </div>
        <a href="#" className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors">
          View all
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>

      {/* Subcategory chips */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button
          onClick={() => onSubcategoryClick(null)}
          className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
            !activeSubcategory
              ? "bg-rose-900 text-white border-slate-900"
              : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
          }`}
        >
          All
        </button>
        {category.subcategories.map(sub => {
          const count = products.filter(p => p.subCategoryPart === sub || p.subCategory === sub).length;
          if (count === 0) return null;
          return (
            <button
              key={sub}
              onClick={() => onSubcategoryClick(activeSubcategory === sub ? null : sub)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                activeSubcategory === sub
                  ? "bg-rose-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
              }`}
            >
              {sub}
              <span className={`text-[10px] px-1 py-0.5 rounded-full font-bold ${
                activeSubcategory === sub ? "bg-white/20 text-white" : "bg-rose-100 text-slate-500"
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filtered.slice(0, 10).map(p => <ProductCard key={p._id} product={p} />)}
      </div>
    </section>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ activeCategory, onCategoryClick, cartCount }) {
  const [openMenu, setOpenMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const btnRefs = useRef({});
  const dropdownRef = useRef(null);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 40);
      // Close any open dropdown on scroll instead of leaving it stranded
      // at a stale position (it's positioned "fixed" relative to viewport).
      setOpenMenu(null);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const clickedTrigger = menuRef.current && menuRef.current.contains(e.target);
      const clickedDropdown = dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!clickedTrigger && !clickedDropdown) setOpenMenu(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const openDropdownFor = (catId) => {
    const el = btnRefs.current[catId];
    if (el) {
      const rect = el.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 6, left: rect.left });
    }
    setOpenMenu(catId);
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? "rgba(255,255,255,0.97)" : "#0F172A",
        backdropFilter: "blur(12px)",
        boxShadow: scrolled ? "0 1px 30px rgba(15,23,42,0.1)" : "none",
      }}
    >
      {/* Top bar */}
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center h-16 gap-6">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-rose-500 rounded-lg flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <span className={`text-xl font-black tracking-tight transition-colors ${scrolled ? "text-slate-900" : "text-white"}`}>
              PartStore
            </span>
          </a>

          {/* Search */}
          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Search parts, electronics, accessories…"
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/10 border border-white/10 text-white placeholder-slate-400 rounded-2xl outline-none focus:bg-white/15 focus:border-white/30 transition-all"
                style={{ background: scrolled ? "#F1F5F9" : undefined, color: scrolled ? "#0F172A" : undefined }}
              />
            </div>
          </div>

          {/* Right icons */}
          <div className="flex items-center gap-2 ml-auto">
            <button className={`relative p-2.5 rounded-xl transition-colors ${scrolled ? "hover:bg-rose-100 text-slate-700" : "hover:bg-white/10 text-white"}`}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              className={`md:hidden p-2.5 rounded-xl transition-colors ${scrolled ? "hover:bg-rose-100 text-slate-700" : "hover:bg-white/10 text-white"}`}
              onClick={() => setMobileOpen(v => !v)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen
                  ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                  : <><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></>
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category nav */}
      <div
        className="border-t transition-colors"
        style={{ borderColor: scrolled ? "#E2E8F0" : "rgba(255,255,255,0.08)" }}
        ref={menuRef}
      >
        <div className="container mx-auto px-4 lg:px-8">
          <nav className="hidden md:flex items-center gap-1 h-11 overflow-x-auto no-scrollbar">
            <button
              onClick={() => onCategoryClick(null)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                !activeCategory
                  ? "bg-rose-500 text-white"
                  : scrolled
                    ? "text-slate-600 hover:bg-rose-100 hover:text-slate-900"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
              }`}
            >
              ✨ All Categories
            </button>

            {partCategories.map(cat => (
              <div key={cat.id} className="relative">
                <button
                  ref={(el) => { btnRefs.current[cat.id] = el; }}
                  onClick={() => {
                    onCategoryClick(cat.id);
                    if (openMenu === cat.id) {
                      setOpenMenu(null);
                    } else {
                      openDropdownFor(cat.id);
                    }
                  }}
                  onMouseEnter={() => openDropdownFor(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                    activeCategory === cat.id
                      ? "bg-rose-500 text-white"
                      : scrolled
                        ? "text-slate-600 hover:bg-rose-100 hover:text-slate-900"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    style={{ transform: openMenu === cat.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>

                {/* Dropdown — rendered through a portal into document.body so it
                    escapes the nav's overflow-x-auto clipping and always sits
                    above the Hero section, regardless of stacking context. */}
                {openMenu === cat.id && createPortal(
                  <div
                    ref={dropdownRef}
                    className="fixed bg-white rounded-2xl shadow-2xl border border-slate-100 p-3 min-w-[220px] z-[9999] grid grid-cols-2 gap-1"
                    style={{
                      top: dropdownPos.top,
                      left: dropdownPos.left,
                      animation: "dropIn 0.15s ease-out",
                    }}
                    onMouseLeave={() => setOpenMenu(null)}
                  >
                    <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }`}</style>
                    {cat.subcategories.map(sub => (
                      <button
                        key={sub}
                        onClick={() => { onCategoryClick(cat.id); setOpenMenu(null); }}
                        className="text-left text-xs text-slate-600 hover:text-indigo-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-lg transition-colors font-medium"
                      >
                        {sub}
                      </button>
                    ))}
                  </div>,
                  document.body
                )}
              </div>
            ))}
          </nav>

          {/* Mobile nav */}
          {mobileOpen && (
            <div className="md:hidden pb-4 pt-2 flex flex-col gap-1">
              <button
                onClick={() => { onCategoryClick(null); setMobileOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white hover:bg-white/10"
              >
                ✨ All Categories
              </button>
              {partCategories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => { onCategoryClick(cat.id); setMobileOpen(false); }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-slate-300 hover:bg-white/10 hover:text-white"
                >
                  <span>{cat.icon}</span>{cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onExplore }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-rose-900 via-indigo-950 to-red-900 py-20 lg:py-28">
      {/* Decorative grid */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
        backgroundSize: "40px 40px"
      }} />
      {/* Glow blobs */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-rose-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mb-6">
            <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-pulse" />
            <span className="text-indigo-300 text-xs font-semibold tracking-wide">Genuine Parts · Fast Shipping</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-white leading-[1.05] tracking-tight mb-5">
            Every Part You Need,<br />
            <span className="text-transparent" style={{ WebkitTextStroke: "1.5px rgba(165,180,252,0.6)" }}>
              Right Here.
            </span>
          </h1>
          <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
            Car parts, electronics, phone components & more — sourced from verified sellers across Nigeria.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onExplore}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-400 text-white font-bold px-6 py-3 rounded-2xl transition-all hover:-translate-y-0.5 text-sm shadow-lg shadow-indigo-500/25"
            >
              Shop Now
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
            <Link to='/categories'>
               <button className="flex items-center gap-2 bg-white/5 border border-white/10 text-white font-semibold px-6 py-3 rounded-2xl hover:bg-white/10 transition-all text-sm">
              Browse Categories
            </button>
            </Link>
         
          </div>

          <div className="flex flex-wrap gap-6 mt-12 pt-8 border-t border-white/10">
            {[["✓", "Verified Sellers"],["⚡", "Fast Delivery"],["🛡️", "Buyer Protection"]].map(([ico, txt]) => (
              <div key={txt} className="flex items-center gap-2 text-slate-400 text-sm">
                <span className="text-slate-300">{ico}</span>{txt}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
      <div className="bg-rose-100" style={{ paddingBottom: "75%" }} />
      <div className="p-3.5 flex flex-col gap-2.5">
        <div className="h-2.5 bg-rose-100 rounded w-1/3" />
        <div className="h-3.5 bg-rose-100 rounded w-5/6" />
        <div className="h-3 bg-rose-100 rounded w-4/6" />
        <div className="h-5 bg-rose-100 rounded w-2/5 mt-1" />
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Eparts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [subcategoryFilters, setSubcategoryFilters] = useState({});
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const productsRef = useRef(null);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        // Handle common API shapes: { data: [...] }, { products: [...] }, or plain array
        const arr = Array.isArray(json) ? json : json.data || json.products || [];
        setProducts(arr);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCategoryClick = (catId) => {
    setActiveCategory(catId);
    if (catId) {
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    }
  };

  const handleSubcategoryClick = useCallback((catId, sub) => {
    setSubcategoryFilters(prev => ({ ...prev, [catId]: sub }));
  }, []);

  // Group products by category
  const grouped = partCategories.map(cat => ({
    ...cat,
    products: products.filter(p => {
      const matchCat = p.category === cat.id || p.whatPart === cat.id;
      const matchSearch = !debouncedSearch ||
        p.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.brand?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        p.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      return matchCat && matchSearch;
    })
  })).filter(cat => cat.products.length > 0);

  const displayGroups = activeCategory
    ? grouped.filter(g => g.id === activeCategory)
    : grouped;

  // Quick stats
  const totalProducts = products.length;
  const onSale = products.filter(p => p.salePrice && p.salePrice < p.price).length;
  const inStock = products.filter(p => p.stockQuantity > 0).length;

  return (
    <div className="min-h-screen bg-rose-50" style={{ fontFamily: "'Plus Jakarta Sans', 'DM Sans', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        * { box-sizing: border-box; }
      `}</style>

      <Navbar
        activeCategory={activeCategory}
        onCategoryClick={handleCategoryClick}
        cartCount={0}
      />

      <Hero onExplore={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })} />

      {/* Stats bar */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-4 lg:px-8 py-4 flex flex-wrap gap-6 items-center">
          {[
            { label: "Total Products", value: totalProducts, color: "text-slate-900" },
            { label: "On Sale", value: onSale, color: "text-red-600" },
            { label: "In Stock", value: inStock, color: "text-emerald-600" },
            { label: "Categories", value: partCategories.length, color: "text-indigo-600" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-2">
              <span className={`text-lg font-black ${s.color}`}>{s.value}</span>
              <span className="text-xs text-slate-400 font-medium">{s.label}</span>
            </div>
          ))}

          {/* Search — mobile visible */}
          <div className="ml-auto hidden sm:flex relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="pl-9 pr-4 py-2 text-sm bg-rose-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-400 w-56 transition-all text-slate-800 placeholder-slate-400"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M18 6 6 18M6 6l12 12"/>
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main ref={productsRef} className="container mx-auto px-4 lg:px-8 py-10">

        {/* Active category header */}
        {activeCategory && (
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{partCategories.find(c => c.id === activeCategory)?.icon}</span>
              <div>
                <h1 className="text-2xl font-black text-slate-900">
                  {partCategories.find(c => c.id === activeCategory)?.name}
                </h1>
                <p className="text-sm text-slate-400">
                  {displayGroups[0]?.products?.length || 0} products
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveCategory(null)}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 transition-colors font-semibold"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              All Categories
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div>
            {[0,1,2].map(s => (
              <div key={s} className="mb-16">
                <div className="h-6 bg-rose-200 rounded w-40 mb-5 animate-pulse" />
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-5xl mb-4">⚠️</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Failed to load products</h3>
            <p className="text-sm text-slate-400 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-rose-600 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Products grouped by category */}
        {!loading && !error && (
          <>
            {displayGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">No products found</h3>
                <p className="text-sm text-slate-400 mb-6">
                  {debouncedSearch ? `No results for "${debouncedSearch}"` : "No products in this category yet."}
                </p>
                <button
                  onClick={() => { setActiveCategory(null); setSearch(""); }}
                  className="px-5 py-2.5 bg-rose-900 text-white text-sm font-bold rounded-xl hover:bg-rose-700 transition-colors"
                >
                  Browse All
                </button>
              </div>
            ) : (
              displayGroups.map(cat => (
                <CategorySection
                  key={cat.id}
                  category={cat}
                  products={cat.products}
                  activeSubcategory={subcategoryFilters[cat.id] || null}
                  onSubcategoryClick={(sub) => handleSubcategoryClick(cat.id, sub)}
                />
              ))
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-rose-900 text-slate-400 mt-10">
        <div className="container mx-auto px-4 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-rose-500 rounded-lg flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  </svg>
                </div>
                <span className="text-white font-black text-lg">PartStore</span>
              </div>
              <p className="text-sm leading-relaxed max-w-xs">
                Your trusted marketplace for genuine parts and electronics across Nigeria.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8 text-sm">
              {[
                { title: "Categories", links: partCategories.map(c => c.name).slice(0,4) },
                { title: "Support", links: ["Help Center","Track Order","Returns","Contact Us"] },
                { title: "Company", links: ["About Us","Careers","Blog","Press"] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-white font-bold mb-3 text-xs uppercase tracking-widest">{col.title}</h4>
                  <ul className="flex flex-col gap-2">
                    {col.links.map(l => (
                      <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 text-xs text-center">
            © {new Date().getFullYear()} PartStore. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}