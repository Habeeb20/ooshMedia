import { Star } from "lucide-react";

// Pass `reviews` in from the parent page — e.g. pulled from a featured
// seller's businessProfile.reviews (each review already has `user`,
// `rating`, and `comment` per the User schema).
export default function CustomerReviews({ reviews = [] }) {
  if (!reviews.length) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24">
      <h2 className="text-center text-xl sm:text-2xl font-extrabold text-gray-900">
        Reviews From Our Customers
      </h2>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {reviews.slice(0, 4).map((review) => (
          <div
            key={review._id}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6"
          >
            <div className="flex items-center gap-3">
              <img
                src={review.user?.profilePicture || "/default-avatar.png"}
                alt={review.user?.firstName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">
                  {review.user?.firstName} {review.user?.lastName}
                </p>
                <div className="flex gap-0.5 mt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < review.rating
                          ? "fill-amber-400 text-amber-400"
                          : "text-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed line-clamp-3">
              {review.comment}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}