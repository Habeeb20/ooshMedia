
import { formatNaira, effectivePrice } from './pricecheckerApi';
export default function ProductDetailsModal({ product, onClose }) {
  if (!product) return null;
  const image = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
  const shopName = product.seller?.sellerProfile?.shopName || product.seller?.username;

  return (
    <div className="fixed inset-0 z-40 mt-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 rounded-full bg-[#f6f4f9] p-1.5 text-[#8a8291] hover:bg-[#ece7f0]"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {image && (
          <div className="mb-4 aspect-[4/3] w-full overflow-hidden rounded-xl bg-[#f5f2f7]">
            <img src={image} alt={product.name} className="h-full w-full object-cover" />
          </div>
        )}

        <h3 className="font-serif text-xl font-bold text-[#1d1922]">{product.name}</h3>
        <p className="mt-1 text-[13px] text-[#8a8291]">Sold by {shopName}</p>

        <p className="mt-4 text-[14px] leading-relaxed text-[#413a49]">{product.description}</p>

        <div className="mt-5 flex items-center justify-between rounded-xl bg-[#f6f4f9] px-4 py-3">
          <span className="font-serif text-2xl font-bold text-[#9c1f45]">{formatNaira(effectivePrice(product))}</span>
          <span className="text-[13px] text-[#8a8291]">
            {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>

         <a
          href={`/product/${product.id || product._id}`}
          className="mt-5 block w-full rounded-full bg-[#9c1f45] py-3 text-center text-sm font-semibold text-white hover:bg-[#7a1834]"
        >
          Want to buy
        </a>
      </div>
 
    </div>
  );
}













