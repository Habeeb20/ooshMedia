// import { useState, useEffect } from 'react';
// import appConfig from '../../config/AppConfig';
// import { productCategories, productCategoryList } from '../../categories/productCategories';
// import { entityCategories } from '../../categories/entityCategories';
// import Loading from '../../config/Loading';
// import { toast } from 'sonner';
// import { Building2, Plus, Edit2, Trash2, Users, Save } from 'lucide-react';


// export default function SellerProfileSetup() {
//   const [formData, setFormData] = useState({
//     sellerTypes: [],
//     productCategories: [],
//     shopName: '',
//     shopDescription: '',
//   });

//   const [sellerChain, setSellerChain] = useState([]);
//   const [editingChainIndex, setEditingChainIndex] = useState(null);
//   const [chainForm, setChainForm] = useState({
//     businessName: '',
//     email: '',
//     phoneNumber: '',
//     address: '',
//     relationship: 'wholesaler'
//   });

//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);

//   // Fetch existing seller profile
//   useEffect(() => {
//     const fetchSellerProfile = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         const data = await res.json();

//         if (data.success && data.sellerProfile) {
//           setFormData({
//             sellerTypes: data.sellerProfile.sellerTypes || [],
//             productCategories: data.sellerProfile.productCategories || [],
//             shopName: data.sellerProfile.shopName || '',
//             shopDescription: data.sellerProfile.shopDescription || '',
//           });
//           setSellerChain(data.sellerProfile.sellerChain || []);
//         }
//       } catch (err) {
//         console.error(err);
//       } finally {
//         setInitialLoading(false);
//       }
//     };

//     fetchSellerProfile();
//   }, []);

//   const toggleSellerType = (type) => {
//     setFormData(prev => ({
//       ...prev,
//       sellerTypes: prev.sellerTypes.includes(type)
//         ? prev.sellerTypes.filter(t => t !== type)
//         : [...prev.sellerTypes, type]
//     }));
//   };

//   const toggleProductCategory = (categoryId) => {
//     setFormData(prev => ({
//       ...prev,
//       productCategories: prev.productCategories.includes(categoryId)
//         ? prev.productCategories.filter(id => id !== categoryId)
//         : [...prev.productCategories, categoryId]
//     }));
//   };

//   const handleChainChange = (e) => {
//     setChainForm({ ...chainForm, [e.target.name]: e.target.value });
//   };

//   const addOrUpdateChain = () => {
//     if (!chainForm.businessName || !chainForm.email) {
//       toast.error("Business name and email are required");
//       return;
//     }

//     if (editingChainIndex !== null) {
//       const updatedChain = [...sellerChain];
//       updatedChain[editingChainIndex] = chainForm;
//       setSellerChain(updatedChain);
//       setEditingChainIndex(null);
//       toast.success("Chain updated");
//     } else {
//       setSellerChain([...sellerChain, chainForm]);
//       toast.success("Seller added to chain");
//     }

//     setChainForm({
//       businessName: '',
//       email: '',
//       phoneNumber: '',
//       address: '',
//       relationship: 'wholesaler'
//     });
//   };

//   const editChain = (index) => {
//     setChainForm(sellerChain[index]);
//     setEditingChainIndex(index);
//   };

//   const deleteChain = (index) => {
//     setSellerChain(sellerChain.filter((_, i) => i !== index));
//     toast.success("Seller removed from chain");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           ...formData,
//           sellerChain
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Seller profile updated successfully! 🎉");
//       } else {
//         toast.error(data.message || "Update failed");
//       }
//     } catch (err) {
//       toast.error("Something went wrong");
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (initialLoading) return <Loading text="Loading seller profile..." />;

//   return (
//     <div className="max-w-5xl mx-auto px-4 py-8">
//       <div className="flex items-center gap-4 mb-10">
//         <div className="w-12 h-12 bg-gradient-to-br from-[#8B1E3F] to-[#C44A6F] rounded-2xl flex items-center justify-center">
//           <Users className="w-7 h-7 text-white" />
//         </div>
//         <div>
//           <h1 className="text-4xl font-bold text-gray-900">Seller Dashboard</h1>
//           <p className="text-gray-600">want to become a seller?? Set up your seller profile and distribution chain</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-10">
//         {/* Seller Types */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6">I am a</h2>
//           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//             {['manufacturer', 'wholesaler', 'retailer'].map((type) => (
//               <button
//                 key={type}
//                 type="button"
//                 onClick={() => toggleSellerType(type)}
//                 className={`p-6 rounded-2xl border-2 transition-all capitalize ${
//                   formData.sellerTypes.includes(type)
//                     ? 'border-[#8B1E3F] bg-[#8B1E3F]/5'
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}
//               >
//                 <p className="font-semibold text-lg">{type}</p>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Shop Details */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6">Shop Information</h2>
//           <div className="space-y-6">
//             {/* <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
//               <input
//                 type="text"
//                 value={formData.shopName}
//                 onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 placeholder="e.g TechWave Electronics"
//               />
//             </div> */}

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Shop Description</label>
//               <textarea
//                 value={formData.shopDescription}
//                 onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
//                 placeholder="Describe your business..."
//               />
//             </div>
//           </div>
//         </div>

//         {/* Product Categories */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6">Product Categories</h2>
//           <p className="text-gray-600 mb-4">Select categories you sell</p>
         
//           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
//   {productCategories.map((cat) => (
//     <button
//       key={cat.id}
//       type="button"
//       onClick={() => toggleProductCategory(cat.id)}
//       className={`p-4 rounded-2xl border text-left transition-all ${
//         formData.productCategories.includes(cat.id)
//           ? 'border-[#8B1E3F] bg-[#8B1E3F]/5'
//           : 'border-gray-200 hover:border-gray-300'
//       }`}
//     >
//       <span className="text-2xl mb-2 block">{cat.icon}</span>
//       <p className="font-medium">{cat.name}</p>
//     </button>
//   ))}
// </div>
        
//         </div>

//         {/* Seller Chain Management */}
//         <div className="bg-white rounded-3xl p-8 shadow-sm">
//           <h2 className="text-2xl font-semibold mb-6">Seller Chain (Distribution Network)</h2>

//           {/* Add/Edit Form */}
//           <div className="bg-gray-50 p-6 rounded-2xl mb-8">
//             <h3 className="font-medium mb-4">{editingChainIndex !== null ? 'Edit' : 'Add'} Distributor</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <input
//                 type="text"
//                 name="businessName"
//                 value={chainForm.businessName}
//                 onChange={handleChainChange}
//                 placeholder="Business Name"
//                 className="px-5 py-4 rounded-2xl border border-gray-200"
//               />
//               <input
//                 type="email"
//                 name="email"
//                 value={chainForm.email}
//                 onChange={handleChainChange}
//                 placeholder="Email Address"
//                 className="px-5 py-4 rounded-2xl border border-gray-200"
//               />
//               <input
//                 type="tel"
//                 name="phoneNumber"
//                 value={chainForm.phoneNumber}
//                 onChange={handleChainChange}
//                 placeholder="Phone Number"
//                 className="px-5 py-4 rounded-2xl border border-gray-200"
//               />
//               <input
//                 type="text"
//                 name="address"
//                 value={chainForm.address}
//                 onChange={handleChainChange}
//                 placeholder="Address"
//                 className="px-5 py-4 rounded-2xl border border-gray-200"
//               />
//             </div>

//             <button
//               type="button"
//               onClick={addOrUpdateChain}
//               className="mt-4 px-6 py-3 bg-[#8B1E3F] text-white rounded-2xl hover:bg-[#A6224A]"
//             >
//               {editingChainIndex !== null ? 'Update' : 'Add to Chain'}
//             </button>
//           </div>

//           {/* List of Chain */}
//           {sellerChain.length > 0 && (
//             <div className="space-y-4">
//               {sellerChain.map((chain, index) => (
//                 <div key={index} className="border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
//                   <div>
//                     <p className="font-semibold">{chain.businessName}</p>
//                     <p className="text-sm text-gray-500">{chain.email}</p>
//                     <p className="text-xs text-gray-400">{chain.relationship}</p>
//                   </div>
//                   <div className="flex gap-2">
//                     <button
//                       type="button"
//                       onClick={() => editChain(index)}
//                       className="p-2 hover:bg-gray-100 rounded-xl"
//                     >
//                       <Edit2 size={18} />
//                     </button>
//                     <button
//                       type="button"
//                       onClick={() => deleteChain(index)}
//                       className="p-2 hover:bg-red-50 text-red-600 rounded-xl"
//                     >
//                       <Trash2 size={18} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-5 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all"
//           style={{ backgroundColor: appConfig.colors.primary }}
//         >
//           <Save size={24} />
//           Save Seller Profile
//         </button>
//       </form>
//     </div>
//   );
// }






































import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import { entityCategories } from './../../categories/entityCategories';
import Loading from '../../config/Loading';
import { toast } from 'sonner';
import { Building2, Plus, Edit2, Trash2, Users, Save } from 'lucide-react';
import { productCategories, productCategoryList } from '../../categories/productCategories';
export default function SellerProfileSetup() {
  const [formData, setFormData] = useState({
    sellerTypes: [],
    productCategories: [],
    shopName: '',
    shopDescription: '',
  });

  const [sellerChain, setSellerChain] = useState([]);
  const [editingChainIndex, setEditingChainIndex] = useState(null);
  const [chainForm, setChainForm] = useState({
    businessName: '',
    email: '',
    phoneNumber: '',
    address: '',
    relationship: 'wholesaler'
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch existing seller profile
  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();

        if (data.success && data.sellerProfile) {
          setFormData({
            sellerTypes: data.sellerProfile.sellerTypes || [],
            productCategories: data.sellerProfile.productCategories || [],
            shopName: data.sellerProfile.shopName || '',
            shopDescription: data.sellerProfile.shopDescription || '',
          });
          setSellerChain(data.sellerProfile.sellerChain || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInitialLoading(false);
      }
    };

    fetchSellerProfile();
  }, []);

  const toggleSellerType = (type) => {
    setFormData(prev => ({
      ...prev,
      sellerTypes: prev.sellerTypes.includes(type)
        ? prev.sellerTypes.filter(t => t !== type)
        : [...prev.sellerTypes, type]
    }));
  };

  const toggleProductCategory = (categoryId) => {
    setFormData(prev => ({
      ...prev,
      productCategories: prev.productCategories.includes(categoryId)
        ? prev.productCategories.filter(id => id !== categoryId)
        : [...prev.productCategories, categoryId]
    }));
  };

  const handleChainChange = (e) => {
    setChainForm({ ...chainForm, [e.target.name]: e.target.value });
  };

  // Add or Update Chain (Backend)
  const addOrUpdateChain = async () => {
    if (!chainForm.businessName || !chainForm.email) {
      toast.error("Business name and email are required");
      return;
    }

    setLoading(true);

    try {
      let res;
      if (editingChainIndex !== null) {
        // Edit existing chain
        const chainId = sellerChain[editingChainIndex]._id;
        res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain/${chainId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(chainForm),
        });
      } else {
        // Add new chain
        res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(chainForm),
        });
      }

      const data = await res.json();

      if (data.success) {
        toast.success(editingChainIndex !== null ? "Chain updated!" : "Seller added to chain!");
        
        // Refresh chain list
        const profileRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success) {
          setSellerChain(profileData.sellerProfile.sellerChain || []);
        }

        setEditingChainIndex(null);
        setChainForm({
          businessName: '',
          email: '',
          phoneNumber: '',
          address: '',
          relationship: 'wholesaler'
        });
      } else {
        toast.error(data.message || "Operation failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const editChain = (index) => {
    setChainForm(sellerChain[index]);
    setEditingChainIndex(index);
  };

  const deleteChain = async (index) => {
    const chainId = sellerChain[index]._id;
    if (!chainId) return;

    if (!window.confirm("Are you sure you want to remove this distributor?")) return;

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain/${chainId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Distributor removed from chain");
        setSellerChain(sellerChain.filter((_, i) => i !== index));
      } else {
        toast.error(data.message || "Failed to remove");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          ...formData,
          sellerChain
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Seller profile updated successfully! 🎉");
      } else {
        toast.error(data.message || "Update failed");
      }
    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) return <Loading text="Loading seller profile..." />;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-gradient-to-br from-[#8B1E3F] to-[#C44A6F] rounded-2xl flex items-center justify-center">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Set up your seller profile and distribution chain</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* Seller Types, Shop Details, Product Categories - unchanged */}
   <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">I am a</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['manufacturer', 'wholesaler', 'retailer'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => toggleSellerType(type)}
                className={`p-6 rounded-2xl border-2 transition-all capitalize ${
                  formData.sellerTypes.includes(type)
                    ? 'border-[#8B1E3F] bg-[#8B1E3F]/5'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <p className="font-semibold text-lg">{type}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Shop Details */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Shop Information</h2>
          <div className="space-y-6">
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shop Name</label>
              <input
                type="text"
                value={formData.shopName}
                onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                placeholder="e.g TechWave Electronics"
              />
            </div> */}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Shop Description</label>
              <textarea
                value={formData.shopDescription}
                onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
                placeholder="Describe your business..."
              />
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Product Categories</h2>
          <p className="text-gray-600 mb-4">Select categories you sell</p>
         
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
  {productCategories.map((cat) => (
    <button
      key={cat.id}
      type="button"
      onClick={() => toggleProductCategory(cat.id)}
      className={`p-4 rounded-2xl border text-left transition-all ${
        formData.productCategories.includes(cat.id)
          ? 'border-[#8B1E3F] bg-[#8B1E3F]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <span className="text-2xl mb-2 block">{cat.icon}</span>
      <p className="font-medium">{cat.name}</p>
    </button>
  ))}
</div>
        
        </div>

        {/* Seller Chain Management */}
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-6">Seller Chain (Distribution Network)</h2>

          {/* Add/Edit Form */}
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <h3 className="font-medium mb-4">
              {editingChainIndex !== null ? 'Edit Distributor' : 'Add New Distributor'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="businessName"
                value={chainForm.businessName}
                onChange={handleChainChange}
                placeholder="Business Name"
                className="px-5 py-4 rounded-2xl border border-gray-200"
              />
              <input
                type="email"
                name="email"
                value={chainForm.email}
                onChange={handleChainChange}
                placeholder="Email Address"
                className="px-5 py-4 rounded-2xl border border-gray-200"
              />
              <input
                type="tel"
                name="phoneNumber"
                value={chainForm.phoneNumber}
                onChange={handleChainChange}
                placeholder="Phone Number"
                className="px-5 py-4 rounded-2xl border border-gray-200"
              />
              <input
                type="text"
                name="address"
                value={chainForm.address}
                onChange={handleChainChange}
                placeholder="Address"
                className="px-5 py-4 rounded-2xl border border-gray-200"
              />
            </div>

            <button
              type="button"
              onClick={addOrUpdateChain}
              disabled={loading}
              className="mt-4 px-6 py-3 bg-[#8B1E3F] text-white rounded-2xl hover:bg-[#A6224A]"
            >
              {editingChainIndex !== null ? 'Update Distributor' : 'Add to Chain'}
            </button>
          </div>

          {/* List of Chain */}
          {sellerChain.length > 0 && (
            <div className="space-y-4">
              {sellerChain.map((chain, index) => (
                <div key={index} className="border border-gray-200 rounded-2xl p-5 flex justify-between items-center">
                  <div>
                    <p className="font-semibold">{chain.businessName}</p>
                    <p className="text-sm text-gray-500">{chain.email}</p>
                    <p className="text-xs text-gray-400">{chain.relationship}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => editChain(index)}
                      className="p-2 hover:bg-gray-100 rounded-xl text-gray-600"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteChain(index)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-xl"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-5 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-3 hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: appConfig.colors.primary }}
        >
          <Save size={24} />
          Save Seller Profile
        </button>
      </form>
    </div>
  );
}