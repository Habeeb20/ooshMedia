// import { useEffect, useState } from 'react';
// import { rentalApi } from '../../api/rentalApi';

// import EarningsChart from '../EarningsCharts';
// import StatCard from '../StatCard';


// function monthKey(date) {
//   return new Date(date).toLocaleString('en-US', { month: 'short' });
// }

// function lastNMonths(n) {
//   const months = [];
//   const now = new Date();
//   for (let i = n - 1; i >= 0; i--) {
//     const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
//     months.push(d.toLocaleString('en-US', { month: 'short' }));
//   }
//   return months;
// }


// export default function DashboardOverview() {
//   const [ownerBookings, setOwnerBookings] = useState([]);
//   const [renterBookings, setRenterBookings] = useState([]);
//   const [items, setItems] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     Promise.all([rentalApi.getMyBookingsAsOwner(), rentalApi.getMyBookingsAsRenter(), rentalApi.getMyItems()])
//       .then(([owner, renter, myItems]) => {
//         setOwnerBookings(owner.bookings || []);
//         setRenterBookings(renter.bookings || []);
//         setItems(myItems.items || []);
//       })
//       .finally(() => setLoading(false));
//   }, []);

//   if (loading) {
//     return (
//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         {Array.from({ length: 4 }).map((_, i) => (
//           <div key={i} className="h-24 rounded-xl bg-[#F3E4E8] animate-pulse" />
//         ))}
//       </div>
//     );
//   }

//   const paidOwnerBookings = ownerBookings.filter((b) => b.payment?.status === 'paid');
//   const totalEarnings = paidOwnerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
//   const activeAsOwner = ownerBookings.filter((b) => ['confirmed', 'item_collected'].includes(b.status)).length;
//   const activeAsRenter = renterBookings.filter((b) => ['confirmed', 'item_collected'].includes(b.status)).length;
//   const avgRating = items.length
//     ? (items.reduce((sum, it) => sum + (it.ratingAverage || 0), 0) / items.filter((it) => it.ratingCount > 0).length || 0).toFixed(1)
//     : '—';

//   const months = lastNMonths(6);
//   const chartData = months.map((label) => ({
//     label,
//     value: paidOwnerBookings
//       .filter((b) => monthKey(b.payment?.paidAt || b.createdAt) === label)
//       .reduce((sum, b) => sum + b.totalAmount, 0),
//   }));

//   return (
//     <div className="space-y-6">
//       <div>
//         <h1 className="font-serif text-2xl text-[#221B1D]">Overview</h1>
//         <p className="text-[#6B6067] mt-1">Your rental activity at a glance.</p>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//         <StatCard label="Total earnings" value={`₦${totalEarnings.toLocaleString()}`} accent sublabel="From confirmed bookings" />
//         <StatCard label="Items listed" value={items.length} sublabel="Currently active listings" />
//         <StatCard label="Bookings on your items" value={activeAsOwner} sublabel="Confirmed or ongoing" />
//         <StatCard label="Your active rentals" value={activeAsRenter} sublabel="As a renter" />
//       </div>

//       <EarningsChart data={chartData} />

//       <div className="rounded-xl border border-[#E7DEE1] bg-white p-5">
//         <p className="text-sm font-medium text-[#221B1D] mb-1">Average rating</p>
//         <p className="text-2xl font-semibold text-[#B8902E]">{avgRating !== '0.0' ? `${avgRating} ★` : 'No reviews yet'}</p>
//       </div>
//     </div>
//   );
// }







import { useEffect, useState } from 'react';
import { rentalApi } from '../../api/rentalApi';

import EarningsChart from '../EarningsCharts';
import StatCard from '../StatCard';

function monthKey(date) {
  return new Date(date).toLocaleString('en-US', { month: 'short' });
}

function lastNMonths(n) {
  const months = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString('en-US', { month: 'short' }));
  }
  return months;
}

// Status groupings shared across both owner and renter breakdowns
const STATUS_GROUPS = {
  pending: ['pending_payment'],
  active: ['confirmed', 'item_collected'],
  awaitingReturn: ['return_requested'],
  completed: ['completed'],
  cancelled: ['cancelled'],
};
const countByStatus = (bookings, statuses) => bookings.filter((b) => statuses.includes(b.status)).length;


const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IconWallet = (p) => (<svg {...base} {...p}><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5" /><path d="M16 12h.01" /><path d="M3 8h13a2 2 0 0 1 2 2v2" /></svg>);
export const IconBox = (p) => (<svg {...base} {...p}><path d="M21 8L12 3 3 8l9 5 9-5Z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></svg>);
export const IconStar = (p) => (<svg {...base} {...p}><path d="M12 2l2.9 6.4 6.9.6-5.2 4.8 1.6 6.9L12 17l-6.2 3.7 1.6-6.9-5.2-4.8 6.9-.6L12 2Z" /></svg>);
export const IconClock = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>);
export const IconCheck = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5" /></svg>);
export const IconRefresh = (p) => (<svg {...base} {...p}><path d="M21 12a9 9 0 1 1-2.6-6.4" /><path d="M21 3v6h-6" /></svg>);
export const IconX = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></svg>);
export const IconHome = (p) => (<svg {...base} {...p}><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></svg>);

export default function DashboardOverview() {
  const [ownerBookings, setOwnerBookings] = useState([]);
  const [renterBookings, setRenterBookings] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([rentalApi.getMyBookingsAsOwner(), rentalApi.getMyBookingsAsRenter(), rentalApi.getMyItems()])
      .then(([owner, renter, myItems]) => {
        setOwnerBookings(owner.bookings || []);
        setRenterBookings(renter.bookings || []);
        setItems(myItems.items || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-[#F3E4E8] animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={`o${i}`} className="h-24 rounded-2xl bg-[#F3E4E8] animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const paidOwnerBookings = ownerBookings.filter((b) => b.payment?.status === 'paid');
  const paidRenterBookings = renterBookings.filter((b) => b.payment?.status === 'paid');

  const totalEarnings = paidOwnerBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSpent = paidRenterBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const avgRating = items.filter((it) => it.ratingCount > 0).length
    ? (
        items.reduce((sum, it) => sum + (it.ratingAverage || 0), 0) /
        items.filter((it) => it.ratingCount > 0).length
      ).toFixed(1)
    : null;

  const months = lastNMonths(6);
  const chartData = months.map((label) => ({
    label,
    value: paidOwnerBookings
      .filter((b) => monthKey(b.payment?.paidAt || b.createdAt) === label)
      .reduce((sum, b) => sum + b.totalAmount, 0),
  }));

  // Owner-side breakdown — bookings made against items I own
  const ownerStats = {
    pending: countByStatus(ownerBookings, STATUS_GROUPS.pending),
    active: countByStatus(ownerBookings, STATUS_GROUPS.active),
    awaitingReturn: countByStatus(ownerBookings, STATUS_GROUPS.awaitingReturn),
    completed: countByStatus(ownerBookings, STATUS_GROUPS.completed),
    cancelled: countByStatus(ownerBookings, STATUS_GROUPS.cancelled),
  };

  // Renter-side breakdown — items I've booked from others
  const renterStats = {
    pending: countByStatus(renterBookings, STATUS_GROUPS.pending),
    active: countByStatus(renterBookings, STATUS_GROUPS.active),
    awaitingReturn: countByStatus(renterBookings, STATUS_GROUPS.awaitingReturn),
    completed: countByStatus(renterBookings, STATUS_GROUPS.completed),
    cancelled: countByStatus(renterBookings, STATUS_GROUPS.cancelled),
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl text-[#221B1D]">Overview</h1>
        <p className="text-[#6B6067] mt-1">Your rental activity at a glance.</p>
      </div>

      {/* Headline row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          tone="wine"
          icon={<IconWallet />}
          label="Total earnings"
          value={`₦${totalEarnings.toLocaleString()}`}
          sublabel="From confirmed bookings"
        />
        <StatCard
          icon={<IconBox />}
          label="Items listed"
          value={items.length}
          sublabel="Currently active listings"
        />
        <StatCard
          tone="gold"
          icon={<IconStar />}
          label="Average rating"
          value={avgRating ? `${avgRating} ★` : '—'}
          sublabel={avgRating ? 'Across reviewed items' : 'No reviews yet'}
        />
        <StatCard
          icon={<IconHome />}
          label="Total spent"
          value={`₦${totalSpent.toLocaleString()}`}
          sublabel="As a renter"
        />
      </div>

      {/* Owner-side breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-[#221B1D] mb-3">Bookings on your items</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<IconClock />} tone="amber" label="Pending payment" value={ownerStats.pending} />
          <StatCard icon={<IconRefresh />} tone="green" label="In progress" value={ownerStats.active} sublabel="Confirmed or collected" />
          <StatCard icon={<IconClock />} tone="amber" label="Awaiting return" value={ownerStats.awaitingReturn} />
          <StatCard icon={<IconCheck />} label="Completed" value={ownerStats.completed} />
          <StatCard icon={<IconX />} label="Cancelled" value={ownerStats.cancelled} />
        </div>
      </div>

      {/* Renter-side breakdown */}
      <div>
        <h2 className="text-sm font-semibold text-[#221B1D] mb-3">Your rentals from others</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={<IconClock />} tone="amber" label="Pending payment" value={renterStats.pending} />
          <StatCard icon={<IconRefresh />} tone="green" label="In progress" value={renterStats.active} sublabel="Confirmed or collected" />
          <StatCard icon={<IconClock />} tone="amber" label="Awaiting return" value={renterStats.awaitingReturn} />
          <StatCard icon={<IconCheck />} label="Completed" value={renterStats.completed} />
          <StatCard icon={<IconX />} label="Cancelled" value={renterStats.cancelled} />
        </div>
      </div>

      <EarningsChart data={chartData} />
    </div>
  );
}