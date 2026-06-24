// import { useState, useEffect, useCallback } from 'react';

// const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/price-checker`;

// function useDebounce(value, delay = 400) {
//   const [debounced, setDebounced] = useState(value);
//   useEffect(() => {
//     const t = setTimeout(() => setDebounced(value), delay);
//     return () => clearTimeout(t);
//   }, [value, delay]);
//   return debounced;
// }

// export default function PriceCheckers() {
//   const [products, setProducts] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [filterOptions, setFilterOptions] = useState({ categories: [], states: [], sellerTypes: [] });
//   const [showFilters, setShowFilters] = useState(false);
//   const [selectedSeller, setSelectedSeller] = useState(null);
//   const [page, setPage] = useState(1);
//   const [totalPages, setTotalPages] = useState(1);

//   const [filters, setFilters] = useState({
//     search: '',
//     category: '',
//     sellerType: '',
//     state: '',
//     minPrice: '',
//     maxPrice: '',
//     sort: 'newest',
//   });

//   const debouncedSearch = useDebounce(filters.search);

//   useEffect(() => {
//     fetch(`${API_BASE}/filters`)
//       .then((r) => r.json())
//       .then((d) => d.success && setFilterOptions(d));
//   }, []);

//   const fetchProducts = useCallback(async () => {
//     setLoading(true);
//     const params = new URLSearchParams();
//     Object.entries({ ...filters, search: debouncedSearch }).forEach(([k, v]) => {
//       if (v) params.append(k, v);
//     });
//     params.append('page', page);
//     params.append('limit', 12);

//     try {
//       const res = await fetch(`${API_BASE}?${params.toString()}`);
//       const data = await res.json();
//       if (data.success) {
//         setProducts(data.products);
//         setTotalPages(data.totalPages);
//       }
//     } catch (e) {
//       console.error(e);
//     } finally {
//       setLoading(false);
//     }
//   }, [filters, debouncedSearch, page]);

//   useEffect(() => {
//     fetchProducts();
//   }, [fetchProducts]);

//   const updateFilter = (key, value) => {
//     setPage(1);
//     setFilters((f) => ({ ...f, [key]: value }));
//   };

//   const clearFilters = () => {
//     setFilters({
//       search: '', category: '', sellerType: '', state: '', minPrice: '', maxPrice: '', sort: 'newest',
//     });
//     setPage(1);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Header / Search */}
//       <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3">
//         <input
//           type="text"
//           placeholder="Search products..."
//           value={filters.search}
//           onChange={(e) => updateFilter('search', e.target.value)}
//           className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
//         />
//         <button
//           onClick={() => setShowFilters(true)}
//           className="lg:hidden flex items-center gap-1 rounded-full bg-emerald-600 text-white px-4 py-2 text-sm font-medium"
//         >
//           Filters
//         </button>
//       </div>

//       <div className="flex max-w-7xl mx-auto">
//         {/* Desktop sidebar */}
//         <aside className="hidden lg:block w-72 shrink-0 p-4">
//           <FilterPanel filters={filters} updateFilter={updateFilter} filterOptions={filterOptions} clearFilters={clearFilters} />
//         </aside>

//         {/* Mobile filter drawer */}
//         {showFilters && (
//           <div className="fixed inset-0 z-40 lg:hidden">
//             <div className="absolute inset-0 bg-black/40" onClick={() => setShowFilters(false)} />
//             <div className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white p-4 overflow-y-auto shadow-xl">
//               <div className="flex justify-between items-center mb-4">
//                 <h3 className="font-semibold text-lg">Filters</h3>
//                 <button onClick={() => setShowFilters(false)} className="text-gray-500 text-xl leading-none">&times;</button>
//               </div>
//               <FilterPanel filters={filters} updateFilter={updateFilter} filterOptions={filterOptions} clearFilters={clearFilters} />
//               <button
//                 onClick={() => setShowFilters(false)}
//                 className="mt-4 w-full rounded-lg bg-emerald-600 text-white py-2.5 font-medium"
//               >
//                 Show results
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Product grid */}
//         <main className="flex-1 p-4">
//           {loading ? (
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//               {Array.from({ length: 8 }).map((_, i) => (
//                 <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
//               ))}
//             </div>
//           ) : products.length === 0 ? (
//             <div className="text-center py-20 text-gray-500">No products match your filters.</div>
//           ) : (
//             <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//               {products.map((p) => (
//                 <ProductCard key={p._id} product={p} onViewSeller={() => setSelectedSeller(p.seller)} />
//               ))}
//             </div>
//           )}

//           {/* Pagination */}
//           {totalPages > 1 && (
//             <div className="flex justify-center gap-2 mt-8">
//               {Array.from({ length: totalPages }).map((_, i) => (
//                 <button
//                   key={i}
//                   onClick={() => setPage(i + 1)}
//                   className={`w-9 h-9 rounded-full text-sm font-medium ${
//                     page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
//                   }`}
//                 >
//                   {i + 1}
//                 </button>
//               ))}
//             </div>
//           )}
//         </main>
//       </div>

//       {selectedSeller && (
//         <SellerModal seller={selectedSeller} onClose={() => setSelectedSeller(null)} />
//       )}
//     </div>
//   );
// }

// function FilterPanel({ filters, updateFilter, filterOptions, clearFilters }) {
//   return (
//     <div className="space-y-5">
//       <div className="flex justify-between items-center">
//         <h3 className="font-semibold text-gray-800">Filter products</h3>
//         <button onClick={clearFilters} className="text-xs text-emerald-600 font-medium">Clear all</button>
//       </div>

//       <FilterSelect
//         label="Category"
//         value={filters.category}
//         onChange={(v) => updateFilter('category', v)}
//         options={filterOptions.categories}
//       />

//       <FilterSelect
//         label="Seller type"
//         value={filters.sellerType}
//         onChange={(v) => updateFilter('sellerType', v)}
//         options={filterOptions.sellerTypes}
//         capitalize
//       />

//       <FilterSelect
//         label="State"
//         value={filters.state}
//         onChange={(v) => updateFilter('state', v)}
//         options={filterOptions.states}
//       />

//       <div>
//         <label className="text-xs font-medium text-gray-500 uppercase">Price range (₦)</label>
//         <div className="flex gap-2 mt-1">
//           <input
//             type="number"
//             placeholder="Min"
//             value={filters.minPrice}
//             onChange={(e) => updateFilter('minPrice', e.target.value)}
//             className="w-1/2 rounded-lg border border-gray-300 px-2 py-2 text-sm"
//           />
//           <input
//             type="number"
//             placeholder="Max"
//             value={filters.maxPrice}
//             onChange={(e) => updateFilter('maxPrice', e.target.value)}
//             className="w-1/2 rounded-lg border border-gray-300 px-2 py-2 text-sm"
//           />
//         </div>
//       </div>

//       <div>
//         <label className="text-xs font-medium text-gray-500 uppercase">Sort by</label>
//         <select
//           value={filters.sort}
//           onChange={(e) => updateFilter('sort', e.target.value)}
//           className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
//         >
//           <option value="newest">Newest first</option>
//           <option value="oldest">Oldest first</option>
//         </select>
//       </div>
//     </div>
//   );
// }

// function FilterSelect({ label, value, onChange, options, capitalize }) {
//   return (
//     <div>
//       <label className="text-xs font-medium text-gray-500 uppercase">{label}</label>
//       <select
//         value={value}
//         onChange={(e) => onChange(e.target.value)}
//         className="mt-1 w-full rounded-lg border border-gray-300 px-2 py-2 text-sm"
//       >
//         <option value="">All</option>
//         {options.map((opt) => (
//           <option key={opt} value={opt} className={capitalize ? 'capitalize' : ''}>
//             {capitalize ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}
//           </option>
//         ))}
//       </select>
//     </div>
//   );
// }

// function ProductCard({ product, onViewSeller }) {
//   const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
//   const hasDiscount = product.salePrice && product.salePrice < product.price;

//   return (
//     <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
//       <div className="relative aspect-square bg-gray-100">
//         {primaryImage ? (
//           <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
//         ) : (
//           <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
//         )}
//         {hasDiscount && (
//           <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
//             SALE
//           </span>
//         )}
//         {product.stockQuantity === 0 && (
//           <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
//             Out of stock
//           </span>
//         )}
//       </div>

//       <div className="p-3 flex flex-col flex-1">
//         <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h4>
//         <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>

//         <div className="mt-1 flex items-baseline gap-2">
//           <span className="text-sm font-bold text-emerald-700">
//             ₦{(hasDiscount ? product.salePrice : product.price)?.toLocaleString()}
//           </span>
//           {hasDiscount && (
//             <span className="text-xs text-gray-400 line-through">₦{product.price?.toLocaleString()}</span>
//           )}
//         </div>

//         <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
//           ⭐ {product.ratings?.toFixed?.(1) ?? product.ratings} · {product.sold} sold
//         </div>

//         <button
//           onClick={onViewSeller}
//           className="mt-auto pt-2 text-xs font-medium text-emerald-600 text-left hover:underline"
//         >
//           {product.seller?.businessProfile?.businessName || product.seller?.username} →
//         </button>
//       </div>
//     </div>
//   );
// }

// function SellerModal({ seller, onClose }) {
//   const bp = seller.businessProfile || {};
//   const sp = seller.sellerProfile || {};
//   const chain = sp.sellerChain || [];

//   return (
//     <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
//       <div className="absolute inset-0 bg-black/50" onClick={onClose} />
//       <div className="relative bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto p-5">
//         <div className="flex justify-between items-start mb-4">
//           <div className="flex items-center gap-3">
//             {seller.profilePicture && (
//               <img src={seller.profilePicture} className="w-12 h-12 rounded-full object-cover" alt="" />
//             )}
//             <div>
//               <h3 className="font-semibold text-gray-900">{bp.businessName || seller.username}</h3>
//               <p className="text-xs text-gray-500">{seller.firstName} {seller.lastName} · {seller.state}{seller.lga ? `, ${seller.lga}` : ''}</p>
//             </div>
//           </div>
//           <button onClick={onClose} className="text-gray-400 text-2xl leading-none">&times;</button>
//         </div>

//         {/* Seller type badges */}
//         {sp.sellerTypes?.length > 0 && (
//           <div className="flex flex-wrap gap-1.5 mb-4">
//             {sp.sellerTypes.map((t) => (
//               <span key={t} className="text-xs capitalize bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
//                 {t}
//               </span>
//             ))}
//             {sp.verifiedSeller && (
//               <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">✓ Verified</span>
//             )}
//           </div>
//         )}

//         {/* Business info */}
//         <div className="grid grid-cols-2 gap-3 text-sm mb-4">
//           <Info label="Shop / Business" value={sp.shopName || bp.businessName} />
//           <Info label="Address" value={bp.businessAddress} />
//           <Info label="Phone" value={seller.phoneNumber} />
//           <Info label="Email" value={seller.email} />
//           <Info label="Market" value={sp.market} />
//           <Info label="Years in business" value={bp.yearsInBusiness} />
//           <Info label="Staff count" value={bp.staffCount} />
//           <Info label="Payment methods" value={sp.acceptedPaymentMethods} />
//         </div>

//         {bp.shopDescription || sp.shopDescription ? (
//           <p className="text-sm text-gray-600 mb-4">{sp.shopDescription || bp.shopDescription}</p>
//         ) : null}

//         {/* Distribution / Seller chain */}
//         <h4 className="font-semibold text-gray-800 mb-2 text-sm">Distribution chain ({chain.length})</h4>
//         {chain.length === 0 ? (
//           <p className="text-sm text-gray-400 mb-2">No distribution chain listed.</p>
//         ) : (
//           <div className="space-y-2">
//             {chain.map((c, idx) => (
//               <div key={idx} className="border border-gray-200 rounded-lg p-3 text-sm">
//                 <div className="flex justify-between items-center">
//                   <span className="font-medium text-gray-800">{c.businessName}</span>
//                   <span className="text-xs capitalize bg-gray-100 px-2 py-0.5 rounded-full text-gray-600">
//                     {c.relationship}
//                   </span>
//                 </div>
//                 <p className="text-xs text-gray-500 mt-1">{c.address}</p>
//                 <p className="text-xs text-gray-500">{c.phoneNumber} {c.email ? `· ${c.email}` : ''}</p>

//                 {c.purchaseHistory?.length > 0 && (
//                   <details className="mt-2">
//                     <summary className="text-xs text-emerald-600 cursor-pointer">
//                       Purchase history ({c.purchaseHistory.length})
//                     </summary>
//                     <div className="mt-2 space-y-1">
//                       {c.purchaseHistory.map((ph, i) => (
//                         <div key={i} className="flex justify-between text-xs text-gray-500 border-t border-gray-100 pt-1">
//                           <span>{ph.productName} × {ph.quantity}{ph.unit ? ` ${ph.unit}` : ''}</span>
//                           <span>{ph.currency} {ph.totalAmount?.toLocaleString()} · {ph.paymentStatus}</span>
//                         </div>
//                       ))}
//                     </div>
//                   </details>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function Info({ label, value }) {
//   if (!value) return null;
//   return (
//     <div>
//       <p className="text-[10px] text-gray-400 uppercase">{label}</p>
//       <p className="text-gray-700">{value}</p>
//     </div>
//   );
// }































import { useState, useEffect, useCallback } from 'react';

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/price-checker`;

function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

export default function PriceCheckers() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({ categories: [], states: [], sellerTypes: [] });
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showMoreFilters, setShowMoreFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    sellerType: '',
    state: '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const debouncedSearch = useDebounce(filters.search);

  useEffect(() => {
    fetch(`${API_BASE}/filters`)
      .then((r) => r.json())
      .then((d) => d.success && setFilterOptions(d));
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    Object.entries({ ...filters, search: debouncedSearch }).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
    params.append('page', page);
    params.append('limit', 12);

    try {
      const res = await fetch(`${API_BASE}?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setTotalPages(data.totalPages);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters, debouncedSearch, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilter = (key, value) => {
    setPage(1);
    setFilters((f) => ({ ...f, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: '', category: '', sellerType: '', state: '', minPrice: '', maxPrice: '', sort: 'newest',
    });
    setPage(1);
  };

  const activeFilterCount = Object.entries(filters).filter(
    ([k, v]) => v && k !== 'sort' && k !== 'search'
  ).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top navbar with search + filters */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        {/* Row 1: search + sort + toggle */}
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search products..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <select
            value={filters.sort}
            onChange={(e) => updateFilter('sort', e.target.value)}
            className="hidden sm:block rounded-full border border-gray-300 px-3 py-2.5 text-sm bg-white"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>

          <button
            onClick={() => setShowMoreFilters((s) => !s)}
            className="relative flex items-center gap-1.5 rounded-full bg-emerald-600 text-white px-4 py-2.5 text-sm font-medium whitespace-nowrap"
          >
            Filters
            {activeFilterCount > 0 && (
              <span className="bg-white text-emerald-700 text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Row 2: filter bar — wraps on small screens, scrolls horizontally on mobile if needed */}
        {showMoreFilters && (
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
              options={filterOptions.sellerTypes}
              capitalize
            />
            <FilterSelect
              placeholder="State"
              value={filters.state}
              onChange={(v) => updateFilter('state', v)}
              options={filterOptions.states}
            />

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-300 rounded-full px-3 py-1.5">
              <span className="text-xs text-gray-400">₦</span>
              <input
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => updateFilter('minPrice', e.target.value)}
                className="w-16 bg-transparent text-sm focus:outline-none"
              />
              <span className="text-gray-300">–</span>
              <input
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => updateFilter('maxPrice', e.target.value)}
                className="w-16 bg-transparent text-sm focus:outline-none"
              />
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
        )}
      </div>

      {/* Product grid */}
      <main className="max-w-7xl mx-auto p-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 rounded-xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No products match your filters.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} onViewSeller={() => setSelectedSeller(p.seller)} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => setPage(i + 1)}
                className={`w-9 h-9 rounded-full text-sm font-medium ${
                  page === i + 1 ? 'bg-emerald-600 text-white' : 'bg-white border border-gray-300 text-gray-700'
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

function FilterSelect({ placeholder, value, onChange, options, capitalize }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-full border px-3 py-1.5 text-sm bg-white ${
        value ? 'border-emerald-500 text-emerald-700 font-medium' : 'border-gray-300 text-gray-600'
      } ${capitalize ? 'capitalize' : ''}`}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {capitalize ? opt.charAt(0).toUpperCase() + opt.slice(1) : opt}
        </option>
      ))}
    </select>
  );
}

function ProductCard({ product, onViewSeller }) {
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
  const hasDiscount = product.salePrice && product.salePrice < product.price;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow flex flex-col">
      <div className="relative aspect-square bg-gray-100">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">No image</div>
        )}
        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
            SALE
          </span>
        )}
        {product.stockQuantity === 0 && (
          <span className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-semibold">
            Out of stock
          </span>
        )}
      </div>

      <div className="p-3 flex flex-col flex-1">
        <h4 className="text-sm font-medium text-gray-800 line-clamp-2">{product.name}</h4>
        <p className="text-xs text-gray-400 mt-0.5">{product.category}</p>

        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-sm font-bold text-emerald-700">
            ₦{(hasDiscount ? product.salePrice : product.price)?.toLocaleString()}
          </span>
          {hasDiscount && (
            <span className="text-xs text-gray-400 line-through">₦{product.price?.toLocaleString()}</span>
          )}
        </div>

        <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
          ⭐ {product.ratings?.toFixed?.(1) ?? product.ratings} · {product.sold} sold
        </div>

        <button
          onClick={onViewSeller}
          className="mt-auto pt-2 text-xs font-medium text-emerald-600 text-left hover:underline"
        >
          {product.seller?.businessProfile?.businessName || product.seller?.username} →
        </button>
      </div>
    </div>
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
              <span key={t} className="text-xs capitalize bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full font-medium">
                {t}
              </span>
            ))}
            {sp.verifiedSeller && (
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">✓ Verified</span>
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
                    <summary className="text-xs text-emerald-600 cursor-pointer">
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