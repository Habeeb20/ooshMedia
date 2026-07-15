// // src/components/dashboard/StaffSalesDashboard.jsx
// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// import { Loader2, TrendingUp } from 'lucide-react';

// const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

// const RANGES = [
//   { key: '24h', label: '24 Hours' },
//   { key: '48h', label: '48 Hours' },
//   { key: 'thisWeek', label: 'This Week' },
//   { key: 'lastWeek', label: 'Last Week' },
//   { key: 'thisMonth', label: 'This Month' },
//   { key: 'last3Months', label: 'Last 3 Months' },
//   { key: 'last6Months', label: 'Last 6 Months' },
// ];

// const StaffSalesDashboard = ({ token }) => {
//   const [range, setRange] = useState('all');
//   const [data, setData] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     fetchSummary(range);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [range]);

//   const fetchSummary = async (r) => {
//     setLoading(true);
//     try {
//       const { data: res } = await axios.get(`${API_BASE_URL}/api/staff/sales-summary`, {
//         params: { range: r },
//         headers: { Authorization: `Bearer ${token}` },
//       });
//       setData(res.data || []);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Could not load sales summary.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const chartData = data.map((d) => ({
//     name: d.staffName || 'Unattributed',
//     sales: d.totalSales,
//     transactions: d.totalTransactions,
//   }));

//   const totalSales = data.reduce((sum, d) => sum + d.totalSales, 0);
//   const totalTx = data.reduce((sum, d) => sum + d.totalTransactions, 0);

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 p-5">
//       <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
//         <div>
//           <h3 className="font-bold text-gray-900 flex items-center gap-2">
//             <TrendingUp size={16} className="text-[#8B1E3F]" /> Staff Sales
//           </h3>
//           <p className="text-xs text-gray-500 mt-0.5">
//             ₦{totalSales.toLocaleString()} across {totalTx} sale{totalTx === 1 ? '' : 's'}
//           </p>
//         </div>
//         <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
//           {RANGES.map((r) => (
//             <button
//               key={r.key}
//               type="button"
//               onClick={() => setRange(r.key)}
//               className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition ${
//                 range === r.key ? 'bg-[#8B1E3F] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
//               }`}
//             >
//               {r.label}
//             </button>
//           ))}
//         </div>
//       </div>

//       {loading ? (
//         <div className="flex items-center justify-center py-16 text-gray-400 gap-2">
//           <Loader2 className="animate-spin" size={18} /> Loading…
//         </div>
//       ) : chartData.length === 0 ? (
//         <div className="text-center py-16 text-gray-400 text-sm">No sales recorded for this period.</div>
//       ) : (
//         <>
//           <div className="h-64 -ml-2">
//             <ResponsiveContainer width="100%" height="100%">
//               <BarChart data={chartData}>
//                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
//                 <XAxis dataKey="name" tick={{ fontSize: 11 }} />
//                 <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${v.toLocaleString()}`} width={70} />
//                 <Tooltip formatter={(v) => `₦${Number(v).toLocaleString()}`} />
//                 <Bar dataKey="sales" fill="#8B1E3F" radius={[6, 6, 0, 0]} />
//               </BarChart>
//             </ResponsiveContainer>
//           </div>

//           <div className="mt-4 divide-y divide-gray-100">
//             {data.map((d) => (
//               <div key={d._id} className="flex items-center justify-between py-2 text-sm">
//                 <span className="font-medium text-gray-700">{d.staffName || 'Unattributed'}</span>
//                 <span className="text-gray-500">{d.totalTransactions} sales</span>
//                 <span className="font-bold text-gray-900">₦{d.totalSales.toLocaleString()}</span>
//               </div>
//             ))}
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default StaffSalesDashboard;




// src/components/dashboard/StaffSalesDashboard.jsx
//
// ASSUMPTION ABOUT THE API RESPONSE SHAPE
// ----------------------------------------
// Your Transaction schema already stores an `items[]` array per sale
// (product, name, quantity, price, subtotal). For this dashboard to show
// product-level data, `/api/staff/sales-summary` needs to return that
// items array alongside each staff aggregate, e.g.:
//
// {
//   data: [
//     {
//       _id: "staffId",
//       staffName: "Amaka",
//       totalSales: 120000,
//       totalTransactions: 14,
//       items: [
//         { name: "Jollof Rice Pack", quantity: 20, subtotal: 40000 },
//         { name: "Chicken Wings", quantity: 12, subtotal: 30000 },
//       ]
//     }
//   ]
// }
//
// If `items` isn't in the payload yet, just push `items: t.items` (or
// unwind + group them) inside your existing aggregation pipeline — no
// other backend changes are needed. Everything below degrades gracefully
// (product chart/list just stay empty) if `items` is missing.
// src/components/dashboard/StaffSalesDashboard.jsx
//
// API RESPONSE SHAPE THIS EXPECTS
// ----------------------------------------
// Matches the getStaffSalesSummary aggregation, which groups by staff and
// does `transactions: { $push: '$$ROOT' }` — i.e. each staff group carries
// the full array of its raw transaction documents, items[] included:
//
// {
//   data: [
//     {
//       _id: "staffId",
//       staffName: "Habeeb Waliyu",
//       totalSales: 50000,
//       totalTransactions: 1,
//       transactions: [
//         {
//           _id: "...",
//           items: [{ name: "Aluminium roofing sheet", quantity: 1, price: 50000, subtotal: 50000 }],
//           receiptNumber: "RCP-...",
//           createdAt: "...",
//           ...
//         }
//       ]
//     }
//   ]
// }
//
// Product-level data (donut chart + receipt list) is derived client-side
// by flattening every staff member's transactions[].items. Nothing on the
// backend needs to change. If `transactions` is ever missing, the product
// view just falls back to its empty state instead of breaking.

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Loader2, TrendingUp, Package, Users, Receipt, ShoppingBag } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const RANGES = [
  { key: '24h', label: '24 Hours' },
  { key: '48h', label: '48 Hours' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'lastWeek', label: 'Last Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'last3Months', label: 'Last 3 Months' },
  { key: 'last6Months', label: 'Last 6 Months' },
];

// Wine (brand) + a warm gold and two supporting hues for the donut chart
const PALETTE = ['#8B1E3F', '#C08A2E', '#1E6B6B', '#5B4B8A', '#B85C38', '#4A6C6F', '#9C6644', '#3F6C51'];

const naira = (n) => `₦${Number(n || 0).toLocaleString()}`;

const StaffSalesDashboard = ({ token }) => {
  const [range, setRange] = useState('thisMonth');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('staff'); // 'staff' | 'products'

  useEffect(() => {
    fetchSummary(range);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  const fetchSummary = async (r) => {
    setLoading(true);
    try {
      const { data: res } = await axios.get(`${API_BASE_URL}/api/staff/sales-summary`, {
        params: { range: r },
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load sales summary.');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(
    () => data.map((d) => ({
      name: d.staffName || 'Unattributed',
      sales: d.totalSales,
      transactions: d.totalTransactions,
    })),
    [data]
  );

  // Your aggregation pushes the full transaction doc per staff group
  // ($push: '$$ROOT'), so each sale's `items[]` lives at
  // d.transactions[i].items — flatten every staff member's transactions'
  // items into one product-level aggregate.
  const productSummary = useMemo(() => {
    const map = new Map();
    data.forEach((d) => {
      (d.transactions || []).forEach((t) => {
        (t.items || []).forEach((it) => {
          const key = it.name || 'Unnamed item';
          const prev = map.get(key) || { name: key, quantity: 0, revenue: 0 };
          prev.quantity += it.quantity || 0;
          prev.revenue += it.subtotal ?? (it.quantity || 0) * (it.price || 0);
          map.set(key, prev);
        });
      });
    });
    return [...map.values()].sort((a, b) => b.revenue - a.revenue);
  }, [data]);

  const donutData = useMemo(() => {
    const top = productSummary.slice(0, 6);
    const restRevenue = productSummary.slice(6).reduce((s, p) => s + p.revenue, 0);
    const result = top.map((p) => ({ name: p.name, value: p.revenue }));
    if (restRevenue > 0) result.push({ name: 'Others', value: restRevenue });
    return result;
  }, [productSummary]);

  const totalSales = data.reduce((sum, d) => sum + d.totalSales, 0);
  const totalTx = data.reduce((sum, d) => sum + d.totalTransactions, 0);
  const totalUnits = productSummary.reduce((s, p) => s + p.quantity, 0);
  const topStaff = [...data].sort((a, b) => b.totalSales - a.totalSales)[0];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 mb-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 text-base sm:text-lg flex items-center gap-2">
              <TrendingUp size={18} className="text-[#8B1E3F]" /> Sales Overview
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {naira(totalSales)} across {totalTx} sale{totalTx === 1 ? '' : 's'}
            </p>
          </div>
        </div>

        {/* Range pills — horizontally scrollable on mobile */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-none">
          {RANGES.map((r) => (
            <button
              key={r.key}
              type="button"
              onClick={() => setRange(r.key)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition shrink-0 ${
                range === r.key ? 'bg-[#8B1E3F] text-white' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-gray-400 gap-2">
          <Loader2 className="animate-spin" size={18} /> Loading…
        </div>
      ) : data.length === 0 ? (
        <div className="text-center py-20 text-gray-400 text-sm">No sales recorded for this period.</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <KpiCard icon={<Receipt size={15} />} label="Total Sales" value={naira(totalSales)} />
            <KpiCard icon={<ShoppingBag size={15} />} label="Transactions" value={totalTx.toLocaleString()} />
            <KpiCard icon={<Package size={15} />} label="Units Sold" value={totalUnits.toLocaleString()} />
            <KpiCard
              icon={<Users size={15} />}
              label="Top Performer"
              value={topStaff?.staffName || '—'}
              sub={topStaff ? naira(topStaff.totalSales) : null}
            />
          </div>

          {/* View toggle */}
          <div className="inline-flex bg-gray-50 rounded-xl p-1 mb-4">
            <button
              onClick={() => setView('staff')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition ${
                view === 'staff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              By Staff
            </button>
            <button
              onClick={() => setView('products')}
              className={`text-xs font-semibold px-3.5 py-1.5 rounded-lg transition ${
                view === 'products' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
              }`}
            >
              By Product
            </button>
          </div>

          {view === 'staff' ? (
            <>
              <div className="h-56 sm:h-64 -ml-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F1F1" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={50} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₦${v.toLocaleString()}`} width={64} />
                    <Tooltip formatter={(v) => naira(v)} />
                    <Bar dataKey="sales" fill="#8B1E3F" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 divide-y divide-gray-100">
                {data.map((d) => (
                  <div key={d._id} className="flex items-center justify-between py-2.5 text-sm gap-2">
                    <span className="font-medium text-gray-700 truncate">{d.staffName || 'Unattributed'}</span>
                    <span className="text-gray-500 whitespace-nowrap">{d.totalTransactions} sales</span>
                    <span className="font-bold text-gray-900 whitespace-nowrap">{naira(d.totalSales)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : productSummary.length === 0 ? (
            <div className="text-center py-14 text-gray-400 text-sm">
              No product line-items in this period's data yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Donut chart */}
              <div className="lg:col-span-2 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="80%"
                      paddingAngle={2}
                    >
                      {donutData.map((_, i) => (
                        <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => naira(v)} />
                    <Legend
                      layout="vertical"
                      verticalAlign="middle"
                      align="right"
                      wrapperStyle={{ fontSize: 11 }}
                      iconType="circle"
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Receipt-style product list */}
              <div className="lg:col-span-3">
                <div className="relative bg-[#FBF8F5] rounded-xl border border-dashed border-gray-300 p-4 font-mono">
                  <p className="text-[10px] tracking-[0.2em] text-gray-400 text-center mb-2">
                    PRODUCT BREAKDOWN
                  </p>
                  <div className="border-t border-b border-dashed border-gray-300 py-2 divide-y divide-dashed divide-gray-200 max-h-72 overflow-y-auto">
                    {productSummary.map((p, i) => (
                      <div key={p.name + i} className="flex items-center justify-between py-1.5 text-xs gap-2">
                        <span className="text-gray-700 truncate">{p.name}</span>
                        <span className="text-gray-400 shrink-0">×{p.quantity}</span>
                        <span className="font-bold text-gray-900 shrink-0">{naira(p.revenue)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-2 text-xs font-bold text-[#8B1E3F]">
                    <span>TOTAL</span>
                    <span>{naira(productSummary.reduce((s, p) => s + p.revenue, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

const KpiCard = ({ icon, label, value, sub }) => (
  <div className="bg-gray-50 rounded-xl p-3 sm:p-3.5">
    <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
      {icon}
      <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
    </div>
    <p className="text-sm sm:text-base font-bold text-gray-900 truncate">{value}</p>
    {sub && <p className="text-[10px] text-gray-500 mt-0.5">{sub}</p>}
  </div>
);

export default StaffSalesDashboard;