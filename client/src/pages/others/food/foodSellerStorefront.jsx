// import { useEffect, useMemo, useState } from "react";

// import { useParams, useNavigate } from "react-router-dom";
// import axios from "axios";
// import {
//   Heart,
//   Star,
//   Clock,
//   MapPin,
//   Eye,
//   Share2,
//   Search,
//   ChevronRight,
//   BadgeCheck,
//   Plus,
//   Minus,
// } from "lucide-react";
// import useUserLocation from "../../../config/useUserLocation";

// import useDistance from "../../../config/useDistance";
// import { addToCart,   incrementCartItem,
//   decrementCartItem,
//   getCartQty,} from "../../../config/cartUtils";

// import AddToCartModal from "./AddToCartModal";
// import CartSummaryModal from "./CartSummaryModal";

// const API = import.meta.env.VITE_BACKEND_URL;

// const formatCount = (n = 0) => {
//   if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
//   if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
//   return `${n}`;
// };

// // Stepper shown on each product row — mounts its own qty from localStorage
// // so rows don't need to lift state up to the page for cart changes.
// function CartStepper({ product }) {
//   const [qty, setQty] = useState(() => getCartQty(product._id));

//   const handleAdd = (e) => {
//     e.stopPropagation();
//     incrementCartItem(product);
//     setQty((q) => q + 1);
//   };

//   const handleRemove = (e) => {
//     e.stopPropagation();
//     decrementCartItem(product._id);
//     setQty((q) => Math.max(0, q - 1));
//   };

//   if (qty === 0) {
//     return (
//       <button
//         onClick={handleAdd}
//         className="absolute -bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
//         aria-label="Add to cart"
//       >
//         <Plus className="w-4 h-4 text-gray-900" />
//       </button>
//     );
//   }

//   return (
//     <div className="absolute -bottom-2 right-0 flex items-center gap-2 bg-white shadow-md border border-gray-100 rounded-full px-1.5 py-1">
//       <button
//         onClick={handleRemove}
//         className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
//         aria-label="Remove one"
//       >
//         <Minus className="w-3.5 h-3.5 text-gray-700" />
//       </button>
//       <span className="text-xs font-bold text-gray-900 w-4 text-center">{qty}</span>
//       <button
//         onClick={handleAdd}
//         className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800"
//         aria-label="Add one"
//       >
//         <Plus className="w-3.5 h-3.5 text-white" />
//       </button>
//     </div>
//   );
// }


// function ProductRow({ product, onOpenModal }) {
//   const primaryImage =
//     product?.images?.find((img) => img.isPrimary)?.url ||
//     product?.images?.[0]?.url ||
//     "/placeholder-food.png";

//   const hasDiscount = product?.salePrice && product.salePrice < product.price;
//   const displayPrice = hasDiscount ? product.salePrice : product.price;
//   const qtyInCart = getCartQty(product._id);

//   return (
//     <div className="flex items-start justify-between gap-4 py-5 border-b border-gray-100 last:border-b-0">
//       <div className="flex-1 min-w-0">
//         <h4 className="font-bold text-gray-900 text-base">{product.name}</h4>
//         <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
//         <div className="mt-3 flex items-center gap-2">
//           {hasDiscount && (
//             <span className="text-sm text-gray-400 line-through">
//               From ₦{product.price.toLocaleString()}
//             </span>
//           )}
//           <span className="text-sm font-semibold text-gray-900">
//             From ₦{displayPrice?.toLocaleString()}
//           </span>
//         </div>
//       </div>

//       <div className="relative shrink-0">
//         <img
//           src={primaryImage}
//           alt={product.name}
//           className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover"
//         />
//         <button
//           onClick={(e) => {
//             e.stopPropagation();
//             onOpenModal(product);
//           }}
//           className="absolute -bottom-2 right-2 min-w-8 h-8 px-2 rounded-full bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
//           aria-label="Add to cart"
//         >
//           {qtyInCart > 0 ? qtyInCart : <Plus className="w-4 h-4" />}
//         </button>
//       </div>
//     </div>
//   );
// }
// export default function SellerStorefront() {
//   const { sellerId } = useParams();
//   const navigate = useNavigate();

//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [activeFilter, setActiveFilter] = useState("All");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [saved, setSaved] = useState(false);

//   const { location: userLocation } = useUserLocation();

//   const [addModalProduct, setAddModalProduct] = useState(null);
// const [showSummaryModal, setShowSummaryModal] = useState(false);
// const [checkoutLoading, setCheckoutLoading] = useState(false);

// const handleContinueFromAdd = () => {
//   setAddModalProduct(null);
//   setShowSummaryModal(true);
// };

// const handleCheckout = async () => {
//   const token = localStorage.getItem("token");

//   if (!token) {
//     localStorage.setItem("redirectAfterLogin", "/checkout");
//     navigate("/login");
//     return;
//   }

//   setCheckoutLoading(true);
//   try {
//     const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
//     await axios.post(
//       `${API}/api/cart/sync`,
//       { items: localCart },
//       { headers: { Authorization: `Bearer ${token}` } }
//     );
//     navigate("/checkout");
//   } catch (err) {
//     console.log("Cart sync failed:", err);
//     navigate("/checkout"); // still proceed — checkout page can fall back to its own server cart
//   } finally {
//     setCheckoutLoading(false);
//   }
// };

//   useEffect(() => {
//     fetchProducts();
//   }, [sellerId]);

//   const fetchProducts = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${API}/api/inventory/all`);
//       const allProducts = response.data?.products || response.data || [];

//       const sellerProducts = allProducts.filter((p) => {
//         const pSellerId = p?.seller?._id || p?.seller;
//         const category = p?.category?.toLowerCase() || "";
//         const isFoodOrGrocery =
//           category.includes("food") || category.includes("groceries");
//         return String(pSellerId) === String(sellerId) && isFoodOrGrocery;
//       });

//       setProducts(sellerProducts);
//     } catch (error) {
//       console.log(error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Business/seller doc lives on any of this seller's products once populated —
//   // grab it from the first one rather than firing a second network request.
//   const seller = products[0]?.seller;

//   const business = seller?.businessProfile || {};
//   const bannerImage =
//     business?.gallery?.find((g) => g.type === "image")?.url ||
//     products[0]?.images?.find((img) => img.isPrimary)?.url ||
//     products[0]?.images?.[0]?.url ||
//     "/placeholder-banner.png";

//   const sellerName = business?.businessName || seller?.username || "Local Seller";

//   const locationStr = [seller?.lga, seller?.state].filter(Boolean).join(", ");
//   const sellerAddress = locationStr ? `${locationStr}, Nigeria` : null;
//   const { distanceText, durationText } = useDistance(userLocation, sellerAddress);

//   const avgRating = useMemo(() => {
//     const reviews = business?.reviews || [];
//     if (!reviews.length) return null;
//     const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
//     return sum / reviews.length;
//   }, [business?.reviews]);

//   // Subcategory tabs, built from whatever this seller's food/grocery products actually have
//   const subCategories = useMemo(() => {
//     const set = new Set();
//     products.forEach((p) => p?.subCategory && set.add(p.subCategory));
//     return ["All", ...Array.from(set)];
//   }, [products]);

//   const filteredGroups = useMemo(() => {
//     const term = searchTerm.trim().toLowerCase();

//     let list = products;

//     if (term) {
//       list = list.filter(
//         (p) =>
//           p?.name?.toLowerCase().includes(term) ||
//           sellerName?.toLowerCase().includes(term)
//       );
//     }

//     if (activeFilter !== "All") {
//       list = list.filter(
//         (p) => p?.subCategory?.toLowerCase() === activeFilter.toLowerCase()
//       );
//     }

//     // group by subCategory so each gets its own heading, like the reference design
//     const groups = {};
//     list.forEach((p) => {
//       const key = p?.subCategory || "Other";
//       if (!groups[key]) groups[key] = [];
//       groups[key].push(p);
//     });

//     return Object.entries(groups);
//   }, [products, activeFilter, searchTerm, sellerName]);

//   if (loading) {
//     return (
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
//         <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
//         <div className="space-y-4">
//           <div className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
//           <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10">
//       {/* Breadcrumb */}
//       <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 tracking-wide">
//         <span className="cursor-pointer" onClick={() => navigate("/")}>
//           HOME
//         </span>
//         <ChevronRight className="w-3.5 h-3.5" />
//         <span className="text-gray-900">RESTAURANTS</span>
//       </div>

//       <div className="mt-4 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
//         {/* LEFT: business panel */}
//         <div className="lg:sticky lg:top-6 lg:self-start">
//           <div className="relative rounded-3xl overflow-hidden">
//             <img
//               src={bannerImage}
//               alt={sellerName}
//               className="w-full h-64 object-cover"
//             />

//             {seller?.profilePicture && (
//               <img
//                 src={seller.profilePicture}
//                 alt={`${sellerName} logo`}
//                 className="absolute bottom-4 left-4 w-14 h-14 rounded-full border-4 border-white object-cover shadow"
//               />
//             )}

//             {durationText && (
//               <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow">
//                 <Clock className="w-4 h-4" /> {durationText}
//               </span>
//             )}

//             <button
//               onClick={() => setSaved((s) => !s)}
//               className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow flex items-center justify-center"
//               aria-label="Save"
//             >
//               <Heart
//                 className={`w-5 h-5 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`}
//               />
//             </button>
//           </div>

//           <h1 className="mt-4 text-2xl font-extrabold text-gray-900">
//             {sellerName}
//           </h1>

//           {business?.verified && (
//             <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
//               <BadgeCheck className="w-4 h-4" /> Verified
//             </div>
//           )}

//           {/* {business?.entityCategory?.length > 0 && (
//             <p className="mt-2 text-sm text-gray-500">
//               {business.entityCategory.join(", ")}
//             </p>
//           )} */}

//           {avgRating !== null && (
//             <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
//               <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
//               <span className="font-semibold">{avgRating.toFixed(1)}</span>
//               <span className="text-gray-400">
//                 ({formatCount(business.reviews.length)}+)
//               </span>
//               <ChevronRight className="w-4 h-4 text-gray-400" />
//             </div>
//           )}

//           {business?.openingHours?.length > 0 && (
//             <p className="mt-3 text-xs font-bold tracking-wide text-gray-700">
//               {business.openingHours[0].toUpperCase()}
//             </p>
//           )}

//           {/* stats: views / likes / shares / distance */}
//           <div className="mt-4 flex items-center gap-4 flex-wrap text-xs text-gray-500">
//             <span className="flex items-center gap-1">
//               <Eye className="w-3.5 h-3.5" /> {formatCount(business?.views)}
//             </span>
//             <span className="flex items-center gap-1">
//               <Heart className="w-3.5 h-3.5" /> {formatCount(business?.likes)}
//             </span>
//             <span className="flex items-center gap-1">
//               <Share2 className="w-3.5 h-3.5" /> {formatCount(business?.shares)}
//             </span>
//             {locationStr && (
//               <span className="flex items-center gap-1">
//                 <MapPin className="w-3.5 h-3.5" /> {locationStr}
//               </span>
//             )}
//             {distanceText && (
//               <span className="flex items-center gap-1">
//                 <MapPin className="w-3.5 h-3.5" /> {distanceText}
//               </span>
//             )}
//           </div>
//         </div>

//         {/* RIGHT: search, filters, menu */}
//         <div>
//           <div className="relative">
//             <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
//             <input
//               type="text"
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//               placeholder={`Search ${sellerName}`}
//               className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:bg-white transition-colors"
//             />
//           </div>

//           <div className="mt-5 flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-100">
//             {subCategories.map((label) => (
//               <button
//                 key={label}
//                 onClick={() => setActiveFilter(label)}
//                 className={`shrink-0 pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
//                   activeFilter === label
//                     ? "border-emerald-600 text-gray-900"
//                     : "border-transparent text-gray-400 hover:text-gray-600"
//                 }`}
//               >
//                 {label}
//               </button>
//             ))}
//           </div>

//           {filteredGroups.length === 0 && (
//             <p className="text-center text-sm text-gray-400 py-16">
//               {searchTerm ? `No results for "${searchTerm}"` : "No items in this category yet."}
//             </p>
//           )}

//           {filteredGroups.map(([groupName, items]) => (
//             <div key={groupName} className="mt-8">
//               <h2 className="text-xl font-extrabold text-gray-900 capitalize">
//                 {groupName}
//               </h2>
//               <div>
//                 {items.map((product) => (
//   <ProductRow key={product._id} product={product} onOpenModal={setAddModalProduct} />
// ))}
//                 {/* {items.map((product) => (
//                   <ProductRow key={product._id} product={product} />
//                 ))} */}
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//       {addModalProduct && (
//   <AddToCartModal
//     product={addModalProduct}
//     allProducts={products}
//     onClose={() => setAddModalProduct(null)}
//     onContinue={handleContinueFromAdd}
//   />
// )}

// {showSummaryModal && (
//   <CartSummaryModal
//     onClose={() => setShowSummaryModal(false)}
//     onCheckout={handleCheckout}
//   />
// )}
//     </div>
//   );
// }








import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Heart, Star, Clock, MapPin, Eye, Share2, Search, ChevronRight,
  BadgeCheck, Plus, Minus, Loader2,
} from "lucide-react";
import useUserLocation from "../../../config/useUserLocation";
import useDistance from "../../../config/useDistance";
import { addToCart, incrementCartItem, decrementCartItem, getCartQty } from "../../../config/cartUtils";
import { useAuth } from "../../../context/AuthContext";


import AddToCartModal from "./AddToCartModal";
import CartSummaryModal from "./CartSummaryModal";
import ReviewModal from "../../order/OrderReviewModal";

const API = import.meta.env.VITE_BACKEND_URL;

const formatCount = (n = 0) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

function CartStepper({ product }) {
  const [qty, setQty] = useState(() => getCartQty(product._id));
  const handleAdd = (e) => { e.stopPropagation(); incrementCartItem(product); setQty((q) => q + 1); };
  const handleRemove = (e) => { e.stopPropagation(); decrementCartItem(product._id); setQty((q) => Math.max(0, q - 1)); };

  if (qty === 0) {
    return (
      <button onClick={handleAdd} className="absolute -bottom-2 right-2 w-8 h-8 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform" aria-label="Add to cart">
        <Plus className="w-4 h-4 text-gray-900" />
      </button>
    );
  }
  return (
    <div className="absolute -bottom-2 right-0 flex items-center gap-2 bg-white shadow-md border border-gray-100 rounded-full px-1.5 py-1">
      <button onClick={handleRemove} className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200" aria-label="Remove one">
        <Minus className="w-3.5 h-3.5 text-gray-700" />
      </button>
      <span className="text-xs font-bold text-gray-900 w-4 text-center">{qty}</span>
      <button onClick={handleAdd} className="w-6 h-6 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gray-800" aria-label="Add one">
        <Plus className="w-3.5 h-3.5 text-white" />
      </button>
    </div>
  );
}

function ProductRow({ product, onOpenModal }) {
  const primaryImage = product?.images?.find((img) => img.isPrimary)?.url || product?.images?.[0]?.url || "/placeholder-food.png";
  const hasDiscount = product?.salePrice && product.salePrice < product.price;
  const displayPrice = hasDiscount ? product.salePrice : product.price;
  const qtyInCart = getCartQty(product._id);

  return (
    <div className="flex items-start justify-between gap-4 py-5 border-b border-gray-100 last:border-b-0">
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-900 text-base">{product.name}</h4>
        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description}</p>
        <div className="mt-3 flex items-center gap-2">
          {hasDiscount && <span className="text-sm text-gray-400 line-through">From ₦{product.price.toLocaleString()}</span>}
          <span className="text-sm font-semibold text-gray-900">From ₦{displayPrice?.toLocaleString()}</span>
        </div>
      </div>
      <div className="relative shrink-0">
        <img src={primaryImage} alt={product.name} className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover" />
        <button
          onClick={(e) => { e.stopPropagation(); onOpenModal(product); }}
          className="absolute -bottom-2 right-2 min-w-8 h-8 px-2 rounded-full bg-emerald-600 text-white shadow-md flex items-center justify-center gap-1 hover:bg-emerald-700 hover:scale-105 active:scale-95 transition-all text-xs font-bold"
          aria-label="Add to cart"
        >
          {qtyInCart > 0 ? qtyInCart : <Plus className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
}

// ── REVIEWS SECTION ──────────────────────────────────────────
function ReviewsSection({ sellerId, sellerName }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!sellerId) return;
    fetchReviews();
  }, [sellerId]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/reviews/seller/${sellerId}`, { params: { limit: 4 } });
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleWriteReview = () => {
    if (!isAuthenticated) {
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      navigate("/login");
      return;
    }
    setShowModal(true);
  };

  return (
    <div className="mt-10 border-t border-gray-100 pt-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-extrabold text-gray-900">Reviews</h2>
        <div className="flex items-center gap-2">
          <button onClick={handleWriteReview} className="text-sm font-semibold text-emerald-600 border border-emerald-600 rounded-full px-4 py-2 hover:bg-emerald-50">
            Write a Review
          </button>
        <button
  onClick={() => navigate('/#seller-reviews')}
  className="text-sm font-semibold text-gray-500 flex items-center gap-1"
>
  View all <ChevronRight size={14} />
</button>
        </div>
      </div>

      {loading ? (
        <div className="flex gap-3">
          {[1, 2].map((i) => <div key={i} className="h-24 flex-1 rounded-2xl bg-gray-100 animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-sm text-gray-400">No reviews yet — be the first to review a product from {sellerName}.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">{r.userName}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} className={n <= r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"} />
                  ))}
                </div>
              </div>
              {r.product?.name && <p className="text-xs text-gray-400 mt-0.5">on {r.product.name}</p>}
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
              {r.image && <img src={r.image} alt="" className="mt-3 w-24 h-24 rounded-xl object-cover" />}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ReviewModal sellerId={sellerId} onClose={() => setShowModal(false)} onSuccess={fetchReviews} />
      )}
    </div>
  );
}

export default function SellerStorefront() {
  const { sellerId } = useParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [saved, setSaved] = useState(false);

  const { location: userLocation } = useUserLocation();

  const [addModalProduct, setAddModalProduct] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const handleContinueFromAdd = () => {
    setAddModalProduct(null);
    setShowSummaryModal(true);
  };

  const handleCheckout = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "/checkout");
      navigate("/login");
      return;
    }
    setCheckoutLoading(true);
    try {
      const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
      await axios.post(`${API}/api/cart/sync`, { items: localCart }, { headers: { Authorization: `Bearer ${token}` } });
      navigate("/checkout");
    } catch (err) {
      console.log("Cart sync failed:", err);
      navigate("/checkout");
    } finally {
      setCheckoutLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [sellerId]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/inventory/all`);
      const allProducts = response.data?.products || response.data || [];
      const sellerProducts = allProducts.filter((p) => {
        const pSellerId = p?.seller?._id || p?.seller;
        const category = p?.category?.toLowerCase() || "";
        const isFoodOrGrocery = category.includes("food") || category.includes("groceries");
        return String(pSellerId) === String(sellerId) && isFoodOrGrocery;
      });
      setProducts(sellerProducts);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const seller = products[0]?.seller;
  const business = seller?.businessProfile || {};
  const bannerImage = business?.gallery?.find((g) => g.type === "image")?.url || products[0]?.images?.find((img) => img.isPrimary)?.url || products[0]?.images?.[0]?.url || "/placeholder-banner.png";
  const sellerName = business?.businessName || seller?.username || "Local Seller";
  const locationStr = [seller?.lga, seller?.state].filter(Boolean).join(", ");
  const sellerAddress = locationStr ? `${locationStr}, Nigeria` : null;
  const { distanceText, durationText } = useDistance(userLocation, sellerAddress);

  const avgRating = useMemo(() => {
    const reviews = business?.reviews || [];
    if (!reviews.length) return null;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return sum / reviews.length;
  }, [business?.reviews]);

  const subCategories = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p?.subCategory && set.add(p.subCategory));
    return ["All", ...Array.from(set)];
  }, [products]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    let list = products;
    if (term) {
      list = list.filter((p) => p?.name?.toLowerCase().includes(term) || sellerName?.toLowerCase().includes(term));
    }
    if (activeFilter !== "All") {
      list = list.filter((p) => p?.subCategory?.toLowerCase() === activeFilter.toLowerCase());
    }
    const groups = {};
    list.forEach((p) => {
      const key = p?.subCategory || "Other";
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    });
    return Object.entries(groups);
  }, [products, activeFilter, searchTerm, sellerName]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-10 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8">
        <div className="h-96 rounded-3xl bg-gray-100 animate-pulse" />
        <div className="space-y-4">
          <div className="h-12 rounded-2xl bg-gray-100 animate-pulse" />
          <div className="h-40 rounded-2xl bg-gray-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 sm:mt-10">
      <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 tracking-wide">
        <span className="cursor-pointer" onClick={() => navigate("/")}>HOME</span>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900">RESTAURANTS</span>
      </div>

      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 items-start">
        {/* LEFT: business panel — sticky, stays fixed while the right column scrolls */}
        <div className="lg:sticky lg:top-6 lg:self-start lg:h-fit">
          <div className="relative rounded-3xl overflow-hidden">
            <img src={bannerImage} alt={sellerName} className="w-full h-64 object-cover" />
            {seller?.profilePicture && (
              <img src={seller.profilePicture} alt={`${sellerName} logo`} className="absolute bottom-4 left-4 w-14 h-14 rounded-full border-4 border-white object-cover shadow" />
            )}
            {durationText && (
              <span className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow">
                <Clock className="w-4 h-4" /> {durationText}
              </span>
            )}
            <button onClick={() => setSaved((s) => !s)} className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/95 backdrop-blur shadow flex items-center justify-center" aria-label="Save">
              <Heart className={`w-5 h-5 ${saved ? "fill-red-500 text-red-500" : "text-gray-600"}`} />
            </button>
          </div>

          <h1 className="mt-4 text-2xl font-extrabold text-gray-900">{sellerName}</h1>

          {business?.verified && (
            <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
              <BadgeCheck className="w-4 h-4" /> Verified
            </div>
          )}

          {avgRating !== null && (
            <div className="mt-3 flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer" onClick={() => navigate(`/seller/${sellerId}/reviews`)}>
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-semibold">{avgRating.toFixed(1)}</span>
              <span className="text-gray-400">({formatCount(business.reviews.length)}+)</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          )}

          {business?.openingHours?.length > 0 && (
            <p className="mt-3 text-xs font-bold tracking-wide text-gray-700">{business.openingHours[0].toUpperCase()}</p>
          )}

          <div className="mt-4 flex items-center gap-4 flex-wrap text-xs text-gray-500">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {formatCount(business?.views)}</span>
            <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {formatCount(business?.likes)}</span>
            <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" /> {formatCount(business?.shares)}</span>
            {locationStr && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {locationStr}</span>}
            {distanceText && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {distanceText}</span>}
          </div>

 <div className="mt-6 max-h-[50vh] overflow-y-auto">
  {seller?._id && <ReviewsSection sellerId={seller._id} sellerName={sellerName} />}
</div>

        </div>

        {/* RIGHT: search, filters, menu, reviews */}
        <div>
          <div className="relative">
            <Search className="w-4 h-4 text-emerald-600 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${sellerName}`}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 focus:bg-white transition-colors"
            />
          </div>

          <div className="mt-5 flex gap-6 overflow-x-auto no-scrollbar border-b border-gray-100">
            {subCategories.map((label) => (
              <button
                key={label}
                onClick={() => setActiveFilter(label)}
                className={`shrink-0 pb-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${activeFilter === label ? "border-emerald-600 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-600"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>

          {filteredGroups.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-16">
              {searchTerm ? `No results for "${searchTerm}"` : "No items in this category yet."}
            </p>
          )}

          {filteredGroups.map(([groupName, items]) => (
            <div key={groupName} className="mt-8">
              <h2 className="text-xl font-extrabold text-gray-900 capitalize">{groupName}</h2>
              <div>
                {items.map((product) => (
                  <ProductRow key={product._id} product={product} onOpenModal={setAddModalProduct} />
                ))}
              </div>
            </div>
          ))}

          {/* {seller?._id && <ReviewsSection sellerId={seller._id} sellerName={sellerName} />} */}
        </div>
      </div>

      {addModalProduct && (
        <AddToCartModal product={addModalProduct} allProducts={products} onClose={() => setAddModalProduct(null)} onContinue={handleContinueFromAdd} />
      )}

      {showSummaryModal && (
        <CartSummaryModal onClose={() => setShowSummaryModal(false)} onCheckout={handleCheckout} />
      )}
    </div>
  );
}
