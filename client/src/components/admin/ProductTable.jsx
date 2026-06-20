import React, { useEffect, useState } from "react";
import { Search } from "lucide-react";

import Pagination from "./Pagination.jsx";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";

export default function ProductsTable() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const token = localStorage.getItem('adminToken');
  const load = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set("search", search);
    if (status) params.set("status", status);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/products?${params}`, { headers: {
      Authorization: `Bearer ${token}`
    }});
    const json = await res.json();
    if (json.success) {
      setRows(json.data);
      setPagination(json.pagination);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [search, status]);

  return (
    <Panel
      title="All products"
      actions={
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm" style={{ background: A.panelAlt }}>
            <Search size={14} style={{ color: A.textDim }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products…"
              className="bg-transparent outline-none text-sm w-40"
              style={{ color: "#101418" }}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="text-sm rounded-xl px-2 outline-none"
            style={{ background: A.panelAlt, color: "#101418" }}
          >
            <option value="">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
            <option value="out_of_stock">Out of stock</option>
          </select>
        </div>
      }
    >
      {loading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <EmptyRow text="No products found" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((p) => (
            <div key={p._id} className="rounded-xl p-3 flex gap-3" style={{ background: A.panelAlt }}>
              <img
                src={p.images?.[0]?.url || "https://placehold.co/64x64"}
                alt={p.name}
                className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{p.name}</p>
                <p className="text-xs truncate" style={{ color: A.textDim }}>
                  {p.seller?.businessProfile?.businessName || p.seller?.username || "Unknown seller"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-sm font-semibold" style={{ color: A.amber }}>{fmtNaira(p.price)}</span>
                  <StatusPill status={p.status} />
                </div>
                <p className="text-xs mt-1" style={{ color: A.textDim }}>Stock: {p.stockQuantity} · Sold: {p.sold || 0}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={load} />
    </Panel>
  );
}