import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import Loading from '../../config/Loading';

import { toast } from 'sonner';

export default function DashboardHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Fetch Dashboard Data
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
    <div className="space-y-10">
      {/* Greeting Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-5xl font-bold text-gray-900 tracking-tight">
            {getGreeting()}, {user?.firstName} 👋
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Welcome back to {appConfig.name}
          </p>
        </div>

        {/* Current Date & Time */}
        <div className="text-right">
          <p className="text-2xl font-semibold text-gray-800">
            {currentTime.toLocaleTimeString('en-NG', { 
              hour: 'numeric', 
              minute: '2-digit' 
            })}
          </p>
          <p className="text-gray-500 text-sm">
            {currentTime.toLocaleDateString('en-NG', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-8 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Profile Picture */}
        <div className="flex-shrink-0">
          <div className="w-28 h-28 rounded-3xl overflow-hidden border-4 border-white shadow-xl">
            <img
              src={user?.profilePicture || "https://via.placeholder.com/150"}
              alt={user?.firstName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* User Info */}
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-3xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </h2>
          <p className="text-xl text-gray-500 mt-1">@{user?.username}</p>

          <div className="flex flex-wrap justify-center md:justify-start gap-x-8 gap-y-4 mt-6 text-sm">
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{user?.email || "Not provided"}</p>
            </div>
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{user?.phoneNumber || "Not provided"}</p>
            </div>
            <div>
              <p className="text-gray-500">Location</p>
              <p className="font-medium">{user?.state ? `${user.state}, ${user.lga}` : "Not set"}</p>
            </div>
            <div>
              <p className="text-gray-500">Member Since</p>
              <p className="font-medium">{user?.memberSince}</p>
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="text-center md:text-right">
          <div className="text-4xl font-bold" style={{ color: appConfig.colors.primary }}>
            {dashboardData?.stats?.profileComplete}%
          </div>
          <p className="text-sm text-gray-500 mt-1">Profile Complete</p>
          <div className="w-32 h-2 bg-gray-100 rounded-full mt-3 overflow-hidden">
            <div 
              className="h-full transition-all"
              style={{ 
                width: `${dashboardData?.stats?.profileComplete}%`,
                backgroundColor: appConfig.colors.primary 
              }}
            />
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {[
          { label: "Total Reach", value: "48.2K", change: "+12%" },
          { label: "Active Jobs", value: "24", change: "+3" },
          { label: "Revenue This Month", value: "₦2.8M", change: "+18%" },
          { label: "Engagement Rate", value: "9.4K", change: "+24%" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl shadow-sm hover:shadow-md transition">
            <p className="text-gray-500 text-sm">{stat.label}</p>
            <p className="text-4xl font-bold mt-3 text-gray-900">{stat.value}</p>
            <p className="text-green-600 text-sm mt-3 font-medium">{stat.change} this month</p>
          </div>
        ))}
      </div>
    </div>
  );
}