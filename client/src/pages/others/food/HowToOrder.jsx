

import { Hand, SlidersHorizontal, ClipboardCheck, Bike } from "lucide-react";
import chicken from "../../../assets/chicken3.png"


const steps = [
  {
    icon: Hand,
    title: "Select Food",
    description: "Pick the type of food you want to order",
  },
  {
    icon: SlidersHorizontal,
    title: "Customization",
    description: "Select additional food of any specific preferences you may have",
  },
  {
    icon: ClipboardCheck,
    title: "Place Order",
    description: "Order online by adding them to your cart",
  },
  {
    icon: Bike,
    title: "Delivery / Pickup",
    description: "You will receive a confirmation message which include details of your order",
  },
];

// Decorative chicken-leg watermarks — position/size/rotation per card corner
const CHICKEN_DECOR = [
  { top: "8%",  right: "44%", size: 34, opacity: 0.26, rotate: -18 },
  { top: "14%", right: "-2%", size: 46, opacity: 0.32, rotate: 8 },
  { top: "52%", right: "10%", size: 40, opacity: 0.38, rotate: -6 },
];

export default function HowToOrder() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-14 sm:mt-30">
      {/* Heading */}
      <div className="text-center mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          How You Can Order
        </h2>
        <div className="mx-auto mt-3 w-14 h-[3px] rounded-full bg-[#C81E2E]" />
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 bg-[F9F3F4]">
        {steps.map(({ icon: Icon, title, description }) => (
          <div
            key={title}
            className="relative overflow-hidden rounded-[28px] p-6 sm:p-7 min-h-[220px] flex flex-col justify-end"
            style={{
              background: "linear-gradient(150deg, #FBF3F1 0%, #F7E9E6 100%)",
            }}
            // style={{
            //   background: "linear-gradient(150deg, #FBF3F1 0%, #F7E9E6 100%)",
            // }}
          >
            {/* Chicken leg watermarks */}
            {CHICKEN_DECOR.map((d, i) => (
              <img
                key={i}
                src={chicken}
                alt=""
                aria-hidden="true"
                className="absolute pointer-events-none select-none"
                style={{
                  top: d.top,
                  right: d.right,
                  width: d.size,
                  height: "auto",
                  opacity: d.opacity,
                  transform: `rotate(${d.rotate}deg)`,
                  filter:
                    "brightness(0) saturate(100%) invert(20%) sepia(80%) saturate(3000%) hue-rotate(330deg)",
                }}
              />
            ))}

            {/* Icon badge */}
            <div className="relative z-10 w-14 h-14 rounded-full bg-[#F4DBDC] border border-rose-900 flex items-center justify-center mb-6">
              <Icon className="w-6 h-6 text-red-900" strokeWidth={2.25} />
            </div>

            {/* Text */}
            <div className="relative z-10">
              <h3 className="text-lg sm:text-xl font-extrabold text-gray-900">
                {title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                {description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}