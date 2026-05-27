// import { useState } from 'react';
// import appConfig from '../../config/AppConfig';
// import CloudinaryUpload from '../../config/CloudinaryUpload';
// import { productCategories } from '../../categories/productCategories';

// import { toast } from 'sonner';
// import { X } from 'lucide-react';

// export default function AddProductModal({ onClose, onSuccess }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     description: '',
//     price: '',
//     category: '',
//     stockQuantity: '',
//     lowStockThreshold: 10,
//   });

//   const [images, setImages] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleImageUpload = (url) => {
//     setImages(prev => [...prev, url]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
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
//           images: images.map(url => ({ url, isPrimary: false })),
//           price: Number(formData.price),
//           stockQuantity: Number(formData.stockQuantity),
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
//             <CloudinaryUpload
//               onUploadComplete={handleImageUpload}
//               folder="products"
//               label="Product Images"
//             />

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
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
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
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

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
//               <select
//                 name="category"
//                 required
//                 value={formData.category}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//               >
//                 <option value="">Select Category</option>
//                 {productCategories.map(cat => (
//                   <option key={cat.id} value={cat.name}>{cat.name}</option>
//                 ))}
//               </select>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
//               <textarea
//                 name="description"
//                 required
//                 value={formData.description}
//                 onChange={handleChange}
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
//               />
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
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
import appConfig from '../../config/AppConfig';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import { productCategories } from '../../categories/productCategories';

import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function AddProductModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stockQuantity: '',
    lowStockThreshold: 10,
  });

  const [images, setImages] = useState([]); // Array to hold multiple images
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (url) => {
    setImages(prev => [...prev, url]);
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
          images: images.map((url, index) => ({ 
            url, 
            isPrimary: index === 0 
          })),
          price: Number(formData.price),
          stockQuantity: Number(formData.stockQuantity),
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
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={28} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Multiple Images Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Product Images <span className="text-red-500">*</span>
              </label>
              <CloudinaryUpload
                onUploadComplete={handleImageUpload}
                folder="products"
                label="Upload Product Images (Multiple allowed)"
              />

              {/* Preview Selected Images */}
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {images.map((url, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={url} 
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦)</label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                required
                value={formData.category}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
              >
                <option value="">Select Category</option>
                {productCategories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                name="description"
                required
                value={formData.description}
                onChange={handleChange}
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] h-32"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Stock Quantity</label>
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