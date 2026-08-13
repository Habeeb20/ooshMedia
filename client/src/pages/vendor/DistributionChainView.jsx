







// import React, { useState, useEffect, useCallback } from 'react';
// import { 
//   Users, ArrowRight, ArrowLeft, Star, MapPin, 
//   Phone, Mail, Loader2, Package, Building2, 
//   ChevronDown, ChevronUp, Link as LinkIcon 
// } from 'lucide-react';
// import { useNavigate } from 'react-router-dom';

// const DistributionChainView = () => {
//   const [searchQuery, setSearchQuery] = useState('');
//   const [searchType, setSearchType] = useState('seller');
//   const [data, setData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const backendUrl = import.meta.env.VITE_BACKEND_URL;
//   const navigate = useNavigate();

//   const fetchDistributionChain = useCallback(async () => {
//     if (!searchQuery.trim()) return;

//     setLoading(true);
//     setError('');

//     try {
//       const response = await fetch(
//         `${backendUrl}/api/chain/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`
//       );
//       const result = await response.json();

//       if (!response.ok) throw new Error(result.message || 'Failed to fetch data');

//       setData(result.data);
//     } catch (err) {
//       setError(err.message);
//       setData(null);
//     } finally {
//       setLoading(false);
//     }
//   }, [searchQuery, searchType, backendUrl]);

//   useEffect(() => {
//     const timeoutId = setTimeout(() => {
//       if (searchQuery.trim().length > 2) fetchDistributionChain();
//     }, 500);
//     return () => clearTimeout(timeoutId);
//   }, [searchQuery, searchType, fetchDistributionChain]);

//   return (
//     <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Header */}
//         <div className="text-center mb-10">
//           <div className="inline-flex items-center gap-3 bg-rose-900 text-white px-6 py-3 rounded-2xl mb-4">
//             <Users className="w-7 h-7" />
//             <h1 className="text-3xl font-semibold">Distribution Chain Explorer</h1>
//           </div>
//           <p className="text-gray-600">Discover multi-level business networks and supply relationships</p>
//         </div>

//         {/* Search Bar */}
//         <div className="bg-white rounded-3xl shadow p-6 mb-12">
//           <div className="flex flex-col md:flex-row gap-4">
//             <input
//               type="text"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search seller, business name, email or product..."
//               className="flex-1 px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-rose-900 text-base"
//             />

//             <div className="flex gap-2">
//               <button onClick={() => setSearchType('seller')} className={`px-6 py-3.5 rounded-2xl font-medium transition-all ${searchType === 'seller' ? 'bg-rose-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
//                 Seller
//               </button>
//               <button onClick={() => setSearchType('product')} className={`px-6 py-3.5 rounded-2xl font-medium transition-all ${searchType === 'product' ? 'bg-rose-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
//                 Product
//               </button>
//             </div>

//             <button onClick={fetchDistributionChain} disabled={loading || !searchQuery.trim()} className="px-8 bg-rose-900 hover:bg-rose-900 text-white font-medium rounded-2xl transition-all disabled:opacity-60">
//               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
//             </button>
//           </div>
//         </div>

//         {error && <div className="bg-red-50 text-red-900 p-4 rounded-2xl mb-8 text-center">{error}</div>}

//         {loading && <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-rose-900" /></div>}

//         {/* Results */}
//         {data && !loading && (
//           <>
//                {/* ==================== PRODUCT SEARCH ==================== */}
//             {searchType === 'product' && data.products?.length > 0 && (
//               <div>
//                 <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//                   <Package className="text-rose-900" /> Products Found
//                 </h2>

//                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
//                   {data.products.map((product) => (
//                     <div
//                       key={product._id}
//                       onClick={() => navigate(`/product/${product._id}`)}
//                       className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition-all cursor-pointer group"
//                     >
//                       <img
//                         src={product.images?.[0]?.url || "https://via.placeholder.com/400x300"}
//                         alt={product.name}
//                         className="w-full h-52 object-cover group-hover:scale-105 transition-transform"
//                       />
//                       <div className="p-5">
//                         <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
//                         <p className="text-emerald-600 font-bold text-xl mb-2">₦{product.price?.toLocaleString()}</p>
//                         <p className="text-gray-600 text-sm line-clamp-3 mb-4">{product.description}</p>
//                         <div className="flex justify-between text-xs text-gray-500">
//                           <span>{product.category}</span>
//                           <span>Stock: {product.stockQuantity}</span>
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Sellers Section */}
//                 {data.sellers?.length > 0 && (
//                   <div>
//                     <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
//                       <Building2 className="text-rose-900" /> Sellers Offering These Products
//                     </h2>
//                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                       {data.sellers.map((seller) => (
//                         <>
//                           <SellerFullCard key={seller._id} seller={seller} />
//   <div className="mt-16">
//                   <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
//                     Supply Chain Network
//                     <span className="text-sm font-normal text-gray-500">(Multi-level)</span>
//                   </h3>

//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     {/* Upstream Tree */}
//                     <ChainTree 
//                       title="Upstream Suppliers" 
//                       icon={<ArrowLeft className="text-red-900" />} 
//                       data={seller.upstream} 
//                       type="upstream" 
//                     />

//                     {/* Downstream Tree */}
//                     <ChainTree 
//                       title="Downstream Partners" 
//                       icon={<ArrowRight className="text-emerald-500" />} 
//                       data={seller.downstream} 
//                       type="downstream" 
//                     />
//                   </div>
//                 </div>

//                         </>
                      
//                       ))}

                      
//                     </div>
                    



                    
//                   </div>
//                 )}
//               </div>
//             )}

//             {/* SELLER SEARCH - WITH NESTED TREE */}
//             {searchType === 'seller' && data.mainSeller && (
//               <>
//                 <SellerFullCard seller={data.mainSeller} isMain />

//                 <div className="mt-16">
//                   <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
//                     Supply Chain Network
//                     <span className="text-sm font-normal text-gray-500">(Multi-level)</span>
//                   </h3>

//                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//                     {/* Upstream Tree */}
//                     <ChainTree 
//                       title="Upstream Suppliers" 
//                       icon={<ArrowLeft className="text-red-900" />} 
//                       data={data.upstream} 
//                       type="upstream" 
//                     />

//                     {/* Downstream Tree */}
//                     <ChainTree 
//                       title="Downstream Partners" 
//                       icon={<ArrowRight className="text-emerald-500" />} 
//                       data={data.downstream} 
//                       type="downstream" 
//                     />
//                   </div>
//                 </div>
//               </>
//             )}
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// /* ====================== RECURSIVE CHAIN TREE COMPONENT ====================== */
// // const ChainTree = ({ title, icon, data, type }) => {
// //   const [expanded, setExpanded] = useState(true);

// //   return (
// //     <div className="bg-white rounded-3xl p-6 shadow-lg">
// //       <div className="flex items-center justify-between mb-6">
// //         <div className="flex items-center gap-3">
// //           {icon}
// //           <h4 className="font-semibold text-lg">{title}</h4>
// //         </div>
// //         <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-700">
// //           {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
// //         </button>
// //       </div>

// //       {expanded && (
// //         <div className="space-y-3">
// //           {data?.length > 0 ? (
// //             data.map((seller, index) => (
// //               <RecursiveSellerNode 
// //                 key={index} 
// //                 seller={seller} 
// //                 type={type} 
// //                 level={1} 
// //               />
// //             ))
// //           ) : (
// //             <p className="text-gray-400 py-12 text-center">No {type} partners found</p>
// //           )}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };


// /* ====================== RECURSIVE CHAIN TREE COMPONENT ====================== */
// const ChainTree = ({ title, icon, data, type }) => {
//   const [expanded, setExpanded] = useState(true);
//   const [showAll, setShowAll] = useState(false);

//   const visibleData = showAll ? data : data?.slice(0, 3);
//   const hasMore = data?.length > 3;

//   return (
//     <div className="bg-white rounded-3xl p-6 shadow-lg">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center gap-3">
//           {icon}
//           <h4 className="font-semibold text-lg">{title}</h4>
//         </div>
//         <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-700">
//           {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//         </button>
//       </div>

//       {expanded && (
//         <div className="space-y-3">
//           {data?.length > 0 ? (
//             <>
//               {visibleData.map((seller, index) => (
//                 <RecursiveSellerNode
//                   key={index}
//                   seller={seller}
//                   type={type}
//                   level={1}
//                 />
//               ))}

//               {hasMore && (
//                 <button
//                   onClick={() => setShowAll(!showAll)}
//                   className="w-full mt-2 py-2.5 text-sm font-medium text-rose-900 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1"
//                 >
//                   {showAll ? (
//                     <>See less <ChevronUp size={16} /></>
//                   ) : (
//                     <>See more ({data.length - 3}) <ChevronDown size={16} /></>
//                   )}
//                 </button>
//               )}
//             </>
//           ) : (
//             <p className="text-gray-400 py-12 text-center">No {type} partners found</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// /* ====================== RECURSIVE NODE ====================== */
// const RecursiveSellerNode = ({ seller, type, level = 1 }) => {
//   const [isOpen, setIsOpen] = useState(level === 1); // Auto-expand first level
//   const navigate = useNavigate();

//   const hasChildren = (type === 'downstream' && seller.downstream?.length > 0) ||
//                       (type === 'upstream' && seller.upstream?.length > 0);

//   const children = type === 'downstream' ? seller.downstream : seller.upstream;

//   return (
//     <div className="relative">
//       {/* Connection Line */}
//       {level > 1 && (
//         <div className="absolute -left-6 top-6 w-6 h-0.5 bg-gray-200" />
//       )}

//       <div className={`p-4 rounded-2xl border transition-all hover:shadow-md ${type === 'upstream' ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50'}`}>
//         <div className="flex items-center gap-4">
//           <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
//             {seller.businessName?.[0] || seller.email?.[0] || '?'}
//           </div>

//           <div className="flex-1 min-w-0">
//             <p className="font-semibold text-gray-900 truncate">
//               {seller.businessName || seller.businessProfile?.businessName}
//             </p>
//             <p className="text-xs text-gray-500 truncate">{seller.email}</p>
            
//             {seller.relationship && (
//               <span className="inline-block mt-1 text-[10px] px-3 py-0.5 bg-white rounded-full border">
//                 {seller.relationship}
//               </span>
//             )}
//           </div>

//           {hasChildren && (
//             <button 
//               onClick={() => setIsOpen(!isOpen)}
//               className="p-2 hover:bg-white rounded-xl transition-colors"
//             >
//               {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
//             </button>
//           )}
//         </div>

//         {/* Recursive Children */}
//         {hasChildren && isOpen && (
//           <div className="mt-4 pl-10 border-l-2 border-dashed border-gray-200 space-y-3">
//             {children.map((child, idx) => (
//               <RecursiveSellerNode 
//                 key={idx} 
//                 seller={child} 
//                 type={type} 
//                 level={level + 1} 
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };


// /* ====================== SELLER FULL CARD ====================== */
// const SellerFullCard = ({ seller, isMain = false }) => (
//   <div className={`bg-white rounded-3xl p-7 shadow-lg ${isMain ? 'ring-1 ring-rose-200' : ''}`}>
//     <div className="flex flex-col md:flex-row gap-6">
//       <img
//         src={seller.profilePicture || "https://via.placeholder.com/140"}
//         alt={seller.businessName}
//         className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border"
//       />

//       <div className="flex-1 space-y-4">
//         <div>
//           <h3 className="text-2xl font-semibold text-gray-900">
//             {seller.businessName || seller.businessProfile?.businessName || 'Unnamed Business'}
//           </h3>
//           <p className="text-gray-500 text-sm">{seller.email}</p>
//         </div>

//         <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
//           <DetailRow label="Phone" value={seller.phoneNumber} />
//           <DetailRow label="Location" value={`${seller.state || ''} ${seller.lga ? `, ${seller.lga}` : ''}`} />
//           <DetailRow label="Referral Points" value={seller.referralPoints || 0} />
//           <DetailRow label="Years in Business" value={seller.businessProfile?.yearsInBusiness} />
//           <DetailRow label="Staff Count" value={seller.businessProfile?.staffCount} />
//           <DetailRow label="Seller Types" value={seller.sellerProfile?.sellerTypes?.join(', ') || 'N/A'} />
//         </div>

//         <div>
//           <p className="text-xs uppercase text-gray-500 mb-1">Product Categories</p>
//           <p className="text-sm text-gray-700">
//             {seller.sellerProfile?.productCategories?.join(' • ') || seller.businessProfile?.entityCategory?.join(' • ') || 'Not specified'}
//           </p>
//         </div>
//       </div>
//     </div>
//   </div>
// );

// const DetailRow = ({ label, value }) => (
//   <div>
//     <span className="text-gray-500 text-xs">{label}</span>
//     <p className="font-medium text-gray-800">{value || '—'}</p>
//   </div>
// );


// export default DistributionChainView;






import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { 
  Users, ArrowRight, ArrowLeft, Star, MapPin, 
  Phone, Mail, Loader2, Package, Building2, 
  ChevronDown, ChevronUp, Link as LinkIcon, Search as SearchIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DistributionChainView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('seller');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ── Autosuggest state ─────────────────────────────
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoaded, setProductsLoaded] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchContainerRef = useRef(null);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();

  const fetchDistributionChain = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${backendUrl}/api/chain/search?type=${searchType}&query=${encodeURIComponent(searchQuery)}`
      );
      const result = await response.json();

      if (!response.ok) throw new Error(result.message || 'Failed to fetch data');

      setData(result.data);
    } catch (err) {
      setError(err.message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, searchType, backendUrl]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length > 2) fetchDistributionChain();
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchType, fetchDistributionChain]);

  // ── Fetch all products once for autosuggest ───────
  useEffect(() => {
    const loadAllProducts = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/products/all`);
        const result = await response.json();

        // Adjust this fallback chain if your endpoint's actual response shape differs
        const productsArray =
          result.products ||
          result.data?.products ||
          (Array.isArray(result.data) ? result.data : null) ||
          [];

        setAllProducts(Array.isArray(productsArray) ? productsArray : []);
      } catch (err) {
        console.error('Failed to load products for autosuggest:', err);
        setAllProducts([]);
      } finally {
        setProductsLoaded(true);
      }
    };

    loadAllProducts();
  }, [backendUrl]);

  // ── Filter suggestions by typed letters, matching on name ─
  const suggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return allProducts
      .filter((p) => p.name?.toLowerCase().includes(q))
      .slice(0, 8);
  }, [searchQuery, allProducts]);

  // ── Close dropdown on outside click ────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (product) => {
    setSearchQuery(product.name);
    setSearchType('product');
    setShowSuggestions(false);
    // The debounced effect above picks up this searchQuery/searchType
    // change automatically and runs the full chain search.
  };

  const handleManualSearch = () => {
    setShowSuggestions(false);
    fetchDistributionChain();
  };

  return (
    
    <div className="bg-gray-50 mt-5 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10 ">
          <div className="inline-flex items-center gap-3 bg-rose-900 text-white px-6 py-3 rounded-2xl mb-4">
            <Users className="w-7 h-7" />
            <h1 className="text-3xl font-semibold">Distribution Chain Explorer</h1>
          </div>
          <p className="text-gray-600">Discover multi-level business networks and supply relationships</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Input + autosuggest dropdown, scoped to its own relative wrapper */}
            <div className="relative flex-1" ref={searchContainerRef}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleManualSearch();
                  }
                }}
                placeholder="Search seller, business name, email or product..."
                className="w-full px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-rose-900 text-base"
              />

       
              {showSuggestions && searchQuery.trim() && (
  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 max-h-80 overflow-y-auto z-30">
    {!productsLoaded ? (
      <div className="flex items-center justify-center gap-2 py-6 text-gray-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading suggestions...
      </div>
    ) : suggestions.length > 0 ? (
      suggestions.map((product) => (
        <button
          key={product._id}
          onClick={() => handleSuggestionClick(product)}
          className="w-full flex items-center gap-3 px-5 py-3 hover:bg-rose-50 transition-colors text-left border-b border-gray-50 last:border-0"
        >
          <img
            src={product.images?.[0]?.url || 'https://via.placeholder.com/48'}
            alt={product.name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
            <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
              <span className="text-emerald-600 font-bold">
                ₦{product.price?.toLocaleString()}
              </span>
              <span>{product.category}</span>
              <span>Stock: {product.stockQuantity}</span>
            </div>
          </div>
        </button>
      ))
    ) : (
      <p className="py-6 text-center text-sm text-gray-400">
        No products match "{searchQuery}"
      </p>
    )}
  </div>
)}
            </div>

            <div className="flex gap-2">
              <button onClick={() => setSearchType('seller')} className={`px-6 py-3.5 rounded-2xl font-medium transition-all ${searchType === 'seller' ? 'bg-rose-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Seller
              </button>
              <button onClick={() => setSearchType('product')} className={`px-6 py-3.5 rounded-2xl font-medium transition-all ${searchType === 'product' ? 'bg-rose-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
                Product
              </button>
            </div>

            <button onClick={handleManualSearch} disabled={loading || !searchQuery.trim()} className="px-8 bg-rose-900 hover:bg-rose-900 text-white font-medium rounded-2xl transition-all disabled:opacity-60">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-900 p-4 rounded-2xl mb-8 text-center">{error}</div>}

        {loading && <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-rose-900" /></div>}

        {/* Results — unchanged from here down */}
        {data && !loading && (
          <>
            {searchType === 'product' && data.products?.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Package className="text-rose-900" /> Products Found
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {data.products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => navigate(`/product/${product._id}`)}
                      className=" rounded-3xl overflow-hidden shadow hover:shadow-xl transition-all cursor-pointer group"
                    >
                      <img
                        src={product.images?.[0]?.url || "https://via.placeholder.com/400x300"}
                        alt={product.name}
                        className="w-full h-52 object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="p-5">
                        <h3 className="font-semibold text-lg leading-tight mb-2 line-clamp-2">{product.name}</h3>
                        <p className="text-emerald-600 font-bold text-xl mb-2">₦{product.price?.toLocaleString()}</p>
                        <p className="text-gray-600 text-sm line-clamp-3 mb-4">{product.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{product.category}</span>
                          <span>Stock: {product.stockQuantity}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {data.sellers?.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <Building2 className="text-rose-900" /> Sellers Offering These Products
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {data.sellers.map((seller) => (
                        <React.Fragment key={seller._id}>
                          <SellerFullCard seller={seller} />
                          <div className="mt-16">
                            <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                              Supply Chain Network
                              <span className="text-sm font-normal text-gray-500">(Multi-level)</span>
                            </h3>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                              <ChainTree 
                                title="Upstream Suppliers" 
                                icon={<ArrowLeft className="text-red-900" />} 
                                data={seller.upstream} 
                                type="upstream" 
                              />
                              <ChainTree 
                                title="Downstream Partners" 
                                icon={<ArrowRight className="text-emerald-500" />} 
                                data={seller.downstream} 
                                type="downstream" 
                              />
                            </div>
                          </div>
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {searchType === 'seller' && data.mainSeller && (
              <>
                <SellerFullCard seller={data.mainSeller} isMain />

                <div className="mt-16">
                  <h3 className="text-2xl font-semibold mb-8 flex items-center gap-3">
                    Supply Chain Network
                    <span className="text-sm font-normal text-gray-500">(Multi-level)</span>
                  </h3>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <ChainTree 
                      title="Upstream Suppliers" 
                      icon={<ArrowLeft className="text-red-900" />} 
                      data={data.upstream} 
                      type="upstream" 
                    />
                    <ChainTree 
                      title="Downstream Partners" 
                      icon={<ArrowRight className="text-emerald-500" />} 
                      data={data.downstream} 
                      type="downstream" 
                    />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ====================== everything below is unchanged from your original file ====================== */

const ChainTree = ({ title, icon, data, type }) => {
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);

  const visibleData = showAll ? data : data?.slice(0, 3);
  const hasMore = data?.length > 3;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon}
          <h4 className="font-semibold text-lg">{title}</h4>
        </div>
        <button onClick={() => setExpanded(!expanded)} className="text-gray-500 hover:text-gray-700">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {data?.length > 0 ? (
            <>
              {visibleData.map((seller, index) => (
                <RecursiveSellerNode
                  key={index}
                  seller={seller}
                  type={type}
                  level={1}
                />
              ))}

              {hasMore && (
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="w-full mt-2 py-2.5 text-sm font-medium text-rose-900 hover:bg-rose-50 rounded-xl transition-colors flex items-center justify-center gap-1"
                >
                  {showAll ? (
                    <>See less <ChevronUp size={16} /></>
                  ) : (
                    <>See more ({data.length - 3}) <ChevronDown size={16} /></>
                  )}
                </button>
              )}
            </>
          ) : (
            <p className="text-gray-400 py-12 text-center">No {type} partners found</p>
          )}
        </div>
      )}
    </div>
  );
};

const RecursiveSellerNode = ({ seller, type, level = 1 }) => {
  const [isOpen, setIsOpen] = useState(level === 1);

  const hasChildren = (type === 'downstream' && seller.downstream?.length > 0) ||
                      (type === 'upstream' && seller.upstream?.length > 0);

  const children = type === 'downstream' ? seller.downstream : seller.upstream;

  return (
    <div className="relative">
      {level > 1 && (
        <div className="absolute -left-6 top-6 w-6 h-0.5 bg-gray-200" />
      )}

      <div className={`p-4 rounded-2xl border transition-all hover:shadow-md ${type === 'upstream' ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50'}`}>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-800 text-white rounded-2xl flex items-center justify-center font-bold text-2xl flex-shrink-0">
            {seller.businessName?.[0] || seller.email?.[0] || '?'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 truncate">
              {seller.businessName || seller.businessProfile?.businessName}
            </p>
            <p className="text-xs text-gray-500 truncate">{seller.email}</p>
            
            {seller.relationship && (
              <span className="inline-block mt-1 text-[10px] px-3 py-0.5 bg-white rounded-full border">
                {seller.relationship}
              </span>
            )}
          </div>

          {hasChildren && (
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-white rounded-xl transition-colors"
            >
              {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          )}
        </div>

        {hasChildren && isOpen && (
          <div className="mt-4 pl-10 border-l-2 border-dashed border-gray-200 space-y-3">
            {children.map((child, idx) => (
              <RecursiveSellerNode 
                key={idx} 
                seller={child} 
                type={type} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SellerFullCard = ({ seller, isMain = false }) => (
  <div className={`bg-white rounded-3xl p-7 shadow-lg ${isMain ? 'ring-1 ring-rose-200' : ''}`}>
    <div className="flex flex-col md:flex-row gap-6">
      <img
        src={seller.profilePicture || "https://via.placeholder.com/140"}
        alt={seller.businessName}
        className="w-32 h-32 md:w-36 md:h-36 rounded-2xl object-cover border"
      />

      <div className="flex-1 space-y-4">
        <div>
          <h3 className="text-2xl font-semibold text-gray-900">
            {seller.businessName || seller.businessProfile?.businessName || 'Unnamed Business'}
          </h3>
          <p className="text-gray-500 text-sm">{seller.email}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <DetailRow label="Phone" value={seller.phoneNumber} />
          <DetailRow label="Location" value={`${seller.state || ''} ${seller.lga ? `, ${seller.lga}` : ''}`} />
          <DetailRow label="Referral Points" value={seller.referralPoints || 0} />
          <DetailRow label="Years in Business" value={seller.businessProfile?.yearsInBusiness} />
          <DetailRow label="Staff Count" value={seller.businessProfile?.staffCount} />
          <DetailRow label="Seller Types" value={seller.sellerProfile?.sellerTypes?.join(', ') || 'N/A'} />
        </div>

        <div>
          <p className="text-xs uppercase text-gray-500 mb-1">Product Categories</p>
          <p className="text-sm text-gray-700">
            {seller.sellerProfile?.productCategories?.join(' • ') || seller.businessProfile?.entityCategory?.join(' • ') || 'Not specified'}
          </p>
        </div>
      </div>
    </div>
  </div>
);

const DetailRow = ({ label, value }) => (
  <div>
    <span className="text-gray-500 text-xs">{label}</span>
    <p className="font-medium text-gray-800">{value || '—'}</p>
  </div>
);

export default DistributionChainView;