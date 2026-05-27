import { TrendingUp, Package, AlertTriangle } from 'lucide-react';

export default function InventoryStats({ stats }) {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-4xl font-bold mt-2">{stats.totalProducts}</p>
          </div>
          <Package className="w-10 h-10 text-[#8B1E3F]" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Low Stock</p>
            <p className="text-4xl font-bold mt-2 text-orange-600">{stats.lowStock}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-orange-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Out of Stock</p>
            <p className="text-4xl font-bold mt-2 text-red-600">{stats.outOfStock}</p>
          </div>
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm">
        <div className="flex justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Value</p>
            <p className="text-4xl font-bold mt-2">₦{stats.totalValue?.toLocaleString()}</p>
          </div>
          <TrendingUp className="w-10 h-10 text-green-500" />
        </div>
      </div>
    </div>
  );
}