// components/CautionBanner.jsx
//
// Static (non-scrolling) caution banner. Drop it anywhere: <CautionBanner />

import { AlertTriangle } from 'lucide-react';

export default function CautionBanner({
  text = "Please be informed that money will be remitted into your account directly once your address is verified (only possible after paying the inspection fee on your Seller Profile page) and your business CAC is verified on the Verify page.",
  className = '',
}) {
  return (
    <div className={`flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200 bg-amber-50 ${className}`}>
      <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs font-semibold text-amber-700 leading-relaxed">{text}</p>
    </div>
  );
}