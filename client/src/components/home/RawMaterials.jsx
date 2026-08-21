import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productCategories } from '../../categories/productCategories';


const FARM_CATEGORY = productCategories.find((c) => c.id === 'farm-products');

// "All" chip + the farm-products subcategories, exactly as defined in productCategories
const SUBCATEGORY_CHIPS = [
  'All Materials',
  ...(FARM_CATEGORY ? FARM_CATEGORY.subcategories : []),
];

const SUPPLIER_LOCATIONS = ['Lagos Port', 'Ogun State Hub', 'Kano Depot', 'Port Harcourt'];

export default function RawMaterials() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [activeChip, setActiveChip] = useState('All Materials');
  const [minQty, setMinQty] = useState('');
  const [maxQty, setMaxQty] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        const all = Array.isArray(data) ? data : data.products || [];

        // Only farm-products category AND items flagged as raw material
        const farmRawMaterials = all.filter(
          (p) =>
            p.rawMaterial === true &&
            (p.category === 'Farm Products' || p.category === 'farm-products')
        );

        setProducts(farmRawMaterials);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search && !`${p.name} ${p.description}`.toLowerCase().includes(search.toLowerCase())) {
        return false;
      }
      if (activeChip !== 'All Materials' && p.subCategory !== activeChip) {
        return false;
      }
      if (minQty && Number(p.stockQuantity) < Number(minQty)) return false;
      if (maxQty && Number(p.stockQuantity) > Number(maxQty)) return false;
      if (minPrice && Number(p.price) < Number(minPrice)) return false;
      if (maxPrice && Number(p.price) > Number(maxPrice)) return false;
      if (locations.length && !locations.includes(p.supplierLocation)) return false;
      return true;
    });
  }, [products, search, activeChip, minQty, maxQty, minPrice, maxPrice, locations]);

  const toggleLocation = (loc) => {
    setLocations((prev) =>
      prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]
    );
  };

  return (
    <div className="bg-[#FDF6F2] min-h-screen px-6 py-8 md:px-12">
      <nav className="text-xs text-[#8A8A85] mb-4">
        <Link to="/" className="hover:text-[#D2601A]">Home</Link>
        <span className="mx-1.5">›</span>
        <span>B2B Sourcing</span>
        <span className="mx-1.5">›</span>
        <span className="text-[#1A1A1A]">Raw Materials</span>
      </nav>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A1A]">Raw Materials &amp; Bulk Products</h1>
          <p className="text-sm text-[#6B6B67] mt-2 max-w-lg">
            Source premium, verified industrial and agricultural materials directly
            from primary producers at wholesale rates.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search bulk materials, producers..."
            className="w-full rounded-lg border border-[#EADDD3] bg-white pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B0A8]"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* top filter: farm-products subcategories */}
      <div className="flex flex-wrap gap-2 mb-8">
        {SUBCATEGORY_CHIPS.map((chip) => {
          const active = chip === activeChip;
          return (
            <button
              key={chip}
              onClick={() => setActiveChip(chip)}
              className={`rounded-full px-4 py-2 text-xs font-medium whitespace-nowrap transition-colors ${
                active
                  ? 'bg-[#D2601A] text-white'
                  : 'bg-white text-[#4A4A46] border border-[#EADDD3] hover:border-[#D2601A]'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* sidebar filters */}
        <aside className="bg-white rounded-xl border border-[#EFE6DE] p-5 h-fit">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-semibold text-[#1A1A1A] text-sm">Filters</h2>
            <svg className="h-4 w-4 text-[#8A8A85]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M11 16h2" />
            </svg>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-[#4A4A46] mb-2">Minimum Order Qty (Tons)</p>
            <div className="flex gap-2 items-center">
              <input
                type="number" placeholder="Min" value={minQty}
                onChange={(e) => setMinQty(e.target.value)}
                className="w-full rounded-md border border-[#EADDD3] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
              />
              <span className="text-xs text-[#B5B0A8]">to</span>
              <input
                type="number" placeholder="Max" value={maxQty}
                onChange={(e) => setMaxQty(e.target.value)}
                className="w-full rounded-md border border-[#EADDD3] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
              />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-medium text-[#4A4A46] mb-2">Price Range (₦ / Ton)</p>
            <div className="flex gap-2 items-center">
              <input
                type="number" placeholder="Min" value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-md border border-[#EADDD3] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
              />
              <span className="text-xs text-[#B5B0A8]">to</span>
              <input
                type="number" placeholder="Max" value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-md border border-[#EADDD3] px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-[#4A4A46] mb-2">Supplier Location</p>
            <div className="space-y-2">
              {SUPPLIER_LOCATIONS.map((loc) => (
                <label key={loc} className="flex items-center gap-2 text-xs text-[#4A4A46] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={locations.includes(loc)}
                    onChange={() => toggleLocation(loc)}
                    className="accent-[#D2601A]"
                  />
                  {loc}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* product grid */}
        <div>
          {loading && <p className="text-sm text-[#8A8A85]">Loading materials…</p>}
          {error && <p className="text-sm text-red-600">Couldn't load products: {error}</p>}
          {!loading && !error && filtered.length === 0 && (
            <p className="text-sm text-[#8A8A85]">No raw materials match these filters.</p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((p) => (
              <div
                key={p._id}
                className="bg-white rounded-xl border border-[#EFE6DE] overflow-hidden flex flex-col"
              >
                <div className="relative h-36 bg-[#F1E9E2]">
                  {p.images?.[0]?.url && (
                    <img src={p.images[0].url} alt={p.name} className="h-full w-full object-cover" />
                  )}
                  {p.verifiedProducer && (
                    <span className="absolute top-2 left-2 bg-white/95 rounded-full px-2 py-1 text-[10px] font-medium text-[#1A1A1A] flex items-center gap-1">
                      <svg className="h-3 w-3 text-[#D2601A]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Verified Producer
                    </span>
                  )}
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-[#1A1A1A] text-sm truncate">{p.name}</h3>
                  <p className="text-xs text-[#8A8A85] mb-3 truncate">{p.sellerName || p.brand}</p>

                  <div className="flex justify-between text-xs mb-3">
                    <div>
                      <p className="text-[#8A8A85]">Wholesale Price</p>
                      <p className="font-semibold text-[#1A1A1A]">
                        ₦{Number(p.price).toLocaleString()}
                        <span className="text-[10px] text-[#8A8A85] font-normal"> /Ton</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[#8A8A85]">Available Qty</p>
                      <p className="font-semibold text-[#1A1A1A]">
                        {Number(p.stockQuantity).toLocaleString()} Tons
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-[#F1E9E2]">
                    <span className="text-[11px] text-[#8A8A85] flex items-center gap-1">
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {p.supplierLocation || '—'}
                    </span>
                    {/* NOTE: Product schema has no `slug` field — using _id until one is added */}
                    <Link
                      to={`/product/${p.slug || p._id}`}
                      className="text-xs font-medium text-[#D2601A] flex items-center gap-1 hover:underline"
                    >
                      View Details
                      <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}