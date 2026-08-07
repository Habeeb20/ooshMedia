import { Hand, SlidersHorizontal, ClipboardCheck, Bike } from "lucide-react";

const steps = [
  {
    icon: Hand,
    title: "Select Food",
    description: "Browse dishes from sellers near you and pick your favorites.",
  },
  {
    icon: SlidersHorizontal,
    title: "Customization",
    description: "Adjust quantity, extras, or variety to fit your taste.",
  },
  {
    icon: ClipboardCheck,
    title: "Placement",
    description: "Confirm your order and choose how you'd like to pay.",
  },
  {
    icon: Bike,
    title: "Delivery/Pickup",
    description: "Sit back while it's delivered, or pick it up yourself.",
  },
];

export default function HowToOrder() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 sm:mt-20">
      <h2 className="text-center text-xl sm:text-2xl font-extrabold text-gray-900">
        How You Can Order
      </h2>

      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        {steps.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 flex flex-col items-center text-center"
          >
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-red-500" strokeWidth={1.75} />
            </div>
            <h3 className="text-sm sm:text-base font-bold text-gray-900">{title}</h3>
            <p className="mt-1 text-xs sm:text-sm text-gray-500 leading-relaxed">
              {description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}