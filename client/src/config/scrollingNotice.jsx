// components/ScrollingNoticeBanner.jsx
//
// Drop this anywhere: <ScrollingNoticeBanner />
// Continuously scrolls the given text left, loops seamlessly, pauses on hover.

import { useState } from 'react';
import { Info } from 'lucide-react';

export default function ScrollingNoticeBanner({
  text = "Please be informed that money will be remitted into your account directly once your address is verified (only possible after paying the inspection fee on your Seller Profile page) and your business CAC is verified on the Verify page.",
  speed = 22,          // seconds per full loop — lower = faster
  pauseOnHover = true,
  className = '',
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`relative overflow-hidden w-full rounded-xl border border-amber-200 bg-amber-50 py-2 ${className}`}
      onMouseEnter={() => pauseOnHover && setPaused(true)}
      onMouseLeave={() => pauseOnHover && setPaused(false)}
    >
      <div
        className="flex whitespace-nowrap"
        style={{
          animation: `scrolling-notice-banner ${speed}s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}
      >
        {/* Rendered twice back-to-back so the -50% translate loops seamlessly.
            Each copy carries its own padding (not a flex gap) so both copies
            are exactly equal width — that's what keeps the loop jump-free. */}
        {[0, 1].map((i) => (
          <div key={i} className="flex items-center gap-2 px-6 flex-shrink-0">
            <Info size={14} className="text-amber-500 flex-shrink-0" />
            <span className="text-xs font-semibold text-amber-700">{text}</span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scrolling-notice-banner {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}