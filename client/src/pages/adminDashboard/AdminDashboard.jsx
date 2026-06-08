// src/pages/admin/AdminDashboard.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
} from 'lucide-react';
import RewardRules from './RewardRules';
import Reports from './Reports';
const API_BASE = import.meta.env.VITE_BACKEND_URL;

// Dummy views (replace later)
const Overview = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <p className="text-sm text-gray-600">Total Users</p>
        <p className="text-3xl font-bold text-purple-700 mt-2">0</p>
      </div>
      {/* more cards */}
    </div>
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      <p className="text-gray-600">Loading more stats...</p>
    </div>
  </div>
);

const UsersView    = () => <div className="p-6">Users Management</div>;
const AnalyticsView = () => <div className="p-6">Analytics & Reports</div>;
const MessagesView  = () => <div className="p-6">Support Messages</div>;
const SettingsView  = () => <div className="p-6">Settings</div>;

export default function AdminDashboard() {
  const [activeView, setActiveView] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) {
          window.location.href = '/admin/login';
          return;
        }

        const res = await axios.get(`${API_BASE}/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setDashboardData(res.data.data);
      } catch (err) {
        console.error(err);
        setError('Failed to load dashboard data');
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('adminToken');
          window.location.href = '/admin/login';
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const menuItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'users',    label: 'Users',     icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'messages', label: 'Messages',  icon: MessageSquare },
    { id: 'settings', label: 'Settings',  icon: Settings },
  ];

  const renderContent = () => {
    if (loading) return <div className="p-10 text-center text-gray-600">Loading dashboard data...</div>;
    if (error)   return <div className="p-10 text-center text-red-600">{error}</div>;

    switch (activeView) {
      case 'overview':  return <Overview data={dashboardData} />;
      case 'users':     return <UsersView />;
      case 'analytics': return <RewardRules />;
      case 'reports':   return <Reports/>;
      case 'messages':  return <MessagesView />;
      case 'settings':  return <SettingsView />;
      default:          return <Overview data={dashboardData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">

      {/* ─── MOBILE HAMBURGER BUTTON ─── */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 bg-white rounded-xl shadow-lg md:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-purple-700" />
      </button>

      {/* ─── MOBILE SIDEBAR (slides in) ─── */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          md:hidden
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-purple-700">Admin</h2>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-gray-100"
              aria-label="Close menu"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MOBILE OVERLAY ─── */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* ─── DESKTOP SIDEBAR (collapsible) ─── */}
      <aside
        className={`
          hidden md:block
          h-screen sticky top-0
          bg-white border-r border-gray-200
          ${sidebarCollapsed ? 'w-20' : 'w-72'}
          transition-all duration-300
        `}
      >
        <div className="h-full flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            {!sidebarCollapsed && <h2 className="text-2xl font-bold text-purple-700">Admin</h2>}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft
                className={`w-5 h-5 transition-transform ${sidebarCollapsed ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = activeView === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                    transition-colors
                    ${isActive ? 'bg-purple-50 text-purple-700' : 'text-gray-700 hover:bg-gray-100'}
                    ${sidebarCollapsed ? 'justify-center px-3' : ''}
                  `}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                localStorage.removeItem('adminToken');
                window.location.href = '/admin/login';
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium ${
                sidebarCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!sidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main
        className={`
          flex-1 overflow-y-auto
          md:ml-${sidebarCollapsed ? '20' : '72'}
          transition-all duration-300
          pt-16 md:pt-0
        `}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-8 capitalize">
            {activeView === 'overview' ? 'Dashboard' : activeView}
          </h1>
          {renderContent()}
        </div>
      </main>
    </div>
  );
}