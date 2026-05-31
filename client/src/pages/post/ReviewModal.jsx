import { useState } from 'react';
import { X, Star } from 'lucide-react';
import { feedAPI } from '../../config/api';


export default function ReviewModal({ post, onClose, onReviewed }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!rating) return setError('Please select a rating');
    setSubmitting(true);
    try {
      await feedAPI.addReview(post._id, { rating, comment });
      onReviewed();
    } catch (e) {
      setError(e.response?.data?.message || 'Review failed');
    }
    setSubmitting(false);
  };

  const labels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>Leave a Review</h3>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          <p style={{ margin: '0 0 16px', fontSize: 13, color: '#555' }}>
            How would you rate this {post.postType}?
          </p>

          {/* Star rating */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            {[1, 2, 3, 4, 5].map(s => (
              <button
                key={s}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => setRating(s)}
                onMouseEnter={() => setHovered(s)}
                onMouseLeave={() => setHovered(0)}
              >
                <Star
                  size={32}
                  fill={(hovered || rating) >= s ? '#f59e0b' : 'none'}
                  color={(hovered || rating) >= s ? '#f59e0b' : '#d1d5db'}
                />
              </button>
            ))}
          </div>
          {(hovered || rating) > 0 && (
            <p style={{ margin: '0 0 14px', fontSize: 13, color: '#f59e0b', fontWeight: 600 }}>
              {labels[hovered || rating]}
            </p>
          )}

          <textarea
            style={textareaStyle}
            placeholder="Share your experience (optional)..."
            value={comment}
            onChange={e => setComment(e.target.value)}
            rows={3}
          />

          {error && <p style={errorStyle}>{error}</p>}
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelStyle}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || !rating} style={{ ...submitStyle, opacity: !rating ? 0.5 : 1 }}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
const modalStyle = { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 400, overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid #f0f0f0' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' };
const textareaStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', background: '#fafafa' };
const errorStyle = { color: '#dc2626', fontSize: 13, background: '#fee2e2', padding: '8px 12px', borderRadius: 6, marginTop: 8 };
const footerStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '1rem 1.25rem', borderTop: '1px solid #f0f0f0' };
const cancelStyle = { padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 14 };
const submitStyle = { padding: '8px 18px', borderRadius: 8, border: 'none', background: '#f59e0b', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 };