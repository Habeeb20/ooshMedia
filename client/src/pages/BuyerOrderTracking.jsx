import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Loader2, Package, Phone, Copy, Check } from 'lucide-react';
import DeliveryTrackingMap from './DeliveryTrackingMap';
import { useSocket } from '../config/UsesSocket';


export default function BuyerOrderTracking() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [deliveryReq, setDeliveryReq] = useState(null);
  const [loading, setLoading] = useState(true);
  const [codeCopied, setCodeCopied] = useState(false);
  const [toast, setToast] = useState('');
  const socket = useSocket();
const token = localStorage.getItem("token")
  useEffect(() => {
    fetchData();
  }, [orderId]);

  useEffect(() => {
    if (!socket || !deliveryReq) return;
    socket.on('delivery:assigned', ({ requestId, agreedAmount, rider }) => {
      fetchData(); // refresh to get rider details
      showToast('A rider has been assigned to your order!');
    });
    return () => socket.off('delivery:assigned');
  }, [socket, deliveryReq]);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3500); };

  const fetchData = async () => {
    try {
      // fetch order
      const { data: orderData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/orders/${orderId}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      setOrder(orderData.order);

      // fetch delivery request if exists
      if (orderData.order.delivery?.deliveryRequestId) {
        const { data: drData } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/${orderData.order.delivery.deliveryRequestId}`, {
                    headers: {
            Authorization: `Bearer ${token}`
        }
        });
        console.log(drData.request)
        setDeliveryReq(drData.request);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(order.delivery?.deliveryCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 size={28} className="animate-spin text-rose-900" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-500">Order not found</p>
      </div>
    );
  }

  const isDelivery = order.fulfillmentType === 'delivery';

  return (
    <div className="bg-gray-50 min-h-screen">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg animate-in fade-in slide-in-from-top-2">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center">
              <Package size={18} className="text-rose-900" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{order.orderNumber}</h1>
              <p className="text-xs text-gray-500 capitalize">{order.status}</p>
            </div>
          </div>
        </div>
      </div>

      {isDelivery && deliveryReq ? (
        /* Has assigned rider — show tracking map */
        <DeliveryTrackingMap requestId={deliveryReq._id} viewerRole="buyer" />
      ) : isDelivery ? (
        /* Delivery order, rider not yet assigned */
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <div className="w-20 h-20 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">🛵</span>
          </div>
          <h2 className="font-bold text-gray-900 text-lg">Awaiting Rider Assignment</h2>
          <p className="text-gray-500 text-sm mt-2">
            The seller is assigning a rider to your order. You'll receive an email when it's confirmed.
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
        /* Pickup order */
        <div className="max-w-lg mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="font-bold text-gray-900 mb-3">Pickup Order</h2>
            <p className="text-gray-600 text-sm">This order is for pickup. Bring your order number when collecting.</p>
          </div>
        </div>
      )}

      {/* Delivery Code */}
      {isDelivery && order.delivery?.deliveryCode && deliveryReq?.status === 'accepted' && deliveryReq?.trackingStatus !== 'collected' && (
        <div className="max-w-lg mx-auto px-4 pb-6">
          <div className="bg-rose-900 rounded-2xl p-5 text-white">
            <p className="text-rose-200 text-xs font-semibold uppercase tracking-wide mb-1">Your Delivery Code</p>
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
              Share this code with your rider <strong className="text-white">only when they arrive</strong> to confirm your delivery.
            </p>
          </div>
        </div>
      )}

      {/* Order Items */}
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