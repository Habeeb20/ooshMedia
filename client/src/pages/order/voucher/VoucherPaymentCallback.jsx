import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../../config/api";
import VoucherCard from "./VoucherCard";


export default function VoucherPaymentCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [status, setStatus] = useState("verifying"); // verifying | success | failed

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");
    if (!reference) {
      setStatus("failed");
      return;
    }
    api
      .get(`/api/vouchers/verify/${reference}`)
      .then(({ data }) => {
        setVoucher(data.voucher);
        setStatus(data.voucher.paymentStatus === "paid" ? "success" : "failed");
      })
      .catch(() => setStatus("failed"));
  }, [searchParams]);

  if (status === "verifying") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#8B1E3F] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your payment...</p>
        </div>
      </div>
    );
  }

  if (status === "failed") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <p className="text-red-600 font-semibold mb-2">Payment could not be confirmed.</p>
          <p className="text-sm text-gray-500 mb-6">If you were charged, please contact support with your reference.</p>
          <button onClick={() => navigate("/voucher/create")} className="text-[#8B1E3F] font-semibold">
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 gap-6">
      <h1 className="text-xl font-bold text-gray-800">🎉 Your voucher is ready!</h1>
      <VoucherCard voucher={voucher} />
      <button onClick={() => navigate("/dashboard?page=cart")} className="text-sm text-[#8B1E3F] font-semibold">
        View all my vouchers →
      </button>
    </div>
  );
}
