import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, ShoppingBag, Tag, Search, SlidersHorizontal,
  TrendingUp, Flame, X, RefreshCw, Sparkles,
} from 'lucide-react';
import DealCard from '../Deal/DealCard'
import CreateDealModal from '../Deal/CreateDealModal'
import DealDetailModal from "../Deal/DealDetailModal"
import {productCategoryList} from "../../categories/productCategories"

import { dealsAPI } from '../../config/api';

// ─── constants ────────────────────────────────────────────────────────────────

const TABS = [
  { id: 'all',      label: 'All Deals',    icon: Flame },
  { id: 'buy',      label: 'Want to Buy',  icon: ShoppingBag },
  { id: 'sell',     label: 'For Sale',     icon: Tag },
  { id: 'trending', label: 'Trending',     icon: TrendingUp },
];

const SORT_OPTIONS = [
  { value: 'newest',  label: 'Newest First' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating',  label: 'Top Rated' },
];

// ─── skeleton ─────────────────────────────────────────────────────────────────

function SkeletonDealCard() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-40 bg-gray-100" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-gray-100 rounded-full w-3/4" />
        <div className="h-3 bg-gray-100 rounded-full w-1/2" />
        <div className="h-3 bg-gray-100 rounded-full w-full" />
        <div className="flex gap-2 pt-1">
          <div className="h-6 w-16 bg-gray-100 rounded-lg" />
          <div className="h-6 w-12 bg-gray-100 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ─── main component ────────────────────────────────────────────────────────────

export default function EDealsFeed() {
  const [deals, setDeals]               = useState([]);
  const [loading, setLoading]           = useState(true);
  const [tab, setTab]                   = useState('all');
  const [category, setCategory]         = useState('');
  const [sort, setSort]                 = useState('newest');
  const [search, setSearch]             = useState('');
  const [searchInput, setSearchInput]   = useState('');
  const [page, setPage]                 = useState(1);
  const [hasMore, setHasMore]           = useState(true);
  const [showCreate, setShowCreate]     = useState(false);
  const [createType, setCreateType]     = useState('buy');
  const [selectedDeal, setSelectedDeal] = useState(null);
  const [showFilters, setShowFilters]   = useState(false);
  const [stats, setStats]               = useState({ total: 0 });
  const loaderRef = useRef(null);

  // ── fetch ──────────────────────────────────────────────────────────────────

  const fetchDeals = useCallback(async (reset = false) => {
    setLoading(true);
    try {
      const params = {
        page: reset ? 1 : page,
        limit: 12,
        ...(tab !== 'all' && tab !== 'trending' ? { type: tab } : {}),
        ...(category ? { category } : {}),
        ...(search ? { search } : {}),
      };
      const data = await dealsAPI.getAll(params);
      setDeals(prev => reset ? data.deals : [...prev, ...data.deals]);
      console.log('Fetched deals:', data.deals);
      setHasMore(data.page < data.pages);
      if (reset) {
        setPage(2);
        setStats({ total: data.total });
      } else {
        setPage(p => p + 1);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tab, category, search, page]);

  useEffect(() => { fetchDeals(true); }, [tab, category, search]); // eslint-disable-line

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loading) fetchDeals();
    }, { threshold: 0.5 });
    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, fetchDeals]);

  // ── handlers ───────────────────────────────────────────────────────────────

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const handleDealCreated  = (d) => { setDeals(prev => [d, ...prev]); setShowCreate(false); };
  const handleDealUpdated  = (u) => setDeals(prev => prev.map(d => d._id === u._id ? u : d));

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-100">

      {/* ══ Hero banner ══════════════════════════════════════════════════════ */}
      <div className="relative overflow-hidden rounded-2xl mb-4 bg-[#8B1E3F]">
        {/* decorative blobs */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-28 h-28 rounded-full bg-white/5 blur-xl pointer-events-none" />

        <div className="relative px-5 pt-6 pb-5">
          {/* badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold mb-3">
            🔥 Live Marketplace
          </span>

          {/* title */}
          <h1 className="text-3xl font-black text-white tracking-tight leading-none mb-1">
            <span className="text-rose-300">E</span>deals
          </h1>
          <p className="text-white/60 text-sm mb-5">Connect buyers &amp; sellers. Find your deal.</p>

          {/* stats + actions row */}
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
              <span className="text-white font-bold text-lg leading-none">{stats.total.toLocaleString()}</span>
              <span className="text-white/60 text-xs">Active Deals</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => { setCreateType('buy'); setShowCreate(true); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-[#8B1E3F] text-xs font-bold shadow-sm active:scale-95 transition-transform"
              >
                <ShoppingBag size={13} />
                <span>Want to Buy</span>
              </button>
              <button
                onClick={() => { setCreateType('sell'); setShowCreate(true); }}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 text-white border border-white/20 text-xs font-bold active:scale-95 transition-transform"
              >
                <Tag size={13} />
                <span>I'm Selling</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ══ Controls ═════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">

        {/* Tab strip */}
        <div className="flex items-center gap-1 px-3 pt-3 overflow-x-auto no-scrollbar pb-0">
          {TABS.map(t => {
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap
                  transition-all duration-200 mb-2
                  ${active
                    ? 'bg-[#8B1E3F] text-white shadow-sm shadow-rose-900/20'
                    : 'text-gray-500 hover:text-[#8B1E3F] hover:bg-rose-50'
                  }
                `}
              >
                <t.icon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Search + filter row */}
        <div className="flex items-center gap-2 px-3 pb-3">
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2"
          >
            <Search size={14} className="text-gray-400 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-xs text-gray-700 placeholder-gray-400 outline-none min-w-0"
              placeholder="Search deals, products…"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
            {searchInput && (
              <button type="button" onClick={() => { setSearchInput(''); setSearch(''); }}>
                <X size={13} className="text-gray-400" />
              </button>
            )}
          </form>

          <button
            onClick={() => setShowFilters(v => !v)}
            className={`
              flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-shrink-0 transition-all
              ${showFilters || category
                ? 'bg-[#8B1E3F] text-white'
                : 'bg-gray-50 border border-gray-100 text-gray-600 hover:text-[#8B1E3F] hover:bg-rose-50'
              }
            `}
          >
            <SlidersHorizontal size={13} />
            <span className="hidden sm:inline">Filters</span>
            {category && !showFilters && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
            )}
          </button>

          <button
            onClick={() => fetchDeals(true)}
            disabled={loading}
            className="p-2 rounded-xl bg-gray-50 border border-gray-100 text-gray-400 hover:text-[#8B1E3F] hover:bg-rose-50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="border-t border-gray-100 px-3 py-3 space-y-3">
            {/* Category chips */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Category</p>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setCategory('')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                    ${!category ? 'bg-[#8B1E3F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-[#8B1E3F]'}`}
                >All</button>
                {productCategoryList.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                      ${category === cat.id ? 'bg-[#8B1E3F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-[#8B1E3F]'}`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort chips */}
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Sort By</p>
              <div className="flex flex-wrap gap-1.5">
                {SORT_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all
                      ${sort === opt.value ? 'bg-[#8B1E3F] text-white' : 'bg-gray-100 text-gray-600 hover:bg-rose-50 hover:text-[#8B1E3F]'}`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ══ Deal grid ════════════════════════════════════════════════════════ */}
      <div>
        {/* skeleton */}
        {loading && deals.length === 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[...Array(6)].map((_, i) => <SkeletonDealCard key={i} />)}
          </div>
        )}

        {/* empty state */}
        {!loading && deals.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-4">
              <Sparkles size={22} className="text-[#8B1E3F]" />
            </div>
            <p className="text-base font-bold text-gray-800 mb-1">No deals found</p>
            <p className="text-sm text-gray-400 mb-5">Be the first to post a deal in this category!</p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B1E3F] text-white text-sm font-semibold hover:bg-[#7a1835] transition-colors active:scale-95"
            >
              <Plus size={15} /> Post a Deal
            </button>
          </div>
        )}

        {/* grid */}
        {deals.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {deals.map(deal => (
              <DealCard
                key={deal._id}
                deal={deal}
                onClick={() => setSelectedDeal(deal)}
                onUpdated={handleDealUpdated}
              />
            ))}
          </div>
        )}

        {/* infinite scroll sentinel */}
        <div ref={loaderRef} className="h-10 flex items-center justify-center mt-2">
          {loading && deals.length > 0 && (
            <div className="flex items-center gap-1.5">
              {[0, 1, 2].map(i => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-[#8B1E3F] opacity-70 animate-bounce"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ══ FAB (mobile) ═════════════════════════════════════════════════════ */}
      <button
        onClick={() => setShowCreate(true)}
        className="lg:hidden fixed bottom-20 right-5 w-[52px] h-[52px] rounded-full bg-[#8B1E3F] text-white flex items-center justify-center shadow-lg shadow-rose-900/30 active:scale-95 transition-transform z-40"
        aria-label="Post a deal"
      >
        <Plus size={22} />
      </button>

      {/* ══ Modals ═══════════════════════════════════════════════════════════ */}
      {showCreate && (
        <CreateDealModal
          defaultType={createType}
          onClose={() => setShowCreate(false)}
          onCreated={handleDealCreated}
        />
      )}
      {selectedDeal && (
        <DealDetailModal
          dealId={selectedDeal._id}
          onClose={() => setSelectedDeal(null)}
          onUpdated={handleDealUpdated}
        />
      )}
    </div>
  );
}