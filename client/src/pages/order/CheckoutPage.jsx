import { useState } from 'react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';
import api from "../../config/api"


export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platformFee = +(cartTotal * 0.10).toFixed(2);

  const handleCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/api/orders/checkout');
      const { order, paymentUrl, deliveryCode } = data;

      // Show delivery code first
      if (deliveryCode) {
        sessionStorage.setItem('deliveryCode', deliveryCode);
        sessionStorage.setItem('orderId', order._id);
      }

      if (paymentUrl) {
        // Redirect to Paystack
        window.location.href = paymentUrl;
      } else {
        // Pay on delivery
        navigate(`/order/${order._id}`, { state: { deliveryCode, order } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items?.length === 0) {
    navigate('/cart');
    return null;
  }

  const fulfillmentLabel = cart.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup';

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h1>

      <div className="max-w-lg mx-auto space-y-4">
        {/* Items */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-3">Items ({cart.items.length})</h2>
          {cart.items.map(item => (
            <div key={item.product} className="flex justify-between text-sm py-2 border-b last:border-b-0">
              <span className="text-gray-700">{item.name} × {item.quantity}</span>
              <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
            </div>
          ))}
        </div>

        {/* Fulfillment */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-2">Fulfillment</h2>
          <p className="text-sm text-gray-600">Method: <span className="font-medium">{fulfillmentLabel}</span></p>
          {cart.fulfillmentType === 'delivery' && cart.delivery?.address && (
            <p className="text-sm text-gray-600">Address: <span className="font-medium">{cart.delivery.address}</span></p>
          )}
          {cart.fulfillmentType === 'pickup' && cart.pickup?.pickedUpBy === 'agent' && (
            <p className="text-sm text-gray-600">
              Agent: <span className="font-medium">{cart.pickup.agentName} ({cart.pickup.agentPhone})</span>
            </p>
          )}
          {cart.fulfillmentType === 'delivery' && (
            <div className="mt-3 bg-indigo-50 rounded-xl p-3">
              <p className="text-xs text-indigo-700 font-semibold">
                📦 A 4-digit delivery code will be displayed after checkout. Share it only with the delivery rider.
              </p>
            </div>
          )}
        </div>

        {/* Payment */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-2">Payment</h2>
          <p className="text-sm text-gray-600">
            Method: <span className="font-medium capitalize">{cart.paymentMethod === 'online' ? 'Online (Paystack)' : 'Pay on Delivery'}</span>
          </p>
          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>
        )}

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Processing...' : cart.paymentMethod === 'online' ? 'Pay Now →' : 'Place Order →'}
        </button>
        <button onClick={() => navigate('/cart')} className="w-full text-gray-500 text-sm text-center py-2">
          ← Back to Cart
        </button>
      </div>
    </div>
  );
}
