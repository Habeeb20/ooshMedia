import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

import appConfig from "../../../config/appConfig";

export default function SiteFooter() {
  return (
    <footer className="mt-20 sm:mt-28 bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
        <div className="col-span-2 md:col-span-1">
          <h3 className="text-white font-black text-lg">{appConfig.appName || "Foodie"}</h3>
          <p className="mt-2 text-xs text-gray-400 leading-relaxed max-w-[220px]">
            Fresh meals from verified local sellers, delivered fast or ready
            for pickup.
          </p>
          <div className="flex gap-3 mt-4">
            <Facebook className="w-4 h-4 hover:text-white cursor-pointer" />
            <Instagram className="w-4 h-4 hover:text-white cursor-pointer" />
            <Twitter className="w-4 h-4 hover:text-white cursor-pointer" />
          </div>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold mb-3">Contact</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="flex items-center gap-2">
              <Mail className="w-3.5 h-3.5" /> support@{(appConfig.domain || "yourapp.com")}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" /> {appConfig.supportPhone || "+234 000 000 0000"}
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold mb-3">Support</h4>
          <ul className="space-y-2 text-xs text-gray-400">
            <li className="hover:text-white cursor-pointer">FAQ</li>
            <li className="hover:text-white cursor-pointer">Terms of Service</li>
            <li className="hover:text-white cursor-pointer">Privacy Policy</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-sm font-bold mb-3">Location</h4>
          <p className="flex items-start gap-2 text-xs text-gray-400 leading-relaxed">
            <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            Nigeria — service area varies by seller
          </p>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
        <p className="text-[11px] text-gray-500">
          © {new Date().getFullYear()} {appConfig.appName || "Foodie"}. All rights reserved.
        </p>
        <div className="flex gap-2 text-[10px] text-gray-500">
          <span className="px-2 py-1 border border-gray-700 rounded">Visa</span>
          <span className="px-2 py-1 border border-gray-700 rounded">Mastercard</span>
        </div>
      </div>
    </footer>
  );
}