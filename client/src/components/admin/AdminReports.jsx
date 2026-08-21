// pages/admin/AdminReports.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, Eye, X, ShieldOff, ShieldCheck } from "lucide-react";
import appConfig from "../../config/appConfig";

const STATUS_COLORS = {
  pending: "bg-amber-100 text-amber-700",
  under_review: "bg-blue-100 text-blue-700",
  resolved: "bg-green-100 text-green-700",
  dismissed: "bg-gray-100 text-gray-600",
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const token = localStorage.getItem("adminToken");
  const authHeader = { headers: { Authorization: `Bearer ${token}` } };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/reports${statusFilter ? `?status=${statusFilter}` : ""}`,
        authHeader
      );
      setReports(data.reports || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, [statusFilter]);

  const openDetail = async (id) => {
    setSelected(id);
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/reports/${id}`, authHeader);
      setDetail(data);
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (status) => {
    await axios.put(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/reports/${selected}`,
      { status },
      authHeader
    );
    fetchReports();
    openDetail(selected);
  };

  const toggleBlacklist = async (sellerId, currentlyBlacklisted) => {
    const action = currentlyBlacklisted ? "unblacklist" : "blacklist";
    const reason = action === "blacklist" ? prompt("Reason for blacklisting this seller:") : undefined;
    if (action === "blacklist" && !reason) return;
    await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${sellerId}/${action}`,
      { reason },
      authHeader
    );
    openDetail(selected);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black">Seller Reports</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-xl px-4 py-2 text-sm"
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="under_review">Under review</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
      ) : (
        <div className="bg-white rounded-2xl overflow-hidden border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="p-4">Reported Seller</th>
                <th className="p-4">Reporter</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r._id} className="border-t hover:bg-gray-50">
                  <td className="p-4 font-medium">
                    {r.reportedSeller?.businessProfile?.businessName || r.reportedSeller?.username}
                    {r.reportedSeller?.isBlacklisted && (
                      <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Blacklisted</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-500">{r.reporter?.username}</td>
                  <td className="p-4">{r.reason}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[r.status]}`}>
                      {r.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button onClick={() => openDetail(r._id)} className="text-indigo-600 flex items-center gap-1">
                      <Eye size={14} /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selected && detail && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 relative">
            <button onClick={() => { setSelected(null); setDetail(null); }} className="absolute top-6 right-6">
              <X size={22} />
            </button>

            <h2 className="text-xl font-bold mb-1">Report Detail</h2>
            <p className="text-gray-400 text-sm mb-6">
              {detail.totalAgainstSeller} total report(s) against this seller
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase mb-1">Reported Seller</p>
                <p className="font-semibold">{detail.report.reportedSeller?.businessProfile?.businessName || detail.report.reportedSeller?.username}</p>
                <p className="text-xs text-gray-500">{detail.report.reportedSeller?.email}</p>
                <p className="text-xs text-gray-500">{detail.report.reportedSeller?.phoneNumber}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-400 uppercase mb-1">Reported By</p>
                <p className="font-semibold">{detail.report.reporter?.firstName} {detail.report.reporter?.lastName}</p>
                <p className="text-xs text-gray-500">@{detail.report.reporter?.username}</p>
                <p className="text-xs text-gray-500">{detail.report.reporter?.email}</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <p><span className="font-semibold">Reason:</span> {detail.report.reason}{detail.report.otherReason ? ` — ${detail.report.otherReason}` : ""}</p>
              {detail.report.incidentDate && (
                <p><span className="font-semibold">Incident date:</span> {new Date(detail.report.incidentDate).toLocaleDateString()}</p>
              )}
              <p><span className="font-semibold">Details:</span></p>
              <p className="bg-gray-50 rounded-xl p-4 text-gray-700">{detail.report.description}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {["pending", "under_review", "resolved", "dismissed"].map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                    detail.report.status === s ? "text-white" : "text-gray-600"
                  }`}
                  style={detail.report.status === s ? { background: appConfig.colors.primary, borderColor: appConfig.colors.primary } : {}}
                >
                  {s.replace("_", " ")}
                </button>
              ))}

              <button
                onClick={() => toggleBlacklist(detail.report.reportedSeller._id, detail.report.reportedSeller.isBlacklisted)}
                className={`ml-auto px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 ${
                  detail.report.reportedSeller.isBlacklisted
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-600"
                }`}
              >
                {detail.report.reportedSeller.isBlacklisted ? <ShieldCheck size={16} /> : <ShieldOff size={16} />}
                {detail.report.reportedSeller.isBlacklisted ? "Unblacklist Seller" : "Blacklist Seller"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}