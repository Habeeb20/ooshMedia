import React, { useState, useEffect } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Truck, MapPin, Star, DollarSign, CheckCircle, TrendingUp } from 'lucide-react';
import axios from 'axios';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

const RiderBreakdown = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(true);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/rider/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !dashboardData) {
    return <div className="flex justify-center items-center min-h-[80vh]">Loading dashboard...</div>;
  }

  const { riderProfile, deliveries, monthlyStats, stats } = dashboardData;

  const pieData = [
    { name: 'Completed', value: stats.completed, color: '#10b981' },
    { name: 'In Progress', value: stats.pending, color: '#f59e0b' },
    { name: 'Others', value: deliveries.length - stats.completed - stats.pending, color: '#ef4444' },
  ];

  const earningsData = monthlyStats.length > 0 ? monthlyStats.map(m => ({
    month: m._id,
    earnings: m.earnings,
  })) : [
    { month: 'Jan', earnings: 45000 },
    { month: 'Feb', earnings: 62000 },
    { month: 'Mar', earnings: 38000 },
    { month: 'Apr', earnings: 75000 },
    { month: 'May', earnings: 92000 },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl">🏍️</div>
            <div>
              <h1 className="text-2xl font-bold">Rider Dashboard</h1>
              <p className="text-gray-500">{riderProfile?.vehicleBrand} {riderProfile?.vehicleModel}</p>
            </div>
          </div>

          <button
            onClick={() => setIsAvailable(!isAvailable)}
            className={`px-6 py-3 rounded-2xl font-medium flex items-center gap-2 ${isAvailable ? 'bg-green-600 text-white' : 'bg-gray-200'}`}
          >
            {isAvailable ? 'Go Offline' : 'Go Online'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Deliveries", value: stats.totalDeliveries, icon: Truck },
            { label: "Completed", value: stats.completed, icon: CheckCircle },
            { label: "Total Earnings", value: `₦${stats.totalEarnings.toLocaleString()}`, icon: DollarSign },
            { label: "Rating", value: riderProfile?.rating?.toFixed(1) || "4.8", icon: Star },
          ].map((s, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-all">
              <div className="flex justify-between">
                <div>
                  <p className="text-gray-500 text-sm">{s.label}</p>
                  <p className="text-3xl font-bold mt-2">{s.value}</p>
                </div>
                <s.icon className="w-10 h-10 text-rose-600" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Pie Chart */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6">Delivery Status</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={75} outerRadius={115} dataKey="value">
                    {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Earnings Line Chart */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
              Monthly Earnings <TrendingUp className="text-emerald-600" />
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={earningsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(val) => [`₦${val.toLocaleString()}`, 'Earnings']} />
                  <Line type="monotone" dataKey="earnings" stroke="#10b981" strokeWidth={4} dot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Deliveries */}
        <div className="bg-white rounded-3xl p-6 shadow-sm">
          <h3 className="font-semibold text-lg mb-5">Recent Deliveries</h3>
          <div className="space-y-4">
            {deliveries.slice(0, 6).map((order) => (
              <div key={order._id} className="flex flex-col md:flex-row justify-between items-center border border-gray-100 rounded-2xl p-5 hover:bg-gray-50 transition">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center text-2xl">📦</div>
                  <div>
                    <p className="font-medium">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {order.seller?.businessProfile?.businessName || order.seller?.firstName} → {order.buyer?.firstName}
                    </p>
                  </div>
                </div>

                <div className="text-right mt-3 md:mt-0">
                  <p className="font-bold text-emerald-600">₦{order.delivery?.agreedDeliveryFee || 0}</p>
                  <span className={`text-xs px-3 py-1 rounded-full ${order.status === 'delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiderBreakdown;