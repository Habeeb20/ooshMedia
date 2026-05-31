import { useState, useRef } from 'react';
import { X, Image, FileText, Package, Send, Plus, Trash2, Loader } from 'lucide-react';
import { feedAPI, uploadToCloudinary } from '../../config/api';
import { productCategories } from '../../categories/productCategories';


const POST_TYPES = [
  { value: 'post', label: 'Post', icon: FileText, color: '#2563eb', desc: 'Share an update or idea' },
  { value: 'contract', label: 'Contract', icon: FileText, color: '#7c3aed', desc: 'Post a contract opportunity' },
  { value: 'supply', label: 'Supply Need', icon: Package, color: '#059669', desc: 'Request for supply' },
];

export default function CreatePostModal({ onClose, onCreated, currentUser,  defaultType = 'post' }) {
  const [postType, setPostType] = useState(defaultType);
  const [form, setForm] = useState({
    title: '', content: '', category: '', subCategory: '',
    tags: '', location: '',
    budget: { min: '', max: '', currency: 'NGN' },
    deadline: '', requirements: [''], deliverables: [''],
  });
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setBudget = (key, val) => setForm(f => ({ ...f, budget: { ...f.budget, [key]: val } }));

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) return setError('Max 4 images allowed');
    setUploading(true);
    try {
      const uploads = await Promise.all(files.map(uploadToCloudinary));
      setImages(prev => [...prev, ...uploads]);
    } catch { setError('Image upload failed'); }
    setUploading(false);
  };

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  const handleListChange = (field, idx, val) => {
    const arr = [...form[field]];
    arr[idx] = val;
    set(field, arr);
  };

  const addListItem = (field) => set(field, [...form[field], '']);
  const removeListItem = (field, idx) => set(field, form[field].filter((_, i) => i !== idx));

  const handleSubmit = async () => {
    if (!form.content.trim()) return setError('Content is required');
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        postType,
        title: form.title,
        content: form.content,
        category: form.category,
        subCategory: form.subCategory,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        images,
        location: form.location,
        ...(postType !== 'post' && {
          budget: {
            min: Number(form.budget.min) || 0,
            max: Number(form.budget.max) || 0,
            currency: form.budget.currency
          },
          deadline: form.deadline,
          requirements: form.requirements.filter(Boolean),
          deliverables: form.deliverables.filter(Boolean),
        })
      };
      const res = await feedAPI.createPost(payload);
        // ← Guard: only call if it's actually a function
      if (typeof onCreated === 'function') {
        onCreated(res.data.data);
      }
      onClose();
      onClose();
    } catch (e) {
        console.log(e.message)
      setError(e.response?.data?.message || 'Failed to create post');
    }
    setSubmitting(false);
  };

  const selectedType = POST_TYPES.find(t => t.value === postType);

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ ...styles.typeDot, background: selectedType.color }} />
            <span style={styles.headerTitle}>Create {selectedType.label}</span>
          </div>
          <button style={styles.iconBtn} onClick={onClose}><X size={20} /></button>
        </div>

        <div style={styles.body}>
          {/* Post Type Selector */}
          <div style={styles.typeRow}>
            {POST_TYPES.map(t => (
              <button
                key={t.value}
                style={{ ...styles.typeBtn, ...(postType === t.value ? { ...styles.typeBtnActive, borderColor: t.color, color: t.color } : {}) }}
                onClick={() => setPostType(t.value)}
              >
                <t.icon size={15} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Author row */}
          <div style={styles.authorRow}>
            <div style={styles.avatar}>
              {currentUser?.profilePicture
                ? <img src={currentUser.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                : <span style={styles.avatarText}>{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</span>
              }
            </div>
            <div>
              <p style={styles.authorName}>{currentUser?.firstName} {currentUser?.lastName}</p>
              <p style={styles.authorSub}>{currentUser?.businessProfile?.businessName || currentUser?.username}</p>
            </div>
          </div>

          {/* Title (for contract/supply) */}
          {postType !== 'post' && (
            <input
              style={styles.input}
              placeholder="Post title (e.g. Supply of 500 bags of cement)"
              value={form.title}
              onChange={e => set('title', e.target.value)}
            />
          )}

          {/* Content */}
          <textarea
            style={styles.textarea}
            placeholder={
              postType === 'post' ? "What's on your mind?"
              : postType === 'contract' ? 'Describe the contract, scope of work...'
              : 'Describe what you need to be supplied...'
            }
            value={form.content}
            onChange={e => set('content', e.target.value)}
            rows={4}
          />

          {/* Category */}
          <productCategories
            value={form.category}
            subValue={form.subCategory}
            onChange={(cat, sub) => setForm(f => ({ ...f, category: cat, subCategory: sub }))}
          />

          {/* Tags */}
          <input
            style={styles.input}
            placeholder="Tags (comma separated: cement, construction, lagos)"
            value={form.tags}
            onChange={e => set('tags', e.target.value)}
          />

          {/* Contract/Supply specific fields */}
          {postType !== 'post' && (
            <div style={styles.extraFields}>
              <div style={styles.row2col}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Budget Min (NGN)</label>
                  <input style={styles.input} type="number" placeholder="0"
                    value={form.budget.min} onChange={e => setBudget('min', e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Budget Max (NGN)</label>
                  <input style={styles.input} type="number" placeholder="0"
                    value={form.budget.max} onChange={e => setBudget('max', e.target.value)} />
                </div>
              </div>

              <div style={styles.row2col}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Deadline</label>
                  <input style={styles.input} type="date"
                    value={form.deadline} onChange={e => set('deadline', e.target.value)} />
                </div>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Location</label>
                  <input style={styles.input} placeholder="e.g. Lagos, Abuja"
                    value={form.location} onChange={e => set('location', e.target.value)} />
                </div>
              </div>

              {/* Requirements */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Requirements</label>
                {form.requirements.map((r, i) => (
                  <div key={i} style={styles.listRow}>
                    <input style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                      placeholder={`Requirement ${i + 1}`} value={r}
                      onChange={e => handleListChange('requirements', i, e.target.value)} />
                    {form.requirements.length > 1 &&
                      <button style={styles.removeBtn} onClick={() => removeListItem('requirements', i)}>
                        <Trash2 size={14} />
                      </button>}
                  </div>
                ))}
                <button style={styles.addBtn} onClick={() => addListItem('requirements')}>
                  <Plus size={14} /> Add requirement
                </button>
              </div>

              {/* Deliverables */}
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Deliverables</label>
                {form.deliverables.map((d, i) => (
                  <div key={i} style={styles.listRow}>
                    <input style={{ ...styles.input, flex: 1, marginBottom: 0 }}
                      placeholder={`Deliverable ${i + 1}`} value={d}
                      onChange={e => handleListChange('deliverables', i, e.target.value)} />
                    {form.deliverables.length > 1 &&
                      <button style={styles.removeBtn} onClick={() => removeListItem('deliverables', i)}>
                        <Trash2 size={14} />
                      </button>}
                  </div>
                ))}
                <button style={styles.addBtn} onClick={() => addListItem('deliverables')}>
                  <Plus size={14} /> Add deliverable
                </button>
              </div>
            </div>
          )}

          {/* Image upload */}
          <div style={styles.imageSection}>
            {images.map((img, i) => (
              <div key={i} style={styles.imageThumb}>
                <img src={img.url} alt="" style={styles.thumbImg} />
                <button style={styles.removeThumb} onClick={() => removeImage(i)}><X size={12} /></button>
              </div>
            ))}
            {images.length < 4 && (
              <button style={styles.uploadBtn} onClick={() => fileRef.current.click()} disabled={uploading}>
                {uploading ? <Loader size={18} className="spin" /> : <Image size={18} />}
                <span>{uploading ? 'Uploading...' : 'Add Photo'}</span>
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={handleImageUpload} />
          </div>

          {error && <p style={styles.error}>{error}</p>}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button style={{ ...styles.submitBtn, background: selectedType.color }} onClick={handleSubmit} disabled={submitting}>
            {submitting ? <Loader size={16} /> : <Send size={16} />}
            <span>{submitting ? 'Posting...' : 'Post'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  modal: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 1.25rem', borderBottom: '1px solid #f0f0f0' },
  typeDot: { width: 10, height: 10, borderRadius: '50%' },
  headerTitle: { fontWeight: 600, fontSize: 16, color: '#111' },
  iconBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#666', display: 'flex', alignItems: 'center', padding: 4, borderRadius: 6 },
  body: { flex: 1, overflowY: 'auto', padding: '1.25rem' },
  typeRow: { display: 'flex', gap: 8, marginBottom: '1rem', flexWrap: 'wrap' },
  typeBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e0e0e0', background: '#fafafa', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#555', transition: 'all 0.2s' },
  typeBtnActive: { background: '#fff', fontWeight: 600 },
  authorRow: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' },
  avatar: { width: 42, height: 42, borderRadius: '50%', background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: 700, color: '#3949ab' },
  authorName: { margin: 0, fontWeight: 600, fontSize: 14, color: '#111' },
  authorSub: { margin: 0, fontSize: 12, color: '#888' },
  input: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e8e8e8', fontSize: 14, color: '#111', marginBottom: 10, outline: 'none', boxSizing: 'border-box', background: '#fafafa' },
  textarea: { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e8e8e8', fontSize: 14, color: '#111', marginBottom: 10, outline: 'none', boxSizing: 'border-box', resize: 'vertical', background: '#fafafa', fontFamily: 'inherit', lineHeight: 1.6 },
  extraFields: { background: '#f8f9fa', borderRadius: 10, padding: '1rem', marginBottom: 10 },
  row2col: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 },
  fieldGroup: { marginBottom: 10 },
  label: { display: 'block', fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  listRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 },
  removeBtn: { background: '#fee2e2', border: 'none', borderRadius: 6, padding: '6px 8px', cursor: 'pointer', color: '#dc2626', display: 'flex', alignItems: 'center' },
  addBtn: { display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: '1.5px dashed #d1d5db', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 13, color: '#6b7280', marginTop: 4 },
  imageSection: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  imageThumb: { position: 'relative', width: 80, height: 80, borderRadius: 8, overflow: 'hidden', border: '1px solid #e0e0e0' },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover' },
  removeThumb: { position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 },
  uploadBtn: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, width: 80, height: 80, borderRadius: 8, border: '1.5px dashed #c7d2fe', background: '#eef2ff', cursor: 'pointer', fontSize: 11, color: '#6366f1' },
  error: { color: '#dc2626', fontSize: 13, marginTop: 4, background: '#fee2e2', padding: '8px 12px', borderRadius: 6 },
  footer: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '1rem 1.25rem', borderTop: '1px solid #f0f0f0' },
  cancelBtn: { padding: '8px 20px', borderRadius: 8, border: '1.5px solid #e0e0e0', background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500, color: '#555' },
  submitBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#fff' },
};



















