export default function EarningsChart({ data }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="rounded-2xl border border-[#E7DEE1] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm font-medium text-[#221B1D]">Earnings, last {data.length} months</p>
        <span className="text-xs text-[#6B6067]">₦ Naira</span>
      </div>
      <div className="flex items-end gap-3 h-40">
        {data.map((d) => (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-2 group">
            <div className="w-full flex items-end justify-center h-32">
              <div
                className="w-full max-w-8 rounded-t-md bg-[#F3E4E8] group-hover:bg-[#8B1E3F] transition-colors relative"
                style={{ height: `${(d.value / max) * 100}%`, minHeight: d.value > 0 ? '4px' : '0px' }}
              >
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[11px] font-medium text-[#221B1D] opacity-0 group-hover:opacity-100 whitespace-nowrap">
                  ₦{d.value.toLocaleString()}
                </span>
              </div>
            </div>
            <span className="text-xs text-[#6B6067]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}