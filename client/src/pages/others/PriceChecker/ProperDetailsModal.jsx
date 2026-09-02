export default function PropertyDetailsModal({ item, onClose }) {
  if (!item) return null;
  const price = Number(item.price ?? item.investment_required) || 0;
  const image = item.images?.[0]?.image_path;

  return (
    <div className="fixed inset-0 z-40 mt-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-[#8a8291]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {image && <img src={image} alt={item.title} className="mb-4 h-64 w-full rounded-xl object-cover" />}

        <h2 className="font-serif text-xl font-bold text-[#1d1922]">{item.title}</h2>
        <p className="mt-1 font-serif text-2xl font-bold text-[#9c1f45]">₦{price.toLocaleString()}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <Detail label="Address" value={item.address} />
          <Detail label="State" value={item.state} />
          <Detail label="City" value={item.city} />
          <Detail label="Land type" value={item.land_type} />
          <Detail label="Land use" value={item.land_use} />
          <Detail label="Listing type" value={item.listing_type} />
          <Detail label="Total area" value={item.total_area ? `${item.total_area} ${item.area_unit || ''}` : null} />
          <Detail label="Negotiable" value={item.price_negotiable != null ? (item.price_negotiable ? 'Yes' : 'No') : null} />
          <Detail label="Developer" value={item.developer_name} />
          <Detail label="Total units" value={item.total_units} />
        </div>

        {item.description && <p className="mt-4 text-[13px] leading-relaxed text-[#4b4552]">{item.description}</p>}

        {item.owner && (
          <p className="mt-4 text-[12px] text-[#8a8291]">Listed by {item.owner.full_name}</p>
        )}
            <a    
          href={`https://eproperties.ng/properties/${item.slug || item._slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 block w-full rounded-full bg-[#9c1f45] py-3 text-center text-sm font-semibold text-white hover:bg-[#7a1834]"
        >
          Want to buy
        </a>
      </div>
      
    </div>
  );
}

function Detail({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-[#a79fb0]">{label}</p>
      <p className="text-[#1d1922]">{value}</p>
    </div>
  );
}