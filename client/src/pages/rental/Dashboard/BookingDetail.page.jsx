// import { useState } from 'react';
// import BookingStatusTracker from '../components/BookingstatusTracker';
// import ExtendRentalModal from '../components/ExtendRentalModal';
// import ReviewForm from '../components/ReviewForm';


// // role: 'renter' | 'owner' — decides which actions/labels this viewer sees
// export default function BookingDetailPage({ booking, role, onBack }) {
//   const [showExtend, setShowExtend] = useState(false);
//   const [reviewed, setReviewed] = useState(false);
//   const item = booking.item;

//   return (
//     <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
//       <button onClick={onBack} className="text-sm text-[#6B6067] hover:text-[#221B1D]">
//         ← Back
//       </button>

//       <div className="rounded-xl border border-[#E7DEE1] bg-white p-5 flex gap-4">
//         {item?.images?.[0] && (
//           <img src={item.images[0].url} alt={item.title} className="w-24 h-24 rounded-lg object-cover shrink-0" />
//         )}
//         <div>
//           <h1 className="font-serif text-xl text-[#221B1D]">{item?.title}</h1>
//           <p className="text-sm text-[#6B6067] mt-1">
//             {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
//           </p>
//           <p className="text-sm text-[#6B6067]">
//             {booking.pickupOption === 'delivery'
//               ? `Delivery to ${booking.deliveryAddress?.area}, ${booking.deliveryAddress?.city}`
//               : 'Self pickup'}
//           </p>
//           <p className="mt-2 font-semibold text-[#8B1E3F]">
//             ₦{booking.totalAmount.toLocaleString()}
//             <span className="text-xs font-normal text-[#6B6067]"> total</span>
//           </p>
//         </div>
//       </div>

//       <BookingStatusTracker booking={booking} viewerRole={role} />

//       {role === 'renter' && ['confirmed', 'item_collected'].includes(booking.status) && (
//         <button
//           onClick={() => setShowExtend(true)}
//           className="w-full rounded-lg border border-[#8B1E3F] text-[#8B1E3F] font-medium py-2.5 hover:bg-[#F3E4E8]"
//         >
//           Extend this rental
//         </button>
//       )}

//       {booking.status === 'completed' && !reviewed && (
//         <ReviewForm
//           bookingId={booking._id}
//           revieweeLabel={role === 'renter' ? 'the owner' : 'the renter'}
//           onSubmitted={() => setReviewed(true)}
//         />
//       )}

//       {showExtend && <ExtendRentalModal booking={booking} onClose={() => setShowExtend(false)} />}
//     </div>
//   );
// }









import { useState } from 'react';
import BookingStatusTracker from '../components/BookingstatusTracker';
import ExtendRentalModal from '../components/ExtendRentalModal';
import ReviewForm from '../components/ReviewForm';
import ChatPanel from '../components/ChatPanel';


const CHATTABLE_STATUSES = ['confirmed', 'item_collected', 'return_requested', 'completed'];

// role: 'renter' | 'owner' — decides which actions/labels this viewer sees
// currentUserId: the logged-in viewer's id — needed so ChatPanel can tell
//   "my" messages from "theirs"; pull it from wherever you already keep the
//   authenticated user (context/hook/redux) at the call site.
// socket: your shared socket.io-client instance, for live message delivery.
//   Chat still works without it (send + refetch), it just won't get pushes.
export default function BookingDetailPage({ booking, role, currentUserId, socket, onBack }) {
  const [showExtend, setShowExtend] = useState(false);
  const [reviewed, setReviewed] = useState(false);
  const item = booking.item;

  const chatEnabled = CHATTABLE_STATUSES.includes(booking.status);
  const otherPartyName = role === 'renter'
    ? (item?.owner?.firstName || 'the host')
    : (booking.renter?.firstName || 'the renter');

  return (
    <div className="max-w-2xl mx-auto px-5 py-8 space-y-6">
      <button onClick={onBack} className="text-sm text-[#6B6067] hover:text-[#221B1D]">
        ← Back
      </button>

      <div className="rounded-xl border border-[#E7DEE1] bg-white p-5 flex gap-4">
        {item?.images?.[0] && (
          <img src={item.images[0].url} alt={item.title} className="w-24 h-24 rounded-lg object-cover shrink-0" />
        )}
        <div>
          <h1 className="font-serif text-xl text-[#221B1D]">{item?.title}</h1>
          <p className="text-sm text-[#6B6067] mt-1">
            {new Date(booking.startDate).toLocaleDateString()} – {new Date(booking.endDate).toLocaleDateString()}
          </p>
          <p className="text-sm text-[#6B6067]">
            {booking.pickupOption === 'delivery'
              ? `Delivery to ${booking.deliveryAddress?.area}, ${booking.deliveryAddress?.city}`
              : 'Self pickup'}
          </p>
          <p className="mt-2 font-semibold text-[#8B1E3F]">
            ₦{booking.totalAmount.toLocaleString()}
            <span className="text-xs font-normal text-[#6B6067]"> total</span>
          </p>
        </div>
      </div>

      <BookingStatusTracker booking={booking} viewerRole={role} />

      {role === 'renter' && ['confirmed', 'item_collected'].includes(booking.status) && (
        <button
          onClick={() => setShowExtend(true)}
          className="w-full rounded-lg border border-[#8B1E3F] text-[#8B1E3F] font-medium py-2.5 hover:bg-[#F3E4E8]"
        >
          Extend this rental
        </button>
      )}

      {/* Chat opens once payment is confirmed and stays open through pickup,
          return, and after completion for any post-rental follow-up. */}
      <ChatPanel
        bookingId={booking._id}
        currentUserId={currentUserId}
        socket={socket}
        otherPartyName={otherPartyName}
        disabled={!chatEnabled}
      />

      {booking.status === 'completed' && !reviewed && (
        <ReviewForm
          bookingId={booking._id}
          revieweeLabel={role === 'renter' ? 'the owner' : 'the renter'}
          onSubmitted={() => setReviewed(true)}
        />
      )}

      {showExtend && <ExtendRentalModal booking={booking} onClose={() => setShowExtend(false)} />}
    </div>
  );
}