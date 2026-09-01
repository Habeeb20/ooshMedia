const KIND_LABELS = { land: 'Land', development: 'Development', property: 'Property' };

export default function PropertyCard({ item, isBestPrice, onViewDetails }) {
  const price = Number(item.price ?? item.investment_required) || 0;
  const image = item.images?.[0]?.image_path;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#ece7f0] bg-white transition-shadow hover:shadow-md">
      {isBestPrice && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-[#9c1f45] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
          Best price
        </span>
      )}
      <div className="aspect-[4/3] w-full bg-[#f0ecf3]">
        {image && <img src={image} alt={item.title} className="h-full w-full object-cover" />}
      </div>
      <div className="space-y-1.5 p-4">
        <span className="inline-block rounded-full bg-[#fdf1f5] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#9c1f45]">
          {KIND_LABELS[item._kind] || 'Listing'}
        </span>
        <p className="line-clamp-1 text-[13px] font-semibold text-[#1d1922]">{item.title}</p>
        <p className="line-clamp-1 text-[12px] text-[#8a8291]">{item.city}, {item.state}</p>
        {item.total_area && <p className="text-[12px] text-[#8a8291]">{item.total_area} {item.area_unit}</p>}
        <p className="font-serif text-lg font-bold text-[#9c1f45]">₦{price.toLocaleString()}</p>
        <button
          type="button"
          onClick={() => onViewDetails(item)}
          className="mt-1 w-full rounded-full border border-[#9c1f45] py-1.5 text-[12px] font-semibold text-[#9c1f45] hover:bg-[#9c1f45] hover:text-white"
        >
          View details
        </button>
      </div>
    </div>
  );
}