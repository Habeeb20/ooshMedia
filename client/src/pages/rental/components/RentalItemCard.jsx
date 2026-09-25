import { useState } from 'react';
import { rentalApi } from '../api/rentalApi';


const UNIT_LABEL = { hour: '/hr', day: '/day', week: '/wk', month: '/mo' };

export default function RentalItemCard({ item, onOpen }) {
  const [likes, setLikes] = useState(item.likes);
  const [liked, setLiked] = useState(false);

  const handleLike = async (e) => {
    e.stopPropagation();
    const res = await rentalApi.toggleLike(item._id);
    setLiked(res.liked);
    setLikes(res.likes);
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    await rentalApi.registerShare(item._id);
    navigator.clipboard?.writeText(`${window.location.origin}/rentals/${item._id}`);
  };

  return (
    <div
      onClick={() => onOpen?.(item)}
      className="cursor-pointer rounded-xl border border-[#E7DEE1] bg-white overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="aspect-[4/3] bg-[#FAF6F7] overflow-hidden">
        {item.images?.[0] && (
          <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
        )}
      </div>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-medium text-[#221B1D] leading-snug line-clamp-2">{item.title}</h3>
          {item.ratingCount > 0 && (
            <div className="shrink-0 flex items-center gap-1 text-sm text-[#B8902E]">
              <span>★</span>
              <span className="font-medium">{item.ratingAverage.toFixed(1)}</span>
            </div>
          )}
        </div>

        <p className="mt-1 text-sm text-[#6B6067]">{item.pickupLocation?.city}</p>

        <div className="mt-2.5 flex items-baseline gap-1">
          <span className="text-lg font-semibold text-[#8B1E3F]">
            ₦{item.rate.amount.toLocaleString()}
          </span>
          <span className="text-sm text-[#6B6067]">{UNIT_LABEL[item.rate.unit]}</span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-[#6B6067] text-sm border-t border-[#E7DEE1] pt-2.5">
          <button onClick={handleLike} className={`flex items-center gap-1 ${liked ? 'text-[#8B1E3F]' : ''}`}>
            <span>{liked ? '♥' : '♡'}</span>
            <span>{likes}</span>
          </button>
          <button onClick={handleShare} className="flex items-center gap-1">
            <span>↗</span>
            <span>{item.shares}</span>
          </button>
          <span className="flex items-center gap-1 ml-auto">
            <span>👁</span>
            <span>{item.views}</span>
          </span>
        </div>
      </div>
    </div>
  );
}