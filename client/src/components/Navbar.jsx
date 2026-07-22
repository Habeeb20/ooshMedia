


// import { useState } from 'react';
// import appConfig from '../config/AppConfig';
// import { useAuth } from '../context/AuthContext';
// // Adjust these import paths to wherever your files actually live
// import { productCategories } from '../categories/productCategories';
// import { useCart } from '../context/cartContext';
// import { Home, Grid3x3, Briefcase, User, ShoppingCart, X, Play, MarsStrokeIcon } from 'lucide-react';
// import { Link } from 'react-router-dom';

// const slugify = (str) =>
//   str
//     .toLowerCase()
//     .trim()
//     .replace(/[^a-z0-9]+/g, '-')
//     .replace(/(^-|-$)/g, '');

// export default function Navbar() {
//   const [categoryOpen, setCategoryOpen] = useState(false);
//   const [accountOpen, setAccountOpen] = useState(false);
//   const { isAuthenticated, logout } = useAuth();
//   const { cartCount } = useCart();

//   const primary = appConfig.colors.primary;
//   const primaryHover = appConfig.colors.primaryHover;

//   return (
//     <>
//       <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
//         <div className="max-w-7xl mx-auto px-6">
//           <div className="flex items-center justify-between h-20">
//             {/* Logo */}
//             <Link to="/" className="flex items-center gap-3">
//               <div className="flex items-center gap-3">
//                 <div
//                   className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
//                   style={{
//                     background: `linear-gradient(to bottom right, ${primary}, ${appConfig.colors.primaryLight})`,
//                   }}
//                 >
//                   <Play className="w-5 h-5 text-white" fill="white" />
//                 </div>
//                 <div>
//                   <h1 className="text-2xl font-bold tracking-tight text-gray-900">
//                     {appConfig.name}
//                   </h1>
//                   <p className="text-[10px] text-gray-500 -mt-1">BUSINESS MEDIA</p>
//                 </div>
//               </div>
//             </Link>

//             {/* Desktop Navigation Links */}
//             <div className="hidden md:flex items-center gap-10">
//               {isAuthenticated ? (
//                 <>
//                  <Link
//                   to="/business"
//                   className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
//                 >
//                   Businesses
//                 </Link>
//                 </>
               
//               ): (
//                 <>
//                   <a href="/" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
//                 Home
//               </a>
//               <a href="/marketplace" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
//                 Marketplace
//               </a>
//               <a href="/chain" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
//                 Distribution chain
//               </a>
//               <a href="/price-checker" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
//                 Price Checker
//               </a>
//                 </>
//               )}
            
//             </div>

//             {/* Desktop Right Side */}
//             <div className="hidden md:flex items-center gap-4">
//               {isAuthenticated ? (
//                 <>
//                   <Link
//                     to="/dashboard"
//                     className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
//                   >
//                     Dashboard
//                   </Link>
//                   <button
//                     onClick={logout}
//                     className="px-6 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-full transition-all"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link to="/login">
//                     <button className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-full transition-all">
//                       Log in
//                     </button>
//                   </Link>
//                   <Link to="/signup">
//                     <button
//                       className="px-6 py-2.5 font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
//                       style={{ backgroundColor: primary, color: 'white' }}
//                       onMouseOver={(e) => (e.target.style.backgroundColor = primaryHover)}
//                       onMouseOut={(e) => (e.target.style.backgroundColor = primary)}
//                     >
//                       Get Started Free
//                     </button>
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>

//           {/* Mobile secondary row — Businesses / Price Checker / Distribution chain, no hamburger */}
//           <div className="md:hidden flex items-center justify-center gap-4 pb-3 -mt-1 text-sm overflow-x-auto">
//             {isAuthenticated && (
//               <a href="/business" className="font-medium text-gray-600 hover:text-[#8B1E3F] whitespace-nowrap">
//                Business
//               </a>
//             )}
//             <a href="/price-checker" className="font-medium text-gray-600 hover:text-[#8B1E3F] whitespace-nowrap">
//               Price Checker
//             </a>
//             <a href="/chain" className="font-medium text-gray-600 hover:text-[#8B1E3F] whitespace-nowrap">
//               Distribution chain
//             </a>
//           </div>
//         </div>
//       </nav>

//       {/* Mobile bottom app-style nav bar */}
//       <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
//         <div className="grid grid-cols-5">
//           <Link to="/" className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]">
//             <Home size={22} />
//             <span className="text-[11px] font-medium">Home</span>
//           </Link>

//           <button
//             onClick={() => setCategoryOpen(true)}
//             className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]"
//           >
//             <Grid3x3 size={22} />
//             <span className="text-[11px] font-medium">Category</span>
//           </button>

//           <Link to="/cart" className="relative flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]">
//             <span className="relative">
//               <ShoppingCart size={22} />
//               {cartCount > 0 && (
//                 <span
//                   className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
//                   style={{ backgroundColor: primary }}
//                 >
//                   {cartCount}
//                 </span>
//               )}
//             </span>
//             <span className="text-[11px] font-medium">Cart</span>
//           </Link>

//           <Link to="/marketplace" className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]">
//             <MarsStrokeIcon size={22} />
//             <span className="text-[11px] font-medium">Marketplace</span>
//           </Link>

//           <button
//             onClick={() => setAccountOpen(true)}
//             className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]"
//           >
//             <User size={22} />
//             <span className="text-[11px] font-medium">Account</span>
//           </button>
//         </div>
//       </div>

//       {/* Category drawer — slides in from the right */}
//       {categoryOpen && (
//         <div className="fixed inset-0 z-[60] flex">
//           <div className="bg-black/60 flex-1" onClick={() => setCategoryOpen(false)} />

//           <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
//             <div
//               className="flex items-center justify-between p-5 border-b"
//               style={{ borderColor: primary + '30' }}
//             >
//               <h2 className="text-2xl font-black" style={{ color: primary }}>
//                 Categories
//               </h2>
//               <button onClick={() => setCategoryOpen(false)} className="p-2">
//                 <X size={28} />
//               </button>
//             </div>

//             <div className="p-5">
//               {productCategories.map((category) => (
//                 <a
//                   key={category.id}
//                   href={`/category/${slugify(category.name)}`}
//                   onClick={() => setCategoryOpen(false)}
//                   className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-[#8B1E3F] hover:bg-rose-50 transition-all"
//                 >
//                   <span className="text-lg">{category.icon}</span>
//                   {category.name}
//                 </a>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Account drawer — slides in from the right */}
//       {accountOpen && (
//         <div className="fixed inset-0 z-[60] flex">
//           <div className="bg-black/60 flex-1" onClick={() => setAccountOpen(false)} />

//           <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
//             <div
//               className="flex items-center justify-between p-5 border-b"
//               style={{ borderColor: primary + '30' }}
//             >
//               <h2 className="text-2xl font-black" style={{ color: primary }}>
//                 Account
//               </h2>
//               <button onClick={() => setAccountOpen(false)} className="p-2">
//                 <X size={28} />
//               </button>
//             </div>

//             <div className="p-5 flex flex-col gap-3">
//               {isAuthenticated ? (
//                 <>
//                   <Link
//                     to="/dashboard"
//                     onClick={() => setAccountOpen(false)}
//                     className="w-full text-center px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
//                   >
//                     Dashboard
//                   </Link>
//                   <button
//                     onClick={() => {
//                       logout();
//                       setAccountOpen(false);
//                     }}
//                     className="w-full text-center px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-2xl transition-all"
//                   >
//                     Logout
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <Link
//                     to="/login"
//                     onClick={() => setAccountOpen(false)}
//                     className="w-full text-center px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-2xl transition-all"
//                   >
//                     Log in
//                   </Link>
//                   <Link
//                     to="/signup"
//                     onClick={() => setAccountOpen(false)}
//                     className="w-full text-center px-6 py-3 font-semibold rounded-2xl transition-all"
//                     style={{ backgroundColor: primary, color: 'white' }}
//                   >
//                     Get Started Free
//                   </Link>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }




import { useState } from 'react';
import appConfig from '../config/AppConfig';
import { useAuth } from '../context/AuthContext';
// Adjust these import paths to wherever your files actually live
import { productCategories } from '../categories/productCategories';
import { useCart } from '../context/cartContext';
import { Home, Grid3x3, Briefcase, User, ShoppingCart, X, Play, MarsStrokeIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function Navbar() {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();

  // True when the current route is /dashboard or any sub-route of it (e.g. /dashboard/orders)
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const primary = appConfig.colors.primary;
  const primaryHover = appConfig.colors.primaryHover;

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{
                    background: `linear-gradient(to bottom right, ${primary}, ${appConfig.colors.primaryLight})`,
                  }}
                >
                  <Play className="w-5 h-5 text-white" fill="white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                    {appConfig.name}
                  </h1>
                  <p className="text-[10px] text-gray-500 -mt-1">BUSINESS MEDIA</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-10">
              {isAuthenticated && (
                <Link
                  to="/business"
                  className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  Businesses
                </Link>
              )}
              {!isDashboardRoute && (
                <>
                  <a href="/" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
                    Home
                  </a>
                  <a href="/marketplace" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
                    Marketplace
                  </a>
                  <a href="/chain" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
                    Distribution chain
                  </a>
                  <a href="/price-checker" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
                    Price Checker
                  </a>
                </>
              )}
            </div>

            {/* Desktop Right Side */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  {!isDashboardRoute && (
                    <Link
                      to="/dashboard"
                      className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={logout}
                    className="px-6 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-full transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <button className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-full transition-all">
                      Log in
                    </button>
                  </Link>
                  <Link to="/signup">
                    <button
                      className="px-6 py-2.5 font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                      style={{ backgroundColor: primary, color: 'white' }}
                      onMouseOver={(e) => (e.target.style.backgroundColor = primaryHover)}
                      onMouseOut={(e) => (e.target.style.backgroundColor = primary)}
                    >
                      Get Started Free
                    </button>
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile secondary row — Businesses / Price Checker / Distribution chain, no hamburger */}
          <div className="md:hidden flex items-center justify-center gap-4 pb-3 -mt-1 text-sm overflow-x-auto">
            {isAuthenticated && (
              <a href="/business" className="font-medium text-gray-600 hover:text-[#8B1E3F] whitespace-nowrap">
                Business
              </a>
            )}
            {!isDashboardRoute && (
              <>
                <a href="/price-checker" className="font-medium text-gray-600 hover:text-[#8B1E3F] whitespace-nowrap">
                  Price Checker
                </a>
                <a href="/chain" className="font-medium text-gray-600 hover:text-[#8B1E3F] whitespace-nowrap">
                  Distribution chain
                </a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile bottom app-style nav bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
        <div className="grid grid-cols-5">
          <Link to="/" className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]">
            <Home size={22} />
            <span className="text-[11px] font-medium">Home</span>
          </Link>

          <button
            onClick={() => setCategoryOpen(true)}
            className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]"
          >
            <Grid3x3 size={22} />
            <span className="text-[11px] font-medium">Category</span>
          </button>

          <Link to="/cart" className="relative flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]">
            <span className="relative">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                  style={{ backgroundColor: primary }}
                >
                  {cartCount}
                </span>
              )}
            </span>
            <span className="text-[11px] font-medium">Cart</span>
          </Link>

          <Link to="/marketplace" className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]">
            <MarsStrokeIcon size={22} />
            <span className="text-[11px] font-medium">Marketplace</span>
          </Link>

          <button
            onClick={() => setAccountOpen(true)}
            className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]"
          >
            <User size={22} />
            <span className="text-[11px] font-medium">Account</span>
          </button>
        </div>
      </div>

      {/* Category drawer — slides in from the right */}
      {categoryOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="bg-black/60 flex-1" onClick={() => setCategoryOpen(false)} />

          <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: primary + '30' }}
            >
              <h2 className="text-2xl font-black" style={{ color: primary }}>
                Categories
              </h2>
              <button onClick={() => setCategoryOpen(false)} className="p-2">
                <X size={28} />
              </button>
            </div>

            <div className="p-5">
              {productCategories.map((category) => (
                <a
                  key={category.id}
                  href={`/category/${slugify(category.name)}`}
                  onClick={() => setCategoryOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:text-[#8B1E3F] hover:bg-rose-50 transition-all"
                >
                  <span className="text-lg">{category.icon}</span>
                  {category.name}
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Account drawer — slides in from the right */}
      {accountOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="bg-black/60 flex-1" onClick={() => setAccountOpen(false)} />

          <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div
              className="flex items-center justify-between p-5 border-b"
              style={{ borderColor: primary + '30' }}
            >
              <h2 className="text-2xl font-black" style={{ color: primary }}>
                Account
              </h2>
              <button onClick={() => setAccountOpen(false)} className="p-2">
                <X size={28} />
              </button>
            </div>

            <div className="p-5 flex flex-col gap-3">
              {isAuthenticated ? (
                <>
                  {!isDashboardRoute && (
                    <Link
                      to="/dashboard"
                      onClick={() => setAccountOpen(false)}
                      className="w-full text-center px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                    }}
                    className="w-full text-center px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-2xl transition-all"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setAccountOpen(false)}
                    className="w-full text-center px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-2xl transition-all"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setAccountOpen(false)}
                    className="w-full text-center px-6 py-3 font-semibold rounded-2xl transition-all"
                    style={{ backgroundColor: primary, color: 'white' }}
                  >
                    Get Started Free
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}