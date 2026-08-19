import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { X, CreditCard, AlertCircle } from 'lucide-react';
import api from '../../config/api';
import { toast } from 'sonner';

export default function PayPlatformFeeModal({ isOpen, onClose, currentBalance, onPaymentSuccess }) {
  const [amount, setAmount] = useState(currentBalance || '');
  const [loading, setLoading] = useState(false);
  const [payConfig, setPayConfig] = useState(null);

  const initializePayment = usePaystackPayment(payConfig);

  const handleInit = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return alert('Enter a valid amount');
    if (amount > currentBalance) return alert('Amount cannot exceed current debt');

    setLoading(true);
    try {
      const res = await api.post('/api/analytics/seller/pay-fee/init', { amount: Number(amount) });
      console.log(res)
      const { reference, paystackPublicKey, email } = res.data;
      console.log(res.data)

      const config = {
        reference,
        email,
        amount: Number(amount) * 100, // Paystack requires Kobo
        publicKey: paystackPublicKey,
      };
      console.log(config)

      setPayConfig(config);

      initializePayment({
        onSuccess: async (referenceObj) => {
          try {
            await api.post('/api/analytics/seller/pay-fee/verify', { reference: referenceObj.reference });
            toast.success('Payment successful! Your balance has been updated.');
            onPaymentSuccess();
            onClose();
          } catch (err) {
            console.log(err)
            toast.error('Verification failed. Please contact support.');
          }
        },
        onClose: () => toast.error('Transaction cancelled.'),
      });
    } catch (err) {
        console.log(err)
      toast.error(err.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <X size={20} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Pay Platform Fee</h3>
            <p className="text-xs text-gray-400">Clear your pending platform commission</p>
          </div>
        </div>

        <div className="bg-amber-50 rounded-xl p-3 mb-5 border border-amber-200 flex gap-2.5 items-start">
          <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
          <p className="text-xs text-amber-800">
            Current Outstanding Balance: <strong className="font-bold">₦{currentBalance?.toLocaleString()}</strong>
          </p>
        </div>

        <form onSubmit={handleInit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Amount to Pay (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={currentBalance}
              min={100}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setAmount(currentBalance)}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              Pay Full Amount
            </button>
            <button
              type="button"
              onClick={() => setAmount(Math.round(currentBalance / 2))}
              className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
            >
              Pay 50%
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl text-sm transition-all"
          >
            {loading ? 'Processing...' : 'Proceed to Paystack'}
          </button>
        </form>
      </div>
    </div>
  );
}