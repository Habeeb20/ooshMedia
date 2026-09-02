import { useEffect, useState } from "react";
import api from "../../config/api";

export default function SellerVoucherSalesPage() {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/api/vouchers/seller/sales")
      .then(({ data }) => setSales(data.sales))
      .finally(() => setLoading(false));
  }, []);

  const totalKobo = sales.reduce((s, r) => s + (r.amountCoveredByVoucherKobo || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Voucher Sales</h1>
      <p className="text-sm text-gray-500 mb-6">
        Total received via vouchers: <span className="font-semibold text-[#8B1E3F]">₦{(totalKobo / 100).toLocaleString()}</span>
      </p>

      {loading && <p className="text-gray-400">Loading...</p>}

      <div className="space-y-3 max-w-3xl">
        {!loading && sales.length === 0 && <p className="text-gray-500">No voucher-funded sales yet.</p>}
        {sales.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl shadow-sm p-4 flex justify-between items-center">
            <div>
              <p className="font-semibold text-gray-800">{s.product?.name}</p>
              <p className="text-xs text-gray-500">
                Buyer: {s.buyer?.firstName} {s.buyer?.lastName} · Qty {s.quantity} · Voucher {s.voucherCode} ({s.voucherCategory})
              </p>
              <p className="text-xs text-gray-400">{new Date(s.usedAt).toLocaleDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-800">₦{(s.subtotalKobo / 100).toLocaleString()}</p>
              <p className="text-xs text-green-600">₦{(s.amountCoveredByVoucherKobo / 100).toLocaleString()} via voucher</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
