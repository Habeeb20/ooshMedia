/* src/components/TrustBar.tsx */
import { Link } from "react-router-dom";

/* -----------------------------------------------------------------
   Icon imports – using lucide-react. Swap for any other lucide icon
   if you want a closer match (see https://lucide.dev/icons for browsing).
------------------------------------------------------------------ */
import {
  Leaf as HerbalIcon,
  Car as CarPartIcon,
  Smartphone as EPartsIcon,
  Users as BusyBodyIcon,
} from "lucide-react";

/* -----------------------------------------------------------------
   Centralised colour palette – you can move this to a separate file
   (e.g. src/config/appConfig.ts) and import it everywhere.
------------------------------------------------------------------ */
const appConfig = {
  colors: {
    primary: "#0d6efd", // Bootstrap primary – change to whatever you like
    bgLight: "#f8f9fa",
  },
};

/* -----------------------------------------------------------------
   Badge data – each entry contains the icon component, label,
   description and the route it should navigate to.
------------------------------------------------------------------ */
const TRUST_BADGES = [
  {
    icon: HerbalIcon,
    label: "Herbal",
    desc: "Fast & reliable herbal deliveries",
    to: "/herbal",
  },
  {
    icon: CarPartIcon,
    label: "Car Parts",
    desc: "Secure payment for auto parts",
    to: "/carparts",
  },
  {
    icon: EPartsIcon,
    label: "E-Parts",
    desc: "All electronic accessories",
    to: "/eparts",
  },
  {
    icon: BusyBodyIcon,
    label: "Busy Body",
    desc: "Qualified riders at your service",
    to: "/busibody",
  },
];

/* -----------------------------------------------------------------
   The component itself
------------------------------------------------------------------ */
export default function OtherPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 mt-6">
      {/* Outer wrapper – white card with subtle border & rounded corners */}
      <div
        className="bg-white rounded-2xl border border-gray-100
                    grid grid-cols-2 md:grid-cols-4
                    divide-x divide-y md:divide-y-0 divide-gray-100
                    overflow-hidden"
      >
        {TRUST_BADGES.map(({ icon: Icon, label, desc, to }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 px-5 py-4
                       hover:bg-gray-50 transition-colors
                       group"
          >
            {/* Icon container – primary colour with 12% opacity background */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: `${appConfig.colors.primary}12`,
              }}
            >
              <Icon
                size={17}
                strokeWidth={2}
                style={{ color: appConfig.colors.primary }}
              />
            </div>

            {/* Text block */}
            <div className="flex flex-col">
              <p className="text-xs font-bold text-gray-800 leading-tight">
                {label}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}