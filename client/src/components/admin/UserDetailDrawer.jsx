import React, { useEffect, useState } from "react";
import { X, Package, ShoppingBag, Truck, FileText, Award } from "lucide-react";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";

export default function UserDetailDrawer({ userId, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/users/${userId}`, { credentials: "include" });
      const json = await res.json();
      if (!cancelled && json.success) setData(json.data);
      setLoading(false);
    })();
    return () => (cancelled = true);
  }, [userId]);

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <aside
        className="fixed top-0 right-0 h-full w-full sm:w-[420px] z-50 overflow-y-auto"
        style={{ background: "#FFFFFF", borderLeft: `1px solid ${A.border}` }}
      >
        <div className="flex items-center justify-between px-5 py-4 sticky top-0" style={{ background: "#FFFFFF", borderBottom: `1px solid ${A.border}` }}>
          <h3 className="font-semibold">User profile</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg" style={{ background: A.panelAlt }}>
            <X size={16} />
          </button>
        </div>

        {loading || !data ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: A.panelAlt }} />
            ))}
          </div>
        ) : (
          <div className="p-5 space-y-6">
            <div className="flex items-center gap-3">
              <img
                src={data.user.profilePicture || "https://placehold.co/56x56"}
                className="w-14 h-14 rounded-2xl object-cover"
                alt=""
              />
              <div>
                <p className="font-semibold">{data.user.firstName} {data.user.lastName}</p>
                <p className="text-sm" style={{ color: A.textDim }}>@{data.user.username} · {data.user.email || "no email"}</p>
                <div className="flex gap-1.5 mt-1">
                  <StatusPill status={data.user.role} />
                  {data.user.isRider && <StatusPill status="rider" />}
                  {(data.user.isSeller || data.user.businessProfile?.isSeller) && <StatusPill status="seller" />}
                </div>
              </div>
            </div>

            <Section icon={<Award size={14} />} title="Loyalty & referrals">
              <Row label="Referral points" value={data.user.referralPoints || 0} />
              <Row label="Referral count" value={data.user.referralCount || 0} />
              <Row label="Loyalty available" value={(data.loyalty?.totalPoints || 0) - (data.loyalty?.usedPoints || 0)} />
            </Section>

            <Section icon={<Package size={14} />} title={`Products (${data.products.length})`}>
              {data.products.length === 0 ? (
                <EmptyRow text="No products listed" />
              ) : (
                data.products.slice(0, 5).map((p) => (
                  <Row key={p._id} label={p.name} value={fmtNaira(p.price)} />
                ))
              )}
            </Section>

            <Section icon={<ShoppingBag size={14} />} title={`Orders as buyer (${data.ordersAsBuyer.length})`}>
              {data.ordersAsBuyer.length === 0 ? (
                <EmptyRow text="No orders placed" />
              ) : (
                data.ordersAsBuyer.slice(0, 5).map((o) => (
                  <Row key={o._id} label={o.orderNumber} value={fmtNaira(o.totalAmount)} />
                ))
              )}
            </Section>

            <Section icon={<ShoppingBag size={14} />} title={`Orders as seller (${data.ordersAsSeller.length})`}>
              {data.ordersAsSeller.length === 0 ? (
                <EmptyRow text="No sales yet" />
              ) : (
                data.ordersAsSeller.slice(0, 5).map((o) => (
                  <Row key={o._id} label={o.orderNumber} value={fmtNaira(o.totalAmount)} />
                ))
              )}
            </Section>

            <Section icon={<Truck size={14} />} title={`Deliveries as rider (${data.ordersAsRider.length})`}>
              {data.ordersAsRider.length === 0 ? (
                <EmptyRow text="No deliveries yet" />
              ) : (
                data.ordersAsRider.slice(0, 5).map((o) => (
                  <Row key={o._id} label={o.orderNumber} value={o.status} />
                ))
              )}
            </Section>

            <Section icon={<FileText size={14} />} title={`Posts (${data.posts.length})`}>
              {data.posts.length === 0 ? (
                <EmptyRow text="No posts published" />
              ) : (
                data.posts.slice(0, 5).map((p) => (
                  <Row key={p._id} label={p.title || p.postType} value={`${p.views || 0} views`} />
                ))
              )}
            </Section>
          </div>
        )}
      </aside>
    </>
  );
}

function Section({ icon, title, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2" style={{ color: A.textDim }}>
        {icon}
        <h4 className="text-xs font-medium uppercase tracking-wide">{title}</h4>
      </div>
      <div className="rounded-xl divide-y" style={{ background: A.panelAlt, borderColor: A.border }}>
        {children}
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 text-sm" style={{ borderColor: A.border }}>
      <span className="truncate pr-2">{label}</span>
      <span className="font-medium whitespace-nowrap" style={{ color: A.amber }}>{value}</span>
    </div>
  );
}