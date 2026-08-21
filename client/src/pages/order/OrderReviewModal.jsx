// src/components/ReviewModal.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Star, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryUpload from '../../config/CloudinaryUpload';


const API = import.meta.env.VITE_BACKEND_URL;

export default function ReviewModal({ sellerId, orderId, onClose, onSuccess }) {
  const token = localStorage.getItem('token');
  const [loadingItems, setLoadingItems] = useState(true);
  const [reviewableItems, setReviewableItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchReviewable = async () => {
      try {
        const params = {};
        if (sellerId) params.sellerId = sellerId;
        if (orderId) params.orderId = orderId;
        const { data } = await axios.get(`${API}/api/reviews/reviewable`, {
          headers: { Authorization: `Bearer ${token}` },
          params,
        });
        setReviewableItems(data.reviewable || []);
        if (data.reviewable?.length === 1) setSelectedItem(data.reviewable[0]);
      } catch (err) {
        console.error(err);
        toast.error('Could not load items eligible for review');
      } finally {
        setLoadingItems(false);
      }
    };
    fetchReviewable();
  }, [sellerId, orderId, token]);

  const handleSubmit = async () => {
    if (!selectedItem) return toast.error('Select a product to review');
    if (!rating) return toast.error('Please select a star rating');

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/api/reviews`,
        {
          productId: selectedItem.productId,
          orderId: selectedItem.orderId,
          rating,
          comment,
          image: imageUrl || undefined,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Review submitted, thank you!');
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center">
      <div className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl max-h-[50vh] overflow-y-auto">
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 text-lg">Write a Review</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
            <X size={16} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {loadingItems ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-400" />
            </div>
          ) : reviewableItems.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              You can only review products from orders that have been delivered to you.
            </p>
          ) : (
            <>
              {reviewableItems.length > 1 && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Which product?</label>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {reviewableItems.map((item) => (
                      <button
                        key={`${item.productId}_${item.orderId}`}
                        onClick={() => setSelectedItem(item)}
                        className={`w-full flex items-center gap-3 p-2 rounded-xl border text-left ${
                          selectedItem?.productId === item.productId && selectedItem?.orderId === item.orderId
                            ? 'border-emerald-600 bg-emerald-50'
                            : 'border-gray-200'
                        }`}
                      >
                        {item.image && <img src={item.image} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                        <span className="text-sm font-medium text-gray-800">{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {reviewableItems.length === 1 && (
                <div className="flex items-center gap-3">
                  {reviewableItems[0].image && (
                    <img src={reviewableItems[0].image} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  )}
                  <p className="font-semibold text-gray-900">{reviewableItems[0].name}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Your rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onMouseEnter={() => setHoverRating(n)} onMouseLeave={() => setHoverRating(0)} onClick={() => setRating(n)}>
                      <Star size={28} className={(hoverRating || rating) >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-2 block">Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell others what you thought..."
                  className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </div>

              <CloudinaryUpload
                label="Add a photo (optional)"
                folder="reviews"
                accept="image/*"
                maxSizeMB={10}
                onUploadComplete={(url) => setImageUrl(url)}
              />

              <button
                onClick={handleSubmit}
                disabled={submitting || !selectedItem}
                className="w-full bg-emerald-600 text-white font-bold py-3.5 rounded-2xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 size={16} className="animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}