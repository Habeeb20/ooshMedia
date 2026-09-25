import { useEffect, useState } from 'react';
import { rentalApi } from '../../api/rentalApi';
import BookingDetailPage from '../BookingDetail.page';

const STATUS_LABEL = {
  pending_payment: 'Awaiting payment',
  confirmed: 'Confirmed',
  item_collected: 'Collected',
  return_requested: 'Return requested',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

const STATUS_COLOR = {
  pending_payment: 'text-[#9A6B12]',
  confirmed: 'text-[#8B1E3F]',
  item_collected: 'text-[#8B1E3F]',
  return_requested: 'text-[#9A6B12]',
  completed: 'text-[#2F6846]',
  cancelled: 'text-[#B3261E]',
};

export default function RenterBookingsPanel() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    rentalApi
      .getMyBookingsAsRenter()
      .then((res) => setBookings(res.bookings || []))
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return <BookingDetailPage booking={selected} role="renter" onBack={() => setSelected(null)} />;
  }

  return (
    <div>
      <h1 className="font-serif text-2xl text-[#221B1D] mb-1">My bookings</h1>
      <p className="text-[#6B6067] mb-6">Things you've rented from other people.</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[#F3E4E8] animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E7DEE1] rounded-xl">
          <p className="text-[#221B1D] font-medium">No bookings yet</p>
          <p className="text-sm text-[#6B6067] mt-1">Items you rent will show up here.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <button
              key={b._id}
              onClick={() => setSelected(b)}
              className="w-full flex items-center gap-4 rounded-xl border border-[#E7DEE1] bg-white p-4 text-left hover:border-[#8B1E3F] transition-colors"
            >
              {b.item?.images?.[0] && (
                <img src={b.item.images[0].url} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[#221B1D] truncate">{b.item?.title}</p>
                <p className="text-sm text-[#6B6067]">
                  {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="font-medium text-[#221B1D]">₦{b.totalAmount.toLocaleString()}</p>
                <p className={`text-xs font-medium ${STATUS_COLOR[b.status]}`}>{STATUS_LABEL[b.status]}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}