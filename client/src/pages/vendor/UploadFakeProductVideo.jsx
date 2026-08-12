// import { useState } from 'react';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { Loader2, X } from 'lucide-react';
// import CloudinaryUpload from '../../config/CloudinaryUpload';


// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

// const ProductVideoUploadForm = ({ onSuccess }) => {
//   const [videoData, setVideoData] = useState(null); // { url, publicId }
//   const [description, setDescription] = useState('');
//   const [tagsInput, setTagsInput] = useState('');
//   const [submitting, setSubmitting] = useState(false);

//   const handleSubmit = async () => {
//     if (!videoData) {
//       toast.error('Upload a video first');
//       return;
//     }
//     if (!description.trim()) {
//       toast.error('Add a description');
//       return;
//     }

//     setSubmitting(true);
//     try {
//       const token = localStorage.getItem('token');
//       const tags = tagsInput
//         .split(',')
//         .map((t) => t.trim())
//         .filter(Boolean);

//       const res = await axios.post(
//         `${BACKEND_URL}/api/product-videos`,
//         {
//           url: videoData.url,
//           publicId: videoData.publicId,
//           description: description.trim(),
//           tags,
//         },
//         { headers: { Authorization: `Bearer ${token}` } }
//       );

//       toast.success('Video posted');
//       setVideoData(null);
//       setDescription('');
//       setTagsInput('');
//       onSuccess?.(res.data.video);
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to post video');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
//       <div>
//         <h2 className="text-lg font-semibold text-slate-900">Upload a product video</h2>
//         <p className="text-sm text-slate-500 mt-1">Show buyers your product in action.</p>
//       </div>

//       <CloudinaryUpload
//         accept="video/*"
//         folder="product-videos"
//         label="Video file"
//         maxSizeMB={100}
//         onUploadComplete={(url, publicId) => setVideoData({ url, publicId })}
//       />

//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
//         <textarea
//           value={description}
//           onChange={(e) => setDescription(e.target.value)}
//           rows={3}
//           maxLength={500}
//           placeholder="What's in this video?"
//           className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40 focus:border-[#7B2038]"
//         />
//         <p className="text-xs text-slate-400 mt-1">{description.length}/500</p>
//       </div>

//       <div>
//         <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma separated)</label>
//         <input
//           type="text"
//           value={tagsInput}
//           onChange={(e) => setTagsInput(e.target.value)}
//           placeholder="phones, unboxing, electronics"
//           className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40 focus:border-[#7B2038]"
//         />
//       </div>

//       <button
//         onClick={handleSubmit}
//         disabled={submitting || !videoData}
//         className="w-full flex items-center justify-center gap-2 bg-[#7B2038] text-white font-medium py-2.5 rounded-xl hover:bg-[#611829] transition disabled:opacity-50 disabled:cursor-not-allowed"
//       >
//         {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
//         {submitting ? 'Posting...' : 'Post video'}
//       </button>
//     </div>
//   );
// };

// export default ProductVideoUploadForm;




import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, X, ChevronDown } from 'lucide-react';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import { productCategoryList } from '../../categories/productCategories';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductVideoUploadForm = ({ onSuccess }) => {
  const [videoData, setVideoData] = useState(null);
  const [description, setDescription] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const toggleTag = (id) => {
    setSelectedTags((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const removeTag = (id) => {
    setSelectedTags((prev) => prev.filter((t) => t !== id));
  };

  const handleSubmit = async () => {
    if (!videoData) {
      toast.error('Upload a video first');
      return;
    }
    if (!description.trim()) {
      toast.error('Add a description');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');

      const res = await axios.post(
        `${BACKEND_URL}/api/product-videos`,
        {
          url: videoData.url,
          publicId: videoData.publicId,
          description: description.trim(),
          tags: selectedTags,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Video posted');
      setVideoData(null);
      setDescription('');
      setSelectedTags([]);
      onSuccess?.(res.data.video);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post video');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Upload a product video</h2>
        <p className="text-sm text-slate-500 mt-1">Show buyers your product in action.</p>
      </div>

      <CloudinaryUpload
        accept="video/*"
        folder="product-videos"
        label="Video file"
        maxSizeMB={100}
        onUploadComplete={(url, publicId) => setVideoData({ url, publicId })}
      />

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="What's in this video?"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40 focus:border-[#7B2038]"
        />
        <p className="text-xs text-slate-400 mt-1">{description.length}/500</p>
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Categories / Tags</label>

        <button
          type="button"
          onClick={() => setDropdownOpen((o) => !o)}
          className="w-full flex items-center justify-between rounded-xl border border-slate-300 px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40 focus:border-[#7B2038]"
        >
          <span className={selectedTags.length ? 'text-slate-900' : 'text-slate-400'}>
            {selectedTags.length ? `${selectedTags.length} selected` : 'Select categories'}
          </span>
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {dropdownOpen && (
          <div className="absolute z-10 mt-1 w-full max-h-64 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
            {productCategoryList.map((cat) => {
              const isSelected = selectedTags.includes(cat.id);
              return (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => toggleTag(cat.id)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-slate-50 ${
                    isSelected ? 'bg-[#7B2038]/5 text-[#7B2038] font-medium' : 'text-slate-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {selectedTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTags.map((id) => {
              const cat = productCategoryList.find((c) => c.id === id);
              if (!cat) return null;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1 bg-[#7B2038]/10 text-[#7B2038] text-xs font-medium px-2.5 py-1 rounded-full"
                >
                  {cat.icon} {cat.name}
                  <button type="button" onClick={() => removeTag(id)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || !videoData}
        className="w-full flex items-center justify-center gap-2 bg-[#7B2038] text-white font-medium py-2.5 rounded-xl hover:bg-[#611829] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        {submitting ? 'Posting...' : 'Post video'}
      </button>
    </div>
  );
};

export default ProductVideoUploadForm;