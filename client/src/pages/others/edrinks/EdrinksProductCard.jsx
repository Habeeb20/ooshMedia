


import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Heart, ShoppingBag, Clock, MapPin, Eye, Share2, Check } from "lucide-react";
import useDistance from "../../../config/useDistance";
import { addToCart, isInCart } from "../../../config/cartUtils";

const API = import.meta.env.VITE_BACKEND_URL;

const formatViews = (n = 0) => {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return `${n}`;
};

export default function EdrinksProductCard({ product, userLocation }) {
  const navigate = useNavigate();

  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(product?.likes || 0);
  const [inCart, setInCart] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [shares, setShares] = useState(product?.shares || 0);
  useEffect(() => {
    setInCart(isInCart(product?._id));
  }, [product?._id]);

  const primaryImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "/placeholder-food.png";

  const hasDiscount =
    product?.salePrice && product.salePrice < product.price;

  const displayPrice = hasDiscount ? product.salePrice : product.price;

  const sellerName =
    product?.seller?.businessProfile?.businessName ||
    product?.seller?.username ||
    "Local Seller";

  const location = [product?.seller?.lga, product?.seller?.state]
    .filter(Boolean)
    .join(", ");

  const sellerAddress = location ? `${location}, Nigeria` : null;
  const { distanceText, durationText } = useDistance(userLocation, sellerAddress);

  const handleLike = async (e) => {
    e.stopPropagation();
    if (liked) return;
    const prevLikes = likes;
    setLiked(true);
    setLikes((l) => l + 1);

    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.post(
        `${API}/api/products/${product._id}/like`,
        {},
        token ? { headers: { Authorization: `Bearer ${token}` } } : undefined
      );
      setLikes(data.likes);
    } catch (err) {
      console.log(err);
      setLiked(false);
      setLikes(prevLikes);
    }
  };


    const handleShare = async (e) => {
    e.stopPropagation();
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} on our store`,
      url: `${window.location.origin}/product/${product._id}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Link copied to clipboard");
      }
      const { data } = await axios.post(`${API}/api/products/${product._id}/share`);
      setShares(data.shares);
    } catch (err) {
      // user cancelling the native share sheet also lands here — don't treat as an error
      if (err?.name !== "AbortError") console.log(err);
    }
  };


  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product, 1);
    setInCart(true);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <div
    onClick={() => navigate(`/drinksseller/${product.seller?._id || product.seller}`)}
      // onClick={() => navigate(`/product/${product._id}`)}
      className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-4 sm:p-5 cursor-pointer"
    >
      {hasDiscount && (
        <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
        </span>
      )}

          <button
            onClick={handleShare}
            className="top-4 left-5 flex items-center gap-1 hover:text-gray-600"
          >
            <Share2 className="w-3.5 h-3.5" /> {shares}
          </button>

      <button
        onClick={handleLike}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
        aria-label="Like product"
      >
        <Heart className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      <div className="flex justify-center">
        <img
          src={primaryImage}
          alt={product?.name}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md"
        />
      </div>

      {/* Meta row: location · time · distance · views */}
      <div className="mt-4 flex items-center gap-3 flex-wrap text-xs text-gray-500">
        {location && <span>{location}</span>}
        {durationText && (
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {durationText}
          </span>
        )}
        {distanceText && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5" /> {distanceText}
          </span>
        )}
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {formatViews(product?.views)}
        </span>
      </div>

      {/* Title + seller */}
      <div className="mt-2 flex items-start justify-between gap-2">
        <h3 className="text-base sm:text-lg font-extrabold text-gray-900 line-clamp-1">
          {product?.name}
        </h3>
        <span className="text-xs italic text-gray-400 whitespace-nowrap mt-1">
          {sellerName}
        </span>
      </div>

             {/* engagement row: views / likes / shares */}
        <div className="mt-2 flex items-center justify-center gap-3 text-[11px] text-gray-400">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" /> {product?.views || 0}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" /> {likes}
        </span>
          {/* <button
            onClick={handleShare}
            className="flex items-center gap-1 hover:text-gray-600"
          >
            <Share2 className="w-3.5 h-3.5" /> {shares}
          </button> */}
        </div>

      {/* Description */}
      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
        {product?.description}
      </p>

      {/* Price + cart */}
      <div className="mt-3 flex items-center justify-between">
        <div className="text-left">
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through mr-1">
              ₦{product.price.toLocaleString()}
            </span>
          )}
          <span className="text-base font-extrabold text-red-500">
            ₦{displayPrice?.toLocaleString()}
          </span>
        </div>

        <button
          onClick={handleAddToCart}
          className="w-10 h-10 rounded-full bg-amber-400 text-gray-900 flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
          aria-label="Add to cart"
        >
          {justAdded || inCart ? (
            <Check className="w-4 h-4" />
          ) : (
            <ShoppingBag className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}