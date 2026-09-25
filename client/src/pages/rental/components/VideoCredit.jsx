import { useState } from 'react';
import { rentalApi } from '../api/rentalApi';


export default function VideoCreditModal({ onClose }) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    setLoading(true);
    try {
      const res = await rentalApi.initiateVideoSubscription();
      window.location.href = res.authorizationUrl;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 space-y-4 text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-[#F3E4E8] flex items-center justify-center text-[#8B1E3F] text-xl">
          ▶
        </div>
        <div>
          <h3 className="font-medium text-[#221B1D]">Add videos to your listing</h3>
          <p className="text-sm text-[#6B6067] mt-1">
            Videos help renters trust your listing. Get 10 video-upload credits for ₦5,000 — usable across any of your listings.
          </p>
        </div>
        <button
          onClick={handleBuy}
          disabled={loading}
          className="w-full rounded-lg bg-[#8B1E3F] text-white font-medium py-2.5 hover:bg-[#5E1329] disabled:opacity-40"
        >
          {loading ? 'Starting payment…' : 'Buy 10 credits — ₦5,000'}
        </button>
        <button onClick={onClose} className="text-sm text-[#6B6067]">
          Not now
        </button>
      </div>
    </div>
  );
}