// // components/home/FeatureGrid.jsx

// import {
//   Store,
//   ShoppingBag,
//   BadgeDollarSign,
//   Truck,
//   Tags,
//   Users,
// } from "lucide-react";

// import appConfig from "../../config/appConfig";

// const features = [
//   {
//     title: "Browse Vendors",
//     description:
//       "Discover trusted vendors and premium business stores.",
//     icon: Store,
//     gradient: "from-[#8B1E3F] to-[#A6224A]",
//   },

//   {
//     title: "Marketplace",
//     description:
//       "Shop thousands of premium products across categories.",
//     icon: ShoppingBag,
//     gradient: "from-[#111827] to-[#1F2937]",
//   },

//   {
//     title: "Price Checker",
//     description:
//       "Compare product prices instantly across multiple vendors.",
//     icon: BadgeDollarSign,
//     gradient: "from-[#1E3A8A] to-[#2563EB]",
//     link:'/price-checker'
//   },

//   {
//     title: "Errander",
//     description:
//       "Hire reliable dispatch riders and errand services easily.",
//     icon: Truck,
//     gradient: "from-[#059669] to-[#10B981]",
//   },

//   {
//     title: "Discount Deals",
//     description:
//       "Get access to daily flash sales and massive discounts.",
//     icon: Tags,
//     gradient: "from-[#EA580C] to-[#F59E0B]",
//   },

//   {
//     title: "Top Services",
//     description:
//       "Connect with verified professionals and service providers.",
//     icon: Users,
//     gradient: "from-[#7C3AED] to-[#9333EA]",
//   },
// ];

// export default function FeatureGrid() {
//   return (
//     <section className="max-w-7xl mx-auto px-4 mt-10">
//       {/* SECTION HEADER */}
//       {/* <div className="mb-7">
//         <h2 className="text-3xl md:text-4xl font-black text-gray-900">
//           Explore {appConfig.name}
//         </h2>

//         <p className="text-gray-500 mt-2 text-sm md:text-base">
//           Everything you need in one premium marketplace platform.
//         </p>
//       </div> */}

//       {/* GRID */}
//       <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-6">
//         {features.map((item, index) => {
//           const Icon = item.icon;

//           return (
//             <>
//                 <div
//               key={index}
//               className="group relative overflow-hidden rounded-[2rem] p-[1px] hover:scale-[1.02] transition-all duration-300"
//               style={{
//                 background: `linear-gradient(135deg, ${appConfig.colors.primaryLight}, transparent)`,
//               }}
//             >
//               <div className="bg-white rounded-[2rem] p-7 h-full relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
//                 {/* BACKGROUND GLOW */}
//                 <div
//                   className={`absolute top-0 right-0 w-40 h-10 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${item.gradient}`}
//                 />

//                 {/* ICON */}
//                 <div
//                   className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}
//                 >
//                   <Icon size={30} />
//                 </div>

//                 {/* CONTENT */}
//                 <div className="mt-6 relative z-10">
//                   <h3 className="text-sm font-black text-gray-900">
//                     {item.title}
//                   </h3>
// {/* 
//                   <p className="mt-3 text-gray-500 leading-relaxed">
//                     {item.description}
//                   </p> */}

//                   {/* BUTTON */}
//                   {/* <button
//                     className="mt-6 px-5 py-3 rounded-xl text-white font-semibold hover:scale-105 transition-all"
//                     style={{
//                       background: appConfig.colors.primary,
//                     }}
//                   >
//                     Explore Now
//                   </button> */}
//                 </div>

//                 {/* HOVER LINE */}
//                 <div
//                   className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
//                   style={{
//                     background: appConfig.colors.primary,
//                   }}
//                 />
//               </div>
//             </div>
//             </>
        
//           );
//         })}
//       </div>
//     </section>
//   );
// }





// components/home/FeatureGrid.jsx

import {
  Store,
  ShoppingBag,
  BadgeDollarSign,
  Truck,
  Tags,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";

import appConfig from "../../config/appConfig";

const features = [
  {
    title: "Vendors",
    description:
      "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/vendors",
  },

  {
    title: "Marketplace",
    description:
      "Shop thousands of premium products across categories.",
    icon: ShoppingBag,
    gradient: "from-[#111827] to-[#1F2937]",
    link: "/marketplace",
  },

  {
    title: "Price Checker",
    description:
      "Compare product prices instantly across multiple vendors.",
    icon: BadgeDollarSign,
    gradient: "from-[#1E3A8A] to-[#2563EB]",
    link: "/price-checker",
  },

  {
    title: "Errander",
    description:
      "Hire reliable dispatch riders and errand services easily.",
    icon: Truck,
    gradient: "from-[#059669] to-[#10B981]",
    link: "/errander",
  },

  {
    title: "edrivers",
    description:
      "Get access to daily flash sales and massive discounts.",
    icon: Tags,
    gradient: "from-[#EA580C] to-[#F59E0B]",
    link: "/discount-deals",
  },

  {
    title: "efixit",
    description:
      "Connect with verified professionals and service providers.",
    icon: Users,
    gradient: "from-[#7C3AED] to-[#9333EA]",
    link: "/top-services",
  },
  {
    title: "Edrive",
    description:
      "Connect with verified professionals and service providers.",
    icon: Users,
    gradient: "from-[#7C3AED] to-[#9333EA]",
    link: "/edrive",
  },
  {
    title: "E hotels",
    description:
      "Connect with verified professionals and service providers.",
    icon: Users,
    gradient: "from-[#7C3AED] to-[#9333EA]",
    link: "/e-hotels",
  },
];

export default function FeatureGrid() {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      {/* GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-8 gap-6">
        {features.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={index}
              to={item.link}
              className="block"
            >
              <div
                className="group relative overflow-hidden rounded-[2rem] p-[1px] hover:scale-[1.02] transition-all duration-300"
                style={{
                  background: `linear-gradient(135deg, ${appConfig.colors.primaryLight}, transparent)`,
                }}
              >
                <div className="bg-white rounded-[2rem] p-7 h-full relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
                  {/* BACKGROUND GLOW */}
                  <div
                    className={`absolute top-0 right-0 w-40 h-10 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${item.gradient}`}
                  />

                  {/* ICON */}
                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon size={30} />
                  </div>

                  {/* CONTENT */}
                  <div className="mt-6 relative z-10">
                    <h3 className="text-sm font-black text-gray-900">
                      {item.title}
                    </h3>
                  </div>

                  {/* HOVER LINE */}
                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    style={{
                      background:
                        appConfig.colors.primary,
                    }}
                  />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}