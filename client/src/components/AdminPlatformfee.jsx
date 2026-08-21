// import { useEffect, useState } from 'react';
// import { AlertCircle, Ban, CheckCircle2, History, Search, Calendar, DollarSign } from 'lucide-react';
// import api from '../config/api';

// export default function AdminPlatformFeeTracker() {
//   const [sellers, setSellers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [selectedHistory, setSelectedHistory] = useState(null);
//   const [historyLogs, setHistoryLogs] = useState([]);

//   // Helper to attach authorization header
//   const getAuthHeader = () => {
//     const token = localStorage.getItem('adminToken'); // Adjust key if stored under a different key
//     return {
//       headers: {
//         Authorization: `Bearer ${token}`,
//       },
//     };
//   };

//   const fetchSellers = async () => {
//     setLoading(true);
//     try {
//       const res = await api.get('/api/admin/sellers/platform-fees', getAuthHeader());
//       setSellers(res.data);
//     } catch (err) {
//       console.error('Error fetching sellers:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchSellers();
//   }, []);

//   const handleToggleBlock = async (sellerId, currentStatus) => {
//     const reason = prompt(
//       `Reason for ${currentStatus ? 'unblocking' : 'blocking'} this seller:`,
//       currentStatus ? 'Resolved fee issues' : 'Overdue platform fee > 3 months'
//     );
//     if (reason === null) return;

//     try {
//       await api.patch(
//         `/api/admin/sellers/${sellerId}/toggle-block`,
//         { blockReason: reason },
//         getAuthHeader()
//       );
//       fetchSellers();
//     } catch (err) {
//       alert('Failed to update seller block status');
//     }
//   };

//   const viewPaymentHistory = async (seller) => {
//     setSelectedHistory(seller);
//     try {
//       const res = await api.get(
//         `/api/admin/sellers/${seller._id}/payment-history`,
//         getAuthHeader()
//       );
//       setHistoryLogs(res.data);
//     } catch (err) {
//       console.error('Error fetching payment history:', err);
//     }
//   };

//   const filteredSellers = sellers.filter(
//     (s) =>
//       s.name?.toLowerCase().includes(search.toLowerCase()) ||
//       s.email?.toLowerCase().includes(search.toLowerCase()) ||
//       s.shopName?.toLowerCase().includes(search.toLowerCase())
//   );

//   // Helper to format dates nicely
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     return new Date(dateString).toLocaleDateString('en-GB', {
//       day: 'numeric',
//       month: 'short',
//       year: 'numeric',
//     });
//   };

//   return (
//     <div className="min-h-screen bg-gray-50 p-6">
//       <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
//         <div>
//           <h1 className="text-2xl font-black text-gray-800">Platform Fee Ledger</h1>
//           <p className="text-xs text-gray-500">
//             Track expected platform commissions, total amount owed, and debt duration per seller
//           </p>
//         </div>

//         <div className="relative">
//           <Search size={16} className="absolute left-3 top-3 text-gray-400" />
//           <input
//             type="text"
//             placeholder="Search seller or shop..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-64 focus:outline-none"
//           />
//         </div>
//       </div>

//       <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm text-gray-600">
//             <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold">
//               <tr>
//                 <th className="p-4">Seller / Shop</th>
//                 <th className="p-4">Amount Owed (Fee)</th>
//                 <th className="p-4">Owing Since / Duration</th>
//                 <th className="p-4">Status</th>
//                 <th className="p-4 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-100">
//               {loading ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-400">
//                     Loading seller ledgers...
//                   </td>
//                 </tr>
//               ) : filteredSellers.length === 0 ? (
//                 <tr>
//                   <td colSpan="5" className="p-8 text-center text-gray-400">
//                     No sellers found
//                   </td>
//                 </tr>
//               ) : (
//                 filteredSellers.map((s) => (
//                   <tr
//                     key={s._id}
//                     className={`transition-colors ${
//                       s.isOverdue3Months ? 'bg-red-50/80 hover:bg-red-100/50' : 'hover:bg-gray-50'
//                     }`}
//                   >
//                     {/* Seller Details */}
//                     <td className="p-4">
//                       <p className="font-bold text-gray-800">{s.name}</p>
//                       <p className="text-xs text-gray-400">
//                         {s.shopName} — {s.email}
//                       </p>
//                     </td>

//                     {/* Amount Owed */}
//                     <td className="p-4">
//                       <div className="flex items-center gap-1.5">
//                         <span className="font-black text-gray-900 text-base">
//                           ₦{s.feeBalance?.toLocaleString() || 0}
//                         </span>
//                       </div>
//                       {s.feeBalance > 0 ? (
//                         <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
//                           Payment Expected
//                         </span>
//                       ) : (
//                         <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
//                           Cleared
//                         </span>
//                       )}
//                     </td>

//                     {/* Owing Since / Duration */}
//                     <td className="p-4">
//                       <div className="flex flex-col">
//                         <div className="flex items-center gap-1 text-xs text-gray-700 font-semibold">
//                           <Calendar size={13} className="text-gray-400" />
//                           <span>
//                             {s.lastPaymentAt ? formatDate(s.lastPaymentAt) : 'Since Account Created'}
//                           </span>
//                         </div>
//                         <div className="mt-1">
//                           <span
//                             className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
//                               s.isOverdue3Months
//                                 ? 'bg-red-200 text-red-800'
//                                 : s.monthsSinceLastPayment > 1
//                                 ? 'bg-amber-100 text-amber-800'
//                                 : 'bg-gray-100 text-gray-600'
//                             }`}
//                           >
//                             Unpaid for {s.monthsSinceLastPayment} month
//                             {s.monthsSinceLastPayment !== 1 ? 's' : ''}
//                           </span>
//                         </div>
//                       </div>
//                     </td>

//                     {/* Status */}
//                     <td className="p-4">
//                       {s.isOverdue3Months ? (
//                         <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
//                           <AlertCircle size={14} /> Overdue (&gt;3 Months)
//                         </div>
//                       ) : s.isBlocked ? (
//                         <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
//                           <Ban size={14} /> Account Blocked
//                         </div>
//                       ) : (
//                         <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
//                           <CheckCircle2 size={14} /> Active
//                         </div>
//                       )}
//                     </td>

//                     {/* Actions */}
//                     <td className="p-4 text-right">
//                       <div className="flex justify-end gap-2">
//                         <button
//                           onClick={() => viewPaymentHistory(s)}
//                           className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600 transition-all"
//                           title="View Payment Logs"
//                         >
//                           <History size={16} />
//                         </button>
//                         <button
//                           onClick={() => handleToggleBlock(s._id, s.isBlocked)}
//                           className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
//                             s.isBlocked
//                               ? 'bg-green-600 hover:bg-green-700 text-white'
//                               : 'bg-red-600 hover:bg-red-700 text-white'
//                           }`}
//                         >
//                           {s.isBlocked ? 'Unblock' : 'Block'}
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Payment History Modal */}
//       {selectedHistory && (
//         <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
//           <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl">
//             <h3 className="text-lg font-bold text-gray-800 mb-1">Payment History</h3>
//             <p className="text-xs text-gray-400 mb-4">
//               {selectedHistory.name} ({selectedHistory.shopName})
//             </p>

//             <div className="divide-y max-h-60 overflow-y-auto mb-4 border rounded-xl">
//               {historyLogs.length === 0 ? (
//                 <p className="p-4 text-center text-xs text-gray-400">
//                   No payment logs recorded yet.
//                 </p>
//               ) : (
//                 historyLogs.map((log) => (
//                   <div key={log._id} className="p-3 flex justify-between items-center text-xs">
//                     <div>
//                       <p className="font-bold text-gray-700">Ref: {log.reference}</p>
//                       <p className="text-gray-400">{new Date(log.paidAt).toLocaleString()}</p>
//                     </div>
//                     <p className="font-bold text-green-600 text-sm">
//                       ₦{log.amount?.toLocaleString()}
//                     </p>
//                   </div>
//                 ))
//               )}
//             </div>

//             <button
//               onClick={() => setSelectedHistory(null)}
//               className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-2.5 rounded-xl text-xs"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }


















import { useEffect, useState } from 'react';
import { AlertCircle, Ban, CheckCircle2, History, Search, Calendar, DollarSign, ShoppingBag, X } from 'lucide-react';
import api from '../config/api';

export default function AdminPlatformFeeTracker() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [historyData, setHistoryData] = useState({ feePayments: [], orderSales: [] });
  const [modalTab, setModalTab] = useState('sales');

  const getAuthHeader = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/admin/sellers/platform-fees', getAuthHeader());
      setSellers(res.data);
    } catch (err) {
      console.error('Error fetching sellers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellers();
  }, []);

  const handleToggleBlock = async (sellerId, currentStatus) => {
    const reason = prompt(
      `Reason for ${currentStatus ? 'unblocking' : 'blocking'} this seller:`,
      currentStatus ? 'Resolved fee issues' : 'Overdue platform fee > 3 months'
    );
    if (reason === null) return;

    try {
      await api.put(
        `/api/admin/sellers/${sellerId}/toggle-block`,
        { blockReason: reason },
        getAuthHeader()
      );
      fetchSellers();
    } catch (err) {
      alert('Failed to update seller block status');
    }
  };

  const viewSellerHistory = async (seller) => {
    setSelectedSeller(seller);
    setModalTab('sales');
    try {
      const res = await api.get(
        `/api/admin/sellers/${seller._id}/payment-history`,
        getAuthHeader()
      );
      setHistoryData(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const filteredSellers = sellers.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.shopName?.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Platform Fee Ledger</h1>
          <p className="text-xs text-gray-500">
            Track expected platform commissions, total seller sales, and fee payment history
          </p>
        </div>

        <div className="relative">
          <Search size={16} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search seller or shop..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm w-full md:w-64 focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 border-b border-gray-100 text-xs text-gray-400 uppercase font-bold">
              <tr>
                <th className="p-4">Seller / Shop</th>
                <th className="p-4">Total Revenue Generated</th>
                <th className="p-4">Amount Owed (Fee)</th>
                <th className="p-4">Owing Since / Duration</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Loading seller ledgers...
                  </td>
                </tr>
              ) : filteredSellers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    No sellers found
                  </td>
                </tr>
              ) : (
                filteredSellers.map((s) => (
                  <tr
                    key={s._id}
                    className={`transition-colors ${
                      s.isOverdue3Months ? 'bg-red-50/80 hover:bg-red-100/50' : 'hover:bg-gray-50'
                    }`}
                  >
                    {/* Seller Details */}
                    <td className="p-4">
                      <p className="font-bold text-gray-800">{s.name}</p>
                      <p className="text-xs text-gray-400">
                        {s.shopName} — {s.email}
                      </p>
                    </td>

                    {/* Total Sales Made */}
                    <td className="p-4">
                      <span className="font-bold text-gray-800">
                        ₦{s.totalSalesRevenue?.toLocaleString() || 0}
                      </span>
                    </td>

                    {/* Amount Owed */}
                    <td className="p-4">
                      <span className="font-black text-gray-900 text-base">
                        ₦{s.feeBalance?.toLocaleString() || 0}
                      </span>
                      <div>
                        {s.feeBalance > 0 ? (
                          <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Fee Pending
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-green-600 bg-green-100 px-2 py-0.5 rounded-full inline-block mt-0.5">
                            Cleared
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Owing Since */}
                    <td className="p-4">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-1 text-xs text-gray-700 font-semibold">
                          <Calendar size={13} className="text-gray-400" />
                          <span>
                            {s.lastPaymentAt ? formatDate(s.lastPaymentAt) : 'Since Joining'}
                          </span>
                        </div>
                        <div className="mt-1">
                          <span
                            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                              s.isOverdue3Months
                                ? 'bg-red-200 text-red-800'
                                : s.monthsSinceLastPayment > 1
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            Unpaid for {s.monthsSinceLastPayment} month
                            {s.monthsSinceLastPayment !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      {s.isOverdue3Months ? (
                        <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold">
                          <AlertCircle size={14} /> Overdue (&gt;3 Months)
                        </div>
                      ) : s.isBlocked ? (
                        <div className="flex items-center gap-1.5 text-gray-500 text-xs font-bold">
                          <Ban size={14} /> Account Blocked
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-green-600 text-xs font-bold">
                          <CheckCircle2 size={14} /> Active
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => viewSellerHistory(s)}
                          className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg transition-all"
                          title="View Sales & Payment Logs"
                        >
                          <History size={16} />
                        </button>
                        <button
                          onClick={() => handleToggleBlock(s._id, s.isBlocked)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                            s.isBlocked
                              ? 'bg-green-600 hover:bg-green-700 text-white'
                              : 'bg-red-600 hover:bg-red-700 text-white'
                          }`}
                        >
                          {s.isBlocked ? 'Unblock' : 'Block'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seller History Modal (Sales & Remittances) */}
      {selectedSeller && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedSeller(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-gray-800">{selectedSeller.name}</h3>
            <p className="text-xs text-gray-400 mb-4">
              {selectedSeller.shopName} — {selectedSeller.email}
            </p>

            {/* Modal Tabs */}
            <div className="flex gap-4 border-b border-gray-200 mb-4">
              <button
                onClick={() => setModalTab('sales')}
                className={`pb-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  modalTab === 'sales'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <ShoppingBag size={14} /> Sales Revenue History ({historyData.orderSales?.length || 0})
              </button>
              <button
                onClick={() => setModalTab('payments')}
                className={`pb-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                  modalTab === 'payments'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <DollarSign size={14} /> Fee Remittance Logs ({historyData.feePayments?.length || 0})
              </button>
            </div>

            {/* Tab 1: Sales History */}
            {modalTab === 'sales' && (
              <div className="divide-y max-h-72 overflow-y-auto border rounded-xl">
                {historyData.orderSales?.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">
                    No completed sales recorded for this seller yet.
                  </p>
                ) : (
                  historyData.orderSales.map((order) => (
                    <div key={order._id} className="p-3.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-800">{order.orderNumber}</p>
                        <p className="text-gray-400">{new Date(order.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">
                          Total Order: ₦{order.totalAmount?.toLocaleString()}
                        </p>
                        <p className="text-[11px] text-indigo-600 font-semibold">
                          Seller Earned: ₦{order.totalSellerAmount?.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-gray-400">
                          Platform Fee (1%): ₦{order.totalPlatformFee?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 2: Fee Remittance Logs */}
            {modalTab === 'payments' && (
              <div className="divide-y max-h-72 overflow-y-auto border rounded-xl">
                {historyData.feePayments?.length === 0 ? (
                  <p className="p-6 text-center text-xs text-gray-400">
                    No platform fee payments made by this seller yet.
                  </p>
                ) : (
                  historyData.feePayments.map((payment) => (
                    <div key={payment._id} className="p-3.5 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-gray-700">Ref: {payment.reference}</p>
                        <p className="text-gray-400">{new Date(payment.paidAt).toLocaleString()}</p>
                      </div>
                      <span className="font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full text-xs">
                        +₦{payment.amount?.toLocaleString()} Cleared
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}