import React, { useEffect, useState } from "react";

import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";
import Pagination from "./Pagination.jsx";


export default function OrdersTable() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const token = localStorage.getItem('adminToken');
  const load = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 15 });
    if (status) params.set("status", status);
    if (paymentStatus) params.set("paymentStatus", paymentStatus);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders?${params}`, { headers: {
        Authorization: `Bearer ${token}`
    } });
    const json = await res.json();
    if (json.success) {
      setRows(json.data);
      setPagination(json.pagination);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [status, paymentStatus]);

  return (
    <Panel
      title="All orders"
      actions={
        <div className="flex gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm rounded-xl px-2 outline-none"
            style={{ background: A.panelAlt, color: "#101418" }}
          >
            <option value="">All status</option>
            {["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            className="text-sm rounded-xl px-2 outline-none"
            style={{ background: A.panelAlt, color: "#101418" }}
          >
            <option value="">All payments</option>
            {["pending", "paid", "failed", "refunded"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      }
    >
      {loading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <EmptyRow text="No orders found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left" style={{ color: A.textDim }}>
                <th className="py-2 font-normal">Order</th>
                <th className="py-2 font-normal">Buyer</th>
                <th className="py-2 font-normal">Seller</th>
                <th className="py-2 font-normal">Rider</th>
                <th className="py-2 font-normal">Amount</th>
                <th className="py-2 font-normal">Payment</th>
                <th className="py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((o) => (
                <tr key={o._id} className="border-t" style={{ borderColor: A.border }}>
                  <td className="py-3 font-medium">{o.orderNumber}</td>
                  <td className="py-3" style={{ color: A.textDim }}>{o.buyer?.username || "—"}</td>
                  <td className="py-3" style={{ color: A.textDim }}>{o.seller?.username || "—"}</td>
                  <td className="py-3" style={{ color: A.textDim }}>
                    {o.delivery?.assignedRider?.username || "Unassigned"}
                  </td>
                  <td className="py-3 font-medium" style={{ color: A.amber }}>{fmtNaira(o.totalAmount)}</td>
                  <td className="py-3"><StatusPill status={o.paymentStatus} /></td>
                  <td className="py-3"><StatusPill status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={load} />
    </Panel>
  );
}