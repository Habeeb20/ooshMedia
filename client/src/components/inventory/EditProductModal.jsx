// import { useState, useEffect } from 'react';
// import { X, ToggleLeft, ToggleRight } from 'lucide-react';
// import { toast } from 'sonner';
// import Loading from '../../config/Loading';
// import { productCategories } from '../../categories/productCategories';
// import { productVariants } from '../../partVariants';
// import CloudinaryUpload from '../../config/CloudinaryUpload';

// const GEAR_TRANSMISSION_OPTIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
// const CURRENT_YEAR = new Date().getFullYear();
// const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1980 + 1 }, (_, i) => CURRENT_YEAR - i);

// export default function EditProductModal({ product, onClose, onSuccess }) {
//     const [formData, setFormData] = useState(null);
//     const [loadingProduct, setLoadingProduct] = useState(true);
//     const [submitting, setSubmitting] = useState(false);
//     const [images, setImages] = useState([]);

//     // Grocery Varieties State
//     const [hasVariety, setHasVariety] = useState(false);
//     const [varieties, setVarieties] = useState([]);

//     useEffect(() => {
//         const fetchProductDetails = async () => {
//             try {
//                 const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/${product}`, {
//                     method: 'GET',
//                     headers: {
//                         'Content-Type': 'application/json',
//                         Authorization: `Bearer ${localStorage.getItem('token')}`,
//                     },
//                 });
//                 const data = await res.json();

//                 if (data.success) {
//                     const p = data.product;
//                     setFormData({
//                         name: p.name || '',
//                         description: p.description || '',
//                         price: p.price ? p.price.toString() : '',
//                         grade: p.grade || '',
//                         category: p.category?._id || p.category || '',
//                         subCategory: p.subCategory || '',
//                         stockQuantity: p.stockQuantity ? p.stockQuantity.toString() : '0',
//                         lowStockThreshold: p.lowStockThreshold || 10,
//                         part: !!p.sparePartDetails,
//                         rawMaterial: p.rawMaterial || false,
//                         whatPart: p.sparePartDetails?.partCategory || '',
//                         subCategoryPart: p.sparePartDetails?.partSubCategory || '',
//                         gearTransmission: p.sparePartDetails?.carDetails?.gearTransmission || '',
//                         yearOfMake: p.sparePartDetails?.carDetails?.yearOfMake || '',
//                         maker: p.sparePartDetails?.carDetails?.maker || '',
//                         fuelType: p.sparePartDetails?.carDetails?.fuelType || '',
//                     });

//                     // Set sorted product images
//                     const sortedImgs = p.images
//                         ?.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
//                         ?.map(img => ({ url: img.url, publicId: img.publicId })) || [];
//                     setImages(sortedImgs);

//                     // Set varieties if grocery
//                     if (p.groceryDetails && p.groceryDetails.hasVariety) {
//                         setHasVariety(true);
//                         setVarieties(p.groceryDetails.varieties.map(v => ({
//                             id: Math.random(),
//                             ...v,
//                             price: v.price.toString()
//                         })));
//                     }
//                 } else {
//                     toast.error("Failed to load product details");
//                     onClose();
//                 }
//             } catch (err) {
//                 console.error(err);
//                 toast.error("An error occurred fetching product");
//                 onClose();
//             } finally { // ✅ Fixed: Replaced 'font-medium' with 'finally'
//                 setLoadingProduct(false);
//             }
//         };

//         if (product) fetchProductDetails();
//     }, [product, onClose]);

//     const selectedCategory = productCategories.find(cat => cat.id === formData?.category);
//     const isGroceryCategory =
//         selectedCategory?.name?.toLowerCase().includes('grocer') ||
//         selectedCategory?.name?.toLowerCase().includes('food');

//     const isCarPart = formData?.whatPart === 'Car Parts';
//     const showCarPartExtras = isCarPart && !!formData?.subCategoryPart;

//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };

//     const handleCategoryChange = (e) => {
//         const categoryId = e.target.value;
//         setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));
//         const newCat = productCategories.find(c => c.id === categoryId);
//         if (!(newCat?.name?.toLowerCase().includes('grocer') || newCat?.name?.toLowerCase().includes('food'))) {
//             setHasVariety(false);
//             setVarieties([]);
//         }
//     };

//     const handleImageUploaded = (url, publicId) => {
//         setImages(prev => [...prev, { url, publicId }]);
//     };

//     const removeImage = (indexToRemove) => {
//         setImages(prev => prev.filter((_, index) => index !== indexToRemove));
//     };

//     const addVarietyRow = () => {
//         setVarieties(prev => [...prev, {
//             id: Date.now() + Math.random(),
//             name: '',
//             price: '',
//             type: 'food',
//             image: '',
//             publicId: '',
//         }]);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         if (images.length === 0) {
//             toast.error("Please upload at least one product image");
//             return;
//         }

//         setSubmitting(true);

//         try {
//             const formattedImages = images.map((img, index) => ({
//                 url: img.url,
//                 publicId: img.publicId,
//                 isPrimary: index === 0
//             }));

//             const payload = {
//                 name: formData.name,
//                 description: formData.description,
//                 price: Number(formData.price),
//                 grade: formData.grade,
//                 category: formData.category,
//                 subCategory: formData.subCategory,
//                 stockQuantity: Number(formData.stockQuantity),
//                 lowStockThreshold: Number(formData.lowStockThreshold),
//                 rawMaterial: formData.rawMaterial,
//                 images: formattedImages,
//                 sparePartDetails: formData.part ? {
//                     partCategory: formData.whatPart,
//                     partSubCategory: formData.subCategoryPart,
//                     carDetails: isCarPart ? {
//                         gearTransmission: formData.gearTransmission,
//                         yearOfMake: formData.yearOfMake,
//                         fuelType: formData.fuelType,
//                         maker: formData.maker
//                     } : null
//                 } : null,
//                 groceryDetails: isGroceryCategory ? {
//                     hasVariety,
//                     varieties: hasVariety ? varieties.map(v => ({
//                         name: v.name,
//                         price: Number(v.price),
//                         type: v.type,
//                         image: v.image,
//                         publicId: v.publicId,
//                     })) : [],
//                 } : null
//             };

//             const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/${product}`, {
//                 method: 'PUT',
//                 headers: {
//                     'Content-Type': 'application/json',
//                     Authorization: `Bearer ${localStorage.getItem('token')}`,
//                 },
//                 body: JSON.stringify(payload),
//             });

//             const data = await res.json();

//             if (data.success) {
//                 toast.success("Product updated successfully!");
//                 onSuccess();
//                 onClose();
//             } else {
//                 toast.error(data.message || "Failed to update product");
//             }
//         } catch (err) {
//             toast.error("Something went wrong updating product");
//             console.error(err);
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loadingProduct) return <Loading text="Fetching product..." />;

//     return (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
//             <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
//                 <div className="p-8">
//                     <div className="flex justify-between items-center mb-8">
//                         <h2 className="text-3xl font-bold">Edit Product</h2>
//                         <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
//                             <X size={28} />
//                         </button>
//                     </div>

//                     <form onSubmit={handleSubmit} className="space-y-6">
//                         {/* Gallery Preview Grid */}
//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-3">
//                                 Product Images ({images.length})
//                             </label>
                            
//                             <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-4">
//                                 {images.map((img, index) => (
//                                     <div key={index} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-red-600' : 'border-gray-200'}`}>
//                                         <img src={img.url} alt={`product-${index}`} className="w-full h-full object-cover" />
//                                         {index === 0 && (
//                                             <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
//                                                 Primary
//                                             </span>
//                                         )}
//                                         <button
//                                             type="button"
//                                             onClick={() => removeImage(index)}
//                                             className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition"
//                                         >
//                                             <X size={14} />
//                                         </button>
//                                     </div>
//                                 ))}
//                             </div>

//                             {/* CloudinaryUpload Component Integration */}
//                             <CloudinaryUpload
//                                 label="Upload New Image"
//                                 folder="products"
//                                 accept="image/*"
//                                 onUploadComplete={handleImageUploaded}
//                             />
//                         </div>

//                         {/* Basic Form Inputs */}
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
//                                 <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
//                                 <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
//                             </div>
//                         </div>

//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
//                                 <select name="category" required value={formData.category} onChange={handleCategoryChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white">
//                                     <option value="">Select Category</option>
//                                     {productCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
//                                 </select>
//                             </div>
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
//                                 <select name="grade" value={formData.grade} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white">
//                                     <option value="">Select</option>
//                                     <option value="new">New</option>
//                                     <option value="original">Original</option>
//                                     <option value="fake">Fake</option>
//                                     <option value="others">Others</option>
//                                 </select>
//                             </div>
//                         </div>

//                         {/* Variety Image Uploader Integration */}
//                         {isGroceryCategory && (
//                             <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
//                                 <button type="button" onClick={() => setHasVariety(!hasVariety)} className="flex items-center gap-2 text-sm font-medium">
//                                     {hasVariety ? <ToggleRight size={28} className="text-green-600" /> : <ToggleLeft size={28} className="text-gray-400" />}
//                                     <span> Varieties / Combos</span>
//                                 </button>

//                                 {hasVariety && (
//                                     <div className="mt-5 space-y-4">
//                                         {varieties.map((v) => (
//                                             <div key={v.id} className="bg-white rounded-2xl border border-emerald-200 p-4 relative space-y-3">
//                                                 <button type="button" onClick={() => setVarieties(prev => prev.filter(row => row.id !== v.id))} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
//                                                     <X size={18} />
//                                                 </button>
//                                                 <div className="grid grid-cols-3 gap-4">
//                                                     <input type="text" value={v.name} placeholder="Combo Name" onChange={e => setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, name: e.target.value } : row))} className="w-full px-3 py-2 border rounded-lg text-sm" />
//                                                     <input type="number" value={v.price} placeholder="Price" onChange={e => setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, price: e.target.value } : row))} className="w-full px-3 py-2 border rounded-lg text-sm" />
//                                                     <select value={v.type} onChange={e => setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, type: e.target.value } : row))} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
//                                                         <option value="food">Food</option>
//                                                         <option value="drink">Drink</option>
//                                                     </select>
//                                                 </div>
//                                                 <CloudinaryUpload
//                                                     label="Combo Image"
//                                                     folder="product-varieties"
//                                                     accept="image/*"
//                                                     currentUrl={v.image}
//                                                     onUploadComplete={(url, publicId) => {
//                                                         setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, image: url, publicId } : row));
//                                                     }}
//                                                 />
//                                             </div>
//                                         ))}
//                                         <button type="button" onClick={addVarietyRow} className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition">+ Add Combo</button>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
//                             <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200 h-32 resize-none" />
//                         </div>

//                         <div className="grid grid-cols-2 gap-6">
//                             <input type="number" name="stockQuantity" placeholder="Stock" required value={formData.stockQuantity} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
//                             <input type="number" name="lowStockThreshold" placeholder="Alert Threshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
//                         </div>

//                         <button
//                             type="submit"
//                             disabled={submitting}
//                             className="w-full py-4 bg-[#8B1E3F] text-white rounded-2xl font-semibold text-lg hover:bg-[#A6224A] transition disabled:opacity-50"
//                         >
//                             {submitting ? "Updating..." : "Update Product"}
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// }



import { useState, useEffect } from 'react';
import { X, ToggleLeft, ToggleRight, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '../../config/Loading';
import { productCategories } from '../../categories/productCategories';
import { productVariants } from '../../partVariants';
import CloudinaryUpload from '../../config/CloudinaryUpload';

const GEAR_TRANSMISSION_OPTIONS = ['Manual', 'Automatic', 'CVT', 'Semi-Automatic'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1980 + 1 }, (_, i) => CURRENT_YEAR - i);

export default function EditProductModal({ product, onClose, onSuccess }) {
    const [formData, setFormData] = useState(null);
    const [loadingProduct, setLoadingProduct] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [images, setImages] = useState([]);
    const [showAdditionalUploader, setShowAdditionalUploader] = useState(false);

    // Grocery Varieties State
    const [hasVariety, setHasVariety] = useState(false);
    const [varieties, setVarieties] = useState([]);

    useEffect(() => {
        const fetchProductDetails = async () => {
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/${product}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });
                const data = await res.json();

                if (data.success) {
                    const p = data.product;
                    setFormData({
                        name: p.name || '',
                        description: p.description || '',
                        price: p.price ? p.price.toString() : '',
                        grade: p.grade || '',
                        category: p.category?._id || p.category || '',
                        subCategory: p.subCategory || '',
                        stockQuantity: p.stockQuantity ? p.stockQuantity.toString() : '0',
                        lowStockThreshold: p.lowStockThreshold || 10,
                        part: !!p.sparePartDetails,
                        rawMaterial: p.rawMaterial || false,
                        whatPart: p.sparePartDetails?.partCategory || '',
                        subCategoryPart: p.sparePartDetails?.partSubCategory || '',
                        gearTransmission: p.sparePartDetails?.carDetails?.gearTransmission || '',
                        yearOfMake: p.sparePartDetails?.carDetails?.yearOfMake || '',
                        maker: p.sparePartDetails?.carDetails?.maker || '',
                        fuelType: p.sparePartDetails?.carDetails?.fuelType || '',
                    });

                    // Set sorted product images
                    const sortedImgs = p.images
                        ?.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0))
                        ?.map(img => ({ url: img.url, publicId: img.publicId })) || [];
                    setImages(sortedImgs);

                    // Set varieties if grocery
                    if (p.groceryDetails && p.groceryDetails.hasVariety) {
                        setHasVariety(true);
                        setVarieties(p.groceryDetails.varieties.map(v => ({
                            id: Math.random(),
                            ...v,
                            price: v.price.toString()
                        })));
                    }
                } else {
                    toast.error("Failed to load product details");
                    onClose();
                }
            } catch (err) {
                console.error(err);
                toast.error("An error occurred fetching product");
                onClose();
            } finally {
                setLoadingProduct(false);
            }
        };

        if (product) fetchProductDetails();
    }, [product, onClose]);

    const selectedCategory = productCategories.find(cat => cat.id === formData?.category);
    const isGroceryCategory =
        selectedCategory?.name?.toLowerCase().includes('grocer') ||
        selectedCategory?.name?.toLowerCase().includes('food');

    const isCarPart = formData?.whatPart === 'Car Parts';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryChange = (e) => {
        const categoryId = e.target.value;
        setFormData(prev => ({ ...prev, category: categoryId, subCategory: '' }));
        const newCat = productCategories.find(c => c.id === categoryId);
        if (!(newCat?.name?.toLowerCase().includes('grocer') || newCat?.name?.toLowerCase().includes('food'))) {
            setHasVariety(false);
            setVarieties([]);
        }
    };

    const handleImageUploaded = (url, publicId) => {
        setImages(prev => [...prev, { url, publicId }]);
        setShowAdditionalUploader(false);
    };

    const removeImage = (indexToRemove) => {
        setImages(prev => prev.filter((_, index) => index !== indexToRemove));
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (images.length === 0) {
            toast.error("Please upload at least one product image");
            return;
        }

        setSubmitting(true);

        try {
            const formattedImages = images.map((img, index) => ({
                url: img.url,
                publicId: img.publicId,
                isPrimary: index === 0
            }));

            const payload = {
                name: formData.name,
                description: formData.description,
                price: Number(formData.price),
                grade: formData.grade,
                category: formData.category,
                subCategory: formData.subCategory,
                stockQuantity: Number(formData.stockQuantity),
                lowStockThreshold: Number(formData.lowStockThreshold),
                rawMaterial: formData.rawMaterial,
                images: formattedImages,
                sparePartDetails: formData.part ? {
                    partCategory: formData.whatPart,
                    partSubCategory: formData.subCategoryPart,
                    carDetails: isCarPart ? {
                        gearTransmission: formData.gearTransmission,
                        yearOfMake: formData.yearOfMake,
                        fuelType: formData.fuelType,
                        maker: formData.maker
                    } : null
                } : null,
                groceryDetails: isGroceryCategory ? {
                    hasVariety,
                    varieties: hasVariety ? varieties.map(v => ({
                        name: v.name,
                        price: Number(v.price),
                        type: v.type,
                        image: v.image,
                        publicId: v.publicId,
                    })) : [],
                } : null
            };

            const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/${product}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (data.success) {
                toast.success("Product updated successfully!");
                onSuccess();
                onClose();
            } else {
                toast.error(data.message || "Failed to update product");
            }
        } catch (err) {
            toast.error("Something went wrong updating product");
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loadingProduct) return <Loading text="Fetching product..." />;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-3xl font-bold">Edit Product</h2>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={28} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Gallery Preview & Management Section */}
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <label className="block text-sm font-medium text-gray-700">
                                    Product Gallery ({images.length})
                                </label>
                                <button
                                    type="button"
                                    onClick={() => setShowAdditionalUploader(prev => !prev)}
                                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                                >
                                    <ImagePlus size={16} />
                                    <span>{showAdditionalUploader ? 'Cancel' : '+ Add More Images'}</span>
                                </button>
                            </div>
                            
                            {/* Gallery Preview Grid */}
                            {images.length > 0 && (
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                                    {images.map((img, index) => (
                                        <div key={index} className={`relative aspect-square rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-red-600' : 'border-gray-200'}`}>
                                            <img src={img.url} alt={`product-${index}`} className="w-full h-full object-cover" />
                                            {index === 0 && (
                                                <span className="absolute bottom-1 left-1 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                                                    Primary
                                                </span>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-black/60 hover:bg-red-600 text-white rounded-full p-1 transition"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Main or Additional Image Dropzone */}
                            {(images.length === 0 || showAdditionalUploader) && (
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl mt-2">
                                    <CloudinaryUpload
                                        label={images.length === 0 ? "Upload Product Image" : "Upload Additional Image"}
                                        folder="products"
                                        accept="image/*"
                                        onUploadComplete={handleImageUploaded}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Basic Form Inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Price (₦) *</label>
                                <input type="number" name="price" required value={formData.price} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                                <select name="category" required value={formData.category} onChange={handleCategoryChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white">
                                    <option value="">Select Category</option>
                                    {productCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.name}</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
                                <select name="grade" value={formData.grade} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white">
                                    <option value="">Select</option>
                                    <option value="new">New</option>
                                    <option value="original">Original</option>
                                    <option value="fake">Fake</option>
                                    <option value="others">Others</option>
                                </select>
                            </div>
                        </div>

                        {/* Variety Image Uploader Integration */}
                        {isGroceryCategory && (
                            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                                <button type="button" onClick={() => setHasVariety(!hasVariety)} className="flex items-center gap-2 text-sm font-medium">
                                    {hasVariety ? <ToggleRight size={28} className="text-green-600" /> : <ToggleLeft size={28} className="text-gray-400" />}
                                    <span> Varieties / Combos</span>
                                </button>

                                {hasVariety && (
                                    <div className="mt-5 space-y-4">
                                        {varieties.map((v) => (
                                            <div key={v.id} className="bg-white rounded-2xl border border-emerald-200 p-4 relative space-y-3">
                                                <button type="button" onClick={() => setVarieties(prev => prev.filter(row => row.id !== v.id))} className="absolute top-3 right-3 text-red-400 hover:text-red-600">
                                                    <X size={18} />
                                                </button>
                                                <div className="grid grid-cols-3 gap-4">
                                                    <input type="text" value={v.name} placeholder="Combo Name" onChange={e => setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, name: e.target.value } : row))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    <input type="number" value={v.price} placeholder="Price" onChange={e => setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, price: e.target.value } : row))} className="w-full px-3 py-2 border rounded-lg text-sm" />
                                                    <select value={v.type} onChange={e => setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, type: e.target.value } : row))} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
                                                        <option value="food">Food</option>
                                                        <option value="drink">Drink</option>
                                                    </select>
                                                </div>
                                                <CloudinaryUpload
                                                    label="Combo Image"
                                                    folder="product-varieties"
                                                    accept="image/*"
                                                    currentUrl={v.image}
                                                    onUploadComplete={(url, publicId) => {
                                                        setVarieties(prev => prev.map(row => row.id === v.id ? { ...row, image: url, publicId } : row));
                                                    }}
                                                />
                                            </div>
                                        ))}
                                        <button type="button" onClick={addVarietyRow} className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-300 text-emerald-700 font-medium text-sm hover:bg-emerald-100 transition">+ Add Combo</button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                            <textarea name="description" required value={formData.description} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200 h-32 resize-none" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <input type="number" name="stockQuantity" placeholder="Stock" required value={formData.stockQuantity} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
                            <input type="number" name="lowStockThreshold" placeholder="Alert Threshold" value={formData.lowStockThreshold} onChange={handleChange} className="w-full px-5 py-4 rounded-2xl border border-gray-200" />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-4 bg-[#8B1E3F] text-white rounded-2xl font-semibold text-lg hover:bg-[#A6224A] transition disabled:opacity-50"
                        >
                            {submitting ? "Updating..." : "Update Product"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}