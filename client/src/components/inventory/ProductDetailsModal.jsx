import { X } from 'lucide-react';
import appConfig from '../../config/AppConfig';


export default function ProductDetailModal({ product, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
       {/* Image Gallery */}
        <div className="relative h-80 bg-gray-100">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 rounded-full shadow hover:bg-white"
          >
            <X size={24} />
          </button>

          {product.images && product.images.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 h-full">
              {/* Main Image */}
              <img 
                src={product.images[0].url} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {/* Thumbnails */}
              <div className="p-4 grid grid-cols-2 gap-2 overflow-y-auto">
                {product.images.slice(1).map((img, index) => (
                  <img 
                    key={index}
                    src={img.url} 
                    alt={`${product.name} ${index + 1}`}
                    className="w-full h-32 object-cover rounded-xl"
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No images available
            </div>
          )}
        </div>

          <div className="p-8">
            <h2 className="text-3xl font-bold">{product.name}</h2>
            <p className="text-gray-500 mt-1">{product.sku}</p>

            <div className="flex gap-6 mt-8">
              <div>
                <p className="text-sm text-gray-500">Current Stock</p>
                <p className={`text-4xl font-bold ${product.stockQuantity <= 5 ? 'text-red-600' : 'text-green-600'}`}>
                  {product.stockQuantity}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Price</p>
                <p className="text-4xl font-bold">₦{product.price?.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-10">
              <h3 className="font-semibold mb-3">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}