import { formatNaira, effectivePrice } from "./pricecheckerApi";
export default function ProductCard({ product, isBestPrice, onViewDetails }) {
  const image = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url;
  const price = effectivePrice(product);
  const hasDiscount = product.salePrice && product.salePrice < product.price;
  const outOfStock = product.status === 'out_of_stock' || product.stockQuantity === 0;
  const shopName = product.seller?.sellerProfile?.shopName || product.seller?.username || 'Unnamed seller';
  const distance = product.seller?.sellerProfile?.market || product.seller?.lga;

  return (
    <article
      className={[
        'group relative flex flex-col rounded-2xl bg-white ring-1 ring-[#eae4ee] transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-20px_rgba(74,16,39,0.35)]',
        outOfStock ? 'opacity-70' : '',
      ].join(' ')}
    >
      {isBestPrice && !outOfStock && (
        <span
          className="absolute -left-1.5 top-4 z-10 flex items-center gap-1 rounded-r-full bg-[#9c1f45] py-1 pl-3 pr-3 text-[11px] font-semibold uppercase tracking-wide text-white shadow-md"
          style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%, 6px 50%)' }}
        >
          ★ Best price
        </span>
      )}

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-2xl bg-[#f5f2f7]">
        {image ? (
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#b8afc2]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <path d="M4 16l4-4a2 2 0 0 1 2.8 0l4.2 4.2M14 12l1.4-1.4a2 2 0 0 1 2.8 0L21 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <rect x="3" y="4" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="8" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
            <span className="rounded-full bg-[#15121b] px-3 py-1 text-xs font-semibold tracking-wide text-white">
              Unavailable
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-[#1d1922]">
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5 text-[13px] text-[#6f6878]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
            <path d="M3 7l4-4h10l4 4M3 7l9 5 9-5M3 7v10l9 5 9-5V7" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <span className="truncate">{shopName}</span>
        </div>

        {distance && (
          <div className="flex items-center gap-1.5 text-[13px] text-[#6f6878]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0">
              <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
            </svg>
            <span className="truncate">{distance}{outOfStock ? ' · Out of stock' : ' · In stock'}</span>
          </div>
        )}

        <div className="mt-auto flex items-end justify-between pt-2">
          <div className="flex flex-col">
            {hasDiscount && (
              <span className="text-xs text-[#a79fb0] line-through">{formatNaira(product.price)}</span>
            )}
            <span className={`font-serif text-xl font-bold ${outOfStock ? 'text-[#a79fb0]' : isBestPrice ? 'text-[#9c1f45]' : 'text-[#1d1922]'}`}>
              {outOfStock ? formatNaira(price) : formatNaira(price)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onViewDetails?.(product)}
            disabled={outOfStock}
            className="flex items-center gap-1 text-[13px] font-semibold text-[#9c1f45] transition-colors hover:text-[#7a1834] disabled:cursor-not-allowed disabled:text-[#c8c1cf]"
          >
            {outOfStock ? 'Unavailable' : 'View details'}
            {!outOfStock && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </article>
  );
}