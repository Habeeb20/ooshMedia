

// import { useState } from "react";
// import { Search, ShoppingCart, Menu } from "lucide-react";
// import appConfig from "../../config/appConfig";
// import { productCategories } from "../../categories/productCategories";
// import { useCart } from "../../context/cartContext";
// import { Link, useNavigate } from "react-router-dom";

// export default function Navbar() {
//   const navigate = useNavigate();
//   const [query, setQuery] = useState("");
//   const { cart, cartCount } = useCart();

//   // SLUGIFY FUNCTION
//   const slugify = (text) => {
//     if (!text) return "";
//     return text
//       .toLowerCase()
//       .trim()
//       .replace(/[^\w\s&-]/g, "") // Keep & and -
//       .replace(/[\s&]+/g, "-") // Replace spaces and & with -
//       .replace(/-+/g, "-"); // Remove multiple dashes
//   };

//   return (
//     <>
//       <div className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
//         <div className="max-w-7xl mx-auto px-3 md:px-4">
//           <div className="flex items-center gap-2 md:gap-3 py-3">
//             {/* Logo */}
//             <a href="/" className="flex-shrink-0">
//               <h1
//                 className="text-2xl md:text-1xl font-black tracking-tight hidden lg:text-3xl"
//                 style={{ color: appConfig.colors.primary }}
//               >
//                 {appConfig.name}
//               </h1>
//             </a>

//             {/* Search Bar - now fills all remaining width, cart sits right beside it */}
//             <form
//               onSubmit={(e) => {
//                 e.preventDefault();
//                 if (query.trim()) {
//                   window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
//                 }
//               }}
//               className="flex-1 min-w-0 mx-2 md:mx-4"
//             >
//               <div
//                 className="flex rounded-2xl overflow-hidden border-1 transition-all focus-within:shadow-md"
//                 style={{ borderColor: appConfig.colors.primary }}
//               >
//                 <input
//                   type="text"
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="Search products, brands..."
//                   className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none bg-white placeholder-gray-400 min-w-0"
//                 />
//                 <button
//                   className="px-4 md:px-6 text-white font-semibold flex items-center gap-2 hover:brightness-105 transition-all flex-shrink-0"
//                   style={{ background: appConfig.colors.primary }}
//                 >
//                   <Search size={20} />
//                   <span className="hidden sm:inline">Search</span>
//                 </button>
//               </div>
//             </form>
   

//          {/*
//             <div className="flex items-center gap-1 flex-shrink-0">
//               <Link to="/cart" className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 group relative">
//                 <ShoppingCart size={32} className="text-black  group-hover:text-[#8B1E3F]" />
//                 {cartCount > 0 && (
//                   <span
//                     className="absolute -top-1 -right-1 bg-white border text-[10px] font-black px-1.5 py-0.5 rounded-full leading-none"
//                     style={{ color: appConfig.colors.primary, borderColor: appConfig.colors.primary }}
//                   >
//                     {cartCount}
//                   </span>
//                 )}
//                 cart
//               </Link>
//             </div> */}
    
// {/* Cart - beside the search bar */}
// <div className="flex items-center gap-1 flex-shrink-0">
//   <Link
//     to="/cart"
//     className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 group relative"
//   >
//     <div className="relative">
//       <ShoppingCart size={26} className="text-black group-hover:text-[#8B1E3F]" />
//       {cartCount > 0 && (
//         <span
//           className="absolute -top-1.5 -right-1.5 bg-white border text-[12px] font-black px-1.5 py-0.5 rounded-full leading-none"
//           style={{ color: appConfig.colors.primary, borderColor: appConfig.colors.primary }}
//         >
//           {cartCount}
//         </span>
//       )}
//     </div>
//     <span className="hidden sm:inline text-1xl font-bold text-black group-hover:text-[#8B1E3F]">
//       Cart
//     </span>
//   </Link>
// </div>
//           </div>

//           {/* Desktop Category Navigation */}
//           {/* <div className="hidden lg:flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar">
//             <button
//               className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap"
//               style={{ background: appConfig.colors.primary }}
//             >
//               <Menu size={18} /> All Categories
//             </button>

//             {productCategories.map((category) => (
//               <a
//                 key={category.id}
//                 href={`/category/${slugify(category.name)}`}
//                 className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#8B1E3F] hover:bg-rose-50 transition-all whitespace-nowrap"
//               >
//                 <span>{category.icon}</span>
//                 {category.name}
//               </a>
//             ))}

//             <a href="/deals" className="ml-auto px-5 py-2 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all whitespace-nowrap">
//               🔥 Today's Deals
//             </a>
//           </div> */}
//         </div>
//       </div>

//       {/* Floating "View Cart" button - raised above the mobile bottom nav bar */}
//       {cartCount > 0 && (
//         <button
//           onClick={() => navigate("/cart")}
//           className="fixed bottom-24 md:bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
//           style={{ background: appConfig.colors.primary }}
//         >
//           <ShoppingCart size={22} />
//           <span>View Cart</span>
//           <span className="bg-white text-xs font-black px-2 py-0.5 rounded-full" style={{ color: appConfig.colors.primary }}>
//             {cartCount}
//           </span>
//         </button>
//       )}
//     </>
//   );
// }










import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import appConfig from "../../config/appConfig";
import { useCart } from "../../context/cartContext";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const { cartCount } = useCart();

  return (
    <>

      <div className="bg-white fixed top-0 mt-20 left-0 right-0 w-full z-50 border-b border-gray-100 shadow-sm ">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex items-center gap-2 md:gap-3 py-3">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <h1
                className="text-2xl md:text-1xl font-black tracking-tight hidden lg:text-3xl"
                style={{ color: appConfig.colors.primary }}
              >
                {appConfig.name}
              </h1>
            </a>

            {/* Search Bar - fills remaining width, cart sits right beside it */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (query.trim()) {
                  window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
                }
              }}
              className="flex-1 min-w-0 mx-2 md:mx-4"
            >
              <div
                className="flex rounded-2xl overflow-hidden border-1 transition-all focus-within:shadow-md mt-5"
                style={{ borderColor: appConfig.colors.primary }}
              >
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className="flex-1 px-3 md:px-4 py-2.5 md:py-3 text-sm outline-none bg-white placeholder-gray-400 min-w-0"
                />
                <button
                  className="px-4 md:px-6 text-white font-semibold flex items-center gap-2 hover:brightness-105 transition-all flex-shrink-0"
                  style={{ background: appConfig.colors.primary }}
                >
                  <Search size={20} />
                  <span className="hidden sm:inline">Search</span>
                </button>
              </div>
            </form>

            {/* Cart - beside the search bar */}
            <div className="flex items-center gap-1 mt-5 flex-shrink-0">
              <Link
                to="/cart"
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-gray-50 group relative"
              >
                <div className="relative">
                  <ShoppingCart size={26} className="text-black group-hover:text-[#8B1E3F]" />
                  {cartCount > 0 && (
                    <span
                      className="absolute -top-1.5 -right-1.5 bg-white border text-[12px] font-black px-1.5 py-0.5 rounded-full leading-none"
                      style={{ color: appConfig.colors.primary, borderColor: appConfig.colors.primary }}
                    >
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline text-1xl font-bold text-black group-hover:text-[#8B1E3F]">
                  Cart
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Floating "View Cart" button - raised above the mobile bottom nav bar */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed bottom-24 md:bottom-6 right-6 z-40 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
          style={{ background: appConfig.colors.primary }}
        >
          <ShoppingCart size={22} />
          <span>View Cart</span>
          <span className="bg-white text-xs font-black px-2 py-0.5 rounded-full" style={{ color: appConfig.colors.primary }}>
            {cartCount}
          </span>
        </button>
      )}
    </>
  );
}