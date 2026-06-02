import { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api from '../../config/api';
import { CheckCircle, Truck, Package, Clock, AlertCircle } from 'lucide-react';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const statusIcon = (status) => ({
  pending: <Clock size={20} className="text-amber-500" />,
  confirmed: <CheckCircle size={20} className="text-blue-500" />,
  processing: <Package size={20} className="text-purple-500" />,
  shipped: <Truck size={20} className="text-indigo-500" />,
  delivered: <CheckCircle size={20} className="text-green-600" />,
}[status] || <AlertCircle size={20} className="text-gray-400" />);

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(location.state?.order || null);
  const [deliveryCode, setDeliveryCode] = useState(location.state?.deliveryCode || sessionStorage.getItem('deliveryCode'));
  const [verifyCode, setVerifyCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState('');

  useEffect(() => {
    api.get(`/api/orders/${orderId}`).then(({ data }) => setOrder(data)).catch(console.error);
  }, [orderId]);

  const handleVerifyDelivery = async () => {
    setVerifyError('');
    setVerifying(true);
    try {
      const { data } = await api.post(`/api/orders/${orderId}/verify-delivery`, { code: verifyCode });
      setOrder(data.order);
      sessionStorage.removeItem('deliveryCode');
      setDeliveryCode(null);
    } catch (err) {
      setVerifyError(err.response?.data?.message || 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  if (!order) return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs text-gray-400">Order</p>
              <p className="font-bold text-gray-800">{order.orderNumber}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              order.status === 'delivered' ? 'bg-green-100 text-green-700' :
              order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
              'bg-indigo-100 text-indigo-700'
            }`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Delivery Code Display */}
        {deliveryCode && order.fulfillmentType === 'delivery' && order.status !== 'delivered' && (
          <div className="bg-indigo-600 text-white rounded-2xl p-5 text-center shadow-lg">
            <p className="text-sm mb-2 opacity-80">Your Delivery Code</p>
            <p className="text-5xl font-black tracking-widest">{deliveryCode}</p>
            <p className="text-xs mt-3 opacity-70">Give this code to the delivery rider only</p>
          </div>
        )}

        {/* Status Tracker */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-4">Order Progress</h2>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-none">
                <div className={`flex flex-col items-center ${i <= currentStep ? 'opacity-100' : 'opacity-30'}`}>
                  {statusIcon(step)}
                  <span className="text-xs mt-1 capitalize text-gray-600">{step}</span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-4 ${i < currentStep ? 'bg-indigo-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rider delivery code input (for dispatch riders) */}
        {order.fulfillmentType === 'delivery' && order.status === 'shipped' && !order.delivery.isCodeVerified && (
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-700 mb-3">Confirm Delivery</h2>
            <p className="text-sm text-gray-500 mb-3">Enter the customer's 4-digit delivery code to mark as delivered.</p>
            <div className="flex gap-2">
              <input
                value={verifyCode}
                onChange={e => setVerifyCode(e.target.value)}
                maxLength={4}
                placeholder="Enter code"
                className="flex-1 border border-gray-200 rounded-xl p-3 text-center text-2xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
              <button
                onClick={handleVerifyDelivery}
                disabled={verifyCode.length !== 4 || verifying}
                className="px-5 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50"
              >
                {verifying ? '...' : 'Verify'}
              </button>
            </div>
            {verifyError && <p className="text-red-500 text-sm mt-2">{verifyError}</p>}
          </div>
        )}

        {/* Fulfillment Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">Fulfillment</h2>
          <div className="text-sm space-y-1 text-gray-600">
            <p>Type: <span className="font-medium capitalize">{order.fulfillmentType}</span></p>
            {order.fulfillmentType === 'delivery' && order.delivery?.address && (
              <p>Address: <span className="font-medium">{order.delivery.address}</span></p>
            )}
            {order.fulfillmentType === 'pickup' && order.pickup?.pickedUpBy === 'agent' && (
              <p>Agent: <span className="font-medium">{order.pickup.agentName} — {order.pickup.agentPhone}</span></p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">Items</h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between py-2 border-b last:border-b-0 text-sm">
              <span className="text-gray-700">{item.name} × {item.quantity}</span>
              <span className="font-semibold">₦{item.subtotal.toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between font-bold text-gray-800 pt-3 text-base">
            <span>Total</span>
            <span>₦{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-2">Payment</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Method</span>
            <span className="font-medium capitalize">{order.paymentMethod === 'online' ? 'Online' : 'Pay on Delivery'}</span>
          </div>
          <div className="flex justify-between text-sm mt-1">
            <span className="text-gray-600">Status</span>
            <span className={`font-semibold capitalize ${order.paymentStatus === 'paid' ? 'text-green-600' : 'text-amber-600'}`}>
              {order.paymentStatus}
            </span>
          </div>
          {order.loyaltyPointsAwarded > 0 && (
            <div className="mt-3 bg-yellow-50 rounded-xl p-3 text-xs text-yellow-700">
              🏆 You earned <strong>{order.loyaltyPointsAwarded} loyalty points</strong> from this order!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
