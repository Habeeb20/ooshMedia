function Stars({ rating }) {
  return (
    <div className="flex gap-0.5 text-sm">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={n <= rating ? 'text-[#B8902E]' : 'text-[#E7DEE1]'}>★</span>
      ))}
    </div>
  );
}

export default function ReviewList({ reviews = [] }) {
  if (reviews.length === 0) {
    return <p className="text-sm text-[#6B6067]">No reviews yet.</p>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="border-b border-[#E7DEE1] pb-4 last:border-0 last:pb-0">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#221B1D]">
              {review.reviewer?.firstName} {review.reviewer?.lastName}
            </span>
            <Stars rating={review.rating} />
          </div>
          {review.comment && <p className="mt-1.5 text-sm text-[#6B6067] leading-relaxed">{review.comment}</p>}
          <p className="mt-1 text-xs text-[#6B6067]">{new Date(review.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}