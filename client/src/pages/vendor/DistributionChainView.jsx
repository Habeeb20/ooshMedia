import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, ArrowRight, ArrowLeft, Star, MapPin, 
  Phone, Mail, Loader2, Package, Building2 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DistributionChainView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('seller');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      console.log(result.data)
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

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl mb-4">
            <Users className="w-7 h-7" />
            <h1 className="text-3xl font-semibold">Distribution Chain Explorer</h1>
          </div>
          <p className="text-gray-600">Discover business networks and supply relationships</p>
        </div>

        {/* Search Bar */}
        <div className="bg-white rounded-3xl shadow p-6 mb-12">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search seller, business name, email or product..."
              className="flex-1 px-5 py-3.5 border border-gray-200 rounded-2xl focus:outline-none focus:border-blue-500 text-base"
            />

            <div className="flex gap-2">
              <button
                onClick={() => setSearchType('seller')}
                className={`px-6 py-3.5 rounded-2xl font-medium transition-all text-sm sm:text-base ${
                  searchType === 'seller' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Seller
              </button>
              <button
                onClick={() => setSearchType('product')}
                className={`px-6 py-3.5 rounded-2xl font-medium transition-all text-sm sm:text-base ${
                  searchType === 'product' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Product
              </button>
            </div>

            <button
              onClick={fetchDistributionChain}
              disabled={loading || !searchQuery.trim()}
              className="px-8 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-2xl transition-all disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
            </button>
          </div>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-center">{error}</div>}

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          </div>
        )}

        {/* Results */}
        {data && !loading && (
          <>
            {/* ==================== PRODUCT SEARCH ==================== */}
            {searchType === 'product' && data.products?.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                  <Package className="text-blue-600" /> Products Found
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                  {data.products.map((product) => (
                    <div
                      key={product._id}
                      onClick={() => navigate(`/product/${product._id}`)}
                      className="bg-white rounded-3xl overflow-hidden shadow hover:shadow-xl transition-all cursor-pointer group"
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

                {/* Sellers Section */}
                {data.sellers?.length > 0 && (
                  <div>
                    <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
                      <Building2 className="text-blue-600" /> Sellers Offering These Products
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {data.sellers.map((seller) => (
                        <SellerFullCard key={seller._id} seller={seller} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ==================== SELLER SEARCH ==================== */}
            {searchType === 'seller' && data.mainSeller && (
              <>
                <SellerFullCard seller={data.mainSeller} isMain />

                {/* Supply Chain Flow */}
                <div className="mt-16">
                  <h3 className="text-2xl font-semibold mb-6">Supply Chain Network</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Upstream */}
                    <div className="bg-white rounded-3xl p-6 shadow">
                      <div className="flex items-center gap-2 mb-5">
                        <ArrowLeft className="text-red-500" />
                        <h4 className="font-semibold text-red-600">Upstream Suppliers</h4>
                      </div>
                      {data.upstream?.length > 0 ? (
                        data.upstream.map((s, i) => <SellerCard key={i} seller={s} type="upstream" />)
                      ) : (
                        <p className="text-gray-400 py-10 text-center text-sm">No upstream suppliers found</p>
                      )}
                    </div>

                    {/* Center */}
                    <div className="hidden lg:flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-xs tracking-widest text-blue-600 font-medium">MAIN SELLER</div>
                        <div className="w-20 h-20 mx-auto mt-3 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-4xl font-bold shadow">
                          {data.mainSeller.businessName?.[0] || 'S'}
                        </div>
                      </div>
                    </div>

                    {/* Downstream */}
                    <div className="bg-white rounded-3xl p-6 shadow">
                      <div className="flex items-center gap-2 mb-5">
                        <h4 className="font-semibold text-emerald-600">Downstream Partners</h4>
                        <ArrowRight className="text-emerald-500" />
                      </div>
                      {data.downstream?.length > 0 ? (
                        data.downstream.map((s, i) => <SellerCard key={i} seller={s} type="downstream" isChain />)
                      ) : (
                        <p className="text-gray-400 py-10 text-center text-sm">No downstream partners yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {((searchType === 'product' && !data.products?.length) || 
              (searchType === 'seller' && !data.mainSeller)) && (
              <p className="text-center text-gray-500 py-16">No results found for "{searchQuery}"</p>
            )}
          </>
        )}
      </div>
    </div>
  );
};

/* ====================== SELLER FULL CARD ====================== */
const SellerFullCard = ({ seller, isMain = false }) => (
  <div className={`bg-white rounded-3xl p-7 shadow-lg ${isMain ? 'ring-1 ring-blue-200' : ''}`}>
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

const SellerCard = ({ seller, type, isChain }) => (
  <div className={`p-5 rounded-2xl border mb-3 transition hover:-translate-y-0.5 ${
    type === 'upstream' ? 'border-red-100 bg-red-50' : 'border-emerald-100 bg-emerald-50'
  }`}>
    <div className="flex items-center gap-4">
      <div className="w-11 h-11 bg-gray-800 text-white rounded-xl flex items-center justify-center font-bold text-xl">
        {seller.businessName?.[0] || seller.email?.[0] || '?'}
      </div>
      <div>
        <p className="font-medium">{seller.businessProfile?.businessName || seller?.email}</p>
        <p className="text-xs text-gray-500">{seller.email}</p>
        <p className="text-xs text-gray-500">{seller.username}</p>
        {isChain && seller.relationship && (
          <span className="text-[10px] mt-1 inline-block px-3 py-0.5 bg-white border rounded-full">
            {seller.relationship}
          </span>
        )}
      </div>
    </div>
  </div>
);

export default DistributionChainView;