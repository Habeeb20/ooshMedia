import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Factory, Warehouse, Store, Truck, UserCheck, Sprout,
  Users, Loader2, ArrowRight,
} from 'lucide-react';

const SELLER_TYPES = [
  { value: 'manufacturer', label: 'Manufacturers', icon: Factory, color: 'from-rose-900 to-rose-800' },
  { value: 'wholesaler', label: 'Wholesalers', icon: Warehouse, color: 'from-amber-700 to-amber-600' },
  { value: 'distributor', label: 'Distributors', icon: Truck, color: 'from-indigo-700 to-indigo-600' },
  { value: 'retailer', label: 'Retailers', icon: Store, color: 'from-emerald-700 to-emerald-600' },
  { value: 'agent', label: 'Agents', icon: UserCheck, color: 'from-violet-700 to-violet-600' },
  { value: 'farmer', label: 'Farmers', icon: Sprout, color: 'from-lime-700 to-lime-600' },
];

export default function SellerTypesOverview() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const controller = new AbortController();
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

  const countFor = (type) =>
    sellers.filter((s) => s.sellerProfile?.sellerTypes?.includes(type)).length;

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 py-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-3 bg-rose-900 text-white px-6 py-3 rounded-2xl mb-4">
            <Users className="w-7 h-7" />
            <h1 className="text-3xl font-semibold">Browse Sellers by Type</h1>
          </div>
          <p className="text-gray-600">
            {loading ? 'Loading network…' : `${sellers.length} sellers across the network`}
          </p>
        </div>

        {error && <div className="bg-red-50 text-red-900 p-4 rounded-2xl mb-8 text-center">{error}</div>}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 rounded-3xl bg-gray-200 animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* All sellers card */}
            {/* <button
              onClick={() => navigate('/sellers/type/all')}
              className="w-full mb-6 bg-gradient-to-r from-rose-900 to-rose-800 text-white rounded-3xl p-7 flex items-center justify-between hover:shadow-xl transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                  <Users className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-semibold">All Sellers</h3>
                  <p className="text-gray-300 text-sm">Every seller on the platform</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold">{sellers.length}</span>
                <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </div>
            </button> */}

            {/* Per-type grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {SELLER_TYPES.map(({ value, label, icon: Icon, color }) => {
                const count = countFor(value);
                return (
                  <button
                    key={value}
                    onClick={() => navigate(`/sellers/type/${value}`)}
                    className="relative bg-white rounded-3xl p-6 shadow hover:shadow-xl transition-all text-left group overflow-hidden"
                  >
                    <div className={`absolute -top-8 -right-8 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />

                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 relative z-10`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex items-end justify-between relative z-10">
                      <div>
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">{label}</h3>
                        <p className="text-sm text-gray-500">
                          {count} {count === 1 ? 'seller' : 'sellers'}
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-rose-900 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}