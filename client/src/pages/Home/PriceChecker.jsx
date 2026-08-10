






import { useState, useEffect, useMemo, useRef } from 'react';
import { toast } from 'sonner';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/price-checker`;
const SEARCH_DEBOUNCE = 400;

// Fixed dropdown for product grade (product.grade is a free-text field in
// the schema, so the allowed values live here on the frontend).
const GRADE_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'foreign_used', label: 'Foreign Used' },
  { value: 'nigeria_used', label: 'Nigeria Used' },
];

// Fixed dropdown for seller type, mirrors sellerProfile.sellerTypes enum on
// the User schema (kept hardcoded here so it can't drift from what the
// filter UI needs, independent of whatever the backend /filters endpoint
// happens to return).
const SELLER_TYPE_OPTIONS = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
];

// Debounced mirror of `value` that can also be force-synced immediately by
// bumping `flushToken` (used by the explicit Search button).
function useDebouncedValue(value, delay, flushToken) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);

  // Whenever flushToken changes, apply the latest raw value right away,
  // skipping whatever's left of the debounce delay.
  useEffect(() => {
    if (flushToken === 0) return; // skip on mount
    setDebounced(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flushToken]);

  return debounced;
}

export default function PriceCheckers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ categories: [], states: [], sellerTypes: [] });
  const [filterOptionsLoaded, setFilterOptionsLoaded] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bumped by the Search button to force-apply whatever is currently typed,
  // instead of waiting out the debounce.
  const [flushToken, setFlushToken] = useState(0);

  // Raw, immediately-controlled input values (what the user sees as they type)
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sellerType: '',
    state: '',
    grade: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  // Only search + price fields need debouncing for real-time typing —
  // dropdowns/sort are discrete selections and should apply the instant
  // they're picked, no debounce needed.
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE, flushToken);
  const debouncedMinPrice = useDebouncedValue(filters.minPrice, SEARCH_DEBOUNCE, flushToken);
  const debouncedMaxPrice = useDebouncedValue(filters.maxPrice, SEARCH_DEBOUNCE, flushToken);

  const priceRangeInvalid =
    debouncedMinPrice !== '' &&
    debouncedMaxPrice !== '' &&
    Number(debouncedMinPrice) > Number(debouncedMaxPrice);

  // The filter set actually used to query the backend. Memoized so it only
  // changes reference when a value that matters for the query actually
  // changes — this is what keeps the fetch effect from firing on every
  // keystroke, while dropdown changes (category/sellerType/state/grade/sort)
  // flow straight through and trigger a fetch immediately.
  const queryFilters = useMemo(() => ({
    search: debouncedSearch,
    category: filters.category,
    sellerType: filters.sellerType,
    state: filters.state,
    grade: filters.grade,
    minPrice: debouncedMinPrice,
    maxPrice: debouncedMaxPrice,
    sort: filters.sort,
  }), [
    debouncedSearch,
    debouncedMinPrice,
    debouncedMaxPrice,
    filters.category,
    filters.sellerType,
    filters.state,
    filters.grade,
    filters.sort,
  ]);

  // Reset to page 1 whenever the *applied* filters change (not on every raw
  // keystroke before debounce settles).
  useEffect(() => {
    setPage(1);
  }, [queryFilters]);

  // Load filter option lists once
  useEffect(() => {
    let cancelled = false;
    fetch(`${API_BASE}/filters`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.success) {
          setFilterOptions({
            categories: d.categories || [],
            states: d.states || [],
            sellerTypes: d.sellerTypes || [],
          });
        } else {
          toast.error(d.message || 'Could not load filter options');
        }
      })
      .catch((e) => {
        if (cancelled) return;
        console.error(e);
        toast.error('Could not load filter options');
      })
      .finally(() => {
        if (!cancelled) setFilterOptionsLoaded(true);
      });
    return () => { cancelled = true; };
  }, []);

  // Fetch products whenever the applied filters or page change. Uses an
  // AbortController so a slow, now-outdated request can never overwrite the
  // result of a newer one.
  useEffect(() => {
    if (priceRangeInvalid) return; // don't query with a nonsensical range

    const controller = new AbortController();

    const run = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(queryFilters).forEach(([k, v]) => {
        if (v !== '' && v !== null && v !== undefined) params.append(k, v);
      });
      params.append('page', page);
      params.append('limit', 12);

      try {
        const res = await fetch(`${API_BASE}?${params.toString()}`, { signal: controller.signal });
        const data = await res.json();
        if (data.success) {
          setProducts(data.products || []);
          setTotalPages(data.totalPages || 1);
        } else {
          toast.error(data.message || 'Failed to load products');
        }
      } catch (e) {
        if (e.name !== 'AbortError') {
          console.error(e);
          toast.error('Something went wrong while loading products');
        }
        return; // aborted or errored — don't touch loading state below via finally on a stale request
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    run();
    return () => controller.abort();
  }, [queryFilters, page, priceRangeInvalid]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', category: '', sellerType: '', state: '', grade: '', minPrice: '', maxPrice: '', sort: 'newest',
    });
  };

  // Explicit "Search" trigger — applies whatever's currently typed right
  // now, in addition to the real-time debounced search that's already
  // running. Handy for a fast "Enter" / button-press submit.
  const runSearchNow = () => setFlushToken((t) => t + 1);

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== 'sort' && k !== 'search'
  ).length + (filters.search ? 1 : 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar with search + filters — filters are always visible now,
          no click-to-reveal step */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        {/* Row 1: search + sort */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 mt-5">
          <div className="relative flex-1 flex items-center gap-2">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') runSearchNow(); }}
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#8B1E3F]"
            />
            <button
              type="button"
              onClick={runSearchNow}
              className="rounded-full bg-[#8B1E3F] text-white px-4 py-2.5 text-sm font-medium whitespace-nowrap hover:bg-[#8B1E3F]"
            >
              Search
            </button>
          </div>

          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="hidden sm:block rounded-full border border-gray-300 px-3 py-2.5 text-sm bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          {activeFilterCount > 0 && (
            <span className="hidden sm:flex bg-[#8B1E3F] text-white text-[10px] font-bold rounded-full w-5 h-5 items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </div>

        {/* Row 2: filter bar — always shown, wraps on small screens */}
        <div className="max-w-7xl mx-auto px-4 pb-3 flex flex-wrap gap-2 items-center border-t border-gray-100 pt-3">
          <FilterSelect
            placeholder="Category"
            value={filters.category}
            onChange={(v) => updateFilter('category', v)}
            options={filterOptions.categories}
          />
          <FilterSelect
            placeholder="Seller type"
            value={filters.sellerType}
            onChange={(v) => updateFilter('sellerType', v)}
            options={SELLER_TYPE_OPTIONS}
          />
          <FilterSelect
            placeholder="Grade"
            value={filters.grade}
            onChange={(v) => updateFilter('grade', v)}
            options={GRADE_OPTIONS}
          />
          <FilterSelect
            placeholder="State"
            value={filters.state}
            onChange={(v) => updateFilter('state', v)}
            options={filterOptions.states}
          />

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5">
              <span className="text-xs text-gray-400">₦</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') runSearchNow(); }}
                className="w-16 bg-transparent text-sm focus:outline-none"
              />
              <span className="text-gray-300">–</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') runSearchNow(); }}
                className="w-16 bg-transparent text-sm focus:outline-none"
              />
            </div>
            {priceRangeInvalid && (
              <span className="text-[10px] text-red-500 mt-1 px-1">Min price is higher than max</span>
            )}
          </div>

          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="sm:hidden rounded-full border border-gray-300 px-3 py-1.5 text-sm bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-xs text-red-500 font-medium px-2 py-1.5 whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            {filterOptionsLoaded && activeFilterCount > 0
              ? 'No products match your filters.'
              : 'No products available right now.'}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-fr">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onViewSeller={() => setSelectedSeller(p.seller)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center flex-wrap gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-medium ${
                  page === i + 1 ? 'bg-[#8B1E3F] text-white' : 'bg-white border border-gray-300 text-gray-700'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {selectedSeller && (
        <SellerModal seller={selectedSeller} onClose={() => setSelectedSeller(null)} />
      )}
    </div>
  );
}

// Accepts either plain strings (["Lagos", "Abuja"]) or {value, label} pairs
// (for fixed dropdowns like grade/sellerType where the stored value and the
// display label differ).
function FilterSelect({ placeholder, value, onChange, options, capitalize }) {
  const rawOptions = options || [];
  const normalized = rawOptions.map((opt) =>
    typeof opt === 'string' ? { value: opt, label: capitalize ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt } : opt
  );

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-full border px-3 py-1.5 text-sm bg-white ${
        value ? 'border-[#8B1E3F] text-[#8B1E3F] font-medium' : 'border-gray-300 text-gray-600'
      }`}
    >
      <option value="">{placeholder}</option>
      {normalized.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

// ── Product Card ───────────────────────────────────────────────────────
// Every card is forced to identical dimensions:
//  - image: fixed pixel height (not aspect-ratio, so width changes across
//    breakpoints never change image height)
//  - name: fixed height, clamped to 2 lines, ellipsis if longer
//  - category / seller: fixed height, single line, ellipsis if longer
//  - whole card is a <button> so any part of it is clickable
function ProductCard({ product, onViewSeller }) {
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <button
      type="button"
      onClick={onViewSeller}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col text-left w-full h-full"
    >
      {/* Fixed-height image — same height on every card, every breakpoint */}
      <div className="relative w-full h-32 sm:h-36 bg-gray-100 shrink-0">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
            SALE
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-[11px] font-semibold">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-2.5 flex flex-col flex-1 min-h-0">
        {/* Name: fixed height, exactly 2 lines max, ellipsis beyond that */}
        <h4 className="text-xs sm:text-sm font-medium text-gray-800 line-clamp-2 h-9 sm:h-10 leading-[1.125rem] sm:leading-5">
          {product.name}
        </h4>

        {/* Category + grade: fixed height, single line, ellipsis */}
        <p className="text-[11px] text-gray-400 mt-0.5 truncate leading-4 h-4">
          {product.category}{product.grade ? ` · ${product.grade}` : ''}
        </p>

        <div className="mt-1 flex items-baseline gap-1.5">
          <span className="text-xs sm:text-sm font-bold text-[#8B1E3F]">
            ₦{(hasDiscount ? product.salePrice : product.price)?.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-[10px] text-gray-400 line-through">₦{product.price?.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-0.5 text-[11px] text-gray-500 truncate">
          ⭐ {product.ratings?.toFixed?.(1) ?? product.ratings} · {product.sold} sold
        </div>

        {/* Seller: pinned to bottom, fixed height, ellipsis */}
        <p className="mt-auto pt-1.5 text-[11px] sm:text-xs font-medium text-[#8B1E3F] truncate">
          {product.seller?.businessProfile?.businessName || product.seller?.username} →
        </p>
      </div>
    </button>
  );
}

function SellerModal({ seller, onClose }) {
  const bp = seller.businessProfile || {};
  const sp = seller.sellerProfile || {};
  const chain = sp.sellerChain || [];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {seller.profilePicture && (
              <img src={seller.profilePicture} className="w-12 h-12 rounded-full object-cover" alt="" />
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{bp.businessName || seller.username}</h3>
              <p className="text-xs text-gray-500">{seller.firstName} {seller.lastName} · {seller.state}{seller.lga ? `, ${seller.lga}` : ''}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
        </div>

        {sp.sellerTypes?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {sp.sellerTypes.map((t) => (
              <span key={t} className="text-xs capitalize bg-emerald-50 text-[#8B1E3F] px-2 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
            {sp.verifiedSeller && (
              <span className="text-xs bg-[#8B1E3F]-50 text-[#8B1E3F]-700 px-2 py-1 rounded-full font-medium">✓ Verified</span>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-sm mb-4">
          <Info label="Shop / Business" value={sp.shopName || bp.businessName} />
          <Info label="Address" value={bp.businessAddress} />
          <Info label="Phone" value={seller.phoneNumber} />
          <Info label="Email" value={seller.email} />
          <Info label="Market" value={sp.market} />
          <Info label="Years in business" value={bp.yearsInBusiness} />
          <Info label="Staff count" value={bp.staffCount} />
          <Info label="Payment methods" value={sp.acceptedPaymentMethods} />
        </div>

        {bp.shopDescription || sp.shopDescription ? (
          <p className="text-sm text-gray-600 mb-4">{sp.shopDescription || bp.shopDescription}</p>
        ) : null}

        <h4 className="font-semibold text-gray-800 mb-2 text-sm">Distribution chain ({chain.length})</h4>
        {chain.length === 0 ? (
          <p className="text-sm text-gray-400 mb-2">No distribution chain listed.</p>
        ) : (
          <div className="space-y-2">
            {chain.map((c, idx) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-800">{c.businessName}</span>
                  <span className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
                    {c.relationship}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{c.address}</p>
                <p className="text-xs text-gray-500">{c.phoneNumber} {c.email ? `· ${c.email}` : ''}</p>

                {c.purchaseHistory?.length > 0 && (
                  <details className="mt-2">
                    <summary className="text-xs text-[#8B1E3F] cursor-pointer">
                      Purchase history ({c.purchaseHistory.length})
                    </summary>
                    <div className="mt-2 space-y-1">
                      {c.purchaseHistory.map((ph, i) => (
                        <div key={i} className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-1">
                          <span>{ph.productName} × {ph.quantity}{ph.unit ? ` ${ph.unit}` : ''}</span>
                          <span>{ph.currency} {ph.totalAmount?.toLocaleString()} · {ph.paymentStatus}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[10px] text-gray-400 uppercase">{label}</p>
      <p className="text-gray-700">{value}</p>
    </div>
  );
}