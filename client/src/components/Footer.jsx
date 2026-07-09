import {   MapPin, Phone, Mail } from "lucide-react";

import appConfig from "../config/AppConfig"
export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Column 1 - Company Info */}
          <div className="lg:col-span-2">
            <h1 
              className="text-3xl font-black tracking-tight mb-4"
              style={{ color: appConfig.colors.primary }}
            >
              {appConfig.name}
            </h1>
            <p className="text-gray-400 leading-relaxed max-w-md">
              Your trusted destination for premium products in Nigeria. 
              Quality shopping with fast delivery across Lagos and beyond.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <MapPin size={18} className="text-gray-400" />
                <span>123 Market Street, Lagos, Nigeria</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={18} className="text-gray-400" />
                <span>+234 803 000 0000</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={18} className="text-gray-400" />
                <span>support@{appConfig.name.toLowerCase()}.com</span>
              </div>
            </div>
          </div>

          {/* Column 2 - Shop */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Shop</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/category/electronics" className="hover:text-white transition">Electronics</a></li>
              <li><a href="/category/fashion" className="hover:text-white transition">Fashion</a></li>
              {/* <li><a href="/category/home-living" className="hover:text-white transition">Home & Living</a></li> */}
              <li><a href="/category/beauty" className="hover:text-white transition">Beauty</a></li>
              <li><a href="/deals" className="hover:text-white transition text-orange-400">Today's Deals</a></li>
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-5">Support</h3>
            <ul className="space-y-3 text-sm">
              <li><a href="/track-order" className="hover:text-white transition">Track Order</a></li>
              {/* <li><a href="/shipping" className="hover:text-white transition">Shipping Policy</a></li>
              <li><a href="/returns" className="hover:text-white transition">Returns & Refunds</a></li> */}
              {/* <li><a href="/faq" className="hover:text-white transition">FAQs</a></li> */}
                 <li><a href="/about" className="hover:text-white transition">About Us</a></li>
              <li><a href="/contact" className="hover:text-white transition">Contact Us</a></li>
            </ul>
          </div>

          {/* Column 4 - Company */}
          <div>
            {/* <h3 className="text-white font-semibold text-lg mb-5">Company</h3> */}
            <ul className="space-y-3 text-sm">
           
              {/* <li><a href="/careers" className="hover:text-white transition">Careers</a></li> */}
              {/* <li><a href="/sell" className="hover:text-white transition">Sell on {appConfig.name}</a></li> */}
              {/* <li><a href="/blog" className="hover:text-white transition">Blog</a></li> */}
              {/* <li><a href="/affiliate" className="hover:text-white transition">Affiliate Program</a></li> */}
            </ul>
          </div>

          {/* Column 5 - Newsletter */}
          {/* <div className="lg:col-span-1">
            <h3 className="text-white font-semibold text-lg mb-5">Stay Updated</h3>
            <p className="text-sm text-gray-400 mb-4">
              Get exclusive deals and updates straight to your inbox.
            </p>

            <div className="flex">
              <input
                type="email"
                placeholder="Your email"
                className="bg-gray-800 border border-gray-700 rounded-l-2xl px-4 py-3 text-sm flex-1 focus:outline-none focus:border-gray-600"
              />
              <button 
                className="bg-white text-gray-900 px-6 rounded-r-2xl font-semibold hover:bg-gray-100 transition"
                style={{ color: appConfig.colors.primary }}
              >
                Join
              </button>
            </div>

         
          </div> */}
        </div>

        {/* Bottom Bar */}
        {/* <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <div className="text-gray-500">
            © {new Date().getFullYear()} {appConfig.name}. All Rights Reserved.
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-xs text-gray-500">
            <a href="/privacy" className="hover:text-gray-300">Privacy Policy</a>
            <a href="/terms" className="hover:text-gray-300">Terms of Service</a>
            <a href="/cookies" className="hover:text-gray-300">Cookie Policy</a>
          </div>

          <div className="text-gray-500 text-xs">
            Made with ❤️ for Nigeria
          </div>
        </div> */}
      </div>
    </footer>
  );
}