import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const NG_STATES = [
  'Lagos', 'Kano', 'Kaduna', 'Rivers', 'Oyo', 'Ogun', 'Enugu', 'Delta',
  'Anambra', 'Abuja (FCT)', 'Edo', 'Plateau', 'Cross River', 'Imo', 'Kwara',
];

const BUSINESS_TYPES = ['All Types', 'Manufacturer', 'Farmer'];
const PAGE_SIZE = 3;

export default function ExploreProducers() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState('');
  const [businessType, setBusinessType] = useState('All Types');
  const [state, setState] = useState('All States');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchSellers() {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/all`, {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        const all = Array.isArray(data) ? data : data.users || [];

        // Only sellers whose sellerTypes include manufacturer or farmer
        const producers = all.filter(
          (u) =>
            u.isSeller &&
            u.sellerProfile?.sellerTypes?.some((t) => t === 'manufacturer' || t === 'farmer')
        );

        setSellers(producers);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchSellers();
    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    return sellers.filter((s) => {
      const name = s.sellerProfile?.shopName || s.businessProfile?.businessName || `${s.firstName} ${s.lastName}`;
      if (search && !name.toLowerCase().includes(search.toLowerCase())) return false;

      if (businessType !== 'All Types') {
        const wanted = businessType.toLowerCase();
        if (!s.sellerProfile?.sellerTypes?.includes(wanted)) return false;
      }

      if (state !== 'All States' && s.state !== state) return false;

      return true;
    });
  }, [sellers, search, businessType, state]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const typeLabel = (types = []) => {
    if (types.includes('manufacturer')) return 'Verified Manufacturer';
    if (types.includes('farmer')) return 'Verified Farmer';
    return 'Verified Producer';
  };

  return (
    <div className="bg-[#FDF6F2] min-h-screen px-6 py-8 md:px-12">
      <nav className="text-xs text-[#8A8A85] mb-4">
        <Link to="/" className="hover:text-[#D2601A]">Home</Link>
        <span className="mx-1.5">›</span>
        <span>B2B Sourcing</span>
        <span className="mx-1.5">›</span>
        <span className="text-[#1A1A1A]">Explore Producers</span>
      </nav>

      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Explore Producers</h1>
      <p className="text-sm text-[#6B6B67] mb-6 max-w-xl">
        Discover verified manufacturers, producers, and exporters across Nigeria.
        Partner with industry leaders to scale your logistics operations.
      </p>

      <div className="bg-white rounded-xl border border-[#EFE6DE] p-4 flex flex-col md:flex-row gap-3 mb-8">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name or product..."
            className="w-full rounded-lg border border-[#EADDD3] pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
          />
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B0A8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={businessType}
          onChange={(e) => { setBusinessType(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#EADDD3] px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
        >
          {BUSINESS_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select
          value={state}
          onChange={(e) => { setState(e.target.value); setPage(1); }}
          className="rounded-lg border border-[#EADDD3] px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#D2601A]"
        >
          <option>All States</option>
          {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <button className="rounded-lg border border-[#EADDD3] px-4 py-2.5 text-sm font-medium text-[#1A1A1A] flex items-center gap-2 hover:border-[#D2601A]">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M6 8h12M9 12h6M11 16h2" />
          </svg>
          More Filters
        </button>
      </div>

      {loading && <p className="text-sm text-[#8A8A85]">Loading producers…</p>}
      {error && <p className="text-sm text-red-600">Couldn't load producers: {error}</p>}
      {!loading && !error && paged.length === 0 && (
        <p className="text-sm text-[#8A8A85]">No producers match these filters.</p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {paged.map((s) => {
          const name = s.sellerProfile?.shopName || s.businessProfile?.businessName || `${s.firstName} ${s.lastName}`;
          const tags = s.sellerProfile?.productCategories?.slice(0, 3) || [];

          return (
            <div key={s._id} className="bg-white rounded-xl border border-[#EFE6DE] p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-9 w-9 rounded-full bg-[#F1E9E2] flex items-center justify-center overflow-hidden shrink-0">
                  {s.profilePicture
                    ? <img src={s.profilePicture} alt={name} className="h-full w-full object-cover" />
                    : <span className="text-xs font-semibold text-[#D2601A]">{name.charAt(0)}</span>}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A] text-sm flex items-center gap-1">
                    {name}
                    <svg className="h-3.5 w-3.5 text-[#D2601A]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.7-9.3a1 1 0 00-1.4-1.4L9 10.6 7.7 9.3a1 1 0 00-1.4 1.4l2 2a1 1 0 001.4 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </p>
                  <p className="text-[11px] text-[#8A8A85]">{typeLabel(s.sellerProfile?.sellerTypes)}</p>
                </div>
              </div>

              <p className="text-[11px] text-[#8A8A85] flex items-center gap-1 mb-3">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {s.state}{s.lga ? `, ${s.lga}` : ', Nigeria'}
              </p>

              <p className="text-xs text-[#4A4A46] mb-3 line-clamp-2">
                {s.businessProfile?.businessAddress
                  ? s.businessProfile.businessAddress
                  : s.sellerProfile?.shopDescription || ''}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#FBEAE3] text-[#D2601A] text-[10px] font-medium px-2.5 py-1">
                    {tag}
                  </span>
                ))}
              </div>

              <Link
                to={`/seller/${s._id}`}
                className="block text-center rounded-lg border border-[#EADDD3] py-2 text-xs font-semibold text-[#1A1A1A] hover:border-[#D2601A] hover:text-[#D2601A] transition-colors"
              >
                View Profile
              </Link>
            </div>
          );
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 w-8 rounded-md border border-[#EADDD3] flex items-center justify-center text-[#8A8A85] disabled:opacity-40"
          >
            ‹
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`h-8 w-8 rounded-md text-xs font-medium flex items-center justify-center ${
                n === page ? 'bg-[#D2601A] text-white' : 'border border-[#EADDD3] text-[#4A4A46]'
              }`}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-8 w-8 rounded-md border border-[#EADDD3] flex items-center justify-center text-[#8A8A85] disabled:opacity-40"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}