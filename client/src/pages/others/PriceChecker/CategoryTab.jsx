const CATEGORY_TABS = [
  { value: 'products', label: 'Products' },
  { value: 'cars', label: 'Cars' },
  { value: 'properties', label: 'Properties' },
];

export default function CategoryTabs({ value, onChange, variant = 'light' }) {
  const isDark = variant === 'dark';
  return (
    <div className={`inline-flex items-center gap-1 rounded-full p-1 ${isDark ? 'border border-white/20 bg-white/10' : 'border border-[#e0dae6] bg-white'}`}>
      {CATEGORY_TABS.map((tab) => {
        const active = value === tab.value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors ${
              active ? 'bg-[#9c1f45] text-white' : isDark ? 'text-[#e6cfd9] hover:text-white' : 'text-[#8a8291] hover:text-[#1d1922]'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}