import { useEffect, useState } from "react";
import axios from "axios";
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
  Legend,
} from "recharts";
import {
  Wallet,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Banknote,
  Smartphone,
  Star,
  Loader2,
} from "lucide-react";

const C = {
  bg: "#FFFFFF",
  panel: "#F6F7F8",
  border: "#E4E7EB",
  text: "#101418",
  textDim: "#5B6670",
  amber: "#C8821F",
  teal: "#1F9B85",
  coral: "#D14E37",
  blue: "#3866A3",
  purple: "#7A5C99",
};
const PIE_COLORS = [C.amber, C.teal, C.coral, C.blue, C.purple];

const fmtNaira = (n = 0) =>
  "₦" + Number(n || 0).toLocaleString("en-NG", { maximumFractionDigits: 0 });

const PAYMENT_LABELS = {
  online: "Online",
  on_delivery: "Pay on Delivery",
  pos_cash: "POS — Cash",
  pos_transfer: "POS — Transfer",
  pos_machine: "POS — Card Machine",
};

export default function SellerAnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [overviewRes, customersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/overview`, { headers }),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/analytics/customers`, { headers }),
        ]);

        if (!cancelled) {
          setOverview(overviewRes.data.data);
          setCustomers(customersRes.data || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!overview) return null;

  const { totals, monthlyTrend, paymentMethodBreakdown, posBreakdown, topProducts, recentTransactions } = overview;

  const paymentChartData = Object.entries(paymentMethodBreakdown || {}).map(([key, v]) => ({
    name: PAYMENT_LABELS[key] || key,
    value: v.total,
    count: v.count,
  }));

  const posChartData = Object.entries(posBreakdown || {}).map(([key, v]) => ({
    name: PAYMENT_LABELS[key] || key,
    value: v.total,
    count: v.count,
  }));

  const posCash = posBreakdown?.pos_cash?.total || 0;
  const posTransfer = posBreakdown?.pos_transfer?.total || 0;
  const posMachine = posBreakdown?.pos_machine?.total || 0;

  return (
    <div style={{ background: C.bg, color: C.text, fontFamily: "'Sora','Segoe UI',system-ui,sans-serif" }} className="min-h-screen px-4 py-6 md:px-8 md:py-10">
      <header className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold">Sales Analytics</h1>
        <p className="text-sm" style={{ color: C.textDim }}>
          Revenue, payment methods, and customer insights
        </p>
      </header>

      {/* KPI grid */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
        <StatCard icon={<Wallet size={18} />} label="Gross revenue" value={fmtNaira(totals.grossRevenue)} accent={C.amber} />
        <StatCard icon={<TrendingUp size={18} />} label="Net (after fees)" value={fmtNaira(totals.netRevenue)} accent={C.teal} />
        <StatCard icon={<Receipt size={18} />} label="Total transactions" value={totals.totalTransactions} accent={C.coral} />
        <StatCard icon={<Users size={18} />} label="Unique customers" value={customers.length} accent={C.blue} />
      </section>

      {/* Revenue trend + payment method donut */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        <Panel title="Revenue trend (last 12 months)" className="md:col-span-2">
          {monthlyTrend?.length ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.amber} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={C.amber} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="net" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={C.teal} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={C.teal} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="label" stroke={C.textDim} fontSize={12} tickLine={false} axisLine={{ stroke: C.border }} />
                <YAxis stroke={C.textDim} fontSize={12} tickLine={false} axisLine={false} width={70} tickFormatter={(v) => fmtNaira(v)} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8 }}
                  labelStyle={{ color: C.text, fontWeight: 600 }}
                  formatter={(v) => fmtNaira(v)}
                />
                <Legend />
                <Area type="monotone" dataKey="revenue" name="Gross" stroke={C.amber} fill="url(#rev)" strokeWidth={2.5} />
                <Area type="monotone" dataKey="net" name="Net" stroke={C.teal} fill="url(#net)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyRow text="No completed transactions yet" />
          )}
        </Panel>

        <Panel title="Revenue by payment method">
          {paymentChartData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={paymentChartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                  {paymentChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8 }}
                  formatter={(v) => fmtNaira(v)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyRow text="No data yet" />
          )}
          <Legend2 data={paymentChartData} />
        </Panel>
      </section>

      {/* POS breakdown */}
      <SectionHeading title="POS Sales Breakdown" />
      <section className="grid grid-cols-3 gap-3 md:gap-5 mt-4">
        <PosCard icon={<Banknote size={18} />} label="Cash" value={fmtNaira(posCash)} count={posBreakdown?.pos_cash?.count} accent={C.teal} />
        <PosCard icon={<CreditCard size={18} />} label="Transfer" value={fmtNaira(posTransfer)} count={posBreakdown?.pos_transfer?.count} accent={C.amber} />
        <PosCard icon={<Smartphone size={18} />} label="Card Machine" value={fmtNaira(posMachine)} count={posBreakdown?.pos_machine?.count} accent={C.coral} />
      </section>

      <section className="mt-5">
        <Panel title="POS revenue comparison">
          {posChartData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={posChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="name" stroke={C.textDim} fontSize={12} tickLine={false} axisLine={{ stroke: C.border }} />
                <YAxis stroke={C.textDim} fontSize={12} tickLine={false} axisLine={false} width={70} tickFormatter={(v) => fmtNaira(v)} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 8 }}
                  formatter={(v) => fmtNaira(v)}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {posChartData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyRow text="No POS sales recorded yet" />
          )}
        </Panel>
      </section>

      {/* Top products + recent transactions */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-8">
        <Panel title="Top selling products">
          <ul className="divide-y" style={{ borderColor: C.border }}>
            {(topProducts || []).map((p) => (
              <li key={p._id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={p.images?.[0]?.url || "https://placehold.co/40x40"}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{p.name}</p>
                    <p className="text-xs" style={{ color: C.textDim }}>
                      {fmtNaira(p.price)} · {p.sold || 0} sold
                    </p>
                  </div>
                </div>
                <span className="flex items-center gap-1 text-xs flex-shrink-0" style={{ color: C.amber }}>
                  <Star size={12} fill={C.amber} /> {p.ratings || 0}
                </span>
              </li>
            ))}
            {(!topProducts || topProducts.length === 0) && <EmptyRow text="No products sold yet" />}
          </ul>
        </Panel>

        <Panel title="Recent transactions">
          <ul className="divide-y" style={{ borderColor: C.border }}>
            {(recentTransactions || []).map((tx) => (
              <li key={tx._id} className="flex items-center justify-between py-3 gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.buyer ? `${tx.buyer.firstName} ${tx.buyer.lastName}` : tx.customerName || "Walk-in"}
                  </p>
                  <p className="text-xs truncate" style={{ color: C.textDim }}>
                    {PAYMENT_LABELS[tx.paymentMethod] || tx.paymentMethod} ·{" "}
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="text-sm font-semibold flex-shrink-0">{fmtNaira(tx.amount)}</span>
              </li>
            ))}
            {(!recentTransactions || recentTransactions.length === 0) && <EmptyRow text="No transactions yet" />}
          </ul>
        </Panel>
      </section>

      {/* Customers table */}
      <section className="mt-8">
        <Panel title={`Customers (${customers.length})`}>
          {customers.length === 0 ? (
            <EmptyRow text="No customers yet" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left" style={{ color: C.textDim }}>
                    <th className="py-2 font-normal">Customer</th>
                    <th className="py-2 font-normal">Contact</th>
                    <th className="py-2 font-normal">Orders</th>
                    <th className="py-2 font-normal">Total spent</th>
                    <th className="py-2 font-normal">Last order</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.slice(0, 10).map((c) => (
                    <tr key={c.id} className="border-t" style={{ borderColor: C.border }}>
                      <td className="py-3 font-medium">{c.name}</td>
                      <td className="py-3" style={{ color: C.textDim }}>{c.email || c.phone || "—"}</td>
                      <td className="py-3">{c.orders}</td>
                      <td className="py-3 font-semibold">{fmtNaira(c.totalSpent)}</td>
                      <td className="py-3" style={{ color: C.textDim }}>
                        {c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function StatCard({ icon, label, value, accent }) {
  return (
    <div
      className="rounded-2xl p-4 md:p-5 flex flex-col gap-2"
      style={{ background: C.panel, borderLeft: `3px solid ${accent}`, border: `1px solid ${C.border}`, boxShadow: "0 1px 3px rgba(16,20,24,0.05)" }}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs md:text-sm" style={{ color: C.textDim }}>{label}</span>
        <span style={{ color: accent }}>{icon}</span>
      </div>
      <span className="text-base md:text-2xl font-semibold truncate">{value}</span>
    </div>
  );
}

function PosCard({ icon, label, value, count, accent }) {
  return (
    <div className="rounded-2xl p-3 md:p-5 flex flex-col gap-1.5" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-2" style={{ color: accent }}>
        {icon}
        <span className="text-xs md:text-sm font-medium" style={{ color: C.textDim }}>{label}</span>
      </div>
      <span className="text-sm md:text-xl font-bold truncate">{value}</span>
      <span className="text-[11px]" style={{ color: C.textDim }}>{count || 0} sales</span>
    </div>
  );
}

function Panel({ title, children, className = "" }) {
  return (
    <div className={`rounded-2xl p-4 md:p-5 ${className}`} style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <h3 className="text-sm font-medium mb-3" style={{ color: C.textDim }}>{title}</h3>
      {children}
    </div>
  );
}

function SectionHeading({ title }) {
  return (
    <div className="flex items-center gap-2 mt-10 mb-1">
      <h2 className="text-base md:text-lg font-semibold tracking-tight">{title}</h2>
      <div className="flex-1 h-px ml-2" style={{ background: C.border }} />
    </div>
  );
}

function Legend2({ data }) {
  if (!data.length) return null;
  return (
    <div className="flex flex-wrap gap-3 mt-3 justify-center">
      {data.map((d, i) => (
        <div key={d.name} className="flex items-center gap-1.5 text-xs" style={{ color: C.textDim }}>
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
          {d.name}
        </div>
      ))}
    </div>
  );
}

function EmptyRow({ text }) {
  return <p className="text-sm py-6 text-center" style={{ color: C.textDim }}>{text}</p>;
}

function LoadingState() {
  return (
    <div style={{ background: C.bg }} className="min-h-screen flex items-center justify-center gap-2" style={{ color: C.textDim }}>
      <Loader2 className="animate-spin" size={20} /> Loading analytics…
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div style={{ background: C.bg }} className="min-h-screen flex items-center justify-center text-[#D14E37]">
      {message}
    </div>
  );
}