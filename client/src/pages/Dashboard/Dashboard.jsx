

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import appConfig from '../../config/AppConfig';
import { 
  Home, Briefcase, Store, PlaySquare, User, LogOut, 
  Package, BarChart3, ChevronDown, ChevronRight 
} from 'lucide-react';

import BottomNav from '../../components/dashboard/BottomNav';
import DashboardHome from '../../components/dashboard/DashboardHome';
import BusinessProfileUpdate from '../../components/dashboard/Profile';
import SellerProfileSetup from '../../components/dashboard/SellerProfile';
import Loading from '../../config/Loading';
import InventoryDashboard from '../inventory/InventoryDashboard';
import ProductList from '../inventory/ProductsList';
import CreatePostModal from '../post/CreatePost';
import FeedPage from '../post/FeedPage';

const Jobs = () => <div className="p-8 text-center text-2xl text-gray-500">Jobs Page - Coming Soon</div>;
const Marketplace = () => <div className="p-8 text-center text-2xl text-gray-500">Marketplace Page - Coming Soon</div>;
const Media = () => <div className="p-8 text-center text-2xl text-gray-500">Media Hub Page - Coming Soon</div>;

const pages = {
  home: DashboardHome,
  post: FeedPage,
  jobs: Jobs,
  marketplace: Marketplace,
  media: Media,
  profile: BusinessProfileUpdate,
  sellerProfile: SellerProfileSetup,
  inventory: InventoryDashboard,
  products: ProductList,
};

export default function Dashboard() {
 const getPageFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get('page') || 'home';
};

const [activePage, setActivePage] = useState(getPageFromURL());
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null);

  const ActiveComponent = pages[activePage];
  const isSeller = dashboardData?.user?.isSeller || false;

  useEffect(() => {
  const params = new URLSearchParams(window.location.search);
  params.set('page', activePage);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}, [activePage]);

  // Fetch Dashboard Data
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error("Please login again");
          window.location.href = '/login';
          return;
        }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await res.json();

        if (data.success) {
          setDashboardData(data);
        } else {
          toast.error(data.message || "Failed to load dashboard");
        }
      } catch (err) {
        console.error(err);
        toast.error("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <Loading text="Loading your dashboard..." />;
  }

  const toggleDropdown = (key) => {
    setOpenDropdown(openDropdown === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar - Desktop */}
      <div className="hidden lg:block fixed top-0 left-0 h-screen w-62 bg-white border-r border-gray-100 z-40 overflow-y-auto shadow-sm">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow"
              style={{ 
                background: `linear-gradient(to bottom right, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})` 
              }}
            >
              <span className="text-white text-2xl">🎥</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{appConfig.name}</h2>
          </div>
        </div>

        <div className="px-4 py-8">
          <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold px-3 mb-5">MAIN MENU</p>
          
          {/* Main Navigation */}
          {[
            { id: 'home', label: 'Dashboard', icon: Home },
            { id: 'post', label: 'Make a post', icon: Home },
            // { id: 'jobs', label: 'Jobs', icon: Briefcase },
            // { id: 'marketplace', label: 'Marketplace', icon: Store },
            // { id: 'media', label: 'Media Hub', icon: PlaySquare },
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'sellerProfile', label: 'Seller Profile', icon: Package },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActivePage(item.id)}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1.5 transition-all font-medium ${
                  isActive 
                    ? 'bg-[#8B1E3F] text-white shadow-sm' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Icon size={22} />
                <span>{item.label}</span>
              </button>
            );
          })}

          {/* Seller Tools Section */}
          {isSeller && (
            <div className="mt-10">
              <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold px-3 mb-5">SELLER TOOLS</p>

              {/* <button
                onClick={() => setActivePage('sellerProfile')}
                className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1.5 transition-all font-medium ${
                  activePage === 'sellerProfile' 
                    ? 'bg-[#8B1E3F] text-white shadow-sm' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Package size={22} />
                <span>Seller Profile</span>
              </button> */}

              {/* Inventory Dropdown */}
              <div>
                <button
                  onClick={() => toggleDropdown('inventory')}
                  className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium hover:bg-gray-100 text-gray-700"
                >
                  <div className="flex items-center gap-4">
                    <BarChart3 size={22} />
                    <span>Inventory</span>
                  </div>
                  {openDropdown === 'inventory' ? 
                    <ChevronDown size={18} /> : 
                    <ChevronRight size={18} />
                  }
                </button>

             
                {openDropdown === 'inventory' && (
                  <div className="ml-11 space-y-1 mt-1 border-l border-gray-200 pl-4">
                    <button
                      onClick={() => {
                        setActivePage('inventory');
                        setOpenDropdown(null);
                        if (sidebarOpen) setSidebarOpen(false);
                      }}
                      className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left font-medium transition"
                    >
                      Stock Management
                    </button>
                    <button
                      onClick={() => {
                        setActivePage('products');
                        setOpenDropdown(null);
                        if (sidebarOpen) setSidebarOpen(false);
                      }}
                      className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left font-medium transition"
                    >
                      Products
                    </button>
                    <a href="#" className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F]">Orders</a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        {/* <div className="absolute bottom-8 w-full px-6">
          <button 
            onClick={() => window.location.href = '/login'}
            className="w-full flex items-center gap-4 px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium"
          >
            <LogOut size={22} />
            <span>Logout</span>
          </button>
        </div> */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-62 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
            >
              ☰
            </button>
            <h1 className="text-2xl font-bold" style={{ color: appConfig.colors.primary }}>
              {appConfig.name}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
              <img
                src={dashboardData?.user?.profilePicture || "https://via.placeholder.com/150"}
                alt={dashboardData?.user?.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <p className="text-sm font-medium">{dashboardData?.user?.firstName}</p>
              <p className="text-xs text-gray-500 -mt-1">@{dashboardData?.user?.username}</p>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <ActiveComponent />
        </main>

        {/* Bottom Navigation for Mobile */}
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div 
            className="bg-white w-62 h-full overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#8B1E3F] to-[#C44A6F] rounded-2xl flex items-center justify-center">
                  <span className="text-white text-xl">🎥</span>
                </div>
                <h2 className="text-2xl font-bold">{appConfig.name}</h2>
              </div>
            </div>

            <div className="px-4 py-6">
              {/* Main Menu */}
              {[
                { id: 'home', label: 'Dashboard', icon: Home },
                { id: 'jobs', label: 'Jobs', icon: Briefcase },
                { id: 'marketplace', label: 'Marketplace', icon: Store },
                { id: 'media', label: 'Media Hub', icon: PlaySquare },
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'sellerProfile', label: 'Seller Profile', icon: User },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActivePage(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium ${
                    activePage === item.id ? 'bg-[#8B1E3F] text-white' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <item.icon size={22} />
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Seller Tools - Mobile */}
              {isSeller && (
                <>
                  <div className="mt-8 px-3">
                    <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">SELLER TOOLS</p>
                  </div>

                  {/* <button
                    onClick={() => {
                      setActivePage('sellerProfile');
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium ${
                      activePage === 'sellerProfile' ? 'bg-[#8B1E3F] text-white' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Package size={22} />
                    <span>Seller Profile</span>
                  </button> */}

                  {/* Inventory Dropdown - Mobile */}
                  <div>
                    <button
                      onClick={() => toggleDropdown('inventory')}
                      className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium hover:bg-gray-100 text-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <BarChart3 size={22} />
                        <span>Inventory</span>
                      </div>
                      {openDropdown === 'inventory' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </button>

                    {openDropdown === 'inventory' && (
                      <div className="ml-11 space-y-1 mt-1">
   <button
            onClick={() => {
              setActivePage('inventory');
              setOpenDropdown(null);           // Close dropdown
              if (sidebarOpen) setSidebarOpen(false); // Close mobile sidebar
            }}
            className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left transition"
          >
            Stock Management
          </button>
          <button
                      onClick={() => {
                        setActivePage('products');
                        setOpenDropdown(null);
                        if (sidebarOpen) setSidebarOpen(false);
                      }}
                      className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left font-medium transition"
                    >
                      Products
                    </button>
                    
                        <a href="#" className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F]">Orders</a>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



































































