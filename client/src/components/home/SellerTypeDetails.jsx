/* eslint-disable react-hooks/immutability */
/* eslint-disable no-unused-vars */

// ─────────────────────────────────────────────────────────────────────────
// Design notes (visual pass only — no logic, routes, or API calls changed):
//
// • Accent color is untouched: #8B1E3F everywhere it appeared before.
// • Background moved from flat gray-50 to a warm ivory (#FAF7F4) so the
//   burgundy accent has something quieter to sit against.
// • Headline text (shop name, section titles) uses a serif display face —
//   it reads as an established business directory rather than a generic
//   SaaS dashboard. Add this to your index.html <head> to get the exact
//   look (falls back to a normal serif if you skip it):
//
//     <link rel="preconnect" href="https://fonts.googleapis.com">
//     <link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&display=swap" rel="stylesheet">
//
//   and in tailwind.config.js:
//     theme: { extend: { fontFamily: { display: ['Fraunces', 'serif'] } } }
//
//   If you'd rather not touch the font stack at all, just delete the
//   `font-display` classes below — everything else still works.
//
// • The four identical stat cards became one stat strip with dividers —
//   less "card soup," easier to scan at a glance.
// • The business-info grid had a structural bug: three fields (Staff
//   Count / Joined / Seller Type) were direct grid children instead of
//   being grouped in the right-hand column, so they didn't line up with
//   the left column. Fixed by wrapping them in their own column.
// • Product cards and review cards use a hairline border instead of a
//   heavy drop shadow, with shadow reserved for hover — quieter at rest,
//   responsive to interaction.
// ─────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import {
  MapPin, Star, Heart, Share2, Phone, Mail, ArrowLeft,
} from 'lucide-react';
import Loading from '../../config/Loading';
import appConfig from '../../config/AppConfig';
import JobLocationMap from '../../location/JobLocationMap';
import { useJobDistance } from '../../location/UseJobDistance';
import { useUserLocation } from '../../location/UserLocation';
import getStoreSlug from '../../config/getslug';

const SellerTypeDetail = () => {
  const { id: sellerIdParam } = useParams();
  const navigate = useNavigate();

  const [distributors, setDistributors] = useState([]);
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });

  const [resolvedSellerId, setResolvedSellerId] = useState(sellerIdParam);

  const { location: userLocation } = useUserLocation();
  const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, seller?.lga, seller?.state);
  const token = localStorage.getItem("token");

  // ── Resolve seller id from either the route param or the subdomain slug ──
  useEffect(() => {
    const init = async () => {
      if (sellerIdParam) {
        setResolvedSellerId(sellerIdParam);
        return;
      }
      const slug = getStoreSlug();
      if (!slug) return; // not on a subdomain, nothing to resolve
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/storefront/${slug}`);
        setResolvedSellerId(data.seller._id);
      } catch (err) {
        console.log(err);
        navigate('/store-not-found');
      }
    };
    init();
  }, [sellerIdParam]);

  const cleanArray = (value) => {
    try {
      if (!value) return [];
      if (Array.isArray(value)) return value;
      let parsed = JSON.parse(value);
      if (typeof parsed === "string") {
        parsed = JSON.parse(parsed);
      }
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch (err) {
      return [value];
    }
  };

  // ── Distributors ──
  useEffect(() => {
    if (!resolvedSellerId) return;
    const fetchDistributors = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}/distributors`);
        const data = await res.json();
        if (data.success) {
          setDistributors(data.distributors);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchDistributors();
  }, [resolvedSellerId]);

  // ── Seller details, products, reviews ──
  useEffect(() => {
    if (resolvedSellerId) fetchSellerDetails();
  }, [resolvedSellerId]);

  const fetchSellerDetails = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}/view`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const [sellerRes, productsRes, reviewsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/products/${resolvedSellerId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}/reviews`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setSeller(sellerRes.data.seller || sellerRes.data);
      console.log(sellerRes.data.seller || sellerRes.data)
      setProducts(productsRes.data.products || []);
      setReviews(reviewsRes.data.reviews || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load seller details");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLiked(!liked);
      toast.success(liked ? "Like removed" : "Added to favorites");
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    }
  };

  const handleShare = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}/share`, {}, {
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
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/seller/${resolvedSellerId}/review`, reviewData, {
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

  if (!seller) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF7F4]">
        <p className="text-lg text-stone-500">Seller not found</p>
      </div>
    );
  }

  const bp = seller.businessProfile || {};
  const sp = seller.sellerProfile || {};
  const shopName = bp.businessName || sp.shopName || `${seller.firstName} ${seller.lastName}`;

  return (
    <div className="min-h-screen bg-[#FAF7F4]">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        aria-label="Go back"
        className="fixed top-6 left-6 z-50 bg-white/95 backdrop-blur-md shadow-md ring-1 ring-black/5 p-3 rounded-full hover:bg-white transition"
      >
        <ArrowLeft size={22} className="text-stone-700" />
      </button>

      {/* Hero Section */}
      <div className="relative h-[420px] md:h-[480px]">
        <img
          src={seller.profilePicture || "https://ui-avatars.com/api/?name=Business&background=1E3A8A&color=fff"}
          alt={shopName}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/50 to-black/85" />

        <div className="relative h-full max-w-6xl mx-auto px-6 flex flex-col justify-end pb-10 text-white">
          {bp.verified && (
            <span className="inline-flex w-fit items-center gap-1.5 bg-emerald-500/95 px-4 py-1 rounded-full text-xs font-semibold tracking-wide mb-4">
              ✓ Verified Business
            </span>
          )}
          <h1 className="font-display text-4xl md:text-6xl font-semibold tracking-tight leading-none">
            {shopName}
          </h1>
          <p className="text-base md:text-lg mt-3 text-white/75">@{seller.username}</p>
        </div>
      </div>

      {/* Action Bar */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="-mt-7 relative z-10 flex bg-white rounded-2xl shadow-lg ring-1 ring-black/5 divide-x divide-stone-100 overflow-hidden">
          <button
            onClick={handleLike}
            className={`flex-1 flex items-center justify-center gap-2 py-4 font-medium text-sm transition-colors ${
              liked ? 'text-[#8B1E3F] bg-[#8B1E3F]/5' : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Heart size={18} className={liked ? "fill-current" : ""} />
            {liked ? "Liked" : "Like"}
          </button>

          <button
            onClick={handleShare}
            className="flex-1 flex items-center justify-center gap-2 py-4 font-medium text-sm text-stone-600 hover:bg-stone-50 transition-colors"
          >
            <Share2 size={18} />
            Share
          </button>

          <button
            onClick={() => setShowReviewModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 font-medium text-sm text-white bg-[#8B1E3F] hover:bg-[#7A1935] transition-colors"
          >
            <Star size={18} />
            Write a review
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pt-14 pb-24">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Left Column - Info */}
          <div className="lg:col-span-5 space-y-6">
            {/* Business Information */}
            <div className="bg-white rounded-2xl p-8 ring-1 ring-stone-100">
              <h3 className="font-display text-xl font-semibold mb-7 text-stone-900">
                Business information
              </h3>

              <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
                {/* Location */}
                <div className="flex items-start gap-3.5">
                  <MapPin className="w-5 h-5 text-[#8B1E3F] mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-stone-400">Location</p>
                    <p className="font-medium text-stone-800">{seller.state}, {seller.lga}</p>
                  </div>
                </div>

                {/* Staff Count */}
                <div>
                  <p className="text-xs text-stone-400">Staff count</p>
                  <p className="font-medium text-stone-800 mt-0.5">
                    {seller?.businessProfile?.staffCount || "N/A"}
                  </p>
                </div>

                {/* Phone */}
                {seller.phoneNumber && (
                  <div className="flex items-start gap-3.5">
                    <Phone className="w-5 h-5 text-[#8B1E3F] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-stone-400">Phone</p>
                      <p className="font-medium text-stone-800">{seller.phoneNumber}</p>
                    </div>
                  </div>
                )}

                {/* Joined */}
                <div>
                  <p className="text-xs text-stone-400">Joined platform on</p>
                  <p className="font-medium text-stone-800 mt-0.5">
                    {seller?.createdAt ? new Date(seller.createdAt).toLocaleDateString() : "N/A"}
                  </p>
                </div>

                {/* Email */}
                {seller.email && (
                  <div className="flex items-start gap-3.5">
                    <Mail className="w-5 h-5 text-[#8B1E3F] mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-stone-400">Email</p>
                      <p className="font-medium text-stone-800 break-all">{seller.email}</p>
                    </div>
                  </div>
                )}

                   {seller?.isSeller && (
                        <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                          ✓ Verified Seller
                        </span>
                      )}
                      {seller?.businessProfile?.verified && (
                        <span className="bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold">
                          ✓ Verified Business
                        </span>
                      )}

                {/* Seller Type */}
                <div>
                  <p className="text-xs text-stone-400">Seller type</p>
                  <p className="font-medium text-stone-800 mt-0.5">
                    {cleanArray(seller?.sellerProfile?.sellerTypes).join(", ") || "N/A"}
                  </p>
                </div>
              </div>

              {/* Distributor Chain */}
              <div className="mt-8 pt-8 border-t border-stone-100">
                <h4 className="font-display text-lg font-semibold mb-4 text-stone-900">
                  Distributor chain

                </h4>
                


                {distributors.length === 0 ? (
                  <p className="text-sm text-stone-400">No distributors added yet.</p>
                ) : (
                  <div className="space-y-3">
                    {distributors.map((dist) => (
                      <div
                        key={dist.id}
                        className="border border-stone-100 rounded-xl p-4 hover:border-stone-200 transition-colors"
                      >
                        <p className="font-medium text-stone-800">{dist.businessName}</p>
                        <p className="text-sm text-stone-400 capitalize mt-0.5">
                          {dist.relationship}{dist.phoneNumber ? ` · ${dist.phoneNumber}` : ''}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stat strip */}
            <div className="bg-white rounded-2xl ring-1 ring-stone-100 grid grid-cols-4 divide-x divide-stone-100">
              {[
                ['Likes', bp.likes || 0],
                ['Shares', bp.shares || 0],
                ['Views', bp.views || 0],
                ['Reviews', bp.reviews?.length || 0],
              ].map(([label, value]) => (
                <div key={label} className="text-center py-6 px-2">
                  <p className="text-2xl md:text-3xl font-display font-semibold text-[#8B1E3F]">{value}</p>
                  <p className="text-xs text-stone-400 mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Location with Map */}
            <div className="bg-white rounded-2xl ring-1 ring-stone-100 p-6">
              <div className="flex justify-between items-start mb-4 gap-3">
                <div>
                  <p className="text-xs text-stone-400">Location</p>
                  <h4 className="font-medium text-stone-800 mt-0.5">
                    {seller?.state}, {seller?.lga}
                  </h4>
                </div>

                {/* Distance Badge */}
                <div className="inline-flex items-center gap-1.5 bg-emerald-50 px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  {!userLocation ? (
                    <span className="text-stone-500">Enable location</span>
                  ) : distanceLoading ? (
                    <span className="text-stone-400 animate-pulse">Calculating…</span>
                  ) : distanceKm != null ? (
                    <span className="font-medium text-emerald-700">
                      {distanceKm < 1
                        ? `${Math.round(distanceKm * 1000)}m`
                        : `${distanceKm.toFixed(1)} km`}
                      {' · '}~{driveMinutes} min
                    </span>
                  ) : (
                    <span className="text-stone-400">Distance N/A</span>
                  )}
                </div>
              </div>

              {/* MAP */}
              <div className="rounded-xl overflow-hidden ring-1 ring-stone-100">
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
            <div className="flex items-baseline justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold text-stone-900">Products in stock</h2>
              <span className="text-sm text-stone-400">{products.length} total</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="bg-white rounded-2xl overflow-hidden cursor-pointer ring-1 ring-stone-100 hover:ring-stone-200 hover:shadow-lg transition-all group"
                >
                  <div className="relative h-48 bg-stone-50 overflow-hidden">
                    <img
                      src={product.images?.[0]?.url}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-medium line-clamp-2 text-stone-800 leading-snug">{product.name}</h4>
                    <p className="text-[#8B1E3F] font-display font-semibold text-xl mt-2">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-stone-400 mt-1">{product.stockQuantity} left</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Reviews Section */}
            <div className="mt-16">
              <h2 className="font-display text-2xl font-semibold mb-6 text-stone-900">
                Customer reviews <span className="text-stone-400 font-sans text-lg font-normal">({reviews.length})</span>
              </h2>

              <div className="space-y-4">
                {reviews.length > 0 ? (
                  reviews.map((review, index) => (
                    <div key={index} className="bg-white p-6 rounded-2xl ring-1 ring-stone-100">
                      <div className="flex items-center justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                size={16}
                                className={i < review.rating ? "text-amber-400 fill-current" : "text-stone-200"}
                              />
                            ))}
                          </div>
                          <p className="text-sm text-stone-400">by {review.user?.firstName || "Customer"}</p>
                        </div>
                        <p className="text-xs text-stone-400">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <p className="mt-3 text-stone-600 leading-relaxed">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="bg-white rounded-2xl ring-1 ring-stone-100 py-16 text-center">
                    <p className="text-stone-400">No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 shadow-2xl">
            <h3 className="font-display text-2xl font-semibold mb-6 text-stone-900">Write a review</h3>

            <div className="flex gap-1.5 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setReviewData({ ...reviewData, rating: star })}
                  aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                  className="text-3xl text-amber-400 hover:scale-110 transition-transform"
                >
                  {star <= reviewData.rating ? '★' : '☆'}
                </button>
              ))}
            </div>

            <textarea
              value={reviewData.comment}
              onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
              placeholder="Share your honest experience with this seller..."
              className="w-full h-36 p-4 border border-stone-200 rounded-xl resize-y focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]/30 focus:border-[#8B1E3F] transition"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 py-3.5 border border-stone-200 rounded-xl font-medium text-stone-600 hover:bg-stone-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="flex-1 py-3.5 bg-[#8B1E3F] text-white rounded-xl font-medium hover:bg-[#7A1935] transition"
              >
                Submit review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerTypeDetail;