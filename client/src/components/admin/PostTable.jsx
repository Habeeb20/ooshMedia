import React, { useEffect, useState } from "react";
import { Eye, Heart, MessageSquare } from "lucide-react";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";
import Pagination from "./Pagination.jsx";

export default function PostsTable() {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [postType, setPostType] = useState("");
  const token = localStorage.getItem('adminToken');
  const load = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (postType) params.set("postType", postType);
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/posts?${params}`, { headers: {
      Authorization: `Bearer ${token}`
    } });
    const json = await res.json();
    if (json.success) {
      setRows(json.data);
      setPagination(json.pagination);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [postType]);

  return (
    <Panel
      title="All posts"
      actions={
        <select
          value={postType}
          onChange={(e) => setPostType(e.target.value)}
          className="text-sm rounded-xl px-2 outline-none"
          style={{ background: A.panelAlt, color: "#101418" }}
        >
          <option value="">All types</option>
          <option value="post">Post</option>
          <option value="contract">Contract</option>
          <option value="supply">Supply</option>
        </select>
      }
    >
      {loading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <EmptyRow text="No posts found" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rows.map((p) => (
            <div key={p._id} className="rounded-xl p-4" style={{ background: A.panelAlt }}>
              <div className="flex items-center justify-between mb-2">
                <StatusPill status={p.postType} />
                <StatusPill status={p.status} />
              </div>
              {p.title && <p className="font-medium text-sm mb-1">{p.title}</p>}
              <p className="text-sm line-clamp-2" style={{ color: A.textDim }}>{p.content}</p>
              <div className="flex items-center justify-between mt-3 text-xs" style={{ color: A.textDim }}>
                <span>by @{p.author?.username || "unknown"}</span>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1"><Eye size={12} /> {p.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart size={12} /> {p.likes?.length || 0}</span>
                  <span className="flex items-center gap-1"><MessageSquare size={12} /> {p.applicationCount || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={pagination.page} pages={pagination.pages} onChange={load} />
    </Panel>
  );
}