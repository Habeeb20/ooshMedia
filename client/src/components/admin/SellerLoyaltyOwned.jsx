import { useState, useEffect } from 'react';
import api from "../../config/api";

export default function AdminSellerLoyaltyOwed() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [payingId, setPayingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/loyalty/admin/seller-owed')
      .then(({ data }) => setRows(data))
      .catch(() => setError('Could not load seller payout data.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkPaid = async (sellerId) => {
    setPayingId(sellerId);
    setError('');
    try {
      // First attempt: real Paystack transfer, if the seller has a payout
      // account on file. The backend only marks rows paid once money
      // actually moves.
      await api.put(`/api/loyalty/admin/seller-owed/${sellerId}/mark-paid`);
      load();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not pay this seller automatically.';
      // No payout account on file — offer the manual-confirmation fallback,
      // for cases where the admin already paid the seller some other way.
      const wantsManual = window.confirm(
        `${msg}\n\nDo you want to mark this as paid manually instead (only do this if you've already sent the seller their cash outside the app)?`
      );
      if (wantsManual) {
        try {
          await api.put(`/api/loyalty/admin/seller-owed/${sellerId}/mark-paid`, { confirmManual: true });
          load();
        } catch (err2) {
          setError(err2.response?.data?.message || 'Could not mark as paid.');
        }
      } else {
        setError(msg);
      }
    } finally {
      setPayingId(null);
    }
  };

  const totalOwed = rows.reduce((sum, r) => sum + (r.totalOwed || 0), 0);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="bg-[#fdf2f5] rounded-2xl p-5">
        <p className="text-sm text-gray-600">Total outstanding across all sellers</p>
        <p className="text-2xl font-bold text-[#8B1E3F]">₦{totalOwed.toLocaleString()}</p>
        <p className="text-xs text-gray-400 mt-1">
          This is real cash owed to sellers whose goods were paid for, in part, using buyer loyalty points.
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-4 font-semibold">Seller</th>
              <th className="p-4 font-semibold text-right">Redemptions</th>
              <th className="p-4 font-semibold text-right">Owed (₦)</th>
              <th className="p-4 font-semibold text-right">Already Paid (₦)</th>
              <th className="p-4 font-semibold text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(row => (
              <tr key={row.seller?._id} className="border-b last:border-b-0">
                <td className="p-4">
                  <p className="font-medium text-gray-800">
                    {row.seller?.shopName || `${row.seller?.firstName || ''} ${row.seller?.lastName || ''}`.trim() || '—'}
                  </p>
                </td>
                <td className="p-4 text-right text-gray-500">{row.redemptionCount}</td>
                <td className="p-4 text-right font-semibold text-yellow-700">
                  ₦{(row.totalOwed || 0).toLocaleString()}
                </td>
                <td className="p-4 text-right text-green-700">
                  ₦{(row.totalPaid || 0).toLocaleString()}
                </td>
                <td className="p-4 text-center">
                  {row.totalOwed > 0 ? (
                    <button
                      type="button"
                      onClick={() => handleMarkPaid(row.seller?._id)}
                      disabled={payingId === row.seller?._id}
                      className="text-xs bg-[#8B1E3F] text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                    >
                      {payingId === row.seller?._id ? 'Marking...' : 'Mark as Paid'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-400">No outstanding loyalty payouts.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}