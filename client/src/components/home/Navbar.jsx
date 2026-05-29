import {
  Search,
  ShoppingCart,
  User,
  Heart,
  Menu,
} from "lucide-react";

import appConfig from "../../config/appConfig";

export default function Navbar() {
  return (
    <div className="bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
        <Menu className="lg:hidden" />

        <h1
          className="text-3xl font-black tracking-tight"
          style={{ color: appConfig.colors.primary }}
        >
          {appConfig.name}
        </h1>

        {/* SEARCH */}
        <div className="hidden md:flex flex-1">
          <div
            className="w-full flex rounded-xl overflow-hidden border-2"
            style={{ borderColor: appConfig.colors.primaryLight }}
          >
            <input
              type="text"
              placeholder="Search products, brands and categories"
              className="flex-1 px-5 py-3 outline-none bg-white"
            />

            <button
              className="px-7 text-white"
              style={{ background: appConfig.colors.primary }}
            >
              <Search />
            </button>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-6">
          <User className="cursor-pointer" />
          <Heart className="cursor-pointer" />
          <ShoppingCart className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
}