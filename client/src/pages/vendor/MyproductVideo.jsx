import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Pencil, Trash2, X, Loader2, Play } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getThumbnail = (video) => {
  if (video.thumbnail?.url) return video.thumbnail.url;
  // Cloudinary trick: swap video extension for jpg + grab first frame
  return video.video?.url?.replace(/\.(mp4|mov|webm)$/i, '.jpg');
};

const EditModal = ({ video, onClose, onSaved }) => {
  const [description, setDescription] = useState(video.description);
  const [tagsInput, setTagsInput] = useState((video.tags || []).join(', '));
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!description.trim()) {
      toast.error('Description cannot be empty');
      return;
    }
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const res = await axios.put(
        `${BACKEND_URL}/api/product-videos/${video._id}`,
        { description: description.trim(), tags },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Video updated');
      onSaved(res.data.video);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update video');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900">Edit video</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <video src={video.video.url} className="w-full rounded-xl max-h-48 object-cover bg-black" controls />

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            maxLength={500}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Tags</label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#7B2038]/40"
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-[#7B2038] text-white font-medium py-2.5 rounded-xl hover:bg-[#611829] transition disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </div>
  );
};

const MyProductVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${BACKEND_URL}/api/product-videos/mine`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos(res.data.videos);
    } catch (err) {
      toast.error('Failed to load your videos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video? This cannot be undone.')) return;
    setDeletingId(id);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${BACKEND_URL}/api/product-videos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setVideos((prev) => prev.filter((v) => v._id !== id));
      toast.success('Video deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete video');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#7B2038]" />
      </div>
    );
  }

  if (!videos.length) {
    return (
      <div className="text-center py-12 text-slate-500">
        <p>You haven't uploaded any videos yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-slate-900">My videos</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {videos.map((video) => (
          <div key={video._id} className="group rounded-2xl overflow-hidden border border-slate-200 bg-white">
            <div className="relative aspect-square bg-slate-100">
              <img src={getThumbnail(video)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                <div className="w-11 h-11 rounded-full bg-white/90 flex items-center justify-center">
                  <Play className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => setEditingVideo(video)}
                  className="p-1.5 bg-white/95 rounded-full text-slate-700 hover:text-[#7B2038]"
                >
                  <Pencil size={14} />
                </button>
                <button
                  onClick={() => handleDelete(video._id)}
                  disabled={deletingId === video._id}
                  className="p-1.5 bg-white/95 rounded-full text-slate-700 hover:text-red-600"
                >
                  {deletingId === video._id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-sm text-slate-700 line-clamp-2">{video.description}</p>
              <span
                className={`inline-block mt-1.5 text-[11px] px-2 py-0.5 rounded-full ${
                  video.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {video.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {editingVideo && (
        <EditModal
          video={editingVideo}
          onClose={() => setEditingVideo(null)}
          onSaved={(updated) =>
            setVideos((prev) => prev.map((v) => (v._id === updated._id ? updated : v)))
          }
        />
      )}
    </div>
  );
};

export default MyProductVideos;