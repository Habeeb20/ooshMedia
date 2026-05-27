import { useState } from 'react';
import { toast } from 'sonner';

export default function BulkStockUpdate({ products, onSuccess, onClose }) {
  const [updates, setUpdates] = useState({});

  const handleStockChange = (id, value) => {
    setUpdates(prev => ({ ...prev, [id]: Number(value) }));
  };

  const saveBulkUpdate = async () => {
    try {
      // Send bulk updates to backend
      await Promise.all(
        Object.entries(updates).map(([id, quantity]) =>
          fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/${id}/stock`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ quantity, action: 'set' })
          })
        )
      );

      toast.success("Stock updated successfully");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error("Failed to update stock");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110]">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-6">Bulk Stock Update</h2>
        <div className="max-h-96 overflow-y-auto space-y-4">
          {products.map(product => (
            <div key={product._id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
              <img src={product.images?.[0]?.url} className="w-12 h-12 object-cover rounded-xl" />
              <div className="flex-1">
                <p className="font-medium">{product.name}</p>
                <p className="text-sm text-gray-500">Current: {product.stockQuantity}</p>
              </div>
              <input
                type="number"
                value={updates[product._id] ?? product.stockQuantity}
                onChange={(e) => handleStockChange(product._id, e.target.value)}
                className="w-24 px-4 py-3 rounded-2xl border border-gray-200 text-center"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="flex-1 py-4 border rounded-2xl">Cancel</button>
          <button onClick={saveBulkUpdate} className="flex-1 py-4 bg-[#8B1E3F] text-white rounded-2xl">Save Changes</button>
        </div>
      </div>
    </div>
  );
}