import { useEffect, useState } from 'react';
import { rentalApi } from '../api/rentalApi';
import BookingForm from '../components/BookingForm';
import ReviewList from '../components/ReviewList';
const UNIT_LABEL = { hour: '/hr', day: '/day', week: '/wk', month: '/mo' };

export default function ItemDetailPage({ itemId }) {
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [activeMedia, setActiveMedia] = useState(0);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    rentalApi.getItem(itemId).then((res) => setItem(res.item));
    rentalApi.getItemReviews(itemId).then((res) => setReviews(res.reviews));
  }, [itemId]);

  if (!item) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-16">
        <div className="aspect-video rounded-2xl bg-[#F3E4E8] animate-pulse" />
      </div>
    );
  }

  const media = [...item.images.map((m) => ({ ...m, type: 'image' })), ...item.videos.map((m) => ({ ...m, type: 'video' }))];

  const handleLike = async () => {
    const res = await rentalApi.toggleLike(item._id);
    setLiked(res.liked);
    setItem((it) => ({ ...it, likes: res.likes }));
  };

  const handleShare = async () => {
    await rentalApi.registerShare(item._id);
    navigator.clipboard?.writeText(window.location.href);
  };

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 py-10 grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10">
      {/* Left: media + details */}
      <div>
        <div className="aspect-video rounded-2xl overflow-hidden bg-[#FAF6F7]">
          {media[activeMedia]?.type === 'video' ? (
            <video src={media[activeMedia].url} className="w-full h-full object-cover" controls />
          ) : (
            <img src={media[activeMedia]?.url} alt={item.title} className="w-full h-full object-cover" />
          )}
        </div>

        {media.length > 1 && (
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {media.map((m, i) => (
              <button
                key={m.publicId}
                onClick={() => setActiveMedia(i)}
                className={`shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 ${
                  i === activeMedia ? 'border-[#8B1E3F]' : 'border-transparent'
                }`}
              >
                {m.type === 'video' ? (
                  <video src={m.url} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={m.url} className="w-full h-full object-cover" alt="" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8">
          <div className="flex items-start justify-between gap-4">
            <h1 className="font-serif text-2xl sm:text-3xl text-[#221B1D]">{item.title}</h1>
            {item.ratingCount > 0 && (
              <div className="shrink-0 flex items-center gap-1 text-[#B8902E]">
                <span>★</span>
                <span className="font-medium text-[#221B1D]">{item.ratingAverage.toFixed(1)}</span>
                <span className="text-sm text-[#6B6067]">({item.ratingCount})</span>
              </div>
            )}
          </div>
          <p className="mt-1 text-[#6B6067]">
            {item.pickupLocation?.area}, {item.pickupLocation?.city}
          </p>

          <div className="mt-4 flex items-center gap-4 text-sm text-[#6B6067]">
            <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-[#8B1E3F]' : ''}`}>
              {liked ? '♥' : '♡'} {item.likes}
            </button>
            <button onClick={handleShare} className="flex items-center gap-1">
              ↗ {item.shares}
            </button>
            <span className="flex items-center gap-1">👁 {item.views}</span>
          </div>

          <p className="mt-6 text-[#221B1D] leading-relaxed whitespace-pre-line">{item.description}</p>

          <div className="mt-8 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F3E4E8] overflow-hidden shrink-0">
              {item.owner?.profilePicture && (
                <img src={item.owner.profilePicture} alt="" className="w-full h-full object-cover" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#221B1D]">
                {item.owner?.businessProfile?.businessName || `${item.owner?.firstName} ${item.owner?.lastName}`}
              </p>
              <p className="text-xs text-[#6B6067]">Item owner</p>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="font-serif text-xl text-[#221B1D] mb-4">Reviews</h2>
            <ReviewList reviews={reviews} />
          </div>
        </div>
      </div>

      {/* Right: sticky booking form */}
      <div className="lg:sticky lg:top-6 h-fit">
        <p className="mb-3 text-2xl font-semibold text-[#8B1E3F]">
          ₦{item.rate.amount.toLocaleString()}
          <span className="text-base font-normal text-[#6B6067]"> {UNIT_LABEL[item.rate.unit]}</span>
        </p>
        <BookingForm item={item} />
      </div>
    </div>
  );
}