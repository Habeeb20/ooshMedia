import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import { entityCategories } from './../../categories/entityCategories';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import Loading from '../../config/Loading';

import { toast } from 'sonner';
import { Save, Camera, Clock, Users, Building2 } from 'lucide-react';

export default function BusinessProfileUpdate() {
  const [formData, setFormData] = useState({
    businessName: '',
    businessAddress: '',
    entityCategory: [],
    yearsInBusiness: '',
    staffCount: '',
    registeredBusiness: false,
    openingHours: ['Monday - Friday: 8:00 AM - 6:00 PM'],
  });

  const [galleryImages, setGalleryImages] = useState([]); // Cloudinary
  const [videoFiles, setVideoFiles] = useState([]);       // For S3 via backend
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch existing business profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
       console.log("Fetched profile data:", data);
        if (data.success && data.user?.businessProfile) {
          const bp = data.user.businessProfile;

          setFormData({
            businessName: bp.businessName || '',
            businessAddress: bp.businessAddress || '',
            entityCategory: bp.entityCategory || [],
            yearsInBusiness: bp.yearsInBusiness || '',
            staffCount: bp.staffCount || '',
            registeredBusiness: bp.registeredBusiness || false,
   openingHours: bp.openingHours && bp.openingHours.length > 0 
              ? bp.openingHours 
              : ['Monday - Friday: 8:00 AM - 6:00 PM'],
          });

          // Prefill existing gallery images
          if (bp.gallery && bp.gallery.length > 0) {
            const imagesOnly = bp.gallery.filter(item => item.type === 'image');
            setGalleryImages(imagesOnly);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      entityCategory: prev.entityCategory.includes(categoryId)
        ? prev.entityCategory.filter(id => id !== categoryId)
        : [...prev.entityCategory, categoryId]
    }));
  };

  const handleImageUpload = (url) => {
    setGalleryImages(prev => [...prev, { url, type: 'image', platform: 'cloudinary' }]);
  };

  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files);
    setVideoFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideoFiles(prev => prev.filter((_, i) => i !== index));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setLoading(true);

  //   const formPayload = new FormData();

  //   // Append text fields
  //   Object.keys(formData).forEach(key => {
  //     if (key === 'entityCategory') {
  //       formPayload.append('entityCategory', JSON.stringify(formData.entityCategory));
  //     } else {
  //       formPayload.append(key, formData[key]);
  //     }
  //   });

  //   // Append Cloudinary images
  //   formPayload.append('gallery', JSON.stringify(galleryImages));

  //   // Append Videos for S3 (Multer will handle)
  //   videoFiles.forEach(file => {
  //     formPayload.append('gallery', file);
  //   });

  //   try {
  //     const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
  //       method: 'PUT',

  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem('token')}`,
  //       },
  //       body: formPayload,
  //     });

  //     const data = await res.json();

  //     if (data.success) {
  //       toast.success("Business profile updated successfully! 🎉");
  //     } else {
  //       toast.error(data.message || "Update failed");
  //     }
  //   } catch (err) {
  //     toast.error("Something went wrong. Please try again.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formPayload = new FormData();

    // Append text fields
    formPayload.append('businessName', formData.businessName);
    formPayload.append('businessAddress', formData.businessAddress);
    formPayload.append('yearsInBusiness', formData.yearsInBusiness);
    formPayload.append('staffCount', formData.staffCount);
    formPayload.append('registeredBusiness', formData.registeredBusiness);
    formPayload.append('entityCategory', JSON.stringify(formData.entityCategory));
    formPayload.append('openingHours', JSON.stringify(formData.openingHours));

    // Append Cloudinary images
    if (galleryImages.length > 0) {
      formPayload.append('gallery', JSON.stringify(galleryImages));
    }

    // Append Videos for S3
    videoFiles.forEach(file => {
      formPayload.append('gallery', file);
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formPayload,
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Business profile updated successfully! 🎉");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loading text="Loading business profile..." />;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Building2 size={32} style={{ color: appConfig.colors.primary }} />
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Business Profile</h1>
          <p className="text-gray-600">Tell the world about your business</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Business Basic Info */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Business Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
              <input
                type="number"
                name="yearsInBusiness"
                value={formData.yearsInBusiness}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
            <input
              type="text"
              name="businessAddress"
              value={formData.businessAddress}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
              placeholder="e.g 12 Adeola Odeku Street, Victoria Island, Lagos"
            />
          </div>
        </div>

     {/* Entity Categories - FIXED TO SHOW SELECTED STATE */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Business Categories</h2>
          <p className="text-gray-600 mb-4">Select all that apply</p>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {entityCategories.map((cat) => {
              const isSelected = formData.entityCategory.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleCategory(cat.id)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-[#8B1E3F] bg-[#8B1E3F]/5 shadow-sm'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl mb-2 block">{cat.icon}</span>
                  <p className="font-medium">{cat.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Staff Count & Opening Hours */}
        <div className="bg-white rounded-3xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Staff Count</label>
            <input
              type="number"
              name="staffCount"
              value={formData.staffCount}
              onChange={handleChange}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
              placeholder="Number of employees"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
            <input
              type="text"
              name="openingHours"
              value={formData.openingHours[0] || ''}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                openingHours: [e.target.value]
              }))}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
              placeholder="e.g Monday - Friday: 8am - 6pm"
            />
          </div>
        </div>
        {/* Gallery - Images & Videos */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Gallery</h2>

          {/* Images */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3">Upload Images (Cloudinary)</label>
            <CloudinaryUpload
              onUploadComplete={(url) => handleImageUpload(url)}
              folder="business-gallery"
              label="Add Business Images"
            />
          </div>

          {/* Videos */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Upload Videos (S3)</label>
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50">
              <Camera size={40} className="text-gray-400 mb-3" />
              <p className="text-sm font-medium">Click to upload videos</p>
              <p className="text-xs text-gray-500">MP4, MOV (Max 100MB each)</p>
              <input
                type="file"
                multiple
                accept="video/*"
                className="hidden"
                onChange={handleVideoSelect}
              />
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: appConfig.colors.primary }}
        >
          {loading ? (
            <Loading size="sm" />
          ) : (
            <>
              <Save size={24} />
              Save Business Profile
            </>
          )}
        </button>
      </form>
    </div>
  );
}

























































































