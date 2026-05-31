// import { useState, useEffect } from 'react';
// import appConfig from '../../config/AppConfig';
// import { entityCategories } from './../../categories/entityCategories';
// import CloudinaryUpload from '../../config/CloudinaryUpload';
// import Loading from '../../config/Loading';

// import { toast } from 'sonner';
// import { Save, Camera, Building2, User } from 'lucide-react';

// export default function BusinessProfileUpdate() {
//   const [formData, setFormData] = useState({
//     // Basic User Info (Always visible)
//     firstName: '',
//     lastName: '',
//     state: '',
//     lga: '',
//     profilePicture: '',

//     // Business Profile (Only for entities)
//     businessName: '',
//     businessAddress: '',
//     entityCategory: [],
//     yearsInBusiness: '',
//     staffCount: '',
//     registeredBusiness: false,
//     openingHours: ['Monday - Friday: 8:00 AM - 6:00 PM'],
//   });

//   const [galleryImages, setGalleryImages] = useState([]);
//   const [videoFiles, setVideoFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [isEntity, setIsEntity] = useState(false);   // ← New state

//   // Fetch existing data from /api/dashboard
//   useEffect(() => {
//     const fetchProfile = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });

//         const data = await res.json();
//         console.log("Fetched profile data:", data);

//         if (data.success) {
//           const user = data.user;
//           const bp = user.businessProfile || {};

//           setIsEntity(user.role === 'entity');   // ← Determine if user is entity

//           setFormData({
//             // Basic Info (Always available)
//             firstName: user.firstName || '',
//             lastName: user.lastName || '',
//             state: user.state || '',
//             lga: user.lga || '',
//             profilePicture: user.profilePicture || '',

//             // Business Profile (Only if entity)
//             businessName: bp.businessName || '',
//             businessAddress: bp.businessAddress || '',
//             entityCategory: bp.entityCategory || [],
//             yearsInBusiness: bp.yearsInBusiness || '',
//             staffCount: bp.staffCount || '',
//             registeredBusiness: bp.registeredBusiness || false,
//             openingHours: bp.openingHours && bp.openingHours.length > 0 
//               ? bp.openingHours 
//               : ['Monday - Friday: 8:00 AM - 6:00 PM'],
//           });

//           // Prefill gallery images
//           if (bp.gallery && bp.gallery.length > 0) {
//             const imagesOnly = bp.gallery.filter(item => item.type === 'image');
//             setGalleryImages(imagesOnly);
//           }
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     fetchProfile();
//   }, []);

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };

//   const toggleCategory = (categoryId) => {
//     setFormData(prev => ({
//       ...prev,
//       entityCategory: prev.entityCategory.includes(categoryId)
//         ? prev.entityCategory.filter(id => id !== categoryId)
//         : [...prev.entityCategory, categoryId]
//     }));
//   };

//   const handleImageUpload = (url) => {
//     setGalleryImages(prev => [...prev, { url, type: 'image', platform: 'cloudinary' }]);
//   };

//   const handleVideoSelect = (e) => {
//     const files = Array.from(e.target.files);
//     setVideoFiles(prev => [...prev, ...files]);
//   };

//   const removeImage = (index) => {
//     setGalleryImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const removeVideo = (index) => {
//     setVideoFiles(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const formPayload = new FormData();

//     // Basic User Info (Always sent)
//     formPayload.append('firstName', formData.firstName);
//     formPayload.append('lastName', formData.lastName);
//     formPayload.append('state', formData.state);
//     formPayload.append('lga', formData.lga);
//     formPayload.append('profilePicture', formData.profilePicture);

//     // Business Profile (Only if entity)
//     if (isEntity) {
//       formPayload.append('businessName', formData.businessName);
//       formPayload.append('businessAddress', formData.businessAddress);
//       formPayload.append('yearsInBusiness', formData.yearsInBusiness);
//       formPayload.append('staffCount', formData.staffCount);
//       formPayload.append('registeredBusiness', formData.registeredBusiness);
//       formPayload.append('entityCategory', JSON.stringify(formData.entityCategory));
//       formPayload.append('openingHours', JSON.stringify(formData.openingHours));

//       if (galleryImages.length > 0) {
//         formPayload.append('gallery', JSON.stringify(galleryImages));
//       }

//       videoFiles.forEach(file => {
//         formPayload.append('gallery', file);
//       });
//     }

//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
//         method: 'PUT',
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: formPayload,
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Profile updated successfully! 🎉");
//       } else {
//         toast.error(data.message || "Update failed");
//       }
//     } catch (err) {
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (initialLoading) return <Loading text="Loading profile..." />;

//   return (
//     <div className="max-w-4xl mx-auto">
//       <div className="flex items-center gap-4 mb-8">
//         <Building2 size={32} style={{ color: appConfig.colors.primary }} />
//         <div>
//           <h1 className="text-4xl font-bold text-gray-900">Business Profile</h1>
//           <p className="text-gray-600">Complete your information</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-10">
//         {/* Basic User Information - Always Visible */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//             <User size={24} /> Personal Information
//           </h2>
          
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
//               <input
//                 type="text"
//                 name="firstName"
//                 value={formData.firstName}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 required
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
//               <input
//                 type="text"
//                 name="lastName"
//                 value={formData.lastName}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 required
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
//               <input
//                 type="text"
//                 name="state"
//                 value={formData.state}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//               />
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">LGA</label>
//               <input
//                 type="text"
//                 name="lga"
//                 value={formData.lga}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//               />
//             </div>
//           </div>

//           <div className="mt-6">
//             <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
//             <CloudinaryUpload
//               onUploadComplete={(url) => setFormData(prev => ({ ...prev, profilePicture: url }))}
//               folder="profiles"
//               label="Upload Profile Picture"
//             />
//           </div>
//         </div>

//         {/* Business Profile - Only show if user is entity */}
//         {isEntity && (
//           <>
//             {/* Business Information */}
//             <div className="bg-white rounded-3xl p-8 shadow-sm">
//               <h2 className="text-2xl font-semibold mb-6">Business Information</h2>
              
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Business Name</label>
//                   <input
//                     type="text"
//                     name="businessName"
//                     value={formData.businessName}
//                     onChange={handleChange}
//                     className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Years in Business</label>
//                   <input
//                     type="number"
//                     name="yearsInBusiness"
//                     value={formData.yearsInBusiness}
//                     onChange={handleChange}
//                     className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   />
//                 </div>
//               </div>

//               <div className="mt-6">
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Business Address</label>
//                 <input
//                   type="text"
//                   name="businessAddress"
//                   value={formData.businessAddress}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   placeholder="e.g 12 Adeola Odeku Street, Victoria Island, Lagos"
//                 />
//               </div>
//             </div>

//     {/* Entity Categories */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6">Business Categories</h2>
//           <p className="text-gray-600 mb-4">Select all that apply</p>
          
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//             {entityCategories.map((cat) => {
//               const isSelected = formData.entityCategory.includes(cat.id);
//               return (
//                 <button
//                   key={cat.id}
//                   type="button"
//                   onClick={() => toggleCategory(cat.id)}
//                   className={`p-4 rounded-2xl border text-left transition-all ${
//                     isSelected
//                       ? 'border-[#8B1E3F] bg-[#8B1E3F]/5 shadow-sm'
//                       : 'border-gray-200 hover:border-gray-300'
//                   }`}
//                 >
//                   <span className="text-2xl mb-2 block">{cat.icon}</span>
//                   <p className="font-medium">{cat.name}</p>
//                 </button>
//               );
//             })}
//           </div>
//         </div>

//         {/* Staff Count & Opening Hours */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Staff Count</label>
//             <input
//               type="number"
//               name="staffCount"
//               value={formData.staffCount}
//               onChange={handleChange}
//               className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//               placeholder="Number of employees"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Opening Hours</label>
//             <input
//               type="text"
//               name="openingHours"
//               value={formData.openingHours[0] || ''}
//               onChange={(e) => setFormData(prev => ({
//                 ...prev,
//                 openingHours: [e.target.value]
//               }))}
//               className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//               placeholder="e.g Monday - Friday: 8am - 6pm"
//             />
//           </div>
//         </div>

//         {/* Gallery */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6">Gallery</h2>

//           <div className="mb-8">
//             <label className="block text-sm font-medium text-gray-700 mb-3">Upload Images (Cloudinary)</label>
//             <CloudinaryUpload
//               onUploadComplete={handleImageUpload}
//               folder="business-gallery"
//               label="Add Business Images"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-3">Upload Videos (S3)</label>
//             <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-gray-50">
//               <Camera size={40} className="text-gray-400 mb-3" />
//               <p className="text-sm font-medium">Click to upload videos</p>
//               <p className="text-xs text-gray-500">MP4, MOV (Max 100MB each)</p>
//               <input
//                 type="file"
//                 multiple
//                 accept="video/*"
//                 className="hidden"
//                 onChange={handleVideoSelect}
//               />
//             </label>
//           </div>
//         </div>

//           </>
//         )}

//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-5 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all"
//           style={{ backgroundColor: appConfig.colors.primary }}
//         >
//           {loading ? <Loading size="sm" /> : <> <Save size={24} /> Save Profile </>}
//         </button>
//       </form>
//     </div>
//   );
// }


















































































import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import { entityCategories } from './../../categories/entityCategories';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import Loading from '../../config/Loading';
import { toast } from 'sonner';
import { Save, Camera, Building2, User, Clock, Users, MapPin, Trash2, CheckCircle2 } from 'lucide-react';

function SectionCard({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center flex-shrink-0">
            <Icon size={15} className="text-[#8B1E3F]" />
          </div>
        )}
        <div>
          <h2 className="text-sm font-bold text-gray-900 leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ ...props }) {
  return (
    <input
      {...props}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white"
    />
  );
}

export default function BusinessProfileUpdate() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    state: '',
    lga: '',
    profilePicture: '',
    businessName: '',
    businessAddress: '',
    entityCategory: [],
    yearsInBusiness: '',
    staffCount: '',
    registeredBusiness: false,
    openingHours: ['Monday - Friday: 8:00 AM - 6:00 PM'],
  });

  const [galleryImages, setGalleryImages] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isEntity, setIsEntity] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/dashboard`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          const user = data.user;
          const bp = user.businessProfile || {};
          setIsEntity(user.role === 'entity');
          setFormData({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            state: user.state || '',
            lga: user.lga || '',
            profilePicture: user.profilePicture || '',
            businessName: bp.businessName || '',
            businessAddress: bp.businessAddress || '',
            entityCategory: bp.entityCategory || [],
            yearsInBusiness: bp.yearsInBusiness || '',
            staffCount: bp.staffCount || '',
            registeredBusiness: bp.registeredBusiness || false,
            openingHours: bp.openingHours?.length > 0 ? bp.openingHours : ['Monday - Friday: 8:00 AM - 6:00 PM'],
          });
          if (bp.gallery?.length > 0) setGalleryImages(bp.gallery.filter(i => i.type === 'image'));
        }
      } catch (err) { console.error(err); }
      finally { setInitialLoading(false); }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleCategory = (id) => setFormData(prev => ({
    ...prev,
    entityCategory: prev.entityCategory.includes(id)
      ? prev.entityCategory.filter(c => c !== id)
      : [...prev.entityCategory, id]
  }));

  const handleImageUpload = (url) => setGalleryImages(prev => [...prev, { url, type: 'image', platform: 'cloudinary' }]);
  const handleVideoSelect = (e) => setVideoFiles(prev => [...prev, ...Array.from(e.target.files)]);
  const removeImage = (i) => setGalleryImages(prev => prev.filter((_, idx) => idx !== i));
  const removeVideo = (i) => setVideoFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = new FormData();
    payload.append('firstName', formData.firstName);
    payload.append('lastName', formData.lastName);
    payload.append('state', formData.state);
    payload.append('lga', formData.lga);
    payload.append('profilePicture', formData.profilePicture);

    if (isEntity) {
      payload.append('businessName', formData.businessName);
      payload.append('businessAddress', formData.businessAddress);
      payload.append('yearsInBusiness', formData.yearsInBusiness);
      payload.append('staffCount', formData.staffCount);
      payload.append('registeredBusiness', formData.registeredBusiness);
      payload.append('entityCategory', JSON.stringify(formData.entityCategory));
      payload.append('openingHours', JSON.stringify(formData.openingHours));
      if (galleryImages.length > 0) payload.append('gallery', JSON.stringify(galleryImages));
      videoFiles.forEach(f => payload.append('gallery', f));
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: payload,
      });
      const data = await res.json();
      if (data.success) toast.success("Profile updated successfully!");
      else toast.error(data.message || "Update failed");
    } catch { toast.error("Something went wrong."); }
    finally { setLoading(false); }
  };

  if (initialLoading) return <Loading text="Loading profile..." />;

  return (
    <div className="w-full pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] flex items-center justify-center flex-shrink-0">
          <Building2 size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">
            {isEntity ? 'Business Profile' : 'My Profile'}
          </h1>
          <p className="text-xs text-gray-400">Keep your information up to date</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Profile Picture Preview */}
        {formData.profilePicture && (
          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-rose-100 flex-shrink-0">
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{formData.firstName} {formData.lastName}</p>
              <p className="text-xs text-gray-400 mt-0.5">{isEntity ? 'Business Account' : 'Personal Account'}</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-600 font-medium">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Personal Information */}
        <SectionCard title="Personal Information" subtitle="Your basic account details" icon={User}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="First Name">
              <TextInput type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First name" required />
            </Field>
            <Field label="Last Name">
              <TextInput type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last name" required />
            </Field>
            <Field label="State">
              <TextInput type="text" name="state" value={formData.state} onChange={handleChange} placeholder="e.g. Lagos" />
            </Field>
            <Field label="LGA">
              <TextInput type="text" name="lga" value={formData.lga} onChange={handleChange} placeholder="e.g. Ikeja" />
            </Field>
          </div>

          <div className="mt-4">
            <Field label="Profile Picture">
              <CloudinaryUpload
                onUploadComplete={(url) => setFormData(prev => ({ ...prev, profilePicture: url }))}
                folder="profiles"
                label="Upload Profile Picture"
              />
            </Field>
          </div>
        </SectionCard>

        {/* Business Profile — entity only */}
        {isEntity && (
          <>
            <SectionCard title="Business Information" subtitle="Details about your company" icon={Building2}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Business Name">
                  <TextInput type="text" name="businessName" value={formData.businessName} onChange={handleChange} placeholder="e.g. TechWave Electronics" />
                </Field>
                <Field label="Years in Business">
                  <TextInput type="number" name="yearsInBusiness" value={formData.yearsInBusiness} onChange={handleChange} placeholder="e.g. 5" min="0" />
                </Field>
              </div>
              <div className="mt-4">
                <Field label="Business Address">
                  <TextInput type="text" name="businessAddress" value={formData.businessAddress} onChange={handleChange} placeholder="e.g. 12 Adeola Odeku Street, VI, Lagos" />
                </Field>
              </div>

              {/* Registered Business Toggle */}
              <div className="mt-4 flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50">
                <div>
                  <p className="text-sm font-semibold text-gray-800">CAC Registered</p>
                  <p className="text-xs text-gray-400 mt-0.5">Is your business registered with CAC?</p>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, registeredBusiness: !prev.registeredBusiness }))}
                  className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0 ${
                    formData.registeredBusiness ? 'bg-[#8B1E3F]' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
                    formData.registeredBusiness ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </SectionCard>

            {/* Staff & Hours */}
            <SectionCard title="Operations" subtitle="Staff size and opening hours" icon={Clock}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Number of Staff">
                  <TextInput type="number" name="staffCount" value={formData.staffCount} onChange={handleChange} placeholder="e.g. 12" min="0" />
                </Field>
                <Field label="Opening Hours">
                  <TextInput
                    type="text"
                    value={formData.openingHours[0] || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, openingHours: [e.target.value] }))}
                    placeholder="Mon – Fri: 8am – 6pm"
                  />
                </Field>
              </div>
            </SectionCard>

            {/* Business Categories */}
            <SectionCard title="Business Categories" subtitle="Select all categories that apply" icon={Building2}>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {entityCategories.map((cat) => {
                  const isActive = formData.entityCategory.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={`relative p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 ${
                        isActive ? 'border-[#8B1E3F] bg-rose-50' : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                      }`}
                    >
                      <span className="text-xl block mb-1.5">{cat.icon}</span>
                      <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-[#8B1E3F]' : 'text-gray-600'}`}>{cat.name}</p>
                      {isActive && <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B1E3F]" />}
                    </button>
                  );
                })}
              </div>
              {formData.entityCategory.length > 0 && (
                <p className="text-xs text-[#8B1E3F] font-semibold mt-3">
                  {formData.entityCategory.length} categor{formData.entityCategory.length === 1 ? 'y' : 'ies'} selected
                </p>
              )}
            </SectionCard>

            {/* Gallery */}
            <SectionCard title="Business Gallery" subtitle="Photos and videos of your business" icon={Camera}>
              {/* Images */}
              <div className="mb-5">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Photos</p>
                <CloudinaryUpload
                  onUploadComplete={handleImageUpload}
                  folder="business-gallery"
                  label="Upload Business Images"
                />
                {galleryImages.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-3">
                    {galleryImages.map((img, i) => (
                      <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-100">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                        >
                          <Trash2 size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Videos */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Videos</p>
                <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#8B1E3F] hover:bg-rose-50 transition-all group">
                  <Camera size={24} className="text-gray-300 group-hover:text-[#8B1E3F] mb-2 transition-colors" />
                  <p className="text-xs font-semibold text-gray-400 group-hover:text-[#8B1E3F] transition-colors">Click to upload videos</p>
                  <p className="text-[10px] text-gray-300 mt-0.5">MP4, MOV · Max 100MB each</p>
                  <input type="file" multiple accept="video/*" className="hidden" onChange={handleVideoSelect} />
                </label>

                {videoFiles.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {videoFiles.map((file, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                          <Camera size={13} className="text-[#8B1E3F]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-700 truncate">{file.name}</p>
                          <p className="text-[10px] text-gray-400">{(file.size / 1024 / 1024).toFixed(1)} MB</p>
                        </div>
                        <button type="button" onClick={() => removeVideo(i)} className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </SectionCard>
          </>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 bg-[#8B1E3F] hover:bg-[#7a1835] active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Save size={18} /> Save Profile</>
          }
        </button>
      </form>
    </div>
  );
}