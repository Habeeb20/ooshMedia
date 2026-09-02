import { useState } from "react";
import api from "../../../config/api";
import voucherCategories from "../../../config/voucherCategories";


const MIN_AMOUNT = 500;

export default function CreateVoucherPage() {
  const [category, setCategory] = useState(voucherCategories[0]);
  const [amount, setAmount] = useState("");
  const [numberOfUsers, setNumberOfUsers] = useState(1);
  const [expiresAt, setExpiresAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const perUserPreview = amount && numberOfUsers ? Math.floor(Number(amount) / Number(numberOfUsers)) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amt = Number(amount);
    if (!amt || amt < MIN_AMOUNT) {
      setError(`Minimum voucher amount is ₦${MIN_AMOUNT.toLocaleString()}.`);
      return;
    }
    if (!expiresAt) {
      setError("Please choose an expiry date.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/vouchers", {
        category,
        amount: amt,
        numberOfUsers: Number(numberOfUsers),
        expiresAt,
      });
      window.location.href = data.authorizationUrl; // redirect to Paystack
    } catch (err) {
      setError(err.response?.data?.message || "Could not create voucher.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-lg mx-auto bg-white rounded-2xl shadow-sm p-6">
        <h1 className="text-xl font-bold text-gray-800 mb-1">Create a Voucher</h1>
        <p className="text-sm text-gray-500 mb-6">Fund a voucher that others can redeem on qualifying purchases.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm capitalize focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
            >
              {voucherCategories.map((c) => (
                <option key={c} value={c} className="capitalize">
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Amount (₦)</label>
            <input
              type="number"
              min={MIN_AMOUNT}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Minimum ₦${MIN_AMOUNT.toLocaleString()}`}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Number of Users (max 10)</label>
            <input
              type="number"
              min={1}
              max={10}
              value={numberOfUsers}
              onChange={(e) => setNumberOfUsers(Math.min(10, Math.max(1, Number(e.target.value) || 1)))}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
            />
            {amount > 0 && (
              <p className="text-xs text-gray-400 mt-1">Each user will get ≈ ₦{perUserPreview.toLocaleString()}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Expiry Date</label>
            <input
              type="date"
              min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
            />
          </div>

          {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#8B1E3F] text-white py-4 rounded-2xl font-bold hover:bg-[#7a1a37] disabled:opacity-50"
          >
            {loading ? "Redirecting to payment..." : "Generate Voucher →"}
          </button>
        </form>
      </div>
    </div>
  );
}
