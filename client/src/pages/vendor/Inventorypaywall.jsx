// src/components/dashboard/InventoryPaywall.jsx
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Lock, Loader2, CheckCircle2, Boxes, ScanLine, Truck, LineChart } from 'lucide-react';

const InventoryPaywall = () => {
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller/inventory-access/initiate`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      if (!data.success) throw new Error(data.message || 'Could not start payment.');

      if (data.alreadyPaid) {
        toast.success('Inventory access is already unlocked.');
        window.location.reload();
        return;
      }

      window.location.href = data.authorizationUrl;
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not start payment.');
      setLoading(false);
    }
  };

  const perks = [
    { icon: Boxes, label: 'Stock & inventory management' },
    { icon: ScanLine, label: 'Point of sale (POS)' },
    { icon: Truck, label: 'Delivery panel & tracking' },
    { icon: LineChart, label: 'Sales analytics' },
  ];

  return (
    <div className="flex flex-col items-center justify-center text-center py-14 px-6 bg-white rounded-2xl border border-gray-100">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-5">
        <Lock className="text-[#8B1E3F]" size={28} />
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-2">Unlock Inventory Tools</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        A one-time payment of ₦3,000 gives you full, permanent access to your seller inventory tools.
      </p>

      <div className="grid grid-cols-2 gap-3 max-w-sm w-full mb-8">
        {perks.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2.5 text-left">
            <Icon size={16} className="text-[#8B1E3F] shrink-0" />
            <span className="text-xs font-medium text-gray-700">{label}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handlePay}
        disabled={loading}
        className="flex items-center gap-2 px-6 py-3 bg-[#8B1E3F] text-white text-sm font-semibold rounded-xl hover:bg-[#701733] transition disabled:opacity-60"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
        {loading ? 'Redirecting to Paystack…' : 'Pay ₦3,000 to Unlock'}
      </button>
    </div>
  );
};

export default InventoryPaywall;