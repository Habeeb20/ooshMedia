import { AlertTriangle } from "lucide-react";
export default function StockAlert({ products }) {
  const lowStock = products.filter(p => p.stockQuantity <= p.lowStockThreshold && p.stockQuantity > 0);
  const outOfStock = products.filter(p => p.stockQuantity === 0);

  if (lowStock.length === 0 && outOfStock.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-3xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-orange-600" />
        <h3 className="font-semibold text-orange-800">Stock Alerts</h3>
      </div>
      {lowStock.length > 0 && (
        <p className="text-orange-700">{lowStock.length} products are low on stock</p>
      )}
      {outOfStock.length > 0 && (
        <p className="text-red-700 mt-1">{outOfStock.length} products are out of stock</p>
      )}
    </div>
  );
}