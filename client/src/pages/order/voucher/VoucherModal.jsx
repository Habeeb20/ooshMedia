

// import { useState } from 'react';
// import { ArrowLeft, X, Loader2, Ticket } from 'lucide-react';
// import api from '../../config/api';

// const NGN_TO_KOBO = 100;

// /**
//  * Self-contained voucher flow (merchant-key + OTP under the hood, but the
//  * buyer only ever sees this modal — no wallet login screen, no redirect).
//  * Reads cart/fulfillment/estimate data as PROPS (read-only) — never calls
//  * any cart/checkout mutation. All state here is local to this component.
//  *
//  * Props:
//  *   isOpen: boolean
//  *   onClose: () => void            // also called for the back button — releases any pending reservation
//  *   cart: { items: [{ product, name, price, quantity }], fulfillmentType, pickup, delivery, buyerEmail }
//  *   deliveryFeeKobo: number        // from the checkout page's existing /api/orders/estimate
//  *   onOrderPlaced: (order) => void // called after a successful voucher-funded order
//  */
// export default function VoucherModal({ isOpen, onClose, cart, deliveryFeeKobo, onOrderPlaced }) {
//   const [step, setStep] = useState('code'); // 'code' | 'phone' | 'otp' | 'review' | 'paying'
//   const [code, setCode] = useState('');
//   const [phone, setPhone] = useState('');
//   const [otp, setOtp] = useState('');
//   const [otpReference, setOtpReference] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [applied, setApplied] = useState(null); // response from /api/vouchers/apply

//   if (!isOpen) return null;

//   const roughCartKobo = () =>
//     cart.items.reduce((sum, i) => sum + Math.round((i.price || 0) * i.quantity * NGN_TO_KOBO), 0);

//   const resetAndClose = async () => {
//     if (applied?.redemptionReference && step !== 'paying') {
//       // Release the hold if the buyer backs out before paying — never
//       // leave a silent reservation sitting against the voucher.
//       api.post('/api/vouchers/release', { redemptionReference: applied.redemptionReference }).catch(() => {});
//     }
//     setStep('code');
//     setCode('');
//     setPhone('');
//     setOtp('');
//     setOtpReference(null);
//     setError('');
//     setApplied(null);
//     onClose();
//   };

//   const handleBack = () => {
//     if (step === 'review') {
//       if (applied?.redemptionReference) {
//         api.post('/api/vouchers/release', { redemptionReference: applied.redemptionReference }).catch(() => {});
//       }
//       setApplied(null);
//       setOtp('');
//       setOtpReference(null);
//       setStep('code');
//       setError('');
//     } else if (step === 'otp') {
//       setOtp('');
//       setStep('phone');
//       setError('');
//     } else if (step === 'phone') {
//       setPhone('');
//       setOtpReference(null);
//       setStep('code');
//       setError('');
//     } else {
//       resetAndClose();
//     }
//   };

//   // Step 0: just a validity check before we ever ask for a phone number.
//   const handleCheckCode = async () => {
//     if (!code.trim()) return;
//     setLoading(true);
//     setError('');
//     try {
//       await api.get(`/api/vouchers/lookup/${encodeURIComponent(code.trim())}`, {
//         params: { cartKobo: roughCartKobo() },
//       });
//       setStep('phone');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Could not verify this voucher.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 1: text a 6-digit code to the wallet phone number.
//   const handleRequestOtp = async () => {
//     if (!phone.trim()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const { data } = await api.post(`/api/vouchers/${encodeURIComponent(code.trim())}/redeem/request-otp`, {
//         phone: phone.trim(),
//       });
//       setOtpReference(data.otpReference);
//       setStep('otp');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Could not send a verification code.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Step 2: verify the code and reserve the discount against this order.
//   const handleVerifyOtp = async () => {
//     if (!otp.trim()) return;
//     setLoading(true);
//     setError('');
//     try {
//       const cartItems = cart.items.map((i) => ({ productId: i.product, quantity: i.quantity }));
//       const { data } = await api.post('/api/vouchers/apply', {
//         code: code.trim(),
//         otpReference,
//         otp: otp.trim(),
//         cartItems,
//         deliveryFeeKobo,
//       });
//       setApplied(data);
//       setStep('review');
//     } catch (err) {
//       setError(err.response?.data?.message || 'Could not verify that code.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handlePayWithPaystack = () => {
//     if (!applied) return;
//     setStep('paying');
//     setError('');

//     const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY; // public key only — safe on the client
//     const handler = window.PaystackPop.setup({
//       key,
//       email: cart.buyerEmail,
//       amount: applied.grandTotalToChargeKobo, // already in kobo, exactly what was quoted
//       ref: `PSK-${applied.redemptionReference}`,
//       callback: (response) => {
//         api
//           .post('/api/vouchers/confirm', {
//             redemptionReference: applied.redemptionReference,
//             paystackReference: response.reference,
//             fulfillment: {
//               fulfillmentType: cart.fulfillmentType,
//               pickup: cart.pickup,
//               delivery: cart.delivery,
//             },
//           })
//           .then(({ data }) => {
//             onOrderPlaced?.(data.order);
//             resetAndClose();
//           })
//           .catch((err) => {
//             setError(err.response?.data?.message || 'Payment succeeded but confirming the order failed. Contact support with reference ' + response.reference);
//             setStep('review');
//           });
//       },
//       onClose: () => {
//         setStep('review'); // reservation stays live until they hit back/close — the hold covers this
//       },
//     });
//     handler.openIframe();
//   };

//   return (
//     <div className="fixed inset-0 z-50 bg-black/40 mb-30 flex items-end md:items-center justify-center">
//       <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
//         <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
//           <button onClick={handleBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
//             <ArrowLeft size={20} />
//           </button>
//           <h2 className="font-bold text-gray-800 flex items-center gap-2">
//             <Ticket size={18} /> Use a Voucher
//           </h2>
//           <button onClick={resetAndClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-800">
//             <X size={20} />
//           </button>
//         </div>

//         <div className="p-5 space-y-4">
//           {step === 'code' && (
//             <>
//               <p className="text-sm text-gray-500">
//                 Enter your voucher code. It'll only apply to items in your cart that match the
//                 voucher's category — the rest is paid the normal way.
//               </p>
//               <input
//                 value={code}
//                 onChange={(e) => setCode(e.target.value.toUpperCase())}
//                 placeholder="Voucher code"
//                 className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
//               />
//               {error && <p className="text-sm text-red-500">{error}</p>}
//               <button
//                 onClick={handleCheckCode}
//                 disabled={loading || !code.trim()}
//                 className="w-full bg-[#8B1E3F] text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {loading && <Loader2 size={16} className="animate-spin" />}
//                 Continue
//               </button>
//             </>
//           )}

//           {step === 'phone' && (
//             <>
//               <p className="text-sm text-gray-500">
//                 Enter the phone number linked to your Essential Wallet account. We'll text you a
//                 6-digit code to confirm it's really you.
//               </p>
//               <input
//                 value={phone}
//                 onChange={(e) => setPhone(e.target.value)}
//                 placeholder="080..."
//                 inputMode="tel"
//                 className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
//               />
//               {error && <p className="text-sm text-red-500">{error}</p>}
//               <button
//                 onClick={handleRequestOtp}
//                 disabled={loading || !phone.trim()}
//                 className="w-full bg-[#8B1E3F] text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {loading && <Loader2 size={16} className="animate-spin" />}
//                 Send code
//               </button>
//             </>
//           )}

//           {step === 'otp' && (
//             <>
//               <p className="text-sm text-gray-500">
//                 Enter the 6-digit code sent to {phone}.
//               </p>
//               <input
//                 value={otp}
//                 onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
//                 placeholder="123456"
//                 inputMode="numeric"
//                 className="w-full border border-gray-200 rounded-xl p-3 text-sm tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
//               />
//               {error && <p className="text-sm text-red-500">{error}</p>}
//               <button
//                 onClick={handleVerifyOtp}
//                 disabled={loading || otp.length !== 6}
//                 className="w-full bg-[#8B1E3F] text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {loading && <Loader2 size={16} className="animate-spin" />}
//                 Verify & apply
//               </button>
//               <button
//                 onClick={handleRequestOtp}
//                 disabled={loading}
//                 className="w-full text-sm text-gray-500 py-1"
//               >
//                 Resend code
//               </button>
//             </>
//           )}

//           {step === 'review' && applied && (
//             <>
//               <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
//                 Voucher applied — ₦{(applied.discountKobo / NGN_TO_KOBO).toLocaleString()} off matching items.
//               </div>

//               <div className="space-y-2">
//                 <h3 className="text-sm font-semibold text-gray-700">Matched items (voucher-eligible)</h3>
//                 {applied.matchedItems.map((item, idx) => (
//                   <div key={idx} className="flex justify-between text-sm text-gray-600">
//                     <span>{item.name} × {item.quantity}</span>
//                     <span>₦{(item.subtotalKobo / NGN_TO_KOBO).toLocaleString()}</span>
//                   </div>
//                 ))}
//               </div>

//               {applied.unmatchedSubtotalKobo > 0 && (
//                 <p className="text-xs text-gray-400">
//                   ₦{(applied.unmatchedSubtotalKobo / NGN_TO_KOBO).toLocaleString()} of your cart isn't
//                   covered by this voucher and is charged normally.
//                 </p>
//               )}

//               <div className="border-t pt-3 space-y-1 text-sm">
//                 <div className="flex justify-between text-gray-600">
//                   <span>Delivery fee</span>
//                   <span>₦{(applied.deliveryFeeKobo / NGN_TO_KOBO).toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between font-bold text-gray-800 text-base">
//                   <span>Total to pay now</span>
//                   <span>₦{applied.grandTotalToChargeNaira.toLocaleString()}</span>
//                 </div>
//               </div>

//               {error && <p className="text-sm text-red-500">{error}</p>}

//               <button
//                 onClick={handlePayWithPaystack}
//                 className="w-full bg-[#8B1E3F] text-white py-3 rounded-xl font-semibold"
//               >
//                 Pay ₦{applied.grandTotalToChargeNaira.toLocaleString()} →
//               </button>
//             </>
//           )}

//           {step === 'paying' && (
//             <div className="text-center py-10 text-gray-500">
//               <Loader2 className="animate-spin mx-auto mb-3" />
//               Waiting on payment...
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }






import { useState } from "react";
import { X, Ticket, Loader2 } from "lucide-react";
import api from "../../../config/api"; // adjust path to match your project

// Matches exactly how CheckoutPage.jsx already calls this component:
//   <VoucherModal isOpen onClose cart deliveryFeeKobo onOrderPlaced />
export default function VoucherModal({ isOpen, onClose, cart, deliveryFeeKobo = 0, onOrderPlaced }) {
  const [code, setCode] = useState("");
  const [step, setStep] = useState("input"); // input | preview | processing
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const reset = () => {
    setCode("");
    setStep("input");
    setPreview(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleValidate = async () => {
    if (!code.trim()) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/vouchers/validate", {
        code: code.trim(),
        cartItems: cart.items,
      });
      setPreview(data);
      setStep("preview");
    } catch (err) {
      setError(err.response?.data?.message || "Could not validate this voucher.");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError("");
    setLoading(true);
    setStep("processing");
    try {
      const { data } = await api.post("/api/vouchers/checkout", {
        code: code.trim(),
        cart,
        deliveryFeeKobo,
      });
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
        return;
      }
      onOrderPlaced?.(data.order);
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || "Voucher checkout failed. Please try again.");
      setStep("preview");
    } finally {
      setLoading(false);
    }
  };

  const subtotalKobo = cart.items.reduce((s, i) => s + Math.round(i.price * i.quantity * 100), 0);
  const deliveryKoboUsed = cart.fulfillmentType === "delivery" ? deliveryFeeKobo : 0;
  const grossKobo = subtotalKobo + deliveryKoboUsed;
  const remainingKobo = preview ? Math.max(grossKobo - preview.discountKobo, 0) : grossKobo;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 relative">
        <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400">
          <X size={20} />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Ticket className="text-[#8B1E3F]" size={22} />
          <h2 className="text-lg font-bold text-gray-800">Use a Voucher</h2>
        </div>

        {step === "input" && (
          <>
            <label className="text-sm text-gray-600">Voucher Code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. VC-XXXXXXXXXX"
              className="w-full mt-1 mb-3 p-3 border border-gray-200 rounded-xl text-sm font-mono tracking-wide focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
            />
            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}
            <button
              onClick={handleValidate}
              disabled={loading || !code.trim()}
              className="w-full bg-[#8B1E3F] text-white py-3 rounded-2xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Apply Voucher"}
            </button>
          </>
        )}

        {step === "preview" && preview && (
          <>
            <div className="bg-green-50 text-green-700 rounded-xl p-3 text-sm mb-4">
              ✓ Voucher valid for {preview.category} items in your cart.
            </div>

            <div className="space-y-1 text-sm mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Order total</span>
                <span>₦{(grossKobo / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-700">
                <span>Voucher discount</span>
                <span>−₦{(preview.discountKobo / 100).toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 border-t pt-2 mt-1">
                <span>You pay</span>
                <span>₦{(remainingKobo / 100).toLocaleString()}</span>
              </div>
            </div>

            <ul className="text-xs text-gray-500 mb-4 list-disc list-inside">
              {preview.matchedItems.map((m, i) => (
                <li key={i}>{m.name} × {m.quantity} qualifies</li>
              ))}
            </ul>

            {error && <p className="text-xs text-red-500 mb-3">{error}</p>}

            <div className="flex gap-2">
              <button onClick={reset} className="flex-1 py-3 rounded-2xl border border-gray-200 text-gray-600 font-semibold">
                Change Code
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-[#8B1E3F] text-white py-3 rounded-2xl font-semibold disabled:opacity-50"
              >
                {remainingKobo > 0 ? "Continue to Pay" : "Place Order"}
              </button>
            </div>
          </>
        )}

        {step === "processing" && (
          <div className="text-center py-8">
            <Loader2 className="animate-spin mx-auto mb-3 text-[#8B1E3F]" size={28} />
            <p className="text-sm text-gray-500">Applying your voucher...</p>
          </div>
        )}
      </div>
    </div>
  );
}
