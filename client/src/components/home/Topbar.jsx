// import appConfig from "../../config/appConfig";
// import { Phone, HelpCircle, Package, ChevronRight } from "lucide-react";

// export default function Topbar() {
//   return (
//     <div className="text-white text-xs" style={{ background: appConfig.colors.primary }}>
//       <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
//         <p className="font-medium tracking-wide truncate">{appConfig.tagline}</p>
//         <div className="hidden md:flex items-center gap-1 divide-x divide-white/20 text-white/90">
//           {[
//             { icon: Package, label: `Sell on ${appConfig.name}` },
//             { icon: HelpCircle, label: "Help Center" },
//             { icon: Phone, label: "Track Order" },
//           ].map(({ icon: Icon, label }) => (
//             <button
//               key={label}
//               className="flex items-center gap-1.5 px-3 py-0.5 hover:text-white transition-colors"
//             >
//               <Icon size={12} />
//               <span>{label}</span>
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }


import { Truck, ShieldCheck, Award, Zap } from "lucide-react";

export default function Topbar() {
  const announcements = [
    "🚚 FREE SHIPPING on orders over ₦50,000",
    "🔒 SECURE PAYMENT | 256-Bit SSL Encryption",
    // "⭐ 30-DAY MONEY BACK GUARANTEE",
    "⚡ FLASH SALE: Up to 50% OFF this weekend",
    "🏆 Trusted by over 25,000+ Happy Customers",
    "📦 Same Day Delivery in Lagos & Abuja",
  ];

  return (
    <div className="bg-gradient-to-r from-rose-600 via-red-900 to-red-800 text-white py-2.5 overflow-hidden">
      <div className="flex items-center whitespace-nowrap">
        {/* First Scrolling Line */}
        <div className="inline-flex animate-marquee gap-10 text-sm font-medium">
          {announcements.map((text, index) => (
            <div key={index} className="flex items-center gap-2">
              {index === 0 && <Truck size={16} />}
              {index === 1 && <ShieldCheck size={16} />}
              {index === 2 && <Award size={16} />}
              {index === 3 && <Zap size={16} />}
              <span>{text}</span>
            </div>
          ))}
        </div>

        {/* Duplicate for seamless loop */}
        <div className="inline-flex animate-marquee gap-10 text-sm font-medium">
          {announcements.map((text, index) => (
            <div key={index} className="flex items-center gap-2">
              {index === 0 && <Truck size={16} />}
              {index === 1 && <ShieldCheck size={16} />}
              {index === 2 && <Award size={16} />}
              {index === 3 && <Zap size={16} />}
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 35s linear infinite;
        }
      `}</style>
    </div>
  );
}