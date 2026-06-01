// import { useState } from "react";
// import { Search, ShoppingCart, User, Heart, Menu, X, MapPin, ChevronDown, Bell } from "lucide-react";
// import appConfig from "../../config/appConfig";

// export default function Navbar() {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const [query, setQuery] = useState("");

//   const NAV_LINKS = ["Electronics", "Fashion", "Home & Living", "Food & Grocery", "Beauty", "Sports"];

//   return (
//     <>
//       <div className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
//         {/* Main bar */}
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex items-center gap-3 py-3">
//             {/* Hamburger - mobile */}
//             <button
//               className="lg:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-600 flex-shrink-0"
//               onClick={() => setMobileOpen(true)}
//             >
//               <Menu size={22} />
//             </button>

//             {/* Logo */}
//             <a href="/" className="flex-shrink-0">
//               <h1
//                 className="text-2xl md:text-3xl font-black tracking-tight leading-none"
//                 style={{ color: appConfig.colors.primary }}
//               >
//                 {appConfig.name}
//               </h1>
//             </a>

//             {/* Delivery location - desktop */}
//             <button className="hidden lg:flex items-center gap-1.5 text-left flex-shrink-0 group pl-2">
//               <MapPin size={16} className="text-gray-400 group-hover:text-[#8B1E3F] transition-colors flex-shrink-0" />
//               <div>
//                 <p className="text-[10px] text-gray-400 leading-none">Deliver to</p>
//                 <p className="text-xs font-bold text-gray-800 flex items-center gap-0.5">Lagos <ChevronDown size={11} /></p>
//               </div>
//             </button>

//             {/* Search */}
//             <div className="flex-1 max-w-2xl">
//               <div className="flex rounded-xl overflow-hidden border-2 transition-all focus-within:shadow-md" style={{ borderColor: appConfig.colors.primary }}>
//                 {/* Category select - desktop */}
//                 <select className="hidden md:block border-r border-gray-200 bg-gray-50 text-xs font-semibold text-gray-600 px-3 outline-none cursor-pointer" style={{ borderRightColor: appConfig.colors.primary + "40" }}>
//                   <option>All</option>
//                   <option>Electronics</option>
//                   <option>Fashion</option>
//                   <option>Food</option>
//                   <option>Beauty</option>
//                 </select>
//                 <input
//                   type="text"
//                   value={query}
//                   onChange={e => setQuery(e.target.value)}
//                   placeholder="Search products, brands and categories..."
//                   className="flex-1 px-4 py-2.5 text-sm outline-none bg-white text-gray-800 placeholder-gray-400 min-w-0"
//                 />
//                 <button
//                   className="px-5 text-white font-semibold flex items-center gap-1.5 transition-opacity hover:opacity-90 flex-shrink-0 text-sm"
//                   style={{ background: appConfig.colors.primary }}
//                 >
//                   <Search size={16} />
//                   <span className="hidden sm:inline">Search</span>
//                 </button>
//               </div>
//             </div>

//             {/* Actions */}
//             <div className="flex items-center gap-1 flex-shrink-0">
//               <button className="hidden md:flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group">
//                 <User size={20} className="text-gray-600 group-hover:text-[#8B1E3F] transition-colors" />
//                 <span className="text-[10px] text-gray-500 font-medium">Account</span>
//               </button>
//               <button className="hidden md:flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group relative">
//                 <Heart size={20} className="text-gray-600 group-hover:text-[#8B1E3F] transition-colors" />
//                 <span className="text-[10px] text-gray-500 font-medium">Wishlist</span>
//               </button>
//               <button className="flex flex-col items-center gap-0.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group relative">
//                 <div className="relative">
//                   <ShoppingCart size={20} className="text-gray-600 group-hover:text-[#8B1E3F] transition-colors" />
//                   <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-white text-[9px] font-bold flex items-center justify-center" style={{ background: appConfig.colors.primary }}>3</span>
//                 </div>
//                 <span className="text-[10px] text-gray-500 font-medium hidden md:block">Cart</span>
//               </button>
//             </div>
//           </div>

//           {/* Category nav - desktop */}
//           <div className="hidden lg:flex items-center gap-1 pb-2 overflow-x-auto no-scrollbar">
//             <button
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold flex-shrink-0"
//               style={{ background: appConfig.colors.primary }}
//             >
//               <Menu size={14} /> All Categories
//             </button>
//             {NAV_LINKS.map(link => (
//               <a
//                 key={link}
//                 href="#"
//                 className="px-3 py-1.5 rounded-lg text-xs font-semibold text-gray-600 hover:text-[#8B1E3F] hover:bg-rose-50 transition-all whitespace-nowrap flex-shrink-0"
//               >
//                 {link}
//               </a>
//             ))}
//             <a href="#" className="ml-auto px-3 py-1.5 rounded-lg text-xs font-bold flex-shrink-0" style={{ color: appConfig.colors.primary }}>
//               🔥 Today's Deals
//             </a>
//           </div>
//         </div>
//       </div>

//       {/* Mobile drawer */}
//       {mobileOpen && (
//         <div className="fixed inset-0 z-[60] flex">
//           <div className="bg-black/50 flex-1" onClick={() => setMobileOpen(false)} />
//           <div className="w-72 bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
//             <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: appConfig.colors.primary + "20" }}>
//               <h2 className="text-lg font-black" style={{ color: appConfig.colors.primary }}>{appConfig.name}</h2>
//               <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-gray-100">
//                 <X size={20} />
//               </button>
//             </div>
//             <div className="p-4 border-b bg-rose-50">
//               <button className="flex items-center gap-3 w-full">
//                 <div className="w-10 h-10 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: appConfig.colors.primary }}>
//                   <User size={18} style={{ color: appConfig.colors.primary }} />
//                 </div>
//                 <div className="text-left">
//                   <p className="text-sm font-bold text-gray-800">Sign In / Register</p>
//                   <p className="text-xs text-gray-500">Access your account</p>
//                 </div>
//               </button>
//             </div>
//             <div className="p-4 space-y-1">
//               <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Categories</p>
//               {NAV_LINKS.map(link => (
//                 <a key={link} href="#" className="flex items-center justify-between p-3 rounded-xl hover:bg-rose-50 transition-colors">
//                   <span className="text-sm font-semibold text-gray-700">{link}</span>
//                   <ChevronDown size={14} className="text-gray-400 -rotate-90" />
//                 </a>
//               ))}
//             </div>
//             <div className="mt-auto p-4 border-t space-y-2">
//               {["Sell on " + appConfig.name, "Track Order", "Help Center"].map(item => (
//                 <a key={item} href="#" className="block p-3 text-sm font-semibold text-gray-600 hover:text-[#8B1E3F] transition-colors">{item}</a>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }


import { useState } from "react";
import { Search, ShoppingCart, User, Heart, Menu, X, MapPin, ChevronDown } from "lucide-react";
import appConfig from "../../config/appConfig";
import { productCategories } from "../../categories/productCategories";

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState("");

    // SLUGIFY FUNCTION
  const slugify = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s&-]/g, "")     // Keep & and -
      .replace(/[\s&]+/g, "-")       // Replace spaces and & with -
      .replace(/-+/g, "-");          // Remove multiple dashes
  };


  return (
    <>
      <div className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 md:px-4">
          <div className="flex items-center gap-2 md:gap-3 py-3">
            
            {/* Hamburger - Mobile */}
            <button
              className="lg:hidden p-2 rounded-xl hover:bg-gray-50 text-gray-600 flex-shrink-0"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={24} />
            </button>

            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <h1
                className="text-2xl md:text-1xl  font-black tracking-tight hidden lg:text-3xl "
                style={{ color: appConfig.colors.primary }}
              >
                {appConfig.name}
              </h1>
            </a>

            {/* Delivery Location - Hidden on small mobile */}
            <button className="hidden md:flex items-center gap-1.5 text-left flex-shrink-0 group">
              <MapPin size={18} className="text-gray-400 group-hover:text-[#8B1E3F]" />
              <div>
                <p className="text-[10px] text-gray-400">Deliver to</p>
                <p className="text-xs font-semibold text-gray-800 flex items-center gap-0.5">
                  Lagos <ChevronDown size={12} />
                </p>
              </div>
            </button>

            {/* Search Bar - Improved Mobile Responsiveness */}
            <div className="flex-1 max-w-xl md:max-w-2xl mx-2 md:mx-4">
              <div 
                className="flex rounded-2xl overflow-hidden border-2 transition-all focus-within:shadow-md"
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
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="hidden md:flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 group">
                <User size={22} className="text-gray-600 group-hover:text-[#8B1E3F]" />
                <span className="text-[10px] text-gray-500 mt-0.5">Account</span>
              </button>

              <button className="hidden md:flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 group">
                <Heart size={22} className="text-gray-600 group-hover:text-[#8B1E3F]" />
                <span className="text-[10px] text-gray-500 mt-0.5">Wishlist</span>
              </button>

              <button className="flex flex-col items-center p-2 rounded-xl hover:bg-gray-50 group relative">
                <div className="relative">
                  <ShoppingCart size={22} className="text-gray-600 group-hover:text-[#8B1E3F]" />
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    style={{ background: appConfig.colors.primary }}
                  >
                    3
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 mt-0.5 hidden md:block">Cart</span>
              </button>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <div className="hidden lg:flex items-center gap-2 pb-3 overflow-x-auto no-scrollbar">
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl text-white text-sm font-semibold whitespace-nowrap"
              style={{ background: appConfig.colors.primary }}
            >
              <Menu size={18} /> All Categories
            </button>

            {productCategories.map((category) => (
              <a
                key={category.id}
               href={`/category/${slugify(category.name)}`} 
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-[#8B1E3F] hover:bg-rose-50 transition-all whitespace-nowrap"
              >
                <span>{category.icon}</span>
                {category.name}
              </a>
            ))}

            <a href="/deals" className="ml-auto px-5 py-2 rounded-xl text-sm font-bold text-orange-600 hover:bg-orange-50 transition-all whitespace-nowrap">
              🔥 Today's Deals
            </a>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer - Unchanged (already good) */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="bg-black/60 flex-1" onClick={() => setMobileOpen(false)} />
          
          <div className="w-80 bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: appConfig.colors.primary + "30" }}>
              <h2 className="text-2xl font-black" style={{ color: appConfig.colors.primary }}>
                {appConfig.name}
              </h2>
              <button onClick={() => setMobileOpen(false)} className="p-2">
                <X size={28} />
              </button>
            </div>

            <div className="p-5 border-b bg-rose-50">
              <button className="flex items-center gap-4 w-full">
                <div className="w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center" style={{ borderColor: appConfig.colors.primary }}>
                  <User size={24} style={{ color: appConfig.colors.primary }} />
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Sign In / Register</p>
                  <p className="text-sm text-gray-500">Access your account & orders</p>
                </div>
              </button>
            </div>

            <div className="p-5">
              <p className="uppercase text-xs font-bold text-gray-400 mb-4">Categories</p>
              {productCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/category/${category.id}`}
                  className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all mb-1 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{category.icon}</span>
                    <span className="font-semibold text-gray-800">{category.name}</span>
                  </div>
                  <ChevronDown size={18} className="text-gray-400 group-hover:rotate-180 transition-transform" />
                </a>
              ))}
            </div>

            <div className="mt-auto border-t p-5 space-y-1">
              {["Sell on " + appConfig.name, "Track Your Order", "Help Center", "Contact Us"].map((item) => (
                <a key={item} href="#" className="block p-4 text-gray-700 hover:bg-gray-50 rounded-2xl font-medium transition-colors">
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

































































