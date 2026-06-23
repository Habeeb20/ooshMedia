import { useState, useEffect, useRef } from 'react';
import api from '../../config/api';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle } from 'lucide-react';
import {toast} from "sonner"
export default function POSPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('pos_cash');
  const [loading, setLoading] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    api.get('/api/products').then(({ data }) => setProducts(data.products),).catch(console.error);
  }, []);

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) && p.stockQuantity > 0
  );

  const addToCart = (product) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId === product._id);
      if (idx > -1) {
        const updated = [...prev];
        if (updated[idx].quantity < product.stockQuantity) {
          updated[idx].quantity += 1;
          updated[idx].subtotal = updated[idx].price * updated[idx].quantity;
        }
        return updated;
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price: product.salePrice || product.price,
        quantity: 1,
        subtotal: product.salePrice || product.price,
        stock: product.stockQuantity,
      }];
    });
  };

  const updateQty = (productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(i => i.productId !== productId));
    } else {
      setCart(prev => prev.map(i =>
        i.productId === productId ? { ...i, quantity: qty, subtotal: i.price * qty } : i
      ));
    }
  };

  const total = cart.reduce((s, i) => s + i.subtotal, 0);
  const platformFee = +(total * 0.10).toFixed(2);
  const sellerAmount = +(total - platformFee).toFixed(2);

  const handleSale = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const { data } = await api.post('/api/pos/sale', {
        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
        customerName,
        customerPhone,
        paymentMethod,
      });
      setReceipt(data.transaction);
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Sale failed');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const newSale = () => setReceipt(null);

  if (receipt) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full" ref={receiptRef}>
          <div className="text-center mb-6">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
            <h2 className="text-2xl font-black text-gray-800">Sale Complete!</h2>
            <p className="text-gray-400 text-sm">Receipt #{receipt.receiptNumber}</p>
          </div>

          {receipt.customerName && (
            <div className="mb-4 text-sm text-gray-600">
              <p>Customer: <strong>{receipt.customerName}</strong></p>
              {receipt.customerPhone && <p>Phone: {receipt.customerPhone}</p>}
            </div>
          )}

          <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
            {receipt.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm py-1">
                <span>{item.name} × {item.quantity}</span>
                <span>₦{item.subtotal.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₦{receipt.amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Platform Fee (10%)</span>
              <span>₦{receipt.platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
              <span>Total</span>
              <span>₦{receipt.amount.toLocaleString()}</span>
            </div>
            <div className="text-center text-xs text-gray-400 mt-3">
              Payment: {receipt.paymentMethod === 'pos_cash' ? 'Cash' : receipt.paymentMethod === 'pos_transfer' ? 'Transfer' : 'POS'}
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={printReceipt}
              className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
            >
              <Printer size={16} /> Print
            </button>
            <button
              onClick={newSale}
              className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="grid grid-cols-1 lg:grid-cols-5 h-screen">

        {/* Product Grid */}
        <div className="lg:col-span-3 p-4 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 pb-3 z-10">
            <h1 className="text-xl font-bold text-gray-800 mb-3">POS Terminal</h1>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
            {filteredProducts.map(product => (
              <button
                key={product._id}
                onClick={() => addToCart(product)}
                className="bg-white rounded-xl p-3 text-left shadow-sm hover:shadow-md hover:border-indigo-300 border border-transparent transition-all"
              >
                <img
                  src={product.images?.[0]?.url || '/placeholder.png'}
                  alt={product.name}
                  className="w-full h-24 object-cover rounded-lg mb-2"
                />
                <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
                <p className="text-indigo-600 font-bold text-sm">₦{(product.salePrice || product.price).toLocaleString()}</p>
                <p className="text-xs text-gray-400">Stock: {product.stockQuantity}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="lg:col-span-2 bg-white border-l border-gray-100 flex flex-col p-4">
          <h2 className="font-bold text-gray-700 text-lg mb-3">Current Sale</h2>

          {/* Customer */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer name"
              className="col-span-2 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <input
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              placeholder="Phone (optional)"
              className="col-span-2 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto space-y-2 mb-4">
            {cart.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-12">Add products to begin a sale</p>
            )}
            {cart.map(item => (
              <div key={item.productId} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">₦{item.price.toLocaleString()} each</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
                  <button
                    onClick={() => updateQty(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= item.stock}
                    className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center disabled:opacity-40"
                  >
                    <Plus size={12} />
                  </button>
                </div>
                <p className="text-sm font-bold text-gray-800 w-20 text-right">₦{item.subtotal.toLocaleString()}</p>
                <button onClick={() => updateQty(item.productId, 0)} className="text-red-400">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Payment Method */}
          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium mb-1 block">Payment Method</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setPaymentMethod('pos_cash')}
                className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  paymentMethod === 'pos_cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                💵 Cash
              </button>
              <button
                onClick={() => setPaymentMethod('pos_transfer')}
                className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  paymentMethod === 'pos_transfer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                🏦 Transfer
              </button>
              <button
                onClick={() => setPaymentMethod('pos_machine')}
                className={`py-2 rounded-xl  ml-30 text-sm font-medium border-2 transition-all ${
                  paymentMethod === 'pos_machine' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                🏦 POS 
              </button>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t pt-4 space-y-1 text-sm mb-4">
            <div className="flex justify-between text-gray-500">
              <span>Platform Fee (10%)</span>
              <span>₦{platformFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-xl">
              <span>Total</span>
              <span>₦{total.toLocaleString()}</span>
            </div>
          </div>

          <button
            onClick={handleSale}
            disabled={cart.length === 0 || loading}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-40"
          >
            {loading ? 'Processing...' : `Charge ₦${total.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
}
