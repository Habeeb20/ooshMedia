import { useState } from 'react';
import { rentalApi } from '../api/rentalApi';

export default function ReviewForm({ bookingId, revieweeLabel, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await rentalApi.submitReview(bookingId, { rating, comment });
      setDone(true);
      onSubmitted?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return <p className="text-sm font-medium text-[#2F6846]">Thanks for your review.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#E7DEE1] bg-white p-5 space-y-4">
      <h3 className="font-medium text-[#221B1D]">Rate {revieweeLabel}</h3>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            onMouseEnter={() => setHoverRating(n)}
            onMouseLeave={() => setHoverRating(0)}
            className="text-2xl leading-none"
          >
            <span className={n <= (hoverRating || rating) ? 'text-[#B8902E]' : 'text-[#E7DEE1]'}>★</span>
          </button>
        ))}
      </div>

      <textarea
        placeholder="Share a few words about your experience (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={3}
        className="w-full rounded-lg border border-[#E7DEE1] px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B1E3F] focus:border-[#8B1E3F]"
      />

      {error && <p className="text-sm text-[#B3261E]">{error}</p>}

      <button
        type="submit"
        disabled={!rating || submitting}
        className="rounded-lg bg-[#8B1E3F] text-white font-medium px-4 py-2.5 hover:bg-[#5E1329] disabled:opacity-40"
      >
        {submitting ? 'Submitting…' : 'Submit review'}
      </button>
    </form>
  );
}