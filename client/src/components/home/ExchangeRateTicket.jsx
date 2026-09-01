import { useState, useEffect } from 'react';

const API_URL = 'https://open.er-api.com/v6/latest/NGN';

// Curated list — code, display label, flag emoji. Add/remove as needed.
const CURRENCIES = [
  { code: 'USD', label: 'US Dollar', flag: '🇺🇸' },
  { code: 'GBP', label: 'British Pound', flag: '🇬🇧' },
  { code: 'EUR', label: 'Euro', flag: '🇪🇺' },
  { code: 'CAD', label: 'Canadian Dollar', flag: '🇨🇦' },
  { code: 'AUD', label: 'Australian Dollar', flag: '🇦🇺' },
  { code: 'GHS', label: 'Ghanaian Cedi', flag: '🇬🇭' },
  { code: 'ZAR', label: 'South African Rand', flag: '🇿🇦' },
  { code: 'KES', label: 'Kenyan Shilling', flag: '🇰🇪' },
  { code: 'CNY', label: 'Chinese Yuan', flag: '🇨🇳' },
  { code: 'AED', label: 'UAE Dirham', flag: '🇦🇪' },
  { code: 'INR', label: 'Indian Rupee', flag: '🇮🇳' },
  { code: 'JPY', label: 'Japanese Yen', flag: '🇯🇵' },
];

export default function ExchangeRateTicker() {
  const [rates, setRates] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();
        if (data.result === 'success') {
          setRates(data.rates);
          setLastUpdated(data.time_last_update_utc);
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates', err);
      }
    };

    fetchRates();
    // API updates roughly once a day — re-fetch hourly is plenty
    const interval = setInterval(fetchRates, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (!rates) return null; // don't show a broken/empty banner while loading or on failure

  // 1 NGN = rates[code] units of that currency, so ₦1 in USD is tiny.
  // Flip it: how many NGN for 1 unit of foreign currency.
  const items = CURRENCIES.map(({ code, label, flag }) => {
    const rate = rates[code];
    if (!rate) return null;
    const ngnPerUnit = 1 / rate;
    return { code, label, flag, ngnPerUnit };
  }).filter(Boolean);

  // Duplicate the list so the CSS animation can loop seamlessly (scroll
  // exactly -50% then snap back to 0, which lands on an identical frame).
  const loopItems = [...items, ...items];

  return (
   <div className="fixed mb-10 left-0 right-0 z-[60] w-full overflow-hidden bg-[#0B1B3E] text-white text-xs sm:text-sm py-1.5 group">
      <div className="flex animate-ticker-scroll group-hover:[animation-play-state:paused] whitespace-nowrap">
        {loopItems.map((item, i) => (
          <div key={`${item.code}-${i}`} className="flex items-center gap-1.5 px-4 sm:px-6 shrink-0">
            <span>{item.flag}</span>
            <span className="font-semibold">{item.code}</span>
            <span className="text-white/70">1 {item.code} =</span>
            <span className="font-bold">
              ₦{item.ngnPerUnit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-ticker-scroll {
          animation: ticker-scroll 35s linear infinite;
        }
      `}</style>
    </div>
  );
}