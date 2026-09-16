// src/components/home/CertifiedVehiclesSection.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { MapPin, ArrowRight } from "lucide-react";

const ORANGE = "#811010";
const PEACH_BG = "#FCE9DE";

const formatNaira = (n) => `₦${Number(n || 0).toLocaleString("en-NG")}`;

// Condition strings in the API are inconsistent ("foreign used" vs
// "foreignUsed" vs "nigerianUsed"), so normalize before matching.
const getCarBadge = (car) => {
  if (car?.isVerified) return "VERIFIED INSPECTED";
  const c = (car?.condition || "").toLowerCase().replace(/\s+/g, "");
  if (c.includes("brand")) return "BRAND NEW 0KM";
  if (c.includes("foreign")) return "FOREIGN USED (TOKUNBO)";
  if (c.includes("nigerian")) return "NIGERIAN USED";
  return "AVAILABLE";
};

function CarCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-44 bg-gray-100" />
      <div className="p-4 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-1/2" />
        <div className="h-4 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2 mt-3" />
      </div>
    </div>
  );
}

function CarCard({ car }) {
  const image = car?.images?.[0] || "https://via.placeholder.com/500x350";
  const locationStr = [car?.location?.lga, car?.location?.state]
    .filter(Boolean)
    .map((s) => s.trim())
    .join(", ");
  const specs = [
    car?.transmission ? car.transmission[0].toUpperCase() + car.transmission.slice(1) : null,
    car?.fuelType ? car.fuelType[0].toUpperCase() + car.fuelType.slice(1) : null,
    car?.bodyType,
  ]
    .filter(Boolean)
    .join(" • ");

  const href = `https://ecars.ng/cars/${car?.id || car?._id}`;

  return (
    <a
      href={href}
      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-300 flex flex-col"
    >
      <div className="relative h-40 sm:h-44 overflow-hidden bg-gray-50">
        <img
          src={image}
          alt={car?.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <span className="absolute top-3 left-3 bg-black/70 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-md">
          {getCarBadge(car)}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-gray-400 mb-1">
          <MapPin size={12} style={{ color: ORANGE }} />
          <span className="truncate">{locationStr || "Nigeria"}</span>
        </div>
        <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug truncate">
          {car?.title}
        </h3>
        {specs && <p className="text-xs text-gray-400 mt-1 truncate">{specs}</p>}

        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">Price</p>
          <p className="font-black text-lg" style={{ color: ORANGE }}>
            {formatNaira(car?.price)}
          </p>
        </div>
      </div>
    </a>
  );
}

export default function CertifiedVehiclesSection() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await axios.get("https://backend.ecars.ng/api/cars/allcars");
        const list = data?.data?.cars || [];
        if (!cancelled) setCars(list.slice(0, 4));
      } catch (err) {
        console.error("Failed to load cars:", err);
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900">Certified Vehicles &amp; Direct Deals</h2>
          <p className="text-gray-500 text-sm sm:text-base mt-1">
            Shop brand new, foreign used (Tokunbo), and verified inspected cars directly on eCars with secure escrow
          </p>
        </div>
        <a
          href="https://ecars.ng"
          className="hidden sm:flex items-center gap-1.5 flex-shrink-0 text-sm font-bold px-4 py-2.5 rounded-full transition hover:opacity-90"
          style={{ background: PEACH_BG, color: ORANGE }}
        >
          View All on eCars <ArrowRight size={15} />
        </a>
      </div>

      {error ? (
        <p className="text-sm text-gray-400 py-8 text-center">Couldn't load vehicles right now.</p>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {loading
            ? [...Array(4)].map((_, i) => <CarCardSkeleton key={i} />)
            : cars.map((c) => <CarCard key={c.id || c._id} car={c} />)}
        </div>
      )}
    </section>
  );
}