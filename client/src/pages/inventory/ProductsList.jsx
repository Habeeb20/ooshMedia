import { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye } from 'lucide-react';
import Loading from '../../config/Loading';
import ProductDetailModal from '../../components/inventory/ProductDetailsModal';

import { toast } from 'sonner';

export default function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (err) {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <Loading text="Loading products..." />;

  return (
    <>
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-500">Product</th>
                <th className="px-6 py-5 text-left text-sm font-medium text-gray-500">Category</th>
                <th className="px-6 py-5 text-center text-sm font-medium text-gray-500">Stock</th>
                <th className="px-6 py-5 text-right text-sm font-medium text-gray-500">Price</th>
                <th className="px-6 py-5 text-center text-sm font-medium text-gray-500">Status</th>
                <th className="px-6 py-5 text-right text-sm font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {products.map((product) => {
                const isLowStock = product.stockQuantity <= 5;
                return (
                  <tr key={product._id} className="hover:bg-gray-50">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                      <div className="flex -space-x-2">
                          {product.images?.slice(0, 3).map((img, i) => (
                            <img 
                              key={i}
                              src={img.url} 
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded-xl border-2 border-white"
                            />
                          ))}
                        </div>
                        <div>
                          <p className="font-semibold">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.sku}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-sm text-gray-600">{product.category}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`font-bold text-lg ${isLowStock ? 'text-red-600' : 'text-green-600'}`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right font-semibold">₦{product.price?.toLocaleString()}</td>
                    <td className="px-6 py-5 text-center">
                      <span className={`px-4 py-1 text-xs rounded-full ${
                        product.status === 'active' ? 'bg-green-100 text-green-700' : 
                        isLowStock ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isLowStock ? 'Low Stock' : product.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right space-x-2">
                      <button onClick={() => setSelectedProduct(product)} className="p-2 hover:bg-gray-100 rounded-xl">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-xl">
                        <Edit2 size={18} />
                      </button>
                      <button className="p-2 hover:bg-red-50 text-red-600 rounded-xl">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {selectedProduct && (
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      )}
    </>
  );
}