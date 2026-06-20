import React, { useEffect, useState } from "react";
import { Store, Package, Wallet, ShoppingBag, Eye, ShieldCheck } from "lucide-react";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";

export default function SellersTable({ onSelectUser }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/sellers`, { headers: {Authorization: `Bearer ${token}`} });
      const json = await res.json();
      if (json.success) setRows(json.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Skeleton />;

  return (
    <Panel title={`All sellers (${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyRow text="No sellers registered" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((s) => (
            <div key={s._id} className="rounded-xl p-4" style={{ background: A.panelAlt }}>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: A.ink, border: `1px solid ${A.border}` }}
                >
                  <Store size={16} style={{ color: A.amber }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {s.businessProfile?.businessName || `${s.firstName} ${s.lastName}`}
                  </p>
                  <p className="text-xs truncate" style={{ color: A.textDim }}>@{s.username}</p>
                </div>
                {s.businessProfile?.verified && <ShieldCheck size={16} style={{ color: A.teal }} />}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat icon={<Package size={13} />} label="Products" value={s.totalProducts} />
                <Stat icon={<ShoppingBag size={13} />} label="Orders" value={s.salesStats.totalOrders} />
                <Stat icon={<Wallet size={13} />} label="Revenue" value={fmtNaira(s.salesStats.totalRevenue)} small />
              </div>
              <button
                onClick={() => onSelectUser?.(s._id)}
                className="w-full mt-3 flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg"
                style={{ background: A.ink, color: A.textDim, border: `1px solid ${A.border}` }}
              >
                <Eye size={13} /> View profile
              </button>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function Stat({ icon, label, value, small }) {
  return (
    <div className="rounded-lg py-2" style={{ background: A.ink, border: `1px solid ${A.border}` }}>
      <div className="flex items-center justify-center gap-1" style={{ color: A.textDim }}>{icon}</div>
      <p className={small ? "text-xs font-semibold mt-0.5" : "text-sm font-semibold mt-0.5"}>{value}</p>
      <p className="text-[10px]" style={{ color: A.textDim }}>{label}</p>
    </div>
  );
}