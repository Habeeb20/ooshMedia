// import { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import {
//   Factory, Warehouse, Store, Truck, UserCheck, Sprout, Users,
//   Loader2, MapPin, ShieldCheck, Star, Eye, Heart,
// } from 'lucide-react';

// const SELLER_TYPES = [
//   { value: 'all', label: 'All', icon: Users },
//   { value: 'manufacturer', label: 'Manufacturers', icon: Factory },
//   { value: 'wholesaler', label: 'Wholesalers', icon: Warehouse },
//   { value: 'distributor', label: 'Distributors', icon: Truck },
//   { value: 'retailer', label: 'Retailers', icon: Store },
//   { value: 'agent', label: 'Agents', icon: UserCheck },
//   { value: 'farmer', label: 'Farmers', icon: Sprout },
// ];

// export default function SellersByType() {
//   const { type = 'all' } = useParams();
//   const navigate = useNavigate();
//   const backendUrl = import.meta.env.VITE_BACKEND_URL;

//   const [sellers, setSellers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const controller = new AbortController();
//     setLoading(true);
//     fetch(`${backendUrl}/api/seller/all`, { signal: controller.signal })
//       .then((r) => r.json())
//       .then((d) => {
//         if (d.success) setSellers(d.sellers || []);
//         else setError(d.message || 'Failed to load sellers');
//       })
//       .catch((e) => {
//         if (e.name !== 'AbortError') setError('Something went wrong while loading sellers');
//       })
//       .finally(() => setLoading(false));
//     return () => controller.abort();
//   }, [backendUrl]);

//   const filtered =
//     type === 'all'
//       ? sellers
//       : sellers.filter((s) => s.sellerProfile?.sellerTypes?.includes(type));

//   const countFor = (t) =>
//     t === 'all' ? sellers.length : sellers.filter((s) => s.sellerProfile?.sellerTypes?.includes(t)).length;

//   const activeMeta = SELLER_TYPES.find((t) => t.value === type) || SELLER_TYPES[0];

//   return (
//     <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="inline-flex items-center gap-3 bg-rose-900 text-white px-6 py-3 rounded-2xl mb-4">
//             <activeMeta.icon className="w-6 h-6" />
//             <h1 className="text-2xl font-semibold">{activeMeta.label}</h1>
//           </div>
//           <p className="text-gray-600">
//             {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'seller' : 'sellers'} found`}
//           </p>
//         </div>

//         {/* Filter nav */}
//         <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
//           {SELLER_TYPES.map(({ value, label, icon: Icon }) => {
//             const active = type === value;
//             return (
//               <button
//                 key={value}
//                 onClick={() => navigate(`/sellers/type/${value}`)}
//                 className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
//                   active
//                     ? 'bg-rose-900 text-white shadow'
//                     : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-200 hover:text-rose-900'
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 {label}
//                 <span
//                   className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
//                     active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
//                   }`}
//                 >
//                   {countFor(value)}
//                 </span>
//               </button>
//             );
//           })}
//         </div>

//         {error && <div className="bg-red-50 text-red-900 p-4 rounded-2xl mb-8 text-center">{error}</div>}

//         {loading ? (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {Array.from({ length: 6 }).map((_, i) => (
//               <div key={i} className="h-56 rounded-3xl bg-gray-200 animate-pulse" />
//             ))}
//           </div>
//         ) : filtered.length === 0 ? (
//           <div className="text-center py-20 text-gray-400">
//             No {type === 'all' ? '' : activeMeta.label.toLowerCase()} sellers found yet.
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//             {filtered.map((seller) => (
//               <SellerCard key={seller._id} seller={seller} onClick={() => navigate(`/sellerstypepage/${seller._id}`)} />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function SellerCard({ seller, onClick }) {
//   const bp = seller.businessProfile || {};
//   const sp = seller.sellerProfile || {};

//   return (
//     <button
//       onClick={onClick}
//       className="bg-white rounded-3xl shadow hover:shadow-xl transition-all p-6 text-left group"
//     >
//       <div className="flex items-center gap-3 mb-4">
//         <img
//           src={seller.profilePicture || 'https://via.placeholder.com/56'}
//           alt={bp.businessName}
//           className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
//         />
//         <div className="min-w-0 flex-1">
//           <div className="flex items-center gap-1.5">
//             <h3 className="font-semibold text-gray-900 truncate">
//               {bp.businessName || sp.shopName || seller.username}
//             </h3>
//             {bp.verified && <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
//           </div>
//           {(seller.state || seller.lga) && (
//             <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
//               <MapPin className="w-3 h-3" />
//               {seller.state}
//               {seller.lga ? `, ${seller.lga}` : ''}
//             </p>
//           )}
//         </div>
//       </div>

//       {sp.sellerTypes?.length > 0 && (
//         <div className="flex flex-wrap gap-1.5 mb-3">
//           {sp.sellerTypes.map((t) => (
//             <span key={t} className="text-[10px] font-medium capitalize bg-rose-50 text-rose-900 px-2.5 py-1 rounded-full">
//               {t}
//             </span>
//           ))}
//         </div>
//       )}

//       {bp.shopDescription && (
//         <p className="text-sm text-gray-500 line-clamp-2 mb-4">{bp.shopDescription}</p>
//       )}

//       <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
//         <span className="flex items-center gap-1">
//           <Eye className="w-3.5 h-3.5" /> {bp.views || 0}
//         </span>
//         <span className="flex items-center gap-1">
//           <Heart className="w-3.5 h-3.5" /> {bp.likes || 0}
//         </span>
//         <span className="flex items-center gap-1">
//           <Star className="w-3.5 h-3.5" />
//           {bp.reviews?.length ? (bp.reviews.reduce((s, r) => s + r.rating, 0) / bp.reviews.length).toFixed(1) : '—'}
//         </span>
//         {bp.yearsInBusiness ? <span>{bp.yearsInBusiness}y in business</span> : null}
//       </div>
//     </button>
//   );
// }



import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Factory, Warehouse, Store, Truck, UserCheck, Sprout, Users,
  MapPin, ShieldCheck, Star, Eye, Heart, Globe2,
} from 'lucide-react';
import { statesAndLgas } from '../../../stateAndLga';


const SELLER_TYPES = [
  { value: 'all', label: 'All', icon: Users },
  { value: 'manufacturer', label: 'Manufacturers', icon: Factory },
  { value: 'wholesaler', label: 'Wholesalers', icon: Warehouse },
  { value: 'distributor', label: 'Distributors', icon: Truck },
  { value: 'retailer', label: 'Retailers', icon: Store },
  { value: 'agent', label: 'Agents', icon: UserCheck },
  { value: 'farmer', label: 'Farmers', icon: Sprout },
];

// ['Abia', 'Adamawa', ...] derived straight from your data file
const STATES = Object.keys(statesAndLgas);

export default function SellersByType() {
  const { type = 'all' } = useParams();
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // State filter lives in the query string (?state=Lagos) so it can be
  // combined freely with the :type route param without adding more routes.
  const [searchParams, setSearchParams] = useSearchParams();
  const state = searchParams.get('state') || 'all';

  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(`${backendUrl}/api/seller/all`, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setSellers(d.sellers || []);
        else setError(d.message || 'Failed to load sellers');
      })
      .catch((e) => {
        if (e.name !== 'AbortError') setError('Something went wrong while loading sellers');
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [backendUrl]);

  const matchesType = (s, t) => t === 'all' || s.sellerProfile?.sellerTypes?.includes(t);
  const matchesState = (s, st) => st === 'all' || s.state === st;

  const filtered = useMemo(
    () => sellers.filter((s) => matchesType(s, type) && matchesState(s, state)),
    [sellers, type, state]
  );

  // Type counts respect the currently selected state, and vice versa,
  // so the numbers on each pill always reflect "if I click this, how many
  // sellers will I see given my other active filter?"
  const countForType = (t) => sellers.filter((s) => matchesType(s, t) && matchesState(s, state)).length;
  const countForState = (st) => sellers.filter((s) => matchesType(s, type) && matchesState(s, st)).length;

  const activeMeta = SELLER_TYPES.find((t) => t.value === type) || SELLER_TYPES[0];

  const goToType = (value) => navigate(`/sellers/type/${value}${state !== 'all' ? `?state=${state}` : ''}`);

  const goToState = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value === 'all') next.delete('state');
    else next.set('state', value);
    setSearchParams(next);
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 bg-rose-900 text-white px-6 py-3 rounded-2xl mb-4">
            <activeMeta.icon className="w-6 h-6" />
            <h1 className="text-2xl font-semibold">{activeMeta.label}</h1>
            {state !== 'all' && (
              <>
                <span className="w-px h-5 bg-white/30" />
                <MapPin className="w-5 h-5" />
                <span className="text-lg font-medium">{state}</span>
              </>
            )}
          </div>
          <p className="text-gray-600">
            {loading ? 'Loading…' : `${filtered.length} ${filtered.length === 1 ? 'seller' : 'sellers'} found`}
          </p>
        </div>

        {/* Seller type filter nav */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 no-scrollbar">
          {SELLER_TYPES.map(({ value, label, icon: Icon }) => {
            const active = type === value;
            return (
              <button
                key={value}
                onClick={() => goToType(value)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-rose-900 text-white shadow'
                    : 'bg-white text-gray-700 border border-gray-200 hover:border-rose-200 hover:text-rose-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
                <span
                  className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/20' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {countForType(value)}
                </span>
              </button>
            );
          })}
        </div>

        {/* State filter nav */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 no-scrollbar">
          <button
            onClick={() => goToState('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              state === 'all'
                ? 'bg-rose-900/10 text-rose-900 ring-1 ring-rose-900/30'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-200 hover:text-rose-900'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            All States
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              state === 'all' ? 'bg-rose-900/10' : 'bg-gray-100 text-gray-500'
            }`}>
              {countForState('all')}
            </span>
          </button>

          {STATES.map((st) => {
            const active = state === st;
            const count = countForState(st);
            if (count === 0 && !active) return null; // hide empty states from clutter
            return (
              <button
                key={st}
                onClick={() => goToState(st)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                  active
                    ? 'bg-rose-900/10 text-rose-900 ring-1 ring-rose-900/30'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-200 hover:text-rose-900'
                }`}
              >
                {st}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-rose-900/10' : 'bg-gray-100 text-gray-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {error && <div className="bg-red-50 text-red-900 p-4 rounded-2xl mb-8 text-center">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-56 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            No {type === 'all' ? '' : activeMeta.label.toLowerCase()} sellers found
            {state !== 'all' ? ` in ${state}` : ''} yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((seller) => (
              <SellerCard key={seller._id} seller={seller} onClick={() => navigate(`/sellerstypepage/${seller._id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SellerCard({ seller, onClick }) {
  const bp = seller.businessProfile || {};
  const sp = seller.sellerProfile || {};

  return (
    <button
      onClick={onClick}
      className="bg-white rounded-3xl shadow hover:shadow-xl transition-all p-6 text-left group"
    >
      <div className="flex items-center gap-3 mb-4">
        <img
          src={seller.profilePicture || 'https://via.placeholder.com/56'}
          alt={bp.businessName}
          className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-gray-900 truncate">
              {bp.businessName || sp.shopName || seller.username}
            </h3>
            {bp.verified && <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
          </div>
          {(seller.state || seller.lga) && (
            <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {seller.state}
              {seller.lga ? `, ${seller.lga}` : ''}
            </p>
          )}
        </div>
      </div>

      {sp.sellerTypes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {sp.sellerTypes.map((t) => (
            <span key={t} className="text-[10px] font-medium capitalize bg-rose-50 text-rose-900 px-2.5 py-1 rounded-full">
              {t}
            </span>
          ))}
        </div>
      )}

      {bp.shopDescription && (
        <p className="text-sm text-gray-500 line-clamp-2 mb-4">{bp.shopDescription}</p>
      )}

      <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
        <span className="flex items-center gap-1">
          <Eye className="w-3.5 h-3.5" /> {bp.views || 0}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" /> {bp.likes || 0}
        </span>
        <span className="flex items-center gap-1">
          <Star className="w-3.5 h-3.5" />
          {bp.reviews?.length ? (bp.reviews.reduce((s, r) => s + r.rating, 0) / bp.reviews.length).toFixed(1) : '—'}
        </span>
        {bp.yearsInBusiness ? <span>{bp.yearsInBusiness}y in business</span> : null}
      </div>
    </button>
  );
}