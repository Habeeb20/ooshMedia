








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
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  FileText,
  Truck,
  Store,
  Wallet,
  TrendingUp,
  Award,
  Menu,
  X,
  Search,
  Bell,
} from "lucide-react";
import UserDetailDrawer from '../../components/admin/UserDetailDrawer.jsx';
import UsersTable from '../../components/admin/UserTable.jsx';
import ProductsTable from '../../components/admin/ProductTable.jsx';
import OrdersTable from '../../components/admin/OrderTable.jsx';
import PostsTable from '../../components/admin/PostTable.jsx';
import RidersTable from '../../components/admin/RiderTable.jsx';
import SellersTable from '../../components/admin/SellerTable.jsx';
// import RewardRules from './RewardRules';
// import Reports from './Reports';


// ---------------------------------------------------------------------------
// Shared design tokens — same family as the user dashboard, admin gets a
// cooler, more "control room" tilt: deep slate + amber + teal accents.
// ---------------------------------------------------------------------------
export const A = {
  ink: "#FFFFFF",
  panel: "#FFFFFF",
  panelAlt: "#F2F4F6",
  border: "#E4E7EB",
  amber: "#C8821F",
  teal: "#1F9B85",
  coral: "#D14E37",
  blue: "#3866A3",
  textDim: "#5B6670",
};
export const PIE_COLORS = [A.amber, A.teal, A.coral, A.blue, "#9B6FB0"];
export const fmtNaira = (n = 0) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });
  const token = localStorage.getItem('adminToken');

const NAV = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "sellers", label: "Sellers", icon: Store },
  { key: "riders", label: "Riders", icon: Truck },
  { key: "products", label: "Products", icon: Package },
  { key: "orders", label: "Orders", icon: ShoppingBag },
  { key: "posts", label: "Posts", icon: FileText },
];

export default function AdminDashboard() {
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

  const [active, setActive] = useState("overview");
  const [navOpen, setNavOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  return (
    <div style={{ background: A.ink, minHeight: "100vh", color: "#101418" }} className="flex font-[Sora,system-ui,sans-serif]">
      {/* ---- Sidebar ---- */}
      <aside
        className={`fixed md:static z-40 top-0 left-0 h-full md:h-auto w-64 transition-transform duration-200
          ${navOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
        style={{ background: A.panel, borderRight: `1px solid ${A.border}` }}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold" style={{ background: A.amber, color: A.ink }}>
              M
            </div>
            <span className="font-semibold tracking-tight">Marketplace Admin</span>
          </div>
          <button className="md:hidden" onClick={() => setNavOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="px-3 mt-2 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key);
                  setNavOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{
                  background: isActive ? A.panelAlt : "transparent",
                  color: isActive ? A.amber : A.textDim,
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <Icon size={17} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-3 right-3 rounded-xl p-4" style={{ background: A.panelAlt }}>
          <p className="text-xs" style={{ color: A.textDim }}>Signed in as</p>
          <p className="text-sm font-medium mt-0.5">Platform Admin</p>
        </div>
      </aside>

      {navOpen && <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setNavOpen(false)} />}

      {/* ---- Main ---- */}
      <main className="flex-1 min-w-0">
        {/* Topbar */}
        <header
          className="flex items-center justify-between gap-4 px-4 md:px-8 py-4 sticky top-0 z-20"
          style={{ background: A.ink, borderBottom: `1px solid ${A.border}` }}
        >
          <div className="flex items-center gap-3">
            <button className="md:hidden" onClick={() => setNavOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="text-base md:text-lg font-semibold capitalize">{active}</h1>
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
              style={{ background: A.panel, color: A.textDim, border: `1px solid ${A.border}` }}
            >
              <Search size={15} />
              <input
                placeholder="Search…"
                className="bg-transparent outline-none placeholder:text-current w-36"
              />
            </div>
            <button className="relative p-2 rounded-xl" style={{ background: A.panel }}>
              <Bell size={17} />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: A.coral }} />
            </button>
          </div>
        </header>

        <div className="px-4 md:px-8 py-6">
          {active === "overview" && <OverviewPanel />}
          {active === "users" && <UsersTable onSelectUser={setSelectedUserId} />}
          {active === "sellers" && <SellersTable onSelectUser={setSelectedUserId} />}
          {active === "riders" && <RidersTable onSelectUser={setSelectedUserId} />}
          {active === "products" && <ProductsTable />}
          {active === "orders" && <OrdersTable />}
          {active === "posts" && <PostsTable />}
          {/* {active === "analytics" && <RewardRules />}
          {active === "reports" && <Reports />} */}
        </div>
      </main>

      {selectedUserId && <UserDetailDrawer userId={selectedUserId} onClose={() => setSelectedUserId(null)} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Overview panel — platform-wide KPIs and trend charts
// ---------------------------------------------------------------------------
function OverviewPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/dashboard/overview`, { headers: {
          Authorization: `Bearer ${token}`
        } });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        if (!cancelled) setData(json.data);
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => (cancelled = true);
  }, []);

  if (loading) return <Skeleton />;
  if (error) return <p style={{ color: A.coral }}>{error}</p>;
  if (!data) return null;

  const { users, products, orders, posts, loyalty } = data;

  return (
    <>
      {/* KPI grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <Kpi icon={<Users size={18} />} label="Total users" value={users.total} sub={`+${users.newLast30Days} this month`} accent={A.amber} />
        <Kpi icon={<Wallet size={18} />} label="Gross revenue" value={fmtNaira(orders.grossRevenue)} accent={A.teal} />
        <Kpi icon={<TrendingUp size={18} />} label="Platform fees" value={fmtNaira(orders.platformFees)} accent={A.coral} />
        <Kpi icon={<Award size={18} />} label="Loyalty pts issued" value={loyalty.totalIssued} accent={A.blue} />
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 mt-3 md:mt-5">
        <Kpi icon={<Truck size={18} />} label="Riders" value={users.riders} accent={A.teal} small />
        <Kpi icon={<Store size={18} />} label="Sellers" value={users.sellers} accent={A.amber} small />
        <Kpi icon={<Package size={18} />} label="Products listed" value={products.total} accent={A.blue} small />
        <Kpi icon={<ShoppingBag size={18} />} label="Orders" value={orders.total} accent={A.coral} small />
      </section>

      {/* Charts row */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-8">
        <Panel title="Revenue & platform fees (last 6 months)" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={orders.monthlyRevenue || []}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={A.amber} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={A.amber} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="fee" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={A.teal} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={A.teal} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={A.border} vertical={false} />
              <XAxis dataKey="label" stroke={A.textDim} fontSize={12} />
              <YAxis stroke={A.textDim} fontSize={12} />
              <Tooltip contentStyle={{ background: A.panelAlt, border: "none", borderRadius: 8 }} formatter={(v) => fmtNaira(v)} />
              <Area type="monotone" dataKey="revenue" stroke={A.amber} fill="url(#rev)" strokeWidth={2.5} name="Revenue" />
              <Area type="monotone" dataKey="fees" stroke={A.teal} fill="url(#fee)" strokeWidth={2} name="Fees" />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Users by role">
          <DonutChart data={objToChartData(users.byRole)} />
        </Panel>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
        <Panel title="User growth (last 6 months)" className="md:col-span-2">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={users.growth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke={A.border} vertical={false} />
              <XAxis dataKey="label" stroke={A.textDim} fontSize={12} />
              <YAxis stroke={A.textDim} fontSize={12} />
              <Tooltip contentStyle={{ background: A.panelAlt, border: "none", borderRadius: 8 }} />
              <Bar dataKey="count" fill={A.blue} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Orders by status">
          <DonutChart data={objToChartData(orders.byStatus)} />
        </Panel>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
        <Panel title="Products by status">
          <DonutChart data={objToChartData(products.byStatus)} />
        </Panel>
        <Panel title="Posts by type">
          <DonutChart data={objToChartData(posts.byType)} />
        </Panel>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------------
// Reusable bits shared across admin sub-pages
// ---------------------------------------------------------------------------
export function Kpi({ icon, label, value, sub, accent, small }) {
  return (
    <div
      className="rounded-2xl p-4 md:p-5"
      style={{ background: A.panel, borderLeft: `3px solid ${accent}`, border: `1px solid ${A.border}`, boxShadow: "0 1px 3px rgba(16,20,24,0.04)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm" style={{ color: A.textDim }}>{label}</span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <span className={small ? "text-base md:text-xl font-semibold" : "text-lg md:text-2xl font-semibold"}>{value}</span>
      {sub && <p className="text-xs mt-1" style={{ color: A.textDim }}>{sub}</p>}
    </div>
  );
}

export function Panel({ title, children, className = "", actions }) {
  return (
    <div
      className={`rounded-2xl p-4 md:p-5 ${className}`}
      style={{ background: A.panel, border: `1px solid ${A.border}`, boxShadow: "0 1px 3px rgba(16,20,24,0.04)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium" style={{ color: A.textDim }}>{title}</h3>
        {actions}
      </div>
      {children}
    </div>
  );
}

export function DonutChart({ data }) {
  if (!data.length) return <EmptyRow text="No data yet" />;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
          {data.map((_, i) => (
            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: A.panelAlt, border: "none", borderRadius: 8 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function StatusPill({ status }) {
  const map = {
    delivered: A.teal, paid: A.teal, completed: A.teal, active: A.teal, accepted: A.teal,
    pending: A.amber, processing: A.amber, draft: A.amber, shortlisted: A.amber,
    shipped: A.blue, confirmed: A.blue,
    cancelled: A.coral, failed: A.coral, rejected: A.coral, closed: A.coral, out_of_stock: A.coral, inactive: A.coral,
  };
  const color = map[status] || A.textDim;
  return (
    <span className="text-xs px-2 py-1 rounded-full capitalize whitespace-nowrap" style={{ background: `${color}22`, color }}>
      {status}
    </span>
  );
}

export function EmptyRow({ text }) {
  return <p className="text-sm py-6 text-center" style={{ color: A.textDim }}>{text}</p>;
}

export function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: A.panelAlt }} />
      ))}
    </div>
  );
}

export function objToChartData(obj = {}) {
  return Object.entries(obj).map(([name, value]) => ({ name, value }));
}