

// import { useState } from "react";
// import { useNavigate } from "react-router-dom";   // ← Added
// import { ChevronDown, ChevronUp, ChevronRight, X, Grid3X3 } from "lucide-react";
// import { productCategories } from "../../categories/productCategories";
// import appConfig from "../../config/appConfig";

// // Slugify function (consistent with your other components)
// const slugify = (text) => {
//   if (!text) return "";
//   return text
//     .toLowerCase()
//     .trim()
//     .replace(/[^\w\s&-]/g, "")
//     .replace(/[\s&]+/g, "-")
//     .replace(/-+/g, "-");
// };

// function CategoryItem({ category, onClose }) {
//   const navigate = useNavigate();
//   const [isOpen, setIsOpen] = useState(false);

//   const handleCategoryClick = () => {
//     const categorySlug = slugify(category.name);
//     navigate(`/category/${categorySlug}`);
//     onClose?.(); // Close modal if open
//   };

//   return (
//     <div className="border-b border-gray-50 last:border-0">
//       <button
//         onClick={handleCategoryClick}   // ← Now navigates
//         className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-50 transition-colors group"
//       >
//         <div className="flex items-center gap-3 min-w-0">
//           <div
//             className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-transform group-hover:scale-110"
//             style={{ background: appConfig.colors.primary + "12" }}
//           >
//             {category.icon}
//           </div>
//           <div className="text-left min-w-0">
//             <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#8B1E3F] transition-colors">
//               {category.name}
//             </p>
//             <p className="text-[10px] text-gray-400">{category.subcategories?.length} subcategories</p>
//           </div>
//         </div>
//         <span className="flex-shrink-0 ml-2">
//           {isOpen ? (
//             <ChevronUp size={15} style={{ color: appConfig.colors.primary }} />
//           ) : (
//             <ChevronDown size={15} className="text-gray-400" />
//           )}
//         </span>
//       </button>

//       {/* Subcategories (still expandable) */}
//       <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
//         <div className="px-4 pb-3 grid grid-cols-1 gap-1">
//           {category.subcategories?.map((sub, i) => (
//             <button
//               key={i}
//               onClick={onClose}
//               className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all text-left group/sub"
//             >
//               <span className="text-xs font-semibold text-gray-600 group-hover/sub:text-[#8B1E3F] transition-colors">
//                 {sub}
//               </span>
//               <ChevronRight 
//                 size={12} 
//                 className="opacity-0 group-hover/sub:opacity-100 transition-opacity flex-shrink-0" 
//                 style={{ color: appConfig.colors.primary }} 
//               />
//             </button>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function CategoryDropdown() {
//   const [showModal, setShowModal] = useState(false);
//   const visibleCategories = productCategories.slice(0, 5);
//   const remainingCategories = productCategories.slice(5);

//   return (
//     <>
//       <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-full">
//         {/* Header */}
//         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100" style={{ background: appConfig.colors.primary + "08" }}>
//           <div className="flex items-center gap-2">
//             <Grid3X3 size={16} style={{ color: appConfig.colors.primary }} />
//             <div>
//               <h2 className="text-sm font-black" style={{ color: appConfig.colors.primary }}>Categories</h2>
//               <p className="text-[10px] text-gray-400 leading-none">{productCategories.length} categories</p>
//             </div>
//           </div>
//           <button
//             onClick={() => setShowModal(true)}
//             className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
//             style={{ background: appConfig.colors.primary }}
//           >
//             See All
//           </button>
//         </div>

//         <div className="divide-y divide-gray-50">
//           {visibleCategories.map(cat => (
//             <CategoryItem key={cat.id} category={cat} onClose={() => {}} />
//           ))}
//         </div>

//         {/* Show more teaser */}
//         <button
//           onClick={() => setShowModal(true)}
//           className="w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-t border-gray-100 hover:bg-rose-50 transition-colors"
//           style={{ color: appConfig.colors.primary }}
//         >
//           +{remainingCategories.length} more categories <ChevronRight size={13} />
//         </button>
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
//             <div className="flex items-center justify-between px-5 py-4 border-b">
//               <div>
//                 <h2 className="text-lg font-black" style={{ color: appConfig.colors.primary }}>All Categories</h2>
//                 <p className="text-xs text-gray-400 mt-0.5">Browse {productCategories.length} product categories</p>
//               </div>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
//               >
//                 <X size={16} />
//               </button>
//             </div>
//             <div className="max-h-[70vh] overflow-y-auto">
//               {productCategories.map(cat => (   // ← Changed to show ALL in modal
//                 <CategoryItem 
//                   key={cat.id} 
//                   category={cat} 
//                   onClose={() => setShowModal(false)} 
//                 />
//               ))}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }








import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronUp, ChevronRight, X, Grid3X3 } from "lucide-react";
import { productCategories } from "../../categories/productCategories";
import appConfig from "../../config/appConfig";

const slugify = (text) => {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s&-]/g, "")
    .replace(/[\s&]+/g, "-")
    .replace(/-+/g, "-");
};

function CategoryRow({ category, isActive, onHover, onClick }) {
  return (
    <button
      onMouseEnter={onHover}
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 transition-colors group ${
        isActive ? "bg-rose-50" : "hover:bg-rose-50"
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0 transition-transform group-hover:scale-110"
          style={{ background: appConfig.colors.primary + "12" }}
        >
          {category.icon}
        </div>
        <div className="text-left min-w-0">
          <p
            className={`text-sm font-bold truncate transition-colors ${
              isActive ? "text-[#8B1E3F]" : "text-gray-800 group-hover:text-[#8B1E3F]"
            }`}
          >
            {category.name}
          </p>
          <p className="text-[10px] text-gray-400">
            {category.subcategories?.length || 0} subcategories
          </p>
        </div>
      </div>
      <ChevronRight
        size={15}
        className={isActive ? "" : "text-gray-400"}
        style={isActive ? { color: appConfig.colors.primary } : {}}
      />
    </button>
  );
}

function MobileCategoryItem({ category, onCategoryClick, onSubClick }) {
  const [isOpen, setIsOpen] = useState(false);
  const hasSubs = category.subcategories?.length > 0;

  return (
    <div className="border-b border-gray-50 last:border-0">
      <div className="w-full flex items-center justify-between px-4 py-3 hover:bg-rose-50 transition-colors group">
        <button onClick={onCategoryClick} className="flex items-center gap-3 min-w-0 flex-1 text-left">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
            style={{ background: appConfig.colors.primary + "12" }}
          >
            {category.icon}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-[#8B1E3F] transition-colors">
              {category.name}
            </p>
            <p className="text-[10px] text-gray-400">{category.subcategories?.length || 0} subcategories</p>
          </div>
        </button>
        {hasSubs && (
          <button onClick={() => setIsOpen((o) => !o)} className="p-2 flex-shrink-0">
            {isOpen ? (
              <ChevronUp size={15} style={{ color: appConfig.colors.primary }} />
            ) : (
              <ChevronDown size={15} className="text-gray-400" />
            )}
          </button>
        )}
      </div>

      {hasSubs && (
        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? "max-h-96" : "max-h-0"}`}>
          <div className="px-4 pb-3 grid grid-cols-1 gap-1">
            {category.subcategories.map((sub, i) => (
              <button
                key={i}
                onClick={() => onSubClick(sub)}
                className="flex items-center justify-between px-3 py-2 rounded-lg bg-gray-50 hover:bg-white hover:shadow-sm transition-all text-left group/sub"
              >
                <span className="text-xs font-semibold text-gray-600 group-hover/sub:text-[#8B1E3F] transition-colors">
                  {sub}
                </span>
                <ChevronRight
                  size={12}
                  className="opacity-0 group-hover/sub:opacity-100 transition-opacity flex-shrink-0"
                  style={{ color: appConfig.colors.primary }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function CategoryDropdown() {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const closeTimer = useRef(null);

  const visibleCategories = productCategories.slice(0, 5);
  const remainingCategories = productCategories.slice(5);
  const activeCategoryData = productCategories.find((c) => c.id === activeCategory);

  const goToCategory = (category) => {
    navigate(`/category/${slugify(category.name)}`);
    setActiveCategory(null);
    setShowModal(false);
  };

  const goToSubCategory = (category, sub) => {
    navigate(`/category/${slugify(category.name)}/${slugify(sub)}`);
    setActiveCategory(null);
    setShowModal(false);
  };

  const handleMouseEnter = (categoryId) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveCategory(categoryId);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setActiveCategory(null), 150);
  };

  return (
    <>
      <div className="relative" onMouseLeave={handleMouseLeave}>
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100 h-full">
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b border-gray-100"
            style={{ background: appConfig.colors.primary + "08" }}
          >
            <div className="flex items-center gap-2">
              <Grid3X3 size={16} style={{ color: appConfig.colors.primary }} />
              <div>
                <h2 className="text-sm font-black" style={{ color: appConfig.colors.primary }}>
                  Categories
                </h2>
                <p className="text-[10px] text-gray-400 leading-none">
                  {productCategories.length} categories
                </p>
              </div>
            </div>
            {/* <button
              onClick={() => setShowModal(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg text-white transition-opacity hover:opacity-90"
              style={{ background: appConfig.colors.primary }}
            >
              See All
            </button> */}
          </div>

          <div className="divide-y divide-gray-50">
            {visibleCategories.map((cat) => (
              <CategoryRow
                key={cat.id}
                category={cat}
                isActive={activeCategory === cat.id}
                onHover={() => handleMouseEnter(cat.id)}
                onClick={() => goToCategory(cat)}
              />
            ))}
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="w-full py-3 text-xs font-bold flex items-center justify-center gap-1.5 border-t border-gray-100 hover:bg-rose-50 transition-colors"
            style={{ color: appConfig.colors.primary }}
          >
            +{remainingCategories.length} more categories <ChevronRight size={13} />
          </button>
        </div>

        {/* Jumia-style flyout panel */}
        {activeCategoryData && activeCategoryData.subcategories?.length > 0 && (
          <div
            onMouseEnter={() => handleMouseEnter(activeCategoryData.id)}
            className="absolute top-0 left-full ml-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-[28rem] overflow-y-auto"
          >
            <div className="px-4 py-3 border-b border-gray-100 sticky top-0 bg-white">
              <p className="text-sm font-black" style={{ color: appConfig.colors.primary }}>
                {activeCategoryData.name}
              </p>
            </div>
            <div className="p-2">
              {activeCategoryData.subcategories.map((sub, i) => (
                <button
                  key={i}
                  onClick={() => goToSubCategory(activeCategoryData, sub)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-rose-50 transition-colors text-left group/sub"
                >
                  <span className="text-xs font-semibold text-gray-600 group-hover/sub:text-[#8B1E3F] transition-colors">
                    {sub}
                  </span>
                  <ChevronRight
                    size={12}
                    className="opacity-0 group-hover/sub:opacity-100 transition-opacity flex-shrink-0"
                    style={{ color: appConfig.colors.primary }}
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for "See All" / mobile */}
      {showModal && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b">
              <div>
                <h2 className="text-lg font-black" style={{ color: appConfig.colors.primary }}>
                  All Categories
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Browse {productCategories.length} product categories
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {productCategories.map((cat) => (
                <MobileCategoryItem
                  key={cat.id}
                  category={cat}
                  onCategoryClick={() => goToCategory(cat)}
                  onSubClick={(sub) => goToSubCategory(cat, sub)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}