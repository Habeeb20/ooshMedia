import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from "../../config/api";
import { Package, Truck, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/my'); // Adjust endpoint if needed
        setOrders(data.orders || data);
      } catch (err) {
        setError('Failed to load order history');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return <CheckCircle className="text-green-500" size={20} />;
      case 'cancelled': return <XCircle className="text-red-500" size={20} />;
      case 'processing': return <Clock className="text-amber-500" size={20} />;
      default: return <Package className="text-indigo-500" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Order History</h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6">{error}</div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <p className="text-xl font-semibold text-gray-600">No orders yet</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="font-semibold text-lg">Order #{order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('en-NG', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="font-medium capitalize">{order.status}</span>
                  </div>
                </div>

                <div className="border-t border-b py-4 my-4">
                  {order.items?.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm py-1">
                      <span>{item.name} × {item.quantity}</span>
                      <span>₦{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="font-bold text-xl">₦{order.total?.toLocaleString()}</p>
                  </div>

                  <button
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="px-5 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition"
                  >
                    View Details
                  </button>
                </div>

                {order.deliveryCode && (
                  <p className="mt-3 text-xs text-indigo-600">
                    Delivery Code: <span className="font-mono font-bold">{order.deliveryCode}</span>
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}