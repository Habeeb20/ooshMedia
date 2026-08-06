


// import { useState } from 'react';
// import {
//   Store,
//   ShoppingBag,
//   BadgeDollarSign,
//   Truck,
//   Tags,
//   Users,
// } from "lucide-react";

// import { Link } from "react-router-dom";
// import {useAuth} from "../../context/AuthContext"

// import appConfig from "../../config/appConfig";

// const features = [
//   {
//     title: "Contracts",
//     description: "Discover trusted vendors and premium business stores.",
//     icon: Store,
//     gradient: "from-[#8B1E3F] to-[#A6224A]",
//     link: "/business?type=contract",
//     requiresAuth: true,
//   },
//   {
//     title: "Supply",
//     description: "Discover trusted vendors and premium business stores.",
//     icon: Store,
//     gradient: "from-[#8B1E3F] to-[#A6224A]",
//     link: "/business?type=supply",
//     requiresAuth: true,
//   },
//   {
//     title: "Jobs",
//     description: "Discover trusted vendors and premium business stores.",
//     icon: Store,
//     gradient: "from-[#8B1E3F] to-[#A6224A]",
//     link: "/business?type=jobs",
//     requiresAuth: true,
//   },
//   {
//     title: "Edeals",
//     description: "Discover trusted vendors and premium business stores.",
//     icon: Store,
//     gradient: "from-[#8B1E3F] to-[#A6224A]",
//     link: "/business?type=edeals",
//     requiresAuth: true,
//   },

//   {
//     title: "Eparts",
//     description: "Shop premium parts products across categories.",
//     icon: ShoppingBag,
//     gradient: "from-[#111827] to-[#1F2937]",
//     link: "/eparts",
//     requiresAuth: true,
//   },

//   {
//     title: "BusiBody",
//     description: "Check out beauty products for women across categories.",
//     icon: BadgeDollarSign,
//     gradient: "from-[#1E3A8A] to-[#2563EB]",
//     link: "/busibody",
//     requiresAuth: true,
//   },

//   {
//     title: "Vendors",
//     description: "Hire reliable dispatch riders and errand services easily.",
//     icon: Truck,
//     gradient: "from-[#059669] to-[#10B981]",
//     link: "/vendors",
//     requiresAuth: true,
//   },
// ];

// // Other Services (shown in modal)
// const otherServices = [
//   {
//     title: "Edrivers",
//     link: "https://edrivers.ng",
//     description: "Looking to hire drivers.",
//   },
//   {
//     title: "Efixit",
//     link: "https://efixit.ng",
//     description: "Looking for service providers to fix and render services.",
//   },
//   {
//     title: "E Hotels",
//     link: "/e-hotels",
//     description: "Looking to get a hotel.",
//   },
// ];

// export default function FeatureGrid() {
//   const { isAuthenticated } = useAuth();
//   const [showOtherModal, setShowOtherModal] = useState(false);

//   // Filter features that require auth
//   const visibleFeatures = features.filter(
//     item => !item.requiresAuth || isAuthenticated
//   );

//   return (
//     <section className="max-w-7xl mx-auto px-4 mt-10">
//       {/* GRID */}
//       <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-8 gap-3">
//         {visibleFeatures.map((item, index) => {
//           const Icon = item.icon;

//           return (
//             <Link
//               key={index}
//               to={item.link}
//               target="_blank"
//               rel="noopener noreferrer"
//               className="block"
//             >
//               <div
//                 className="group relative overflow-hidden rounded-[0.5rem] p-[1px] hover:scale-[1.02] transition-all duration-300"
//                 style={{
//                   background: `linear-gradient(135deg, ${appConfig.colors.primaryLight}, transparent)`,
//                 }}
//               >
//                 <div className="bg-white rounded-[0.8rem] p-3 h-full relative overflow-hidden flex flex-col items-center text-center shadow-sm hover:shadow-2xl transition-all duration-500">
//                   <div
//                     className={`absolute top-0 right-0 w-40 h-10 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${item.gradient}`}
//                   />

//                   <div
//                     className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg mx-auto`}
//                   >
//                     <Icon size={30} />
//                   </div>

//                   <div className="mt-1 z-10">
//                     <h3 className="text-sm text-center font-black text-gray-900">
//                       {item.title}
//                     </h3>
//                   </div>
//                   <h3 className="text-xs text-center font-light font-black text-gray-900">
//                     {item.description}
//                   </h3>

//                   <h3 className="text-sm text-center font-black pt-5 text-rose-900">
//                     Explore now
//                   </h3>
//                   <div
//                     className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
//                     style={{ background: appConfig.colors.primary }}
//                   />
//                 </div>
//               </div>
//             </Link>
//           );
//         })}

//         {/* Other Services Card */}
//         {isAuthenticated && (
//           <button
//             onClick={() => setShowOtherModal(true)}
//             className="block w-full text-left"
//           >
//             <div
//               className="group relative overflow-hidden rounded-[0.5rem] p-[1px] hover:scale-[1.02] transition-all duration-300"
//               style={{
//                 background: `linear-gradient(135deg, ${appConfig.colors.primaryLight}, transparent)`,
//               }}
//             >
//               <div className="bg-white rounded-[0.8rem] p-3 h-full relative overflow-hidden flex flex-col items-center text-center shadow-sm hover:shadow-2xl transition-all duration-500">
//                 <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg mx-auto">
//                   <Users size={30} />
//                 </div>

//                 <div className="mt-1 relative z-10">
//                   <h3 className="text-sm font-black text-gray-900">Essential Products</h3>
//                   <p className="text-xs text-gray-500 mt-0.5">You can access our other services, they are reliable for getting drivers etc</p>
//                 </div>

//                 <div
//                   className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
//                   style={{ background: appConfig.colors.primary }}
//                 />
//               </div>
//             </div>
//           </button>
//         )}
//       </div>

//       {/* Other Services Modal */}
//       {showOtherModal && (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
//           <div className="bg-white rounded-3xl max-w-md w-full p-8">
//             <h2 className="text-2xl font-bold text-center mb-8">Essential Products</h2>

//             <div className="space-y-3">
//               {otherServices.map((service, i) => (
//                 <Link
//                   key={i}
//                   to={service.link}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   onClick={() => setShowOtherModal(false)}
//                   className="block w-full text-left px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
//                 >
//                   <span className="font-semibold text-lg">{service.title}</span> <br/>
//                   <span className="text-lg">{service.description}</span>
//                 </Link>
//               ))}
//             </div>

//             <button
//               onClick={() => setShowOtherModal(false)}
//               className="mt-6 w-full py-3 text-gray-500 font-medium hover:text-gray-700"
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       )}
//     </section>
//   );
// }






import { useState } from 'react';
import {
  Store,
  ShoppingBag,
  BadgeDollarSign,
  Truck,
  Tags,
  Users,
  Car,
  Wrench,
  BedDouble,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import contract from "../../assets/contract.png"
import supply from "../../assets/supply.png"
import vendor from "../../assets/vendors.png"
import job from "../../assets/job.png"
import edeal from "../../assets/edeals.png"
import busybody from "../../assets/busybody.png"
import epart from "../../assets/epart.png"
import appConfig from "../../config/appConfig";

// TODO: swap these for real images — same pattern as your assets in productCategories.js
// e.g. import contractsImg from "../../assets/features/contracts.jpg";
// Then set `image: contractsImg` on the matching feature below.
// Until you add real images, each card falls back to its gradient + icon block.

const features = [
  {
    title: "Contracts",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=contract",
    requiresAuth: true,
    image: contract,
  },
  {
    title: "Supply",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=supply",
    requiresAuth: true,
    image: supply,
  },
  {
    title: "Jobs",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=jobs",
    requiresAuth: true,
    image: job,
  },
  {
    title: "Edeals",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=edeals",
    requiresAuth: true,
    image: edeal,
  },
  {
    title: "Eparts",
    description: "Shop premium parts products across categories.",
    icon: ShoppingBag,
    gradient: "from-[#111827] to-[#1F2937]",
    link: "/eparts",
    requiresAuth: true,
    image: epart,
  },
  {
    title: "BusiBody",
    description: "Check out beauty products for women across categories.",
    icon: BadgeDollarSign,
    gradient: "from-[#1E3A8A] to-[#2563EB]",
    link: "/busibody",
    requiresAuth: true,
    image: busybody,
  },
  {
    title: "Vendors",
    description: "Hire reliable dispatch riders and errand services easily.",
    icon: Truck,
    gradient: "from-[#059669] to-[#10B981]",
    link: "/vendors",
    requiresAuth: true,
    image: vendor,
  },
];

// Other Services (shown in modal) — icon added per service
const otherServices = [
  {
    title: "Edrivers",
    link: "https://edrivers.ng",
    description: "Looking to hire drivers.",
    icon: Car,
  },
  {
    title: "Efixit",
    link: "https://efixit.ng",
    description: "Looking for service providers to fix and render services.",
    icon: Wrench,
  },
  {
    title: "E Hotels",
    link: "/e-hotels",
    description: "Looking to get a hotel.",
    icon: BedDouble,
  },
];

export default function FeatureGrid() {
  const { isAuthenticated } = useAuth();
  const [showOtherModal, setShowOtherModal] = useState(false);

  const visibleFeatures = features.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      {/* GRID — 2 per row mobile, 4 per row desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleFeatures.map((item, index) => {
          const Icon = item.icon;

          return (
            <Link
              key={index}
              to={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <div
                className="relative overflow-hidden rounded-[0.8rem] bg-white shadow-sm hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-[var(--accent)] h-full flex flex-col"
                style={{ "--accent": appConfig.colors.primary }}
              >
                {/* Picture */}
                <div className="relative h-28 md:h-32 overflow-hidden">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className={`w-full h-full bg-gradient-to-br ${item.gradient} group-hover:scale-110 transition-transform duration-500`}
                    />
                  )}
                  <div className={`absolute inset-0 bg-gradient-to-t ${item.gradient} opacity-30`} />
                  <div
                    className={`absolute top-2 left-2 w-8 h-8 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center text-white shadow-lg`}
                  >
                    <Icon size={16} />
                  </div>
                </div>

                {/* Text */}
                <div className="p-3 flex flex-col  flex-1">
                  <h3 className="text-sm font-black text-gray-700">{item.title}</h3>
                  <p className="text-xs font-medium text-gray-500 mt-1 line-clamp-2">
                    {item.description}
                  </p>
                  <span
                    className="text-sm  pt-3 mt-auto"
                    style={{ color: appConfig.colors.primary }}
                  >
                    Explore now
                  </span>
                </div>

                <div
                  className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                  style={{ background: appConfig.colors.primary }}
                />
              </div>
            </Link>
          );
        })}

        {/* Other Services Card — plain, fills with brand color on hover */}
        {isAuthenticated && (
          <button
            onClick={() => setShowOtherModal(true)}
            className="block w-full text-left group"
          >
            <div
              className="relative overflow-hidden rounded-[0.8rem] bg-white shadow-sm hover:shadow-2xl transition-all duration-500 border-2 border-transparent hover:border-[var(--accent)] hover:bg-[var(--accent)] h-full flex flex-col items-center justify-center text-center p-4"
              style={{ "--accent": appConfig.colors.primary }}
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <Users size={22} />
              </div>

              <h3 className="text-sm font-black mt-2 text-gray-900 transition-colors duration-500 group-hover:text-white">
                Essential Products
              </h3>
              <p className="text-xs mt-1 text-gray-500 transition-colors duration-500 group-hover:text-white/90">
                Access our other services — drivers, artisans & more
              </p>
            </div>
          </button>
        )}
      </div>

      {/* Other Services Modal — icon added beside each name */}
      {showOtherModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Essential Products</h2>

            <div className="space-y-3">
              {otherServices.map((service, i) => {
                const ServiceIcon = service.icon;
                return (
                  <Link
                    key={i}
                    to={service.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setShowOtherModal(false)}
                    className="flex items-start gap-4 w-full text-left px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
                      style={{ background: appConfig.colors.primary }}
                    >
                      <ServiceIcon size={18} />
                    </div>
                    <div>
                      <span className="font-semibold text-lg block">{service.title}</span>
                      <span className="text-sm text-gray-500">{service.description}</span>
                    </div>
                  </Link>
                );
              })}
            </div>

            <button
              onClick={() => setShowOtherModal(false)}
              className="mt-6 w-full py-3 text-gray-500 font-medium hover:text-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
}