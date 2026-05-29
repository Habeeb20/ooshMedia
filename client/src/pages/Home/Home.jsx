// // Home.jsx
// import React from "react";
// import {
//   Search,
//   ShoppingCart,
//   User,
//   Heart,
//   ChevronRight,
//   Star,
//   Menu,
// } from "lucide-react";
// import { productCategories } from "../../categories/productCategories";

// const heroProducts = [
//   {
//     id: 1,
//     title: "iPhone 15 Pro Max",
//     price: "₦1,850,000",
//     oldPrice: "₦2,000,000",
//     image:
//       "https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 2,
//     title: "MacBook Pro M3",
//     price: "₦3,200,000",
//     oldPrice: "₦3,500,000",
//     image:
//       "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 3,
//     title: "Sony Headset",
//     price: "₦220,000",
//     oldPrice: "₦280,000",
//     image:
//       "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1200&auto=format&fit=crop",
//   },
//   {
//     id: 4,
//     title: "Gaming Chair",
//     price: "₦450,000",
//     oldPrice: "₦520,000",
//     image:
//       "https://images.unsplash.com/photo-1598550476439-6847785fcea6?q=80&w=1200&auto=format&fit=crop",
//   },
// ];

// const flashSales = [
//   {
//     id: 1,
//     title: "Smart TV",
//     image:
//       "https://images.unsplash.com/photo-1593784991095-a205069470b6?q=80&w=1200&auto=format&fit=crop",
//     price: "₦650,000",
//   },
//   {
//     id: 2,
//     title: "Nike Sneakers",
//     image:
//       "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
//     price: "₦120,000",
//   },
//   {
//     id: 3,
//     title: "Bluetooth Speaker",
//     image:
//       "https://images.unsplash.com/photo-1589003077984-894e133dabab?q=80&w=1200&auto=format&fit=crop",
//     price: "₦90,000",
//   },
//   {
//     id: 4,
//     title: "Smart Watch",
//     image:
//       "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop",
//     price: "₦180,000",
//   },
// ];

// export default function Home() {
//   return (
//     <div className="min-h-screen bg-[#f5f5f5]">
//       {/* TOP BAR */}
//       <div className="bg-[#5b0e2d] text-white text-sm py-2">
//         <div className="max-w-7xl mx-auto px-4 flex justify-between">
//           <p>Welcome to WineMart</p>

//           <div className="flex gap-6">
//             <p>Sell on WineMart</p>
//             <p>Help</p>
//             <p>Track Order</p>
//           </div>
//         </div>
//       </div>

//       {/* NAVBAR */}
//       <div className="bg-white shadow sticky top-0 z-50">
//         <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <Menu className="lg:hidden" />

//             <h1 className="text-3xl font-black text-[#5b0e2d]">
//               WineMart
//             </h1>
//           </div>

//           {/* SEARCH */}
//           <div className="flex-1 hidden md:flex">
//             <div className="w-full flex border-2 border-[#5b0e2d] rounded-lg overflow-hidden">
//               <input
//                 type="text"
//                 placeholder="Search products, brands and categories"
//                 className="flex-1 px-4 py-3 outline-none"
//               />

//               <button className="bg-[#5b0e2d] px-6 text-white font-semibold hover:bg-[#7a163d]">
//                 <Search />
//               </button>
//             </div>
//           </div>

//           {/* ACTIONS */}
//           <div className="flex items-center gap-6 text-[#333]">
//             <div className="flex items-center gap-2 cursor-pointer hover:text-[#5b0e2d]">
//               <User size={22} />
//               <span className="hidden md:block">Account</span>
//             </div>

//             <div className="flex items-center gap-2 cursor-pointer hover:text-[#5b0e2d]">
//               <Heart size={22} />
//               <span className="hidden md:block">Wishlist</span>
//             </div>

//             <div className="flex items-center gap-2 cursor-pointer hover:text-[#5b0e2d]">
//               <ShoppingCart size={22} />
//               <span className="hidden md:block">Cart</span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* MOBILE SEARCH */}
//       <div className="p-4 md:hidden bg-white">
//         <div className="flex border-2 border-[#5b0e2d] rounded-lg overflow-hidden">
//           <input
//             type="text"
//             placeholder="Search..."
//             className="flex-1 px-4 py-3 outline-none"
//           />

//           <button className="bg-[#5b0e2d] px-5 text-white">
//             <Search />
//           </button>
//         </div>
//       </div>

//       {/* HERO SECTION */}
//       <div className="max-w-7xl mx-auto px-4 mt-5">
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
//           {/* CATEGORY SIDEBAR */}
//           <div className="hidden lg:block lg:col-span-3 bg-white rounded-xl p-4 shadow-sm">
//             {productCategories.map((category) => (
//               <div
//                 key={category.id}
//                 className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-[#f8e7ee] cursor-pointer transition"
//               >
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">{category.icon}</span>

//                   <p className="font-medium text-sm">{category.name}</p>
//                 </div>

//                 <ChevronRight size={16} />
//               </div>
//             ))}
//           </div>

//           {/* HERO BANNER */}
//           <div className="lg:col-span-6 rounded-2xl overflow-hidden relative h-[420px]">
//             <img
//               src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1400&auto=format&fit=crop"
//               alt=""
//               className="w-full h-full object-cover"
//             />

//             <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/20 flex items-center">
//               <div className="p-10 text-white max-w-lg">
//                 <h1 className="text-5xl font-black leading-tight">
//                   Mega Deals <br /> Up To 70% OFF
//                 </h1>

//                 <p className="mt-4 text-lg text-gray-200">
//                   Shop premium gadgets, fashion, electronics and more.
//                 </p>

//                 <button className="mt-6 bg-[#5b0e2d] hover:bg-[#7a163d] px-8 py-4 rounded-lg font-bold text-lg">
//                   Shop Now
//                 </button>
//               </div>
//             </div>
//           </div>

//           {/* RIGHT ADS */}
//           <div className="lg:col-span-3 flex lg:flex-col gap-4">
//             <div className="bg-[#5b0e2d] text-white rounded-2xl p-6 flex-1 flex flex-col justify-center">
//               <h2 className="text-2xl font-bold">
//                 Free Delivery
//               </h2>

//               <p className="mt-2 text-gray-200">
//                 On orders above ₦50,000
//               </p>
//             </div>

//             <div className="bg-white rounded-2xl p-6 flex-1 shadow-sm">
//               <h2 className="text-2xl font-bold text-[#5b0e2d]">
//                 Flash Sales
//               </h2>

//               <p className="mt-2 text-gray-500">
//                 Limited time amazing discounts.
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* FLASH SALES */}
//       <section className="max-w-7xl mx-auto px-4 mt-10">
//         <div className="bg-[#5b0e2d] text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
//           <h2 className="text-2xl font-bold">
//             Flash Sales
//           </h2>

//           <button className="font-semibold">
//             SEE ALL
//           </button>
//         </div>

//         <div className="bg-white p-6 rounded-b-2xl grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {flashSales.map((item) => (
//             <div
//               key={item.id}
//               className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition duration-300 border"
//             >
//               <div className="h-52 overflow-hidden">
//                 <img
//                   src={item.image}
//                   alt=""
//                   className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
//                 />
//               </div>

//               <div className="p-4">
//                 <h3 className="font-semibold line-clamp-1">
//                   {item.title}
//                 </h3>

//                 <p className="text-[#5b0e2d] font-black text-xl mt-2">
//                   {item.price}
//                 </p>

//                 <div className="flex items-center gap-1 mt-2 text-yellow-500">
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                 </div>

//                 <button className="mt-4 w-full bg-[#5b0e2d] hover:bg-[#7a163d] text-white py-3 rounded-lg font-semibold">
//                   Add To Cart
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* PRODUCTS GRID */}
//       <section className="max-w-7xl mx-auto px-4 mt-10 pb-16">
//         <div className="flex items-center justify-between mb-6">
//           <h2 className="text-3xl font-black">
//             Recommended For You
//           </h2>

//           <button className="text-[#5b0e2d] font-bold">
//             View More
//           </button>
//         </div>

//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {heroProducts.map((product) => (
//             <div
//               key={product.id}
//               className="bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition duration-300 group"
//             >
//               <div className="h-64 overflow-hidden relative">
//                 <img
//                   src={product.image}
//                   alt=""
//                   className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
//                 />

//                 <div className="absolute top-3 right-3 bg-white rounded-full p-2 shadow">
//                   <Heart size={18} />
//                 </div>
//               </div>

//               <div className="p-4">
//                 <h3 className="font-semibold line-clamp-2">
//                   {product.title}
//                 </h3>

//                 <p className="text-[#5b0e2d] font-black text-2xl mt-2">
//                   {product.price}
//                 </p>

//                 <p className="text-gray-400 line-through">
//                   {product.oldPrice}
//                 </p>

//                 <div className="flex items-center gap-1 mt-2 text-yellow-500">
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                   <Star size={16} fill="currentColor" />
//                 </div>

//                 <button className="w-full mt-5 bg-[#5b0e2d] hover:bg-[#7a163d] text-white py-3 rounded-xl font-bold transition">
//                   Add To Cart
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>

//       {/* FOOTER */}
//       <footer className="bg-[#1f0a13] text-white mt-10">
//         <div className="max-w-7xl mx-auto px-4 py-14 grid md:grid-cols-4 gap-10">
//           <div>
//             <h1 className="text-3xl font-black">
//               WineMart
//             </h1>

//             <p className="mt-4 text-gray-300">
//               Nigeria’s premium online shopping destination.
//             </p>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">
//               Need Help?
//             </h3>

//             <ul className="space-y-2 text-gray-300">
//               <li>Chat with us</li>
//               <li>Help Center</li>
//               <li>Contact Us</li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">
//               About
//             </h3>

//             <ul className="space-y-2 text-gray-300">
//               <li>About Us</li>
//               <li>Careers</li>
//               <li>Terms & Conditions</li>
//             </ul>
//           </div>

//           <div>
//             <h3 className="font-bold text-lg mb-4">
//               Payment
//             </h3>

//             <div className="flex gap-3 flex-wrap">
//               <div className="bg-white text-black px-4 py-2 rounded">
//                 VISA
//               </div>

//               <div className="bg-white text-black px-4 py-2 rounded">
//                 Mastercard
//               </div>

//               <div className="bg-white text-black px-4 py-2 rounded">
//                 Paystack
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="border-t border-white/10 py-5 text-center text-gray-400">
//           © 2026 WineMart. All rights reserved.
//         </div>
//       </footer>
//     </div>
//   );
// }




























































import Topbar from "../../components/home/Topbar";
import Navbar from "../../components/home/Navbar";
import HeroSection from "../../components/home/HeroSection";
import PromoBanner from "../../components/home/PromoBanner";
import PromoCards from "../../components/home/Promocard";
import FlashSales from "../../components/home/FlashSales";

import FashionDeals from "../../components/home/FashionDeals";

import FeatureGrid from "./FeaturedGrid";
import CategoryDropdown from "../../components/home/CtageoryDropdown";
import ProductsGrid from "../product/ProductGrid";




export default function Home() {
  return (
    <div className="bg-[#f5f5f7] min-h-screen overflow-x-hidden">
      <Topbar />
      <Navbar />

      <HeroSection />
   
      <FeatureGrid />

      <PromoBanner />
<ProductsGrid/>
      <FlashSales />

      <FashionDeals />
   

  
    </div>
  );
}