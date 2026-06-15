import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../config/api';
import { TrendingUp, ShoppingBag, Users, DollarSign, AlertTriangle } from 'lucide-react';

const PERIODS = [
  { label: '12h', value: '12h' },
  { label: '24h', value: '24h' },
  { label: '48h', value: '48h' },
  { label: 'This Week', value: 'week' },
  { label: 'Last Week', value: 'lastWeek' },
  { label: 'This Month', value: 'month' },
  { label: 'Last Month', value: 'lastMonth' },
  { label: '3 Months', value: '3months' },
  { label: '6 Months', value: '6months' },
  { label: '1 Year', value: 'year' },
];

const PIE_COLORS = ['#6366f1', '#22d3ee', '#f59e0b', '#10b981'];

const StatCard = ({ icon: Icon, label, value, sub, color = 'indigo' }) => (
  <div className="bg-white rounded-2xl p-5 shadow-sm flex gap-4 items-center">
    <div className={`w-12 h-12 rounded-xl bg-${color}-100 flex items-center justify-center`}>
      <Icon size={22} className={`text-${color}-600`} />
    </div>
    <div>
      <p className="text-xs text-gray-400">{label}</p>
      <p className="text-xl font-black text-gray-800">{value}</p>
      {sub && <p className="text-xs text-gray-500">{sub}</p>}
    </div>
  </div>
);

export default function SellerDashboard() {
  const [period, setPeriod] = useState('week');
  const [analytics, setAnalytics] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/api/analytics/seller?period=${period}`),
      api.get('/api/orders/seller'),
      // api.get('/api/orders/seller?status=pending'),
      api.get('/api/analytics/customers'),
    ]).then(([a, o, c]) => {
      setAnalytics(a.data);
      setOrders(o.data);
      setCustomers(c.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, [period]);

  if (loading && !analytics) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading dashboard...</div>;
  }

  const paymentPieData = analytics?.paymentSplit
    ? Object.entries(analytics.paymentSplit).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-2xl font-black text-gray-800">Seller Dashboard</h1>
        <div className="flex gap-2 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.value ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-5 border-b border-gray-200">
        {['overview', 'orders', 'customers'].map(t => (
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

      {tab === 'overview' && analytics && (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard icon={DollarSign} label="Total Revenue" value={`₦${analytics.summary.totalRevenue.toLocaleString()}`} color="indigo" />
            <StatCard icon={TrendingUp} label="Your Earnings" value={`₦${analytics.summary.totalSellerEarnings.toLocaleString()}`} color="green" />
            <StatCard icon={ShoppingBag} label="Total Orders" value={analytics.summary.totalOrders} color="purple" />
            <StatCard
              icon={AlertTriangle}
              label="Platform Fee"
              value={`₦${analytics.summary.totalPlatformFee.toLocaleString()}`}
              sub="To be remitted"
              color="amber"
            />
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-4">Revenue Over Time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={analytics.daily}>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={v => v.slice(5)} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={(v) => [`₦${v.toLocaleString()}`, 'Revenue']} />
                  <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <h2 className="font-bold text-gray-700 mb-4">Payment Methods</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name }) => name}>
                    {paymentPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Products */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4">Product Performance</h2>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.products.slice(0, 8)} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `₦${(v/1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                <Tooltip formatter={(v) => [`₦${v.toLocaleString()}`, 'Revenue']} />
                <Bar dataKey="revenue" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {analytics.products.length > 0 && (
                <>
                  <div className="bg-green-50 rounded-xl p-3">
                    <p className="text-gray-500">Best Seller</p>
                    <p className="font-bold text-green-700 truncate">{analytics.products[0].name}</p>
                    <p className="text-green-600">{analytics.products[0].qty} units</p>
                  </div>
                  {analytics.products.length > 1 && (
                    <div className="bg-red-50 rounded-xl p-3">
                      <p className="text-gray-500">Least Sold</p>
                      <p className="font-bold text-red-700 truncate">{analytics.products[analytics.products.length - 1].name}</p>
                      <p className="text-red-600">{analytics.products[analytics.products.length - 1].qty} units</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'orders' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="font-bold text-gray-700">Incoming Orders</h2>
          </div>
          <div className="divide-y">
            {orders.length === 0 && <p className="text-center text-gray-400 py-8">No pending orders</p>}
            {orders.map(order => (
              <div key={order._id} className="p-4 hover:bg-gray-50 transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">{order.buyer?.firstName} {order.buyer?.lastName} — {order.buyer?.phoneNumber}</p>
                    <p className="text-xs text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-indigo-600">₦{order.items.reduce((s,i)=>s+i.subtotal,0).toLocaleString()}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      order.paymentMethod === 'online' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {order.paymentMethod === 'online' ? 'Paid Online' : 'Pay on Delivery'}
                    </span>
                    <p className="text-xs text-gray-500 capitalize mt-0.5">{order.fulfillmentType}</p>
                  </div>
                </div>
                <div className="mt-2 space-y-0.5">
                  {order.items.map((item, i) => (
                    <p key={i} className="text-xs text-gray-500">{item.name} × {item.quantity}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'customers' && (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-700">Customer Management</h2>
            <p className="text-sm text-gray-400">{customers.length} customers</p>
          </div>
          <div className="divide-y">
            {customers.map((c, i) => (
              <div key={c.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                    {c.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{c.name}</p>
                    {c.phone && <p className="text-xs text-gray-500">{c.phone}</p>}
                    {c.email && <p className="text-xs text-gray-400">{c.email}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-indigo-600">₦{c.totalSpent.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{c.orders} order{c.orders !== 1 ? 's' : ''}</p>
                  {i === 0 && <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Top customer</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
