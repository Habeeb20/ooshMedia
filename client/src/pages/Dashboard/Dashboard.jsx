

// import { useState, useEffect } from 'react';
// import { toast } from 'sonner';
// import appConfig from '../../config/AppConfig';
// import { 
//   Home, Briefcase, Store, PlaySquare, User, LogOut, 
//   Package, BarChart3, ChevronDown, ChevronRight 
// } from 'lucide-react';

// import BottomNav from '../../components/dashboard/BottomNav';
// import DashboardHome from '../../components/dashboard/DashboardHome';
// import BusinessProfileUpdate from '../../components/dashboard/Profile';
// import SellerProfileSetup from '../../components/dashboard/SellerProfile';
// import Loading from '../../config/Loading';
// import InventoryDashboard from '../inventory/InventoryDashboard';
// import ProductList from '../inventory/ProductsList';
// import CreatePostModal from '../post/CreatePost';
// import FeedPage from '../post/FeedPage';

// const Jobs = () => <div className="p-8 text-center text-2xl text-gray-500">Jobs Page - Coming Soon</div>;
// const Marketplace = () => <div className="p-8 text-center text-2xl text-gray-500">Marketplace Page - Coming Soon</div>;
// const Media = () => <div className="p-8 text-center text-2xl text-gray-500">Media Hub Page - Coming Soon</div>;

// const pages = {
//   home: DashboardHome,
//   post: FeedPage,
//   jobs: Jobs,
//   marketplace: Marketplace,
//   media: Media,
//   profile: BusinessProfileUpdate,
//   sellerProfile: SellerProfileSetup,
//   inventory: InventoryDashboard,
//   products: ProductList,
// };

// export default function Dashboard() {
//  const getPageFromURL = () => {
//   const params = new URLSearchParams(window.location.search);
//   return params.get('page') || 'home';
// };

// const [activePage, setActivePage] = useState(getPageFromURL());
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [dashboardData, setDashboardData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [openDropdown, setOpenDropdown] = useState(null);

//   const ActiveComponent = pages[activePage];
//   const isSeller = dashboardData?.user?.isSeller || false;

//   useEffect(() => {
//   const params = new URLSearchParams(window.location.search);
//   params.set('page', activePage);
//   window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
// }, [activePage]);

//   // Fetch Dashboard Data
//   useEffect(() => {
//     const fetchDashboard = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         if (!token) {
//           toast.error("Please login again");
//           window.location.href = '/login';
//           return;
//         }

//         const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
//           method: 'GET',
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           },
//         });

//         const data = await res.json();

//         if (data.success) {
//           setDashboardData(data);
//         } else {
//           toast.error(data.message || "Failed to load dashboard");
//         }
//       } catch (err) {
//         console.error(err);
//         toast.error("Unable to connect to server");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboard();
//   }, []);

//   if (loading) {
//     return <Loading text="Loading your dashboard..." />;
//   }

//   const toggleDropdown = (key) => {
//     setOpenDropdown(openDropdown === key ? null : key);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 flex">
//       {/* Fixed Sidebar - Desktop */}
//       <div className="hidden lg:block fixed top-0 left-0 h-screen w-62 bg-white border-r border-gray-100 z-40 overflow-y-auto shadow-sm">
//         <div className="p-6 border-b">
//           <div className="flex items-center gap-3">
//             <div 
//               className="w-10 h-10 rounded-2xl flex items-center justify-center shadow"
//               style={{ 
//                 background: `linear-gradient(to bottom right, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})` 
//               }}
//             >
//               <span className="text-white text-2xl">🎥</span>
//             </div>
//             <h2 className="text-2xl font-bold tracking-tight">{appConfig.name}</h2>
//           </div>
//         </div>

//         <div className="px-4 py-8">
//           <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold px-3 mb-5">MAIN MENU</p>
          
//           {/* Main Navigation */}
//           {[
//             { id: 'home', label: 'Dashboard', icon: Home },
//             { id: 'post', label: 'Make a post', icon: Home },
//             // { id: 'jobs', label: 'Jobs', icon: Briefcase },
//             // { id: 'marketplace', label: 'Marketplace', icon: Store },
//             // { id: 'media', label: 'Media Hub', icon: PlaySquare },
//             { id: 'profile', label: 'Profile', icon: User },
//             { id: 'sellerProfile', label: 'Seller Profile', icon: Package },
//           ].map((item) => {
//             const Icon = item.icon;
//             const isActive = activePage === item.id;

//             return (
//               <button
//                 key={item.id}
//                 onClick={() => setActivePage(item.id)}
//                 className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1.5 transition-all font-medium ${
//                   isActive 
//                     ? 'bg-[#8B1E3F] text-white shadow-sm' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 <Icon size={22} />
//                 <span>{item.label}</span>
//               </button>
//             );
//           })}

//           {/* Seller Tools Section */}
//           {isSeller && (
//             <div className="mt-10">
//               <p className="text-xs uppercase tracking-widest text-gray-500 font-semibold px-3 mb-5">SELLER TOOLS</p>

//               {/* <button
//                 onClick={() => setActivePage('sellerProfile')}
//                 className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1.5 transition-all font-medium ${
//                   activePage === 'sellerProfile' 
//                     ? 'bg-[#8B1E3F] text-white shadow-sm' 
//                     : 'hover:bg-gray-100 text-gray-700'
//                 }`}
//               >
//                 <Package size={22} />
//                 <span>Seller Profile</span>
//               </button> */}

//               {/* Inventory Dropdown */}
//               <div>
//                 <button
//                   onClick={() => toggleDropdown('inventory')}
//                   className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium hover:bg-gray-100 text-gray-700"
//                 >
//                   <div className="flex items-center gap-4">
//                     <BarChart3 size={22} />
//                     <span>Inventory</span>
//                   </div>
//                   {openDropdown === 'inventory' ? 
//                     <ChevronDown size={18} /> : 
//                     <ChevronRight size={18} />
//                   }
//                 </button>

             
//                 {openDropdown === 'inventory' && (
//                   <div className="ml-11 space-y-1 mt-1 border-l border-gray-200 pl-4">
//                     <button
//                       onClick={() => {
//                         setActivePage('inventory');
//                         setOpenDropdown(null);
//                         if (sidebarOpen) setSidebarOpen(false);
//                       }}
//                       className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left font-medium transition"
//                     >
//                       Stock Management
//                     </button>
//                     <button
//                       onClick={() => {
//                         setActivePage('products');
//                         setOpenDropdown(null);
//                         if (sidebarOpen) setSidebarOpen(false);
//                       }}
//                       className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left font-medium transition"
//                     >
//                       Products
//                     </button>
//                     <a href="#" className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F]">Orders</a>
//                   </div>
//                 )}
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Logout */}
//         {/* <div className="absolute bottom-8 w-full px-6">
//           <button 
//             onClick={() => window.location.href = '/login'}
//             className="w-full flex items-center gap-4 px-5 py-3.5 text-red-600 hover:bg-red-50 rounded-2xl transition-all font-medium"
//           >
//             <LogOut size={22} />
//             <span>Logout</span>
//           </button>
//         </div> */}
//       </div>

//       {/* Main Content Area */}
//       <div className="flex-1 lg:ml-62 flex flex-col min-h-screen">
//         {/* Top Navbar */}
//         <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-50">
//           <div className="flex items-center gap-3">
//             <button 
//               onClick={() => setSidebarOpen(true)}
//               className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
//             >
//               ☰
//             </button>
//             <h1 className="text-2xl font-bold" style={{ color: appConfig.colors.primary }}>
//               {appConfig.name}
//             </h1>
//           </div>

//           <div className="flex items-center gap-4">
//             <div className="w-9 h-9 rounded-full overflow-hidden border border-gray-200">
//               <img
//                 src={dashboardData?.user?.profilePicture || "https://via.placeholder.com/150"}
//                 alt={dashboardData?.user?.firstName}
//                 className="w-full h-full object-cover"
//               />
//             </div>
//             <div>
//               <p className="text-sm font-medium">{dashboardData?.user?.firstName}</p>
//               <p className="text-xs text-gray-500 -mt-1">@{dashboardData?.user?.username}</p>
//             </div>
//           </div>
//         </nav>

//         {/* Page Content */}
//         <main className="flex-1 p-4 md:p-8 overflow-auto">
//           <ActiveComponent />
//         </main>

//         {/* Bottom Navigation for Mobile */}
//         <BottomNav activePage={activePage} setActivePage={setActivePage} />
//       </div>

//       {/* Mobile Sidebar Overlay */}
//       {sidebarOpen && (
//         <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
//           <div 
//             className="bg-white w-62 h-full overflow-y-auto"
//             onClick={e => e.stopPropagation()}
//           >
//             <div className="p-6 border-b">
//               <div className="flex items-center gap-3">
//                 <div className="w-10 h-10 bg-gradient-to-br from-[#8B1E3F] to-[#C44A6F] rounded-2xl flex items-center justify-center">
//                   <span className="text-white text-xl">🎥</span>
//                 </div>
//                 <h2 className="text-2xl font-bold">{appConfig.name}</h2>
//               </div>
//             </div>

//             <div className="px-4 py-6">
//               {/* Main Menu */}
//               {[
//                 { id: 'home', label: 'Dashboard', icon: Home },
//                 { id: 'jobs', label: 'Jobs', icon: Briefcase },
//                 { id: 'marketplace', label: 'Marketplace', icon: Store },
//                 { id: 'media', label: 'Media Hub', icon: PlaySquare },
//                 { id: 'profile', label: 'Profile', icon: User },
//                 { id: 'sellerProfile', label: 'Seller Profile', icon: User },
//               ].map((item) => (
//                 <button
//                   key={item.id}
//                   onClick={() => {
//                     setActivePage(item.id);
//                     setSidebarOpen(false);
//                   }}
//                   className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium ${
//                     activePage === item.id ? 'bg-[#8B1E3F] text-white' : 'hover:bg-gray-100 text-gray-700'
//                   }`}
//                 >
//                   <item.icon size={22} />
//                   <span>{item.label}</span>
//                 </button>
//               ))}

//               {/* Seller Tools - Mobile */}
//               {isSeller && (
//                 <>
//                   <div className="mt-8 px-3">
//                     <p className="text-xs uppercase tracking-widest text-gray-500 font-medium mb-3">SELLER TOOLS</p>
//                   </div>

//                   {/* <button
//                     onClick={() => {
//                       setActivePage('sellerProfile');
//                       setSidebarOpen(false);
//                     }}
//                     className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium ${
//                       activePage === 'sellerProfile' ? 'bg-[#8B1E3F] text-white' : 'hover:bg-gray-100 text-gray-700'
//                     }`}
//                   >
//                     <Package size={22} />
//                     <span>Seller Profile</span>
//                   </button> */}

//                   {/* Inventory Dropdown - Mobile */}
//                   <div>
//                     <button
//                       onClick={() => toggleDropdown('inventory')}
//                       className="w-full flex items-center justify-between px-5 py-3.5 rounded-2xl mb-1 transition-all font-medium hover:bg-gray-100 text-gray-700"
//                     >
//                       <div className="flex items-center gap-4">
//                         <BarChart3 size={22} />
//                         <span>Inventory</span>
//                       </div>
//                       {openDropdown === 'inventory' ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
//                     </button>

//                     {openDropdown === 'inventory' && (
//                       <div className="ml-11 space-y-1 mt-1">
//    <button
//             onClick={() => {
//               setActivePage('inventory');
//               setOpenDropdown(null);           // Close dropdown
//               if (sidebarOpen) setSidebarOpen(false); // Close mobile sidebar
//             }}
//             className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left transition"
//           >
//             Stock Management
//           </button>
//           <button
//                       onClick={() => {
//                         setActivePage('products');
//                         setOpenDropdown(null);
//                         if (sidebarOpen) setSidebarOpen(false);
//                       }}
//                       className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F] w-full text-left font-medium transition"
//                     >
//                       Products
//                     </button>
                    
//                         <a href="#" className="block py-2.5 px-4 text-sm text-gray-600 hover:text-[#8B1E3F]">Orders</a>
//                       </div>
//                     )}
//                   </div>
//                 </>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }



































































import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import appConfig from '../../config/AppConfig';
import {
  Home, Briefcase, Store, PlaySquare, User, LogOut,
  Package, BarChart3, ChevronDown, ChevronRight, Sparkles, Rss
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
import AdVerifyPage from './../ads/AdVerify';
import AdPlansPage from '../ads/AdplanPage';
import MySubscriptionsPage from '../ads/MySubscriptionPage';
const Jobs = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
      <Briefcase className="text-[#8B1E3F]" size={28} />
    </div>
    <p className="text-2xl font-semibold text-gray-700">Jobs</p>
    <span className="px-4 py-1.5 rounded-full bg-rose-50 text-[#8B1E3F] text-sm font-medium">Coming Soon</span>
  </div>
);

const Marketplace = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
      <Store className="text-[#8B1E3F]" size={28} />
    </div>
    <p className="text-2xl font-semibold text-gray-700">Marketplace</p>
    <span className="px-4 py-1.5 rounded-full bg-rose-50 text-[#8B1E3F] text-sm font-medium">Coming Soon</span>
  </div>
);

const Media = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center">
      <PlaySquare className="text-[#8B1E3F]" size={28} />
    </div>
    <p className="text-2xl font-semibold text-gray-700">Media Hub</p>
    <span className="px-4 py-1.5 rounded-full bg-rose-50 text-[#8B1E3F] text-sm font-medium">Coming Soon</span>
  </div>
);

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
  subscribe: AdPlansPage,
  ads: MySubscriptionsPage,
  verify: AdVerifyPage
};

const navItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'post', label: 'Feed', icon: Rss },
  { id: 'ads', label: 'my ads', icon: Rss },
  { id: 'subscribe', label: 'AdPlansPage', icon: Rss },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'sellerProfile', label: 'Seller Profile', icon: Package },
];

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
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        if (data.success) setDashboardData(data);
        else toast.error(data.message || "Failed to load dashboard");
      } catch (err) {
        console.error(err);
        toast.error("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <Loading text="Loading your dashboard..." />;

  const toggleDropdown = (key) => setOpenDropdown(openDropdown === key ? null : key);

  const NavItem = ({ item, onClick, mobile = false }) => {
    const Icon = item.icon;
    const isActive = activePage === item.id;
    return (
      <button
        key={item.id}
        onClick={() => { setActivePage(item.id); if (onClick) onClick(); }}
        className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl mb-1 transition-all duration-200 text-sm font-medium group ${
          isActive
            ? 'bg-[#8B1E3F] text-white shadow-md shadow-rose-900/20'
            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
        }`}
      >
        <span className={`w-8 h-8 flex items-center justify-center rounded-lg flex-shrink-0 transition-all ${
          isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-gray-200'
        }`}>
          <Icon size={17} />
        </span>
        <span>{item.label}</span>
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />
        )}
      </button>
    );
  };

  const SidebarContent = ({ mobile = false }) => (
    <div className="px-3 py-4">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-3 mb-3">Main Menu</p>
      {navItems.map(item => (
        <NavItem key={item.id} item={item} onClick={mobile ? () => setSidebarOpen(false) : null} mobile={mobile} />
      ))}

      {isSeller && (
        <div className="mt-6">
          <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold px-3 mb-3">Seller Tools</p>

          <div>
            <button
              onClick={() => toggleDropdown('inventory')}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl mb-1 transition-all text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-800 group"
            >
              <div className="flex items-center gap-3.5">
                <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 group-hover:bg-gray-200 flex-shrink-0">
                  <BarChart3 size={17} />
                </span>
                <span>Inventory</span>
              </div>
              <span className={`transition-transform duration-200 ${openDropdown === 'inventory' ? 'rotate-90' : ''}`}>
                <ChevronRight size={15} />
              </span>
            </button>

            {openDropdown === 'inventory' && (
              <div className="ml-[52px] space-y-0.5 mt-1 pl-3 border-l-2 border-rose-100">
                {[
                  { label: 'Stock Management', page: 'inventory' },
                  { label: 'Products', page: 'products' },
                  { label: 'Orders', page: null },
                ].map(sub => (
                  <button
                    key={sub.label}
                    onClick={() => {
                      if (sub.page) { setActivePage(sub.page); setOpenDropdown(null); if (mobile) setSidebarOpen(false); }
                    }}
                    className={`block w-full text-left py-2 px-3 text-sm rounded-lg transition-colors ${
                      activePage === sub.page ? 'text-[#8B1E3F] font-medium bg-rose-50' : 'text-gray-500 hover:text-[#8B1E3F] hover:bg-rose-50'
                    } ${!sub.page ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {sub.label}
                    {!sub.page && <span className="ml-2 text-[10px] font-medium bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">Soon</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-100">
        <button
          onClick={() => window.location.href = '/login'}
          className="w-full flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-50 hover:text-red-600 transition-all group"
        >
          <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 flex-shrink-0">
            <LogOut size={17} />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F5F3] flex font-sans">

      {/* Fixed Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col fixed top-0 left-0 h-screen w-64 bg-white border-r border-gray-100 z-40 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-gray-100 flex items-center gap-3 flex-shrink-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg bg-[#8B1E3F]">
            🎥
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 tracking-tight leading-none">{appConfig.name}</h2>
            <p className="text-[11px] text-gray-400 mt-0.5">Creator Dashboard</p>
          </div>
        </div>

        {/* Nav */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
          <SidebarContent />
        </div>

        {/* User badge at bottom */}
        <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
              <img
                src={dashboardData?.user?.profilePicture || "https://via.placeholder.com/150"}
                alt={dashboardData?.user?.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate leading-none">{dashboardData?.user?.firstName} {dashboardData?.user?.lastName}</p>
              <p className="text-xs text-gray-400 mt-0.5 truncate">@{dashboardData?.user?.username}</p>
            </div>
            <div className="ml-auto flex-shrink-0 w-2 h-2 rounded-full bg-green-400" title="Online" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">

        {/* Top Navbar */}
        <nav className="bg-white border-b border-gray-100 px-4 md:px-6 h-16 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-xl text-gray-600 transition"
              aria-label="Open menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <line x1="3" y1="5" x2="17" y2="5" />
                <line x1="3" y1="10" x2="17" y2="10" />
                <line x1="3" y1="15" x2="13" y2="15" />
              </svg>
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#8B1E3F] flex items-center justify-center text-sm">🎥</div>
              <span className="text-base font-bold text-gray-900">{appConfig.name}</span>
            </div>
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-gray-300">/</span>
              <span className="text-sm font-medium text-gray-700 capitalize">{activePage === 'home' ? 'Dashboard' : activePage}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 hover:bg-gray-100 rounded-xl transition text-gray-500">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#8B1E3F]" />
            </button>

            <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow">
                <img
                  src={dashboardData?.user?.profilePicture || "https://via.placeholder.com/150"}
                  alt={dashboardData?.user?.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 leading-none">{dashboardData?.user?.firstName}</p>
                <p className="text-xs text-gray-400 mt-0.5">@{dashboardData?.user?.username}</p>
              </div>
            </div>
          </div>
        </nav>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto pb-24 lg:pb-8">
          <ActiveComponent />
        </main>

        {/* Bottom Nav - Mobile */}
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div
            className="bg-white w-72 h-full overflow-y-auto shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Mobile header */}
            <div className="px-5 py-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#8B1E3F] flex items-center justify-center text-lg">🎥</div>
                <div>
                  <h2 className="text-base font-bold text-gray-900">{appConfig.name}</h2>
                  <p className="text-[11px] text-gray-400">Creator Dashboard</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 transition"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="2" y1="2" x2="16" y2="16" />
                  <line x1="16" y1="2" x2="2" y2="16" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              <SidebarContent mobile />
            </div>

            <div className="flex-shrink-0 px-4 py-4 border-t border-gray-100">
              <div className="flex items-center gap-3 px-2 py-2 rounded-xl bg-gray-50">
                <div className="w-8 h-8 rounded-full overflow-hidden border border-gray-200 flex-shrink-0">
                  <img
                    src={dashboardData?.user?.profilePicture || "https://via.placeholder.com/150"}
                    alt={dashboardData?.user?.firstName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{dashboardData?.user?.firstName} {dashboardData?.user?.lastName}</p>
                  <p className="text-xs text-gray-400 truncate">@{dashboardData?.user?.username}</p>
                </div>
                <div className="ml-auto w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}











// // Routes
// <Route path="/dashboard/ads/subscribe" element={<AdPlansPage currentUser={currentUser} />} />
// <Route path="/dashboard/ads" element={<MySubscriptionsPage />} />
// <Route path="/dashboard/ads/verify" element={<AdVerifyPage />} />