import { useEffect, useState } from "react";
import api from "../../config/api"; // adjust path

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/vouchers/admin/all", { params: filterStatus ? { status: filterStatus } : {} })
      .then(({ data }) => setVouchers(data.vouchers))
      .finally(() => setLoading(false));
  }, [filterStatus]);

  const openDetail = async (id) => {
    setSelected(id);
    setDetail(null);
    const { data } = await api.get(`/api/vouchers/admin/${id}`);
    setDetail(data.voucher);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">All Vouchers</h1>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["", "active", "fully_redeemed", "expired", "pending_payment", "cancelled"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border capitalize ${
              filterStatus === s ? "bg-[#8B1E3F] text-white border-[#8B1E3F]" : "border-gray-200 text-gray-500"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-left">
              <tr>
                <th className="p-3">Code</th>
                <th className="p-3">Category</th>
                <th className="p-3">Creator</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Used</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    Loading...
                  </td>
                </tr>
              )}
              {!loading &&
                vouchers.map((v) => (
                  <tr
                    key={v._id}
                    onClick={() => openDetail(v._id)}
                    className={`border-t cursor-pointer hover:bg-gray-50 ${selected === v._id ? "bg-[#fdf2f5]" : ""}`}
                  >
                    <td className="p-3 font-mono">{v.code || "—"}</td>
                    <td className="p-3 capitalize">{v.category}</td>
                    <td className="p-3">
                      {v.createdBy?.firstName} {v.createdBy?.lastName}
                    </td>
                    <td className="p-3">₦{(v.totalAmountKobo / 100).toLocaleString()}</td>
                    <td className="p-3">
                      {v.redemptions?.length || 0}/{v.numberOfUsers}
                    </td>
                    <td className="p-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-100 capitalize">{v.status?.replace("_", " ")}</span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="font-bold text-gray-700 mb-3">Voucher Detail</h2>
          {!detail && <p className="text-sm text-gray-400">Select a voucher to see full usage & payout details.</p>}
          {detail && (
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-500 text-xs">Created by</p>
                <p className="font-semibold">
                  {detail.createdBy?.firstName} {detail.createdBy?.lastName} · {detail.createdBy?.email}
                </p>
              </div>

              <div className="border-t pt-3">
                <p className="text-gray-500 text-xs mb-2">Redemptions</p>
                {(detail.redemptions || []).length === 0 && <p className="text-xs text-gray-400">None yet.</p>}
                {(detail.redemptions || []).map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3 mb-2">
                    <p className="font-semibold">
                      {r.user?.firstName} {r.user?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      ₦{(r.amountUsedKobo / 100).toLocaleString()} used · {new Date(r.usedAt).toLocaleDateString()}
                    </p>
                    <div className="mt-2 space-y-1">
                      {(r.matchedItems || []).map((m, idx) => (
                        <div key={idx} className="text-xs bg-gray-50 rounded-lg p-2">
                          <p className="font-medium">
                            {m.product?.name || m.name} × {m.quantity}
                          </p>
                          <p className="text-gray-500">
                            Seller: {m.seller?.businessProfile?.businessName || `${m.seller?.firstName || ""} ${m.seller?.lastName || ""}`}
                          </p>
                          <p className="text-gray-500">Covered: ₦{((m.amountCoveredKobo || 0) / 100).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
