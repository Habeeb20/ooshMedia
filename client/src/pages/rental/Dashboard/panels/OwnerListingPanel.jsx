import { useEffect, useState } from 'react';
import { rentalApi } from '../../api/rentalApi';


const UNIT_LABEL = { hour: '/hr', day: '/day', week: '/wk', month: '/mo' };
const STATUS_COLOR = {
  active: 'text-[#2F6846] bg-[#EAF3ED]',
  paused: 'text-[#9A6B12] bg-[#FBF2E0]',
  unavailable: 'text-[#B3261E] bg-[#FBEAE9]',
  maintenance: 'text-[#6B6067] bg-[#FAF6F7]',
};

export default function OwnerListingsPanel({ onCreateNew }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    rentalApi
      .getMyItems()
      .then((res) => setItems(res.items || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-2xl text-[#221B1D] mb-1">My listings</h1>
          <p className="text-[#6B6067]">Items you've put up for rent.</p>
        </div>
        <button
          onClick={onCreateNew}
          className="rounded-lg bg-[#8B1E3F] text-white font-medium px-4 py-2.5 hover:bg-[#5E1329] transition-colors"
        >
          + New listing
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[4/3] rounded-xl bg-[#F3E4E8] animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-[#E7DEE1] rounded-xl">
          <p className="text-[#221B1D] font-medium">You haven't listed anything yet</p>
          <p className="text-sm text-[#6B6067] mt-1 mb-4">List your first item to start earning.</p>
          <button onClick={onCreateNew} className="text-sm font-medium text-[#8B1E3F] underline underline-offset-2">
            Create a listing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <div key={item._id} className="rounded-xl border border-[#E7DEE1] bg-white overflow-hidden">
              <div className="aspect-[4/3] bg-[#FAF6F7]">
                {item.images?.[0] && <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />}
              </div>
              <div className="p-3.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-medium text-[#221B1D] text-sm leading-snug line-clamp-2">{item.title}</h3>
                  <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-[#8B1E3F]">
                  ₦{item.rate.amount.toLocaleString()} <span className="text-xs font-normal text-[#6B6067]">{UNIT_LABEL[item.rate.unit]}</span>
                </p>
                <div className="mt-2.5 flex items-center gap-3 text-xs text-[#6B6067] border-t border-[#E7DEE1] pt-2.5">
                  <span>{item.totalBookings} booking(s)</span>
                  <span>{item.views} views</span>
                  <span>{item.likes} likes</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}