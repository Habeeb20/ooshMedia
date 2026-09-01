const CARS_ENDPOINT = 'https://backend.ecars.ng/api/cars/allcars';
const PROPERTIES_ENDPOINT = 'https://api.eproperties.ng/api/search';

export const CAR_TRANSMISSIONS = [
  { value: '', label: 'Any transmission' },
  { value: 'automatic', label: 'Automatic' },
  { value: 'manual', label: 'Manual' },
];

export const CAR_FUEL_TYPES = [
  { value: '', label: 'Any fuel type' },
  { value: 'petrol', label: 'Petrol' },
  { value: 'diesel', label: 'Diesel' },
  { value: 'electric', label: 'Electric' },
  { value: 'hybrid', label: 'Hybrid' },
];

export const CAR_CONDITIONS = [
  { value: '', label: 'Any condition' },
  { value: 'brand new', label: 'Brand new' },
  { value: 'foreign used', label: 'Foreign used' },
  { value: 'nigerianUsed', label: 'Nigerian used' },
];

export const CAR_BODY_TYPES = [
  { value: '', label: 'Any body type' },
  { value: 'sedan', label: 'Sedan' },
  { value: 'suv', label: 'SUV' },
  { value: 'truck', label: 'Truck' },
  { value: 'bus', label: 'Bus' },
  { value: 'bikes', label: 'Bike' },
];

export const CAR_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'mileage_low', label: 'Mileage: Low to High' },
  { value: 'year_new', label: 'Year: Newest first' },
];

export const PROPERTY_LISTING_TYPES = [
  { value: '', label: 'Any listing type' },
  { value: 'sale', label: 'For sale' },
  { value: 'rent', label: 'For rent' },
];

export const PROPERTY_LAND_TYPES = [
  { value: '', label: 'Any land type' },
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'mixed_use', label: 'Mixed use' },
  { value: 'agricultural', label: 'Agricultural' },
];

export const PROPERTY_KIND_OPTIONS = [
  { value: '', label: 'Any listing category' },
  { value: 'land', label: 'Land' },
  { value: 'development', label: 'Development' },
  { value: 'property', label: 'Property' },
];

export const NIGERIAN_STATES = [
  '', 'Lagos', 'Abuja (FCT)', 'Rivers', 'Oyo', 'Kano', 'Kaduna', 'Ogun', 'Enugu', 'Delta', 'Anambra',
];

const num = (n) => Number(n) || 0;

/* ---------------- cars ---------------- */

export function effectiveCarPrice(car) {
  return num(car.price);
}

let carsCache = null; // the endpoint returns the whole catalog, so cache it once per page load

async function loadAllCars() {
  if (carsCache) return carsCache;
  const res = await fetch(CARS_ENDPOINT);
  if (!res.ok) throw new Error('Could not load cars right now.');
  const json = await res.json();
  carsCache = json?.data?.cars || [];
  return carsCache;
}

function uniqueMakes(cars) {
  return Array.from(new Set(cars.map((c) => c.make?.trim()).filter(Boolean))).sort();
}

export async function fetchCars({
  search = '', make = '', model = '', year = '', minPrice = '', maxPrice = '',
  transmission = '', fuelType = '', bodyType = '', condition = '', state = '',
  sort = 'newest', page = 1, limit = 20,
} = {}) {
  const all = await loadAllCars();
  const q = search.trim().toLowerCase();

  let filtered = all.filter((car) => {
    if (q) {
      const haystack = `${car.title || ''} ${car.make || ''} ${car.model || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (make && car.make?.trim().toLowerCase() !== make.trim().toLowerCase()) return false;
    if (model && !car.model?.toLowerCase().includes(model.toLowerCase())) return false;
    if (year && String(car.year) !== String(year)) return false;
    if (transmission && car.transmission !== transmission) return false;
    if (fuelType && car.fuelType !== fuelType) return false;
    if (bodyType && car.bodyType?.toLowerCase() !== bodyType.toLowerCase()) return false;
    if (condition && car.condition?.toLowerCase() !== condition.toLowerCase()) return false;
    if (state && car.location?.state?.trim().toLowerCase() !== state.trim().toLowerCase()) return false;
    const price = effectiveCarPrice(car);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;
    return true;
  });

  filtered = [...filtered].sort((a, b) => {
    if (sort === 'price_low') return effectiveCarPrice(a) - effectiveCarPrice(b);
    if (sort === 'price_high') return effectiveCarPrice(b) - effectiveCarPrice(a);
    if (sort === 'mileage_low') return (a.mileage || 0) - (b.mileage || 0);
    if (sort === 'year_new') return (b.year || 0) - (a.year || 0);
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = filtered.slice(start, start + limit);

  return { items, total, page, totalPages, makes: uniqueMakes(all) };
}

/* ---------------- properties ---------------- */

export function effectivePropertyPrice(item) {
  return num(item.price ?? item.investment_required);
}

export async function fetchProperties({
  search = '', listingType = '', landType = '', kind = '', state = '',
  minPrice = '', maxPrice = '', sort = 'newest', page = 1, limit = 20,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set('q', search);

  const res = await fetch(`${PROPERTIES_ENDPOINT}?${params.toString()}`);
  if (!res.ok) throw new Error('Could not load properties right now.');
  const json = await res.json();
  const data = json?.data || {};

  const lands = (data.lands || []).map((l) => ({ ...l, _kind: 'land' }));
  const developments = (data.developments || []).map((d) => ({ ...d, _kind: 'development' }));
  const properties = (data.properties || []).map((p) => ({ ...p, _kind: 'property' }));
  let all = [...lands, ...developments, ...properties];

  const q = search.trim().toLowerCase();
  all = all.filter((item) => {
    if (q) {
      const haystack = `${item.title || ''} ${item.description || ''} ${item.address || ''}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (kind && item._kind !== kind) return false;
    if (listingType && item.listing_type !== listingType) return false;
    if (landType && item.land_type !== landType) return false;
    if (state && item.state?.trim().toLowerCase() !== state.trim().toLowerCase()) return false;
    const price = effectivePropertyPrice(item);
    if (minPrice && price < Number(minPrice)) return false;
    if (maxPrice && price > Number(maxPrice)) return false;
    return true;
  });

  all = [...all].sort((a, b) => {
    if (sort === 'price_low') return effectivePropertyPrice(a) - effectivePropertyPrice(b);
    if (sort === 'price_high') return effectivePropertyPrice(b) - effectivePropertyPrice(a);
    return new Date(b.created_at || 0) - new Date(a.created_at || 0);
  });

  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  return { items, total, page, totalPages };
}