




// import { useState, useEffect } from 'react';
// import { useCart } from '../../context/cartContext';
// import { useNavigate } from 'react-router-dom';
// import api from "../../config/api";

// export default function CheckoutPage() {
//   const cartHook = useCart();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [estimate, setEstimate] = useState(null);
//   const [estimateLoading, setEstimateLoading] = useState(true);

//   const cart = cartHook?.cart || null;
//   const cartTotal = cartHook?.cartTotal || 0;

//   // Redirect if cart is empty
//   useEffect(() => {
//     if (cartHook && (!cart || cart.items?.length === 0)) {
//       const timer = setTimeout(() => {
//         navigate('/cart', { replace: true });
//       }, 800);
//       return () => clearTimeout(timer);
//     }
//   }, [cartHook, cart, navigate]);

//   // Fetch the real total (incl. transport fee + payout info) before the user pays
//   useEffect(() => {
//     if (!cart || cart.items?.length === 0) return;

//     let cancelled = false;
//     setEstimateLoading(true);

//     api.get('/api/orders/estimate')
//       .then(({ data }) => {
//         if (!cancelled) setEstimate(data);
//       })
//       .catch((err) => {
//         if (!cancelled) setError(err.response?.data?.message || 'Could not calculate order total.');
//       })
//       .finally(() => {
//         if (!cancelled) setEstimateLoading(false);
//       });

//     return () => { cancelled = true; };
//   }, [cart]);

//   const transportFee = estimate?.transportFee || 0;
//   const finalTotal = estimate ? estimate.total : cartTotal;

//   // Does at least one seller in this order get paid instantly via split?
//   const hasSplitEligibleSeller = estimate?.sellerPayoutInfo?.some(s => s.eligibleForSplit) || false;

//   const handleCheckout = async () => {
//     if (!cart || cart.items?.length === 0) return;

//     setError('');
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/orders/checkout');
//       const { order, paymentUrl, deliveryCode, pickupCode } = data;

//       if (deliveryCode) {
//         sessionStorage.setItem('deliveryCode', deliveryCode);
//         sessionStorage.setItem('orderId', order._id);
//       }
//       if (pickupCode) {
//         sessionStorage.setItem('pickupCode', pickupCode);
//         sessionStorage.setItem('orderId', order._id);
//       }

//       if (paymentUrl) {
//         window.location.href = paymentUrl;
//       } else {
//         navigate(`/order/${order._id}`, { state: { deliveryCode, pickupCode, order } });
//       }
//     } catch (err) {
//       setError(err.response?.data?.message || 'Checkout failed. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!cartHook) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="animate-spin w-8 h-8 border-4 border-[#8B1E3F] border-t-transparent rounded-full mx-auto"></div>
//           <p className="mt-4 text-gray-600">Loading...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!cart || cart.items?.length === 0) {
//     return (
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <p className="text-gray-600">Redirecting to cart...</p>
//         </div>
//       </div>
//     );
//   }

//   const fulfillmentLabel = cart.fulfillmentType === 'delivery' ? 'Delivery' : 'Pickup';

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Order Summary</h1>

//       <div className="max-w-lg mx-auto space-y-4">
//         {/* Items */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm">
//           <h2 className="font-bold text-gray-700 mb-3">Items ({cart.items.length})</h2>
//           {cart.items.map(item => (
//             <div key={item.product} className="flex justify-between text-sm py-2 border-b last:border-b-0">
//               <span className="text-gray-700">{item.name} × {item.quantity}</span>
//               <span className="font-semibold">₦{(item.price * item.quantity).toLocaleString()}</span>
//             </div>
//           ))}
//         </div>

//         {/* Fulfillment */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm">
//           <h2 className="font-bold text-gray-700 mb-2">Fulfillment</h2>
//           <p className="text-sm text-gray-600">Method: <span className="font-medium">{fulfillmentLabel}</span></p>
//           {cart.fulfillmentType === 'delivery' && cart.delivery?.address && (
//             <p className="text-sm text-gray-600">Address: <span className="font-medium">{cart.delivery.address}</span></p>
//           )}

//           {cart.fulfillmentType === 'delivery' && (
//             <div className="mt-3 bg-[#fdf2f5] rounded-xl p-3 space-y-1">
//               <p className="text-xs text-[#8B1E3F] font-semibold">
//                 📦 A 4-digit delivery code will be shown after checkout.
//               </p>
//               {estimateLoading ? (
//                 <p className="text-xs text-gray-500">Calculating delivery fee...</p>
//               ) : estimate?.transportFeeDetails ? (
//                 <p className="text-xs text-gray-500">
//                   Delivery fee estimated at ~{estimate.transportFeeDetails.breakdown?.[0]?.distanceKm?.toFixed?.(1) ?? '—'}km
//                   from the seller ({estimate.transportFeeDetails.breakdown?.[0]?.source}).
//                 </p>
//               ) : null}
//             </div>
//           )}

//           {cart.fulfillmentType === 'pickup' && (
//             <div className="mt-3 bg-[#fdf2f5] rounded-xl p-3">
//               <p className="text-xs text-[#8B1E3F] font-semibold">
//                 🏬 A 4-digit pickup code will be shown after checkout.
//               </p>
//             </div>
//           )}
//         </div>

//         {/* Payment */}
//         <div className="bg-white rounded-2xl p-5 shadow-sm">
//           <h2 className="font-bold text-gray-700 mb-2">Payment</h2>
//           <p className="text-sm text-gray-600">
//             Method: <span className="font-medium capitalize">
//               {cart.paymentMethod === 'online' ? 'Online (Paystack)' : 'Pay on Delivery'}
//             </span>
//           </p>

//           {cart.paymentMethod === 'online' && !estimateLoading && (
//             <p className="text-xs text-gray-500 mt-1">
//               {hasSplitEligibleSeller
//                 ? '⚡ Verified sellers on this order are paid instantly via secure split payment.'
//                 : 'Funds are held securely and settled to the seller after delivery is confirmed.'}
//             </p>
//           )}

//           <div className="mt-3 space-y-1 text-sm">
//             <div className="flex justify-between text-gray-600">
//               <span>Subtotal</span>
//               <span>₦{cartTotal.toLocaleString()}</span>
//             </div>

//             {cart.fulfillmentType === 'delivery' && (
//               <div className="flex justify-between text-gray-600">
//                 <span>Delivery fee</span>
//                 <span>
//                   {estimateLoading ? 'Calculating...' : `₦${transportFee.toLocaleString()}`}
//                 </span>
//               </div>
//             )}

//             <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
//               <span>Total</span>
//               <span>
//                 {estimateLoading ? '...' : `₦${finalTotal.toLocaleString()}`}
//               </span>
//             </div>
//           </div>
//         </div>

//         {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

//         <button
//           onClick={handleCheckout}
//           disabled={loading || estimateLoading}
//           className="w-full bg-[#8B1E3F] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#7a1a37] disabled:opacity-50"
//         >
//           {loading ? 'Processing...' : cart.paymentMethod === 'online' ? 'Pay Now →' : 'Place Order →'}
//         </button>

//         <button onClick={() => navigate('/cart')} className="w-full text-gray-500 text-sm text-center py-2">
//           ← Back to Cart
//         </button>
//       </div>
//     </div>
//   );
// }









import { useState, useEffect, useMemo } from 'react';
import { useCart } from '../../context/cartContext';
import { useNavigate } from 'react-router-dom';
import api from "../../config/api";

const MIN_REDEMPTION_POINTS = 1000;
const POINT_VALUE_NGN = 1000; // 1 point = ₦1000

export default function CheckoutPage() {
  const cartHook = useCart();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState(null);
  const [estimateLoading, setEstimateLoading] = useState(true);

  // ── Loyalty state ──
  const [loyaltyInfo, setLoyaltyInfo] = useState(null); // { availablePoints, globalEnabled, userEnabled, eligible, canRedeem }
  const [useLoyalty, setUseLoyalty] = useState(false);
  const [redeemMode, setRedeemMode] = useState('all'); // 'all' | 'custom'
  const [customPoints, setCustomPoints] = useState('');
  const [loyaltyError, setLoyaltyError] = useState('');

  const cart = cartHook?.cart || null;
  const cartTotal = cartHook?.cartTotal || 0;

  // Redirect if cart is empty
  useEffect(() => {
    if (cartHook && (!cart || cart.items?.length === 0)) {
      const timer = setTimeout(() => {
        navigate('/cart', { replace: true });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [cartHook, cart, navigate]);

  // Fetch loyalty status once on mount
  useEffect(() => {
    api.get('/api/loyalty/me')
      .then(({ data }) => setLoyaltyInfo(data))
      .catch(() => setLoyaltyInfo(null));
  }, []);

  // Points the user is actually asking to redeem right now
  const pointsToRedeem = useMemo(() => {
    if (!useLoyalty || !loyaltyInfo) return 0;
    if (redeemMode === 'all') return loyaltyInfo.availablePoints;
    const n = parseInt(customPoints, 10);
    return Number.isFinite(n) ? n : 0;
  }, [useLoyalty, redeemMode, customPoints, loyaltyInfo]);

  // Fetch the real total (incl. transport fee, payout info, loyalty discount) before the user pays
  useEffect(() => {
    if (!cart || cart.items?.length === 0) return;

    let cancelled = false;
    setEstimateLoading(true);
    setLoyaltyError('');

    const params = pointsToRedeem > 0 ? { pointsToRedeem } : {};

    api.get('/api/orders/estimate', { params })
      .then(({ data }) => {
        if (!cancelled) setEstimate(data);
      })
      .catch((err) => {
        if (cancelled) return;
        const msg = err.response?.data?.message || 'Could not calculate order total.';
        // Loyalty-specific failures shouldn't block the whole page — surface
        // them near the toggle and fall back to a no-loyalty estimate.
        if (pointsToRedeem > 0) {
          setLoyaltyError(msg);
          api.get('/api/orders/estimate').then(({ data }) => !cancelled && setEstimate(data)).catch(() => {});
        } else {
          setError(msg);
        }
      })
      .finally(() => {
        if (!cancelled) setEstimateLoading(false);
      });

    return () => { cancelled = true; };
  }, [cart, pointsToRedeem]);

  const transportFee = estimate?.transportFee || 0;
  const loyaltyDiscount = estimate?.loyaltyDiscount || 0;
  const loyaltyPointsUsed = estimate?.loyaltyPointsUsed || 0;
  const finalTotal = estimate ? estimate.total : cartTotal;

  const hasSplitEligibleSeller = estimate?.sellerPayoutInfo?.some(s => s.eligibleForSplit) || false;

  // Feature only fully usable if BOTH admin switches are on and balance qualifies.
  // Still shown (faded) if the user has enough points but a switch is off,
  // per the "user sees it but can't use it" requirement.
  const meetsBalanceThreshold = (loyaltyInfo?.availablePoints || 0) >= MIN_REDEMPTION_POINTS;
  const isUsable = !!loyaltyInfo?.canRedeem;
  const showLoyaltySection = meetsBalanceThreshold; // visible whenever balance qualifies

  const handleToggleLoyalty = () => {
    if (!isUsable) return; // faded state — no-op
    setUseLoyalty(prev => {
      const next = !prev;
      if (!next) {
        setRedeemMode('all');
        setCustomPoints('');
        setLoyaltyError('');
      }
      return next;
    });
  };

  const handleCustomPointsChange = (e) => {
    setCustomPoints(e.target.value.replace(/[^0-9]/g, ''));
  };

  const handleCheckout = async () => {
    if (!cart || cart.items?.length === 0) return;

    if (useLoyalty && pointsToRedeem > 0 && pointsToRedeem < MIN_REDEMPTION_POINTS) {
      setLoyaltyError(`Minimum redemption is ${MIN_REDEMPTION_POINTS.toLocaleString()} points.`);
      return;
    }

    setError('');
    setLoading(true);
    try {
      const payload = useLoyalty && pointsToRedeem > 0 ? { pointsToRedeem } : {};
      const { data } = await api.post('/api/orders/checkout', payload);
      const { order, paymentUrl, deliveryCode, pickupCode } = data;

      if (deliveryCode) {
        sessionStorage.setItem('deliveryCode', deliveryCode);
        sessionStorage.setItem('orderId', order._id);
      }
      if (pickupCode) {
        sessionStorage.setItem('pickupCode', pickupCode);
        sessionStorage.setItem('orderId', order._id);
      }

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        navigate(`/order/${order._id}`, { state: { deliveryCode, pickupCode, order } });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!cartHook) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#8B1E3F] border-t-transparent rounded-full mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to cart...</p>
        </div>
      </div>
    );
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

          {cart.fulfillmentType === 'delivery' && (
            <div className="mt-3 bg-[#fdf2f5] rounded-xl p-3 space-y-1">
              <p className="text-xs text-[#8B1E3F] font-semibold">
                📦 A 4-digit delivery code will be shown after checkout.
              </p>
              {estimateLoading ? (
                <p className="text-xs text-gray-500">Calculating delivery fee...</p>
              ) : estimate?.transportFeeDetails ? (
                <p className="text-xs text-gray-500">
                  Delivery fee estimated at ~{estimate.transportFeeDetails.breakdown?.[0]?.distanceKm?.toFixed?.(1) ?? '—'}km
                  from the seller ({estimate.transportFeeDetails.breakdown?.[0]?.source}).
                </p>
              ) : null}
            </div>
          )}

          {cart.fulfillmentType === 'pickup' && (
            <div className="mt-3 bg-[#fdf2f5] rounded-xl p-3">
              <p className="text-xs text-[#8B1E3F] font-semibold">
                🏬 A 4-digit pickup code will be shown after checkout.
              </p>
            </div>
          )}
        </div>

        {/* Loyalty Points */}
        {showLoyaltySection && (
          <div
            className={`bg-white rounded-2xl p-5 shadow-sm transition-opacity ${
              isUsable ? '' : 'opacity-50'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-bold text-gray-700 mb-1">Loyalty Points</h2>
                <p className="text-sm text-gray-600">
                  You have <span className="font-semibold text-[#8B1E3F]">
                    {(loyaltyInfo?.availablePoints || 0).toLocaleString()} points
                  </span>
                  <span className="text-gray-400"> (₦{((loyaltyInfo?.availablePoints || 0) * POINT_VALUE_NGN).toLocaleString()})</span>
                </p>
                {!isUsable && (
                  <p className="text-xs text-gray-400 mt-1">
                    {!loyaltyInfo?.globalEnabled
                      ? 'Loyalty redemption is currently unavailable.'
                      : 'Your account is not eligible to redeem points right now.'}
                  </p>
                )}
              </div>

              {/* Toggle */}
              <button
                type="button"
                onClick={handleToggleLoyalty}
                disabled={!isUsable}
                aria-pressed={useLoyalty}
                aria-label="Use your loyalty points"
                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                  useLoyalty ? 'bg-[#8B1E3F]' : 'bg-gray-300'
                } ${isUsable ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    useLoyalty ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-2">Want to use your loyalty points?</p>

            {useLoyalty && isUsable && (
              <div className="mt-3 space-y-2">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setRedeemMode('all'); setLoyaltyError(''); }}
                    className={`flex-1 text-sm py-2 rounded-xl font-semibold border ${
                      redeemMode === 'all'
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F]'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Use all points
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRedeemMode('custom'); setLoyaltyError(''); }}
                    className={`flex-1 text-sm py-2 rounded-xl font-semibold border ${
                      redeemMode === 'custom'
                        ? 'bg-[#8B1E3F] text-white border-[#8B1E3F]'
                        : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    Enter amount
                  </button>
                </div>

                {redeemMode === 'custom' && (
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={customPoints}
                      onChange={handleCustomPointsChange}
                      placeholder={`Min ${MIN_REDEMPTION_POINTS.toLocaleString()} points`}
                      className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#8B1E3F]"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Minimum {MIN_REDEMPTION_POINTS.toLocaleString()} points · Max {(loyaltyInfo?.availablePoints || 0).toLocaleString()} points
                    </p>
                  </div>
                )}

                {loyaltyError && (
                  <p className="text-xs text-red-500">{loyaltyError}</p>
                )}

                {!estimateLoading && loyaltyPointsUsed > 0 && (
                  <p className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2">
                    ✓ {loyaltyPointsUsed.toLocaleString()} points applied — ₦{loyaltyDiscount.toLocaleString()} deducted from your total.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment */}
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 mb-2">Payment</h2>
          <p className="text-sm text-gray-600">
            Method: <span className="font-medium capitalize">
              {cart.paymentMethod === 'online' ? 'Online (Paystack)' : 'Pay on Delivery'}
            </span>
          </p>

          {cart.paymentMethod === 'online' && !estimateLoading && (
            <p className="text-xs text-gray-500 mt-1">
              {hasSplitEligibleSeller
                ? '⚡ Verified sellers on this order are paid instantly via secure split payment.'
                : 'Funds are held securely and settled to the seller after delivery is confirmed.'}
            </p>
          )}

          <div className="mt-3 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{cartTotal.toLocaleString()}</span>
            </div>

            {cart.fulfillmentType === 'delivery' && (
              <div className="flex justify-between text-gray-600">
                <span>Delivery fee</span>
                <span>
                  {estimateLoading ? 'Calculating...' : `₦${transportFee.toLocaleString()}`}
                </span>
              </div>
            )}

            {loyaltyDiscount > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Loyalty points applied</span>
                <span>−₦{loyaltyDiscount.toLocaleString()}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2 mt-2">
              <span>Total</span>
              <span>
                {estimateLoading ? '...' : `₦${finalTotal.toLocaleString()}`}
              </span>
            </div>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 rounded-xl p-3 text-sm">{error}</div>}

        <button
          onClick={handleCheckout}
          disabled={loading || estimateLoading}
          className="w-full bg-[#8B1E3F] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#7a1a37] disabled:opacity-50"
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