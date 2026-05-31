import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { MapPin, Star, Users, Heart, ShoppingBag } from 'lucide-react';

import { entityCategories } from '../../categories/entityCategories';

const Vendors = () => {
  const [sellers, setSellers] = useState([]);
  const [filteredSellers, setFilteredSellers] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productLoading, setProductLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchSellers();
    fetchFeaturedProducts();
  }, []);

  const fetchSellers = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/seller/all`);
      const sellerData = res.data.sellers || [];
      setSellers(sellerData);
      setFilteredSellers(sellerData);
    } catch (err) {
      toast.error("Failed to load vendors");
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`);
      setProducts(res.data.products?.slice(0, 8) || []);
    } catch (err) {
      console.error(err);
    } finally {
      setProductLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);

    if (categoryId === 'all' || !categoryId) {
      setFilteredSellers(sellers);
    } else {
      const filtered = sellers.filter((seller) => {
        const categories = seller.businessProfile?.entityCategory || [];
        return categories.includes(categoryId);
      });
      setFilteredSellers(filtered);
    }
  };

  const visibleCategories = entityCategories.slice(0, 6);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="max-w-7xl mx-auto px-4 pt-10">
        <h1 className="text-4xl font-black text-gray-900">Discover Trusted Vendors</h1>
        <p className="text-gray-600 mt-2">Find the best businesses in your area</p>

        {/* ==================== COLORFUL CATEGORY GRID ==================== */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Browse by Category</h2>
            <button
              onClick={() => setShowAllCategories(true)}
              className="text-primary font-semibold hover:underline flex items-center gap-1"
            >
              View All Categories →
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {visibleCategories.map((cat, index) => (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`group relative overflow-hidden rounded-3xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 border border-transparent ${
                  selectedCategory === cat.id 
                    ? 'ring-2 ring-offset-2 ring-primary shadow-xl' 
                    : 'hover:shadow-lg'
                }`}
                style={{
                  background: `linear-gradient(135deg, 
                    ${['#fef3c7', '#dbeafe', '#e0f2fe', '#f3e8ff', '#ecfdf5', '#fee2e2'][index % 6]}, 
                    white)`
                }}
              >
                <div className="text-5xl mb-4 transition-transform group-hover:scale-110">
                  {cat.icon}
                </div>
                <h4 className="font-bold text-lg leading-tight text-gray-800">
                  {cat.name}
                </h4>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {cat.examples[0]}
                </p>

                {selectedCategory === cat.id && (
                  <div className="absolute top-3 right-3 bg-primary text-white text-xs px-3 py-1 rounded-full font-medium">
                    Selected
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ==================== SELLERS GRID ==================== */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <Users className="w-6 h-6 text-primary" />
            {selectedCategory 
              ? `${entityCategories.find(c => c.id === selectedCategory)?.name || 'Filtered'} Businesses` 
              : 'All Businesses'}
            <span className="text-sm font-normal text-gray-500">({filteredSellers.length})</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-3xl animate-pulse" />
              ))}
            </div>
          ) : filteredSellers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl">
              <p className="text-xl text-gray-500">No businesses found in this category yet.</p>
              <button 
                onClick={() => handleCategoryClick('all')}
                className="mt-4 text-primary underline"
              >
                Show All Vendors
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSellers.map((seller) => {
                const bp = seller.businessProfile || {};
                const shopName = bp.businessName || seller.sellerProfile?.shopName;

                return (
                  <div
                    key={seller._id}
                    onClick={() => navigate(`/seller/${shopName?.toLowerCase().replace(/\s+/g, '-')}/${seller._id}`)}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all cursor-pointer group"
                  >
                    <div className="relative h-52">
                      <img
                        src={seller.profilePicture || "https://ui-avatars.com/api/?name=Business&background=random"}
                        alt={shopName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {bp.verified && (
                        <div className="absolute top-4 right-4 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-medium shadow">
                          ✓ Verified
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-xl line-clamp-1">{shopName}</h3>
                      <p className="text-gray-500 text-sm flex items-center gap-1 mt-1">
                        <MapPin className="w-4 h-4" />
                        {seller.state}, {seller.lga}
                      </p>

                      <div className="mt-5 flex justify-between items-center text-sm">
                        <div className="flex items-center gap-1 text-amber-500">
                          <Star className="w-4 h-4 fill-current" />
                          <span>{bp.reviews?.length || 0} reviews</span>
                        </div>
                        <div className="text-gray-500 text-xs">
                          {bp.yearsInBusiness || 0} yrs • {bp.views || 0} views
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================== PRODUCTS YOU MAY LIKE ==================== */}
        <div className="mt-16">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingBag className="w-7 h-7 text-primary" />
            <h2 className="text-2xl font-bold">Products You May Like</h2>
          </div>

          {productLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <div key={i} className="h-72 bg-gray-200 rounded-3xl animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {products.map((product) => (
                <div
                  key={product._id}
                  onClick={() => navigate(`/product/${product.name?.toLowerCase().replace(/\s+/g, '-')}/${product._id}`)}
                  className="bg-white rounded-3xl overflow-hidden hover:shadow-xl transition-all cursor-pointer group"
                >
                  <div className="relative h-52">
                    <img
                      src={product.images?.[0]?.url || "/placeholder.jpg"}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="font-semibold line-clamp-2 text-sm h-10">{product.name}</h4>
                    <p className="text-primary font-bold mt-2 text-lg">
                      ₦{product.price?.toLocaleString()}
                    </p>
                    {product.salePrice && (
                      <p className="text-xs text-red-500 line-through">
                        ₦{product.salePrice.toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* All Categories Modal */}
      {showAllCategories && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold">All Business Categories</h2>
              <button onClick={() => setShowAllCategories(false)} className="text-4xl leading-none hover:text-gray-400">×</button>
            </div>

            <div className="p-6 grid grid-cols-2 md:grid-cols-3 gap-5 overflow-auto max-h-[70vh]">
              {entityCategories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    handleCategoryClick(cat.id);
                    setShowAllCategories(false);
                  }}
                  className="border-2 hover:border-primary rounded-3xl p-6 cursor-pointer transition-all hover:shadow-md"
                >
                  <div className="text-6xl mb-4">{cat.icon}</div>
                  <h4 className="font-bold text-lg">{cat.name}</h4>
                  <p className="text-sm text-gray-500 mt-2">{cat.examples[0]}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;