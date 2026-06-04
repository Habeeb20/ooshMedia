import { useState, useRef } from 'react';
import {
  X, Upload, ShoppingBag, Tag, MapPin, DollarSign,
  ChevronDown, Loader2, ImagePlus, Trash2
} from 'lucide-react';
import {productCategories} from '../../categories/productCategories'
import { dealsAPI } from '../../config/api';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import './Modal.css';

export default function CreateDealModal({ defaultType = 'buy', onClose, onCreated }) {
  const [type, setType] = useState(defaultType);
    const [uploadedImages, setUploadedImages] = useState([]); // { url, publicId }[]

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    priceNegotiable: false,
    location: '',
    tags: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const selectedCat = productCategories.find(c => c.id === form.category);


   const handleUploadComplete = (url, publicId) => {
    setUploadedImages(prev => [...prev, { url, publicId }]);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };




const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!form.title || !form.description || !form.category) {
    return setError('Please fill title, description and category.');
  }

  if (uploadedImages.length === 0) {
    return setError('Please upload at least one image.');
  }

  setLoading(true);
  setError('');

  try {
    const payload = {
      ...form,
      type,
      images: uploadedImages,                    // ← This must be array of objects
      price: form.price ? Number(form.price) : undefined,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };

    const deal = await dealsAPI.create(payload);
    onCreated(deal);
    onClose(); // optional: close modal after success
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.message || err.message || 'Failed to create deal.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-large">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">
              {type === 'buy' ? '🛍️ Post a Buy Request' : '🏷️ List an Item for Sale'}
            </h2>
            <p className="modal-sub">Connect with {type === 'buy' ? 'sellers' : 'buyers'} instantly</p>
          </div>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>

        {/* Type Toggle */}
        <div className="type-toggle">
          <button
            type="button"
            className={`type-btn ${type === 'buy' ? 'active-buy' : ''}`}
            onClick={() => setType('buy')}
          >
            <ShoppingBag size={16} /> I Want to Buy
          </button>
          <button
            type="button"
            className={`type-btn ${type === 'sell' ? 'active-sell' : ''}`}
            onClick={() => setType('sell')}
          >
            <Tag size={16} /> I'm Selling
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              className="form-input"
              placeholder={type === 'buy' ? 'e.g. Toyota Camry 2019' : 'e.g. iPhone 14 Pro Max'}
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Describe what you're looking for or selling..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Category + Subcategory */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category *</label>
              <div className="select-wrap">
                <select
                  className="form-input form-select"
                  value={form.category}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
                >
                  <option value="">Select category</option>
                  {productCategories.map(c => (
                    <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="select-chevron" />
              </div>
            </div>
            {selectedCat && (
              <div className="form-group">
                <label className="form-label">Subcategory</label>
                <div className="select-wrap">
                  <select
                    className="form-input form-select"
                    value={form.subcategory}
                    onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                  >
                    <option value="">Select subcategory</option>
                    {selectedCat.subcategories.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="select-chevron" />
                </div>
              </div>
            )}
          </div>

          {/* Price (sell only) */}
          {type === 'sell' && (
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Price (₦)</label>
                <div className="input-icon-wrap">
                  <DollarSign size={15} className="input-icon" />
                  <input
                    className="form-input with-icon"
                    type="number"
                    placeholder="0"
                    value={form.price}
                    onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  />
                </div>
              </div>
              <div className="form-group center-self">
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={form.priceNegotiable}
                    onChange={e => setForm(f => ({ ...f, priceNegotiable: e.target.checked }))}
                    className="checkbox"
                  />
                  <span className="form-label" style={{margin:0}}>Price Negotiable</span>
                </label>
              </div>
            </div>
          )}

          {/* Location + Tags */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <div className="input-icon-wrap">
                <MapPin size={15} className="input-icon" />
                <input
                  className="form-input with-icon"
                  placeholder="e.g. Lagos, Abuja..."
                  value={form.location}
                  onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Tags <span className="label-hint">(comma separated)</span></label>
              <input
                className="form-input"
                placeholder="e.g. urgent, brand-new, pickup"
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
              />
            </div>
          </div>

          {/* Images */}
          {/* <div className="form-group">
            <label className="form-label">Photos <span className="label-hint">(up to 6)</span></label>
            <div className="img-upload-grid">
              {images.map((img, i) => (
                <div key={i} className="img-thumb">
                  <img src={img.preview} alt="" />
                  <button type="button" className="img-remove" onClick={() => removeImage(i)}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
              {images.length < 6 && (
                <button type="button" className="img-add-btn" onClick={() => fileRef.current?.click()}>
                  <ImagePlus size={22} />
                  <span>Add Photo</span>
                </button>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />
          </div> */}

     {/* Images Section */}
<div className="form-group">
  <label className="form-label">Photos <span className="label-hint">(up to 6)</span></label>
  
  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-3">
    {uploadedImages.map((img, index) => (
      <div key={index} className="relative group">
        <img 
          src={img.url} 
          alt="" 
          className="w-full h-32 object-cover rounded-lg border" 
        />
        <button
          type="button"
          onClick={() => removeImage(index)}
          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition"
        >
          <Trash2 size={16} />
        </button>
      </div>
    ))}

    {uploadedImages.length < 6 && (
      <CloudinaryUpload
        onUploadComplete={handleUploadComplete}
        folder="deals"
        label="+ Add Image"
      />
    )}
  </div>
</div>
          {error && <p className="form-error">{error}</p>}

          <div className="modal-footer">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className={`btn-submit ${type}`} disabled={loading}>
              {loading ? <Loader2 size={16} className="spin" /> : null}
              {loading ? 'Posting...' : type === 'buy' ? 'Post Buy Request' : 'List for Sale'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}































