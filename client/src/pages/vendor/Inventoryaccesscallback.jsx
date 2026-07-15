// src/pages/dashboard/InventoryAccessCallback.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const InventoryAccessCallback = () => {
  const [status, setStatus] = useState('verifying'); // verifying | success | failed

  useEffect(() => {
    const verify = async () => {
      const params = new URLSearchParams(window.location.search);
      const reference = params.get('reference') || params.get('trxref');

      if (!reference) {
        setStatus('failed');
        return;
      }

      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/seller/inventory-access/verify`,
          {
            params: { reference },
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }
        );

        if (data.success && data.paid) {
          setStatus('success');
          toast.success('Inventory access unlocked!');
        } else {
          setStatus('failed');
        }
      } catch (err) {
        console.error(err);
        setStatus('failed');
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F5F3] px-4">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center border border-gray-100 shadow-sm">
        {status === 'verifying' && (
          <>
            <Loader2 className="animate-spin mx-auto mb-4 text-[#8B1E3F]" size={32} />
            <p className="text-gray-600 text-sm">Confirming your payment…</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 className="mx-auto mb-4 text-emerald-600" size={32} />
            <h2 className="font-bold text-gray-900 mb-2">Payment Successful</h2>
            <p className="text-sm text-gray-500 mb-5">
              Inventory access has been unlocked on your account.
            </p>
            <a
              href="/dashboard?page=inventory"
              className="inline-block px-5 py-2.5 bg-[#8B1E3F] text-white text-sm font-semibold rounded-xl"
            >
              Go to Inventory
            </a>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto mb-4 text-red-500" size={32} />
            <h2 className="font-bold text-gray-900 mb-2">Payment Not Confirmed</h2>
            <p className="text-sm text-gray-500 mb-5">
              We couldn't confirm this payment. If you were charged, please contact support.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl"
            >
              Back to Dashboard
            </a>
          </>
        )}
      </div>
    </div>
  );
};

export default InventoryAccessCallback;