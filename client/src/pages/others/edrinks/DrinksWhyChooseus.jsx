import { ShieldCheck, Wallet, Truck, Headphones } from "lucide-react";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    description:
      "Every distributor on our platform goes through a strict vetting process to ensure authenticity.",
  },
  {
    icon: Wallet,
    title: "Secure Payments",
    description:
      "Your funds are protected. We only release payment when you confirm delivery of your order.",
  },
  {
    icon: Truck,
    title: "Fast Logistics",
    description:
      "Integrated with top logistics partners to ensure timely and safe delivery of bulk orders.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description:
      "Our dedicated team is always available to help you with orders, disputes, and inquiries.",
  },
];

export default function EdrinksWhyBuySection() {
  return (
    <section className="bg-[#fdf3ef] py-14 sm:py-20">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 text-center">
        <h2 className="text-2xl sm:text-3xl md:text-[2.1rem] font-black tracking-tight text-[#1d1922]">
          Why Buy on eDrinks?
        </h2>
        <p className="mt-3 text-sm sm:text-base text-[#6b6470] max-w-2xl mx-auto leading-relaxed">
          We provide a secure, transparent, and efficient marketplace for all
          your beverage sourcing needs.
        </p>

        <div className="mt-10 sm:mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex flex-col items-center px-2">
              <div className="w-16 h-16 rounded-full bg-[#fbe1e6] flex items-center justify-center">
                <Icon size={26} strokeWidth={2} className="text-[#7a1834]" />
              </div>
              <h3 className="mt-4 text-base sm:text-lg font-semibold text-[#1d1922]">
                {title}
              </h3>
              <p className="mt-2 text-[13px] sm:text-sm text-[#8a8291] leading-relaxed max-w-[240px]">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}