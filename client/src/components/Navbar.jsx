import { useState } from 'react';
import appConfig from '../config/AppConfig';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Play } from 'lucide-react';
import { Link, Links } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, logout } = useAuth();

  const primary = appConfig.colors.primary;
  const primaryHover = appConfig.colors.primaryHover;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
          <div className="flex items-center gap-3">
          
            <div 
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ 
                background: `linear-gradient(to bottom right, ${primary}, ${appConfig.colors.primaryLight})` 
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

               

          {/* Static Navigation Links */}
          <div className="hidden md:flex items-center gap-10">
           {isAuthenticated ? (
              <>
                <Link 
                  to="/business" 
                  className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  Businesses
                </Link>
              
              </>
            ) : (
              <>
            
        
             
              </>
            )}
            {/* <a href="#pricing" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
              Pricing
            </a> */}
            <a href="/chain" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
              Distribution chain
            </a>
            <a href="/price-checker" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
              Price Checker
            </a>
            <a href="#about" className="font-medium text-gray-600 hover:text-[#8B1E3F] transition-colors duration-300">
              About Us
            </a>
          </div>

          {/* Right Side */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/dashboard" 
                  className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  Dashboard
                </Link>
                <button 
                  onClick={logout}
                  className="px-6 py-2.5 text-red-600 font-medium hover:bg-red-50 rounded-full transition-all"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
              <Link to='/login'>
                 <button className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-full transition-all">
                  Log in
                </button>
              </Link>
             <Link to='/signup'>
                <button 
                  className="px-6 py-2.5 font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  style={{ 
                    backgroundColor: primary,
                    color: 'white'
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = primaryHover}
                  onMouseOut={(e) => e.target.style.backgroundColor = primary}
                >
                  Get Started Free
                </button>
             </Link>
             
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-gray-700 hover:text-gray-900 transition-colors"
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t shadow-lg">
          <div className="px-6 py-8 flex flex-col gap-6 text-lg">
             {isAuthenticated ? (
              <>
                <Link 
                  to="/business" 
                  className="px-6 py-2.5 font-medium text-gray-700 hover:bg-gray-100 rounded-full transition-all"
                >
                  Businesses
                </Link>
            
              </>
            ) : (
              <>
            
             
              </>
            )}
            <a href="#price-checker" className="font-medium text-gray-700 hover:text-[#8B1E3F]">Price Checker</a>
            <a href="/chain" className="font-medium text-gray-700 hover:text-[#8B1E3F]">Distribution Chain</a>
            <a href="#about" className="font-medium text-gray-700 hover:text-[#8B1E3F]">About Us</a>

            <div className="pt-6 border-t flex flex-col gap-4">
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="py-3 text-black font-medium"
                    onClick={() => setIsOpen(false)}
                  >
                    Go to Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="py-3 text-red-600 font-medium text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                <Link to='/login'>
                                  <button className="py-3 text-gray-700 font-medium text-left">Log in</button>
                </Link>

                <Link to='/signup'>
                      <button 
                    className="py-3 text-white font-semibold rounded-2xl"
                    style={{ backgroundColor: primary }}
                  >
                    Get Started Free
                  </button>
                </Link>
            
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}