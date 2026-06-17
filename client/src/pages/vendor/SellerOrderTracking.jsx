import { useEffect, useState } from 'react';
import { Loader2, Package, Copy, Check, ArrowLeft, ChevronRight } from 'lucide-react';
import DeliveryTrackingMap from '../DeliverytrackingMap';

import { useSocket } from '../../config/UsesSocket';

import api from '../../config/api';

const STATUS_COLORS = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function SellerOrdersDashboard() {
  const [orders, setOrders] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Detail view state
  const [order, setOrder] = useState(null);
  const [deliveryReq, setDeliveryReq] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [toast, setToast] = useState('');
  const socket = useSocket();

  // ---- List fetch ----
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/seller');
        setOrders(data.orders || data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingList(false);
      }
    };
    fetchOrders();
  }, []);

  // ---- Detail fetch ----
  useEffect(() => {
    if (!selectedOrderId) return;
    fetchOrderDetail(selectedOrderId);
  }, [selectedOrderId]);

  useEffect(() => {
    if (!socket || !deliveryReq) return;
    socket.on('delivery:assigned', () => {
      fetchOrderDetail(selectedOrderId);
      showToast('A rider has been assigned to this order!');
    });
    return () => socket.off('delivery:assigned');
  }, [socket, deliveryReq, selectedOrderId]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchOrderDetail = async (id) => {
    try {
      setLoadingDetail(true);
      const { data: orderData } = await api.get(`/api/orders/${id}`);
      setOrder(orderData);
      console.log(orderData)

      if (orderData?.delivery?.deliveryRequestId) {
        const { data: drData } = await api.get(`/api/delivery/${orderData.delivery.deliveryRequestId}`);
        setDeliveryReq(drData.request);
      } else {
        setDeliveryReq(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(order.delivery?.deliveryCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const goBackToList = () => {
    setSelectedOrderId(null);
    setOrder(null);
    setDeliveryReq(null);
  };

  // ---------------- LIST VIEW ----------------
  if (!selectedOrderId) {
    if (loadingList) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <Loader2 size={28} className="animate-spin text-rose-900" />
        </div>
      );
    }

    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-lg mx-auto px-4 py-4">
            <h1 className="font-bold text-gray-900 text-lg">Incoming Orders</h1>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-6">
          {orders.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((o) => (
                <button
                  key={o._id}
                  onClick={() => setSelectedOrderId(o._id)}
                  className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
                >
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center shrink-0">
                    <Package size={18} className="text-rose-900" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{o.orderNumber}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      {o.buyer?.name && <span className="mr-1">{o.buyer.name} ·</span>}
                      <span className={`px-1.5 py-0.5 rounded-full mr-1 capitalize ${STATUS_COLORS[o.status] || 'bg-gray-100 text-gray-600'}`}>
                        {o.status}
                      </span>
                      · {o.fulfillmentType}
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">₦{o.totalAmount?.toLocaleString()}</p>
                  <ChevronRight size={18} className="text-gray-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------------- DETAIL VIEW ----------------
  if (loadingDetail || !order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={28} className="animate-spin text-rose-900" />
      </div>
    );
  }

  const isDelivery = order.fulfillmentType === 'delivery';

  return (
    <div className="bg-gray-50 min-h-screen">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={goBackToList} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
            <ArrowLeft size={18} className="text-gray-700" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
            <Package size={18} className="text-rose-900" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">{order.orderNumber}</h1>
            <p className="text-xs text-gray-500 capitalize">{order.status}</p>
          </div>
        </div>
      </div>

      {/* Buyer info — seller-specific section */}
      {(order.buyer?.name || order.buyer?.phone) && (
        <div className="max-w-lg mx-auto px-4 pt-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex justify-between items-center text-sm">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Buyer</p>
              <p className="font-semibold text-gray-900">{order.buyer?.name || 'Unknown'}</p>
            </div>
            {order.buyer?.phone && (
              <p className="text-gray-600">{order.buyer.phone}</p>
            )}
          </div>
        </div>
      )}

      {isDelivery && deliveryReq ? (
        <DeliveryTrackingMap requestId={deliveryReq._id} viewerRole="seller" />
      ) : isDelivery ? (
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🛵</span>
          </div>
          <h2 className="font-bold text-gray-900 text-lg">Rider Not Yet Assigned</h2>
          <p className="text-gray-500 text-sm mt-2">
            Assign a rider to this order so it can be delivered to the buyer.
          </p>
          <div className="mt-6 bg-white rounded-2xl border border-gray-100 p-4 text-left space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery to</span>
              <span className="font-medium text-gray-900 text-right max-w-[55%]">{order.delivery?.address}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Total</span>
              <span className="font-bold text-gray-900">₦{order.totalAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Pickup Order</h2>
            <p className="text-gray-600 text-sm">The buyer will collect this order in person.</p>
          </div>
        </div>
      )}

      {isDelivery && order.delivery?.deliveryCode && deliveryReq?.status === 'accepted' && deliveryReq?.trackingStatus !== 'collected' && (
        <div className="max-w-lg mx-auto px-4 pb-6">
          <div className="bg-rose-900 rounded-2xl p-5 text-white">
            <p className="text-rose-200 text-xs font-semibold uppercase tracking-wide mb-1">Delivery Code</p>
            <div className="flex items-center justify-between">
              <p className="text-4xl font-bold tracking-widest">{order.delivery.deliveryCode}</p>
              <button
                onClick={copyCode}
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center active:scale-95 transition-transform"
              >
                {codeCopied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
            <p className="text-rose-200 text-xs mt-3 leading-relaxed">
              The rider will provide this code, shared by the buyer, to confirm the delivery.
            </p>
          </div>
        </div>
      )}

      <div className="max-w-lg mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Order Items</p>
          </div>
          <div className="divide-y divide-gray-50">
            {order.items?.map((item, i) => (
              <div key={i} className="p-4 flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <p className="font-bold text-gray-900 text-sm">₦{item.subtotal?.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="p-4 bg-gray-50 space-y-1.5 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{order.totalAmount?.toLocaleString()}</span>
            </div>
            {order.delivery?.agreedDeliveryFee && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery Fee</span>
                <span>₦{order.delivery.agreedDeliveryFee?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
              <span>Total</span>
              <span>₦{((order.totalAmount || 0) + (order.delivery?.agreedDeliveryFee || 0)).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}