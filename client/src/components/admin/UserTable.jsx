import React, { useEffect, useState } from "react";
import { Search, ShieldCheck, ShieldOff, Trash2, Eye } from "lucide-react";
import { A, Panel, StatusPill, EmptyRow, Skeleton, fmtNaira } from "../../pages/adminDashboard/AdminDashboard.jsx";
import Pagination from "./Pagination.jsx";

export default function UsersTable({ onSelectUser }) {
  const [rows, setRows] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");

  const load = async (page = 1) => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 12 });
    if (search) params.set("search", search);
    if (role) params.set("role", role);
    const res = await fetch(`/api/admin/users?${params}`, { credentials: "include" });
    const json = await res.json();
    if (json.success) {
      setRows(json.data);
      setPagination(json.pagination);
    }
    setLoading(false);
  };

  useEffect(() => { load(1); }, [search, role]);

  const toggleField = async (id, field, value) => {
    await fetch(`/api/admin/users/${id}/status`, {
      method: "put",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ field, value }),
    });
    load(pagination.page);
  };

  const removeUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "include" });
    load(pagination.page);
  };

  return (
    <Panel
      title="All users"
      actions={
        <div className="flex gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm" style={{ background: A.panelAlt }}>
            <Search size={14} style={{ color: A.textDim }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, username, email…"
              className="bg-transparent outline-none text-sm w-44"
              style={{ color: "#101418" }}
            />
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="text-sm rounded-xl px-2 outline-none"
            style={{ background: A.panelAlt, color: "#101418" }}
          >
            <option value="">All roles</option>
            <option value="user">User</option>
            <option value="entity">Entity</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      }
    >
      {loading ? (
        <Skeleton />
      ) : rows.length === 0 ? (
        <EmptyRow text="No users found" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[760px]">
            <thead>
              <tr className="text-left" style={{ color: A.textDim }}>
                <th className="py-2 font-normal">Name</th>
                <th className="py-2 font-normal">Role</th>
                <th className="py-2 font-normal">Phone</th>
                <th className="py-2 font-normal">Flags</th>
                <th className="py-2 font-normal">Joined</th>
                <th className="py-2 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((u) => (
                <tr key={u._id} className="border-t" style={{ borderColor: A.border }}>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <img
                        src={u.profilePicture || "https://placehold.co/32x32"}
                        className="w-8 h-8 rounded-full object-cover"
                        alt=""
                      />
                      <div>
                        <p className="font-medium">{u.firstName} {u.lastName}</p>
                        <p className="text-xs" style={{ color: A.textDim }}>@{u.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3"><StatusPill status={u.role} /></td>
                  <td className="py-3" style={{ color: A.textDim }}>{u.phoneNumber || "—"}</td>
                  <td className="py-3">
                    <div className="flex gap-1 flex-wrap">
                      {u.isRider && <Tag label="Rider" />}
                      {(u.isSeller || u.businessProfile?.isSeller) && <Tag label="Seller" />}
                    </div>
                  </td>
                  <td className="py-3" style={{ color: A.textDim }}>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <IconBtn onClick={() => onSelectUser(u._id)} title="View"><Eye size={14} /></IconBtn>
                      {u.riderProfile?.verified === false || u.businessProfile?.verified === false ? (
                        <IconBtn
                          onClick={() => toggleField(u._id, "riderProfile.verified", true)}
                          title="Verify"
                          accent={A.teal}
                        >
                          <ShieldCheck size={14} />
                        </IconBtn>
                      ) : (
                        <IconBtn
                          onClick={() => toggleField(u._id, "riderProfile.verified", false)}
                          title="Unverify"
                          accent={A.coral}
                        >
                          <ShieldOff size={14} />
                        </IconBtn>
                      )}
                      <IconBtn onClick={() => removeUser(u._id)} title="Delete" accent={A.coral}>
                        <Trash2 size={14} />
                      </IconBtn>
                    </div>
                  </td>
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

function Tag({ label }) {
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: A.panelAlt, color: A.textDim }}>
      {label}
    </span>
  );
}

function IconBtn({ children, onClick, title, accent }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="p-1.5 rounded-lg"
      style={{ background: A.panelAlt, color: accent || A.textDim }}
    >
      {children}
    </button>
  );
}