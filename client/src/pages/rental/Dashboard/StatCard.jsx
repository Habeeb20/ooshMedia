export default function StatCard({ icon, label, value, sublabel, tone = 'default' }) {
  const tones = {
    default: { bg: 'bg-white', iconBg: 'bg-[#F3E4E8]', iconColor: 'text-[#8B1E3F]', value: 'text-[#221B1D]' },
    wine: { bg: 'bg-[#8B1E3F]', iconBg: 'bg-white/15', iconColor: 'text-white', value: 'text-white' },
    gold: { bg: 'bg-white', iconBg: 'bg-[#FBF0DD]', iconColor: 'text-[#B8902E]', value: 'text-[#221B1D]' },
    green: { bg: 'bg-white', iconBg: 'bg-[#E7F4EA]', iconColor: 'text-[#2E7D46]', value: 'text-[#221B1D]' },
    amber: { bg: 'bg-white', iconBg: 'bg-[#FEF3E0]', iconColor: 'text-[#B4780A]', value: 'text-[#221B1D]' },
  };
  const t = tones[tone] || tones.default;
  const isDark = tone === 'wine';

  return (
    <div className={`rounded-2xl border ${isDark ? 'border-transparent' : 'border-[#E7DEE1]'} ${t.bg} p-5 shadow-sm`}>
      <div className="flex items-center justify-between mb-3">
        <p className={`text-sm ${isDark ? 'text-white/80' : 'text-[#6B6067]'}`}>{label}</p>
        {icon && (
          <div className={`h-9 w-9 rounded-xl ${t.iconBg} ${t.iconColor} flex items-center justify-center shrink-0`}>
            {icon}
          </div>
        )}
      </div>
      <p className={`text-2xl font-semibold ${t.value}`}>{value}</p>
      {sublabel && <p className={`mt-1 text-xs ${isDark ? 'text-white/70' : 'text-[#6B6067]'}`}>{sublabel}</p>}
    </div>
  );
}












