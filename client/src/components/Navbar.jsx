





import { useState, useRef, useEffect } from 'react';
import appConfig from '../config/AppConfig';
import { useAuth } from '../context/AuthContext';
import { productCategories } from '../categories/productCategories';
import { useCart } from '../context/cartContext';
import {
  Home,
  Grid3x3,
  Briefcase,
  User,
  ShoppingCart,
  X,
  Play,
  MarsStrokeIcon,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import ExchangeRateTicker from './home/ExchangeRateTicket';

const slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export default function Navbar() {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();
  const { cartCount } = useCart();
  const location = useLocation();
  const accountMenuRef = useRef(null);

  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const primary = appConfig.colors.primary;
  const primaryHover = appConfig.colors.primaryHover;

  // Exact match for "/", startsWith for everything else so nested routes still count as active
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Close the "My Account" dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(e.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinkClass = (path) =>
    `px-5 py-2.5 rounded-full font-medium transition-all duration-300 ${
      isActive(path) ? 'text-rose-900 font-bold shadow-md' : 'text-gray-600 hover:text-[#8B1E3F] hover:bg-gray-100'
    }`;

  return (
    <>
  
      <nav className="fixed left-0 right-0 z-[100] bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <ExchangeRateTicker />
        <div className="max-w-7xl mt-5  mx-auto px-6">
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
                  <h1 className="text-1xl font-bold tracking-tight text-gray-900">
                    {appConfig.name}
                  </h1>
                  <p className="text-[10px] text-gray-500 -mt-1">BUSINESS MEDIA</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-2 ">
              {!isDashboardRoute && (
                <>
                  <Link
                    to="/"
                    className={navLinkClass('/')}
                    style={isActive('/') ? { background: null } : undefined}
                  >
                    Home
                  </Link>
                  <Link
                    to="/marketplace"
                    className={navLinkClass('/marketplace')}
                    style={isActive('/marketplace') ? { background: null } : undefined}
                  >
                    Marketplace
                  </Link>
                  <Link
                    to="/chain"
                    className={navLinkClass('/chain')}
                    style={isActive('/chain') ? { background: null } : undefined}
                  >
                    Distribution chain
                  </Link>
                  <Link
                    to="/price-checker"
                    className={navLinkClass('/price-checker')}
                    style={isActive('/price-checker') ? { background: null } : undefined}
                  >
                    Price Checker
                  </Link>
                  {isAuthenticated && (
                    <Link
                      to="/business"
                      className={navLinkClass('/business')}
                      style={isActive('/business') ? { background: null } : undefined}
                    >
                      Businesses
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Desktop Right Side — single "My Account" button. Hidden entirely on /dashboard routes. */}
            {!isDashboardRoute && (
              <div className="hidden md:flex items-center relative" ref={accountMenuRef}>
                <button
                  onClick={() => setAccountMenuOpen((o) => !o)}
                  className="flex items-center gap-2 px-6 py-2.5 font-semibold rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 0.6 border-[var(--accent)]"
                  style={{ backgroundColor: 'transparent', color: 'gray-00', "--accent": primary }}
                >
                  <User size={18} />
                  My Account
                  <ChevronDown
                    size={16}
                    className={`transition-transform duration-300 ${accountMenuOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                {accountMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden py-2 z-[110]">
                    {isAuthenticated ? (
                      <>
                        {!isDashboardRoute && (
                          <Link
                            to="/dashboard"
                            onClick={() => setAccountMenuOpen(false)}
                            className="flex items-center gap-3 px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                          >
                            <LayoutDashboard size={18} /> Dashboard
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setAccountMenuOpen(false);
                          }}
                          className="flex items-center gap-3 w-full text-left px-5 py-3 text-red-600 font-medium hover:bg-red-50 transition-colors"
                        >
                          <LogOut size={18} /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                        >
                          <LogIn size={18} /> Log in
                        </Link>
                        <Link
                          to="/signup"
                          onClick={() => setAccountMenuOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 font-semibold hover:bg-gray-50 transition-colors"
                          style={{ color: primary }}
                        >
                          <UserPlus size={18} /> Register
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile secondary row — Business / Price Checker / Distribution chain. Hidden entirely on /dashboard routes. */}
          {!isDashboardRoute && (
            <div className="md:hidden flex items-center justify-center gap-4 pb-2 -mt-5  text-sm overflow-x-auto">
              {isAuthenticated && (
                <Link
                  to="/business"
                  className={`font-medium whitespace-nowrap ${
                    isActive('/business') ? 'font-bold' : 'text-gray-600 hover:text-[#8B1E3F]'
                  }`}
                  style={isActive('/business') ? { color: primary } : undefined}
                >
                  Business
                </Link>
              )}
              <Link
                to="/price-checker"
                className={`font-medium whitespace-nowrap ${
                  isActive('/price-checker') ? 'font-bold' : 'text-gray-600 hover:text-[#8B1E3F]'
                }`}
                style={isActive('/price-checker') ? { color: primary } : undefined}
              >
                Price Checker
              </Link>
              <Link
                to="/chain"
                className={`font-medium whitespace-nowrap ${
                  isActive('/chain') ? 'font-bold' : 'text-gray-600 hover:text-[#8B1E3F]'
                }`}
                style={isActive('/chain') ? { color: primary } : undefined}
              >
                Distribution chain
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Spacer so page content doesn't sit under the fixed nav */}
      <div className="" />

      {/* Mobile bottom app-style nav bar. Hidden entirely on /dashboard routes — only the logo shows there. */}
      {!isDashboardRoute && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.06)]">
          <div className="grid grid-cols-5">
            <Link
              to="/"
              className="flex flex-col items-center justify-center py-2.5 gap-1 active:text-[#8B1E3F]"
              style={{ color: isActive('/') ? primary : undefined }}
            >
              <Home size={22} className={isActive('/') ? '' : 'text-gray-600'} />
              <span className="text-[11px] font-medium">Home</span>
            </Link>

            <button
              onClick={() => setCategoryOpen(true)}
              className="flex flex-col items-center justify-center py-2.5 gap-1 text-gray-600 active:text-[#8B1E3F]"
            >
              <Grid3x3 size={22} />
              <span className="text-[11px] font-medium">Category</span>
            </button>

            <Link
              to="/cart"
              className="relative flex flex-col items-center justify-center py-2.5 gap-1 active:text-[#8B1E3F]"
              style={{ color: isActive('/cart') ? primary : undefined }}
            >
              <span className="relative">
                <ShoppingCart size={22} className={isActive('/cart') ? '' : 'text-gray-600'} />
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

            <Link
              to="/marketplace"
              className="flex flex-col items-center justify-center py-2.5 gap-1 active:text-[#8B1E3F]"
              style={{ color: isActive('/marketplace') ? primary : undefined }}
            >
              <MarsStrokeIcon size={22} className={isActive('/marketplace') ? '' : 'text-gray-600'} />
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
      )}

      {/* Category drawer */}
      {categoryOpen && (
        <div className="fixed inset-0 z-[120] flex">
          <div className="bg-black/60 flex-1" onClick={() => setCategoryOpen(false)} />
          <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: primary + '30' }}>
              <h2 className="text-2xl font-black" style={{ color: primary }}>Categories</h2>
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

      {/* Account drawer — mobile equivalent of the "My Account" dropdown */}
      {accountOpen && (
        <div className="fixed inset-0 z-[120] flex">
          <div className="bg-black/60 flex-1" onClick={() => setAccountOpen(false)} />
          <div className="w-80 max-w-[85%] bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: primary + '30' }}>
              <h2 className="text-2xl font-black" style={{ color: primary }}>Account</h2>
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
                      className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 font-medium text-gray-700 hover:bg-gray-100 rounded-2xl transition-all"
                    >
                      <LayoutDashboard size={18} /> Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      logout();
                      setAccountOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 text-red-600 font-medium hover:bg-red-50 rounded-2xl transition-all"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-2xl transition-all"
                  >
                    <LogIn size={18} /> Log in
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center justify-center gap-2 w-full text-center px-6 py-3 font-semibold rounded-2xl transition-all"
                    style={{ backgroundColor: primary, color: 'white' }}
                  >
                    <UserPlus size={18} /> Register
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