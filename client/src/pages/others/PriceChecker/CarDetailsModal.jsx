export default function CarDetailsModal({ car, onClose }) {
  if (!car) return null;
  const price = Number(car.price) || 0;

  return (
    <div className="fixed inset-0 z-40 flex mt-50 h-[55vh] items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <button type="button" onClick={onClose} className="absolute right-5 top-5 text-[#8a8291]">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        </button>

        {car.images?.[0] && <img src={car.images[0]} alt={car.title} className="mb-4 h-64 w-full rounded-xl object-cover" />}

        <h2 className="font-serif text-xl font-bold text-[#1d1922]">{car.title}</h2>
        <p className="mt-1 font-serif text-2xl font-bold text-[#9c1f45]">₦{price.toLocaleString()}</p>

        <div className="mt-4 grid grid-cols-2 gap-3 text-[13px]">
          <Detail label="Make" value={car.make} />
          <Detail label="Model" value={car.model} />
          <Detail label="Year" value={car.year} />
          <Detail label="Mileage" value={car.mileage ? `${car.mileage.toLocaleString()} km` : null} />
          <Detail label="Transmission" value={car.transmission} />
          <Detail label="Fuel type" value={car.fuelType} />
          <Detail label="Body type" value={car.bodyType} />
          <Detail label="Condition" value={car.condition} />
          <Detail label="Color" value={car.color} />
          <Detail label="Location" value={car.location ? `${car.location.lga || ''}, ${car.location.state || ''}` : null} />
        </div>

        {car.description && <p className="mt-4 text-[13px] leading-relaxed text-[#4b4552]">{car.description}</p>}

        {car.features?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {car.features.map((f) => (
              <span key={f} className="rounded-full bg-[#f6f4f9] px-2.5 py-1 text-[11px] text-[#4b4552]">{f}</span>
            ))}
          </div>
        )}

        {car.postedBy && (
          <p className="mt-4 text-[12px] text-[#8a8291]">
            Listed by {car.postedBy.dealerInfo?.businessName || `${car.postedBy.firstName} ${car.postedBy.lastName}`}
            {car.postedBy.phoneNumber && ` · ${car.postedBy.phoneNumber}`}
          </p>
        )}
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