import { useEffect, useState } from "react";
import { Plus, Minus, Trash2 } from "lucide-react";
import ModalShell from "./ModalShell";
import { getCart,  incrementCartItem,
  decrementCartItem,
  removeFromCart, } from "../../../config/cartUtils";


export default function CartSummaryModal({ onClose, onCheckout }) {
  const [items, setItems] = useState(getCart());

  useEffect(() => {
    const handler = () => setItems(getCart());
    window.addEventListener("cartUpdated", handler);
    return () => window.removeEventListener("cartUpdated", handler);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  // rebuild a minimal "product" shape so cartUtils' product-based helpers work
  // from a plain cart line (which only stores productId, not the full product doc)
  const toProductShape = (item) => ({
    _id: item.productId,
    name: item.varietyName ? item.name.replace(` - ${item.varietyName}`, "") : item.name,
    price: item.price,
    images: [{ url: item.image, isPrimary: true }],
    seller: item.sellerId,
  });

  const handleInc = (item) => {
    incrementCartItem(
      toProductShape(item),
      item.varietyName ? { name: item.varietyName, price: item.price, image: item.image } : null
    );
    setItems(getCart());
  };

  const handleDec = (item) => {
    decrementCartItem(item.productId, item.varietyName);
    setItems(getCart());
  };

  const handleDelete = (item) => {
    removeFromCart(item.key);
    setItems(getCart());
  };

  return (
    <ModalShell
      title="Your Cart"
      onClose={onClose}
      footer={
        <>
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Subtotal</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-gray-900 text-lg border-t pt-2 mb-4">
            <span>Total</span>
            <span>₦{total.toLocaleString()}</span>
          </div>
          <button
            disabled={items.length === 0}
            onClick={onCheckout}
            className="w-full bg-[#8B1E3F] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl hover:bg-[#8B1E3F] transition-colors"
          >
            Checkout
          </button>
        </>
      }
    >
      <div className="p-5 space-y-3">
        {items.length === 0 && (
          <p className="text-center text-gray-400 py-10">Your cart is empty</p>
        )}
        {items.map((item) => (
          <div
            key={item.key}
            className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3"
          >
            <img
              src={item.image || "/placeholder-food.png"}
              alt={item.name}
              className="w-16 h-16 rounded-xl object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 line-clamp-1">{item.name}</p>
              <p className="text-xs text-gray-500">₦{item.price.toLocaleString()} each</p>
              <div className="flex items-center gap-2 mt-2 bg-gray-100 rounded-full px-1.5 py-1 w-fit">
                <button
                  onClick={() => handleDec(item)}
                  className="w-6 h-6 rounded-full bg-white flex items-center justify-center"
                  aria-label="Decrease"
                >
                  <Minus size={12} />
                </button>
                <span className="w-4 text-center text-xs font-bold">{item.qty}</span>
                <button
                  onClick={() => handleInc(item)}
                  className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center"
                  aria-label="Increase"
                >
                  <Plus size={12} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between h-16">
              <button
                onClick={() => handleDelete(item)}
                className="text-red-400 hover:text-red-600"
                aria-label="Remove item"
              >
                <Trash2 size={16} />
              </button>
              <p className="text-sm font-bold text-gray-900">
                ₦{(item.price * item.qty).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </ModalShell>
  );
}