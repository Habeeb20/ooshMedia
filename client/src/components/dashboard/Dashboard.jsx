// import React, { useEffect, useMemo, useState } from "react";
// import {
//   ResponsiveContainer,
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
// } from "recharts";
// import {
//   Package,
//   Truck,
//   ShoppingBag,
//   Wallet,
//   Star,
//   TrendingUp,
//   Users,
//   FileText,
//   AlertTriangle,
//   Award,
//   ChevronRight,
// } from "lucide-react";

// // ---------------------------------------------------------------------------
// // Palette — deep ink + amber accent (logistics/market vibe, not generic SaaS)
// // ---------------------------------------------------------------------------
// const COLORS = {
//   ink: "#FFFFFF",
//   panel: "#F6F7F8",
//   panelBorder: "#E4E7EB",
//   amber: "#C8821F",
//   teal: "#1F9B85",
//   coral: "#D14E37",
//   mist: "#F2F4F6",
//   textDim: "#5B6670",
// };
// const PIE_COLORS = ["#C8821F", "#1F9B85", "#D14E37", "#3866A3", "#7A5C99"];

// const fmtNaira = (n = 0) =>
//   "₦" + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });

// export default function Dashboard() {
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//     const [currentTime, setCurrentTime] = useState(new Date());
//   const [animIn, setAnimIn] = useState(false);
//  const token = localStorage.getItem('token')

//    useEffect(() => {
//     const timer = setInterval(() => setCurrentTime(new Date()), 60000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     let cancelled = false;
//     async function load() {
//       try {
//         setLoading(true);
//         const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
//           headers: {
//             Authorization: `Bearer ${token}`
//           }
//         });
//         const json = await res.json();
//         if (!json.success) throw new Error(json.message || "Failed to load");
//         if (!cancelled) setData(json.data);
//       } catch (e) {
//         if (!cancelled) setError(e.message);
//       } finally {
//         if (!cancelled) setLoading(false);
//       }
//     }
//     load();
//     return () => {
//       cancelled = true;
//     };
//   }, []);

//   if (loading) return <LoadingState />;
//   if (error) return <ErrorState message={error} />;
//   if (!data) return null;

//   const { profile, client, seller, rider, posts, loyalty, flags } = data;
 
//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: COLORS.ink,
//         color: "#101418",
//         fontFamily:
//           "'Sora', 'Segoe UI', system-ui, -apple-system, sans-serif",
//       }}
//       className="px-4 py-6 md:px-8 md:py-10"
//     >
//       <Header profile={profile} flags={flags} />

//       {/* ---- Top stat grid (always visible) ---- */}
//       <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-6">
//         <StatCard
//           icon={<ShoppingBag size={18} />}
//           label="Orders placed"
//           value={client?.totalOrders ?? 0}
//           accent={COLORS.amber}
//         />
//         <StatCard
//           icon={<Wallet size={18} />}
//           label="Total spent"
//           value={fmtNaira(client?.totalSpent)}
//           accent={COLORS.teal}
//         />
//         <StatCard
//           icon={<Award size={18} />}
//           label="Loyalty points"
//           value={loyalty?.availablePoints ?? 0}
//           accent={COLORS.coral}
//         />
//         <StatCard
//           icon={<FileText size={18} />}
//           label="Posts published"
//           value={posts?.totalPosts ?? 0}
//           accent="#5B8FB9"
//         />
//       </section>

//       {/* ---- Buyer activity chart ---- */}
//       <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
//         <Panel title="Monthly spend" className="md:col-span-2">
//           <ResponsiveContainer width="100%" height={260}>
//             <AreaChart data={client?.monthlySpend || []}>
//               <defs>
//                 <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
//                   <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.45} />
//                   <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
//                 </linearGradient>
//               </defs>
//               <CartesianGrid strokeDasharray="3 3" stroke="#1F3338" vertical={false} />
//               <XAxis dataKey="label" stroke={COLORS.textDim} fontSize={12} />
//               <YAxis stroke={COLORS.textDim} fontSize={12} />
//               <Tooltip
//                 contentStyle={{ background: COLORS.panel, border: "none", borderRadius: 8 }}
                
//                 formatter={(v) => fmtNaira(v)}
//               />
//               <Area type="monotone" dataKey="total" stroke={COLORS.amber} fill="url(#spendFill)" strokeWidth={2.5} />
//             </AreaChart>
//           </ResponsiveContainer>
//         </Panel>

//         <Panel title="Orders by status">
//           <DonutChart data={objToChartData(client?.ordersByStatus)} />
//         </Panel>
//       </section>

//       {/* ---- Recent orders ---- */}
//       <section className="mt-8">
//         <Panel title="Recent orders">
//           <OrdersTable orders={client?.recentOrders || []} />
//         </Panel>
//       </section>

//       {/* ---- SELLER SECTION ---- */}
//       {flags.isSeller && seller && (
//         <>
//           <SectionHeading icon={<Package size={18} />} title="Seller performance" />
//           <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-4">
//             <StatCard icon={<Package size={18} />} label="Products listed" value={seller.totalProducts} accent={COLORS.teal} />
//             <StatCard icon={<Wallet size={18} />} label="Revenue earned" value={fmtNaira(seller.totalRevenue)} accent={COLORS.amber} />
//             <StatCard icon={<ShoppingBag size={18} />} label="Orders received" value={seller.totalOrders} accent={COLORS.coral} />
//             <StatCard
//               icon={<AlertTriangle size={18} />}
//               label="Low stock items"
//               value={seller.lowStockProducts?.length || 0}
//               accent="#E2654A"
//             />
//           </section>

//           <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
//             <Panel title="Monthly revenue" className="md:col-span-2">
//               <ResponsiveContainer width="100%" height={250}>
//                 <BarChart data={seller.monthlyRevenue || []}>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#1F3338" vertical={false} />
//                   <XAxis dataKey="label" stroke={COLORS.textDim} fontSize={12} />
//                   <YAxis stroke={COLORS.textDim} fontSize={12} />
//                   <Tooltip contentStyle={{ background: COLORS.panel, border: "none", borderRadius: 8 }} formatter={(v) => fmtNaira(v)} />
//                   <Bar dataKey="revenue" fill={COLORS.teal} radius={[6, 6, 0, 0]} />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Panel>

//             <Panel title="Products by status">
//               <DonutChart data={objToChartData(seller.productsByStatus)} />
//             </Panel>
//           </section>

//           <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
//             <Panel title="Top selling products">
//               <ul className="divide-y divide-gray-200">
//                 {(seller.topProducts || []).map((p) => (
//                   <li key={p._id} className="flex items-center justify-between py-3">
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={p.images?.[0]?.url || "https://placehold.co/40x40"}
//                         alt={p.name}
//                         className="w-10 h-10 rounded-lg object-cover bg-gray-100"
//                       />
//                       <div>
//                         <p className="text-sm font-medium">{p.name}</p>
//                         <p className="text-xs" style={{ color: COLORS.textDim }}>
//                           {fmtNaira(p.price)} · {p.sold || 0} sold
//                         </p>
//                       </div>
//                     </div>
//                     <span className="flex items-center gap-1 text-xs" style={{ color: COLORS.amber }}>
//                       <Star size={12} fill={COLORS.amber} /> {p.ratings || 0}
//                     </span>
//                   </li>
//                 ))}
//                 {(!seller.topProducts || seller.topProducts.length === 0) && <EmptyRow text="No products sold yet" />}
//               </ul>
//             </Panel>

//             <Panel title="Low stock alerts">
//               <ul className="divide-y divide-gray-200">
//                 {(seller.lowStockProducts || []).map((p) => (
//                   <li key={p._id} className="flex items-center justify-between py-3">
//                     <span className="text-sm">{p.name}</span>
//                     <span className="text-xs px-2 py-1 rounded-full bg-[#E2654A]/15 text-[#E2654A]">
//                       {p.stockQuantity} left
//                     </span>
//                   </li>
//                 ))}
//                 {(!seller.lowStockProducts || seller.lowStockProducts.length === 0) && (
//                   <EmptyRow text="Stock levels are healthy" />
//                 )}
//               </ul>
//             </Panel>
//           </section>
//         </>
//       )}

//       {/* ---- RIDER SECTION ---- */}
//       {flags.isRider && rider && (
//         <>
//           <SectionHeading icon={<Truck size={18} />} title="Rider performance" />
//           <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-4">
//             <StatCard icon={<Truck size={18} />} label="Deliveries assigned" value={rider.totalAssigned} accent={COLORS.teal} />
//             <StatCard icon={<Wallet size={18} />} label="Total earnings" value={fmtNaira(rider.totalEarnings)} accent={COLORS.amber} />
//             <StatCard icon={<TrendingUp size={18} />} label="Completed" value={rider.completedDeliveries} accent={COLORS.coral} />
//             <StatCard
//               icon={<Star size={18} />}
//               label="Completion rate"
//               value={
//                 rider.totalAssigned
//                   ? Math.round((rider.completedDeliveries / rider.totalAssigned) * 100) + "%"
//                   : "0%"
//               }
//               accent="#5B8FB9"
//             />
//           </section>

//           <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
//             <Panel title="Monthly earnings" className="md:col-span-2">
//               <ResponsiveContainer width="100%" height={250}>
//                 <AreaChart data={rider.monthlyDeliveries || []}>
//                   <defs>
//                     <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
//                       <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.45} />
//                       <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
//                     </linearGradient>
//                   </defs>
//                   <CartesianGrid strokeDasharray="3 3" stroke="#1F3338" vertical={false} />
//                   <XAxis dataKey="label" stroke={COLORS.textDim} fontSize={12} />
//                   <YAxis stroke={COLORS.textDim} fontSize={12} />
//                   <Tooltip contentStyle={{ background: COLORS.panel, border: "none", borderRadius: 8 }} formatter={(v) => fmtNaira(v)} />
//                   <Area type="monotone" dataKey="earnings" stroke={COLORS.teal} fill="url(#earnFill)" strokeWidth={2.5} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </Panel>

//             <Panel title="Deliveries by status">
//               <DonutChart data={objToChartData(rider.deliveriesByStatus)} />
//             </Panel>
//           </section>

//           <section className="mt-5">
//             <Panel title="Recent deliveries">
//               <ul className="divide-y divide-gray-200">
//                 {(rider.recentDeliveries || []).map((d) => (
//                   <li key={d._id} className="flex items-center justify-between py-3 text-sm">
//                     <span>{d.orderNumber}</span>
//                     <span style={{ color: COLORS.textDim }}>{d.delivery?.address || "—"}</span>
//                     <StatusPill status={d.status} />
//                   </li>
//                 ))}
//                 {(!rider.recentDeliveries || rider.recentDeliveries.length === 0) && <EmptyRow text="No deliveries yet" />}
//               </ul>
//             </Panel>
//           </section>
//         </>
//       )}

//       {/* ---- POSTS / ENGAGEMENT SECTION ---- */}
//       <SectionHeading icon={<Users size={18} />} title="Posts & engagement" />
//       <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-4">
//         <StatCard icon={<FileText size={18} />} label="Total posts" value={posts?.totalPosts ?? 0} accent={COLORS.amber} />
//         <StatCard icon={<TrendingUp size={18} />} label="Total views" value={posts?.totalViews ?? 0} accent={COLORS.teal} />
//         <StatCard icon={<Star size={18} />} label="Total likes" value={posts?.totalLikes ?? 0} accent={COLORS.coral} />
//         <StatCard icon={<Users size={18} />} label="Applications received" value={posts?.totalApplications ?? 0} accent="#5B8FB9" />
//       </section>
//     </div>
//   );
// }

// // ---------------------------------------------------------------------------
// // Sub-components
// // ---------------------------------------------------------------------------
// function Header({ profile, flags }) {
//       const [currentTime, setCurrentTime] = useState(new Date());
//    const getGreeting = () => {
//     const h = currentTime.getHours();
//     if (h < 12) return { text: "Good morning", emoji: "☀️" };
//     if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
//     return { text: "Good evening", emoji: "🌙" };
//   };

//     const { text: greetText, emoji: greetEmoji } = getGreeting();


//   return (
//     <header className="flex items-center  justify-between flex-wrap gap-4 p-5 bg-[#8B1E3F]">
//       <div className="flex items-center gap-3">
//         <img
//           src={profile?.profilePicture || "https://placehold.co/56x56"}
//           alt={profile?.username}
//           className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2"
//           style={{ borderColor: COLORS.amber }}
//         />
//         <div>
//               <p className="text-rose-200 text-sm font-medium mb-1">
//               {greetEmoji} {greetText}
//             </p>
//           <h1 className="text-lg  text-white md:text-xl font-semibold">
//             Welcome back, {profile?.firstName}
//           </h1>
//           <p className="text-xs text-white md:text-sm">
//           {/* <p className="text-xs text-white md:text-sm" style={{ color: COLORS.textDim }}> */}
//             @{profile?.username} ·{" "}
//             {[flags.isSeller && "Seller", flags.isRider && "Rider", "Buyer"].filter(Boolean).join(" · ")}
//           </p>
//         </div>
//       </div>
//       <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: COLORS.panel }}>
//         <Award size={14} style={{ color: COLORS.amber }} />
//         {profile?.referralPoints || 0} referral pts · {profile?.referralCount || 0} referrals
//       </div>
//        <div className="text-right">
//               <p className="text-2xl font-bold text-white">
//                 {currentTime.toLocaleTimeString('en-NG', { hour: 'numeric', minute: '2-digit' })}
//               </p>
//               <p className="text-rose-200 text-xs mt-0.5">
//                 {currentTime.toLocaleDateString('en-NG', { weekday: 'short', month: 'short', day: 'numeric' })}
//               </p>
//             </div>
//     </header>
//   );
// }

// function SectionHeading({ icon, title }) {
//   return (
//     <div className="flex items-center gap-2 mt-10 mb-1">
//       <span style={{ color: COLORS.amber }}>{icon}</span>
//       <h2 className="text-base md:text-lg font-semibold tracking-tight">{title}</h2>
//       <div className="flex-1 h-px ml-2" style={{ background: "#1F3338" }} />
//     </div>
//   );
// }

// function StatCard({ icon, label, value, accent }) {
//   return (
//     <div
//       className="rounded-2xl p-4 md:p-5 flex flex-col gap-2"
//       style={{ background: COLORS.panel, borderLeft: `3px solid ${accent}`, border: `1px solid ${COLORS.panelBorder}`, boxShadow: "0 1px 3px rgba(16,20,24,0.05)" }}
//     >
//       <div className="flex items-center justify-between">
//         <span className="text-xs md:text-sm" style={{ color: COLORS.textDim }}>
//           {label}
//         </span>
//         <span style={{ color: accent }}>{icon}</span>
//       </div>
//       <span className="text-lg md:text-2xl font-semibold">{value}</span>
//     </div>
//   );
// }

// function Panel({ title, children, className = "" }) {
//   return (
//     <div
//       className={`rounded-2xl p-4 md:p-5 ${className}`}
//       style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, boxShadow: "0 1px 3px rgba(16,20,24,0.05)" }}
//     >
//       <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textDim }}>
//         {title}
//       </h3>
//       {children}
//     </div>
//   );
// }

// function DonutChart({ data }) {
//   if (!data.length) return <EmptyRow text="No data yet" />;
//   return (
//     <ResponsiveContainer width="100%" height={220}>
//       <PieChart>
//         <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
//           {data.map((_, i) => (
//             <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
//           ))}
//         </Pie>
//         <Tooltip contentStyle={{ background: COLORS.panel, border: "none", borderRadius: 8 }} />
//       </PieChart>
//     </ResponsiveContainer>
//   );
// }

// function OrdersTable({ orders }) {
//   if (!orders.length) return <EmptyRow text="No orders yet" />;
//   return (
//     <div className="overflow-x-auto -mx-2">
//       <table className="w-full text-sm min-w-[560px]">
//         <thead>
//           <tr className="text-left" style={{ color: COLORS.textDim }}>
//             <th className="py-2 px-2 font-normal">Order</th>
//             <th className="py-2 px-2 font-normal">Seller</th>
//             <th className="py-2 px-2 font-normal">Amount</th>
//             <th className="py-2 px-2 font-normal">Status</th>
//             <th className="py-2 px-2 font-normal"></th>
//           </tr>
//         </thead>
//         <tbody>
//           {orders.map((o) => (
//             <tr key={o._id} className="border-t border-gray-200">
//               <td className="py-3 px-2">{o.orderNumber}</td>
//               <td className="py-3 px-2" style={{ color: COLORS.textDim }}>
//                 {o.seller?.businessProfile?.businessName || o.seller?.username || "—"}
//               </td>
//               <td className="py-3 px-2">{fmtNaira(o.totalAmount)}</td>
//               <td className="py-3 px-2">
//                 <StatusPill status={o.status} />
//               </td>
//               <td className="py-3 px-2 text-right">
//                 <ChevronRight size={14} style={{ color: COLORS.textDim }} />
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

// function StatusPill({ status }) {
//   const map = {
//     delivered: COLORS.teal,
//     paid: COLORS.teal,
//     completed: COLORS.teal,
//     pending: COLORS.amber,
//     processing: COLORS.amber,
//     shipped: "#5B8FB9",
//     confirmed: "#5B8FB9",
//     cancelled: COLORS.coral,
//     failed: COLORS.coral,
//   };
//   const color = map[status] || COLORS.textDim;
//   return (
//     <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: `${color}22`, color }}>
//       {status}
//     </span>
//   );
// }

// function EmptyRow({ text }) {
//   return <p className="text-sm py-6 text-center" style={{ color: COLORS.textDim }}>{text}</p>;
// }

// function LoadingState() {
//   return (
//     <div style={{ background: COLORS.ink, minHeight: "100vh" }} className="flex items-center justify-center text-gray-500">
//       Loading dashboard…
//     </div>
//   );
// }

// function ErrorState({ message }) {
//   return (
//     <div style={{ background: COLORS.ink, minHeight: "100vh" }} className="flex items-center justify-center text-[#E2654A]">
//       {message}
//     </div>
//   );
// }

// function objToChartData(obj = {}) {
//   return Object.entries(obj).map(([name, value]) => ({ name, value }));
// }





import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Package,
  Truck,
  ShoppingBag,
  Wallet,
  Star,
  TrendingUp,
  Users,
  FileText,
  AlertTriangle,
  Award,
  ChevronRight,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Palette — white background, dark text, amber/teal/coral accents
// ---------------------------------------------------------------------------
const COLORS = {
  ink: "#FFFFFF",
  panel: "#F6F7F8",
  panelBorder: "#E4E7EB",
  amber: "#C8821F",
  teal: "#1F9B85",
  coral: "#D14E37",
  blue: "#3866A3",
  mist: "#F2F4F6",
  textDim: "#5B6670",
};
const PIE_COLORS = ["#C8821F", "#1F9B85", "#D14E37", "#3866A3", "#7A5C99"];

const fmtNaira = (n = 0) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const token = localStorage.getItem("token");

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const json = await res.json();
        if (!json.success) throw new Error(json.message || "Failed to load");
        if (!cancelled) setData(json.data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!data) return null;

  const { profile, client, seller, rider, posts, loyalty, flags } = data;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: COLORS.ink,
        color: "#101418",
        fontFamily: "'Sora', 'Segoe UI', system-ui, -apple-system, sans-serif",
      }}
    >
      <Header profile={profile} flags={flags} currentTime={currentTime} />

      <div className="px-4 py-6 md:px-8 md:py-10">
        {/* ---- Top stat grid (always visible) ---- */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <StatCard
            icon={<ShoppingBag size={18} />}
            label="Orders placed"
            value={client?.totalOrders ?? 0}
            accent={COLORS.amber}
          />
          <StatCard
            icon={<Wallet size={18} />}
            label="Total spent"
            value={fmtNaira(client?.totalSpent)}
            accent={COLORS.teal}
          />
          <StatCard
            icon={<Award size={18} />}
            label="Loyalty points"
            value={loyalty?.availablePoints ?? 0}
            accent={COLORS.coral}
          />
          <StatCard
            icon={<FileText size={18} />}
            label="Posts published"
            value={posts?.totalPosts ?? 0}
            accent={COLORS.blue}
          />
        </section>

        {/* ---- Buyer activity chart ---- */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
          <Panel title="Monthly spend" className="md:col-span-2">
            {client?.monthlySpend?.length ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={client.monthlySpend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={COLORS.amber} stopOpacity={0.45} />
                      <stop offset="100%" stopColor={COLORS.amber} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke={COLORS.textDim}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: COLORS.panelBorder }}
                  />
                  <YAxis
                    stroke={COLORS.textDim}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(v) => fmtNaira(v)}
                  />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8 }}
                    labelStyle={{ color: "#101418", fontWeight: 600 }}
                    itemStyle={{ color: COLORS.amber }}
                    formatter={(v) => fmtNaira(v)}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke={COLORS.amber}
                    fill="url(#spendFill)"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: COLORS.amber, strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyRow text="No paid orders yet — spend trend will appear once orders come in" />
            )}
          </Panel>

          <Panel title="Orders by status">
            <DonutChart data={objToChartData(client?.ordersByStatus)} />
          </Panel>
        </section>

        {/* ---- Alternative view: monthly spend as a bar chart.
             Bars read more clearly than an area fill when there are
             only a few months of data, or values are close to zero. ---- */}
        <section className="mt-5">
          <Panel title="Monthly spend (bar view)">
            {client?.monthlySpend?.length ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={client.monthlySpend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} vertical={false} />
                  <XAxis
                    dataKey="label"
                    stroke={COLORS.textDim}
                    fontSize={12}
                    tickLine={false}
                    axisLine={{ stroke: COLORS.panelBorder }}
                  />
                  <YAxis
                    stroke={COLORS.textDim}
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    width={70}
                    tickFormatter={(v) => fmtNaira(v)}
                  />
                  <Tooltip
                    contentStyle={{ background: "#fff", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8 }}
                    labelStyle={{ color: "#101418", fontWeight: 600 }}
                    formatter={(v) => fmtNaira(v)}
                  />
                  <Bar dataKey="total" fill={COLORS.amber} radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyRow text="No paid orders yet — spend trend will appear once orders come in" />
            )}
          </Panel>
        </section>

        {/* ---- Recent orders ---- */}
        <section className="mt-8">
          <Panel title="Recent orders">
            <OrdersTable orders={client?.recentOrders || []} />
          </Panel>
        </section>

        {/* ---- SELLER SECTION ---- */}
        {flags.isSeller && seller && (
          <>
            <SectionHeading icon={<Package size={18} />} title="Seller performance" />
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-4">
              <StatCard icon={<Package size={18} />} label="Products listed" value={seller.totalProducts} accent={COLORS.teal} />
              <StatCard icon={<Wallet size={18} />} label="Revenue earned" value={fmtNaira(seller.totalRevenue)} accent={COLORS.amber} />
              <StatCard icon={<ShoppingBag size={18} />} label="Orders received" value={seller.totalOrders} accent={COLORS.coral} />
              <StatCard
                icon={<AlertTriangle size={18} />}
                label="Low stock items"
                value={seller.lowStockProducts?.length || 0}
                accent={COLORS.coral}
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <Panel title="Monthly revenue" className="md:col-span-2">
                {seller.monthlyRevenue?.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={seller.monthlyRevenue} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} vertical={false} />
                      <XAxis dataKey="label" stroke={COLORS.textDim} fontSize={12} tickLine={false} axisLine={{ stroke: COLORS.panelBorder }} />
                      <YAxis stroke={COLORS.textDim} fontSize={12} tickLine={false} axisLine={false} width={70} tickFormatter={(v) => fmtNaira(v)} />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8 }}
                        labelStyle={{ color: "#101418", fontWeight: 600 }}
                        formatter={(v) => fmtNaira(v)}
                      />
                      <Bar dataKey="revenue" fill={COLORS.teal} radius={[6, 6, 0, 0]} maxBarSize={48} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyRow text="No revenue yet — this fills in once paid orders come through" />
                )}
              </Panel>

              <Panel title="Products by status">
                <DonutChart data={objToChartData(seller.productsByStatus)} />
              </Panel>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              <Panel title="Top selling products">
                <ul className="divide-y divide-gray-200">
                  {(seller.topProducts || []).map((p) => (
                    <li key={p._id} className="flex items-center justify-between py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.images?.[0]?.url || "https://placehold.co/40x40"}
                          alt={p.name}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-100"
                        />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-xs" style={{ color: COLORS.textDim }}>
                            {fmtNaira(p.price)} · {p.sold || 0} sold
                          </p>
                        </div>
                      </div>
                      <span className="flex items-center gap-1 text-xs" style={{ color: COLORS.amber }}>
                        <Star size={12} fill={COLORS.amber} /> {p.ratings || 0}
                      </span>
                    </li>
                  ))}
                  {(!seller.topProducts || seller.topProducts.length === 0) && <EmptyRow text="No products sold yet" />}
                </ul>
              </Panel>

              <Panel title="Low stock alerts">
                <ul className="divide-y divide-gray-200">
                  {(seller.lowStockProducts || []).map((p) => (
                    <li key={p._id} className="flex items-center justify-between py-3">
                      <span className="text-sm">{p.name}</span>
                      <span className="text-xs px-2 py-1 rounded-full" style={{ background: `${COLORS.coral}1A`, color: COLORS.coral }}>
                        {p.stockQuantity} left
                      </span>
                    </li>
                  ))}
                  {(!seller.lowStockProducts || seller.lowStockProducts.length === 0) && (
                    <EmptyRow text="Stock levels are healthy" />
                  )}
                </ul>
              </Panel>
            </section>
          </>
        )}

        {/* ---- RIDER SECTION ---- */}
        {flags.isRider && rider && (
          <>
            <SectionHeading icon={<Truck size={18} />} title="Rider performance" />
            <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-4">
              <StatCard icon={<Truck size={18} />} label="Deliveries assigned" value={rider.totalAssigned} accent={COLORS.teal} />
              <StatCard icon={<Wallet size={18} />} label="Total earnings" value={fmtNaira(rider.totalEarnings)} accent={COLORS.amber} />
              <StatCard icon={<TrendingUp size={18} />} label="Completed" value={rider.completedDeliveries} accent={COLORS.coral} />
              <StatCard
                icon={<Star size={18} />}
                label="Completion rate"
                value={
                  rider.totalAssigned
                    ? Math.round((rider.completedDeliveries / rider.totalAssigned) * 100) + "%"
                    : "0%"
                }
                accent={COLORS.blue}
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
              <Panel title="Monthly earnings" className="md:col-span-2">
                {rider.monthlyDeliveries?.length ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={rider.monthlyDeliveries} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="earnFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.45} />
                          <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={COLORS.panelBorder} vertical={false} />
                      <XAxis dataKey="label" stroke={COLORS.textDim} fontSize={12} tickLine={false} axisLine={{ stroke: COLORS.panelBorder }} />
                      <YAxis stroke={COLORS.textDim} fontSize={12} tickLine={false} axisLine={false} width={70} tickFormatter={(v) => fmtNaira(v)} />
                      <Tooltip
                        contentStyle={{ background: "#fff", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8 }}
                        labelStyle={{ color: "#101418", fontWeight: 600 }}
                        formatter={(v) => fmtNaira(v)}
                      />
                      <Area
                        type="monotone"
                        dataKey="earnings"
                        stroke={COLORS.teal}
                        fill="url(#earnFill)"
                        strokeWidth={2.5}
                        dot={{ r: 3, fill: COLORS.teal, strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                        isAnimationActive={false}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <EmptyRow text="No completed deliveries yet — earnings trend appears once you deliver" />
                )}
              </Panel>

              <Panel title="Deliveries by status">
                <DonutChart data={objToChartData(rider.deliveriesByStatus)} />
              </Panel>
            </section>

            <section className="mt-5">
              <Panel title="Recent deliveries">
                <ul className="divide-y divide-gray-200">
                  {(rider.recentDeliveries || []).map((d) => (
                    <li key={d._id} className="flex items-center justify-between py-3 text-sm">
                      <span>{d.orderNumber}</span>
                      <span style={{ color: COLORS.textDim }}>{d.delivery?.address || "—"}</span>
                      <StatusPill status={d.status} />
                    </li>
                  ))}
                  {(!rider.recentDeliveries || rider.recentDeliveries.length === 0) && <EmptyRow text="No deliveries yet" />}
                </ul>
              </Panel>
            </section>
          </>
        )}

        {/* ---- POSTS / ENGAGEMENT SECTION ---- */}
        <SectionHeading icon={<Users size={18} />} title="Posts & engagement" />
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-4">
          <StatCard icon={<FileText size={18} />} label="Total posts" value={posts?.totalPosts ?? 0} accent={COLORS.amber} />
          <StatCard icon={<TrendingUp size={18} />} label="Total views" value={posts?.totalViews ?? 0} accent={COLORS.teal} />
          <StatCard icon={<Star size={18} />} label="Total likes" value={posts?.totalLikes ?? 0} accent={COLORS.coral} />
          <StatCard icon={<Users size={18} />} label="Applications received" value={posts?.totalApplications ?? 0} accent={COLORS.blue} />
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function Header({ profile, flags, currentTime }) {
  const getGreeting = () => {
    const h = currentTime.getHours();
    if (h < 12) return { text: "Good morning", emoji: "☀️" };
    if (h < 17) return { text: "Good afternoon", emoji: "🌤️" };
    return { text: "Good evening", emoji: "🌙" };
  };

  const { text: greetText, emoji: greetEmoji } = getGreeting();

  return (
    <header className="flex items-center justify-between flex-wrap gap-4 p-5 bg-[#8B1E3F]">
      <div className="flex items-center gap-3">
        <img
          src={profile?.profilePicture || "https://placehold.co/56x56"}
          alt={profile?.username}
          className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2"
          style={{ borderColor: COLORS.amber }}
        />
        <div>
          <p className="text-rose-200 text-sm font-medium mb-1">
            {greetEmoji} {greetText}
          </p>
          <h1 className="text-lg text-white md:text-xl font-semibold">
            Welcome back, {profile?.firstName}
          </h1>
          <p className="text-xs text-white md:text-sm">
            @{profile?.username} ·{" "}
            {[flags.isSeller && "Seller", flags.isRider && "Rider", "Buyer"].filter(Boolean).join(" · ")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full" style={{ background: COLORS.panel }}>
        <Award size={14} style={{ color: COLORS.amber }} />
        {profile?.referralPoints || 0} referral pts · {profile?.referralCount || 0} referrals
      </div>

      <div className="text-right">
        <p className="text-2xl font-bold text-white">
          {currentTime.toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}
        </p>
        <p className="text-rose-200 text-xs mt-0.5">
          {currentTime.toLocaleDateString("en-NG", { weekday: "short", month: "short", day: "numeric" })}
        </p>
      </div>
    </header>
  );
}

function SectionHeading({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mt-10 mb-1">
      <span style={{ color: COLORS.amber }}>{icon}</span>
      <h2 className="text-base md:text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex-1 h-px ml-2" style={{ background: COLORS.panelBorder }} />
    </div>
  );
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl p-4 md:p-5 flex flex-col gap-2"
      style={{
        background: COLORS.panel,
        borderLeft: `3px solid ${accent}`,
        border: `1px solid ${COLORS.panelBorder}`,
        boxShadow: "0 1px 3px rgba(16,20,24,0.05)",
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm" style={{ color: COLORS.textDim }}>
          {label}
        </span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <span className="text-lg md:text-2xl font-semibold">{value}</span>
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: COLORS.panel, border: `1px solid ${COLORS.panelBorder}`, boxShadow: "0 1px 3px rgba(16,20,24,0.05)" }}
    >
      <h3 className="text-sm font-medium mb-3" style={{ color: COLORS.textDim }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function DonutChart({ data }) {
  if (!data.length) return <EmptyRow text="No data yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#fff", border: `1px solid ${COLORS.panelBorder}`, borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

function OrdersTable({ orders }) {
  if (!orders.length) return <EmptyRow text="No orders yet" />;
  return (
    <div className="overflow-x-auto -mx-2">
      <table className="w-full text-sm min-w-[560px]">
        <thead>
          <tr className="text-left" style={{ color: COLORS.textDim }}>
            <th className="py-2 px-2 font-normal">Order</th>
            <th className="py-2 px-2 font-normal">Seller</th>
            <th className="py-2 px-2 font-normal">Amount</th>
            <th className="py-2 px-2 font-normal">Status</th>
            <th className="py-2 px-2 font-normal"></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id} className="border-t border-gray-200">
              <td className="py-3 px-2">{o.orderNumber}</td>
              <td className="py-3 px-2" style={{ color: COLORS.textDim }}>
                {o.seller?.businessProfile?.businessName || o.seller?.username || "—"}
              </td>
              <td className="py-3 px-2">{fmtNaira(o.totalAmount)}</td>
              <td className="py-3 px-2">
                <StatusPill status={o.status} />
              </td>
              <td className="py-3 px-2 text-right">
                <ChevronRight size={14} style={{ color: COLORS.textDim }} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function StatusPill({ status }) {
  const map = {
    delivered: COLORS.teal,
    paid: COLORS.teal,
    completed: COLORS.teal,
    pending: COLORS.amber,
    processing: COLORS.amber,
    shipped: COLORS.blue,
    confirmed: COLORS.blue,
    cancelled: COLORS.coral,
    failed: COLORS.coral,
  };
  const color = map[status] || COLORS.textDim;
  return (
    <span className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: `${color}1A`, color }}>
      {status}
    </span>
  );
}

function EmptyRow({ text }) {
  return (
    <p className="text-sm py-6 text-center" style={{ color: COLORS.textDim }}>
      {text}
    </p>
  );
}

function LoadingState() {
  return (
    <div style={{ background: COLORS.ink, minHeight: "100vh" }} className="flex items-center justify-center text-gray-500">
      Loading dashboard…
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div style={{ background: COLORS.ink, minHeight: "100vh" }} className="flex items-center justify-center text-[#D14E37]">
      {message}
    </div>
  );
}

function objToChartData(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}