

import { PROPERTY_LISTING_TYPES, PROPERTY_LAND_TYPES, PROPERTY_KIND_OPTIONS, NIGERIAN_STATES } from './CarPropertiesApi';

export const EMPTY_PROPERTY_FILTERS = {
  listingType: '', landType: '', kind: '', state: '', minPrice: '', maxPrice: '', sort: 'newest',
};

export default function PropertyFilterPanel({ filters, onChange, onClear }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-[#1d1922]">Filter listings</h3>
        <button type="button" onClick={() => onClear(EMPTY_PROPERTY_FILTERS)} className="text-[12px] font-semibold text-[#9c1f45] hover:underline">
          Clear all
        </button>
      </div>

      <Field label="Listing type">
        <select className="fp-select" value={filters.listingType} onChange={(e) => set({ listingType: e.target.value })}>
          {PROPERTY_LISTING_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Land type">
        <select className="fp-select" value={filters.landType} onChange={(e) => set({ landType: e.target.value })}>
          {PROPERTY_LAND_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Listing category">
        <select className="fp-select" value={filters.kind} onChange={(e) => set({ kind: e.target.value })}>
          {PROPERTY_KIND_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="State">
        <select className="fp-select" value={filters.state} onChange={(e) => set({ state: e.target.value })}>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s || 'Any state'}</option>)}
        </select>
      </Field>

      <Field label="Price range (₦)">
        <div className="flex gap-2">
          <input className="fp-select" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })} />
          <input className="fp-select" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} />
        </div>
      </Field>

      <Field label="Sort by">
        <select className="fp-select" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          <option value="newest">Newest</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
        </select>
      </Field>

      <style>{`
        .fp-select { width: 100%; border: 1px solid #e0dae6; border-radius: 10px; padding: 8px 10px; font-size: 13px; color: #1d1922; outline: none; }
        .fp-select:focus { border-color: #9c1f45; }
      `}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="space-y-1.5">
      <span className="block text-[11px] font-semibold uppercase tracking-wide text-[#8a8291]">{label}</span>
      {children}
    </div>
  );
}