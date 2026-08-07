import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [liked, setLiked] = useState(false);

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

  return (
    <div
      onClick={() => navigate(`/product/${product._id}`)}
      className="relative bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-shadow p-4 sm:p-5 cursor-pointer"
    >
      {hasDiscount && (
        <span className="absolute top-4 left-4 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">
          -{Math.round(((product.price - product.salePrice) / product.price) * 100)}%
        </span>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          setLiked((prev) => !prev);
        }}
        className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center"
        aria-label="Save to wishlist"
      >
        <Heart
          className={`w-4 h-4 ${liked ? "fill-red-500 text-red-500" : "text-gray-400"}`}
        />
      </button>

      <div className="flex justify-center">
        <img
          src={primaryImage}
          alt={product?.name}
          className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover shadow-md"
        />
      </div>

      <div className="mt-4 text-center">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 line-clamp-1">
          {product?.name}
        </h3>
        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
             {product?.description}
        </p>
        <p className="mt-0.5 text-xs text-gray-400 line-clamp-1">
          {sellerName}
          {location ? ` · ${location}` : ""}
        </p>

        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-gray-500">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{product?.ratings?.toFixed?.(1) ?? "New"}</span>
          {product?.sold > 0 && <span className="text-gray-300">· {product.sold} sold</span>}
        </div>

        <div className="mt-3 flex items-center justify-between">
          <div className="text-left">
            {hasDiscount && (
              <span className="text-xs text-gray-400 line-through mr-1">
                ₦{product.price.toLocaleString()}
              </span>
            )}
            <span className="text-sm sm:text-base font-extrabold text-gray-900">
              ₦{displayPrice?.toLocaleString()}
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              // hook into your cart context/action here
            }}
            className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}