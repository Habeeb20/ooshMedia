import { Heart, Star } from "lucide-react";
import appConfig from "../../config/appConfig";

export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 group">
      <div className="relative overflow-hidden">
        <img
          src={product.image}
          className="h-64 w-full object-cover group-hover:scale-105 transition duration-500"
        />

        <button className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
          <Heart size={18} />
        </button>
      </div>

      <div className="p-5">
        <h3 className="font-semibold text-[15px] line-clamp-2">
          {product.title}
        </h3>

        <div className="mt-3">
          <p
            className="text-2xl font-black"
            style={{ color: appConfig.colors.primary }}
          >
            {product.price}
          </p>

          <p className="line-through text-gray-400">
            {product.oldPrice}
          </p>
        </div>

        <div className="flex mt-3 text-amber-400">
          <Star fill="currentColor" size={16} />
          <Star fill="currentColor" size={16} />
          <Star fill="currentColor" size={16} />
          <Star fill="currentColor" size={16} />
          <Star fill="currentColor" size={16} />
        </div>

        <button
          className="w-full py-3 rounded-xl mt-5 text-white font-bold"
          style={{ background: appConfig.colors.primary }}
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}