
import appConfig from "../../config/appConfig";
export default function Topbar() {
  return (
    <div
      className="text-white text-sm"
      style={{ background: appConfig.colors.primary }}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex justify-between">
        <p>{appConfig.tagline}</p>

        <div className="hidden md:flex gap-6">
          <span>Sell on {appConfig.name}</span>
          <span>Help Center</span>
          <span>Track Order</span>
        </div>
      </div>
    </div>
  );
}