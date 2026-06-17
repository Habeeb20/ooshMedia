import { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2, Package, Star, CreditCard, ChevronRight } from 'lucide-react';
import BuyerOrderDetail from './BuyerOrderDashboard';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981', '#f43f5e'];

export default function BuyerDashboard() {
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState('orders');
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [ordersRes, analyticsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/my`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/buyer`, { headers }),
        ]);
        setOrders(ordersRes.data);
        setAnalytics(analyticsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const catPieData = analytics?.categoryBreakdown
    ? Object.entries(analytics.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={28} className="animate-spin text-rose-900" />
      </div>
    );
  }

  if (selectedOrderId) {
    return <BuyerOrderDetail orderId={selectedOrderId} onBack={() => setSelectedOrderId(null)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <h1 className="text-2xl font-black text-gray-800 mb-6">My Account</h1>

      {/* Stats */}
      {analytics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <CreditCard size={22} className="text-indigo-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Total Spent</p>
            <p className="font-black text-gray-800">₦{analytics.totalSpent.toLocaleString()}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
            <Package size={22} className="text-purple-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Orders</p>
            <p className="font-black text-gray-800">{analytics.totalOrders}</p>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm text-center col-span-2">
            <Star size={22} className="text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-gray-400">Loyalty Points</p>
            <p className="font-black text-gray-800 text-xl">{analytics.loyaltyPoints.toLocaleString()} pts</p>
            <p className="text-xs text-gray-400">≈ ₦{(analytics.loyaltyPoints * 10).toLocaleString()} value</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 mb-5 border-b border-gray-200">
        {['orders', 'analytics'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`pb-2 capitalize text-sm font-semibold border-b-2 transition-all ${
              tab === t ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-400'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'orders' && (
        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center text-gray-400">
              <Package size={48} className="mx-auto mb-3 text-gray-300" />
              <p>No orders yet</p>
            </div>
          ) : (
            orders.map(order => (
              <button
                key={order._id}
                onClick={() => setSelectedOrderId(order._id)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all flex justify-between items-center text-left active:scale-[0.99]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-rose-900" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-800 truncate">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end gap-1 shrink-0">
                  <p className="font-bold text-indigo-600">₦{order.totalAmount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-600'}`}>
                    {order.status}
                  </span>
                  {order.fulfillmentType === 'delivery' && order.delivery?.deliveryCode && order.status !== 'delivered' && (
                    <span className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">
                      Code: {order.delivery.deliveryCode}
                    </span>
                  )}
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </button>
            ))
          )}
        </div>
      )}

      {tab === 'analytics' && analytics && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4">Monthly Spending</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analytics.monthly}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
                <Tooltip formatter={(v) => [`₦${v.toLocaleString()}`, 'Spent']} />
                <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {catPieData.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-4">Spending by Category</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={catPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name }) => name}>
                    {catPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => `₦${v.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
}