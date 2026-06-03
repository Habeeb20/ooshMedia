// src/pages/PaymentVerifyPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

export default function PaymentVerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'failed'
  const [order, setOrder] = useState(null);
  const [deliveryCode, setDeliveryCode] = useState(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) {
      setStatus('failed');
      return;
    }
    api.get(`/api/orders/verify-payment/${reference}`)
      .then(({ data }) => {
        setOrder(data.order);
        if (data.order.fulfillmentType === 'delivery') {
          setDeliveryCode(data.order.delivery?.deliveryCode);
        }
        setStatus('success');
      })
      .catch(() => setStatus('failed'));
  }, [searchParams]);

  if (status === 'verifying') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <Loader size={48} className="animate-spin text-indigo-500" />
        <p className="text-lg font-semibold">Verifying payment...</p>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <XCircle size={64} className="text-red-400" />
        <p className="text-xl font-bold text-red-600">Payment Failed</p>
        <button onClick={() => navigate('/cart')} className="px-6 py-2 bg-indigo-600 text-white rounded-xl">
          Return to Cart
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6">
      <CheckCircle size={72} className="text-green-500" />
      <h1 className="text-2xl font-black text-gray-800">Payment Successful!</h1>
      <p className="text-gray-500">Order {order?.orderNumber} confirmed</p>

      {deliveryCode && (
        <div className="bg-indigo-600 text-white rounded-2xl p-6 text-center shadow-xl">
          <p className="text-sm mb-2 opacity-80">Your Delivery Code</p>
          <p className="text-6xl font-black tracking-widest">{deliveryCode}</p>
          <p className="text-xs mt-3 opacity-70">Give this to the rider when they arrive</p>
        </div>
      )}

      {order?.loyaltyPointsAwarded > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-3 text-center">
          <p className="text-yellow-700 font-semibold">🏆 +{order.loyaltyPointsAwarded} Loyalty Points Earned!</p>
        </div>
      )}

      <button
        onClick={() => navigate(`/order/${order?._id}`)}
        className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700"
      >
        Track Order
      </button>
    </div>
  );
}
