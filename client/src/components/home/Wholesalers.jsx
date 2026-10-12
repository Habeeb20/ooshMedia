import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Factory, Warehouse, Store, Truck, UserCheck, Sprout, Users,
  MapPin, ShieldCheck, BadgeCheck, Star, Eye, Heart, Search, X,
  LayoutGrid, Layers, Tag, ChevronRight, SlidersHorizontal,
} from 'lucide-react';
import { statesAndLgas } from '../../../stateAndLga';

const SELLER_TYPES = [
  { value: 'all', label: 'All', icon: Users },
  { value: 'manufacturer', label: 'Manufacturers', icon: Factory },
  { value: 'wholesaler', label: 'Wholesalers', icon: Warehouse },
  { value: 'distributor', label: 'Distributors', icon: Truck },
  { value: 'retailer', label: 'Retailers', icon: Store },
  { value: 'agent', label: 'Agents', icon: UserCheck },
  { value: 'farmer', label: 'Farmers', icon: Sprout },
];

const STATES = Object.keys(statesAndLgas);

const NO_SCROLLBAR = '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden';
const UNCATEGORISED = 'Other products';

// "Building Materials " and "building materials" should be the same category
const norm = (v) => String(v || '').trim().toLowerCase();
const categoriesOf = (s) => (s.sellerProfile?.productCategories || []).filter((c) => norm(c));

export default function Wholesalers() {
  const { type = 'all' } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Everything except the seller type lives in the query string, e.g.
  // /sellers/type/retailer?state=Lagos&category=Electronics&view=grid&q=ade
  const [searchParams, setSearchParams] = useSearchParams();
  const state = searchParams.get('state') || 'all';
  const category = searchParams.get('category') || 'all';
  const view = searchParams.get('view') === 'grid' ? 'grid' : 'grouped';
  const query = searchParams.get('q') || '';

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false); // mobile only

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${backendUrl}/api/seller/all`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSellers(d.sellers || []);
        else setError(d.message || 'Failed to load sellers');
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError('Something went wrong while loading sellers');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [backendUrl]);

  /* ---------- URL helpers ---------- */
  const setParam = (key, value, emptyValue = 'all') => {
    const next = new URLSearchParams(searchParams);
    if (!value || value === emptyValue) next.delete(key);
    else next.set(key, value);
    setSearchParams(next, { replace: true });
  };

  const goToType = (value) => {
    const qs = searchParams.toString();
    navigate(`/sellers/type/${value}${qs ? `?${qs}` : ''}`);
  };

  const clearAll = () => setSearchParams(new URLSearchParams(), { replace: true });

  /* ---------- Matchers ---------- */
  const matchesType = (s, t) => t === 'all' || s.sellerProfile?.sellerTypes?.includes(t);
  const matchesState = (s, st) => st === 'all' || s.state === st;
  const matchesCategory = (s, c) => c === 'all' || categoriesOf(s).some((x) => norm(x) === norm(c));
  const matchesQuery = (s, q) => {
    if (!q.trim()) return true;
    const hay = [
      s.businessProfile?.businessName,
      s.sellerProfile?.shopName,
      s.username,
      s.state,
      s.lga,
      ...categoriesOf(s),
    ].map(norm).join(' ');
    return hay.includes(norm(q));
  };

  /* ---------- Derived data ---------- */
  // Every product category found across all sellers (label = first spelling seen)
  const categoryList = useMemo(() => {
    const map = new Map();
    sellers.forEach((s) =>
      categoriesOf(s).forEach((c) => {
        const k = norm(c);
        const entry = map.get(k) || { key: k, label: c.trim(), total: 0 };
        entry.total += 1;
        map.set(k, entry);
      })
    );
    return [...map.values()].sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  }, [sellers]);

  // Sellers that pass type + state + search (i.e. everything except category)
  const baseFiltered = useMemo(
    () => sellers.filter((s) => matchesType(s, type) && matchesState(s, state) && matchesQuery(s, query)),
    [sellers, type, state, query]
  );

  const filtered = useMemo(
    () => baseFiltered.filter((s) => matchesCategory(s, category)),
    [baseFiltered, category]
  );

  // Counts always answer: "if I click this, how many sellers will I see?"
  const countForType = (t) =>
    sellers.filter((s) => matchesType(s, t) && matchesState(s, state) && matchesCategory(s, category) && matchesQuery(s, query)).length;
  const countForState = (st) =>
    sellers.filter((s) => matchesType(s, type) && matchesState(s, st) && matchesCategory(s, category) && matchesQuery(s, query)).length;
  const countForCategory = (c) => baseFiltered.filter((s) => matchesCategory(s, c)).length;

  // Sections for the "By category" view
  const groups = useMemo(() => {
    const out = categoryList
      .map((c) => ({ label: c.label, sellers: baseFiltered.filter((s) => matchesCategory(s, c.key)) }))
      .filter((g) => g.sellers.length > 0)
      .sort((a, b) => b.sellers.length - a.sellers.length);
    const uncategorised = baseFiltered.filter((s) => categoriesOf(s).length === 0);
    if (uncategorised.length) out.push({ label: UNCATEGORISED, sellers: uncategorised });
    return out;
  }, [categoryList, baseFiltered]);

  const activeMeta = SELLER_TYPES.find((t) => t.value === type) || SELLER_TYPES[0];
  const activeCategoryLabel = categoryList.find((c) => c.key === norm(category))?.label || category;
  const hasFilters = state !== 'all' || category !== 'all' || query.trim() !== '';
  const showGrouped = view === 'grouped' && category === 'all';
  const openSeller = (id) => navigate(`/sellerstypepage/${id}`);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* ================= Header ================= */}
      <header className="bg-rose-900 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 pb-24 sm:pt-12 sm:pb-28">
          <div className="flex items-center gap-3">
            <span className="grid place-items-center w-11 h-11 rounded-xl bg-white/15">
              <activeMeta.icon className="w-6 h-6" />
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight truncate">{activeMeta.label}</h1>
              <p className="text-rose-100/90 text-sm mt-0.5 flex flex-wrap items-center gap-x-2">
                <span>
                  {loading ? 'Loading sellers…' : `${filtered.length} ${filtered.length === 1 ? 'seller' : 'sellers'}`}
                </span>
                {state !== 'all' && (
                  <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{state}</span>
                )}
                {category !== 'all' && (
                  <span className="inline-flex items-center gap-1"><Tag className="w-3.5 h-3.5" />{activeCategoryLabel}</span>
                )}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setParam('q', e.target.value, '')}
              placeholder="Search by shop, product category or location"
              className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white text-gray-900 placeholder-gray-400 text-sm sm:text-base shadow-lg shadow-rose-950/20 focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
          </div>
        </div>
      </header>

      {/* ================= Filter panel (overlaps header) ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-16">
        <div className="bg-white rounded-3xl shadow-lg shadow-gray-900/5 border border-gray-100 p-4 sm:p-5 space-y-4">
          {/* Seller type */}
          <div className={`flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 ${NO_SCROLLBAR}`}>
            {SELLER_TYPES.map(({ value, label, icon: Icon }) => {
              const active = type === value;
              return (
                <button
                  key={value}
                  onClick={() => goToType(value)}
                  aria-pressed={active}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
                    active
                      ? 'bg-rose-900 text-white'
                      : 'bg-gray-50 text-gray-700 border border-gray-200 hover:border-rose-300 hover:text-rose-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${active ? 'bg-white/20' : 'bg-gray-200/70 text-gray-500'}`}>
                    {countForType(value)}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mobile toggle for the secondary filters */}
          <button
            onClick={() => setShowFilters((v) => !v)}
            className="sm:hidden w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm font-medium text-gray-700"
          >
            <span className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4" /> Product categories & location
            </span>
            {hasFilters && <span className="w-2 h-2 rounded-full bg-rose-700" />}
          </button>

          <div className={`${showFilters ? 'block' : 'hidden'} sm:block space-y-4`}>
            {/* Product categories */}
            <div>
              <p className="text-sm font-medium text-gray-900 mb-2">What they sell</p>
              <div className={`flex gap-2 overflow-x-auto -mx-1 px-1 pb-1 ${NO_SCROLLBAR}`}>
                <CategoryChip active={category === 'all'} onClick={() => setParam('category', 'all')} label="All products" count={baseFiltered.length} />
                {categoryList.map((c) => {
                  const count = countForCategory(c.key);
                  const active = norm(category) === c.key;
                  if (count === 0 && !active) return null;
                  return (
                    <CategoryChip key={c.key} active={active} onClick={() => setParam('category', c.label)} label={c.label} count={count} />
                  );
                })}
              </div>
            </div>

            {/* State + view + clear */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative flex-1 sm:max-w-xs">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                <select
                  value={state}
                  onChange={(e) => setParam('state', e.target.value)}
                  className="w-full h-11 pl-10 pr-8 rounded-xl border border-gray-200 bg-white text-sm text-gray-800 appearance-none focus:outline-none focus:ring-2 focus:ring-rose-300"
                  aria-label="Filter by state"
                >
                  <option value="all">All states ({countForState('all')})</option>
                  {STATES.map((st) => {
                    const n = countForState(st);
                    if (n === 0 && st !== state) return null;
                    return <option key={st} value={st}>{st} ({n})</option>;
                  })}
                </select>
                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 rotate-90 pointer-events-none" />
              </div>

              <div className="flex items-center gap-2 sm:ml-auto">
                {category === 'all' && (
                  <div className="inline-flex p-1 rounded-xl bg-gray-100" role="group" aria-label="Layout">
                    <ViewButton active={showGrouped} onClick={() => setParam('view', 'grouped', 'grouped')} icon={Layers} label="By category" />
                    <ViewButton active={!showGrouped} onClick={() => setParam('view', 'grid')} icon={LayoutGrid} label="All sellers" />
                  </div>
                )}
                {hasFilters && (
                  <button
                    onClick={clearAll}
                    className="inline-flex items-center gap-1.5 h-10 px-3 rounded-xl text-sm font-medium text-rose-900 hover:bg-rose-50"
                  >
                    <X className="w-4 h-4" /> Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= Results ================= */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {error && <div className="bg-red-50 text-red-900 p-4 rounded-2xl mb-8 text-center">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-60 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState type={type} activeMeta={activeMeta} state={state} category={category !== 'all' ? activeCategoryLabel : ''} onClear={hasFilters ? clearAll : null} />
        ) : showGrouped ? (
          <div className="space-y-10">
            {groups.map((g) => (
              <section key={g.label} aria-labelledby={`cat-${norm(g.label)}`}>
                <div className="flex items-end justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <h2 id={`cat-${norm(g.label)}`} className="text-lg sm:text-xl font-semibold text-gray-900 truncate">{g.label}</h2>
                    <p className="text-sm text-gray-500">{g.sellers.length} {g.sellers.length === 1 ? 'seller' : 'sellers'}</p>
                  </div>
                  {g.label !== UNCATEGORISED && (
                    <button
                      onClick={() => setParam('category', g.label)}
                      className="shrink-0 inline-flex items-center gap-1 text-sm font-medium text-rose-900 hover:underline"
                    >
                      See all <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Swipeable row on mobile, wrapping grid from md up */}
                <div className={`flex md:grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto md:overflow-visible snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 md:mx-0 md:px-0 pb-2 ${NO_SCROLLBAR}`}>
                  {g.sellers.slice(0, 6).map((seller) => (
                    <SellerCard
                      key={seller._id}
                      seller={seller}
                      highlight={g.label}
                      onClick={() => openSeller(seller._id)}
                      className="w-[82%] sm:w-[60%] md:w-auto shrink-0 md:shrink snap-start"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((seller) => (
              <SellerCard
                key={seller._id}
                seller={seller}
                highlight={category !== 'all' ? category : ''}
                onClick={() => openSeller(seller._id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ====================== Small pieces ====================== */

function CategoryChip({ active, onClick, label, count }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${
        active
          ? 'bg-rose-50 text-rose-900 ring-1 ring-rose-900/40 font-medium'
          : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300 hover:text-rose-900'
      }`}
    >
      {label}
      <span className={`text-[11px] font-semibold ${active ? 'text-rose-900/70' : 'text-gray-400'}`}>{count}</span>
    </button>
  );
}

function ViewButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
        active ? 'bg-white text-rose-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function EmptyState({ type, activeMeta, state, category, onClear }) {
  const parts = [
    type === 'all' ? 'sellers' : activeMeta.label.toLowerCase(),
    category && `selling ${category}`,
    state !== 'all' && `in ${state}`,
  ].filter(Boolean);
  return (
    <div className="text-center py-16 sm:py-20">
      <div className="mx-auto mb-4 grid place-items-center w-14 h-14 rounded-2xl bg-rose-50 text-rose-900">
        <Search className="w-6 h-6" />
      </div>
      <p className="text-gray-900 font-medium">No {parts.join(' ')} found</p>
      <p className="text-sm text-gray-500 mt-1">Try a different category or location.</p>
      {onClear && (
        <button onClick={onClear} className="mt-5 px-5 py-2.5 rounded-xl bg-rose-900 text-white text-sm font-medium hover:bg-rose-800">
          Clear filters
        </button>
      )}
    </div>
  );
}

function SellerCard({ seller, onClick, highlight = '', className = '' }) {
  const bp = seller.businessProfile || {};
  const sp = seller.sellerProfile || {};
  const name = bp.businessName || sp.shopName || seller.username || 'Seller';
  const categories = categoriesOf(seller);
  const shownCategories = categories.slice(0, 3);
  const extra = categories.length - shownCategories.length;
  const [imgFailed, setImgFailed] = useState(false);

  const rating = bp.reviews?.length
    ? (bp.reviews.reduce((sum, r) => sum + r.rating, 0) / bp.reviews.length).toFixed(1)
    : null;

  const verified = bp.verified || sp.verifiedSeller;
  const description = bp.shopDescription || sp.shopDescription;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onClick())}
      className={`group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all p-5 cursor-pointer flex flex-col focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 ${className}`}
    >
      {/* Identity */}
      <div className="flex items-center gap-3 mb-4">
        {seller.profilePicture && !imgFailed ? (
          <img
            src={seller.profilePicture}
            alt=""
            loading="lazy"
            onError={() => setImgFailed(true)}
            className="w-14 h-14 rounded-2xl object-cover border border-gray-100 shrink-0"
          />
        ) : (
          <span className="grid place-items-center w-14 h-14 rounded-2xl bg-rose-100 text-rose-900 text-lg font-semibold shrink-0">
            {name.slice(0, 2).toUpperCase()}
          </span>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 truncate group-hover:text-rose-900 transition-colors">{name}</h3>
            {verified && <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" aria-label="Verified seller" />}
            {sp.isSuperVerify && <BadgeCheck className="w-4 h-4 text-amber-500 shrink-0" aria-label="Super verified" />}
          </div>
          {(seller.state || seller.lga) && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{[seller.lga, seller.state].filter(Boolean).join(', ')}</span>
            </p>
          )}
        </div>
      </div>

      {/* Seller types */}
      {sp.sellerTypes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sp.sellerTypes.map((t) => (
            <span key={t} className="text-[11px] font-medium capitalize bg-rose-50 text-rose-900 px-2.5 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {description && <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>}

      {/* Product categories */}
      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4">
          <Tag className="w-3.5 h-3.5 text-gray-400" />
          {shownCategories.map((c) => {
            const isMatch = highlight && norm(c) === norm(highlight);
            return (
              <span
                key={c}
                className={`text-[11px] px-2 py-0.5 rounded-md border ${
                  isMatch ? 'bg-rose-900 text-white border-rose-900' : 'bg-gray-50 text-gray-600 border-gray-200'
                }`}
              >
                {c}
              </span>
            );
          })}
          {extra > 0 && <span className="text-[11px] text-gray-400">+{extra} more</span>}
        </div>
      )}

      {/* Stats */}
      <div className="mt-auto flex items-center justify-between gap-2 text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {bp.views || 0}</span>
        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" /> {bp.likes || 0}</span>
        <span className="flex items-center gap-1">
          <Star className={`w-3.5 h-3.5 ${rating ? 'text-amber-400 fill-amber-400' : ''}`} />
          {rating || '—'}
        </span>
        {bp.yearsInBusiness ? <span className="whitespace-nowrap">{bp.yearsInBusiness}y in business</span> : null}
      </div>
    </div>
  );
}