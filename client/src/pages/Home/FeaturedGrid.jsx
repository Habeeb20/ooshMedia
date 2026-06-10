import { useState } from 'react';
import {
  Store,
  ShoppingBag,
  BadgeDollarSign,
  Truck,
  Tags,
  Users,
} from "lucide-react";

import { Link } from "react-router-dom";
import {useAuth} from "../../context/AuthContext"

import appConfig from "../../config/appConfig";

const features = [
  {
    title: "contracts",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=contract",
    requiresAuth: true,
  },
  {
    title: "supply",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=supply",
    requiresAuth: true,
  },
  {
    title: "jobs",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=jobs",
    requiresAuth: true,
  },
  {
    title: "Edeals",
    description: "Discover trusted vendors and premium business stores.",
    icon: Store,
    gradient: "from-[#8B1E3F] to-[#A6224A]",
    link: "/business?type=edeals",
    requiresAuth: true,
  },

  {
    title: "Marketplace",
    description: "Shop thousands of premium products across categories.",
    icon: ShoppingBag,
    gradient: "from-[#111827] to-[#1F2937]",
    link: "/marketplace",
  },

  {
    title: "Price Checker",
    description: "Compare product prices instantly across multiple vendors.",
    icon: BadgeDollarSign,
    gradient: "from-[#1E3A8A] to-[#2563EB]",
    link: "/price-checker",
  },

  {
    title: "Vendors",
    description: "Hire reliable dispatch riders and errand services easily.",
    icon: Truck,
    gradient: "from-[#059669] to-[#10B981]",
    link: "/vendors",
  },
];

// Other Services (shown in modal)
const otherServices = [
  {
    title: "Edrivers",
    link: "https://edrivers.ng",
    description: "looking to hire drivers ",
  },
  {
    title: "Efixit",
    link: "https://efixit.ng",
    description: "looking for service providers to fix render services",
  },
  {
    title: "E Hotels",
    link: "/e-hotels",
    description: "looking to get an hotel ",
  },
];

export default function FeatureGrid() {
  const { isAuthenticated } = useAuth();
  const [showOtherModal, setShowOtherModal] = useState(false);

  // Filter features that require auth
  const visibleFeatures = features.filter(
    item => !item.requiresAuth || isAuthenticated
  );

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      {/* GRID */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-8 gap-3">
        {visibleFeatures.map((item, index) => {
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
                <div className="bg-white rounded-[2rem] p-3 h-full relative overflow-hidden  shadow-sm hover:shadow-2xl transition-all duration-500">
                  <div
                    className={`absolute top-0 right-0 w-40 h-10 rounded-full blur-3xl opacity-10 bg-gradient-to-br ${item.gradient}`}
                  />

                  <div
                    className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${item.gradient} flex items-center ml-10 justify-center  text-white shadow-lg`}
                  >
                    <Icon size={30} />
                  </div>

                  <div className="mt-1 relative z-10">
                    <h3 className="text-sm text-center font-black text-gray-900">
                      {item.title}
                    </h3>
               
                  </div>
                       <h3 className="text-1xl font-light font-black text-gray-900">
                      {item.description}
                    </h3>

                  <div
                    className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                    style={{ background: appConfig.colors.primary }}
                  />
                </div>
              </div>
            </Link>
          );
        })}

        {/* Other Services Card */}
        <button
          onClick={() => setShowOtherModal(true)}
          className="block w-full text-left"
        >
          <div
            className="group relative overflow-hidden rounded-[2rem] p-[1px] hover:scale-[1.02] transition-all duration-300"
            style={{
              background: `linear-gradient(135deg, ${appConfig.colors.primaryLight}, transparent)`,
            }}
          >
            <div className="bg-white rounded-[2rem] p-3 h-full relative overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#9333EA] flex items-center justify-center text-white shadow-lg">
                <Users size={30} />
              </div>

              <div className="mt-1 relative z-10">
                <h3 className="text-sm font-black text-gray-900">Other Services</h3>
                <p className="text-xs text-gray-500 mt-0.5">Edrivers, Efixit, E Hotels</p>
              </div>

              <div
                className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full transition-all duration-500"
                style={{ background: appConfig.colors.primary }}
              />
            </div>
          </div>
        </button>
      </div>

      {/* Other Services Modal */}
      {showOtherModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200] p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Other Services</h2>

            <div className="space-y-3">
              {otherServices.map((service, i) => (
                <Link
                  key={i}
                  to={service.link}
                  onClick={() => setShowOtherModal(false)}
                  className="block w-full text-left px-6 py-5 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors"
                >
                  <span className="font-semibold text-lg">{service.title}</span> <br/>
                  <span className=" text-lg">{service.description}</span>
                </Link>
              ))}
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