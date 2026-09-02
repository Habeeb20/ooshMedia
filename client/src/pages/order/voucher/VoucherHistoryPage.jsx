import { useEffect, useState } from "react";
import api from "../../../config/api";
import VoucherCard from "./VoucherCard";


export default function VoucherHistoryPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    api
      .get("/api/vouchers/mine")
      .then(({ data }) => setVouchers(data.vouchers))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading your vouchers...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Vouchers</h1>

      {vouchers.length === 0 && <p className="text-gray-500 text-center mt-12">You haven't created any vouchers yet.</p>}

      <div className="max-w-2xl mx-auto space-y-6">
        {vouchers.map((v) => (
          <div key={v._id} className="bg-white rounded-2xl shadow-sm p-5">
            {v.paymentStatus === "paid" ? (
              <VoucherCard voucher={v} />
            ) : (
              <div className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3 capitalize">
                Payment {v.paymentStatus} — voucher not yet active.
              </div>
            )}

            <button
              onClick={() => setExpandedId(expandedId === v._id ? null : v._id)}
              className="mt-4 text-sm font-semibold text-[#8B1E3F]"
            >
              {expandedId === v._id ? "Hide usage history" : `View usage history (${v.redemptions?.length || 0})`}
            </button>

            {expandedId === v._id && (
              <div className="mt-3 space-y-2">
                {(v.redemptions || []).length === 0 && <p className="text-xs text-gray-400">No one has used this voucher yet.</p>}
                {(v.redemptions || []).map((r, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-3 text-sm">
                    <p className="font-semibold text-gray-700">
                      {r.user?.firstName} {r.user?.lastName}{" "}
                      <span className="text-gray-400 font-normal">@{r.user?.username}</span>
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      Used ₦{(r.amountUsedKobo / 100).toLocaleString()} on {new Date(r.usedAt).toLocaleDateString()}
                    </p>
                    <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
                      {(r.matchedItems || []).map((m, idx) => (
                        <li key={idx}>
                          {m.name} × {m.quantity} — ₦{(m.subtotalKobo / 100).toLocaleString()}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
