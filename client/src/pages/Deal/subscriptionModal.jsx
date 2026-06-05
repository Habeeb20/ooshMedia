

import { useState, useEffect } from 'react';
import { X, Zap, Shield, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { subscriptionAPI } from '../../config/api';

const PAYSTACK_PK = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

function getCurrentUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || 'user@example.com';
  } catch { return 'user@example.com'; }
}

// ✅ NEW — generates a unique reference every single click
function generateReference() {
  return `deal_msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export default function SubscriptionModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    if (window.PaystackPop) { setScriptReady(true); return; }

    const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
    if (existing) {
      existing.addEventListener('load', () => setScriptReady(true));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => setError('Failed to load payment SDK. Please refresh.');
    document.head.appendChild(script);
  }, []);

  const handlePay = async () => {
    if (!scriptReady || !window.PaystackPop) {
      setError('Payment SDK not ready. Please wait a moment and try again.');
      return;
    }

    setLoading(true);
    setError('');

    // ✅ CHANGED — generate reference here, pass it to backend
    const reference = generateReference();

    try {
      // ✅ CHANGED — pass { reference } so backend gets req.body.reference
      await subscriptionAPI.initiate({ reference });
    } catch (err) {
      setError(err.message || 'Payment initiation failed.');
      setLoading(false);
      return;
    }

    try {
      const handler = window.PaystackPop.setup({
        key: PAYSTACK_PK,
        email: getCurrentUserEmail(),
        amount: 1000000,
        ref: reference, // ✅ same reference passed to Paystack
        currency: 'NGN',
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
        metadata: {
          custom_fields: [{ display_name: 'Package', value: '10 Message Points' }],
        },
        callback: function (response) {
          setVerifying(true);
          subscriptionAPI
            .verify(response.reference)
            .then(() => {
              setVerifying(false);
              onSuccess();
            })
            .catch(() => {
              setVerifying(false);
              setError('Payment verification failed. Please contact support.');
            });
        },
        onClose: function () {
          setLoading(false);
        },
      });

      handler.openIframe();
    } catch (err) {
      setError('Could not open payment window. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        .modal-anim { animation: modalIn 0.22s cubic-bezier(.16,1,.3,1); }
      `}</style>

      <div
        className="fixed inset-0 bg-gray-200/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4 overflow-y-auto"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div className="modal-anim relative bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-[420px] flex flex-col items-center gap-4 px-6 pt-8 pb-6">

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
          >
            <X size={16} />
          </button>

          <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-500">
            <Zap size={28} />
          </div>

          <div className="text-center">
            <h2 className="text-xl font-black text-gray-900 mb-1">Unlock Direct Messaging</h2>
            <p className="text-sm text-gray-400">Connect directly with deal owners</p>
          </div>

          <div className="w-full bg-gray-50 border border-gray-100 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-gray-700">Messaging Bundle</span>
              <span className="text-2xl font-black text-[#8B1E3F]">₦10,000</span>
            </div>
            <ul className="flex flex-col gap-2">
              {[
                '10 message connection points',
                'Each connection = 1 point',
                'Unlimited messages per connection',
                'Renew anytime',
              ].map(feat => (
                <li key={feat} className="flex items-center gap-2 text-xs text-gray-500">
                  <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
            <Shield size={12} />
            <span>Secured by Paystack · SSL Encrypted</span>
          </div>

          {error && (
            <p className="w-full text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2 text-center">
              {error}
            </p>
          )}

          {verifying && (
            <p className="w-full text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-3 py-2 text-center flex items-center justify-center gap-2">
              <Loader2 size={13} className="spin" />
              Verifying your payment…
            </p>
          )}

          <button
            onClick={handlePay}
            disabled={loading || verifying || !scriptReady}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#8B1E3F] hover:bg-[#7a1835] text-white text-sm font-bold rounded-full transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading || verifying ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
            {verifying ? 'Verifying…' : loading ? 'Processing…' : 'Pay ₦10,000 — Get 10 Points'}
          </button>

          <button onClick={onClose} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
}











































// import { useState, useEffect } from 'react';
// import { X, Zap, Shield, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
// import { subscriptionAPI } from '../../config/api';

// const PAYSTACK_PK = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY;

// function getCurrentUserEmail() {
//   try {
//     const user = JSON.parse(localStorage.getItem('user') || '{}');
//     return user.email || 'user@example.com';
//   } catch { return 'user@example.com'; }
// }

// function generateReference() {
//   return `deal_msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
// }

// export default function SubscriptionModal({ onClose, onSuccess }) {
//   const [loading, setLoading] = useState(false);
//   const [verifying, setVerifying] = useState(false);
//   const [error, setError] = useState('');
//   const [scriptReady, setScriptReady] = useState(false);

//   useEffect(() => {
//     if (window.PaystackPop) { setScriptReady(true); return; }

//     const existing = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
//     if (existing) {
//       existing.addEventListener('load', () => setScriptReady(true));
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://js.paystack.co/v1/inline.js';
//     script.async = true;
//     script.onload = () => setScriptReady(true);
//     script.onerror = () => setError('Failed to load payment SDK. Please refresh.');
//     document.head.appendChild(script);
//   }, []);

//   const handlePay = async () => {
//     if (!scriptReady || !window.PaystackPop) {
//       setError('Payment SDK not ready. Please wait a moment and try again.');
//       return;
//     }

//     setLoading(true);
//     setError('');

//     // Generate a fresh reference — only used client-side to open the popup,
//     // then sent to the backend ONLY after Paystack confirms payment success.
//     const reference = generateReference();

//     try {
//       const handler = window.PaystackPop.setup({
//         key: PAYSTACK_PK,
//         email: getCurrentUserEmail(),
//         amount: 1000000, // ₦10,000 in kobo
//         ref: reference,
//         currency: 'NGN',
//         channels: ['card', 'bank', 'ussd', 'mobile_money'],
//         metadata: {
//           custom_fields: [{ display_name: 'Package', value: '10 Message Points' }],
//         },
//         callback: function (response) {
//           // Paystack confirmed success on their end — now verify on your backend
//           setLoading(false);
//           setVerifying(true);
//           subscriptionAPI
//             .verify(response.reference)
//             .then(() => {
//               setVerifying(false);
//               onSuccess();
//             })
//             .catch(() => {
//               setVerifying(false);
//               setError('Payment verification failed. Please contact support.');
//             });
//         },
//         onClose: function () {
//           setLoading(false);
//         },
//       });

//       handler.openIframe();
//     } catch (err) {
//       setError('Could not open payment window. Please try again.');
//       setLoading(false);
//     }
//   };

//   // ... rest of JSX unchanged
// }