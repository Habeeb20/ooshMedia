import { useEffect, useState } from 'react';
import adminRentalApi from '../../config/adminRentalApi';
import DetailTree from './adminRentalDetailTree';


const WINE = '#8B1E3F';

function formatMoney(amount) {
  return `₦${Number(amount || 0).toLocaleString()}`;
}

function StatCard({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E7DEE1] bg-white p-4">
      <p className="text-xs text-[#6B6067]">{label}</p>
      <p className="text-xl font-semibold text-[#221B1D] mt-1">{value}</p>
    </div>
  );
}

function StatusPill({ status }) {
  return (
    <span
      className="text-xs font-medium px-2 py-0.5 rounded-full border"
      style={{ color: WINE, borderColor: `${WINE}33`, backgroundColor: `${WINE}0D` }}
    >
      {status}
    </span>
  );
}

// Slide-over panel showing the FULL document via DetailTree — no field is
// ever hand-picked/left out here, which is the point of using a recursive
// renderer instead of a bespoke layout per schema.
function DetailDrawer({ title, data, onClose, extra }) {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white h-full overflow-y-auto shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl text-[#221B1D]">{title}</h2>
          <button onClick={onClose} className="text-[#6B6067] hover:text-[#221B1D]">✕</button>
        </div>
        {extra}
        <DetailTree data={data} />
      </div>
    </div>
  );
}

export default function AdminRentalsPage() {
  const [tab, setTab] = useState('items'); // 'items' | 'bookings'
  const [stats, setStats] = useState(null);

  const [items, setItems] = useState([]);
  const [itemsTotal, setItemsTotal] = useState(0);
  const [itemPage, setItemPage] = useState(1);
  const [itemStatusFilter, setItemStatusFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemBookings, setSelectedItemBookings] = useState([]);

  const [bookings, setBookings] = useState([]);
  const [bookingsTotal, setBookingsTotal] = useState(0);
  const [bookingPage, setBookingPage] = useState(1);
  const [bookingStatusFilter, setBookingStatusFilter] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => { adminRentalApi.getStats().then(setStats); }, []);

  useEffect(() => {
    if (tab !== 'items') return;
    setLoading(true);
    adminRentalApi
      .getItems({ page: itemPage, limit: 20, status: itemStatusFilter || undefined })
      .then((res) => { setItems(res.items); setItemsTotal(res.total); })
      .finally(() => setLoading(false));
  }, [tab, itemPage, itemStatusFilter]);

  useEffect(() => {
    if (tab !== 'bookings') return;
    setLoading(true);
    adminRentalApi
      .getBookings({ page: bookingPage, limit: 20, status: bookingStatusFilter || undefined })
      .then((res) => { setBookings(res.bookings); setBookingsTotal(res.total); })
      .finally(() => setLoading(false));
  }, [tab, bookingPage, bookingStatusFilter]);

  const openItem = (id) => {
    adminRentalApi.getItem(id).then((res) => {
      setSelectedItem(res.item);
      setSelectedItemBookings(res.bookings || []);
    });
  };
  const openBooking = (id) => {
    adminRentalApi.getBooking(id).then((res) => setSelectedBooking(res.booking));
  };

  return (
    <div className="bg-[#FBF4F6] min-h-screen">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-8">
        <h1 className="font-serif text-2xl sm:text-3xl text-[#221B1D] mb-1">Rentals &amp; Bookings</h1>
        <p className="text-[#6B6067] mb-6">Platform-wide view — every listing and every booking, in full detail.</p>

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
            <StatCard label="Total listings" value={stats.totalItems} />
            <StatCard label="Total bookings" value={stats.totalBookings} />
            <StatCard label="Revenue collected" value={formatMoney(stats.revenue.totalRevenue)} />
            <StatCard label="Delivery fees collected" value={formatMoney(stats.revenue.totalDeliveryFees)} />
          </div>
        )}

        <div className="flex gap-2 mb-6">
          {['items', 'bookings'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium border ${
                tab === t ? 'bg-[#8B1E3F] border-[#8B1E3F] text-white' : 'bg-white border-[#E7DEE1] text-[#221B1D]'
              }`}
            >
              {t === 'items' ? 'Listings' : 'Bookings'}
            </button>
          ))}
        </div>

        {tab === 'items' && (
          <>
            <div className="flex gap-2 mb-3">
              <select
                value={itemStatusFilter}
                onChange={(e) => { setItemStatusFilter(e.target.value); setItemPage(1); }}
                className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {['active', 'paused', 'unavailable', 'maintenance'].map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="rounded-xl border border-[#E7DEE1] bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F9F0F2] text-[#6B6067] text-left">
                  <tr>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Owner</th>
                    <th className="px-4 py-2">Rate</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Views / Likes</th>
                    <th className="px-4 py-2">Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item._id} onClick={() => openItem(item._id)} className="border-t border-[#F3E4E8] hover:bg-[#FBF4F6] cursor-pointer">
                      <td className="px-4 py-2 font-medium text-[#221B1D]">{item.title}</td>
                      <td className="px-4 py-2 text-[#6B6067]">{item.owner?.firstName} {item.owner?.lastName}</td>
                      <td className="px-4 py-2">{formatMoney(item.rate?.amount)}/{item.rate?.unit}</td>
                      <td className="px-4 py-2"><StatusPill status={item.status} /></td>
                      <td className="px-4 py-2 text-[#6B6067]">{item.views} / {item.likes}</td>
                      <td className="px-4 py-2 text-[#6B6067]">{item.totalBookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-[#6B6067]">
              <span>{itemsTotal} listing(s)</span>
              <div className="flex gap-2">
                <button disabled={itemPage <= 1} onClick={() => setItemPage((p) => p - 1)} className="px-3 py-1 rounded border border-[#E7DEE1] disabled:opacity-40">Prev</button>
                <button disabled={itemPage * 20 >= itemsTotal} onClick={() => setItemPage((p) => p + 1)} className="px-3 py-1 rounded border border-[#E7DEE1] disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}

        {tab === 'bookings' && (
          <>
            <div className="flex gap-2 mb-3">
              <select
                value={bookingStatusFilter}
                onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingPage(1); }}
                className="border border-[#E7DEE1] rounded-lg px-3 py-2 text-sm"
              >
                <option value="">All statuses</option>
                {['pending_payment', 'confirmed', 'item_collected', 'return_requested', 'completed', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-[#E7DEE1] bg-white overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-[#F9F0F2] text-[#6B6067] text-left">
                  <tr>
                    <th className="px-4 py-2">Item</th>
                    <th className="px-4 py-2">Renter</th>
                    <th className="px-4 py-2">Owner</th>
                    <th className="px-4 py-2">Dates</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => (
                    <tr key={b._id} onClick={() => openBooking(b._id)} className="border-t border-[#F3E4E8] hover:bg-[#FBF4F6] cursor-pointer">
                      <td className="px-4 py-2 font-medium text-[#221B1D]">{b.item?.title}</td>
                      <td className="px-4 py-2 text-[#6B6067]">{b.renter?.firstName} {b.renter?.lastName}</td>
                      <td className="px-4 py-2 text-[#6B6067]">{b.owner?.firstName} {b.owner?.lastName}</td>
                      <td className="px-4 py-2 text-[#6B6067]">
                        {new Date(b.startDate).toLocaleDateString()} – {new Date(b.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2">{formatMoney(b.totalAmount)}</td>
                      <td className="px-4 py-2"><StatusPill status={b.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center mt-4 text-sm text-[#6B6067]">
              <span>{bookingsTotal} booking(s)</span>
              <div className="flex gap-2">
                <button disabled={bookingPage <= 1} onClick={() => setBookingPage((p) => p - 1)} className="px-3 py-1 rounded border border-[#E7DEE1] disabled:opacity-40">Prev</button>
                <button disabled={bookingPage * 20 >= bookingsTotal} onClick={() => setBookingPage((p) => p + 1)} className="px-3 py-1 rounded border border-[#E7DEE1] disabled:opacity-40">Next</button>
              </div>
            </div>
          </>
        )}
      </div>

      {selectedItem && (
        <DetailDrawer
          title={selectedItem.title}
          data={selectedItem}
          onClose={() => { setSelectedItem(null); setSelectedItemBookings([]); }}
          extra={
            selectedItemBookings.length > 0 && (
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#8B1E3F] mb-2">
                  {selectedItemBookings.length} booking(s) against this item
                </p>
                <div className="space-y-2">
                  {selectedItemBookings.map((b) => (
                    <button
                      key={b._id}
                      onClick={() => { setSelectedItem(null); openBooking(b._id); }}
                      className="w-full text-left text-sm rounded-lg border border-[#F3E4E8] px-3 py-2 hover:border-[#8B1E3F] flex justify-between"
                    >
                      <span>{b.renter?.firstName} {b.renter?.lastName} · {new Date(b.startDate).toLocaleDateString()}</span>
                      <StatusPill status={b.status} />
                    </button>
                  ))}
                </div>
              </div>
            )
          }
        />
      )}

      {selectedBooking && (
        <DetailDrawer
          title={`Booking · ${selectedBooking.item?.title || ''}`}
          data={selectedBooking}
          onClose={() => setSelectedBooking(null)}
        />
      )}
    </div>
  );
}