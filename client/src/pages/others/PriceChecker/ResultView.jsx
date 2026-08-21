import { useEffect, useState } from 'react';
import FiltersPanel, {EMPTY_FILTERS} from './FilterPanel';
import ProductCard from './PriceCheckerProductCard';
import ProductDetailsModal from './PricecheckerProductdetailsModal';
import { fetchProducts, effectivePrice } from './pricecheckerApi';


export default function ResultsView({ initialFilters, onLogoClick }) {
  const [search, setSearch] = useState(initialFilters.search || '');
  const [filters, setFilters] = useState({
    sellerType: initialFilters.sellerType || '',
    state: initialFilters.state || '',
    category: initialFilters.category || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    sort: initialFilters.sort || 'newest',
  });
  const [page, setPage] = useState(1);
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [errorMsg, setErrorMsg] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchProducts({ search, ...filters, page, limit: 20 })
      .then((data) => {
        if (cancelled) return;
        setResult(data);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setErrorMsg(err.message || 'Something went wrong');
        setStatus('error');
      });
    return () => { cancelled = true; };
  }, [search, filters, page]);

  const submitSearch = (e) => {
    e.preventDefault();
    setPage(1);
  };

  const products = result?.products || [];
  const bestPrice = products.length
    ? Math.min(...products.filter((p) => p.status !== 'out_of_stock' && p.stockQuantity !== 0).map(effectivePrice))
    : null;

  return (
    <div className="min-h-screen bg-[#f6f4f9]">
      {/* <Navbar onLogoClick={onLogoClick} /> */}

      <div className="border-b border-[#ece7f0] bg-white">
        <div className="mx-auto max-w-7xl px-5 py-8 text-center sm:px-8">
          <h1 className="font-serif text-2xl font-bold text-[#1d1922] sm:text-3xl">
            Compare Prices Across Multiple Stores
          </h1>
          <p className="mt-1.5 text-[13px] text-[#8a8291] sm:text-sm">
            Fast, simple, and reliable analytical pricing for savvy consumers.
          </p>

          <form onSubmit={submitSearch} className="mx-auto mt-6 flex max-w-xl items-center gap-2 rounded-full border border-[#e0dae6] bg-white p-1.5 pl-5 shadow-sm">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#a79fb0]">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="text"
              placeholder="Search for a product..."
              className="min-w-0 flex-1 bg-transparent py-2 text-[14px] text-[#1d1922] outline-none placeholder:text-[#a79fb0]"
            />
            <button type="submit" className="shrink-0 rounded-full bg-[#9c1f45] px-5 py-2.5 text-[13px] font-semibold text-white hover:bg-[#7a1834]">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl gap-8 px-5 py-8 sm:px-8">
        {/* desktop sidebar */}
        <aside className="hidden w-[260px] shrink-0 lg:block">
          <div className="sticky top-6 rounded-2xl border border-[#ece7f0] bg-white p-6">
            <FiltersPanel filters={filters} onChange={(f) => { setFilters(f); setPage(1); }} onClear={(f) => { setFilters(f); setPage(1); }} />
          </div>
        </aside>

        {/* main column */}
        <div className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-serif text-lg font-bold text-[#1d1922]">Comparison Results</h2>
            <div className="flex items-center gap-3">
              {search && (
                <span className="hidden text-[13px] text-[#8a8291] sm:inline">
                  Showing results for "{search}"
                </span>
              )}
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(true)}
                className="flex items-center gap-1.5 rounded-lg border border-[#e0dae6] bg-white px-3 py-1.5 text-[13px] font-semibold text-[#1d1922] lg:hidden"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M4 6h16M7 12h10M10 18h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Filters
              </button>
            </div>
          </div>

          {status === 'loading' && <SkeletonGrid />}

          {status === 'error' && (
            <div className="rounded-2xl border border-[#f2d5df] bg-[#fdf1f5] p-8 text-center">
              <p className="font-semibold text-[#7a1834]">Couldn't load results</p>
              <p className="mt-1 text-sm text-[#8a8291]">{errorMsg}</p>
            </div>
          )}

          {status === 'ready' && products.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[#e0dae6] bg-white p-14 text-center">
              <p className="font-serif text-lg font-semibold text-[#1d1922]">No matches yet</p>
              <p className="mt-1 text-sm text-[#8a8291]">Try a different search term, or widen your filters.</p>
            </div>
          )}

          {status === 'ready' && products.length > 0 && (
            <>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard
                    key={p._id}
                    product={p}
                    isBestPrice={bestPrice !== null && effectivePrice(p) === bestPrice && p.status !== 'out_of_stock'}
                    onViewDetails={setActiveProduct}
                  />
                ))}
              </div>

              {result.totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2">
                  <PageButton disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</PageButton>
                  <span className="px-3 text-[13px] text-[#8a8291]">
                    Page {result.page} of {result.totalPages}
                  </span>
                  <PageButton disabled={page >= result.totalPages} onClick={() => setPage((p) => p + 1)}>Next</PageButton>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* mobile filter drawer */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm overflow-y-auto bg-white p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mb-4 flex items-center gap-1 text-[13px] font-semibold text-[#8a8291]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
              Close
            </button>
            <FiltersPanel
              filters={filters}
              onChange={(f) => { setFilters(f); setPage(1); }}
              onClear={(f) => { setFilters(f); setPage(1); }}
            />
            <button
              type="button"
              onClick={() => setMobileFiltersOpen(false)}
              className="mt-7 w-full rounded-full bg-[#9c1f45] py-3 text-sm font-semibold text-white"
            >
              Show results
            </button>
          </div>
        </div>
      )}

      <ProductDetailsModal product={activeProduct} onClose={() => setActiveProduct(null)} />
    </div>
  );
}

function PageButton({ children, disabled, onClick }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="rounded-lg border border-[#e0dae6] bg-white px-4 py-2 text-[13px] font-semibold text-[#1d1922] disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="animate-pulse overflow-hidden rounded-2xl border border-[#ece7f0] bg-white">
          <div className="aspect-[4/3] w-full bg-[#f0ecf3]" />
          <div className="space-y-2.5 p-4">
            <div className="h-3.5 w-4/5 rounded bg-[#f0ecf3]" />
            <div className="h-3 w-2/5 rounded bg-[#f0ecf3]" />
            <div className="h-5 w-1/3 rounded bg-[#f0ecf3]" />
          </div>
        </div>
      ))}
    </div>
  );
}