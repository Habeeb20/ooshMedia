// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { toast } from 'sonner';
// import { 
//   MapPin, Star, Heart, Share2, Phone, Mail, Calendar, 
//   Users, Eye 
// } from 'lucide-react';
// import Loading from '../../config/Loading';

// const SellerDetail = () => {
//   const { businessName, id } = useParams();
//   const navigate = useNavigate();

//   const [seller, setSeller] = useState(null);
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [liked, setLiked] = useState(false);
//   const [showReviewModal, setShowReviewModal] = useState(false);
//   const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
// const token = localStorage.getItem("token")
//   useEffect(() => {
//     if (id) {
//       fetchSellerDetails();
//     }
//   }, [id]);

//   const fetchSellerDetails = async () => {
//     try {
//       // Increment View Count
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/view`);

//       // Get Seller Full Details
//       const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}`);
//       setSeller(res.data.seller || res.data);

//       // Get Seller's Products
//       const prodRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/products/${id}`);
//       setProducts(prodRes.data.products || []);
//     } catch (err) {
//       toast.error("Failed to load seller details");
//       console.error(err.response.data.message || err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleLike = async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/like`, {
//         headers: {
//             'Authorization' : `Bearer ${token}`
//         }
//       });
//       setLiked(true);
//       toast.success("Seller liked successfully!");
//     } catch (err) {
//         console.log(err.response.data.message)
//       toast.error("an error occurred");
//     }
//   };

//   const handleShare = async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/share`, {
//             headers: {
//             'Authorization' : `Bearer ${token}`
//         }
//       }
        
//       );
      
//       if (navigator.share) {
//         await navigator.share({
//           title: seller?.businessProfile?.businessName,
//           text: `Check out this amazing seller on our platform!`,
//           url: window.location.href,
//         });
//       } else {
//         navigator.clipboard.writeText(window.location.href);
//         toast.success("Link copied to clipboard!");
//       }
//     } catch (err) {
//       toast.error("Share failed");
//     }
//   };

//   const submitReview = async () => {
//     try {
//       await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/review`, reviewData, {
//         headers: {
//              'Authorization': `Bearer ${token}`,
//         }
//       });
//       toast.success("Review submitted successfully!");
//       setShowReviewModal(false);
//       setReviewData({ rating: 5, comment: '' });
//       fetchSellerDetails(); // Refresh data
//     } catch (err) {
//         console.log(err)
//       toast.error("Failed to submit review");
//     }
//   };

//   if (loading) {
//     return <Loading text="Loading seller profile..." />;
//   }

//   if (!seller) {
//     return <div className="text-center py-20 text-xl text-red-500">Seller not found</div>;
//   }

//   const bp = seller.businessProfile || {};
//   const sp = seller.sellerProfile || {};
//   const shopName = bp.businessName || sp.shopName || `${seller.firstName} ${seller.lastName}`;

//   return (
//     <div className="min-h-screen bg-gray-50 pb-12">
//       <div className="max-w-6xl mx-auto px-4 py-8">
//         {/* Hero Section */}
//         <div className="bg-white rounded-3xl overflow-hidden shadow-xl">
//           <div className="relative h-80">
//             <img
//               src={seller.profilePicture || "https://ui-avatars.com/api/?name=Business"}
//               alt={shopName}
//               className="w-full h-full object-cover"
//             />
//             <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            
//             <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
//               <div className="flex items-center gap-3">
//                 {bp.verified && <span className="bg-emerald-500 px-4 py-1 rounded-full text-sm font-medium">✓ Verified Business</span>}
//               </div>
//               <h1 className="text-4xl font-black mt-3">{shopName}</h1>
//               <p className="text-lg opacity-90">@{seller.username}</p>
//             </div>
//           </div>

//           {/* Action Bar */}
//           <div className="flex flex-wrap gap-3 p-6 border-b bg-gray-50">
//             <button
//               onClick={handleLike}
//               className={`flex-1 min-w-[140px] py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all ${liked ? 'bg-red-100 text-red-600' : 'bg-white hover:bg-gray-100 border'}`}
//             >
//               <Heart className={`w-5 h-5 ${liked ? 'fill-current' : ''}`} />
//               Like
//             </button>

//             <button
//               onClick={handleShare}
//               className="flex-1 min-w-[140px] py-4 bg-white hover:bg-gray-100 border rounded-2xl font-semibold flex items-center justify-center gap-2"
//             >
//               <Share2 className="w-5 h-5" />
//               Share
//             </button>

//             <button
//               onClick={() => setShowReviewModal(true)}
//               className="flex-1 min-w-[140px] py-4 bg-primary text-white rounded-2xl font-semibold flex items-center justify-center gap-2"
//             >
//               <Star className="w-5 h-5" />
//               Write Review
//             </button>
//           </div>

//           {/* Seller Info - Using your previous beautiful design */}
//           <div className="p-8">
//             <div className="grid md:grid-cols-2 gap-8">
//               {/* Contact & Location */}
//               <div>
//                 <h3 className="font-bold text-xl mb-4">Contact Information</h3>
//                 <div className="space-y-4">
//                   {seller.phoneNumber && (
//                     <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
//                       <Phone className="w-5 h-5 text-primary" />
//                       <div>
//                         <p className="text-xs text-gray-500">Phone</p>
//                         <p className="font-medium">{seller.phoneNumber}</p>
//                       </div>
//                     </div>
//                   )}
//                   {seller.email && (
//                     <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
//                       <Mail className="w-5 h-5 text-primary" />
//                       <div>
//                         <p className="text-xs text-gray-500">Email</p>
//                         <p className="font-medium">{seller.email}</p>
//                       </div>
//                     </div>
//                   )}
//                   <div className="flex items-center gap-3 bg-gray-50 p-4 rounded-2xl">
//                     <MapPin className="w-5 h-5 text-primary" />
//                     <div>
//                       <p className="text-xs text-gray-500">Location</p>
//                       <p className="font-medium">{seller.state}, {seller.lga}</p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Business Stats */}
//               <div>
//                 <h3 className="font-bold text-xl mb-4">Business Overview</h3>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
//                     <p className="text-3xl font-black text-primary">{bp.likes || 0}</p>
//                     <p className="text-sm text-gray-500">Likes</p>
//                   </div>
//                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
//                     <p className="text-3xl font-black text-primary">{bp.views || 0}</p>
//                     <p className="text-sm text-gray-500">Views</p>
//                   </div>
//                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
//                     <p className="text-3xl font-black text-primary">{bp.reviews?.length || 0}</p>
//                     <p className="text-sm text-gray-500">Reviews</p>
//                   </div>
//                   <div className="bg-gray-50 p-5 rounded-2xl text-center">
//                     <p className="text-3xl font-black text-primary">{bp.yearsInBusiness || 0}</p>
//                     <p className="text-sm text-gray-500">Years</p>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Description */}
//             {(bp.businessAddress || sp.shopDescription) && (
//               <div className="mt-10">
//                 <h3 className="font-bold text-xl mb-3">About This Business</h3>
//                 <p className="text-gray-600 leading-relaxed">
//                   {sp.shopDescription || bp.businessAddress}
//                 </p>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Products Section */}
//         <div className="mt-12">
//           <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
//             Products in Stock ({products.length})
//           </h2>

//           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {products.map((product) => (
//               <div
//                 key={product._id}
//                 onClick={() => navigate(`/product/${product.name?.toLowerCase().replace(/\s+/g, '-')}/${product._id}`)}
//                 className="bg-white rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl transition-all group"
//               >
//                 <div className="h-52 relative">
//                   <img
//                     src={product.images?.[0]?.url}
//                     alt={product.name}
//                     className="w-full h-full object-cover group-hover:scale-105 transition-transform"
//                   />
//                 </div>
//                 <div className="p-4">
//                   <h4 className="font-semibold line-clamp-2">{product.name}</h4>
//                   <p className="text-primary font-bold text-lg mt-2">
//                     ₦{product.price?.toLocaleString()}
//                   </p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Review Modal */}
//       {showReviewModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-3xl max-w-md w-full p-8">
//             <h3 className="text-2xl font-bold mb-6">Write a Review</h3>
            
//             <div className="flex gap-2 mb-6">
//               {[1,2,3,4,5].map((star) => (
//                 <button
//                   key={star}
//                   onClick={() => setReviewData({ ...reviewData, rating: star })}
//                   className="text-3xl transition-all hover:scale-110"
//                 >
//                   {star <= reviewData.rating ? '★' : '☆'}
//                 </button>
//               ))}
//             </div>

//             <textarea
//               value={reviewData.comment}
//               onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
//               placeholder="Share your experience with this seller..."
//               className="w-full h-32 p-4 border rounded-2xl resize-y"
//             />

//             <div className="flex gap-3 mt-6">
//               <button
//                 onClick={() => setShowReviewModal(false)}
//                 className="flex-1 py-4 border rounded-2xl font-medium"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={submitReview}
//                 className="flex-1 py-4 bg-primary text-white rounded-2xl font-medium"
//               >
//                 Submit Review
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default SellerDetail;












import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { 
  MapPin, Star, Heart, Share2, Phone, Mail, 
  ArrowLeft, Eye 
} from 'lucide-react';
import Loading from '../../config/Loading';
import appConfig from '../../config/AppConfig';
import JobLocationMap from '../../location/JobLocationMap';
import { useJobDistance } from '../../location/UseJobDistance';
import { useUserLocation, getDistanceKm } from '../../location/UserLocation';




const SellerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

const [distributors, setDistributors] = useState([]);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
const { location: userLocation } = useUserLocation();
const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, seller?.lga, seller?.state);
  const token = localStorage.getItem("token");

  const cleanArray = (value) => {
  try {
    if (!value) return [];

    // If it's already an array → return
    if (Array.isArray(value)) return value;

    // First parse
    let parsed = JSON.parse(value);

    // If still string → parse again
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    return Array.isArray(parsed) ? parsed : [parsed];
  } catch (err) {
    return [value]; // fallback
  }
};


  useEffect(() => {
  const fetchDistributors = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/distributors`);
      const data = await res.json();

      if (data.success) {
        setDistributors(data.distributors);
      }
    } catch (err) {
      console.error(err);
    }
  };

  fetchDistributors();
}, [id]);

  useEffect(() => {
    if (id) fetchSellerDetails();
  }, [id]);

  const fetchSellerDetails = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const [sellerRes, productsRes, reviewsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSeller(sellerRes.data.seller || sellerRes.data);
      setProducts(productsRes.data.products || []);
      console.log(sellerRes.data.seller)
      setReviews(reviewsRes.data.reviews || []);
    } catch (err) {
        console.log(err)
      toast.error("Failed to load seller details");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(!liked);
      toast.success(liked ? "Like removed" : "Added to favorites");
    } catch (err) {
      toast.error(err.response.data.message || "Action failed");
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/share`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (navigator.share) {
        await navigator.share({
          title: seller?.businessProfile?.businessName,
          text: `Check out this seller on ${appConfig.name}`,
          url: window.location.href,
        });
      } else {
        navigator.clipboard.writeText(window.location.href);
        toast.success("Link copied!");
      }
    } catch (err) {
      toast.error("Share failed");
    }
  };

  const submitReview = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${id}/review`, reviewData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Review submitted successfully!");
      setShowReviewModal(false);
      setReviewData({ rating: 5, comment: '' });
      fetchSellerDetails();
    } catch (err) {
      toast.error("Failed to submit review");
    }
  };

  if (loading) return <Loading text="Loading seller profile..." />;

  if (!seller) return <div className="text-center py-20 text-xl text-red-500">Seller not found</div>;

  const bp = seller.businessProfile || {};
  const sp = seller.sellerProfile || {};
  const shopName = bp.businessName || sp.shopName || `${seller.firstName} ${seller.lastName}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)}
        className="fixed top-6 left-6 z-50 bg-white/90 backdrop-blur-md shadow-lg p-3 rounded-full hover:bg-white transition"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Hero Section */}
      <div className="relative h-[460px]">
        <img
          src={seller.profilePicture || "https://ui-avatars.com/api/?name=Business&background=1E3A8A&color=fff"}
          alt={shopName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/60 to-black/90" />

        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            {bp.verified && (
              <span className="bg-emerald-500 text-white px-5 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
                ✓ Verified Business
              </span>
            )}
          </div>
          <h1 className="text-5xl font-bold tracking-tight">{shopName}</h1>
          <p className="text-xl mt-2 opacity-90">@{seller.username}</p>
        </div>
      </div>

      {/* Action Buttons - Elegant & Compact */}
      <div className="max-w-6xl mx-auto px-6 -mt-8 relative z-10">
        <div className="flex gap-3 bg-white rounded-3xl shadow-xl p-3">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl font-medium transition-all ${
              liked ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'
            }`}
          >
            <Heart size={20} className={liked ? "fill-current" : ""} />
            <span className="text-sm">{liked ? "Liked" : "Like"}</span>
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-white hover:bg-gray-100 rounded-2xl font-medium transition-all border"
          >
            <Share2 size={20} />
            <span className="text-sm">Share</span>
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-[#8B1E3F] text-white rounded-2xl font-medium hover:bg-[#A6224A] transition-all"
          >
            <Star size={20} />
            <span className="text-sm">Review</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-12 pb-20">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column - Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              {/* <h3 className="font-bold text-2xl mb-6">Business Information</h3> */}
              
      <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
  <h3 className="font-bold text-2xl mb-8">Business Information</h3>

  <div className="grid md:grid-cols-2 gap-8">
    
    {/* LEFT SIDE */}
    <div className="space-y-6">
      
      {/* Location */}
      <div className="flex items-start gap-4">
        <MapPin className="w-6 h-6 text-[#8B1E3F] mt-1" />
        <div>
          <p className="text-gray-500 text-sm">Location</p>
          <p className="font-semibold text-lg">
            {seller.state}, {seller.lga}
          </p>
        </div>
      </div>

      {/* Phone */}
      {seller.phoneNumber && (
        <div className="flex items-start gap-4">
          <Phone className="w-6 h-6 text-[#8B1E3F] mt-1" />
          <div>
            <p className="text-gray-500 text-sm">Phone</p>
            <p className="font-semibold text-lg">{seller.phoneNumber}</p>
          </div>
        </div>
      )}

      {/* Email */}
      {seller.email && (
        <div className="flex items-start gap-4">
          <Mail className="w-6 h-6 text-[#8B1E3F] mt-1" />
          <div>
            <p className="text-gray-500 text-sm">Email</p>
            <p className="font-semibold text-lg">{seller.email}</p>
          </div>
        </div>
      )}
    </div>

 

          
         
          <div>
            <p className="text-gray-500 text-sm">Staff Count</p>
            <p className="font-semibold text-lg">
              {seller?.businessProfile?.staffCount || "N/A"}
            </p>
          </div>
         
          <div>
            <p className="text-gray-500 text-sm">Joined platform on</p>
            <p className="font-semibold text-lg">
              {new Date(seller).toLocaleDateString() || "N/A"}
            </p>
          </div>

          {/* <div>
            <p className="text-gray-500 text-sm">Opening Hours</p>
            <p className="font-semibold text-lg">
              {cleanArray(seller?.businessProfile?.openingHours).join(", ")}
            </p>
          </div> */}

          <div>
            <p className="text-gray-500 text-sm">Seller Type</p>
            <p className="font-semibold text-lg">
              {cleanArray(seller?.sellerProfile?.sellerTypes).join(", ")}
            </p>
          </div>

          {/* <div>
            <p className="text-gray-500 text-sm">Product Categories</p>
            <p className="font-semibold text-lg">
              {cleanArray(seller?.sellerProfile?.productCategories).join(", ")}
            </p>
          </div> */}
        </div>
    



  {/* ================= DISTRIBUTOR CHAIN ================= */}
  <div className="mt-10">
    <h4 className="text-xl font-bold mb-4">Distributor Chain</h4>

    {distributors.length === 0 ? (
      <p className="text-gray-500">No distributors added yet.</p>
    ) : (
      <div className="grid md:grid-cols-2 gap-4">
        {distributors.map((dist) => (
          <div
            key={dist.id}
            className="border rounded-2xl p-5 hover:shadow-md transition"
          >
            <p className="font-semibold text-lg">{dist.businessName}</p>
            <p className="text-sm text-gray-500 capitalize">
              {dist.relationship}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {dist.email}
            </p>
            <p className="text-sm text-gray-500 capitalize">
              {dist.phoneNumber}
            </p>
          </div>
        ))}
      </div>
    )}
  </div>
</div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                <p className="text-4xl font-bold text-[#8B1E3F]">{bp.likes || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Likes</p>
              </div>
              <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                <p className="text-4xl font-bold text-[#8B1E3F]">{bp.shares || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Shares</p>
              </div>
              <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                <p className="text-4xl font-bold text-[#8B1E3F]">{bp.views || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Views</p>
              </div>
              <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                <p className="text-4xl font-bold text-[#8B1E3F]">{bp.reviews?.length || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Reviews</p>
              </div>
            </div>

             {/* Location with Map */}
                  <div className="md:col-span-2 bg-gray-50 rounded-3xl p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-xs tracking-widest text-gray-400 uppercase font-medium">Location</p>
                        <h4 className="font-bold text-gray-800 mt-1 text-lg">
                          {seller?.state}, {seller?.lga}
                        </h4>
                      </div>
                      
                      {/* Distance Badge */}
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
                              : `${distanceKm.toFixed(1)} km away`}
                            {' · '}~{driveMinutes} min drive
                          </span>
                        ) : (
                          <span className="text-gray-400">Distance N/A</span>
                        )}
                      </div>
                    </div>
            
                    {/* MAP */}
                    <div className="mt-3 rounded-2xl overflow-hidden border border-gray-200 shadow-inner">
                      <JobLocationMap
                        lga={seller?.lga}
                        state={seller?.state}
                        address={seller?.businessProfile?.businessAddress}
                      />
                    </div>
                  </div>
          </div>

          {/* Right Column - Products & Reviews */}
          <div className="lg:col-span-7">
            <h2 className="text-3xl font-bold mb-6">Products in Stock ({products.length})</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product.name?.toLowerCase().replace(/\s+/g, '-')}/${product._id}`)}
                  className="bg-white rounded-3xl overflow-hidden cursor-pointer hover:shadow-2xl transition-all group"
                >
                  <div className="relative h-56">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h4 className="font-semibold line-clamp-2 text-lg leading-tight">{product.name}</h4>
                    <p className="text-[#8B1E3F] font-bold text-2xl mt-3">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    <p className="text-sm text-black  w-50 rounded-md mt-1">{product.stockQuantity} left</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
              <h2 className="text-3xl font-bold mb-8">Customer Reviews ({reviews.length})</h2>
              
              <div className="space-y-8">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className="bg-white p-8 rounded-3xl shadow-sm">
                      <div className="flex items-center gap-4">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              size={20} 
                              className={i < review.rating ? "text-yellow-400 fill-current" : "text-gray-300"} 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-500">by {review.user?.firstName || "Customer"}</p>
                      </div>
                      <p className="mt-4 text-gray-700 leading-relaxed">{review.comment}</p>
                      <p className="text-xs text-gray-400 mt-4">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-12">No reviews yet. Be the first to review!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <h3 className="text-2xl font-bold mb-6">Write a Review</h3>
            
            <div className="flex gap-1 mb-6">
              {[1,2,3,4,5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  className="text-4xl text-yellow-400 hover:scale-110 transition"
                >
                  {star <= reviewData.rating ? '★' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              placeholder="Share your honest experience with this seller..."
              className="w-full h-40 p-5 border rounded-2xl focus:border-[#8B1E3F] resize-y"
            />

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-4 border rounded-2xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-4 bg-[#8B1E3F] text-white rounded-2xl font-medium hover:bg-[#A6224A]"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDetail;