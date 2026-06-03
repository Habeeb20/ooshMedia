// import { useEffect, useState } from "react";

// import { Users, ArrowUp, ArrowDown } from "lucide-react";
// import { useParams } from "react-router-dom";
// import { Link } from "react-router-dom";
// import { useUserLocation, getDistanceKm } from './../../location/UserLocation';
// import { Swiper, SwiperSlide } from "swiper/react";
// import { Navigation, Autoplay } from "swiper/modules";
// import { useJobDistance } from "../../location/UseJobDistance";
// import "swiper/css";
// import "swiper/css/navigation";
// import axios from "axios";

// import {
//   Heart,
//   ShoppingCart,
//   Star,
//   Truck,
//   ShieldCheck,
//   Loader2,
// } from "lucide-react";
// import JobLocationMap from "../../location/JobLocationMap";
// import appConfig from "../../config/appConfig";
// import { MapPin } from "lucide-react";
// export default function ProductDetails() {
//   const { slug } = useParams();
// const [upstream, setUpstream] = useState([]);
// const [downstream, setDownstream] = useState([]);
// const [chainLoading, setChainLoading] = useState(false);
//   const [product, setProduct] = useState(null);
//   const [mainImage, setMainImage] = useState("");
//   const [loading, setLoading] = useState(true);
// const [relatedProducts, setRelatedProducts] = useState([]);
// const { location: userLocation } = useUserLocation();
// const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, product?.seller?.lga, product?.seller?.state);

//   // SLUGIFY
//   const slugify = (text) => {
//     return text
//       ?.toLowerCase()
//       ?.replace(/[^\w ]+/g, "")
//       ?.replace(/ +/g, "-");
//   };



//   // FETCH SELLER DISTRIBUTION CHAIN
// const fetchSellerChain = async (seller) => {
//   if (!seller) return;

//   setChainLoading(true);
//   try {
//     const identifier = seller.businessProfile?.businessName ||
//                        seller.email ||
//                        seller.username;

//     const response = await axios.get(
//       `${import.meta.env.VITE_BACKEND_URL}/api/chain/search?type=seller&query=${encodeURIComponent(identifier)}`
//     );

//     if (response.data?.success) {
//       setUpstream(response.data.data.upstream || []);
//       setDownstream(response.data.data.downstream || []);
//     }
//   } catch (error) {
//     console.error("Failed to fetch seller chain:", error);
//   } finally {
//     setChainLoading(false);
//   }
// };


//   const fetchProduct = async () => {
//   try {
//     const response = await axios.get(
//       `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
//     );


//     const products =
//       response.data?.products ||
//       response.data ||
//       [];
// console.log(products)
//     // FIND CURRENT PRODUCT
//     const foundProduct = products.find(
//       (item) => slugify(item.name) === slug
//     );

//     setProduct(foundProduct);

//     // MAIN IMAGE
//     if (foundProduct?.images?.length > 0) {
//       setMainImage(
//         foundProduct.images[0].url
//       );
//     }

//     // RELATED PRODUCTS
//     const related = products.filter(
//       (item) =>
//         item.category ===
//           foundProduct?.category &&
//         item._id !== foundProduct?._id
//     );

//     setRelatedProducts(related);
//   } catch (error) {
//     console.log("PRODUCT ERROR:", error);
//   } finally {
//     setLoading(false);
//   }
// };


//   // Effects
//   useEffect(() => {
//     fetchProduct();
//   }, [slug]);

//   useEffect(() => {
//     if (product?.seller) {
//       fetchSellerChain(product.seller);
//     }
//   }, [product?.seller]);

//     // Recursive Downstream Tree Component
//   const DownstreamTree = ({ data, level = 0 }) => {
//     return (
//       <div className={`space-y-3 ${level > 0 ? 'ml-6 border-l border-dashed border-gray-300 pl-6' : ''}`}>
//         {data.map((partner, index) => (
//           <div key={index} className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4">
//             <div className="flex items-center gap-3">
//               <img
//                 src={partner.profilePicture || "https://ui-avatars.com/api/?name=Partner"}
//                 alt=""
//                 className="w-11 h-11 rounded-xl object-cover"
//               />
//               <div className="flex-1">
//                 <p className="font-semibold text-gray-900">
//                   {partner.businessName || `${partner.firstName || ''} ${partner.lastName || ''}`}
//                 </p>
//                 <p className="text-sm text-gray-500">@{partner.username}</p>
//               </div>
//             </div>

//             {partner.downstreamCount > 0 && (
//               <p className="text-xs text-amber-600 mt-2">
//                 ↓ {partner.downstreamCount} partners below
//               </p>
//             )}

//             {partner.downstream?.length > 0 && (
//               <DownstreamTree data={partner.downstream} level={level + 1} />
//             )}
//           </div>
//         ))}
//       </div>
//     );
//   };


//   // LOADING
//   if (loading) {
//     return (
//       <div className="h-screen flex items-center justify-center bg-[#f5f5f7]">
//         <Loader2
//           className="animate-spin"
//           size={45}
//           color={appConfig.colors.primary}
//         />
//       </div>
//     );
//   }




//   // PRODUCT NOT FOUND
//   if (!product) {
//     return (
//       <div className="h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
//         <h1 className="text-3xl font-black text-gray-800">
//           Product Not Found
//         </h1>

//         <p className="text-gray-500 mt-3">
//           The product you are looking for does not exist.
//         </p>
//       </div>
//     );
//   }


//   return (
//     <section className="bg-[#f5f5f7] min-h-screen py-6">
//       <div className="max-w-7xl mx-auto px-4">
//         <div className="bg-white rounded-3xl p-5 md:p-8 grid lg:grid-cols-2 gap-10 shadow-sm">
//           {/* LEFT SIDE */}
//           <div>
//             {/* MAIN IMAGE */}
//             <div className="bg-gray-100 rounded-3xl overflow-hidden">
//               <img
//                 src={
//                   mainImage ||
//                   "https://via.placeholder.com/700"
//                 }
//                 alt={product?.name}
//                 className="w-full h-[350px] md:h-[550px] object-cover"
//               />
//             </div>

//             {/* THUMBNAILS */}
//             <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
//               {product?.images?.map((img, index) => (
//                 <button
//                   key={index}
//                   onClick={() =>
//                     setMainImage(img.url)
//                   }
//                   className={`border-2 rounded-2xl overflow-hidden min-w-[90px] transition-all ${
//                     mainImage === img.url
//                       ? "border-[#8B1E3F]"
//                       : "border-transparent"
//                   }`}
//                 >
//                   <img
//                     src={img.url}
//                     alt=""
//                     className="w-20 h-20 object-cover"
//                   />
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* RIGHT SIDE */}
//           <div>
//             {/* CATEGORY */}
//             <p
//               className="uppercase text-sm font-bold tracking-wider"
//               style={{
//                 color: appConfig.colors.primary,
//               }}
//             >
//               {product?.category}
//             </p>

//             {/* NAME */}
//             <h1 className="text-1xl md:text-3xl font-black mt-3 text-gray-900 leading-tight">
//               {product?.name}
//             </h1>

//             {/* BRAND */}
//             {product?.brand && (
//               <p className="mt-3 text-gray-500">
//                 Brand:
//                 <span className="font-semibold text-gray-800 ml-2">
//                   {product.brand}
//                 </span>
//               </p>
//             )}

//             {/* RATINGS */}
//             <div className="flex items-center gap-2 mt-4">
//               <div className="flex text-amber-400">
//                 {[...Array(5)].map((_, index) => (
//                   <Star
//                     key={index}
//                     fill="currentColor"
//                     size={20}
//                   />
//                 ))}
//               </div>

//               <span className="text-gray-500">
//                 ({product?.ratings || 0} Ratings)
//               </span>
//             </div>

//             {/* PRICE */}
//             <div className="mt-6">
//               <h2
//                 className="text-4xl md:text-5xl font-black"
//                 style={{
//                   color: appConfig.colors.primary,
//                 }}
//               >
//                 ₦
//                 {(
//                   product?.salePrice ||
//                   product?.price
//                 )?.toLocaleString()}
//               </h2>

//               {product?.salePrice && (
//                 <p className="line-through text-gray-400 mt-2 text-xl">
//                   ₦
//                   {product?.price?.toLocaleString()}
//                 </p>
//               )}
//             </div>

//             {/* STOCK */}
//             <div className="mt-6 flex items-center gap-4">
//               <span className="font-semibold">
//                 Stock Left:
//               </span>

//               <span
//                 className={`px-4 py-2 rounded-full text-sm font-bold ${
//                   product?.stockQuantity > 0
//                     ? "bg-green-100 text-green-700"
//                     : "bg-red-100 text-red-700"
//                 }`}
//               >
//                 {product?.stockQuantity > 0
//                   ? `${product?.stockQuantity} Available`
//                   : "Out Of Stock"}
//               </span>
//             </div>

//             {/* DESCRIPTION */}
//             <div className="mt-8">
//               <h3 className="font-bold text-xl">
//                 Description
//               </h3>

//               <p className="text-gray-600 leading-relaxed mt-3">
//                 {product?.description}
//               </p>
//             </div>

//             {/* TAGS */}
//             {product?.tags?.length > 0 && (
//               <div className="flex flex-wrap gap-2 mt-6">
//                 {product.tags.map((tag, index) => (
//                   <span
//                     key={index}
//                     className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium"
//                   >
//                     #{tag}
//                   </span>
//                 ))}
//               </div>
//             )}

//             {/* ACTION BUTTONS */}
//             <div className="flex flex-col md:flex-row gap-4 mt-10">
//               <button
//                 className="flex-1 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] transition"
//                 style={{
//                   background: appConfig.colors.primary,
//                 }}
//               >
//                 <ShoppingCart />
//                 Add To Cart
//               </button>

//               <button className="w-full md:w-16 h-16 rounded-2xl border flex items-center justify-center hover:bg-gray-50">
//                 <Heart />
//               </button>
//             </div>

//             {/* FEATURES */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-10">
//               <div className="border rounded-2xl p-4 flex gap-4">
//                 <Truck
//                   color={appConfig.colors.primary}
//                 />

//                 <div>
//                   <h4 className="font-bold">
//                     Fast Delivery
//                   </h4>

//                   <p className="text-sm text-gray-500">
//                     Nationwide shipping available
//                   </p>
//                 </div>
//               </div>

//               <div className="border rounded-2xl p-4 flex gap-4">
//                 <ShieldCheck
//                   color={appConfig.colors.primary}
//                 />

//                 <div>
//                   <h4 className="font-bold">
//                     Secure Payments
//                   </h4>

//                   <p className="text-sm text-gray-500">
//                     100% secure payment system
//                   </p>
//                 </div>
//               </div>
//             </div>

//             {/* SPECIFICATIONS */}
//             {product?.specifications &&
//               Object.keys(product.specifications)
//                 .length > 0 && (
//                 <div className="mt-10">
//                   <h3 className="font-bold text-xl mb-4">
//                     Specifications
//                   </h3>

//                   <div className="border rounded-2xl overflow-hidden">
//                     {Object.entries(
//                       product.specifications
//                     ).map(
//                       ([key, value], index) => (
//                         <div
//                           key={index}
//                           className="grid grid-cols-2 border-b last:border-0"
//                         >
//                           <div className="bg-gray-50 p-4 font-semibold capitalize">
//                             {key}
//                           </div>

//                           <div className="p-4 text-gray-600">
//                             {value}
//                           </div>
//                         </div>
//                       )
//                     )}
//                   </div>
//                 </div>
//               )}

              
//           </div>

//         </div>
//           {/* SELLER INFO */}
// {/* SELLER INFO */}
// <div className="mt-10 border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white">
  
//   {/* HEADER */}
//   <div
//     className="px-6 py-5 text-white flex items-center gap-3"
//     style={{ background: appConfig.colors.primary }}
//   >
//     <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center">
//       👤
//     </div>
//     <h2 className="font-bold text-xl">Seller Information</h2>
//   </div>

//   {/* CONTENT */}
//   <div className="p-6">
//     {/* Seller Profile Header */}
//     <div className="flex flex-col sm:flex-row items-start gap-5">
//       {/* PROFILE IMAGE */}
//       <img
//         src={
//           product?.seller?.profilePicture ||
//           "https://ui-avatars.com/api/?name=Seller"
//         }
//         alt="Seller"
//         className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md flex-shrink-0"
//       />

//       {/* SELLER DETAILS */}
//       <div className="flex-1 min-w-0">
//         <h3 className="text-2xl font-black text-gray-900 leading-tight">
//           {product?.seller?.businessProfile?.businessName ||
//            product?.seller?.sellerProfile?.shopName ||
//            `${product?.seller?.firstName} ${product?.seller?.lastName}`}
//         </h3>

//         <p className="text-gray-500 mt-1 text-lg">
//           @{product?.seller?.username}
//         </p>

//         {/* BADGES */}
//         <div className="flex flex-wrap gap-2 mt-4">
//           {product?.seller?.isSeller && (
//             <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
//               ✓ Verified Seller
//             </span>
//           )}

//           {product?.seller?.businessProfile?.verified && (
//             <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1">
//               ✓ Verified Business
//             </span>
//           )}
//         </div>
//       </div>
//     </div>

//     {/* DESCRIPTION */}
//     {product?.seller?.sellerProfile?.shopDescription && (
//       <div className="mt-8">
//         <h4 className="font-semibold text-gray-800 text-lg mb-3">About the Seller</h4>
//         <p className="text-gray-600 leading-relaxed text-[15.5px]">
//           {product?.seller?.sellerProfile?.shopDescription}
//         </p>
//       </div>
//     )}

//     {/* CONTACT & BUSINESS INFO */}
//     <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
      
//       {/* Phone */}
//       <div className="bg-gray-50 rounded-3xl p-5 hover:bg-gray-100 transition-colors">
//         <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Phone Number</p>
//         <h4 className="font-bold text-gray-800 mt-2 text-lg">
//           {product?.seller?.phoneNumber || "Not Available"}
//         </h4>
//       </div>

//       {/* Email */}
//       <div className="bg-gray-50 rounded-3xl p-5 hover:bg-gray-100 transition-colors">
//         <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Email Address</p>
//         <h4 className="font-bold text-gray-800 mt-2 text-lg break-all">
//           {product?.seller?.email || "Not Available"}
//         </h4>
//       </div>

//       {/* Location with Map */}
//       <div className="md:col-span-2 bg-gray-50 rounded-3xl p-5">
//         <div className="flex justify-between items-start mb-4">
//           <div>
//             <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Location</p>
//             <h4 className="font-bold text-gray-800 mt-1 text-lg">
//               {product?.seller?.state}, {product?.seller?.lga}
//             </h4>
//           </div>
          
//           {/* Distance Badge */}
//           <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-2xl text-sm">
//             <MapPin className="w-4 h-4 text-emerald-600" />
//             {!userLocation ? (
//               <span className="text-gray-500">Enable location</span>
//             ) : distanceLoading ? (
//               <span className="text-gray-400 animate-pulse">Calculating...</span>
//             ) : distanceKm != null ? (
//               <span className="font-medium text-emerald-700">
//                 {distanceKm < 1
//                   ? `${Math.round(distanceKm * 1000)}m away`
//                   : `${distanceKm.toFixed(1)} km away`}
//                 {' · '}~{driveMinutes} min drive
//               </span>
//             ) : (
//               <span className="text-gray-400">Distance N/A</span>
//             )}
//           </div>
//         </div>

//         {/* MAP */}
//         <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
//           <JobLocationMap
//             lga={product?.seller?.lga}
//             state={product?.seller?.state}
//             address={product?.seller?.businessProfile?.businessAddress}
//           />
//         </div>
//       </div>

//       {/* Business Years */}
//       <div className="bg-gray-50 rounded-3xl p-5">
//         <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Years In Business</p>
//         <h4 className="font-bold text-gray-800 mt-2 text-2xl">
//           {product?.seller?.businessProfile?.yearsInBusiness || 0}{" "}
//           <span className="text-base font-normal text-gray-500">Years</span>
//         </h4>
//       </div>
//     </div>

//     {/* BUSINESS ADDRESS */}
//     {product?.seller?.businessProfile?.businessAddress && (
//       <div className="mt-6 bg-gray-50 rounded-3xl p-5">
//         <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Business Address</p>
//         <h4 className="font-medium text-gray-700 mt-2 leading-relaxed">
//           {product?.seller?.businessProfile?.businessAddress}
//         </h4>
//       </div>
//     )}

//     {/* SELLER STATS */}
//     <div className="grid grid-cols-3 gap-4 mt-8">
//       <div className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
//         <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>
//           {product?.seller?.businessProfile?.likes || 0}
//         </h3>
//         <p className="text-xs text-gray-500 mt-1 font-medium">Likes</p>
//       </div>

//       <div className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
//         <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>
//           {product?.seller?.businessProfile?.shares || 0}
//         </h3>
//         <p className="text-xs text-gray-500 mt-1 font-medium">Shares</p>
//       </div>

//       <div className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
//         <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>
//           {product?.seller?.businessProfile?.reviews?.length || 0}
//         </h3>
//         <p className="text-xs text-gray-500 mt-1 font-medium">Reviews</p>
//       </div>
//     </div>
//   </div>
// </div>


// {/* DISTRIBUTION CHAIN SECTION */}
// <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
//   <div className="flex items-center gap-3 mb-8">
//     <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
//       <Users className="text-white" size={24} />
//     </div>
//     <div>
//       <h2 className="text-2xl font-black text-gray-900">Distribution Chain</h2>
//       <p className="text-gray-500">Upstream suppliers & downstream partners</p>
//     </div>
//   </div>

//   <div className="grid md:grid-cols-2 gap-8">
//     {/* UPSTREAM SUPPLIERS */}
//     <div>
//       <div className="flex items-center gap-2 mb-4">
//         <ArrowUp className="text-emerald-600" size={22} />
//         <h3 className="font-bold text-lg text-emerald-700">Upstream Suppliers</h3>
//       </div>

//       {chainLoading ? (
//         <div className="text-center py-8 text-gray-500">Loading upstream chain...</div>
//       ) : upstream.length > 0 ? (
//         <div className="space-y-4">
//           {upstream.map((supplier, index) => (
//             <div key={index} className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4">
//               <div className="flex items-center gap-3">
//                 <img
//                   src={supplier.profilePicture || "https://ui-avatars.com/api/?name=Supplier"}
//                   alt=""
//                   className="w-12 h-12 rounded-xl object-cover"
//                 />
//                 <div className="flex-1">
//                   <p className="font-semibold text-gray-900">
//                     {supplier.businessProfile?.businessName || `${supplier.firstName} ${supplier.lastName}`}
//                   </p>
//                   <p className="text-sm text-gray-500">@{supplier.username}</p>
//                 </div>
//               </div>
//               {supplier.upstreamCount > 0 && (
//                 <p className="text-xs text-emerald-600 mt-2">+ {supplier.upstreamCount} more upstream</p>
//               )}
//             </div>
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-500 italic py-6">No upstream suppliers found.</p>
//       )}
//     </div>

//     {/* DOWNSTREAM PARTNERS */}
//     <div>
//       <div className="flex items-center gap-2 mb-4">
//         <ArrowDown className="text-amber-600" size={22} />
//         <h3 className="font-bold text-lg text-amber-700">Downstream Partners</h3>
//       </div>

//       {chainLoading ? (
//         <div className="text-center py-8 text-gray-500">Loading downstream chain...</div>
//       ) : downstream.length > 0 ? (
//         <DownstreamTree data={downstream} />
//       ) : (
//         <p className="text-gray-500 italic py-6">No downstream partners found.</p>
//       )}
//     </div>
//   </div>
// </div>

//         {/* RELATED PRODUCTS */}
// {relatedProducts.length > 0 && (
//   <div className="mt-12">
//     {/* HEADER */}
//     <div className="flex items-center justify-between mb-6">
//       <div>
//         <h2 className="text-1xl md:text-2xl font-black text-gray-900">
//           You May Also Like
//         </h2>

//         <p className="text-gray-500 mt-1">
//           Similar products in this category
//         </p>
//       </div>
//     </div>

//     {/* SWIPER */}
//     <Swiper
//       modules={[Navigation, Autoplay]}
//       navigation
//       autoplay={{
//         delay: 2500,
//         disableOnInteraction: false,
//       }}
//       spaceBetween={20}
//       slidesPerView={2}
//       breakpoints={{
//         480: {
//           slidesPerView: 2,
//         },

//         640: {
//           slidesPerView: 3,
//         },

//         1024: {
//           slidesPerView: 4,
//         },

//         1280: {
//           slidesPerView: 5,
//         },
//       }}
//     >
//       {relatedProducts.map((item) => {
//         const relatedSlug = slugify(
//           item.name
//         );

//         return (
//           <SwiperSlide key={item._id}>
//             <Link
//               to={`/product/${relatedSlug}`}
//             >
//               <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
//                 {/* IMAGE */}
//                 <div className="overflow-hidden relative">
//                   <img
//                     src={
//                       item?.images?.[0]
//                         ?.url ||
//                       "https://via.placeholder.com/500"
//                     }
//                     alt={item?.name}
//                     className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
//                   />

//                   {/* SALE */}
//                   {item?.salePrice && (
//                     <div
//                       className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
//                       style={{
//                         background:
//                           appConfig.colors
//                             .primary,
//                       }}
//                     >
//                       SALE
//                     </div>
//                   )}
//                 </div>

//                 {/* CONTENT */}
//                 <div className="p-4">
//                   {/* CATEGORY */}
//                   <p
//                     className="uppercase text-xs font-bold tracking-wider"
//                     style={{
//                       color:
//                         appConfig.colors
//                           .primary,
//                     }}
//                   >
//                     {item?.category}
//                   </p>

//                   {/* NAME */}
//                   <h3 className="font-semibold text-gray-800 mt-2 line-clamp-2 min-h-[48px]">
//                     {item?.name}
//                   </h3>

//                   {/* RATING */}
//                   <div className="flex items-center gap-1 mt-3">
//                     <Star
//                       size={15}
//                       fill="currentColor"
//                       className="text-amber-400"
//                     />

//                     <span className="text-sm text-gray-500">
//                       {item?.ratings || 0}
//                     </span>
//                   </div>

//                   {/* PRICE */}
//                   <div className="mt-3">
//                     <h3
//                       className="text-2xl font-black"
//                       style={{
//                         color:
//                           appConfig.colors
//                             .primary,
//                       }}
//                     >
//                       ₦
//                       {(
//                         item?.salePrice ||
//                         item?.price
//                       )?.toLocaleString()}
//                     </h3>

//                     {item?.salePrice && (
//                       <p className="line-through text-gray-400 text-sm mt-1">
//                         ₦
//                         {item?.price?.toLocaleString()}
//                       </p>
//                     )}
//                   </div>

//                   {/* STOCK */}
//                   <div className="mt-3">
//                     <span
//                       className={`text-xs font-bold px-3 py-1 rounded-full ${
//                         item?.stockQuantity > 0
//                           ? "bg-green-100 text-green-700"
//                           : "bg-red-100 text-red-700"
//                       }`}
//                     >
//                       {item?.stockQuantity > 0
//                         ? `${item.stockQuantity} Left`
//                         : "Out Of Stock"}
//                     </span>
//                   </div>

//                   {/* BUTTON */}
//                   {/* <button
//                     className="w-full mt-4 py-3 rounded-2xl text-white font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition"
//                     style={{
//                       background:
//                         appConfig.colors
//                           .primary,
//                     }}
//                   >
//                     <ShoppingCart
//                       size={18}
//                     />
//                     View Product
//                   </button> */}
//                 </div>
//               </div>
//             </Link>
//           </SwiperSlide>
//         );
//       })}
//     </Swiper>
//   </div>
// )}
//       </div>
//     </section>
//   );
// }























































import { useEffect, useState } from "react";
import { Users, ArrowUp, ArrowDown } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUserLocation } from './../../location/UserLocation';
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useJobDistance } from "../../location/UseJobDistance";
import "swiper/css";
import "swiper/css/navigation";
import axios from "axios";
import {
  Heart, ShoppingCart, Star, Truck, ShieldCheck,
  Loader2, CheckCircle, XCircle, Package, Minus,
  Plus, ShoppingBag, ChevronRight, Clock,
} from "lucide-react";
import JobLocationMap from "../../location/JobLocationMap";
import appConfig from "../../config/appConfig";
import { MapPin } from "lucide-react";
import {useCart} from "../../context/cartContext"

// ─── Toast notification ───────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div className={`fixed top-6 right-6 z-[9999] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl text-white text-sm font-semibold transition-all animate-fade-in-down ${
      type === "success" ? "bg-green-600" : "bg-red-500"
    }`}>
      {type === "success" ? <CheckCircle size={20} /> : <XCircle size={20} />}
      {message}
    </div>
  );
};

// ─── Order status badge ────────────────────────────────────────────────────────
const STATUS_STYLES = {
  pending:    "bg-amber-100 text-amber-700",
  confirmed:  "bg-blue-100 text-blue-700",
  processing: "bg-purple-100 text-purple-700",
  shipped:    "bg-indigo-100 text-indigo-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-700",
};

export default function ProductDetails() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart, cart, cartCount } = useCart();

  const [upstream, setUpstream] = useState([]);
  const [downstream, setDownstream] = useState([]);
  const [chainLoading, setChainLoading] = useState(false);
  const [product, setProduct] = useState(null);
  const [mainImage, setMainImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [toast, setToast] = useState(null);
  const [liked, setLiked] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // 'details' | 'history'
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const { location: userLocation } = useUserLocation();
  const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(
    userLocation, product?.seller?.lga, product?.seller?.state
  );

  const showToast = (message, type = "success") => setToast({ message, type });

  // Check if this product is already in cart
  const cartItem = cart?.items?.find(i =>
    (i.product?._id || i.product) === product?._id
  );
  const isInCart = !!cartItem;

  // Slugify
  const slugify = (text) =>
    text?.toLowerCase()?.replace(/[^\w ]+/g, "")?.replace(/ +/g, "-");

  // ── Fetch seller distribution chain ─────────────────────────────────────
  const fetchSellerChain = async (seller) => {
    if (!seller) return;
    setChainLoading(true);
    try {
      const identifier =
        seller.businessProfile?.businessName || seller.email || seller.username;
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chain/search?type=seller&query=${encodeURIComponent(identifier)}`
      );
      if (response.data?.success) {
        setUpstream(response.data.data.upstream || []);
        setDownstream(response.data.data.downstream || []);
      }
    } catch (error) {
      console.error("Failed to fetch seller chain:", error);
    } finally {
      setChainLoading(false);
    }
  };

  // ── Fetch product ────────────────────────────────────────────────────────
  const fetchProduct = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`
      );
      const products = response.data?.products || response.data || [];
      const foundProduct = products.find((item) => slugify(item.name) === slug);
      setProduct(foundProduct);
      if (foundProduct?.images?.length > 0) {
        setMainImage(foundProduct.images[0].url);
      }
      const related = products.filter(
        (item) =>
          item.category === foundProduct?.category && item._id !== foundProduct?._id
      );
      setRelatedProducts(related);
    } catch (error) {
      console.log("PRODUCT ERROR:", error);
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch buyer order history ────────────────────────────────────────────
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) return;
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/orders/my`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(data);
    } catch (err) {
      console.error("Orders fetch error:", err);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => { fetchProduct(); }, [slug]);
  useEffect(() => { if (product?.seller) fetchSellerChain(product.seller); }, [product?.seller]);
  useEffect(() => { if (activeTab === "history") fetchOrders(); }, [activeTab]);

  // ── Add to cart handler ──────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!product?._id) return;
    if (product.stockQuantity <= 0) {
      showToast("This product is out of stock", "error");
      return;
    }
    setAddingToCart(true);
    const result = await addToCart(product._id, quantity);
    if (result.success) {
      showToast(`${product.name} added to cart!`, "success");
    } else {
      showToast(result.message || "Failed to add to cart", "error");
    }
    setAddingToCart(false);
  };

  // ── Downstream tree ──────────────────────────────────────────────────────
  const DownstreamTree = ({ data, level = 0 }) => (
    <div className={`space-y-3 ${level > 0 ? "ml-6 border-l border-dashed border-gray-300 pl-6" : ""}`}>
      {data.map((partner, index) => (
        <div key={index} className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <img
              src={partner.profilePicture || "https://ui-avatars.com/api/?name=Partner"}
              alt=""
              className="w-11 h-11 rounded-xl object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">
                {partner.businessName || `${partner.firstName || ""} ${partner.lastName || ""}`}
              </p>
              <p className="text-sm text-gray-500">@{partner.username}</p>
            </div>
          </div>
          {partner.downstreamCount > 0 && (
            <p className="text-xs text-amber-600 mt-2">↓ {partner.downstreamCount} partners below</p>
          )}
          {partner.downstream?.length > 0 && (
            <DownstreamTree data={partner.downstream} level={level + 1} />
          )}
        </div>
      ))}
    </div>
  );

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#f5f5f7]">
        <Loader2 className="animate-spin" size={45} color={appConfig.colors.primary} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#f5f5f7]">
        <h1 className="text-3xl font-black text-gray-800">Product Not Found</h1>
        <p className="text-gray-500 mt-3">The product you are looking for does not exist.</p>
      </div>
    );
  }

  const maxQty = product.stockQuantity || 1;
  const effectivePrice = product.salePrice || product.price;

  return (
    <section className="bg-[#f5f5f7] min-h-screen py-6">
      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <button
          onClick={() => navigate("/cart")}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl text-white font-bold shadow-2xl hover:scale-105 active:scale-95 transition-all"
          style={{ background: appConfig.colors.primary }}
        >
          <ShoppingCart size={22} />
          <span>View Cart</span>
          <span className="bg-white text-xs font-black px-2 py-0.5 rounded-full" style={{ color: appConfig.colors.primary }}>
            {cartCount}
          </span>
        </button>
      )}

      <div className="max-w-7xl mx-auto px-4">

        {/* ── Breadcrumb ────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
          <Link to="/" className="hover:underline">Home</Link>
          <ChevronRight size={14} />
          <Link to="/products" className="hover:underline capitalize">{product.category}</Link>
          <ChevronRight size={14} />
          <span className="text-gray-800 font-medium line-clamp-1">{product.name}</span>
        </div>

        {/* ── Tabs ──────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1.5 shadow-sm w-fit">
          <button
            onClick={() => setActiveTab("details")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeTab === "details"
                ? "text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "details" ? { background: appConfig.colors.primary } : {}}
          >
            Product Details
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "history"
                ? "text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            style={activeTab === "history" ? { background: appConfig.colors.primary } : {}}
          >
            <Clock size={15} />
            Order History
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: ORDER HISTORY
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "history" && (
          <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black text-gray-900">Your Orders</h2>
                <p className="text-gray-500 mt-1">Track all your purchases</p>
              </div>
              <button
                onClick={() => navigate("/checkout")}
                className="px-5 py-2.5 rounded-2xl text-white text-sm font-bold hover:opacity-90 transition"
                style={{ background: appConfig.colors.primary }}
              >
                Checkout
              </button>
            </div>

            {ordersLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="animate-spin text-gray-400" size={36} />
              </div>
            ) : orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Package size={64} className="mb-4 text-gray-300" />
                <p className="text-lg font-semibold">No orders yet</p>
                <p className="text-sm mt-1">Your purchases will appear here</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div
                    key={order._id}
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-all cursor-pointer group"
                  >
                    {/* Order header */}
                    <div className="flex justify-between items-start gap-3 flex-wrap">
                      <div>
                        <p className="font-black text-gray-800 text-lg">{order.orderNumber}</p>
                        <p className="text-sm text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-bold capitalize ${
                            STATUS_STYLES[order.status] || "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-semibold ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {order.paymentStatus === "paid" ? "✓ Paid" : "⏳ " + order.paymentStatus}
                        </span>
                      </div>
                    </div>

                    {/* Items preview */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                      {order.items?.slice(0, 4).map((item, i) => (
                        <div key={i} className="flex-shrink-0 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
                          <span className="text-sm text-gray-700 whitespace-nowrap">{item.name}</span>
                          <span className="text-xs text-gray-400">×{item.quantity}</span>
                        </div>
                      ))}
                      {order.items?.length > 4 && (
                        <div className="flex-shrink-0 bg-gray-100 rounded-xl px-3 py-2 text-xs text-gray-500">
                          +{order.items.length - 4} more
                        </div>
                      )}
                    </div>

                    {/* Delivery code */}
                    {order.fulfillmentType === "delivery" &&
                      order.delivery?.deliveryCode &&
                      order.status !== "delivered" && (
                        <div className="mt-4 flex items-center gap-3 bg-indigo-50 rounded-2xl px-4 py-3">
                          <Truck size={18} className="text-indigo-500 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-indigo-500 font-medium">Delivery Code</p>
                            <p className="font-black text-indigo-700 text-xl tracking-widest">
                              {order.delivery.deliveryCode}
                            </p>
                          </div>
                          <p className="text-xs text-indigo-400 ml-auto">Give to rider</p>
                        </div>
                      )}

                    {/* Footer */}
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span className="capitalize bg-gray-100 px-2.5 py-1 rounded-full">
                          {order.fulfillmentType}
                        </span>
                        <span className="capitalize bg-gray-100 px-2.5 py-1 rounded-full">
                          {order.paymentMethod === "online" ? "Paid online" : "Pay on delivery"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        {order.loyaltyPointsAwarded > 0 && (
                          <span className="text-xs text-yellow-600 font-semibold">
                            🏆 +{order.loyaltyPointsAwarded} pts
                          </span>
                        )}
                        <p className="font-black text-gray-800 text-lg">
                          ₦{order.totalAmount?.toLocaleString()}
                        </p>
                        <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB: PRODUCT DETAILS
        ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === "details" && (
          <>
            <div className="bg-white rounded-3xl p-5 md:p-8 grid lg:grid-cols-2 gap-10 shadow-sm">

              {/* LEFT SIDE — Images */}
              <div>
                <div className="bg-gray-100 rounded-3xl overflow-hidden relative">
                  <img
                    src={mainImage || "https://via.placeholder.com/700"}
                    alt={product?.name}
                    className="w-full h-[350px] md:h-[550px] object-cover"
                  />
                  {product?.salePrice && (
                    <div
                      className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-sm font-black text-white"
                      style={{ background: appConfig.colors.primary }}
                    >
                      SALE
                    </div>
                  )}
                  {product?.stockQuantity <= 0 && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-3xl">
                      <span className="bg-white px-6 py-2 rounded-full font-black text-gray-800 text-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnails */}
                <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                  {product?.images?.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setMainImage(img.url)}
                      className={`border-2 rounded-2xl overflow-hidden min-w-[90px] transition-all ${
                        mainImage === img.url ? "border-[#8B1E3F]" : "border-transparent"
                      }`}
                    >
                      <img src={img.url} alt="" className="w-20 h-20 object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* RIGHT SIDE — Info */}
              <div>
                <p
                  className="uppercase text-sm font-bold tracking-wider"
                  style={{ color: appConfig.colors.primary }}
                >
                  {product?.category}
                </p>

                <h1 className="text-xl md:text-3xl font-black mt-3 text-gray-900 leading-tight">
                  {product?.name}
                </h1>

                {product?.brand && (
                  <p className="mt-3 text-gray-500">
                    Brand:{" "}
                    <span className="font-semibold text-gray-800 ml-1">{product.brand}</span>
                  </p>
                )}

                {/* Ratings */}
                <div className="flex items-center gap-2 mt-4">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} fill="currentColor" size={20} />
                    ))}
                  </div>
                  <span className="text-gray-500">({product?.ratings || 0} Ratings)</span>
                </div>

                {/* Price */}
                <div className="mt-6">
                  <h2
                    className="text-4xl md:text-5xl font-black"
                    style={{ color: appConfig.colors.primary }}
                  >
                    ₦{effectivePrice?.toLocaleString()}
                  </h2>
                  {product?.salePrice && (
                    <p className="line-through text-gray-400 mt-2 text-xl">
                      ₦{product?.price?.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Stock */}
                <div className="mt-6 flex items-center gap-4">
                  <span className="font-semibold">Stock Left:</span>
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-bold ${
                      product?.stockQuantity > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {product?.stockQuantity > 0
                      ? `${product?.stockQuantity} Available`
                      : "Out Of Stock"}
                  </span>
                </div>

                {/* Description */}
                <div className="mt-8">
                  <h3 className="font-bold text-xl">Description</h3>
                  <p className="text-gray-600 leading-relaxed mt-3">{product?.description}</p>
                </div>

                {/* Tags */}
                {product?.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 rounded-full bg-gray-100 text-sm font-medium"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* ── Quantity picker ────────────────────────────────────────── */}
                {product?.stockQuantity > 0 && (
                  <div className="mt-8">
                    <p className="font-semibold text-gray-700 mb-3">Quantity</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center border border-gray-200 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setQuantity(q => Math.max(1, q - 1))}
                          className="px-4 py-3 hover:bg-gray-50 transition text-gray-600"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-5 py-3 font-black text-gray-800 min-w-[50px] text-center text-lg">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(q => Math.min(maxQty, q + 1))}
                          className="px-4 py-3 hover:bg-gray-50 transition text-gray-600"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-400">Max: {maxQty}</p>
                      <p className="font-bold text-gray-800 ml-auto text-lg">
                        Total: ₦{(effectivePrice * quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Action Buttons ────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8">
                  {/* Add to Cart */}
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart || product?.stockQuantity <= 0}
                    className="flex-1 py-4 rounded-2xl text-white font-bold text-lg flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                    style={{ background: appConfig.colors.primary }}
                  >
                    {addingToCart ? (
                      <Loader2 size={22} className="animate-spin" />
                    ) : isInCart ? (
                      <>
                        <CheckCircle size={22} />
                        Added — Update Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart size={22} />
                        Add To Cart
                      </>
                    )}
                  </button>

                  {/* Go to Cart (shown once in cart) */}
                  {isInCart && (
                    <button
                      onClick={() => navigate("/cart")}
                      className="flex-1 py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 border-2 hover:bg-gray-50 transition"
                      style={{ borderColor: appConfig.colors.primary, color: appConfig.colors.primary }}
                    >
                      <ShoppingBag size={22} />
                      Go to Cart
                    </button>
                  )}

                  {/* Wishlist */}
                  <button
                    onClick={() => setLiked(l => !l)}
                    className={`w-full sm:w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition ${
                      liked ? "bg-red-50 border-red-300" : "border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    <Heart
                      size={22}
                      className={liked ? "fill-red-500 text-red-500" : "text-gray-500"}
                    />
                  </button>
                </div>

                {/* Checkout button */}
                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full mt-3 py-4 rounded-2xl font-bold text-lg border-2 text-gray-700 border-gray-200 hover:bg-gray-50 flex items-center justify-center gap-3 transition"
                >
                  ⚡ Checkout Now
                </button>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                  <div className="border rounded-2xl p-4 flex gap-4">
                    <Truck color={appConfig.colors.primary} />
                    <div>
                      <h4 className="font-bold">Fast Delivery</h4>
                      <p className="text-sm text-gray-500">Nationwide shipping available</p>
                    </div>
                  </div>
                  <div className="border rounded-2xl p-4 flex gap-4">
                    <ShieldCheck color={appConfig.colors.primary} />
                    <div>
                      <h4 className="font-bold">Secure Payments</h4>
                      <p className="text-sm text-gray-500">100% secure payment system</p>
                    </div>
                  </div>
                </div>

                {/* Specifications */}
                {product?.specifications &&
                  Object.keys(product.specifications).length > 0 && (
                    <div className="mt-10">
                      <h3 className="font-bold text-xl mb-4">Specifications</h3>
                      <div className="border rounded-2xl overflow-hidden">
                        {Object.entries(product.specifications).map(([key, value], index) => (
                          <div key={index} className="grid grid-cols-2 border-b last:border-0">
                            <div className="bg-gray-50 p-4 font-semibold capitalize">{key}</div>
                            <div className="p-4 text-gray-600">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            {/* SELLER INFO */}
            <div className="mt-10 border border-gray-200 rounded-3xl overflow-hidden shadow-sm bg-white">
              <div
                className="px-6 py-5 text-white flex items-center gap-3"
                style={{ background: appConfig.colors.primary }}
              >
                <div className="w-8 h-8 bg-white/20 rounded-2xl flex items-center justify-center">👤</div>
                <h2 className="font-bold text-xl">Seller Information</h2>
              </div>

              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-5">
                  <img
                    src={product?.seller?.profilePicture || "https://ui-avatars.com/api/?name=Seller"}
                    alt="Seller"
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-md flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-black text-gray-900 leading-tight">
                      {product?.seller?.businessProfile?.businessName ||
                        product?.seller?.sellerProfile?.shopName ||
                        `${product?.seller?.firstName} ${product?.seller?.lastName}`}
                    </h3>
                    <p className="text-gray-500 mt-1 text-lg">@{product?.seller?.username}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {product?.seller?.isSeller && (
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                          ✓ Verified Seller
                        </span>
                      )}
                      {product?.seller?.businessProfile?.verified && (
                        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                          ✓ Verified Business
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {product?.seller?.sellerProfile?.shopDescription && (
                  <div className="mt-8">
                    <h4 className="font-semibold text-gray-800 text-lg mb-3">About the Seller</h4>
                    <p className="text-gray-600 leading-relaxed">{product?.seller?.sellerProfile?.shopDescription}</p>
                  </div>
                )}

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-gray-50 rounded-3xl p-5">
                    <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Phone Number</p>
                    <h4 className="font-bold text-gray-800 mt-2 text-lg">{product?.seller?.phoneNumber || "Not Available"}</h4>
                  </div>
                  <div className="bg-gray-50 rounded-3xl p-5">
                    <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Email Address</p>
                    <h4 className="font-bold text-gray-800 mt-2 text-lg break-all">{product?.seller?.email || "Not Available"}</h4>
                  </div>

                  <div className="md:col-span-2 bg-gray-50 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Location</p>
                        <h4 className="font-bold text-gray-800 mt-1 text-lg">
                          {product?.seller?.state}, {product?.seller?.lga}
                        </h4>
                      </div>
                      <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-5 py-2 rounded-2xl text-sm">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        {!userLocation ? (
                          <span className="text-gray-500">Enable location</span>
                        ) : distanceLoading ? (
                          <span className="text-gray-400 animate-pulse">Calculating...</span>
                        ) : distanceKm != null ? (
                          <span className="font-medium text-emerald-700">
                            {distanceKm < 1
                              ? `${Math.round(distanceKm * 1000)}m away`
                              : `${distanceKm.toFixed(1)} km away`}{" "}
                            · ~{driveMinutes} min drive
                          </span>
                        ) : (
                          <span className="text-gray-400">Distance N/A</span>
                        )}
                      </div>
                    </div>
                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                      <JobLocationMap
                        lga={product?.seller?.lga}
                        state={product?.seller?.state}
                        address={product?.seller?.businessProfile?.businessAddress}
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-3xl p-5">
                    <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Years In Business</p>
                    <h4 className="font-bold text-gray-800 mt-2 text-2xl">
                      {product?.seller?.businessProfile?.yearsInBusiness || 0}{" "}
                      <span className="text-base font-normal text-gray-500">Years</span>
                    </h4>
                  </div>
                </div>

                {product?.seller?.businessProfile?.businessAddress && (
                  <div className="mt-6 bg-gray-50 rounded-3xl p-5">
                    <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Business Address</p>
                    <h4 className="font-medium text-gray-700 mt-2 leading-relaxed">
                      {product?.seller?.businessProfile?.businessAddress}
                    </h4>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 mt-8">
                  {[
                    { label: "Likes", value: product?.seller?.businessProfile?.likes || 0 },
                    { label: "Shares", value: product?.seller?.businessProfile?.shares || 0 },
                    { label: "Reviews", value: product?.seller?.businessProfile?.reviews?.length || 0 },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-gray-50 rounded-3xl p-5 text-center hover:bg-gray-100 transition-colors">
                      <h3 className="text-3xl font-black" style={{ color: appConfig.colors.primary }}>{value}</h3>
                      <p className="text-xs text-gray-500 mt-1 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DISTRIBUTION CHAIN */}
            <div className="mt-12 bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                  <Users className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900">Distribution Chain</h2>
                  <p className="text-gray-500">Upstream suppliers & downstream partners</p>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowUp className="text-emerald-600" size={22} />
                    <h3 className="font-bold text-lg text-emerald-700">Upstream Suppliers</h3>
                  </div>
                  {chainLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading upstream chain...</div>
                  ) : upstream.length > 0 ? (
                    <div className="space-y-4">
                      {upstream.map((supplier, index) => (
                        <div key={index} className="border border-emerald-100 bg-emerald-50/50 rounded-2xl p-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={supplier.profilePicture || "https://ui-avatars.com/api/?name=Supplier"}
                              alt=""
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">
                                {supplier.businessProfile?.businessName || `${supplier.firstName} ${supplier.lastName}`}
                              </p>
                              <p className="text-sm text-gray-500">@{supplier.username}</p>
                            </div>
                          </div>
                          {supplier.upstreamCount > 0 && (
                            <p className="text-xs text-emerald-600 mt-2">+ {supplier.upstreamCount} more upstream</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic py-6">No upstream suppliers found.</p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <ArrowDown className="text-amber-600" size={22} />
                    <h3 className="font-bold text-lg text-amber-700">Downstream Partners</h3>
                  </div>
                  {chainLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading downstream chain...</div>
                  ) : downstream.length > 0 ? (
                    <DownstreamTree data={downstream} />
                  ) : (
                    <p className="text-gray-500 italic py-6">No downstream partners found.</p>
                  )}
                </div>
              </div>
            </div>

            {/* RELATED PRODUCTS */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900">You May Also Like</h2>
                    <p className="text-gray-500 mt-1">Similar products in this category</p>
                  </div>
                </div>
                <Swiper
                  modules={[Navigation, Autoplay]}
                  navigation
                  autoplay={{ delay: 2500, disableOnInteraction: false }}
                  spaceBetween={20}
                  slidesPerView={2}
                  breakpoints={{
                    480: { slidesPerView: 2 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1280: { slidesPerView: 5 },
                  }}
                >
                  {relatedProducts.map((item) => {
                    const relatedSlug = slugify(item.name);
                    return (
                      <SwiperSlide key={item._id}>
                        <Link to={`/product/${relatedSlug}`}>
                          <div className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group">
                            <div className="overflow-hidden relative">
                              <img
                                src={item?.images?.[0]?.url || "https://via.placeholder.com/500"}
                                alt={item?.name}
                                className="w-full h-52 object-cover group-hover:scale-105 transition duration-500"
                              />
                              {item?.salePrice && (
                                <div
                                  className="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold text-white"
                                  style={{ background: appConfig.colors.primary }}
                                >
                                  SALE
                                </div>
                              )}
                            </div>
                            <div className="p-4">
                              <p
                                className="uppercase text-xs font-bold tracking-wider"
                                style={{ color: appConfig.colors.primary }}
                              >
                                {item?.category}
                              </p>
                              <h3 className="font-semibold text-gray-800 mt-2 line-clamp-2 min-h-[48px]">{item?.name}</h3>
                              <div className="flex items-center gap-1 mt-3">
                                <Star size={15} fill="currentColor" className="text-amber-400" />
                                <span className="text-sm text-gray-500">{item?.ratings || 0}</span>
                              </div>
                              <div className="mt-3">
                                <h3 className="text-2xl font-black" style={{ color: appConfig.colors.primary }}>
                                  ₦{(item?.salePrice || item?.price)?.toLocaleString()}
                                </h3>
                                {item?.salePrice && (
                                  <p className="line-through text-gray-400 text-sm mt-1">
                                    ₦{item?.price?.toLocaleString()}
                                  </p>
                                )}
                              </div>
                              <div className="mt-3">
                                <span
                                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                                    item?.stockQuantity > 0
                                      ? "bg-green-100 text-green-700"
                                      : "bg-red-100 text-red-700"
                                  }`}
                                >
                                  {item?.stockQuantity > 0 ? `${item.stockQuantity} Left` : "Out Of Stock"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    );
                  })}
                </Swiper>
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast fade-in animation */}
      <style>{`
        @keyframes fade-in-down {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease forwards; }
      `}</style>
    </section>
  );
}