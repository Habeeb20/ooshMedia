/* eslint-disable no-unused-vars */






// import { useState } from 'react';
// import { X, ToggleLeft, ToggleRight } from 'lucide-react';
// import { toast } from 'sonner';
// import CloudinaryUpload from '../../config/CloudinaryUpload';
// import { productCategories } from '../../categories/productCategories';
// import { partCategories } from "../../categories/partCategories";

// export default function AddProductModal({ onClose, onSuccess }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     subCategory: '',
//     stockQuantity: '',
//     lowStockThreshold: 10,
//     part: false,
//     whatPart: '',
//     subCategoryPart: '',
//   });

//   const [images, setImages] = useState([]); // Array of {url, publicId}
//   const [loading, setLoading] = useState(false);

//   const selectedCategory = productCategories.find(cat => cat.id === formData.category);
//   const selectedPartCategory = partCategories.find(cat => cat.id === formData.whatPart);

//   // const handleChange = (e) => {
//   //   const { name, value } = e.target;
//   //   setFormData(prev => ({ ...prev, [name]: value }));
//   // };

//     const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // Add this new handler
//   const handleCategoryChange = (e) => {
//     const categoryId = e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       category: categoryId,
//       subCategory: '' // Reset subcategory when category changes
//     }));
//   };

//   const handleTogglePart = () => {
//     setFormData(prev => ({ 
//       ...prev, 
//       part: !prev.part,
//       // Reset part fields when toggled off
//       whatPart: !prev.part ? prev.whatPart : '',
//       subCategoryPart: !prev.part ? prev.subCategoryPart : ''
//     }));
//   };

//   const handleImageUpload = (url, publicId) => {
//     setImages(prev => [...prev, { url, publicId }]);
//   };

//   const removeImage = (index) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (images.length === 0) {
//       toast.error("Please upload at least one product image");
//       return;
//     }
//     if (!formData.category) {
//       toast.error("Please select a category");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           ...formData,
//           price: Number(formData.price),
//           stockQuantity: Number(formData.stockQuantity),
//           images: images.map((img, index) => ({ 
//             url: img.url, 
//             publicId: img.publicId,
//             isPrimary: index === 0 
//           })),
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Product added successfully!");
//         onSuccess();
//         onClose();
//       } else {
//         toast.error(data.message || "Failed to add product");
//       }
//     } catch (err) {
//       toast.error("Something went wrong");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
//       <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-8">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-3xl font-bold">Add New Product</h2>
//             <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
//               <X size={28} />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Images */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">
//                 Product Images <span className="text-red-500">*</span>
//               </label>
//               <CloudinaryUpload
//                 onUploadComplete={handleImageUpload}
//                 folder="products"
//                 label="Upload Product Images"
//               />

//               {images.length > 0 && (
//                 <div className="mt-4 grid grid-cols-4 gap-3">
//                   {images.map((img, index) => (
//                     <div key={index} className="relative group">
//                       <img 
//                         src={img.url} 
//                         alt={`preview-${index}`}
//                         className="w-full h-20 object-cover rounded-xl border"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Basic Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
//                 <input
//                   type="number"
//                   name="price"
//                   required
//                   value={formData.price}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>
//             </div>

//             {/* Category & Subcategory */}
//             {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                 <select
//                   name="category"
//                   required
//                   value={formData.category}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 >
//                   <option value="">Select Category</option>
//                   {productCategories.map(cat => (
//                     <option key={cat.name} value={cat.name}>
//                       {cat.icon} {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedCategory && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory</label>
//                   <input
//                     type="text"
//                     name="subCategory"
//                     value={formData.subCategory}
//                     onChange={handleChange}
//                     placeholder="e.g. Smartphones, Brake Pads, etc."
//                     className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   />
//                 </div>
//               )}
//             </div> */}

//                         {/* Category & Subcategory */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                 <select
//                   name="category"
//                   required
//                   value={formData.category}
//                   onChange={handleCategoryChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 >
//                   <option value="">Select Category</option>
//                   {productCategories.map(cat => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.icon} {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedCategory && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
//                   <select
//                     name="subCategory"
//                     required
//                     value={formData.subCategory}
//                     onChange={handleChange}
//                     className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   >
//                     <option value="">Select Subcategory</option>
//                     {selectedCategory?.subcategories?.map((sub, index) => (
//                       <option key={index} value={sub}>
//                         {sub}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>

//             {/* Is Spare Part Toggle */}
//             <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
//               <button
//                 type="button"
//                 onClick={handleTogglePart}
//                 className="flex items-center gap-2 text-sm font-medium"
//               >
//                 {formData.part ? (
//                   <ToggleRight size={28} className="text-green-600" />
//                 ) : (
//                   <ToggleLeft size={28} className="text-gray-400" />
//                 )}
//                 <span>This is a Spare Part</span>
//               </button>
//             </div>

//             {/* Spare Part Fields */}
//             {formData.part && (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-orange-50 p-6 rounded-2xl border border-orange-100">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Part Category *</label>
//                   <select
//                     name="whatPart"
//                     required={formData.part}
//                     value={formData.whatPart}
//                     onChange={handleChange}
//                     className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   >
//                     <option value="">Select Part Category</option>
//                     {partCategories.map(cat => (
//                       <option key={cat.id} value={cat.id}>
//                         {cat.icon} {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>

//                 {selectedPartCategory && (
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Part Subcategory</label>
//                     <input
//                       type="text"
//                       name="subCategoryPart"
//                       value={formData.subCategoryPart}
//                       onChange={handleChange}
//                       placeholder="e.g. Engine Piston, iPhone Screen, etc."
//                       className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                     />
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
//               <textarea
//                 name="description"
//                 required
//                 value={formData.description}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
//               />
//             </div>

//             {/* Stock Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
//                 <input
//                   type="number"
//                   name="stockQuantity"
//                   required
//                   value={formData.stockQuantity}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
//                 <input
//                   type="number"
//                   name="lowStockThreshold"
//                   value={formData.lowStockThreshold}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 bg-[#8B1E3F] text-white rounded-2xl font-semibold text-lg hover:bg-[#A6224A] transition"
//             >
//               {loading ? "Adding Product..." : "Add Product"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }

















import { useState } from 'react';
import { X, ToggleLeft, ToggleRight } from 'lucide-react';
import { toast } from 'sonner';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import { productCategories } from '../../categories/productCategories';

import { productVariants } from '../../partVariants';
const GEAR_TRANSMISSION_OPTIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
const FUEL_TYPE_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG / LPG'];

// Descending list of years for the "Year of Make" dropdown, from the current
// year back to 1980 — covers essentially all vehicles likely to be listed.
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from(
  { length: CURRENT_YEAR - 1980 + 1 },
  (_, i) => CURRENT_YEAR - i
);

export default function AddProductModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    subCategory: '',
    stockQuantity: '',
    lowStockThreshold: 10,
    part: false,
    whatPart: '',
    subCategoryPart: '',
    gearTransmission: '',
    yearOfMake: '',
    maker:'',
    fuelType: '',
  });


  const [hasVariety, setHasVariety] = useState(false);
const [varieties, setVarieties] = useState([]); // {id, name, price, type, image, publicId}
 const selectedCategory = productCategories.find(cat => cat.id === formData.category);
const isGroceryCategory =
  selectedCategory?.name?.toLowerCase().includes('grocer') ||
  selectedCategory?.name?.toLowerCase().includes('food');

  const [images, setImages] = useState([]); // Array of {url, publicId}
  const [loading, setLoading] = useState(false);

 

  // The chosen part "category" (e.g. "Car Parts", "Phone Parts") from productVariants
  const selectedPartVariant = productVariants.find(v => v.category === formData.whatPart);

  // Only Car Parts need the extra vehicle-specific fields
  const isCarPart = formData.whatPart === 'Car Parts';
  const showCarPartExtras = isCarPart && !!formData.subCategoryPart;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleCategoryChange = (e) => {
  //   const categoryId = e.target.value;
  //   setFormData(prev => ({
  //     ...prev,
  //     category: categoryId,
  //     subCategory: '', // Reset subcategory when category changes
  //   }));
  // };


  const handleCategoryChange = (e) => {
  const categoryId = e.target.value;
  const newCat = productCategories.find(c => c.id === categoryId);
  const stillGrocery = newCat?.name?.toLowerCase().includes('grocer') || newCat?.name?.toLowerCase().includes('food');

  setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));

  if (!stillGrocery) {
    setHasVariety(false);
    setVarieties([]);
  }
};


const addVarietyRow = () => {
  setVarieties(prev => [...prev, {
    id: Date.now() + Math.random(),
    name: '',
    price: '',
    type: 'food',
    image: '',
    publicId: '',
  }]);
};

const removeVarietyRow = (id) => {
  setVarieties(prev => prev.filter(v => v.id !== id));
};

const updateVarietyField = (id, field, value) => {
  setVarieties(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
};

const handleVarietyImageUpload = (id, url, publicId) => {
  setVarieties(prev => prev.map(v => v.id === id ? { ...v, image: url, publicId } : v));
};

const handleToggleVariety = () => {
  const next = !hasVariety;
  setHasVariety(next);
  if (!next) {
    setVarieties([]);
  } else if (varieties.length === 0) {
    addVarietyRow();
  }
};

  // When the part category changes (e.g. switching from "Car Parts" to
  // "Phone Parts"), reset the subcategory AND the car-specific extra fields,
  // since they only apply to Car Parts.
  const handleWhatPartChange = (e) => {
    const whatPart = e.target.value;
    setFormData(prev => ({
      ...prev,
      whatPart,
      subCategoryPart: '',
      gearTransmission: '',
      maker:'',
      yearOfMake: '',
      fuelType: '',
    }));
  };

  // Reset the car-specific extras if the subcategory changes to something
  // that isn't actually a car part subcategory anymore (defensive, in case
  // whatPart and subCategoryPart get out of sync).
  const handleSubCategoryPartChange = (e) => {
    const subCategoryPart = e.target.value;
    setFormData(prev => ({ ...prev, subCategoryPart }));
  };

  const handleTogglePart = () => {
    setFormData(prev => ({
      ...prev,
      part: !prev.part,
      // Reset part fields when toggled off
      whatPart: !prev.part ? prev.whatPart : '',
      subCategoryPart: !prev.part ? prev.subCategoryPart : '',
      gearTransmission: !prev.part ? prev.gearTransmission : '',
      yearOfMake: !prev.part ? prev.yearOfMake : '',
      maker: !prev.part ? prev.maker : '',
      fuelType: !prev.part ? prev.fuelType : '',
    }));
  };

  const handleImageUpload = (url, publicId) => {
    setImages(prev => [...prev, { url, publicId }]);
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (images.length === 0) {
      toast.error("Please upload at least one product image");
      return;
    }
    if (!formData.category) {
      toast.error("Please select a category");
      return;
    }
    if (showCarPartExtras && (!formData.gearTransmission || !formData.yearOfMake || !formData.maker || !formData.fuelType)) {
      toast.error("Please fill in gear transmission, year of make, maker, and fuel type");
      return;
    }

    if (hasVariety) {
  if (varieties.length === 0) {
    toast.error("Add at least one variety");
    return;
  }
  const incomplete = varieties.some(v => !v.name || !v.price || !v.type || !v.image);
  if (incomplete) {
    toast.error("Please complete all variety fields (name, price, type, image)");
    return;
  }
}

    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
  ...formData,
  price: Number(formData.price),
  stockQuantity: Number(formData.stockQuantity),
  hasVariety,
  varieties: hasVariety ? varieties.map(v => ({
    name: v.name,
    price: Number(v.price),
    type: v.type,
    image: v.image,
    publicId: v.publicId,
  })) : [],
  images: images.map((img, index) => ({
    url: img.url,
    publicId: img.publicId,
    isPrimary: index === 0
  })),
}),
      
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Product added successfully!");
        onSuccess();
        onClose();
      } else {
        toast.error(data.message || "Failed to add product");
      }
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Add New Product</h2>
            <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={28} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images <span className="text-red-500">*</span>
              </label>
              <CloudinaryUpload
                onUploadComplete={handleImageUpload}
                folder="products"
                label="Upload Product Images"
              />

              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((img, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={img.url}
                        alt={`preview-${index}`}
                        className="w-full h-20 object-cover rounded-xl border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                <input
                  type="number"
                  name="price"
                  required
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                />
              </div>
            </div>

            {/* Category & Subcategory */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                >
                  <option value="">Select Category</option>
                  {productCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategory && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
                  <select
                    name="subCategory"
                    required
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                  >
                    <option value="">Select Subcategory</option>
                    {selectedCategory?.subcategories?.map((sub, index) => (
                      <option key={index} value={sub}>
                        {sub}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {isGroceryCategory && (
  <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
    <button
      type="button"
      onClick={handleToggleVariety}
      className="flex items-center gap-2 text-sm font-medium"
    >
      {hasVariety ? (
        <ToggleRight size={28} className="text-green-600" />
      ) : (
        <ToggleLeft size={28} className="text-gray-400" />
      )}
      <span>This product has varieties / combos (e.g. meal + drink options)</span>
    </button>

    {hasVariety && (
      <div className="mt-5 space-y-4">
        {varieties.map((v, idx) => (
          <div key={v.id} className="bg-white rounded-2xl border border-emerald-200 p-4 relative">
            <button
              type="button"
              onClick={() => removeVarietyRow(v.id)}
              className="absolute top-3 right-3 text-red-400 hover:text-red-600"
            >
              <X size={18} />
            </button>
            <p className="text-sm font-semibold text-gray-700 mb-3">Variety {idx + 1}</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => updateVarietyField(v.id, 'name', e.target.value)}
                  placeholder="e.g. Jollof Rice + Chicken"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8B1E3F] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Price (₦) *</label>
                <input
                  type="number"
                  value={v.price}
                  onChange={(e) => updateVarietyField(v.id, 'price', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8B1E3F] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                <select
                  value={v.type}
                  onChange={(e) => updateVarietyField(v.id, 'type', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#8B1E3F] text-sm"
                >
                  <option value="food">Food</option>
                  <option value="drink">Drink</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-medium text-gray-600 mb-2">Variety Image *</label>
              {v.image ? (
                <div className="relative w-24 h-24">
                  <img src={v.image} alt={v.name} className="w-24 h-24 object-cover rounded-xl border" />
                  <button
                    type="button"
                    onClick={() => updateVarietyField(v.id, 'image', '')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                  >
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <CloudinaryUpload
                  onUploadComplete={(url, publicId) => handleVarietyImageUpload(v.id, url, publicId)}
                  folder="product-varieties"
                  label=""
                />
              )}
            </div>
          </div>
        ))}

        <button
          type="button"
          onClick={addVarietyRow}
          className="w-full py-3 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition"
        >
          + Add Another Variety
        </button>
      </div>
    )}
  </div>
)}

            {/* Is Spare Part Toggle */}
            <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
              <button
                type="button"
                onClick={handleTogglePart}
                className="flex items-center gap-2 text-sm font-medium"
              >
                {formData.part ? (
                  <ToggleRight size={28} className="text-green-600" />
                ) : (
                  <ToggleLeft size={28} className="text-gray-400" />
                )}
                <span>This is a Spare Part</span>
              </button>
            </div>

            {/* Spare Part Fields */}
            {formData.part && (
              <div className="space-y-6 bg-orange-50 p-6 rounded-2xl border border-orange-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Part Category *</label>
                    <select
                      name="whatPart"
                      required={formData.part}
                      value={formData.whatPart}
                      onChange={handleWhatPartChange}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                    >
                      <option value="">Select Part Category</option>
                      {productVariants.map(variant => (
                        <option key={variant.category} value={variant.category}>
                          {variant.category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPartVariant && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Part Subcategory *</label>
                      <select
                        name="subCategoryPart"
                        required={formData.part}
                        value={formData.subCategoryPart}
                        onChange={handleSubCategoryPartChange}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                      >
                        <option value="">Select Part Subcategory</option>
                        {selectedPartVariant.subCategories.map((sub) => (
                          <option key={sub} value={sub}>
                            {sub}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Car-specific extra fields — only shown once both a Car
                    Parts category AND a subcategory have been selected */}
                {showCarPartExtras && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-orange-200">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Gear Transmission *</label>
                      <select
                        name="gearTransmission"
                        required={showCarPartExtras}
                        value={formData.gearTransmission}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                      >
                        <option value="">Select Transmission</option>
                        {GEAR_TRANSMISSION_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Year of Make *</label>
                      <select
                        name="yearOfMake"
                        required={showCarPartExtras}
                        value={formData.yearOfMake}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                      >
                        <option value="">Select Year</option>
                        {YEAR_OPTIONS.map((year) => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
                      <select
                        name="fuelType"
                        required={showCarPartExtras}
                        value={formData.fuelType}
                        onChange={handleChange}
                        className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                      >
                        <option value="">Select Fuel Type</option>
                        {FUEL_TYPE_OPTIONS.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">car maker *</label>
                        <input
                  type="text"
                  name="maker"
                    required={showCarPartExtras}
                 value={formData.maker}
              
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                />
                      
                      
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
              />
            </div>

            {/* Stock Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
                <input
                  type="number"
                  name="stockQuantity"
                  required
                  value={formData.stockQuantity}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
                <input
                  type="number"
                  name="lowStockThreshold"
                  value={formData.lowStockThreshold}
                  onChange={handleChange}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#8B1E3F] text-white rounded-2xl font-semibold text-lg hover:bg-[#A6224A] transition"
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// import { useState } from 'react';
// import { X, ToggleLeft, ToggleRight } from 'lucide-react';
// import { toast } from 'sonner';
// import CloudinaryUpload from '../../config/CloudinaryUpload';
// import { productCategories } from '../../categories/productCategories';

// import { productVariants } from '../../partVariants';
// const GEAR_TRANSMISSION_OPTIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
// const FUEL_TYPE_OPTIONS = ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG / LPG'];

// // Descending list of years for the "Year of Make" dropdown, from the current
// // year back to 1980 — covers essentially all vehicles likely to be listed.
// const CURRENT_YEAR = new Date().getFullYear();
// const YEAR_OPTIONS = Array.from(
//   { length: CURRENT_YEAR - 1980 + 1 },
//   (_, i) => CURRENT_YEAR - i
// );

// export default function AddProductModal({ onClose, onSuccess }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     subCategory: '',
//     stockQuantity: '',
//     lowStockThreshold: 10,
//     part: false,
//     whatPart: '',
//     subCategoryPart: '',
//     gearTransmission: '',
//     yearOfMake: '',
//     maker:'',
//     fuelType: '',
//   });


//   const [hasVariety, setHasVariety] = useState(false);
// const [varieties, setVarieties] = useState([]); // {id, name, price, type, image, publicId}

// const isGroceryCategory =
//   selectedCategory?.name?.toLowerCase().includes('grocer') ||
//   selectedCategory?.name?.toLowerCase().includes('food');

//   const [images, setImages] = useState([]); // Array of {url, publicId}
//   const [loading, setLoading] = useState(false);

//   const selectedCategory = productCategories.find(cat => cat.id === formData.category);

//   // The chosen part "category" (e.g. "Car Parts", "Phone Parts") from productVariants
//   const selectedPartVariant = productVariants.find(v => v.category === formData.whatPart);

//   // Only Car Parts need the extra vehicle-specific fields
//   const isCarPart = formData.whatPart === 'Car Parts';
//   const showCarPartExtras = isCarPart && !!formData.subCategoryPart;

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   // const handleCategoryChange = (e) => {
//   //   const categoryId = e.target.value;
//   //   setFormData(prev => ({
//   //     ...prev,
//   //     category: categoryId,
//   //     subCategory: '', // Reset subcategory when category changes
//   //   }));
//   // };


//   const handleCategoryChange = (e) => {
//   const categoryId = e.target.value;
//   const newCat = productCategories.find(c => c.id === categoryId);
//   const stillGrocery = newCat?.name?.toLowerCase().includes('grocer') || newCat?.name?.toLowerCase().includes('food');

//   setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));

//   if (!stillGrocery) {
//     setHasVariety(false);
//     setVarieties([]);
//   }
// };


// const addVarietyRow = () => {
//   setVarieties(prev => [...prev, {
//     id: Date.now() + Math.random(),
//     name: '',
//     price: '',
//     type: 'food',
//     image: '',
//     publicId: '',
//   }]);
// };

// const removeVarietyRow = (id) => {
//   setVarieties(prev => prev.filter(v => v.id !== id));
// };

// const updateVarietyField = (id, field, value) => {
//   setVarieties(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
// };

// const handleVarietyImageUpload = (id, url, publicId) => {
//   setVarieties(prev => prev.map(v => v.id === id ? { ...v, image: url, publicId } : v));
// };

// const handleToggleVariety = () => {
//   const next = !hasVariety;
//   setHasVariety(next);
//   if (!next) {
//     setVarieties([]);
//   } else if (varieties.length === 0) {
//     addVarietyRow();
//   }
// };

//   // When the part category changes (e.g. switching from "Car Parts" to
//   // "Phone Parts"), reset the subcategory AND the car-specific extra fields,
//   // since they only apply to Car Parts.
//   const handleWhatPartChange = (e) => {
//     const whatPart = e.target.value;
//     setFormData(prev => ({
//       ...prev,
//       whatPart,
//       subCategoryPart: '',
//       gearTransmission: '',
//       maker:'',
//       yearOfMake: '',
//       fuelType: '',
//     }));
//   };

//   // Reset the car-specific extras if the subcategory changes to something
//   // that isn't actually a car part subcategory anymore (defensive, in case
//   // whatPart and subCategoryPart get out of sync).
//   const handleSubCategoryPartChange = (e) => {
//     const subCategoryPart = e.target.value;
//     setFormData(prev => ({ ...prev, subCategoryPart }));
//   };

//   const handleTogglePart = () => {
//     setFormData(prev => ({
//       ...prev,
//       part: !prev.part,
//       // Reset part fields when toggled off
//       whatPart: !prev.part ? prev.whatPart : '',
//       subCategoryPart: !prev.part ? prev.subCategoryPart : '',
//       gearTransmission: !prev.part ? prev.gearTransmission : '',
//       yearOfMake: !prev.part ? prev.yearOfMake : '',
//       maker: !prev.part ? prev.maker : '',
//       fuelType: !prev.part ? prev.fuelType : '',
//     }));
//   };

//   const handleImageUpload = (url, publicId) => {
//     setImages(prev => [...prev, { url, publicId }]);
//   };

//   const removeImage = (index) => {
//     setImages(prev => prev.filter((_, i) => i !== index));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (images.length === 0) {
//       toast.error("Please upload at least one product image");
//       return;
//     }
//     if (!formData.category) {
//       toast.error("Please select a category");
//       return;
//     }
//     if (showCarPartExtras && (!formData.gearTransmission || !formData.yearOfMake || !formData.maker || !formData.fuelType)) {
//       toast.error("Please fill in gear transmission, year of make, maker, and fuel type");
//       return;
//     }

//     setLoading(true);

//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           ...formData,
//           price: Number(formData.price),
//           stockQuantity: Number(formData.stockQuantity),
//           images: images.map((img, index) => ({
//             url: img.url,
//             publicId: img.publicId,
//             isPrimary: index === 0
//           })),
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Product added successfully!");
//         onSuccess();
//         onClose();
//       } else {
//         toast.error(data.message || "Failed to add product");
//       }
//     } catch (err) {
//       toast.error("Something went wrong");
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
//       <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="p-8">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-3xl font-bold">Add New Product</h2>
//             <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
//               <X size={28} />
//             </button>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Images */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-3">
//                 Product Images <span className="text-red-500">*</span>
//               </label>
//               <CloudinaryUpload
//                 onUploadComplete={handleImageUpload}
//                 folder="products"
//                 label="Upload Product Images"
//               />

//               {images.length > 0 && (
//                 <div className="mt-4 grid grid-cols-4 gap-3">
//                   {images.map((img, index) => (
//                     <div key={index} className="relative group">
//                       <img
//                         src={img.url}
//                         alt={`preview-${index}`}
//                         className="w-full h-20 object-cover rounded-xl border"
//                       />
//                       <button
//                         type="button"
//                         onClick={() => removeImage(index)}
//                         className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
//                       >
//                         ✕
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             {/* Basic Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
//                 <input
//                   type="text"
//                   name="name"
//                   required
//                   value={formData.name}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
//                 <input
//                   type="number"
//                   name="price"
//                   required
//                   value={formData.price}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>
//             </div>

//             {/* Category & Subcategory */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                 <select
//                   name="category"
//                   required
//                   value={formData.category}
//                   onChange={handleCategoryChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 >
//                   <option value="">Select Category</option>
//                   {productCategories.map(cat => (
//                     <option key={cat.id} value={cat.id}>
//                       {cat.icon} {cat.name}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {selectedCategory && (
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-2">Subcategory *</label>
//                   <select
//                     name="subCategory"
//                     required
//                     value={formData.subCategory}
//                     onChange={handleChange}
//                     className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                   >
//                     <option value="">Select Subcategory</option>
//                     {selectedCategory?.subcategories?.map((sub, index) => (
//                       <option key={index} value={sub}>
//                         {sub}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//               )}
//             </div>

//             {/* Is Spare Part Toggle */}
//             <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
//               <button
//                 type="button"
//                 onClick={handleTogglePart}
//                 className="flex items-center gap-2 text-sm font-medium"
//               >
//                 {formData.part ? (
//                   <ToggleRight size={28} className="text-green-600" />
//                 ) : (
//                   <ToggleLeft size={28} className="text-gray-400" />
//                 )}
//                 <span>This is a Spare Part</span>
//               </button>
//             </div>

//             {/* Spare Part Fields */}
//             {formData.part && (
//               <div className="space-y-6 bg-orange-50 p-6 rounded-2xl border border-orange-100">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-2">Part Category *</label>
//                     <select
//                       name="whatPart"
//                       required={formData.part}
//                       value={formData.whatPart}
//                       onChange={handleWhatPartChange}
//                       className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                     >
//                       <option value="">Select Part Category</option>
//                       {productVariants.map(variant => (
//                         <option key={variant.category} value={variant.category}>
//                           {variant.category}
//                         </option>
//                       ))}
//                     </select>
//                   </div>

//                   {selectedPartVariant && (
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Part Subcategory *</label>
//                       <select
//                         name="subCategoryPart"
//                         required={formData.part}
//                         value={formData.subCategoryPart}
//                         onChange={handleSubCategoryPartChange}
//                         className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                       >
//                         <option value="">Select Part Subcategory</option>
//                         {selectedPartVariant.subCategories.map((sub) => (
//                           <option key={sub} value={sub}>
//                             {sub}
//                           </option>
//                         ))}
//                       </select>
//                     </div>
//                   )}
//                 </div>

//                 {/* Car-specific extra fields — only shown once both a Car
//                     Parts category AND a subcategory have been selected */}
//                 {showCarPartExtras && (
//                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-5 rounded-2xl border border-orange-200">
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Gear Transmission *</label>
//                       <select
//                         name="gearTransmission"
//                         required={showCarPartExtras}
//                         value={formData.gearTransmission}
//                         onChange={handleChange}
//                         className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                       >
//                         <option value="">Select Transmission</option>
//                         {GEAR_TRANSMISSION_OPTIONS.map((option) => (
//                           <option key={option} value={option}>{option}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Year of Make *</label>
//                       <select
//                         name="yearOfMake"
//                         required={showCarPartExtras}
//                         value={formData.yearOfMake}
//                         onChange={handleChange}
//                         className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                       >
//                         <option value="">Select Year</option>
//                         {YEAR_OPTIONS.map((year) => (
//                           <option key={year} value={year}>{year}</option>
//                         ))}
//                       </select>
//                     </div>

//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type *</label>
//                       <select
//                         name="fuelType"
//                         required={showCarPartExtras}
//                         value={formData.fuelType}
//                         onChange={handleChange}
//                         className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                       >
//                         <option value="">Select Fuel Type</option>
//                         {FUEL_TYPE_OPTIONS.map((option) => (
//                           <option key={option} value={option}>{option}</option>
//                         ))}
//                       </select>
//                     </div>
//                     <div>
//                       <label className="block text-sm font-medium text-gray-700 mb-2">car maker *</label>
//                         <input
//                   type="text"
//                   name="maker"
//                     required={showCarPartExtras}
//                  value={formData.maker}
              
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
                      
                      
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
//               <textarea
//                 name="description"
//                 required
//                 value={formData.description}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
//               />
//             </div>

//             {/* Stock Info */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity *</label>
//                 <input
//                   type="number"
//                   name="stockQuantity"
//                   required
//                   value={formData.stockQuantity}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Low Stock Alert</label>
//                 <input
//                   type="number"
//                   name="lowStockThreshold"
//                   value={formData.lowStockThreshold}
//                   onChange={handleChange}
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//                 />
//               </div>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 bg-[#8B1E3F] text-white rounded-2xl font-semibold text-lg hover:bg-[#A6224A] transition"
//             >
//               {loading ? "Adding Product..." : "Add Product"}
//             </button>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// }