import { useState } from 'react';
import { ArrowLeft, X, Loader2, Ticket } from 'lucide-react';
import api from '../../config/api';


const NGN_TO_KOBO = 100;

/**
 * Self-contained voucher flow. Renders as a modal over the checkout page.
 * Reads cart/fulfillment/estimate data as PROPS (read-only) — never calls
 * any cart/checkout mutation. All state here is local to this component.
 *
 * Props:
 *   isOpen: boolean
 *   onClose: () => void            // also called for the back button — releases any pending reservation
 *   cart: { items: [{ product, name, price, quantity }], fulfillmentType, pickup, delivery }
 *   deliveryFeeKobo: number        // from the checkout page's existing /api/orders/estimate
 *   onOrderPlaced: (order) => void // called after a successful voucher-funded order, e.g. to navigate away
 */
export default function VoucherModal({ isOpen, onClose, cart, deliveryFeeKobo, onOrderPlaced }) {
  const [step, setStep] = useState('code'); // 'code' | 'review' | 'paying'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(null); // response from /api/vouchers/apply

  if (!isOpen) return null;

  const resetAndClose = async () => {
    if (applied?.redemptionReference && step !== 'paying') {
      // Release the hold if the buyer backs out before paying — never
      // leave a silent reservation sitting against the voucher.
      api.post('/api/vouchers/release', { redemptionReference: applied.redemptionReference }).catch(() => {});
    }
    setStep('code');
    setCode('');
    setError('');
    setApplied(null);
    onClose();
  };

  const handleBack = () => {
    if (step === 'review') {
      if (applied?.redemptionReference) {
        api.post('/api/vouchers/release', { redemptionReference: applied.redemptionReference }).catch(() => {});
      }
      setApplied(null);
      setStep('code');
      setError('');
    } else {
      resetAndClose();
    }
  };

  const handleApply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const cartItems = cart.items.map((i) => ({ productId: i.product, quantity: i.quantity }));
      const { data } = await api.post('/api/vouchers/redeem', {
        code: code.trim(),
        mode:"ccheckout",
        category:'food',
        cartItems,
        deliveryFeeKobo,
      });
      setApplied(data);
      setStep('review');
    } catch (err) {
        console.log(err)
      setError(err.response?.data?.message || 'Could not apply this voucher.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayWithPaystack = () => {
    if (!applied) return;
    setStep('paying');
    setError('');

    const key = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY; // public key only — safe on the client
    const handler = window.PaystackPop.setup({
      key,
      email: cart.buyerEmail,
      amount: applied.grandTotalToChargeKobo, // already in kobo, exactly what was quoted
      ref: `PSK-${applied.redemptionReference}`,
      callback: (response) => {
        api
          .post('/api/vouchers/confirm', {
            redemptionReference: applied.redemptionReference,
            paystackReference: response.reference,
            fulfillment: {
              fulfillmentType: cart.fulfillmentType,
              pickup: cart.pickup,
              delivery: cart.delivery,
            },
          })
          .then(({ data }) => {
            onOrderPlaced?.(data.order);
            resetAndClose();
          })
          .catch((err) => {
            setError(err.response?.data?.message || 'Payment succeeded but confirming the order failed. Contact support with reference ' + response.reference);
            setStep('review');
          });
      },
      onClose: () => {
        setStep('review'); // reservation stays live until they hit back/close — the 30-min hold covers this
      },
    });
    handler.openIframe();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end md:items-center justify-center mb-30">
      <div className="bg-white w-full md:max-w-lg md:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <button onClick={handleBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
            <ArrowLeft size={20} />
          </button>
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Ticket size={18} /> Use a Voucher
          </h2>
          <button onClick={resetAndClose} className="p-2 -mr-2 text-gray-500 hover:text-gray-800">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {step === 'code' && (
            <>
              <p className="text-sm text-gray-500">
                Enter your voucher code. It'll only apply to items in your cart that match the
                voucher's category — the rest is paid the normal way.
              </p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="Voucher code"
                className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                onClick={handleApply}
                disabled={loading || !code.trim()}
                className="w-full bg-[#8B1E3F] text-white py-3 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                Apply Voucher
              </button>
            </>
          )}

          {step === 'review' && applied && (
            <>
              <div className="bg-green-50 rounded-xl p-3 text-sm text-green-700">
                Voucher applied — ₦{(applied.discountKobo / NGN_TO_KOBO).toLocaleString()} off matching items.
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-700">Matched items (voucher-eligible)</h3>
                {applied.matchedItems.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-600">
                    <span>{item.name} × {item.quantity}</span>
                    <span>₦{(item.subtotalKobo / NGN_TO_KOBO).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {applied.unmatchedSubtotalKobo > 0 && (
                <p className="text-xs text-gray-400">
                  ₦{(applied.unmatchedSubtotalKobo / NGN_TO_KOBO).toLocaleString()} of your cart isn't
                  covered by this voucher and is charged normally.
                </p>
              )}

              <div className="border-t pt-3 space-y-1 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Delivery fee</span>
                  <span>₦{(applied.deliveryFeeKobo / NGN_TO_KOBO).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold text-gray-800 text-base">
                  <span>Total to pay now</span>
                  <span>₦{applied.grandTotalToChargeNaira.toLocaleString()}</span>
                </div>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                onClick={handlePayWithPaystack}
                className="w-full bg-[#8B1E3F] text-white py-3 rounded-xl font-semibold"
              >
                Pay ₦{applied.grandTotalToChargeNaira.toLocaleString()} →
              </button>
            </>
          )}

          {step === 'paying' && (
            <div className="text-center py-10 text-gray-500">
              <Loader2 className="animate-spin mx-auto mb-3" />
              Waiting on payment...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}







































































