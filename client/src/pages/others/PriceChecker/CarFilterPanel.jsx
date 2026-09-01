
import { CAR_TRANSMISSIONS,CAR_FUEL_TYPES, CAR_BODY_TYPES, CAR_CONDITIONS, CAR_SORT_OPTIONS, NIGERIAN_STATES } from './CarPropertiesApi';
export const EMPTY_CAR_FILTERS = {
  make: '', model: '', year: '', minPrice: '', maxPrice: '',
  transmission: '', fuelType: '', bodyType: '', condition: '', state: '', sort: 'newest',
};

export default function CarFilterPanel({ filters, onChange, onClear, makes = [] }) {
  const set = (patch) => onChange({ ...filters, ...patch });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-[#1d1922]">Filter cars</h3>
        <button type="button" onClick={() => onClear(EMPTY_CAR_FILTERS)} className="text-[12px] font-semibold text-[#9c1f45] hover:underline">
          Clear all
        </button>
      </div>

      <Field label="Make">
        <select className="fp-select" value={filters.make} onChange={(e) => set({ make: e.target.value })}>
          <option value="">Any make</option>
          {makes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Field>

      <Field label="Model">
        <input className="fp-select" type="text" placeholder="e.g. Camry" value={filters.model} onChange={(e) => set({ model: e.target.value })} />
      </Field>

      <Field label="Year">
        <input className="fp-select" type="number" placeholder="e.g. 2020" value={filters.year} onChange={(e) => set({ year: e.target.value })} />
      </Field>

      <Field label="Price range (₦)">
        <div className="flex gap-2">
          <input className="fp-select" type="number" min="0" placeholder="Min" value={filters.minPrice} onChange={(e) => set({ minPrice: e.target.value })} />
          <input className="fp-select" type="number" min="0" placeholder="Max" value={filters.maxPrice} onChange={(e) => set({ maxPrice: e.target.value })} />
        </div>
      </Field>

      <Field label="Transmission">
        <select className="fp-select" value={filters.transmission} onChange={(e) => set({ transmission: e.target.value })}>
          {CAR_TRANSMISSIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Fuel type">
        <select className="fp-select" value={filters.fuelType} onChange={(e) => set({ fuelType: e.target.value })}>
          {CAR_FUEL_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Body type">
        <select className="fp-select" value={filters.bodyType} onChange={(e) => set({ bodyType: e.target.value })}>
          {CAR_BODY_TYPES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="Condition">
        <select className="fp-select" value={filters.condition} onChange={(e) => set({ condition: e.target.value })}>
          {CAR_CONDITIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </Field>

      <Field label="State">
        <select className="fp-select" value={filters.state} onChange={(e) => set({ state: e.target.value })}>
          {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s || 'Any state'}</option>)}
        </select>
      </Field>

      <Field label="Sort by">
        <select className="fp-select" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          {CAR_SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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