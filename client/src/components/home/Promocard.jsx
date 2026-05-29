import appConfig from "../../config/appConfig";

export default function PromoCards() {
  return (
    <div className="flex lg:flex-col gap-4 h-full">
      <div
        className="flex-1 rounded-3xl p-6 text-white"
        style={{ background: appConfig.colors.primary }}
      >
        <h2 className="text-2xl font-black">
          Free Delivery
        </h2>

        <p className="mt-3 text-white/80">
          On orders above ₦50,000
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-sm flex-1">
        <h2
          className="text-2xl font-black"
          style={{ color: appConfig.colors.primary }}
        >
          Flash Sales
        </h2>

        <p className="mt-3 text-gray-500">
          Discover amazing limited offers.
        </p>
      </div>
    </div>
  );
}