// src/pages/SellerAllReviews.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Loader2 } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL;

export default function SellerAllReviews() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchReviews(1); }, [sellerId]);

  const fetchReviews = async (p) => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API}/api/reviews/seller`, { params: { limit: 15, page: p } });
      setReviews((prev) => (p === 1 ? data.reviews : [...prev, ...data.reviews]));
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id='reviews' className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-xl font-extrabold text-gray-900">All Reviews</h1>
      </div>

      {loading && page === 1 ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No reviews yet.</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border border-gray-100 rounded-2xl p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">{r.userName}</p>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star key={n} size={14} className={n <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              {r.product?.name && <p className="text-xs text-gray-400 mt-0.5">on {r.product.name}</p>}
              {r.comment && <p className="text-sm text-gray-600 mt-2">{r.comment}</p>}
              {r.image && <img src={r.image} alt="" className="mt-3 w-28 h-28 rounded-xl object-cover" />}
              <p className="text-xs text-gray-300 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
            </div>
          ))}
        </div>
      )}

      {!loading && page < pages && (
        <button
          onClick={() => fetchReviews(page + 1)}
          className="w-full mt-6 py-3 rounded-2xl border border-gray-200 text-sm font-semibold text-gray-600"
        >
          Load more
        </button>
      )}
    </div>
  );
}