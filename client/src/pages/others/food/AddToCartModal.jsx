// import { useEffect, useMemo, useState } from "react";
// import { Plus, Minus, ChevronDown } from "lucide-react";
// import ModalShell from "./ModalShell";
// import {
//   incrementCartItem,
//   decrementCartItem,
//   getCartQty,
//   getCartTotal,
// } from "../../../config/cartUtils";

// function Stepper({ qty, onAdd, onRemove, size = "md" }) {
//   const dims = size === "sm" ? "w-6 h-6" : "w-7 h-7";
//   const iconSize = size === "sm" ? 12 : 14;

//   if (qty === 0) {
//     return (
//       <button
//         onClick={onAdd}
//         className={`${dims} rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800`}
//         aria-label="Add"
//       >
//         <Plus size={iconSize} />
//       </button>
//     );
//   }

//   return (
//     <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1.5 py-1">
//       <button onClick={onRemove} className={`${dims} rounded-full bg-white flex items-center justify-center`} aria-label="Remove">
//         <Minus size={iconSize} />
//       </button>
//       <span className="w-4 text-center text-xs font-bold">{qty}</span>
//       <button onClick={onAdd} className={`${dims} rounded-full bg-gray-900 text-white flex items-center justify-center`} aria-label="Add">
//         <Plus size={iconSize} />
//       </button>
//     </div>
//   );
// }

// function VarietyRow({ product, variety }) {
//   const [qty, setQty] = useState(() => getCartQty(product._id, variety.name));

//   const add = () => {
//     incrementCartItem(product, variety);
//     setQty(getCartQty(product._id, variety.name));
//   };
//   const remove = () => {
//     decrementCartItem(product._id, variety.name);
//     setQty(getCartQty(product._id, variety.name));
//   };

//   return (
//     <div className="flex items-center gap-3">
//       <img
//         src={variety.image || product.images?.[0]?.url || "/placeholder-food.png"}
//         alt={variety.name}
//         className="w-14 h-14 rounded-xl object-cover shrink-0"
//       />
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-semibold text-gray-800 line-clamp-1">{variety.name}</p>
//         <p className="text-xs text-gray-500">₦{variety.price?.toLocaleString()}</p>
//       </div>
//       <Stepper qty={qty} onAdd={add} onRemove={remove} size="sm" />
//     </div>
//   );
// }

// function RelatedProductRow({ product }) {
//   const [qty, setQty] = useState(() => getCartQty(product._id));
//   const hasDiscount = product?.salePrice && product.salePrice < product.price;
//   const price = hasDiscount ? product.salePrice : product.price;

//   const add = () => {
//     incrementCartItem(product);
//     setQty(getCartQty(product._id));
//   };
//   const remove = () => {
//     decrementCartItem(product._id);
//     setQty(getCartQty(product._id));
//   };

//   return (
//     <div className="flex items-center gap-3">
//       <img
//         src={product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || "/placeholder-food.png"}
//         alt={product.name}
//         className="w-14 h-14 rounded-xl object-cover shrink-0"
//       />
//       <div className="flex-1 min-w-0">
//         <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
//         <p className="text-xs text-gray-500">₦{price?.toLocaleString()}</p>
//       </div>
//       <Stepper qty={qty} onAdd={add} onRemove={remove} size="sm" />
//     </div>
//   );
// }

// export default function AddToCartModal({ product, allProducts, onClose, onContinue }) {
//   const [baseQty, setBaseQty] = useState(() => Math.max(1, getCartQty(product._id)));
//   const [varietyOpen, setVarietyOpen] = useState(true);
//   const [cartTotal, setCartTotal] = useState(getCartTotal());

//   useEffect(() => {
//     // ensure a fresh product with no prior cart entry still shows qty 1 as the "about to add" amount
//     if (getCartQty(product._id) === 0) setBaseQty(1);
//     const handler = () => setCartTotal(getCartTotal());
//     window.addEventListener("cartUpdated", handler);
//     return () => window.removeEventListener("cartUpdated", handler);
//   }, [product._id]);

//   const primaryImage =
//     product?.images?.find((img) => img.isPrimary)?.url ||
//     product?.images?.[0]?.url ||
//     "/placeholder-food.png";

//   const hasDiscount = product?.salePrice && product.salePrice < product.price;
//   const basePrice = hasDiscount ? product.salePrice : product.price;

//   const relatedProducts = useMemo(
//     () =>
//       allProducts.filter(
//         (p) => p._id !== product._id && p.subCategory === product.subCategory
//       ),
//     [allProducts, product]
//   );

//   const handleBaseAdd = () => {
//     incrementCartItem(product);
//     setBaseQty(getCartQty(product._id));
//   };
//   const handleBaseRemove = () => {
//     decrementCartItem(product._id);
//     setBaseQty(Math.max(0, getCartQty(product._id)));
//   };

//   // guard: if the user never actually confirmed the base product (qty stayed 0
//   // because they only added varieties), make sure the base line is committed once
//   const handleContinue = () => {
//     if (getCartQty(product._id) === 0 && baseQty > 0) {
//       incrementCartItem(product); // commits the initial 1x shown on open
//     }
//     onContinue();
//   };

//   return (
//     <ModalShell
//       title="Add to cart"
//       onClose={onClose}
//       footer={
//         <div className="flex items-center justify-between gap-4">
//           <div>
//             <p className="text-xs text-gray-400">Total</p>
//             <p className="font-extrabold text-gray-900">₦{cartTotal.toLocaleString()}</p>
//           </div>
//           <button
//             onClick={handleContinue}
//             className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-2xl hover:bg-emerald-700 transition-colors"
//           >
//             Continue
//           </button>
//         </div>
//       }
//     >
//       <div className="p-5">
//         {/* selected product */}
//         <div className="flex items-center gap-4">
//           <img src={primaryImage} alt={product.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
//           <div className="flex-1 min-w-0">
//             <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
//             <p className="text-sm text-gray-500">₦{basePrice?.toLocaleString()} each</p>
//             <p className="text-sm font-semibold text-gray-900 mt-1">
//               Subtotal: ₦{(basePrice * baseQty).toLocaleString()}
//             </p>
//           </div>
//           <Stepper qty={baseQty} onAdd={handleBaseAdd} onRemove={handleBaseRemove} />
//         </div>

//         {/* varieties */}
//         {product?.varieties?.length > 0 && (
//           <div className="mt-6 border-t border-gray-100 pt-4">
//             <button
//               onClick={() => setVarietyOpen((o) => !o)}
//               className="w-full flex items-center justify-between"
//             >
//               <span className="font-bold text-gray-900">Varieties</span>
//               <ChevronDown className={`w-4 h-4 transition-transform ${varietyOpen ? "rotate-180" : ""}`} />
//             </button>
//             {varietyOpen && (
//               <div className="mt-3 space-y-3">
//                 {product.varieties.map((v) => (
//                   <VarietyRow key={v.name} product={product} variety={v} />
//                 ))}
//               </div>
//             )}
//           </div>
//         )}

//         {/* related items in same subcategory */}
//         {relatedProducts.length > 0 && (
//           <div className="mt-6 border-t border-gray-100 pt-4">
//             <span className="font-bold text-gray-900">More {product.subCategory}</span>
//             <div className="mt-3 space-y-3">
//               {relatedProducts.map((p) => (
//                 <RelatedProductRow key={p._id} product={p} />
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </ModalShell>
//   );
// }








import { useEffect, useMemo, useState } from "react";
import { Plus, Minus, ChevronDown } from "lucide-react";
import ModalShell from "./ModalShell";
import appConfig from "../../../config/appConfig";
import {
  incrementCartItem,
  decrementCartItem,
  getCartQty,
  getCartTotal,
} from "../../../config/cartUtils";

const PRIMARY = appConfig.colors.primary;

function Stepper({ qty, onAdd, onRemove, size = "md" }) {
  const dims = size === "sm" ? "w-6 h-6" : "w-7 h-7";
  const iconSize = size === "sm" ? 12 : 14;

  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        className={`${dims} rounded-full text-white flex items-center justify-center`}
        style={{ backgroundColor: PRIMARY }}
        aria-label="Add"
      >
        <Plus size={iconSize} />
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-1.5 py-1">
      <button onClick={onRemove} className={`${dims} rounded-full bg-white flex items-center justify-center`} aria-label="Remove">
        <Minus size={iconSize} />
      </button>
      <span className="w-4 text-center text-xs font-bold">{qty}</span>
      <button
        onClick={onAdd}
        className={`${dims} rounded-full text-white flex items-center justify-center`}
        style={{ backgroundColor: PRIMARY }}
        aria-label="Add"
      >
        <Plus size={iconSize} />
      </button>
    </div>
  );
}

function VarietyRow({ product, variety }) {
  const [qty, setQty] = useState(() => getCartQty(product._id, variety.name));

  const add = () => {
    incrementCartItem(product, variety);
    setQty(getCartQty(product._id, variety.name));
  };
  const remove = () => {
    decrementCartItem(product._id, variety.name);
    setQty(getCartQty(product._id, variety.name));
  };

  return (
    <div className="flex items-center gap-3">
      <img
        src={variety.image || product.images?.[0]?.url || "/placeholder-food.png"}
        alt={variety.name}
        className="w-14 h-14 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{variety.name}</p>
        <p className="text-xs text-gray-500">₦{variety.price?.toLocaleString()}</p>
      </div>
      <Stepper qty={qty} onAdd={add} onRemove={remove} size="sm" />
    </div>
  );
}

function RelatedProductRow({ product }) {
  const [qty, setQty] = useState(() => getCartQty(product._id));
  const hasDiscount = product?.salePrice && product.salePrice < product.price;
  const price = hasDiscount ? product.salePrice : product.price;

  const add = () => {
    incrementCartItem(product);
    setQty(getCartQty(product._id));
  };
  const remove = () => {
    decrementCartItem(product._id);
    setQty(getCartQty(product._id));
  };

  return (
    <div className="flex items-center gap-3">
      <img
        src={product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url || "/placeholder-food.png"}
        alt={product.name}
        className="w-14 h-14 rounded-xl object-cover shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{product.name}</p>
        <p className="text-xs text-gray-500">₦{price?.toLocaleString()}</p>
      </div>
      <Stepper qty={qty} onAdd={add} onRemove={remove} size="sm" />
    </div>
  );
}

const VARIETY_TYPES = ["All", "food", "drink", "package"];

export default function AddToCartModal({ product, allProducts, onClose, onContinue }) {
  const [baseQty, setBaseQty] = useState(() => Math.max(1, getCartQty(product._id)));
  const [varietyOpen, setVarietyOpen] = useState(true);
  const [varietyFilter, setVarietyFilter] = useState("All");
  const [cartTotal, setCartTotal] = useState(getCartTotal());

  useEffect(() => {
    if (getCartQty(product._id) === 0) setBaseQty(1);
    const handler = () => setCartTotal(getCartTotal());
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, [product._id]);

  const primaryImage =
    product?.images?.find((img) => img.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    "/placeholder-food.png";

  const hasDiscount = product?.salePrice && product.salePrice < product.price;
  const basePrice = hasDiscount ? product.salePrice : product.price;

  // only show filter tabs for types this product's varieties actually have
  const availableTypes = useMemo(() => {
    const types = new Set((product?.varieties || []).map((v) => v.type).filter(Boolean));
    return VARIETY_TYPES.filter((t) => t === "All" || types.has(t));
  }, [product?.varieties]);

  const filteredVarieties = useMemo(() => {
    if (!product?.varieties) return [];
    if (varietyFilter === "All") return product.varieties;
    return product.varieties.filter((v) => v.type === varietyFilter);
  }, [product?.varieties, varietyFilter]);

  const relatedProducts = useMemo(
    () =>
      allProducts.filter(
        (p) => p._id !== product._id && p.subCategory === product.subCategory
      ),
    [allProducts, product]
  );

  const handleBaseAdd = () => {
    incrementCartItem(product);
    setBaseQty(getCartQty(product._id));
  };
  const handleBaseRemove = () => {
    decrementCartItem(product._id);
    setBaseQty(Math.max(0, getCartQty(product._id)));
  };

  const handleContinue = () => {
    if (getCartQty(product._id) === 0 && baseQty > 0) {
      incrementCartItem(product);
    }
    onContinue();
  };

  return (
    <ModalShell
      title="Add to cart"
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-gray-400">Total</p>
            <p className="font-extrabold text-gray-900">₦{cartTotal.toLocaleString()}</p>
          </div>
          <button
            onClick={handleContinue}
            className="flex-1 text-white font-bold py-3 rounded-2xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            Continue
          </button>
        </div>
      }
    >
      <div className="p-5">
        {/* selected product */}
        <div className="flex items-center gap-4">
          <img src={primaryImage} alt={product.name} className="w-20 h-20 rounded-2xl object-cover shrink-0" />
          <div className="flex-1 min-w-0">
            <h4 className="font-bold text-gray-900 line-clamp-1">{product.name}</h4>
            <p className="text-sm text-gray-500">₦{basePrice?.toLocaleString()} each</p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              Subtotal: ₦{(basePrice * baseQty).toLocaleString()}
            </p>
          </div>
          <Stepper qty={baseQty} onAdd={handleBaseAdd} onRemove={handleBaseRemove} />
        </div>

        {/* varieties */}
        {product?.varieties?.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <button
              onClick={() => setVarietyOpen((o) => !o)}
              className="w-full flex items-center justify-between"
            >
              <span className="font-bold text-gray-900">Varieties</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${varietyOpen ? "rotate-180" : ""}`} />
            </button>

            {varietyOpen && (
              <>
                {/* type filter — only rendered if there's more than one type to choose from */}
                {availableTypes.length > 2 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                    {availableTypes.map((type) => {
                      const isActive = varietyFilter === type;
                      return (
                        <button
                          key={type}
                          onClick={() => setVarietyFilter(type)}
                          className="shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-colors"
                          style={
                            isActive
                              ? { backgroundColor: PRIMARY, color: "#fff", borderColor: PRIMARY }
                              : { backgroundColor: "transparent", color: "#6b7280", borderColor: "#e5e7eb" }
                          }
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="mt-3 space-y-3">
                  {filteredVarieties.length === 0 ? (
                    <p className="text-xs text-gray-400 py-2">No {varietyFilter} options for this item.</p>
                  ) : (
                    filteredVarieties.map((v) => (
                      <VarietyRow key={v.name} product={product} variety={v} />
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* related items in same subcategory */}
        {relatedProducts.length > 0 && (
          <div className="mt-6 border-t border-gray-100 pt-4">
            <span className="font-bold text-gray-900">More {product.subCategory}</span>
            <div className="mt-3 space-y-3">
              {relatedProducts.map((p) => (
                <RelatedProductRow key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </ModalShell>
  );
}