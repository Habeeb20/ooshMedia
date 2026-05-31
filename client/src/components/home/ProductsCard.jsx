
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";

// import {
//   Loader2,
//   Heart,
//   Eye,
//   ShoppingCart,
//   Star,
// } from "lucide-react";

// import axios from "axios";
// import appConfig from "../../config/appConfig";

// export default function ProductsGrid() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // SLUGIFY FUNCTION
//   const slugify = (text) => {
//     return text
//       ?.toLowerCase()
//       ?.replace(/[^\w ]+/g, "")
//       ?.replace(/ +/g, "-");
//   };

//   // FETCH PRODUCTS
//   const fetchProducts = async () => {
//     try {
//       const response = await axios.get(
//         `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
//       );

//       setProducts(
//         response.data?.products || response.data || []
//       );
//     } catch (error) {
//       console.log("PRODUCT FETCH ERROR:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   return (
//     <section className="max-w-7xl mx-auto px-4 mt-10 pb-20">
//       {/* HEADER */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h2 className="text-2xl md:text-3xl font-black text-gray-900">
//             Recommended For You
//           </h2>

//           <p className="text-gray-500 text-sm mt-1">
//             Discover premium products from trusted vendors
//           </p>
//         </div>

//         <button
//           className="hidden md:flex px-5 py-3 rounded-xl text-white font-semibold"
//           style={{
//             background: appConfig.colors.primary,
//           }}
//         >
//           View More
//         </button>
//       </div>

//       {/* LOADING */}
//       {loading ? (
//         <div className="flex justify-center py-20">
//           <Loader2
//             className="animate-spin"
//             size={45}
//             color={appConfig.colors.primary}
//           />
//         </div>
//       ) : (
//         <>
//           {/* EMPTY STATE */}
//           {products.length === 0 ? (
//             <div className="bg-white rounded-3xl py-20 text-center shadow-sm">
//               <h2 className="text-2xl font-bold text-gray-700">
//                 No Products Found
//               </h2>

//               <p className="text-gray-500 mt-3">
//                 Products will appear here when available.
//               </p>
//             </div>
//           ) : (
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
//               {products.map((product) => {
//                 const slug = slugify(product?.name);

//                 return (
//                   <div
//                     key={product._id}
//                     className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group border border-gray-100"
//                   >
//                     {/* IMAGE */}
//                     <Link to={`/product/${slug}`}>
//                       <div className="relative overflow-hidden">
//                         <img
//                           src={
//                             product?.images?.[0]?.url ||
//                             "https://via.placeholder.com/500"
//                           }
//                           alt={product?.name}
//                           className="h-52 md:h-64 w-full object-cover group-hover:scale-105 transition duration-500"
//                         />

//                         {/* SALE TAG */}
//                         {product?.salePrice && (
//                           <div
//                             className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
//                             style={{
//                               background:
//                                 appConfig.colors.primary,
//                             }}
//                           >
//                             SALE
//                           </div>
//                         )}

//                         {/* ACTIONS */}
//                         <div className="absolute top-3 right-3 flex flex-col gap-2">
//                           <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
//                             <Heart size={16} />
//                           </button>

//                           <button className="bg-white rounded-full p-2 shadow-md hover:scale-110 transition">
//                             <Eye size={16} />
//                           </button>
//                         </div>
//                       </div>
//                     </Link>

//                     {/* CONTENT */}
//                     <div className="p-4">
//                       {/* CATEGORY */}
//                       <p
//                         className="text-xs font-semibold uppercase tracking-wider"
//                         style={{
//                           color: appConfig.colors.primary,
//                         }}
//                       >
//                         {product?.category}
//                       </p>

//                       {/* PRODUCT NAME */}
//                       <Link to={`/product/${slug}`}>
//                         <h3 className="font-semibold text-sm md:text-base mt-2 text-gray-800 line-clamp-2 hover:text-[#8B1E3F] transition">
//                           {product?.name}
//                         </h3>
//                       </Link>

//                       {/* DESCRIPTION */}
//                       <p className="text-gray-500 text-xs md:text-sm mt-2 line-clamp-2">
//                         {product?.description}
//                       </p>

//                       {/* PRICE */}
//                       <div className="mt-4">
//                         <p
//                           className="text-lg md:text-2xl font-black"
//                           style={{
//                             color:
//                               appConfig.colors.primary,
//                           }}
//                         >
//                           ₦
//                           {(
//                             product?.salePrice ||
//                             product?.price
//                           )?.toLocaleString()}
//                         </p>

//                         {product?.salePrice && (
//                           <p className="line-through text-gray-400 text-sm">
//                             ₦
//                             {product?.price?.toLocaleString()}
//                           </p>
//                         )}
//                       </div>

//                       {/* STOCK + RATINGS */}
//                       <div className="mt-3 flex items-center justify-between">
//                         <p className="text-xs text-gray-500">
//                           Stock:
//                           <span className="font-bold text-gray-800 ml-1">
//                             {product?.stockQuantity}
//                           </span>
//                         </p>

//                         <div className="flex items-center gap-1 text-amber-400">
//                           <Star
//                             fill="currentColor"
//                             size={14}
//                           />

//                           <span className="text-xs text-gray-700">
//                             {product?.ratings || 0}
//                           </span>
//                         </div>
//                       </div>

//                       {/* SOLD */}
//                       <div className="mt-2">
//                         <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
//                           <div
//                             className="h-full rounded-full"
//                             style={{
//                               width: `${
//                                 product?.sold || 0
//                               }%`,
//                               background:
//                                 appConfig.colors.primary,
//                             }}
//                           />
//                         </div>

//                         <p className="text-[11px] text-gray-500 mt-1">
//                           {product?.sold || 0} sold
//                         </p>
//                       </div>

//                       {/* BUTTON */}
//                       <button
//                         className="w-full py-3 rounded-xl mt-4 text-white font-semibold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
//                         style={{
//                           background:
//                             appConfig.colors.primary,
//                         }}
//                       >
//                         <ShoppingCart size={18} />
//                         Add To Cart
//                       </button>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </>
//       )}
//     </section>
//   );
// }






import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, Heart, Eye, Star, ShoppingCart, TrendingUp, ChevronRight, Zap } from "lucide-react";
import axios from "axios";
import appConfig from "../../config/appConfig";

function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
      <div className="h-44 md:h-52 bg-gray-100" />
      <div className="p-3 space-y-2">
        <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="h-3 bg-gray-100 rounded-full w-4/5" />
        <div className="h-5 bg-gray-100 rounded-full w-1/2 mt-2" />
      </div>
    </div>
  );
}

function ProductCard({ product }) {
  const [wished, setWished] = useState(false);
  const slug = product?.name?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-");
  const price = product?.salePrice || product?.price;
  const hasDiscount = !!product?.salePrice;
  const discountPct = hasDiscount ? Math.round((1 - product.salePrice / product.price) * 100) : 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-rose-100 hover:shadow-lg transition-all duration-300 group flex flex-col">
      {/* Image */}
      <Link to={`/product/${slug}`} className="relative overflow-hidden block flex-shrink-0">
        <div className="h-40 sm:h-48 md:h-52 overflow-hidden bg-gray-50">
          <img
            src={product?.images?.[0]?.url || "https://via.placeholder.com/500x400/f9f9f9/cccccc?text=Product"}
            alt={product?.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black text-white" style={{ background: appConfig.colors.primary }}>
              -{discountPct}%
            </span>
          )}
          {(product?.sold || 0) > 50 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-white flex items-center gap-0.5">
              <Zap size={9} fill="currentColor" /> Hot
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 translate-x-10 group-hover:translate-x-0 transition-transform duration-300">
          <button
            onClick={(e) => { e.preventDefault(); setWished(!wished); }}
            className={`w-7 h-7 rounded-full shadow-md flex items-center justify-center transition-colors ${wished ? "bg-rose-500 text-white" : "bg-white text-gray-500 hover:text-rose-500"}`}
          >
            <Heart size={13} fill={wished ? "currentColor" : "none"} />
          </button>
          <button className="w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center text-gray-500 hover:text-[#8B1E3F] transition-colors">
            <Eye size={13} />
          </button>
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: appConfig.colors.primary }}>
          {product?.category}
        </p>

        <Link to={`/product/${slug}`}>
          <h3 className="text-xs sm:text-sm font-bold text-gray-800 line-clamp-2 hover:text-[#8B1E3F] transition-colors leading-snug">
            {product?.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mt-1.5">
          <div className="flex">
            {[1,2,3,4,5].map(i => (
              <Star key={i} size={10} className={i <= Math.round(product?.ratings || 0) ? "text-amber-400" : "text-gray-200"} fill="currentColor" />
            ))}
          </div>
          <span className="text-[10px] text-gray-400">({product?.ratings || 0})</span>
        </div>

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-base md:text-lg font-black" style={{ color: appConfig.colors.primary }}>
            ₦{price?.toLocaleString()}
          </p>
          {hasDiscount && (
            <p className="text-xs text-gray-400 line-through">₦{product?.price?.toLocaleString()}</p>
          )}
        </div>

        {/* Stock bar */}
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-gray-400">
              {product?.sold || 0} sold
            </span>
            <span className="text-[10px] font-semibold text-gray-500">
              {product?.stockQuantity} left
            </span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min((product?.sold || 0), 100)}%`,
                background: (product?.sold || 0) > 70
                  ? "#ef4444"
                  : (product?.sold || 0) > 40
                  ? "#f59e0b"
                  : appConfig.colors.primary
              }}
            />
          </div>
        </div>

        {/* Add to cart */}
        <button
          className="mt-3 w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-white transition-all hover:opacity-90 active:scale-95"
          style={{ background: appConfig.colors.primary }}
        >
          <ShoppingCart size={13} /> Add to Cart
        </button>
      </div>
    </div>
  );
}

export default function ProductsGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const TABS = [
    { id: "all", label: "All" },
    { id: "trending", label: "🔥 Trending" },
    { id: "new", label: "✨ New Arrivals" },
    { id: "sale", label: "🏷️ On Sale" },
  ];

  const fetchProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`);
      setProducts(res.data?.products || res.data || []);
    } catch (err) {
      console.error("PRODUCT FETCH ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const filtered = activeTab === "sale"
    ? products.filter(p => p.salePrice)
    : activeTab === "trending"
    ? [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0))
    : products;

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8 pb-12">
      {/* Header */}
      <div className="flex items-end justify-between mb-5 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp size={16} style={{ color: appConfig.colors.primary }} />
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: appConfig.colors.primary }}>
              Recommended
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
            Products For You
          </h2>
        </div>
        <button
          className="hidden md:flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-sm font-bold transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ background: appConfig.colors.primary }}
        >
          View All <ChevronRight size={15} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-5">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${
              activeTab === tab.id
                ? "text-white shadow-sm"
                : "bg-white border border-gray-200 text-gray-600 hover:border-[#8B1E3F] hover:text-[#8B1E3F]"
            }`}
            style={activeTab === tab.id ? { background: appConfig.colors.primary } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => <ProductSkeleton key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl py-20 text-center border border-gray-100">
          <div className="text-5xl mb-4">🛍️</div>
          <h3 className="text-lg font-bold text-gray-700">No Products Found</h3>
          <p className="text-sm text-gray-400 mt-2">Products will appear here when available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {filtered.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Mobile view all */}
      <button
        className="md:hidden w-full mt-5 py-3 rounded-2xl font-bold text-sm border-2 transition-colors hover:text-white hover:bg-[#8B1E3F]"
        style={{ borderColor: appConfig.colors.primary, color: appConfig.colors.primary }}
      >
        View All Products
      </button>
    </section>
  );
}