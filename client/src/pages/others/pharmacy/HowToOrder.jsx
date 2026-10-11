import { Pill, FileText, ClipboardCheck, Bike, Cross, Heart } from "lucide-react";
import appConfig from "../../../config/appConfig";
import { withAlpha } from "./colorUtils";

const steps = [
  {
    icon: Pill,
    title: "Find Your Medicine",
    description: "Search by name or browse pharmacy, health and herbal products",
  },
  {
    icon: FileText,
    title: "Add Your Prescription",
    description: "If it needs a prescription, share your code, and choose the pack size you need",
  },
  {
    icon: ClipboardCheck,
    title: "Place Order",
    description: "Order online by adding your items to the cart and checking out",
  },
  {
    icon: Bike,
    title: "Delivery / Pickup",
    description: "You will receive a confirmation message with the details of your order",
  },
];

// Decorative watermarks: position/size/rotation per card corner
const DECOR = [
  { icon: Cross, top: "8%", right: "44%", size: 30, opacity: 0.1, rotate: -18 },
  { icon: Pill, top: "14%", right: "-2%", size: 52, opacity: 0.12, rotate: 28 },
  { icon: Heart, top: "52%", right: "10%", size: 34, opacity: 0.1, rotate: -8 },
];

export default function HowToOrder() {
  const brand = appConfig.colors.primary;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 sm:mt-30">
      {/* Heading */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">How You Can Order</h2>
        <div className="mx-auto mt-3 w-14 h-[3px] rounded-full" style={{ backgroundColor: brand }} />
        <p className="mt-3 text-sm text-gray-500">Four easy steps from search to your door.</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {steps.map(({ icon: Icon, title, description }, index) => (
          <div
            key={title}
            className="group relative overflow-hidden rounded-[28px] p-6 sm:p-7 min-h-[230px] flex flex-col justify-end transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{ background: `linear-gradient(150deg, ${withAlpha(brand, 0.05)} 0%, ${withAlpha(brand, 0.15)} 100%)` }}
          >
            {/* Step number */}
            <span
              className="absolute left-6 top-4 text-5xl font-black leading-none select-none"
              style={{ color: withAlpha(brand, 0.18) }}
              aria-hidden="true"
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            {/* Watermarks */}
            {DECOR.map(({ icon: Mark, top, right, size, opacity, rotate }, i) => (
              <Mark
                key={i}
                aria-hidden="true"
                className="absolute pointer-events-none select-none"
                style={{ top, right, width: size, height: size, opacity, color: brand, transform: `rotate(${rotate}deg)` }}
              />
            ))}

            {/* Icon badge */}
            <div
              className="relative z-10 w-14 h-14 rounded-full flex items-center justify-center mb-6 bg-white shadow-sm transition-transform duration-300 group-hover:scale-110"
              style={{ border: `1.5px solid ${withAlpha(brand, 0.55)}` }}
            >
              <Icon className="w-6 h-6" style={{ color: brand }} strokeWidth={2.25} />
            </div>

            {/* Text */}
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">{title}</h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}