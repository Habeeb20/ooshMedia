


import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import Loading from '../../config/Loading';
import { toast } from 'sonner';
import {
  TrendingUp, Briefcase, DollarSign, Zap,
  ArrowUpRight, MapPin, Phone, Mail, Calendar,
  CheckCircle2, ChevronRight, Star, Activity
} from 'lucide-react';
import Dashboard from './Dashboard';

const StatCard = ({ label, value, change, icon: Icon, color }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-rose-100 hover:shadow-md transition-all duration-300 group">
    <div className="flex items-start justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-[#8B1E3F]" />
      </div>
      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
        <ArrowUpRight size={11} />
        {change}
      </span>
    </div>
    <p className="text-2xl font-bold text-gray-900 tracking-tight">{value}</p>
    <p className="text-xs text-gray-400 mt-1 font-medium">{label}</p>
  </div>
);

const InfoRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 py-2.5">
    <div className="w-7 h-7 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
      <Icon size={13} className="text-[#8B1E3F]" />
    </div>
    <div className="min-w-0 flex-1 flex items-center justify-between">
      <span className="text-xs text-gray-400 font-medium">{label}</span>
      <span className="text-sm text-gray-700 font-medium truncate ml-4 max-w-[180px]">
        {value || <span className="text-gray-300 italic text-xs">Not provided</span>}
      </span>
    </div>
  </div>
);

export default function DashboardHome() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [animIn, setAnimIn] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) { toast.error("Please login again"); return; }

        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        });
        const data = await res.json();
        console.log("Dashboard Data:", data);
        if (data.success) {
          setDashboardData(data);
          setTimeout(() => setAnimIn(true), 100);
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

  if (loading) return <Loading text="Loading your dashboard..." fullScreen={false} />;

  const user = dashboardData?.user;
  const profileComplete = dashboardData?.stats?.profileComplete || 0;

  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return { text: "Good morning", emoji: "☀️" };
    if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
    return { text: "Good evening", emoji: "🌙" };
  };

  const { text: greetText, emoji: greetEmoji } = getGreeting();

  const stats = [
    { label: "Total Reach", value: "48.2K", change: "+12%", icon: TrendingUp, color: "bg-rose-50" },
    { label: "Active Jobs", value: "24", change: "+3", icon: Briefcase, color: "bg-amber-50" },
    { label: "Monthly Revenue", value: "₦2.8M", change: "+18%", icon: DollarSign, color: "bg-emerald-50" },
    { label: "Engagement Rate", value: "9.4K", change: "+24%", icon: Zap, color: "bg-blue-50" },
  ];

  const completionSteps = [
    { label: "Email verified", done: !!user?.email },
    { label: "Profile photo added", done: !!user?.profilePicture },
    { label: "Phone number set", done: !!user?.phoneNumber },
    { label: "Location configured", done: !!user?.state },
  ];

  return (
    <div
      className={`space-y-6 transition-all duration-500 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
    >
      {/* Hero greeting banner */}
      {/* <div className="relative bg-[#8B1E3F] rounded-2xl p-6 md:p-8 overflow-hidden">
    
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-10 -right-4 w-56 h-56 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute top-1/2 right-24 -translate-y-1/2 w-20 h-20 rounded-full bg-white/5 pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <p className="text-rose-200 text-sm font-medium mb-1">
              {greetEmoji} {greetText}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="text-rose-200 mt-1.5 text-sm">
              Welcome back to <span className="text-white font-semibold">{appConfig.name}</span> — your creator hub.
            </p>
          </div>

          <div className="flex items-center gap-4">
    
            <div className="relative flex-shrink-0">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/30 shadow-lg">
                <img
                  src={user?.profilePicture || "https://via.placeholder.com/150"}
                  alt={user?.firstName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-[#8B1E3F]" />
            </div>

        
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {currentTime.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}
              </p>
              <p className="text-rose-200 text-xs mt-0.5">
                {currentTime.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div
            key={i}
            style={{ transitionDelay: `${i * 60}ms` }}
            className={`transition-all duration-500 ${animIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          >
            <StatCard {...s} />
          </div>
        ))}
      </div> */}

      {/* Profile + Completion row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Profile Card - spans 2 cols */}
        {/* <div className="md:col-span-2 bg-white rounded-2xl p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Profile Overview</h2>
            <span className="flex items-center gap-1 text-xs font-medium text-[#8B1E3F] cursor-pointer hover:underline">
              Edit profile <ChevronRight size={13} />
            </span>
          </div>

          <div className="flex items-start gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0">
              <img
                src={user?.profilePicture || "https://via.placeholder.com/150"}
                alt={user?.firstName}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
              <p className="text-gray-400 text-sm">@{user?.username}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="flex items-center gap-1 px-2.5 py-1 bg-rose-50 rounded-full text-xs font-medium text-[#8B1E3F]">
                  <Star size={10} />
                  Creator
                </span>
                <span className="flex items-center gap-1 px-2.5 py-1 bg-gray-50 rounded-full text-xs font-medium text-gray-500">
                  <Calendar size={10} />
                  Since {user?.memberSince}
                </span>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-50 pt-4 divide-y divide-gray-50">
            <InfoRow icon={Mail} label="Email" value={user?.email} />
            <InfoRow icon={Phone} label="Phone" value={user?.phoneNumber} />
            <InfoRow icon={MapPin} label="Location" value={user?.state ? `${user.state}, ${user.lga}` : null} />
          </div>
        </div> */}

        <div className="">
        {/* <div className="bg-white rounded-2xl p-6 border border-gray-100 flex flex-col"> */}
          {/* <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold text-gray-900">Profile Health</h2>
            <span className="text-xs font-medium text-gray-400">
              <Activity size={13} className="inline mr-1" />
              Score
            </span>
          </div> */}

{/*       
          <div className="flex justify-center my-2">
            <div className="relative w-28 h-28">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r="48" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                <circle
                  cx="56" cy="56" r="48"
                  fill="none"
                  stroke="#8B1E3F"
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 48}`}
                  strokeDashoffset={`${2 * Math.PI * 48 * (1 - profileComplete / 100)}`}
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-gray-900">{profileComplete}%</span>
                <span className="text-[10px] text-gray-400 font-medium">Complete</span>
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 flex-1">
            {completionSteps.map((step, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <CheckCircle2
                  size={15}
                  className={step.done ? 'text-[#8B1E3F]' : 'text-gray-200'}
                />
                <span className={`text-xs font-medium ${step.done ? 'text-gray-700' : 'text-gray-300'}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {profileComplete < 100 && (
            <button className="mt-4 w-full py-2.5 rounded-xl border border-[#8B1E3F] text-[#8B1E3F] text-sm font-semibold hover:bg-rose-50 transition-colors">
              Complete Profile
            </button>
          )} */}
        </div>
      </div>
      <Dashboard/>
    </div>
  );
}