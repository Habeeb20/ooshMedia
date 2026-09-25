 import { useState } from 'react';
 
import { rentalApi } from '../api/rentalApi';

export default function ExtendRentalModal({ booking, onClose }) {
  const [newEndDate, setNewEndDate] = useState('');
  const [quote, setQuote] = useState(null); // { additionalAmount, authorizationUrl }
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuote = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await rentalApi.requestExtension(booking._id, newEndDate);
      setQuote(res);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not extend right now.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-[#221B1D]">Extend rental</h3>
          <button onClick={onClose} className="text-[#6B6067]">✕</button>
        </div>

        <p className="text-sm text-[#6B6067]">
          Currently due back {new Date(booking.endDate).toLocaleDateString()}.
        </p>

        {!quote ? (
          <form onSubmit={handleQuote} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#221B1D] mb-1.5">New return date</label>
              <input
                type="date"
                required
                min={new Date(new Date(booking.endDate).getTime() + 86400000).toISOString().slice(0, 10)}
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
              />
            </div>
            {error && <p className="text-sm text-[#B3261E]">{error}</p>}
            <button
              type="submit"
              disabled={!newEndDate || loading}
              className="w-full rounded-lg bg-[#8B1E3F] text-white font-medium py-2.5 hover:bg-[#5E1329] disabled:opacity-40"
            >
              {loading ? 'Calculating…' : 'Get extension price'}
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg bg-[#FAF6F7] p-3.5 flex justify-between text-sm font-medium text-[#221B1D]">
              <span>Additional amount</span>
              <span>₦{quote.additionalAmount.toLocaleString()}</span>
            </div>
            <a
              href={quote.authorizationUrl}
              className="block text-center w-full rounded-lg bg-[#8B1E3F] text-white font-medium py-2.5 hover:bg-[#5E1329]"
            >
              Pay & extend
            </a>
          </div>
        )}
      </div>
    </div>
  );
}