import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2, X } from 'lucide-react';
import CloudinaryUpload from '../../config/CloudinaryUpload';


const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const ProductVideoUploadForm = ({ onSuccess }) => {
  const [videoData, setVideoData] = useState(null); // { url, publicId }
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

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
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await axios.post(
        `${BACKEND_URL}/api/product-videos`,
        {
          url: videoData.url,
          publicId: videoData.publicId,
          description: description.trim(),
          tags,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success('Video posted');
      setVideoData(null);
      setDescription('');
      setTagsInput('');
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

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags (comma separated)</label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="phones, unboxing, electronics"
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40 focus:border-[#7B2038]"
        />
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