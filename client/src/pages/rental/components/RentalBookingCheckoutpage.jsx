// import { useEffect, useMemo, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { rentalApi } from '../api/rentalApi';
// import {toast} from "sonner"
// const WINE = '#8B1E3F';

// function formatMoney(amount) {
//   return `₦${Number(amount || 0).toLocaleString()}`;
// }

// function unitsBetween(start, end, unit) {
//   if (!start || !end) return 0;
//   const ms = new Date(end) - new Date(start);
//   const perUnit = { hour: 3.6e6, day: 8.64e7, week: 6.048e8, month: 2.592e9 }[unit] || 8.64e7;
//   return Math.max(1, Math.ceil(ms / perUnit));
// }

// const NIGERIAN_STATES = [
//   'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
//   'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
//   'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
//   'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
// ];

// export default function RentalBookingCheckoutPage() {
//   const { itemId } = useParams();
//   const navigate = useNavigate();

//   const [item, setItem] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState(null);

//   const [form, setForm] = useState({
//     firstName: '', lastName: '', email: '', phone: '',
//     emergencyContact: '',
//     pickupOption: 'self-pickup',
//     startDate: '', endDate: '', pickupTime: '',
//     deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryLga: '',
//     willDrive: true,
//     licenseNumber: '',
//   });

//   const [deliveryQuote, setDeliveryQuote] = useState(null);
//   const [quoting, setQuoting] = useState(false);

//   useEffect(() => {
//     rentalApi.getItem(itemId).then((res) => setItem(res.item)).finally(() => setLoading(false));
//   }, [itemId]);

//   const units = useMemo(
//     () => unitsBetween(form.startDate, form.endDate, item?.rate?.unit),
//     [form.startDate, form.endDate, item]
//   );
//   const rentAmount = (item?.rate?.amount || 0) * units;
//   const depositAmount = item?.depositAmount || 0;
//   const deliveryFee = form.pickupOption === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
//   const totalDue = rentAmount + depositAmount + deliveryFee;

//   const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target?.value ?? e }));

//   // Debounced live delivery quote whenever delivery is selected and a state is chosen.
//   useEffect(() => {
//     if (form.pickupOption !== 'delivery' || !form.deliveryState) {
//       setDeliveryQuote(null);
//       return;
//     }
//     setQuoting(true);
//     const t = setTimeout(() => {
//       rentalApi
//         .getDeliveryQuote(itemId, form.deliveryState, form.deliveryLga)
//         .then(setDeliveryQuote)
//         .catch(() => setDeliveryQuote(null))
//         .finally(() => setQuoting(false));
//     }, 500);
//     return () => clearTimeout(t);
//   }, [form.pickupOption, form.deliveryState, form.deliveryLga, itemId]);

//   const handleSubmit = async () => {
//     setError(null);
//     if (!form.startDate || !form.endDate || !form.pickupTime) {
//       setError('Please choose your rental dates and a pickup time.');
//       return;
//     }
//     if (form.pickupOption === 'delivery' && (!form.deliveryAddress || !form.deliveryState)) {
//       setError('Please provide a delivery address and state.');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const res = await rentalApi.createBooking(itemId, {
//         startDate: form.startDate,
//         endDate: form.endDate,
//         pickupOption: form.pickupOption,
//         pickupTime: form.pickupTime,
//         deliveryAddress:
//           form.pickupOption === 'delivery'
//             ? {
//                 address: form.deliveryAddress,
//                 city: form.deliveryCity,
//                 area: form.deliveryCity,
//                 state: form.deliveryState,
//                 lga: form.deliveryLga,
//               }
//             : undefined,
//       });
//       if (res.authorizationUrl) {
//         window.location.href = res.authorizationUrl;
//       } else {
//         toast.success("successfully reserved")
//         navigate(`/rentals/bookings/${res.booking._id}`);
//       }
//     } catch (err) {
//       toast.error(err.response.data.message || "could not create this booking")
//       setError(err.response?.data?.message || 'Could not create this booking. Please try again.');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   if (loading) return <div className="max-w-5xl mx-auto px-5 py-16 text-center text-[#6B6067]">Loading…</div>;
//   if (!item) return <div className="max-w-5xl mx-auto px-5 py-16 text-center text-[#6B6067]">Item not found.</div>;

//   return (
//     <div className="bg-[#FBF4F6] min-h-screen">
//       <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
//         <div className="text-sm text-[#6B6067] mb-6">
//           Home · {item.category} · {item.title} · <span className="text-[#8B1E3F] font-medium">Reserve &amp; Escrow Checkout</span>
//         </div>

//         <div className="rounded-xl bg-[#8B1E3F]/5 border border-[#8B1E3F]/20 text-[#8B1E3F] text-sm px-4 py-2.5 mb-6 inline-block">
//           🔒 RENTO ESCROW PROTECTED TRANSACTION
//         </div>

//         <h1 className="font-serif text-2xl sm:text-3xl text-[#221B1D] mb-1">Confirm your reservation &amp; protect your rental</h1>
//         <p className="text-[#6B6067] mb-8">
//           Complete your details to finalize the rental. Your funds stay in Rento Escrow until you inspect the item.
//         </p>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           <div className="lg:col-span-2 space-y-6">
//             {/* Section 1 — Renter info */}
//             <section className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
//               <h2 className="font-semibold text-[#221B1D] mb-4">1. Renter Information &amp; Contact</h2>
//               <div className="grid grid-cols-2 gap-4">
//                 <input placeholder="First Name" value={form.firstName} onChange={set('firstName')}
//                   className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
//                 <input placeholder="Last Name" value={form.lastName} onChange={set('lastName')}
//                   className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
//                 <input placeholder="Email Address" value={form.email} onChange={set('email')}
//                   className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
//                 <input placeholder="Mobile Phone Number" value={form.phone} onChange={set('phone')}
//                   className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
//                 <input placeholder="Emergency / Alternate Contact" value={form.emergencyContact} onChange={set('emergencyContact')}
//                   className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
//               </div>
//             </section>

//             {/* Section 2 — Handover & delivery logistics */}
//             <section className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
//               <h2 className="font-semibold text-[#221B1D] mb-4">2. Handover &amp; Delivery Logistics</h2>
//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <button type="button" onClick={() => setForm((f) => ({ ...f, pickupOption: 'self-pickup' }))}
//                   className={`rounded-lg border px-4 py-3 text-sm text-left ${
//                     form.pickupOption === 'self-pickup' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'
//                   }`}>
//                   <span className="font-medium text-[#221B1D]">Self Pickup</span>
//                   <p className="text-xs text-[#6B6067]">Free — pick up from {item.pickupLocation?.area}, {item.pickupLocation?.city}</p>
//                 </button>
//                 <button type="button" disabled={!item.deliveryAvailable}
//                   onClick={() => setForm((f) => ({ ...f, pickupOption: 'delivery' }))}
//                   className={`rounded-lg border px-4 py-3 text-sm text-left disabled:opacity-40 ${
//                     form.pickupOption === 'delivery' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'
//                   }`}>
//                   <span className="font-medium text-[#221B1D]">Doorstep Delivery</span>
//                   <p className="text-xs text-[#6B6067]">
//                     {item.deliveryAvailable ? 'Fee calculated from distance' : 'Not offered on this item'}
//                   </p>
//                 </button>
//               </div>

//               <div className="grid grid-cols-2 gap-4">
//                 <div>
//                   <label className="text-xs text-[#6B6067]">Start date</label>
//                   <input type="date" value={form.startDate} onChange={set('startDate')}
//                     className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm mt-1" />
//                 </div>
//                 <div>
//                   <label className="text-xs text-[#6B6067]">End date</label>
//                   <input type="date" value={form.endDate} onChange={set('endDate')}
//                     className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm mt-1" />
//                 </div>
//                 <div className="col-span-2">
//                   <label className="text-xs text-[#6B6067]">Pickup / handover time</label>
//                   <input type="datetime-local" value={form.pickupTime} onChange={set('pickupTime')}
//                     className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm mt-1" />
//                 </div>
//               </div>

//               {form.pickupOption === 'delivery' && (
//                 <div className="mt-4 pt-4 border-t border-[#F3E4E8] grid grid-cols-2 gap-4">
//                   <input placeholder="Street Address" value={form.deliveryAddress} onChange={set('deliveryAddress')}
//                     className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
//                   <input placeholder="City / Area" value={form.deliveryCity} onChange={set('deliveryCity')}
//                     className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
//                   <select value={form.deliveryState} onChange={set('deliveryState')}
//                     className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm">
//                     <option value="">State</option>
//                     {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
//                   </select>
//                   <input placeholder="LGA (optional, improves accuracy)" value={form.deliveryLga} onChange={set('deliveryLga')}
//                     className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
//                   <p className="col-span-2 text-xs text-[#6B6067]">
//                     {quoting ? 'Calculating delivery fee…' : deliveryQuote ? `Estimated delivery fee: ${formatMoney(deliveryQuote.fee)} (${deliveryQuote.distanceKm?.toFixed?.(1)} km)` : 'Select a state to see the delivery fee.'}
//                   </p>
//                 </div>
//               )}
//             </section>

//             {/* Section 3 — driver verification (only relevant for vehicle-type rentals, kept generic) */}
//             <section className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
//               <h2 className="font-semibold text-[#221B1D] mb-4">3. Verification &amp; Security</h2>
//               <div className="grid grid-cols-2 gap-3 mb-4">
//                 <button type="button" onClick={() => setForm((f) => ({ ...f, willDrive: true }))}
//                   className={`rounded-lg border px-4 py-3 text-sm text-left ${form.willDrive ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'}`}>
//                   I will operate this myself
//                 </button>
//                 <button type="button" onClick={() => setForm((f) => ({ ...f, willDrive: false }))}
//                   className={`rounded-lg border px-4 py-3 text-sm text-left ${!form.willDrive ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'}`}>
//                   Request an operator/chauffeur
//                 </button>
//               </div>
//               {form.willDrive && (
//                 <input placeholder="License / ID Number" value={form.licenseNumber} onChange={set('licenseNumber')}
//                   className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
//               )}
//               <p className="text-xs text-[#6B6067] mt-3">
//                 By continuing you confirm you're at least 18 and agree to Rento's Peer-to-Peer Mobility Accord.
//               </p>
//             </section>

//             {error && <p className="text-sm text-red-600">{error}</p>}
//           </div>

//           {/* Sidebar summary */}
//           <aside className="lg:sticky lg:top-6 h-fit">
//             <div className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
//               <div className="flex gap-3">
//                 <img src={item.images?.[0]?.url} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
//                 <div>
//                   <p className="font-medium text-[#221B1D] text-sm">{item.title}</p>
//                   <p className="text-xs text-[#6B6067]">{item.ratingAverage?.toFixed(1) || '0.0'}★ ({item.ratingCount} reviews)</p>
//                 </div>
//               </div>

//               <div className="mt-4 pt-4 border-t border-[#F3E4E8] space-y-2 text-sm">
//                 <div className="flex justify-between">
//                   <span className="text-[#6B6067]">{formatMoney(item.rate.amount)} × {units || 0} {item.rate.unit}(s)</span>
//                   <span className="text-[#221B1D]">{formatMoney(rentAmount)}</span>
//                 </div>
//                 {depositAmount > 0 && (
//                   <div className="flex justify-between">
//                     <span className="text-[#6B6067]">Refundable deposit</span>
//                     <span className="text-[#221B1D]">{formatMoney(depositAmount)}</span>
//                   </div>
//                 )}
//                 {form.pickupOption === 'delivery' && (
//                   <div className="flex justify-between">
//                     <span className="text-[#6B6067]">Delivery fee</span>
//                     <span className="text-[#221B1D]">{formatMoney(deliveryFee)}</span>
//                   </div>
//                 )}
//               </div>

//               <div className="mt-4 pt-4 border-t border-[#F3E4E8] flex justify-between items-baseline">
//                 <span className="font-semibold text-[#221B1D]">Total Due Today</span>
//                 <span className="text-xl font-bold" style={{ color: WINE }}>{formatMoney(totalDue)}</span>
//               </div>

//               <button
//                 onClick={handleSubmit}
//                 disabled={submitting}
//                 className="mt-4 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60"
//                 style={{ backgroundColor: WINE }}
//               >
//                 {submitting ? 'Processing…' : 'Continue to Secure Escrow Payment →'}
//               </button>
//               <p className="text-xs text-center text-[#6B6067] mt-2">
//                 No money leaves escrow until your signed digital rental checklist is complete.
//               </p>
//             </div>
//           </aside>
//         </div>
//       </div>
//     </div>
//   );
// }

import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { rentalApi } from '../api/rentalApi';
import { toast } from "sonner"

const WINE = '#8B1E3F';

function formatMoney(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function unitsBetween(start, end, unit) {
  if (!start || !end) return 0;
  const ms = new Date(end) - new Date(start);
  const perUnit = { hour: 3.6e6, day: 8.64e7, week: 6.048e8, month: 2.592e9 }[unit] || 8.64e7;
  return Math.max(1, Math.ceil(ms / perUnit));
}

const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'FCT', 'Gombe', 'Imo',
  'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa',
  'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara',
];

export default function RentalBookingCheckoutPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    emergencyContact: '',
    pickupOption: 'self-pickup',
    startDate: '', endDate: '', pickupTime: '',
    deliveryAddress: '', deliveryCity: '', deliveryState: '', deliveryLga: '',
    willDrive: true,
    licenseNumber: '',
  });

  const [deliveryQuote, setDeliveryQuote] = useState(null);
  const [quoting, setQuoting] = useState(false);

  useEffect(() => {
    rentalApi.getItem(itemId).then((res) => setItem(res.item)).finally(() => setLoading(false));
  }, [itemId]);

  // Handle return-from-Paystack redirect: if a reference is in the URL,
  // this load is the callback, not a fresh checkout — verify instead of
  // showing the booking form again.
  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');
    if (!reference) return;

    setVerifying(true);
    rentalApi
      .verifyBookingPayment(reference)
      .then((res) => {
        if (res.success) {
          toast.success('Payment confirmed — your booking is reserved!');
          navigate(`/rentals/bookings/${res.booking._id}`, { replace: true });
        } else {
          toast.error(res.message || 'Payment could not be verified.');
          navigate(`/rentals/${itemId}`, { replace: true });
        }
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || 'Could not verify payment.');
        navigate(`/rentals/${itemId}`, { replace: true });
      })
      .finally(() => setVerifying(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const units = useMemo(
    () => unitsBetween(form.startDate, form.endDate, item?.rate?.unit),
    [form.startDate, form.endDate, item]
  );
  const rentAmount = (item?.rate?.amount || 0) * units;
  const depositAmount = item?.depositAmount || 0;
  const deliveryFee = form.pickupOption === 'delivery' ? (deliveryQuote?.fee || 0) : 0;
  const totalDue = rentAmount + depositAmount + deliveryFee;

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target?.value ?? e }));

  // Debounced live delivery quote whenever delivery is selected and a state is chosen.
  useEffect(() => {
    if (form.pickupOption !== 'delivery' || !form.deliveryState) {
      setDeliveryQuote(null);
      return;
    }
    setQuoting(true);
    const t = setTimeout(() => {
      rentalApi
        .getDeliveryQuote(itemId, form.deliveryState, form.deliveryLga)
        .then(setDeliveryQuote)
        .catch(() => setDeliveryQuote(null))
        .finally(() => setQuoting(false));
    }, 500);
    return () => clearTimeout(t);
  }, [form.pickupOption, form.deliveryState, form.deliveryLga, itemId]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.startDate || !form.endDate || !form.pickupTime) {
      setError('Please choose your rental dates and a pickup time.');
      return;
    }
    if (form.pickupOption === 'delivery' && (!form.deliveryAddress || !form.deliveryState)) {
      setError('Please provide a delivery address and state.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await rentalApi.createBooking(itemId, {
        startDate: form.startDate,
        endDate: form.endDate,
        pickupOption: form.pickupOption,
        pickupTime: form.pickupTime,
        deliveryAddress:
          form.pickupOption === 'delivery'
            ? {
                address: form.deliveryAddress,
                city: form.deliveryCity,
                area: form.deliveryCity,
                state: form.deliveryState,
                lga: form.deliveryLga,
              }
            : undefined,
      });
      if (res.authorizationUrl) {
        window.location.href = res.authorizationUrl;
      } else {
        toast.success("successfully reserved")
        navigate(`/rentals/bookings/${res.booking._id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "could not create this booking")
      setError(err.response?.data?.message || 'Could not create this booking. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (verifying) {
    return (
      <div className="max-w-5xl mx-auto px-5 py-16 text-center text-[#6B6067]">
        Confirming your payment…
      </div>
    );
  }
  if (loading) return <div className="max-w-5xl mx-auto px-5 py-16 text-center text-[#6B6067]">Loading…</div>;
  if (!item) return <div className="max-w-5xl mx-auto px-5 py-16 text-center text-[#6B6067]">Item not found.</div>;

  return (
    <div className="bg-[#FBF4F6] min-h-screen">
      <div className="max-w-5xl mx-auto px-5 sm:px-8 py-8">
        <div className="text-sm text-[#6B6067] mb-6">
          Home · {item.category} · {item.title} · <span className="text-[#8B1E3F] font-medium">Reserve &amp; Escrow Checkout</span>
        </div>

        <div className="rounded-xl bg-[#8B1E3F]/5 border border-[#8B1E3F]/20 text-[#8B1E3F] text-sm px-4 py-2.5 mb-6 inline-block">
          🔒 RENTO ESCROW PROTECTED TRANSACTION
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl text-[#221B1D] mb-1">Confirm your reservation &amp; protect your rental</h1>
        <p className="text-[#6B6067] mb-8">
          Complete your details to finalize the rental. Your funds stay in Rento Escrow until you inspect the item.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1 — Renter info */}
            <section className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
              <h2 className="font-semibold text-[#221B1D] mb-4">1. Renter Information &amp; Contact</h2>
              <div className="grid grid-cols-2 gap-4">
                <input placeholder="First Name" value={form.firstName} onChange={set('firstName')}
                  className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Last Name" value={form.lastName} onChange={set('lastName')}
                  className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
                <input placeholder="Email Address" value={form.email} onChange={set('email')}
                  className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
                <input placeholder="Mobile Phone Number" value={form.phone} onChange={set('phone')}
                  className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
                <input placeholder="Emergency / Alternate Contact" value={form.emergencyContact} onChange={set('emergencyContact')}
                  className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
              </div>
            </section>

            {/* Section 2 — Handover & delivery logistics */}
            <section className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
              <h2 className="font-semibold text-[#221B1D] mb-4">2. Handover &amp; Delivery Logistics</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button type="button" onClick={() => setForm((f) => ({ ...f, pickupOption: 'self-pickup' }))}
                  className={`rounded-lg border px-4 py-3 text-sm text-left ${
                    form.pickupOption === 'self-pickup' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'
                  }`}>
                  <span className="font-medium text-[#221B1D]">Self Pickup</span>
                  <p className="text-xs text-[#6B6067]">Free — pick up from {item.pickupLocation?.area}, {item.pickupLocation?.city}</p>
                </button>
                <button type="button" disabled={!item.deliveryAvailable}
                  onClick={() => setForm((f) => ({ ...f, pickupOption: 'delivery' }))}
                  className={`rounded-lg border px-4 py-3 text-sm text-left disabled:opacity-40 ${
                    form.pickupOption === 'delivery' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'
                  }`}>
                  <span className="font-medium text-[#221B1D]">Doorstep Delivery</span>
                  <p className="text-xs text-[#6B6067]">
                    {item.deliveryAvailable ? 'Fee calculated from distance' : 'Not offered on this item'}
                  </p>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#6B6067]">Start date</label>
                  <input type="date" value={form.startDate} onChange={set('startDate')}
                    className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div>
                  <label className="text-xs text-[#6B6067]">End date</label>
                  <input type="date" value={form.endDate} onChange={set('endDate')}
                    className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
                <div className="col-span-2">
                  <label className="text-xs text-[#6B6067]">Pickup / handover time</label>
                  <input type="datetime-local" value={form.pickupTime} onChange={set('pickupTime')}
                    className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm mt-1" />
                </div>
              </div>

              {form.pickupOption === 'delivery' && (
                <div className="mt-4 pt-4 border-t border-[#F3E4E8] grid grid-cols-2 gap-4">
                  <input placeholder="Street Address" value={form.deliveryAddress} onChange={set('deliveryAddress')}
                    className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
                  <input placeholder="City / Area" value={form.deliveryCity} onChange={set('deliveryCity')}
                    className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
                  <select value={form.deliveryState} onChange={set('deliveryState')}
                    className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm">
                    <option value="">State</option>
                    {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input placeholder="LGA (optional, improves accuracy)" value={form.deliveryLga} onChange={set('deliveryLga')}
                    className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm col-span-2" />
                  <p className="col-span-2 text-xs text-[#6B6067]">
                    {quoting ? 'Calculating delivery fee…' : deliveryQuote ? `Estimated delivery fee: ${formatMoney(deliveryQuote.fee)} (${deliveryQuote.distanceKm?.toFixed?.(1)} km)` : 'Select a state to see the delivery fee.'}
                  </p>
                </div>
              )}
            </section>

            {/* Section 3 — driver verification (only relevant for vehicle-type rentals, kept generic) */}
            <section className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
              <h2 className="font-semibold text-[#221B1D] mb-4">3. Verification &amp; Security</h2>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button type="button" onClick={() => setForm((f) => ({ ...f, willDrive: true }))}
                  className={`rounded-lg border px-4 py-3 text-sm text-left ${form.willDrive ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'}`}>
                  I will operate this myself
                </button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, willDrive: false }))}
                  className={`rounded-lg border px-4 py-3 text-sm text-left ${!form.willDrive ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-[#E7DEE1]'}`}>
                  Request an operator/chauffeur
                </button>
              </div>
              {form.willDrive && (
                <input placeholder="License / ID Number" value={form.licenseNumber} onChange={set('licenseNumber')}
                  className="w-full border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm" />
              )}
              <p className="text-xs text-[#6B6067] mt-3">
                By continuing you confirm you're at least 18 and agree to Rento's Peer-to-Peer Mobility Accord.
              </p>
            </section>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          {/* Sidebar summary */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
              <div className="flex gap-3">
                <img src={item.images?.[0]?.url} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <p className="font-medium text-[#221B1D] text-sm">{item.title}</p>
                  <p className="text-xs text-[#6B6067]">{item.ratingAverage?.toFixed(1) || '0.0'}★ ({item.ratingCount} reviews)</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-[#F3E4E8] space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#6B6067]">{formatMoney(item.rate.amount)} × {units || 0} {item.rate.unit}(s)</span>
                  <span className="text-[#221B1D]">{formatMoney(rentAmount)}</span>
                </div>
                {depositAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6067]">Refundable deposit</span>
                    <span className="text-[#221B1D]">{formatMoney(depositAmount)}</span>
                  </div>
                )}
                {form.pickupOption === 'delivery' && (
                  <div className="flex justify-between">
                    <span className="text-[#6B6067]">Delivery fee</span>
                    <span className="text-[#221B1D]">{formatMoney(deliveryFee)}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-[#F3E4E8] flex justify-between items-baseline">
                <span className="font-semibold text-[#221B1D]">Total Due Today</span>
                <span className="text-xl font-bold" style={{ color: WINE }}>{formatMoney(totalDue)}</span>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="mt-4 w-full rounded-xl py-3 font-semibold text-white disabled:opacity-60"
                style={{ backgroundColor: WINE }}
              >
                {submitting ? 'Processing…' : 'Continue to Secure Escrow Payment →'}
              </button>
              <p className="text-xs text-center text-[#6B6067] mt-2">
                No money leaves escrow until your signed digital rental checklist is complete.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}