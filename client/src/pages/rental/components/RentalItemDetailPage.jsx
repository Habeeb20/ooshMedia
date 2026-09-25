




import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

import OwnerProfileCard from './OwnerProfilCard';
import { rentalApi } from '../api/rentalApi';

import SimilarItemsRow from './SimilarItemsRow';

const WINE = '#8B1E3F';

function formatMoney(amount, currency = 'NGN') {
  const symbol = currency === 'NGN' ? '₦' : `${currency} `;
  return `${symbol}${Number(amount || 0).toLocaleString()}`;
}

function StarRow({ value = 0 }) {
  return (
    <div className="flex gap-0.5 text-amber-400">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i}>{i < Math.round(value) ? '★' : '☆'}</span>
      ))}
    </div>
  );
}

export default function RentalItemDetailPage() {
  const { itemId } = useParams();
  const navigate = useNavigate();

  const [item, setItem] = useState(null);
  const [owner, setOwner] = useState(null);
  const [similarItems, setSimilarItems] = useState([]);
  const [likedByMe, setLikedByMe] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    // Hitting this endpoint IS the view — the backend increments `views`
    // atomically on every successful load, so no extra call is needed here.
    rentalApi
      .getItem(itemId)
      .then((res) => {
        if (cancelled) return;
        setItem(res.item);
        setOwner(res.item.owner);
        setSimilarItems(res.similarItems || []);
        setLikedByMe(!!res.likedByMe);
      })
      .catch((err) => !cancelled && setError(err.response?.data?.message || 'Could not load this item.'))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [itemId]);

  const handleLike = async () => {
    if (liking) return;
    setLiking(true);
    // Optimistic update, reconciled with the server's authoritative count.
    setLikedByMe((v) => !v);
    setItem((i) => ({ ...i, likes: i.likes + (likedByMe ? -1 : 1) }));
    try {
      const res = await rentalApi.toggleLike(itemId);
      setLikedByMe(res.liked);
      setItem((i) => ({ ...i, likes: res.likes }));
    } catch {
      // revert on failure (e.g. not logged in)
      setLikedByMe((v) => !v);
      setItem((i) => ({ ...i, likes: i.likes + (likedByMe ? 1 : -1) }));
      navigate('/login');
    } finally {
      setLiking(false);
    }
  };

  const handleShare = async () => {
    try {
      const res = await rentalApi.registerShare(itemId);
      setItem((i) => ({ ...i, shares: res.shares }));
    } catch {
      /* count still attempted client-side is unnecessary — server is source of truth */
    }
    if (navigator.share) {
      navigator.share({ title: item?.title, url: window.location.href }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
    }
  };

  if (loading) {
    return <div className="max-w-6xl mx-auto px-5 py-16 text-center text-[#6B6067]">Loading item…</div>;
  }
  if (error || !item) {
    return <div className="max-w-6xl mx-auto px-5 py-16 text-center text-[#6B6067]">{error || 'Item not found.'}</div>;
  }

  const images = item.images?.length ? item.images : [{ url: '/placeholder.jpg' }];
  const discountLabel = null; // wire up if you add a discount field later

  return (
    <div className="bg-[#FBF4F6] min-h-screen">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-6">
        {/* Breadcrumb */}
        <div className="text-sm text-[#6B6067] mb-4 flex items-center gap-1 flex-wrap">
          <Link to="/" className="hover:text-[#8B1E3F]">Home</Link> ·
          <Link to={`/browse?category=${item.category}`} className="hover:text-[#8B1E3F]">{item.category}</Link> ·
          <span className="text-[#221B1D]">{item.title}</span>
        </div>

        {/* Title row */}
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#221B1D]">{item.title}</h1>
            <div className="flex items-center gap-3 mt-1 text-sm text-[#6B6067] flex-wrap">
              <span className="flex items-center gap-1">
                <StarRow value={item.ratingAverage} /> {item.ratingAverage?.toFixed(1) || '0.0'} ({item.ratingCount} reviews)
              </span>
              <span>· {item.pickupLocation?.area}, {item.pickupLocation?.city}</span>
              {item.deliveryAvailable && <span>· Delivery available</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 rounded-lg border border-[#E7DEE1] px-3 py-2 text-sm text-[#221B1D] hover:border-[#8B1E3F]"
            >
              ⤴ Share ({item.shares || 0})
            </button>
            <button
              onClick={handleLike}
              disabled={liking}
              className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                likedByMe ? 'bg-[#8B1E3F] border-[#8B1E3F] text-white' : 'border-[#E7DEE1] text-[#221B1D] hover:border-[#8B1E3F]'
              }`}
            >
              {likedByMe ? '♥' : '♡'} Saved ({item.likes || 0})
            </button>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-4 gap-2 rounded-2xl overflow-hidden mb-8" style={{ height: 380 }}>
          <div className="col-span-2 row-span-2">
            <img src={images[activeImage]?.url} alt={item.title} className="w-full h-[60vh] object-cover" />
          </div>
          {images.slice(1, 5).map((img, i) => (
            <button key={i} onClick={() => setActiveImage(i + 1)} className="h-full w-full">
              <img src={img.url} alt="" className="w-full h-full object-cover hover:opacity-90" />
            </button>
          ))}
        </div>

        <div className="grid  grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT — details */}
          <div className="lg:col-span-2 space-y-8">
            <OwnerProfileCard
              owner={owner}
              ratingAverage={item.ratingAverage}
              ratingCount={item.ratingCount}
              totalBookings={item.totalBookings}
            />

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { title: 'Instant Confirmation', body: 'Book without waiting for lengthy approvals.' },
                { title: 'Escrow Disbursement', body: 'Funds released only after pickup confirmation.' },
                { title: 'Sanitized & Detailed', body: 'Full device cleanup between every rental.' },
                { title: 'Full Comprehensive Coverage', body: "Third party damage and loss protection included." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-[#E7DEE1] bg-white p-3">
                  <p className="text-sm font-semibold text-[#221B1D]">{f.title}</p>
                  <p className="text-xs text-[#6B6067] mt-1">{f.body}</p>
                </div>
              ))}
            </div>

            <div>
              <h2 className="font-serif text-xl text-[#221B1D] mb-2">About this item</h2>
              <p className="text-[#4A4045] leading-relaxed whitespace-pre-line">{item.description}</p>
            </div>

            <div>
              <h2 className="font-serif text-xl text-[#221B1D] mb-3">
                {item.ratingAverage?.toFixed(1) || '0.0'} · {item.ratingCount} verified reviews
              </h2>
              {/* Wire this up to a GET /rentals/items/:id/reviews (or embed
                  reviews on the item payload) once your Review model is ready.
                  Left as a placeholder list slot so the layout matches. */}
              <p className="text-sm text-[#6B6067]">Reviews will appear here once bookings are completed.</p>
            </div>
          </div>

          {/* RIGHT — booking sidebar */}
          <aside className="lg:sticky lg:top-6 h-fit">
            <div className="rounded-2xl border border-[#E7DEE1] bg-white p-5">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-[#221B1D]">
                  {formatMoney(item.rate.amount, item.rate.currency)}
                </span>
                <span className="text-sm text-[#6B6067]">/ {item.rate.unit}</span>
              </div>
              {item.depositAmount > 0 && (
                <p className="text-sm text-[#6B6067] mt-1">
                  + {formatMoney(item.depositAmount, item.rate.currency)} refundable deposit
                </p>
              )}

              <button
                onClick={() => navigate(`/rentals/${item._id}/book`)}
                className="mt-4 w-full rounded-xl py-3 font-semibold text-white transition-transform hover:scale-[1.01]"
                style={{ backgroundColor: WINE }}
              >
                Reserve with Escrow Protection
              </button>
              <p className="text-xs text-center text-[#6B6067] mt-2">
                You won't be charged yet — confirm your dates on the next step.
              </p>

              <div className="mt-4 pt-4 border-t border-[#F3E4E8] text-sm text-[#6B6067] space-y-1">
                <p>👁 {item.views} views</p>
                <p>♥ {item.likes} likes</p>
                <p>⤴ {item.shares} shares</p>
              </div>
            </div>
          </aside>
        </div>

        <SimilarItemsRow
          items={similarItems}
          categoryLabel={item.category}
          onOpenItem={(id) => navigate(`/rentals/${id}`)}
        />
      </div>
    </div>
  );
}