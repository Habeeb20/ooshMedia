import { useState } from 'react';
import { X, Send, Loader, DollarSign } from 'lucide-react';
import { feedAPI } from '../../config/api';


export default function ApplyModal({ post, onClose, onApplied }) {
  const [form, setForm] = useState({ coverLetter: '', proposedPrice: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!form.coverLetter.trim()) return setError('Cover letter is required');
    setSubmitting(true);
    setError('');
    try {
      await feedAPI.applyToPost(post._id, {
        coverLetter: form.coverLetter,
        proposedPrice: form.proposedPrice ? Number(form.proposedPrice) : undefined,
      });
      onApplied();
    } catch (e) {
      setError(e.response?.data?.message || 'Application failed');
    }
    setSubmitting(false);
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111' }}>Apply to this {post.postType}</h3>
            {post.title && <p style={{ margin: '2px 0 0', fontSize: 13, color: '#888' }}>{post.title}</p>}
          </div>
          <button onClick={onClose} style={closeBtn}><X size={18} /></button>
        </div>

        <div style={{ padding: '1.25rem' }}>
          {post.budget?.max > 0 && (
            <div style={budgetInfo}>
              <DollarSign size={14} />
              <span>Budget: ₦{post.budget.min?.toLocaleString()} - ₦{post.budget.max?.toLocaleString()}</span>
            </div>
          )}

          <label style={labelStyle}>Cover Letter *</label>
          <textarea
            style={textareaStyle}
            placeholder="Introduce yourself and explain why you're the best fit for this opportunity..."
            value={form.coverLetter}
            onChange={e => setForm(f => ({ ...f, coverLetter: e.target.value }))}
            rows={5}
          />

          <label style={labelStyle}>Your Proposed Price (NGN)</label>
          <input
            style={inputStyle}
            type="number"
            placeholder="e.g. 500000"
            value={form.proposedPrice}
            onChange={e => setForm(f => ({ ...f, proposedPrice: e.target.value }))}
          />

          {error && <p style={errorStyle}>{error}</p>}
        </div>

        <div style={footerStyle}>
          <button onClick={onClose} style={cancelStyle}>Cancel</button>
          <button onClick={handleSubmit} disabled={submitting} style={submitStyle}>
            {submitting ? <Loader size={15} /> : <Send size={15} />}
            {submitting ? 'Submitting...' : 'Submit Application'}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
const modalStyle = { background: '#fff', borderRadius: 14, width: '100%', maxWidth: 480, overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem', borderBottom: '1px solid #f0f0f0' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center' };
const budgetInfo = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', background: '#ecfdf5', color: '#065f46', borderRadius: 8, fontSize: 13, fontWeight: 500, marginBottom: 14 };
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 700, color: '#555', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 };
const textareaStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111', marginBottom: 12, resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', background: '#fafafa' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e5e7eb', fontSize: 14, color: '#111', outline: 'none', boxSizing: 'border-box', background: '#fafafa', marginBottom: 4 };
const errorStyle = { color: '#dc2626', fontSize: 13, background: '#fee2e2', padding: '8px 12px', borderRadius: 6, marginTop: 8 };
const footerStyle = { display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '1rem 1.25rem', borderTop: '1px solid #f0f0f0' };
const cancelStyle = { padding: '8px 16px', borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 14 };
const submitStyle = { display: 'flex', alignItems: 'center', gap: 6, padding: '8px 18px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 };