import { CATEGORIES, SELLER_TYPES, SORT_OPTIONS } from './pricecheckerApi';

const EMPTY_FILTERS = {
  sellerType: '',
  state: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  sort: 'newest',
};

export default function FiltersPanel({ filters, onChange, onClear }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });

  return (
    <div className="flex flex-col gap-7">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-lg font-bold text-[#1d1922]">Filters</h2>
        <button
          type="button"
          onClick={() => onClear?.(EMPTY_FILTERS)}
          className="text-[13px] font-semibold text-[#9c1f45] hover:text-[#7a1834]"
        >
          Clear all
        </button>
      </div>

      <fieldset>
        <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#8a8291]">
          Business Type
        </legend>
        <div className="flex flex-col gap-2.5">
          {SELLER_TYPES.filter((t) => t.value).map((t) => (
            <label key={t.value} className="flex cursor-pointer items-center gap-2.5 text-[14px] text-[#413a49]">
              <input
                type="checkbox"
                checked={filters.sellerType === t.value}
                onChange={() => onChange({ ...filters, sellerType: filters.sellerType === t.value ? '' : t.value })}
                className="h-4 w-4 rounded border-[#cfc7d6] text-[#9c1f45] focus:ring-[#9c1f45]"
              />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-[#8a8291]">
          Location
        </label>
        <div className="relative">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#a79fb0]">
            <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21z" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="12" cy="9.5" r="2.2" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          <input
            type="text"
            value={filters.state}
            onChange={set('state')}
            placeholder="Enter zip or city"
            className="w-full rounded-lg border border-[#e0dae6] bg-white py-2.5 pl-9 pr-3 text-[14px] text-[#1d1922] outline-none placeholder:text-[#a79fb0] focus:border-[#9c1f45] focus:ring-1 focus:ring-[#9c1f45]"
          />
        </div>
      </div>

      <div>
        <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-[#8a8291]">
          Category
        </label>
        <select
          value={filters.category}
          onChange={set('category')}
          className="w-full rounded-lg border border-[#e0dae6] bg-white px-3 py-2.5 text-[14px] text-[#1d1922] outline-none focus:border-[#9c1f45] focus:ring-1 focus:ring-[#9c1f45]"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-3 block text-[13px] font-semibold uppercase tracking-wide text-[#8a8291]">
          Price Range (₦)
        </label>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            value={filters.minPrice}
            onChange={set('minPrice')}
            placeholder="Min"
            className="w-full rounded-lg border border-[#e0dae6] bg-white px-3 py-2.5 text-[14px] text-[#1d1922] outline-none placeholder:text-[#a79fb0] focus:border-[#9c1f45] focus:ring-1 focus:ring-[#9c1f45]"
          />
          <span className="text-[#a79fb0]">–</span>
          <input
            type="number"
            min="0"
            value={filters.maxPrice}
            onChange={set('maxPrice')}
            placeholder="Max"
            className="w-full rounded-lg border border-[#e0dae6] bg-white px-3 py-2.5 text-[14px] text-[#1d1922] outline-none placeholder:text-[#a79fb0] focus:border-[#9c1f45] focus:ring-1 focus:ring-[#9c1f45]"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-[#8a8291]">
          Sort By
        </legend>
        <div className="flex flex-col gap-2.5">
          {SORT_OPTIONS.map((s) => (
            <label key={s.value} className="flex cursor-pointer items-center gap-2.5 text-[14px] text-[#413a49]">
              <input
                type="radio"
                name="sort"
                checked={filters.sort === s.value}
                onChange={() => onChange({ ...filters, sort: s.value })}
                className="h-4 w-4 border-[#cfc7d6] text-[#9c1f45] focus:ring-[#9c1f45]"
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

export { EMPTY_FILTERS };