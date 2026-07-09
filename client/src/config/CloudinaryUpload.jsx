// src/components/CloudinaryUpload.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { toast } from 'sonner';
import { Upload, X, Loader2 } from 'lucide-react';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

const CloudinaryUpload = ({
  onUploadComplete,         // (url, publicId) => void
  onUploadStart = () => {}, // called when upload starts
  preset = UPLOAD_PRESET,
  folder = 'posts',
  accept = 'image/*',
  maxSizeMB = 50,
  label = 'Upload media',
  currentUrl,
}) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentUrl || null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // Auto-upload when file is selected
  useEffect(() => {
    if (file) {
      uploadFile();
    }
  }, [file]);

  const handleFileChange = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large. Maximum ${maxSizeMB}MB allowed.`);
      return;
    }

    setFile(selectedFile);

    // Image preview
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreview(null);
    }
  }, [maxSizeMB]);

  const uploadFile = async () => {
    if (!file) return;

    onUploadStart();
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', preset);
    if (folder) formData.append('folder', folder);

    try {
      const xhr = new XMLHttpRequest();
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText);
          if (data.secure_url && data.public_id) {
            toast.success('Upload successful!');
            onUploadComplete(data.secure_url, data.public_id);
            setPreview(data.secure_url);
          } else {
            throw new Error('No secure_url returned');
          }
        } else {
          throw new Error(`Upload failed: ${xhr.statusText}`);
        }
      };

      xhr.onerror = () => {
        toast.error('Network error during upload');
      };

      xhr.send(formData);
    } catch (err) {
      toast.error(err.message || 'Upload failed');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(currentUrl || null);
  };

  return (
    <div className="space-y-4">
      {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}

      {/* Preview / Upload area */}
      {preview || file ? (
        <div className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {preview && (preview.startsWith('data:image') || preview.includes('.jpg') || preview.includes('.png')) ? (
            <img src={preview} alt="Preview" className="w-full h-64 object-cover" />
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              {uploading ? 'Uploading...' : 'Media selected'}
            </div>
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <div className="text-white text-center">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-2" />
                <p className="text-sm">{progress}%</p>
              </div>
            </div>
          )}

          <button
            onClick={clearFile}
            disabled={uploading}
            className="absolute top-3 right-3 p-2 bg-black/60 rounded-full text-white hover:bg-black/80 transition disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      ) : (
        // <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
        //   <div className="flex flex-col items-center justify-center pt-5 pb-6">
        //     <Upload className="w-20 h-10 text-gray-400 mb-3" />
        //     <p className="mb-2 text-sm text-gray-500">
        //       <span className="font-semibold">Click to upload</span> or drag & drop
        //     </p>
        //     <p className="text-xs text-gray-500">
        //       PNG, JPG, MP4 (max 10MB)
        //     </p>
        //   </div>
        //   <input
        //     type="file"
        //     className="hidden"
        //     accept={accept}
        //     onChange={handleFileChange}
        //     disabled={uploading}
        //   />
        // </label>

        <label 
  className={`
    group relative flex flex-col items-center justify-center w-full min-h-[240px] py-10 px-6 
    border-2 border-dashed border-slate-300 rounded-2xl cursor-pointer 
    bg-slate-50/50 hover:bg-slate-50 hover:border-blue-500 
    transition-all duration-300 ease-in-out focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2
    ${uploading ? 'opacity-60 cursor-not-allowed' : 'active:scale-[0.99]'}
  `}
>
  <div className="flex flex-col items-center justify-center text-center">
    {/* Animated Icon Container */}
    <div className="flex items-center justify-center w-14 h-14 mb-4 rounded-full bg-white shadow-sm border border-slate-100 text-slate-400 group-hover:text-blue-500 group-hover:scale-110 transition-all duration-300">
      <Upload className="w-6 h-6" />
    </div>

    {/* Primary Text */}
    <p className="mb-1 text-sm font-medium text-slate-700 md:text-base">
      <span className="text-blue-600 font-semibold group-hover:underline">
        Click to upload
      </span>{" "}
      <span className="hidden sm:inline">or drag & drop</span>
    </p>

    {/* Secondary Support Text */}
    <p className="text-xs text-slate-500 mt-1 max-w-[200px] sm:max-w-none leading-relaxed">
      PNG, JPG, or MP4 <span className="inline-block px-1.5 py-0.5 ml-1 font-medium bg-slate-200/60 text-slate-600 rounded">max 10MB</span>
    </p>
  </div>

  <input
    type="file"
    className="sr-only" // Better accessibility than "hidden" for screen readers
    accept={accept}
    onChange={handleFileChange}
    disabled={uploading}
  />
</label>
      )}
    </div>
  );
};

export default CloudinaryUpload;