import { useState } from 'react';
import { Flag } from 'lucide-react';
import { SOCKET_EVENTS, useSocketEvent } from '../utils/useSocket';
import ReportSellerModal from '../../vendor/ReportSellerModal';
import { rentalApi } from '../api/rentalApi';
import RentalReportModal from './RentalReportModal';
const STEPS = ['confirmed', 'item_collected', 'return_requested', 'completed'];
const STEP_LABEL = {
  confirmed: 'Confirmed',
  item_collected: 'Item collected',
  return_requested: 'Return requested',
  completed: 'Completed',
};

export default function BookingStatusTracker({ booking: initialBooking, viewerRole }) {
  const [booking, setBooking] = useState(initialBooking);
  console.log(booking)
  const [busy, setBusy] = useState(false);
  const isOwner = viewerRole === 'owner';
  const isRenter = viewerRole === 'renter';
  const [showReportModal, setShowReportModal] = useState(false);
  const refresh = (patch) => setBooking((b) => ({ ...b, ...patch }));
  const [toast, setToast] = useState(null);
  useSocketEvent(SOCKET_EVENTS.ITEM_COLLECTED, (p) => p.bookingId === booking._id && refresh({ status: 'item_collected' }));
  useSocketEvent(SOCKET_EVENTS.RETURN_REQUESTED, (p) => p.bookingId === booking._id && refresh({ status: 'return_requested' }));
  useSocketEvent(SOCKET_EVENTS.RENTAL_COMPLETED, (p) => p.bookingId === booking._id && refresh({ status: 'completed' }));
  useSocketEvent(SOCKET_EVENTS.BOOKING_CANCELLED, (p) => p.bookingId === booking._id && refresh({ status: 'cancelled' }));

  const currentIndex = STEPS.indexOf(booking.status);

    const showToast = (message, type = "success") => setToast({ message, type });

  const act = async (fn) => {
    setBusy(true);
    try {
      const res = await fn();
      setBooking(res.booking);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-xl border border-[#E7DEE1] bg-white p-5">
      {booking.status === 'cancelled' ? (
        <p className="text-sm font-medium text-[#B3261E]">This booking was cancelled.</p>
      ) : (
        <>
          <ol className="flex items-center">
            {STEPS.map((step, i) => (
              <li key={step} className="flex-1 flex items-center last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                      i <= currentIndex ? 'bg-[#8B1E3F] text-white' : 'bg-[#F3E4E8] text-[#8B1E3F]'
                    }`}
                  >
                    {i < currentIndex ? '✓' : i + 1}
                  </div>
                  <span className="text-[11px] text-[#6B6067] text-center w-16">{STEP_LABEL[step]}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 ${i < currentIndex ? 'bg-[#8B1E3F]' : 'bg-[#E7DEE1]'}`} />
                )}
              </li>
            ))}
          </ol>

          <div className="mt-6 flex justify-center">
            {isRenter && booking.status === 'confirmed' && (
              <button
                disabled={busy}
                onClick={() => act(() => rentalApi.markCollected(booking._id))}
                className="rounded-lg bg-[#8B1E3F] text-white font-medium px-4 py-2.5 hover:bg-[#5E1329] disabled:opacity-40"
              >
                I've received the item
              </button>
            )}
            {isRenter && booking.status === 'item_collected' && (
              <button
                disabled={busy}
                onClick={() => act(() => rentalApi.markReturned(booking._id))}
                className="rounded-lg border border-[#8B1E3F] text-[#8B1E3F] font-medium px-4 py-2.5 hover:bg-[#F3E4E8] disabled:opacity-40"
              >
                I've returned the item
              </button>
            )}
            {isOwner && booking.status === 'item_collected' && (
              <button
                disabled={busy}
                onClick={() => act(() => rentalApi.markReturned(booking._id))}
                className="rounded-lg border border-[#8B1E3F] text-[#8B1E3F] font-medium px-4 py-2.5 hover:bg-[#F3E4E8] disabled:opacity-40"
              >
                Mark item returned
              </button>
            )}
            {isOwner && booking.status === 'return_requested' && (
              <button
                disabled={busy}
                onClick={() => act(() => rentalApi.confirmReturn(booking._id))}
                className="rounded-lg bg-[#8B1E3F] text-white font-medium px-4 py-2.5 hover:bg-[#5E1329] disabled:opacity-40"
              >
                Confirm return received
              </button>
            )}
            {booking.status === 'completed' && (
              <p className="text-sm font-medium text-[#2F6846]">Rental completed.</p>
            )}
          </div>


                       <button
      onClick={() => {
      
        setShowReportModal(true);
      }}
      className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold text-red-500 border border-red-200 hover:bg-red-50 transition"
    >
      <Flag size={14} />
      Report this user
    </button>


    <RentalReportModal
      open={showReportModal}
      onClose={() => setShowReportModal(false)}
      sellerId={booking?.owner  || booking?.renter}
      sellerName={booking?.owner?.firstName|| booking?.owner?.firstName}
      productId={booking?._id}
      showToast={showToast}
    />
    
        </>
      )}

    </div>
  );
}