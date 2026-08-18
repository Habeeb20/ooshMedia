// components/InspectionPaymentButton.jsx
//
// Requires: npm install react-paystack
// Requires: VITE_PAYSTACK_PUBLIC_KEY set in your frontend .env
//
// Shows a "Pay for Inspection" button that opens the Paystack popup for a
// flat ₦5,000. On success, sends the reference to the backend for
// verification (never trust the popup's own "success" callback as proof of
// payment — the backend re-checks with Paystack directly). Once paid, the
// button permanently becomes a "Inspection Paid" badge.

import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import { ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const INSPECTION_AMOUNT_NAIRA = 5000;

export default function InspectionPaymentButton({ sellerEmail, paid, onPaid }) {
  const [verifying, setVerifying] = useState(false);

  const config = {
    reference: `inspection_${Date.now()}_${Math.floor(Math.random() * 1e6)}`,
    email: sellerEmail,
    amount: INSPECTION_AMOUNT_NAIRA * 100, // Paystack expects kobo
    publicKey: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        { display_name: 'Purpose', variable_name: 'purpose', value: 'Store Address Inspection' },
      ],
    },
  };

  const initializePayment = usePaystackPayment(config);

  const verifyOnBackend = async (reference) => {
    setVerifying(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/inspection/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ reference }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success('Inspection fee confirmed — an admin will schedule your inspection.');
        onPaid?.();
      } else {
        toast.error(data.message || 'Could not confirm your payment. Contact support if you were charged.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong confirming your payment. Contact support if you were charged.');
    } finally {
      setVerifying(false);
    }
  };

  const handleSuccess = (reference) => {
    // react-paystack passes either a string or an object depending on version
    const ref = typeof reference === 'string' ? reference : reference?.reference;
    if (ref) verifyOnBackend(ref);
  };

  const handleClose = () => {
    // Seller closed the popup without completing payment — nothing to do
  };

  if (paid) {
    return (
      <div className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-bold flex-shrink-0">
        <CheckCircle2 size={16} />
        Inspection Paid
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => initializePayment({ onSuccess: handleSuccess, onClose: handleClose })}
      disabled={verifying || !sellerEmail}
      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#8B1E3F] text-white text-sm font-bold hover:bg-[#7a1835] active:scale-[0.98] transition-all disabled:opacity-50 flex-shrink-0"
    >
      {verifying ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />}
      {verifying ? 'Confirming...' : `Pay for Inspection — ₦${INSPECTION_AMOUNT_NAIRA.toLocaleString('en-NG')}`}
    </button>
  );
}