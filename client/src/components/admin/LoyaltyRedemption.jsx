import { useState, useEffect } from 'react';
import api from "../../config/api";

const STATUS_STYLES = {
  owed: 'bg-yellow-50 text-yellow-700',
  paid: 'bg-green-50 text-green-700',
  payout_failed: 'bg-red-50 text-red-700',
  not_applicable: 'bg-gray-50 text-gray-500',
};

export default function AdminLoyaltyRedemptions() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/loyalty/admin/redemptions')
      .then(({ data }) => setRows(data))
      .catch(() => setError('Could not load redemptions.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;
  if (error) return <div className="text-sm text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="p-4 font-semibold">Date</th>
            <th className="p-4 font-semibold">Order</th>
            <th className="p-4 font-semibold">Buyer</th>
            <th className="p-4 font-semibold">Seller</th>
            <th className="p-4 font-semibold text-right">Points Used</th>
            <th className="p-4 font-semibold text-right">Value (₦)</th>
            <th className="p-4 font-semibold text-center">Payout Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row._id} className="border-b last:border-b-0">
              <td className="p-4 text-gray-500 whitespace-nowrap">
                {new Date(row.createdAt).toLocaleDateString()}
              </td>
              <td className="p-4 text-gray-700">
                {row.order?.orderNumber || row.order?._id?.slice(-8) || '—'}
              </td>
              <td className="p-4">
                {row.buyer ? `${row.buyer.firstName} ${row.buyer.lastName}` : '—'}
              </td>
              <td className="p-4">
                {row.seller?.businessProfile?.businessName || row.seller?.shopName ||
                  (row.seller ? `${row.seller.firstName} ${row.seller.lastName}` : '—')}
              </td>
              <td className="p-4 text-right font-medium">{(row.loyaltyPointsUsed || 0).toLocaleString()}</td>
              <td className="p-4 text-right font-semibold text-[#8B1E3F]">
                ₦{(row.loyaltyValueNGN || row.amount || 0).toLocaleString()}
              </td>
              <td className="p-4 text-center">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${STATUS_STYLES[row.payoutStatus] || 'bg-gray-50 text-gray-500'}`}>
                  {(row.payoutStatus || 'unknown').replace('_', ' ')}
                </span>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={7} className="p-8 text-center text-gray-400">No redemptions yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}