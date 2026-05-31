// import { useState } from "react";
// import {
//   ChevronDown,
//   ChevronUp,
//   ChevronRight,
//   X,
// } from "lucide-react";

// import { productCategories } from "../../categories/productCategories";
// import appConfig from "../../config/appConfig";

// export default function CategoryDropdown() {
//   const [activeCategory, setActiveCategory] = useState(null);
//   const [showModal, setShowModal] = useState(false);

//   // SHOW ONLY 3 INITIALLY
//   const visibleCategories = productCategories.slice(0, 3);
//   const remainingCategories = productCategories.slice(3);

//   const toggleCategory = (id) => {
//     setActiveCategory(activeCategory === id ? null : id);
//   };

//   const CategoryItem = ({ category }) => {
//     const isOpen = activeCategory === category.id;

//     return (
//       <div className="transition-all duration-300">
//         {/* CATEGORY HEADER */}
//         <button
//           onClick={() => toggleCategory(category.id)}
//           className="w-full flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-all"
//         >
//           <div className="flex items-center gap-3">
//             {/* ICON */}
//             <div
//               className="w-11 h-11 rounded-xl flex items-center justify-center text-lg"
//               style={{
//                 background: `${appConfig.colors.primary}12`,
//               }}
//             >
//               {category.icon}
//             </div>

//             {/* TEXT */}
//             <div className="text-left">
//               <h3 className="font-semibold text-sm text-gray-800">
//                 {category.name}
//               </h3>

//               <p className="text-gray-400 text-xs">
//                 {category.subcategories.length} subcategories
//               </p>
//             </div>
//           </div>

//           {/* ARROW */}
//           <div>
//             {isOpen ? (
//               <ChevronUp
//                 size={18}
//                 color={appConfig.colors.primary}
//               />
//             ) : (
//               <ChevronDown
//                 size={18}
//                 color={appConfig.colors.primary}
//               />
//             )}
//           </div>
//         </button>

//         {/* SUBCATEGORIES */}
//         <div
//           className={`grid transition-all duration-500 overflow-hidden ${
//             isOpen
//               ? "grid-rows-[1fr] opacity-100"
//               : "grid-rows-[0fr] opacity-0"
//           }`}
//         >
//           <div className="overflow-hidden">
//             <div className="px-4 pb-4">
//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
//                 {category.subcategories.map((sub, index) => (
//                   <button
//                     key={index}
//                     className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all text-left group"
//                   >
//                     <span className="font-medium text-xs text-gray-700">
//                       {sub}
//                     </span>

//                     <ChevronRight
//                       size={14}
//                       className="opacity-0 group-hover:opacity-100 transition"
//                       color={appConfig.colors.primary}
//                     />
//                   </button>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <section className="mt-6">
//         <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
//           {/* HEADER */}
//           <div className="flex justify-between items-center px-4 py-4 border-b">
//             <div>
//               <h2
//                 className="text-lg md:text-xl font-bold"
//                 style={{
//                   color: appConfig.colors.primary,
//                 }}
//               >
//                 Browse Categories
//               </h2>

//               <p className="text-gray-400 mt-1 text-xs">
//                 Explore by category
//               </p>
//             </div>

//             <button
//               onClick={() => setShowModal(true)}
//               className="text-xs md:text-sm font-semibold px-4 py-2 rounded-lg text-white"
//               style={{
//                 background: appConfig.colors.primary,
//               }}
//             >
//               See More
//             </button>
//           </div>

//           {/* CATEGORY LIST */}
//           <div className="divide-y divide-gray-100">
//             {visibleCategories.map((category) => (
//               <CategoryItem
//                 key={category.id}
//                 category={category}
//               />
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* MODAL */}
//       {showModal && (
//         <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
//           <div className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
//             {/* MODAL HEADER */}
//             <div className="flex items-center justify-between px-5 py-4 border-b">
//               <div>
//                 <h2
//                   className="text-xl font-bold"
//                   style={{
//                     color: appConfig.colors.primary,
//                   }}
//                 >
//                   All Categories
//                 </h2>

//                 <p className="text-gray-400 text-sm mt-1">
//                   Browse all product categories
//                 </p>
//               </div>

//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {/* MODAL BODY */}
//             <div className="max-h-[75vh] overflow-y-auto divide-y divide-gray-100">
//               {remainingCategories.map((category) => (
//                 <CategoryItem
//                   key={category.id}
//                   category={category}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }




import { useState } from "react";
import { ChevronDown, ChevronUp, ChevronRight, X, Grid3X3 } from "lucide-react";
import { productCategories } from "../../categories/productCategories";
import appConfig from "../../config/appConfig";

function CategoryItem({ category, onClose }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-50 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-50 transition-colors group"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-transform group-hover:scale-110"
            style={{ background: appConfig.colors.primary + "12" }}
          >
            {category.icon}
          </div>
          <div className="text-left min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#8B1E3F] transition-colors">{category.name}</p>
            <p className="text-[10px] text-gray-400">{category.subcategories.length} subcategories</p>
          </div>
        </div>
        <span className="flex-shrink-0 ml-2">
          {isOpen
            ? <ChevronUp size={15} style={{ color: appConfig.colors.primary }} />
            : <ChevronDown size={15} className="text-gray-400" />
          }
        </span>
      </button>

      <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
        <div className="px-4 pb-3 grid grid-cols-1 gap-1">
          {category.subcategories.map((sub, i) => (
            <button
              key={i}
              onClick={onClose}
              className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all text-left group/sub"
            >
              <span className="text-xs font-semibold text-gray-600 group-hover/sub:text-[#8B1E3F] transition-colors">{sub}</span>
              <ChevronRight size={12} className="opacity-0 group-hover/sub:opacity-100 transition-opacity flex-shrink-0" style={{ color: appConfig.colors.primary }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CategoryDropdown() {
  const [showModal, setShowModal] = useState(false);
  const visibleCategories = productCategories.slice(0, 5);
  const remainingCategories = productCategories.slice(5);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-full">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100" style={{ background: appConfig.colors.primary + "08" }}>
          <div className="flex items-center gap-2">
            <Grid3X3 size={16} style={{ color: appConfig.colors.primary }} />
            <div>
              <h2 className="text-sm font-black" style={{ color: appConfig.colors.primary }}>Categories</h2>
              <p className="text-[10px] text-gray-400 leading-none">{productCategories.length} categories</p>
            </div>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
            style={{ background: appConfig.colors.primary }}
          >
            See All
          </button>
        </div>

        <div className="divide-y divide-gray-50">
          {visibleCategories.map(cat => (
            <CategoryItem key={cat.id} category={cat} onClose={() => {}} />
          ))}
        </div>

        {/* Show more teaser */}
        <button
          onClick={() => setShowModal(true)}
          className="w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-t border-gray-100 hover:bg-rose-50 transition-colors"
          style={{ color: appConfig.colors.primary }}
        >
          +{remainingCategories.length} more categories <ChevronRight size={13} />
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-lg font-black" style={{ color: appConfig.colors.primary }}>All Categories</h2>
                <p className="text-xs text-gray-400 mt-0.5">Browse {productCategories.length} product categories</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {remainingCategories.map(cat => (
                <CategoryItem key={cat.id} category={cat} onClose={() => setShowModal(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}