import React, { useEffect, useState } from "react";
import { Truck, Wallet, CheckCircle2, ShieldCheck, Eye } from "lucide-react";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";

export default function RidersTable({ onSelectUser }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('adminToken');
  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/riders`, { headers: {Authorization: `Bearer ${token}`}});
      const json = await res.json();
      if (json.success) setRows(json.data);
      setLoading(false);
    })();
  }, []);

  if (loading) return <Skeleton />;

  return (
    <Panel title={`All riders (${rows.length})`}>
      {rows.length === 0 ? (
        <EmptyRow text="No riders registered" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => (
            <div key={r._id} className="rounded-xl p-4" style={{ background: A.panelAlt }}>
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={r.profilePicture || "https://placehold.co/40x40"}
                  className="w-10 h-10 rounded-full object-cover"
                  alt=""
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{r.firstName} {r.lastName}</p>
                  <p className="text-xs truncate" style={{ color: A.textDim }}>
                    {r.riderProfile?.vehicleType || "—"} · @{r.username}
                  </p>
                </div>
                {r.riderProfile?.verified && <ShieldCheck size={16} style={{ color: A.teal }} />}
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat icon={<Truck size={13} />} label="Assigned" value={r.deliveryStats.totalDeliveries} />
                <Stat icon={<CheckCircle2 size={13} />} label="Done" value={r.deliveryStats.completed} />
                <Stat icon={<Wallet size={13} />} label="Earned" value={fmtNaira(r.deliveryStats.earnings)} small />
              </div>
              <button
                onClick={() => onSelectUser?.(r._id)}
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