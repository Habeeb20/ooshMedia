import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import InventoryStats from '../../components/inventory/InventoryStats';
import Loading from '../../config/Loading';
import AddProductModal from '../../components/inventory/AddProductModal';
import ProductList from "./ProductsList"
import StockAlert from "../../components/inventory/StockAlert"

import { Package, Plus, TrendingUp, AlertTriangle, BarChart3 } from 'lucide-react';



import { toast } from 'sonner';

export default function InventoryDashboard() {
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchData = async () => {
    try {
      const [productsRes, statsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      const productsData = await productsRes.json();
      const statsData = await statsRes.json();

      if (productsData.success) setProducts(productsData.products);
      if (statsData.success) setStats(statsData.stats);
    } catch (err) {
      toast.error("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Track, manage and grow your stock</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-3 px-6 py-3.5 bg-[#8B1E3F] text-white rounded-2xl hover:bg-[#A6224A] transition font-medium"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <InventoryStats stats={stats} />

      <StockAlert products={products} />

      <ProductList 
        products={products} 
        loading={loading} 
        onRefresh={fetchData} 
      />

      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)} 
          onSuccess={fetchData} 
        />
      )}
    </div>
  );
}