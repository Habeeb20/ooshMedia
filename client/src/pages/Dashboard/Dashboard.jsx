import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import Sidebar from '../../components/dashboard/Sidebar';
import BottomNav from '../../components/dashboard/BottomNav';
import DashboardHome from '../../components/dashboard/DashboardHome';
import Loading from '../../config/Loading';
import BusinessProfileUpdate from '../../components/dashboard/Profile';


const Jobs = () => <div>Jobs Page</div>;
const Marketplace = () => <div>Marketplace Page</div>;
const Media = () => <div>Media Hub Page</div>;
const Profile = () => <div><BusinessProfileUpdate /></div>;

const pages = {
  home: DashboardHome,
  jobs: Jobs,
  marketplace: Marketplace,
  media: Media,
  profile: Profile,
};

export default function Dashboard() {
  const [activePage, setActivePage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const ActiveComponent = pages[activePage];
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const fetchDashboard = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) {
            toast.error("Please login again");
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
  console.log("Dashboard Data:", data);
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
        return <Loading text="Loading your dashboard..." fullScreen={false} />;
      }

        const user = dashboardData?.user;
    
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar - Desktop */}
      <div className="hidden lg:block">
        <Sidebar activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
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
            <div className="w-9 h-9 bg-gray-200 rounded-full">
                  <img
              src={user?.profilePicture || "https://via.placeholder.com/150"}
              alt={user?.firstName}
              className="w-9 h-9 bg-gray-200 rounded-full"
            />
            </div>
            <div>
              <p className="text-sm font-medium">{user?.firstName}</p>
              <p className="text-xs text-gray-500 -mt-1">Creator</p>
            </div>
          </div>
        </nav>

        {/* Dynamic Page Content */}
        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <ActiveComponent />
        </main>

        {/* Bottom Navigation - Mobile Only */}
        <BottomNav activePage={activePage} setActivePage={setActivePage} />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 lg:hidden" onClick={() => setSidebarOpen(false)}>
          <div 
            className="bg-white w-72 h-full p-6"
            onClick={e => e.stopPropagation()}
          >
               <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#8B1E3F] to-[#C44A6F] rounded-2xl flex items-center justify-center">
            <span className="text-white text-xl">🎥</span>
          </div>
          <h2 className="text-2xl font-bold">{appConfig.name}</h2>
        </div>
            <Sidebar 
              activePage={activePage} 
              setActivePage={setActivePage} 
              onClose={() => setSidebarOpen(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
}



