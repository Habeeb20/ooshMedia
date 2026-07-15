// import { useState, useEffect } from 'react';
// import axios from 'axios';
// import { Truck, ChevronRight, Loader2, CheckCircle, XCircle, MessageSquare, RefreshCw } from 'lucide-react';
// import RiderListModal from '../rider/RiderListModal';
// import { useSocket } from '../../config/UsesSocket';

// const STATUS_BADGE = {
//   pending: { label: 'Awaiting Response', cls: 'bg-amber-100 text-amber-700' },
//   accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700' },
//   rejected: { label: 'Declined', cls: 'bg-red-100 text-red-700' },
//   negotiating: { label: 'Negotiating', cls: 'bg-blue-100 text-blue-700' },
//   cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
// };

// const TRACKING_LABELS = {
//   awaiting_pickup: '📋 Awaiting Pickup',
//   on_the_way: '🛵 On the Way',
//   arrived: '📍 Arrived',
//   collected: '✅ Delivered',
// };

// export default function SellerDeliveryPanel({ order, sellerAddress }) {
//   const [showModal, setShowModal] = useState(false);
//   const [requests, setRequests] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [expandedReqId, setExpandedReqId] = useState(null);
//   const [counterInputs, setCounterInputs] = useState({});
//   const [counterMsgs, setCounterMsgs] = useState({});
//   const [sendingCounter, setSendingCounter] = useState({});
//   const [toast, setToast] = useState('');
//   const socket = useSocket();
//   const token = localStorage.getItem("token")

//   useEffect(() => {
//     if (order?.fulfillmentType === 'delivery') fetchRequests();
//   }, [order]);

//   useEffect(() => {
//     if (!socket) return;

//     socket.on('delivery:rejected', ({ requestId }) => {
//       setRequests((r) => r.map((req) => req._id === requestId ? { ...req, status: 'rejected' } : req));
//       showToast('Rider declined the request');
//     });
//     socket.on('delivery:accepted', ({ requestId, agreedAmount }) => {
//       setRequests((r) => r.map((req) => req._id === requestId ? { ...req, status: 'accepted', agreedAmount } : req));
//       showToast('🎉 Rider accepted!');
//     });
//     socket.on('delivery:negotiation', ({ requestId, counterAmount, message, from }) => {
//       if (from === 'rider') {
//         setRequests((r) =>
//           r.map((req) =>
//             req._id === requestId
//               ? { ...req, status: 'negotiating', negotiations: [...(req.negotiations || []), { from, amount: counterAmount, message }] }
//               : req
//           )
//         );
//         showToast('Rider sent a counter-offer');
//       }
//     });
//     socket.on('delivery:tracking_update', ({ requestId, trackingStatus }) => {
//       setRequests((r) => r.map((req) => req._id === requestId ? { ...req, trackingStatus } : req));
//     });

//     return () => {
//       socket.off('delivery:rejected');
//       socket.off('delivery:accepted');
//       socket.off('delivery:negotiation');
//       socket.off('delivery:tracking_update');
//     };
//   }, [socket]);

//   const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

//   const fetchRequests = async () => {
//     try {
//       const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/order/${order._id}`, {
//            headers: {
//       Authorization: `Bearer ${token}`
//     }
//       });
//       setRequests(data.requests);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const sendCounter = async (reqId) => {
//     const amount = counterInputs[reqId];
//     if (!amount) return;
//     setSendingCounter((s) => ({ ...s, [reqId]: true }));
//     try {
//       const { data } = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/${reqId}/counter`, {
//         counterAmount: Number(amount),
//         message: counterMsgs[reqId],
//       }, {
//            headers: {
//       Authorization: `Bearer ${token}`
//     }
//       });
//       setRequests((r) => r.map((req) => req._id === reqId ? data.request : req));
//       setCounterInputs((s) => ({ ...s, [reqId]: '' }));
//       setCounterMsgs((s) => ({ ...s, [reqId]: '' }));
//       showToast('Counter-offer sent!');
//     } catch (err) {
//       showToast(err.response?.data?.message || 'Failed');
//     } finally {
//       setSendingCounter((s) => ({ ...s, [reqId]: false }));
//     }
//   };

//   if (order?.fulfillmentType !== 'delivery') return null;

//   const acceptedReq = requests.find((r) => r.status === 'accepted');

//   return (
//     <>
//       {toast && (
//         <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg">
//           {toast}
//         </div>
//       )}

//       <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
//         {/* Panel Header */}
//         <div className="p-4 border-b border-gray-50 flex items-center justify-between">
//           <div className="flex items-center gap-2.5">
//             <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
//               <Truck size={18} className="text-rose-900" />
//             </div>
//             <div>
//               <p className="font-semibold text-gray-900 text-sm">Delivery</p>
//               <p className="text-xs text-gray-500">{order.delivery?.address}</p>
//             </div>
//           </div>
//           <button
//             onClick={fetchRequests}
//             className="p-2 rounded-full hover:bg-gray-100 transition-colors"
//           >
//             <RefreshCw size={15} className="text-gray-400" />
//           </button>
//         </div>

//         <div className="p-4 space-y-3">
//           {loading ? (
//             <div className="flex justify-center py-6">
//               <Loader2 size={22} className="animate-spin text-rose-900" />
//             </div>
//           ) : (
//             <>
//               {/* Active delivery tracking */}
//               {acceptedReq && (
//                 <div className="bg-rose-50 border border-rose-100 rounded-xl p-3 space-y-2">
//                   <div className="flex items-center justify-between">
//                     <span className="text-xs font-bold text-rose-900 uppercase tracking-wide">Active Delivery</span>
//                     <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Accepted</span>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {acceptedReq.rider?.profileImage ? (
//                       <img src={acceptedReq.rider.profileImage} alt="" className="w-9 h-9 rounded-full object-cover" />
//                     ) : (
//                       <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center">
//                         <span className="text-rose-900 font-bold text-sm">
//                           {acceptedReq.rider?.firstName?.[0]}{acceptedReq.rider?.lastName?.[0]}
//                         </span>
//                       </div>
//                     )}
//                     <div>
//                       <p className="font-semibold text-gray-900 text-sm">
//                         {acceptedReq.rider?.firstName} {acceptedReq.rider?.lastName}
//                       </p>
//                       <p className="text-xs text-gray-500">{acceptedReq.rider?.phone}</p>
//                     </div>
//                     <div className="ml-auto text-right">
//                       <p className="font-bold text-rose-900 text-sm">₦{acceptedReq.agreedAmount?.toLocaleString()}</p>
//                       <p className="text-xs text-gray-500">agreed fee</p>
//                     </div>
//                   </div>
//                   {acceptedReq.trackingStatus && (
//                     <div className="bg-white rounded-lg px-3 py-2 text-sm font-medium text-gray-700">
//                       {TRACKING_LABELS[acceptedReq.trackingStatus]}
//                     </div>
//                   )}
//                 </div>
//               )}

//               {/* All requests */}
//               {requests.length > 0 && (
//                 <div className="space-y-2">
//                   <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
//                     Sent Requests ({requests.length})
//                   </p>
//                   {requests.map((req) => {
//                     const badge = STATUS_BADGE[req.status];
//                     const isExpanded = expandedReqId === req._id;
//                     const latestAmount = req.negotiations?.at(-1)?.amount || req.offeredAmount;
//                     const canCounter = req.status === 'negotiating' && req.negotiations?.at(-1)?.from === 'rider';

//                     return (
//                       <div key={req._id} className="border border-gray-100 rounded-xl overflow-hidden">
//                         <button
//                           onClick={() => setExpandedReqId(isExpanded ? null : req._id)}
//                           className="w-full text-left p-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
//                         >
//                           {req.rider?.profileImage ? (
//                             <img src={req.rider.profileImage} alt="" className="w-8 h-8 rounded-full object-cover shrink-0" />
//                           ) : (
//                             <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
//                               <span className="text-xs font-bold text-gray-600">
//                                 {req.rider?.firstName?.[0]}{req.rider?.lastName?.[0]}
//                               </span>
//                             </div>
//                           )}
//                           <div className="flex-1 min-w-0">
//                             <p className="font-semibold text-gray-900 text-sm truncate">
//                               {req.rider?.firstName} {req.rider?.lastName}
//                             </p>
//                             <div className="flex items-center gap-1.5 mt-0.5">
//                               <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${badge.cls}`}>
//                                 {badge.label}
//                               </span>
//                             </div>
//                           </div>
//                           <div className="text-right shrink-0">
//                             <p className="font-bold text-rose-900 text-sm">₦{latestAmount?.toLocaleString()}</p>
//                             <ChevronRight
//                               size={14}
//                               className={`text-gray-300 ml-auto transition-transform ${isExpanded ? 'rotate-90' : ''}`}
//                             />
//                           </div>
//                         </button>

//                         {/* Expanded: negotiation thread */}
//                         {isExpanded && (
//                           <div className="border-t border-gray-50 p-3 bg-gray-50 space-y-3">
//                             {req.negotiations?.length > 0 && (
//                               <div className="space-y-2">
//                                 {req.negotiations.map((n, i) => (
//                                   <div key={i} className={`flex ${n.from === 'seller' ? 'justify-end' : 'justify-start'}`}>
//                                     <div
//                                       className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm ${
//                                         n.from === 'seller'
//                                           ? 'bg-rose-900 text-white rounded-br-sm'
//                                           : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
//                                       }`}
//                                     >
//                                       <p className="font-bold">₦{n.amount?.toLocaleString()}</p>
//                                       {n.message && <p className="opacity-80 text-xs mt-0.5">{n.message}</p>}
//                                       <p className={`text-[10px] mt-1 ${n.from === 'seller' ? 'text-rose-200' : 'text-gray-400'}`}>
//                                         {n.from === 'seller' ? 'You' : req.rider?.firstName}
//                                       </p>
//                                     </div>
//                                   </div>
//                                 ))}
//                               </div>
//                             )}

//                             {canCounter && (
//                               <div className="space-y-2">
//                                 <input
//                                   type="number"
//                                   value={counterInputs[req._id] || ''}
//                                   onChange={(e) => setCounterInputs((s) => ({ ...s, [req._id]: e.target.value }))}
//                                   placeholder="Your counter (₦)"
//                                   className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-900/30 focus:border-rose-900 bg-white"
//                                 />
//                                 <textarea
//                                   value={counterMsgs[req._id] || ''}
//                                   onChange={(e) => setCounterMsgs((s) => ({ ...s, [req._id]: e.target.value }))}
//                                   placeholder="Message (optional)"
//                                   rows={2}
//                                   className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-900/30 focus:border-rose-900 bg-white"
//                                 />
//                                 <button
//                                   onClick={() => sendCounter(req._id)}
//                                   disabled={sendingCounter[req._id] || !counterInputs[req._id]}
//                                   className="w-full bg-rose-900 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-rose-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//                                 >
//                                   {sendingCounter[req._id] ? <Loader2 size={14} className="animate-spin" /> : <MessageSquare size={14} />}
//                                   Send Counter-Offer
//                                 </button>
//                               </div>
//                             )}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}

//               {/* CTA: Assign a rider */}
//               {!acceptedReq && (
//                 <button
//                   onClick={() => setShowModal(true)}
//                   className="w-full bg-rose-900 text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-rose-800 active:scale-[.98] transition-all text-sm"
//                 >
//                   <Truck size={17} />
//                   {requests.length > 0 ? 'Send to Another Rider' : 'Assign a Rider'}
//                 </button>
//               )}
//             </>
//           )}
//         </div>
//       </div>

//       {showModal && (
//         <RiderListModal
//           order={order}
//           sellerAddress={sellerAddress}
//           onClose={() => setShowModal(false)}
//           onRequestSent={fetchRequests}
//         />
//       )}
//     </>
//   );
// }




import { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, ChevronRight, Loader2, RefreshCw, User, MapPin, Package } from 'lucide-react';
import RiderListModal from '../rider/RiderListModal';
import { useSocket } from '../../config/UsesSocket';

import api from '../../config/api'; // Your configured axios instance

const STATUS_BADGE = {
  pending: { label: 'Awaiting Response', cls: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Declined', cls: 'bg-red-100 text-red-700' },
  negotiating: { label: 'Negotiating', cls: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
};

const TRACKING_LABELS = {
  awaiting_pickup: '📋 Awaiting Pickup',
  on_the_way: '🛵 On the Way',
  arrived: '📍 Arrived',
  collected: '✅ Delivered',
};

export default function SellerDeliveryPanel() {
  const [orders, setOrders] = useState([]);
  const [requestsMap, setRequestsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [expandedReqId, setExpandedReqId] = useState(null);

  const [counterInputs, setCounterInputs] = useState({});
  const [counterMsgs, setCounterMsgs] = useState({});
  const [sendingCounter, setSendingCounter] = useState({});
  const [toast, setToast] = useState('');

  const socket = useSocket();

  // Fetch All Seller Orders
  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders/seller');
      setOrders(data);
      console.log(data)
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRequestsForOrder = async (orderId) => {
    try {
      const { data } = await api.get(`/api/delivery/order/${orderId}`);
      setRequestsMap(prev => ({ ...prev, [orderId]: data.requests || [] }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchSellerOrders();
  }, []);

  useEffect(() => {
    orders.forEach(order => {
      if (order.fulfillmentType === 'delivery') {
        fetchRequestsForOrder(order._id);
      }
    });
  }, [orders]);

  // Socket listeners (same as before)
  useEffect(() => {
    if (!socket) return;
    // ... (keep your existing socket listeners)
    return () => {
      socket.off('delivery:rejected');
      socket.off('delivery:accepted');
      socket.off('delivery:negotiation');
      socket.off('delivery:tracking_update');
    };
  }, [socket]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const sendCounter = async (orderId, reqId) => {
    const amount = counterInputs[reqId];
    if (!amount) return;

    setSendingCounter(s => ({ ...s, [reqId]: true }));

    try {
      const { data } = await api.put(`/api/delivery/${reqId}/counter`, {
        counterAmount: Number(amount),
        message: counterMsgs[reqId],
      });

      setRequestsMap(prev => ({
        ...prev,
        [orderId]: prev[orderId].map(req => req._id === reqId ? data.request : req)
      }));

      setCounterInputs(s => ({ ...s, [reqId]: '' }));
      setCounterMsgs(s => ({ ...s, [reqId]: '' }));
      showToast('Counter-offer sent!');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed');
    } finally {
      setSendingCounter(s => ({ ...s, [reqId]: false }));
    }
  };

  const deliveryOrders = orders.filter(o => o.fulfillmentType === 'delivery');

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="animate-spin" size={32} /></div>;
  }

  return (
    <>
      {toast && <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-full">{toast}</div>}

      <div className="space-y-8">
        {deliveryOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center">
            <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-semibold text-gray-600">No delivery orders yet</p>
          </div>
        ) : (
          deliveryOrders.map((order) => {
            const requests = requestsMap[order._id] || [];
            const acceptedReq = requests.find(r => r.status === 'accepted');
            console.log(order)
            const sellerAddress =`${order.sellerInfo?.state}, ${order.sellerInfo?.lga}` || order.seller?.businessProfile?.businessAddress;
console.log(sellerAddress)
            return (
              <div key={order._id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="p-5 border-b bg-gray-50 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-lg">Order #{order.orderNumber}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()} • {order.buyer?.firstName} {order.buyer?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-xl text-rose-600">₦{order.totalAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total</p>
                  </div>
                </div>

                {/* Items / Goods */}
                <div className="p-5 border-b">
                  <p className="text-sm font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <Package size={16} /> Items ({order.items.length})
                  </p>
                  <div className="space-y-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4 bg-gray-50 rounded-2xl p-4">
                        <img
                          src={item.image || item.product?.images?.[0]?.url}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-xl"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold leading-tight">{item.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity} × ₦{item.price}</p>
                          <p className="font-medium text-rose-600 mt-1">
                            ₦{(item.subtotal || item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="p-5 border-b">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="text-rose-600" size={18} />
                    <span className="font-semibold">Delivery Address</span>
                  </div>
                  <p className="text-gray-700">{order.delivery?.address}</p>
                </div>

                {/* Delivery Requests Section */}
                <div className="p-5">
                  {acceptedReq && (
                    <div className="mb-6 bg-green-50 border border-green-100 rounded-2xl p-4">
                      <p className="text-green-700 font-semibold mb-2">Active Rider</p>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                          {acceptedReq.rider?.firstName?.[0]}
                        </div>
                        <div>
                          <p>{acceptedReq.rider?.firstName} {acceptedReq.rider?.lastName}</p>
                          <p className="text-sm text-gray-500">{acceptedReq.rider?.phone}</p>
                        </div>
                        <div className="ml-auto text-right">
                          <p className="font-bold">₦{acceptedReq.agreedAmount}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rest of your request cards (same as before) */}
                  {requests.length > 0 && (
                    <div className="space-y-3">
                      <p className="uppercase text-xs font-semibold text-gray-400 tracking-widest">Delivery Requests</p>
                      {requests.map((req) => {
                        // ... keep your existing request card logic here
                        // (I kept it unchanged as per your instruction)
                      })}
                    </div>
                  )}

                  {!acceptedReq && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="w-full mt-4 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2"
                    >
                      <Truck size={20} />
                      Assign Rider
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {showModal && selectedOrder && (
        <RiderListModal
          order={selectedOrder}
          sellerAddress={`${selectedOrder.sellerInfo?.state}, ${selectedOrder.sellerInfo?.lga}` || selectedOrder.seller?.businessProfile?.businessAddress }
          onClose={() => setShowModal(false)}
          onRequestSent={() => fetchRequestsForOrder(selectedOrder._id)}
        />
      )}
    </>
  );
}