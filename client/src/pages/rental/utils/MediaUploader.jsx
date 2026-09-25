import { useEffect, useRef, useState } from 'react';

import { rentalApi } from '../api/rentalApi';
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

async function uploadToCloudinary(file, resourceType) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!data.secure_url) throw new Error('Upload failed');
  return { url: data.secure_url, publicId: data.public_id };
}

function Thumb({ media, onRemove, isVideo }) {
  return (
    <div className="relative group aspect-square rounded-lg overflow-hidden border border-[#E7DEE1] bg-[#FAF6F7]">
      {isVideo ? (
        <video src={media.url} className="w-full h-full object-cover" muted />
      ) : (
        <img src={media.url} alt="" className="w-full h-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}

export default function MediaUploader({ images, videos, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [credits, setCredits] = useState(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    rentalApi.getVideoSubscriptionStatus().then((res) => setCredits(res.videoSubscription.creditsRemaining));
  }, []);

  const handleImageFiles = async (files) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(Array.from(files).map((f) => uploadToCloudinary(f, 'image')));
      onChange({ images: [...images, ...uploaded], videos });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoFiles = async (files) => {
    const list = Array.from(files);
    if (credits !== null && list.length > credits - videos.length) {
      alert(`You only have ${Math.max(0, credits - videos.length)} video credit(s) left. Buy more (₦5000 / 10 videos) to add more.`);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await Promise.all(list.map((f) => uploadToCloudinary(f, 'video')));
      onChange({ images, videos: [...videos, ...uploaded] });
    } finally {
      setUploading(false);
    }
  };

  const buyCredits = async () => {
    const res = await rentalApi.initiateVideoSubscription();
    window.location.href = res.authorizationUrl;
  };

  return (
    <div className="space-y-6">
      {/* Images */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-[#221B1D]">Photos</label>
          <span className="text-xs text-[#6B6067]">Add as many as you like</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {images.map((img, i) => (
            <Thumb key={img.publicId} media={img} onRemove={() => onChange({ images: images.filter((_, idx) => idx !== i), videos })} />
          ))}
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-[#E7DEE1] text-[#8B1E3F] hover:border-[#8B1E3F] hover:bg-[#F3E4E8] transition-colors flex flex-col items-center justify-center gap-1 text-xs font-medium"
          >
            <span className="text-xl leading-none">+</span>
            Add photo
          </button>
        </div>
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => e.target.files.length && handleImageFiles(e.target.files)}
        />
      </div>

      {/* Videos */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium text-[#221B1D]">Videos (optional)</label>
          <span className="text-xs text-[#6B6067]">
            {credits === null ? '…' : `${Math.max(0, credits - videos.length)} credit(s) left`}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {videos.map((vid, i) => (
            <Thumb key={vid.publicId} media={vid} isVideo onRemove={() => onChange({ images, videos: videos.filter((_, idx) => idx !== i) })} />
          ))}
          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            disabled={uploading}
            className="aspect-square rounded-lg border-2 border-dashed border-[#E7DEE1] text-[#8B1E3F] hover:border-[#8B1E3F] hover:bg-[#F3E4E8] transition-colors flex flex-col items-center justify-center gap-1 text-xs font-medium"
          >
            <span className="text-xl leading-none">+</span>
            Add video
          </button>
        </div>
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          multiple
          hidden
          onChange={(e) => e.target.files.length && handleVideoFiles(e.target.files)}
        />
        {credits === 0 && (
          <button
            type="button"
            onClick={buyCredits}
            className="mt-2 text-sm font-medium text-[#8B1E3F] underline underline-offset-2"
          >
            Buy 10 video credits — ₦5,000
          </button>
        )}
      </div>

      {uploading && <p className="text-sm text-[#6B6067]">Uploading…</p>}
    </div>
  );
}