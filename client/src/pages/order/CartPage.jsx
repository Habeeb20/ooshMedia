// import { useState } from 'react';
// import {useCart} from "../../context/cartContext"
// import Autocomplete from 'react-google-autocomplete';
// import { useNavigate } from 'react-router-dom';
// import { Truck, Package, User, Users, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
// import { ArrowLeft } from "lucide-react";
// import { Link } from "react-router-dom";
// import appConfig from "../../config/appConfig";

// export default function CartPage() {
//   const { cart, cartTotal, updateItem, removeItem, updateFulfillment } = useCart();
//   const [deliveryAddress, setDeliveryAddress] = useState(cart?.delivery?.address || '');

// // Inside the component, after other state
//   const navigate = useNavigate();
// console.log(cart);
//   const fulfillmentType = cart?.fulfillmentType || 'delivery';
//   const pickup = cart?.pickup || { pickedUpBy: 'self' };
//   const paymentMethod = cart?.paymentMethod || 'online';

//     const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
//   const handleFulfillment = async (type) => {
//     await updateFulfillment({ fulfillmentType: type });
//   };

//   const handlePickupBy = async (by) => {
//     await updateFulfillment({ pickup: { ...pickup, pickedUpBy: by } });
//   };

//   const handleAgentInfo = async (field, value) => {
//     await updateFulfillment({ pickup: { ...pickup, [field]: value } });
//   };

//   const handleDeliveryAddress = async (address) => {
//     await updateFulfillment({ delivery: { address } });
//   };

//   const handlePaymentMethod = async (method) => {
//     await updateFulfillment({ paymentMethod: method });
//   };

//   if (!cart || cart.items?.length === 0) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
//         <ShoppingBag size={64} className="text-gray-300" />
//         <p className="text-xl font-semibold">Your cart is empty</p>
//         <button onClick={() => navigate('/marketplace')} className="px-6 py-2 bg-[#C44A6F text-black rounded-xl hover:bg-[#C44A6F">
//           Browse Products
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//         {/* Items List */}
//         <div className="lg:col-span-2 space-y-4">

//           {cart.items.map(item => (
//             <div key={item.product} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
//               <img
//                 src={item.image || '/placeholder.png'}
//                 alt={item.name}
//                 className="w-20 h-20 object-cover rounded-xl"
//               />
//               <div className="flex-1">
//                 <p className="font-semibold text-gray-800">{item.name}</p>
//                 <p className="text-black font-bold">₦{item.price.toLocaleString()}</p>
//                 <div className="flex items-center gap-3 mt-2">
//                   <button
//                     onClick={() => updateItem(item.product?._id, item.quantity - 1)}
//                     className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
//                   >
//                     <Minus size={14} />
//                   </button>
//                   <span className="font-semibold w-6 text-center">{item.quantity}</span>
//                   <button
//                     onClick={() => updateItem(item.product?._id, item.quantity + 1)}
//                     className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
//                   >
//                     <Plus size={14} />
//                   </button>
//                 </div>
//               </div>
//               <div className="flex flex-col justify-between items-end">
//                 <button onClick={() => removeItem(item.product)} className="text-red-400 hover:text-red-600">
//                   <Trash2 size={16} />
//                 </button>
//                 <p className="font-bold text-gray-800">₦{(item.price * item.quantity).toLocaleString()}</p>
//               </div>
//             </div>
//           ))}
        

//         <Link
//   to="/products"
//   className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 font-bold text-sm transition-all duration-200 hover:text-black hover:shadow-lg active:scale-95"
//   style={{
//     borderColor: appConfig.colors.primary,
//     color: appConfig.colors.primary,
//   }}
//   onMouseEnter={(e) => (e.currentTarget.style.background = appConfig.colors.primary, e.currentTarget.style.color= "white")}
//   onMouseLeave={(e) => (e.currentTarget.style.background = "transparent", e.currentTarget.style.color= appConfig.colors.primary)}
// >
//   <ArrowLeft
//     size={18}
//     className="transition-transform duration-200 group-hover:-translate-x-1"
//   />
//   Continue Shopping
// </Link>
//         </div>

     

//         {/* Checkout Options */}
//         <div className="space-y-4">

//           {/* Fulfillment Type */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm">
//             <h2 className="font-bold text-gray-800 mb-3">Fulfillment</h2>
//             <div className="grid grid-cols-2 gap-2">
//               <button
//                 onClick={() => handleFulfillment('delivery')}
//                 className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
//                   fulfillmentType === 'delivery'
//                     ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
//                     : 'border-gray-200 text-gray-500'
//                 }`}
//               >
//                 <Truck size={22} />
//                 <span className="text-sm font-medium">Delivery</span>
//               </button>
//               <button
//                 onClick={() => handleFulfillment('pickup')}
//                 className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
//                   fulfillmentType === 'pickup'
//                     ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
//                     : 'border-gray-200 text-gray-500'
//                 }`}
//               >
//                 <Package size={22} />
//                 <span className="text-sm font-medium">Pick Up</span>
//               </button>
//             </div>

//             {/* Delivery Address */}
//             {fulfillmentType === 'delivery' && (
//               <div className="mt-3">
//                 <label className="text-sm text-gray-600 font-medium">Delivery Address</label>
// {/* <Autocomplete
//       apiKey={mapsApiKey}
//       onPlaceSelected={(place) => {
//         if (place?.formatted_address) {
//           handleDeliveryAddress(place.formatted_address);
//         }
//       }}
//       options={{
//         types: ['geocode'],
//         componentRestrictions: { country: 'ng' },
//       }}
//       defaultValue={cart.delivery?.address || ''}
//       className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//       placeholder="Enter your delivery address"
//     /> */}
//                 <input
//                   defaultValue={cart.delivery?.address}
//                   onBlur={e => handleDeliveryAddress(e.target.value)}
//                   placeholder="Enter your delivery address"
//                   className="w-full mt-1 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                 />
//                 <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
//                   A 4-digit delivery code will be sent to you. Provide it to the rider upon delivery.
//                 </p>
//               </div>
//             )}

//             {/* Pickup Options */}
//             {fulfillmentType === 'pickup' && (
//               <div className="mt-3 space-y-3">
//                 <label className="text-sm text-gray-600 font-medium">Picked up by</label>
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     onClick={() => handlePickupBy('self')}
//                     className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-sm transition-all ${
//                       pickup.pickedUpBy === 'self'
//                         ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
//                         : 'border-gray-200 text-gray-500'
//                     }`}
//                   >
//                     <User size={18} />
//                     Self
//                   </button>
//                   <button
//                     onClick={() => handlePickupBy('agent')}
//                     className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-sm transition-all ${
//                       pickup.pickedUpBy === 'agent'
//                         ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
//                         : 'border-gray-200 text-gray-500'
//                     }`}
//                   >
//                     <Users size={18} />
//                     Someone else
//                   </button>
//                 </div>
//                 {pickup.pickedUpBy === 'agent' && (
//                   <div className="space-y-2">
//                     <input
//                       defaultValue={pickup.agentName}
//                       onBlur={e => handleAgentInfo('agentName', e.target.value)}
//                       placeholder="Agent's name"
//                       className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                     />
//                     <input
//                       defaultValue={pickup.agentPhone}
//                       onBlur={e => handleAgentInfo('agentPhone', e.target.value)}
//                       placeholder="Agent's phone number"
//                       className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//                     />
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Payment Method */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm">
//             <h2 className="font-bold text-gray-800 mb-3">Payment</h2>
//             <div className="space-y-2">
//               <button
//                 onClick={() => handlePaymentMethod('online')}
//                 className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
//                   paymentMethod === 'online'
//                     ? 'border-[#8B1E3F] bg-[#C44A6F text-black font-semibold'
//                     : 'border-gray-200 text-gray-600'
//                 }`}
//               >
//                 💳 Pay Online (Paystack)
//               </button>
//               <button
//                 onClick={() => handlePaymentMethod('on_delivery')}
//                 className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
//                   paymentMethod === 'on_delivery'
//                     ? 'border-[#8B1E3F] bg-[#C44A6F text-black font-semibold'
//                     : 'border-gray-200 text-gray-600'
//                 }`}
//               >
//                 💰 Pay on Delivery
//               </button>
//             </div>
//           </div>

//           {/* Summary */}
//           <div className="bg-white rounded-2xl p-5 shadow-sm">
//             <div className="flex justify-between text-gray-600 text-sm mb-1">
//               <span>Subtotal</span>
//               <span>₦{cartTotal?.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between font-bold text-gray-800 text-lg border-t pt-2">
//               <span>Total</span>
//               <span>₦{cartTotal?.toLocaleString()}</span>
//             </div>
//             <button
//               onClick={() => navigate('/checkout')}
//               className="w-full mt-4 bg-[#C44A6F text-black py-3 rounded-xl font-semibold hover:bg-[#C44A6F transition-all"
//             >
//               Proceed to Checkout
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }





import { useState, useEffect } from 'react';
import { useCart } from "../../context/cartContext";
import { usePlacesWidget } from 'react-google-autocomplete';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Package, User, Users, Minus, Plus, Trash2, ShoppingBag, ArrowLeft, MapPin } from 'lucide-react';
import appConfig from "../../config/appConfig";

const RECENT_ADDRESSES_KEY = 'recentDeliveryAddresses';
const MAX_RECENT_ADDRESSES = 5;

// --- localStorage helpers (client-side cache, avoids re-querying Google for known addresses) ---
function getRecentAddresses() {
  try {
    const raw = localStorage.getItem(RECENT_ADDRESSES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveRecentAddress(address) {
  try {
    const existing = getRecentAddresses();
    // dedupe by formatted_address, most recent first
    const deduped = [address, ...existing.filter(a => a.formatted_address !== address.formatted_address)];
    const capped = deduped.slice(0, MAX_RECENT_ADDRESSES);
    localStorage.setItem(RECENT_ADDRESSES_KEY, JSON.stringify(capped));
    return capped;
  } catch {
    return getRecentAddresses();
  }
}

export default function CartPage() {
  const { cart, cartTotal, updateItem, removeItem, updateFulfillment } = useCart();
  const navigate = useNavigate();

  const fulfillmentType = cart?.fulfillmentType || 'delivery';
  const pickup = cart?.pickup || { pickedUpBy: 'self' };
  const paymentMethod = cart?.paymentMethod || 'online';

  const mapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const [recentAddresses, setRecentAddresses] = useState([]);

  useEffect(() => {
    setRecentAddresses(getRecentAddresses());
  }, []);

  const handleFulfillment = async (type) => {
    await updateFulfillment({ fulfillmentType: type });
  };

  const handlePickupBy = async (by) => {
    await updateFulfillment({ pickup: { ...pickup, pickedUpBy: by } });
  };

  const handleAgentInfo = async (field, value) => {
    await updateFulfillment({ pickup: { ...pickup, [field]: value } });
  };

  const handleDeliveryAddress = async (formatted_address, lat, lng) => {
    await updateFulfillment({ delivery: { address: formatted_address, lat, lng } });
  };

  const handlePaymentMethod = async (method) => {
    await updateFulfillment({ paymentMethod: method });
  };

  // Attaches Google Places Autocomplete to a plain <input> via ref — avoids
  // rendering react-google-autocomplete's own component, which is what was
  // throwing "Element type is invalid" in some bundler setups.
  const { ref: addressInputRef } = usePlacesWidget({
    apiKey: mapsApiKey,
    onPlaceSelected: (place) => {
      const formatted_address = place?.formatted_address;
      if (!formatted_address) return;

      const lat = place.geometry?.location?.lat?.();
      const lng = place.geometry?.location?.lng?.();

      handleDeliveryAddress(formatted_address, lat, lng);
      setRecentAddresses(saveRecentAddress({ formatted_address, lat, lng }));
    },
    options: {
      types: ['geocode'],
      componentRestrictions: { country: 'ng' },
    },
  });

  if (!cart || cart.items?.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-gray-500">
        <ShoppingBag size={64} className="text-gray-300" />
        <p className="text-xl font-semibold">Your cart is empty</p>
          <button onClick={() => navigate('/products')} className="px-6 py-2 bg-[#C44A6F text-black rounded-xl hover:bg-[#C44A6F">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Cart</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">

          {cart.items.map((item, idx) => {
            const productId = item.product?._id || item.product;
            return (
              <div key={`${productId}-${idx}`} className="bg-white rounded-2xl p-4 flex gap-4 shadow-sm">
                <img
                  src={item.image || '/placeholder.png'}
                  alt={item.name}
                  className="w-20 h-20 object-cover rounded-xl"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">{item.name}</p>
                  <p className="text-black font-bold">₦{item.price.toLocaleString()}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => updateItem(productId, item.quantity - 1)}
                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="font-semibold w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(productId, item.quantity + 1)}
                      className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-col justify-between items-end">
                  <button onClick={() => removeItem(productId)} className="text-red-400 hover:text-red-600">
                    <Trash2 size={16} />
                  </button>
                  <p className="font-bold text-gray-800">₦{(item.price * item.quantity).toLocaleString()}</p>
                </div>
              </div>
            );
          })}

          <Link
            to="/products"
            className="group inline-flex items-center gap-2 px-6 py-3 rounded-full border-1 font-bold text-sm transition-all duration-200 hover:text-black hover:shadow-lg active:scale-95"
            style={{
              borderColor: appConfig.colors.primary,
              color: appConfig.colors.primary,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = appConfig.colors.primary; e.currentTarget.style.color = "white"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = appConfig.colors.primary; }}
          >
            <ArrowLeft size={18} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Continue Shopping
          </Link>
        </div>

        {/* Checkout Options */}
        <div className="space-y-4">

          {/* Fulfillment Type */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Fulfillment</h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleFulfillment('delivery')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  fulfillmentType === 'delivery'
                    ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Truck size={22} />
                <span className="text-sm font-medium">Delivery</span>
              </button>
              <button
                onClick={() => handleFulfillment('pickup')}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                  fulfillmentType === 'pickup'
                    ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
                    : 'border-gray-200 text-gray-500'
                }`}
              >
                <Package size={22} />
                <span className="text-sm font-medium">Pick Up</span>
              </button>
            </div>

            {/* Delivery Address */}
            {fulfillmentType === 'delivery' && (
              <div className="mt-3">
                <label className="text-sm text-gray-600 font-medium">Delivery Address</label>

                <input
                  ref={addressInputRef}
                  defaultValue={cart.delivery?.address || ''}
                  placeholder="Enter your delivery address"
                  className="w-full mt-1 p-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />

                {/* Cached recent addresses — picking one skips a new Google Places lookup */}
                {recentAddresses.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recentAddresses.map((addr) => (
                      <button
                        key={addr.formatted_address}
                        type="button"
                        onClick={() => {
                          handleDeliveryAddress(addr.formatted_address, addr.lat, addr.lng);
                          if (addressInputRef.current) {
                            addressInputRef.current.value = addr.formatted_address;
                          }
                        }}
                        className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-[#C44A6F hover:text-black text-gray-600 px-2.5 py-1.5 rounded-full transition-all"
                      >
                        <MapPin size={12} />
                        <span className="max-w-[160px] truncate">{addr.formatted_address}</span>
                      </button>
                    ))}
                  </div>
                )}

                <p className="mt-2 text-xs text-amber-600 bg-amber-50 rounded-lg p-2">
                  A 4-digit delivery code will be sent to you. Provide it to the rider upon delivery.
                </p>
              </div>
            )}

            {/* Pickup Options */}
            {fulfillmentType === 'pickup' && (
              <div className="mt-3 space-y-3">
                <label className="text-sm text-gray-600 font-medium">Picked up by</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handlePickupBy('self')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-sm transition-all ${
                      pickup.pickedUpBy === 'self'
                        ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <User size={18} />
                    Self
                  </button>
                  <button
                    onClick={() => handlePickupBy('agent')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 text-sm transition-all ${
                      pickup.pickedUpBy === 'agent'
                        ? 'border-[#8B1E3F] bg-[#C44A6F text-black'
                        : 'border-gray-200 text-gray-500'
                    }`}
                  >
                    <Users size={18} />
                    Someone else
                  </button>
                </div>
                {pickup.pickedUpBy === 'agent' && (
                  <div className="space-y-2">
                    <input
                      defaultValue={pickup.agentName}
                      onBlur={e => handleAgentInfo('agentName', e.target.value)}
                      placeholder="Agent's name"
                      className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                    <input
                      defaultValue={pickup.agentPhone}
                      onBlur={e => handleAgentInfo('agentPhone', e.target.value)}
                      placeholder="Agent's phone number"
                      className="w-full border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-800 mb-3">Payment</h2>
            <div className="space-y-2">
              <button
                onClick={() => handlePaymentMethod('online')}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                  paymentMethod === 'online'
                    ? 'border-[#8B1E3F]  text-black font-semibold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                💳 Pay Online (Paystack)
              </button>
              <button
                onClick={() => handlePaymentMethod('on_delivery')}
                className={`w-full text-left p-3 rounded-xl border-2 text-sm transition-all ${
                  paymentMethod === 'on_delivery'
                    ? 'border-[#8B1E3F]  text-black font-semibold'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                💰 Pay on Delivery
              </button>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="flex justify-between text-gray-600 text-sm mb-1">
              <span>Subtotal</span>
              <span>₦{cartTotal?.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-lg border-t pt-2">
              <span>Total</span>
              <span>₦{cartTotal?.toLocaleString()}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full mt-4 bg-[#A6224A] text-white py-3 rounded-xl font-semibold hover:bg-[#C44A6F] transition-all"
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}