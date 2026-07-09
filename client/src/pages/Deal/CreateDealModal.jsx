




























import { useState } from 'react';
import {
  X, ShoppingBag, Tag, MapPin, DollarSign,
  ChevronDown, Loader2, Trash2
} from 'lucide-react';
import { productCategories } from '../../categories/productCategories';
import { dealsAPI } from '../../config/api';
import CloudinaryUpload from '../../config/CloudinaryUpload';

export default function CreateDealModal({ defaultType = 'buy', onClose, onCreated }) {
  const [type, setType] = useState(defaultType);
  const [uploadedImages, setUploadedImages] = useState([]);
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
    if (!form.title || !form.description || !form.category)
      return setError('Please fill title, description and category.');
    if (uploadedImages.length === 0)
      return setError('Please upload at least one image.');

    setLoading(true);
    setError('');
    try {
      const payload = {
        ...form,
        type,
        images: uploadedImages,
        price: form.price ? Number(form.price) : undefined,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      const deal = await dealsAPI.create(payload);
      onCreated(deal);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create deal.');
    } finally {
      setLoading(false);
    }
  };

  // shared input class
  const inputCls = 'w-full bg-gray-50 border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F]/20 transition-all';

  return (
    <>
      <style>{`
        @keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }
        @keyframes spin { to { transform:rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
        .modal-anim { animation: modalIn 0.22s cubic-bezier(.16,1,.3,1); }
      `}</style>

      {/* ── Overlay ── */}
      <div
        className="fixed inset-0 bg-gray-200/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        {/* ── Modal box ── */}
        <div className="modal-anim relative bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">

          {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-0">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                {type === 'buy' ? '🛍️ Post a Buy Request' : '🏷️ List an Item for Sale'}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                Connect with {type === 'buy' ? 'sellers' : 'buyers'} instantly
              </p>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* ── Type toggle ── */}
          <div className="flex gap-2 mx-5 my-4 bg-gray-100 rounded-full p-1">
            <button
              type="button"
              onClick={() => setType('buy')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-sm font-semibold transition-all
                ${type === 'buy'
                  ? 'bg-amber-400 text-black shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ShoppingBag size={15} /> I Want to Buy
            </button>
            <button
              type="button"
              onClick={() => setType('sell')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-4 rounded-full text-sm font-semibold transition-all
                ${type === 'sell'
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Tag size={15} /> I'm Selling
            </button>
          </div>

          {/* ── Form ── */}
          <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-3.5">

            {/* Title */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Title *</label>
              <input
                className={inputCls}
                placeholder={type === 'buy' ? 'e.g. Toyota Camry 2019' : 'e.g. iPhone 14 Pro Max'}
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">Description *</label>
              <textarea
                className={`${inputCls} resize-none`}
                placeholder="Describe what you're looking for or selling..."
                rows={3}
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              />
            </div>

            {/* Category + Subcategory */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Category *</label>
                <div className="relative">
                  <select
                    className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value, subcategory: '' }))}
                  >
                    <option value="">Select category</option>
                    {productCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
                    ))}
                  </select>
                  <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {selectedCat && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Subcategory</label>
                  <div className="relative">
                    <select
                      className={`${inputCls} appearance-none pr-8 cursor-pointer`}
                      value={form.subcategory}
                      onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}
                    >
                      <option value="">Select subcategory</option>
                      {selectedCat.subcategories.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              )}
            </div>

            {/* Price (sell only) */}
            {type === 'sell' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Price (₦)</label>
                  <div className="relative">
                    <DollarSign size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      className={`${inputCls} pl-8`}
                      type="number"
                      placeholder="0"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex items-center pb-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.priceNegotiable}
                      onChange={e => setForm(f => ({ ...f, priceNegotiable: e.target.checked }))}
                      className="w-4 h-4 accent-[#8B1E3F] cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-500">Price Negotiable</span>
                  </label>
                </div>
              </div>
            )}

            {/* Location + Tags */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Location</label>
                <div className="relative">
                  <MapPin size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    className={`${inputCls} pl-8`}
                    placeholder="e.g. Lagos, Abuja..."
                    value={form.location}
                    onChange={e => setForm(f => ({ ...f, location: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">
                  Tags <span className="font-normal opacity-60">(comma separated)</span>
                </label>
                <input
                  className={inputCls}
                  placeholder="e.g. urgent, brand-new, pickup"
                  value={form.tags}
                  onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                />
              </div>
            </div>

            {/* Images */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-gray-500">
                Photos <span className="font-normal opacity-60">(up to 6)</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-1">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover rounded-xl border border-gray-100"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all active:scale-95"
                    >
                      <Trash2 size={11} />
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

            {/* Error */}
            {error && (
              <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            )}

            {/* Footer actions */}
            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-transparent border border-gray-200 rounded-full text-sm text-gray-500 font-semibold hover:text-gray-800 hover:border-gray-300 transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                  ${type === 'buy'
                    ? 'bg-amber-400 text-black hover:brightness-105'
                    : 'bg-emerald-100 border border-emerald-300 text-emerald-700 hover:bg-emerald-200'}`}
              >
                {loading && <Loader2 size={14} className="spin" />}
                {loading ? 'Posting…' : type === 'buy' ? 'Post Buy Request' : 'List for Sale'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </>
  );
}
