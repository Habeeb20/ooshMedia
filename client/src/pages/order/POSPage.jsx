


// import { useState, useEffect, useRef } from 'react';
// import api from '../../config/api';
// import { Search, Plus, Minus, Trash2, Printer, CheckCircle, LogOut, KeyRound } from 'lucide-react';
// import { toast } from "sonner"

// // ── Staff clock-in gate ──────────────────────────────────────────────
// const StaffClockIn = ({ onClockIn }) => {
//   const [code, setCode] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (code.length !== 4) {
//       toast.error('Enter your 4-digit staff code.');
//       return;
//     }
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/staff/pos-login', { code });
//       if (!data.success) throw new Error(data.message);
//       onClockIn(data.staff);
//     } catch (err) {
//       toast.error(err.response?.data?.message || err.message || 'Invalid code.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//       <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
//         <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
//           <KeyRound className="text-indigo-600" size={24} />
//         </div>
//         <h2 className="text-xl font-bold text-gray-800 mb-1">Clock In</h2>
//         <p className="text-sm text-gray-400 mb-5">Enter your 4-digit staff code to start selling.</p>
//         <input
//           value={code}
//           onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
//           placeholder="••••"
//           inputMode="numeric"
//           autoFocus
//           className="w-full text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-200 rounded-xl py-3 mb-4 focus:outline-none focus:border-indigo-500 transition"
//         />
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
//         >
//           {loading ? 'Checking…' : 'Clock In'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default function POSPage() {
//   const [staff, setStaff] = useState(() => {
//     const saved = sessionStorage.getItem('posStaff');
//     return saved ? JSON.parse(saved) : null;
//   });

//   const [products, setProducts] = useState([]);
//   const [search, setSearch] = useState('');
//   const [cart, setCart] = useState([]);
//   const [customerName, setCustomerName] = useState('');
//   const [customerPhone, setCustomerPhone] = useState('');
//   const [paymentMethod, setPaymentMethod] = useState('pos_cash');
//   const [loading, setLoading] = useState(false);
//   const [receipt, setReceipt] = useState(null);
//   const receiptRef = useRef();

//   useEffect(() => {
//     api.get('/api/products').then(({ data }) => setProducts(data.products)).catch(console.error);
//   }, []);

//   const handleClockIn = (staffData) => {
//     sessionStorage.setItem('posStaff', JSON.stringify(staffData));
//     setStaff(staffData);
//   };

//   const handleClockOut = () => {
//     sessionStorage.removeItem('posStaff');
//     setStaff(null);
//     setCart([]);
//   };

//   if (!staff) {
//     return <StaffClockIn onClockIn={handleClockIn} />;
//   }

//   const filteredProducts = products.filter(p =>
//     p.name.toLowerCase().includes(search.toLowerCase()) && p.stockQuantity > 0
//   );

//   const addToCart = (product) => {
//     setCart(prev => {
//       const idx = prev.findIndex(i => i.productId === product._id);
//       if (idx > -1) {
//         const updated = [...prev];
//         if (updated[idx].quantity < product.stockQuantity) {
//           updated[idx].quantity += 1;
//           updated[idx].subtotal = updated[idx].price * updated[idx].quantity;
//         }
//         return updated;
//       }
//       return [...prev, {
//         productId: product._id,
//         name: product.name,
//         price: product.salePrice || product.price,
//         quantity: 1,
//         subtotal: product.salePrice || product.price,
//         stock: product.stockQuantity,
//       }];
//     });
//   };

//   const updateQty = (productId, qty) => {
//     if (qty <= 0) {
//       setCart(prev => prev.filter(i => i.productId !== productId));
//     } else {
//       setCart(prev => prev.map(i =>
//         i.productId === productId ? { ...i, quantity: qty, subtotal: i.price * qty } : i
//       ));
//     }
//   };

//   const total = cart.reduce((s, i) => s + i.subtotal, 0);
//   const platformFee = +(total * 0.10).toFixed(2);
//   const sellerAmount = +(total - platformFee).toFixed(2);

//   const handleSale = async () => {
//     if (cart.length === 0) return;
//     setLoading(true);
//     try {
//       const { data } = await api.post('/api/pos/sale', {
//         items: cart.map(i => ({ productId: i.productId, quantity: i.quantity, price: i.price })),
//         customerName,
//         customerPhone,
//         paymentMethod,
//         staffId: staff.id,
//         staffName: staff.fullName,
//       });
//       setReceipt(data.transaction);
//       setCart([]);
//       setCustomerName('');
//       setCustomerPhone('');
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Sale failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const printReceipt = () => {
//     window.print();
//   };

//   const newSale = () => setReceipt(null);

//   if (receipt) {
//     return (
//       <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
//         <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full" ref={receiptRef}>
//           <div className="text-center mb-6">
//             <CheckCircle size={48} className="text-green-500 mx-auto mb-2" />
//             <h2 className="text-2xl font-black text-gray-800">Sale Complete!</h2>
//             <p className="text-gray-400 text-sm">Receipt #{receipt.receiptNumber}</p>
//             <p className="text-xs text-gray-400 mt-1">Served by {staff.fullName}</p>
//           </div>

//           {receipt.seller && (
//             <div className="mb-4 text-sm text-gray-600">
//               <p>Seller: <strong>{receipt.seller?.businessName}</strong></p>
//               {receipt.seller?.phone && <p>Phone: {receipt.seller?.phone}</p>}
//             </div>
//           )}
//           {receipt.customerName && (
//             <div className="mb-4 text-sm text-gray-600">
//               <p>Customer: <strong>{receipt.customerName}</strong></p>
//               {receipt.customerPhone && <p>Phone: {receipt.customerPhone}</p>}
//             </div>
//           )}

//           <div className="border-t border-dashed border-gray-300 pt-4 mb-4">
//             {receipt.items.map((item, i) => (
//               <div key={i} className="flex justify-between text-sm py-1">
//                 <span>{item.name} × {item.quantity}</span>
//                 <span>₦{item.subtotal.toLocaleString()}</span>
//               </div>
//             ))}
//           </div>

//           <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-sm">
//             <div className="flex justify-between text-gray-600">
//               <span>Subtotal</span>
//               <span>₦{receipt.amount.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between text-gray-500">
//               <span>Platform Fee (10%)</span>
//               <span>₦{receipt.platformFee.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between font-bold text-gray-800 text-base border-t pt-2">
//               <span>Total</span>
//               <span>₦{receipt.amount.toLocaleString()}</span>
//             </div>
//             <div className="text-center text-xs text-gray-400 mt-3">
//               Payment: {receipt.paymentMethod === 'pos_cash' ? 'Cash' : receipt.paymentMethod === 'pos_transfer' ? 'Transfer' : 'POS'}
//             </div>
//           </div>

//           <div className="flex gap-3 mt-6">
//             <button
//               onClick={printReceipt}
//               className="flex-1 flex items-center justify-center gap-2 border-2 border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50"
//             >
//               <Printer size={16} /> Print
//             </button>
//             <button
//               onClick={newSale}
//               className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700"
//             >
//               New Sale
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="grid grid-cols-1 lg:grid-cols-5 h-screen">

//         {/* Product Grid */}
//         <div className="lg:col-span-3 p-4 overflow-y-auto">
//           <div className="sticky top-0 bg-gray-50 pb-3 z-10">
//             <div className="flex items-center justify-between mb-3">
//               <h1 className="text-xl font-bold text-gray-800">POS Terminal</h1>
//               <div className="flex items-center gap-2">
//                 <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
//                   {staff.fullName}
//                 </span>
//                 <button
//                   onClick={handleClockOut}
//                   className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 transition"
//                   title="Clock out"
//                 >
//                   <LogOut size={14} />
//                 </button>
//               </div>
//             </div>
//             <div className="relative">
//               <Search size={18} className="absolute left-3 top-3 text-gray-400" />
//               <input
//                 value={search}
//                 onChange={e => setSearch(e.target.value)}
//                 placeholder="Search products..."
//                 className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
//               />
//             </div>
//           </div>
//           <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-1">
//             {filteredProducts.map(product => (
//               <button
//                 key={product._id}
//                 onClick={() => addToCart(product)}
//                 className="bg-white rounded-xl p-3 text-left shadow-sm hover:shadow-md hover:border-indigo-300 border border-transparent transition-all"
//               >
//                 <img
//                   src={product.images?.[0]?.url || '/placeholder.png'}
//                   alt={product.name}
//                   className="w-full h-24 object-cover rounded-lg mb-2"
//                 />
//                 <p className="text-xs font-semibold text-gray-800 truncate">{product.name}</p>
//                 <p className="text-indigo-600 font-bold text-sm">₦{(product.salePrice || product.price).toLocaleString()}</p>
//                 <p className="text-xs text-gray-400">Stock: {product.stockQuantity}</p>
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Cart & Checkout */}
//         <div className="lg:col-span-2 bg-white border-l border-gray-100 flex flex-col p-4">
//           <h2 className="font-bold text-gray-700 text-lg mb-3">Current Sale</h2>

//           <div className="grid grid-cols-2 gap-2 mb-4">
//             <input
//               value={customerName}
//               onChange={e => setCustomerName(e.target.value)}
//               placeholder="Customer name"
//               className="col-span-2 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//             <input
//               value={customerPhone}
//               onChange={e => setCustomerPhone(e.target.value)}
//               placeholder="Phone (optional)"
//               className="col-span-2 border border-gray-200 rounded-xl p-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
//             />
//           </div>

//           <div className="flex-1 overflow-y-auto space-y-2 mb-4">
//             {cart.length === 0 && (
//               <p className="text-center text-gray-400 text-sm py-12">Add products to begin a sale</p>
//             )}
//             {cart.map(item => (
//               <div key={item.productId} className="flex items-center gap-2 bg-gray-50 rounded-xl p-2">
//                 <div className="flex-1 min-w-0">
//                   <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
//                   <p className="text-xs text-gray-500">₦{item.price.toLocaleString()} each</p>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <button onClick={() => updateQty(item.productId, item.quantity - 1)} className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
//                     <Minus size={12} />
//                   </button>
//                   <span className="w-6 text-center text-sm font-bold">{item.quantity}</span>
//                   <button
//                     onClick={() => updateQty(item.productId, item.quantity + 1)}
//                     disabled={item.quantity >= item.stock}
//                     className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center disabled:opacity-40"
//                   >
//                     <Plus size={12} />
//                   </button>
//                 </div>
//                 <p className="text-sm font-bold text-gray-800 w-20 text-right">₦{item.subtotal.toLocaleString()}</p>
//                 <button onClick={() => updateQty(item.productId, 0)} className="text-red-400">
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//             ))}
//           </div>

//           <div className="mb-4">
//             <label className="text-xs text-gray-500 font-medium mb-1 block">Payment Method</label>
//             <div className="grid grid-cols-3 gap-2">
//               <button
//                 onClick={() => setPaymentMethod('pos_cash')}
//                 className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
//                   paymentMethod === 'pos_cash' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
//                 }`}
//               >
//                 💵 Cash
//               </button>
//               <button
//                 onClick={() => setPaymentMethod('pos_transfer')}
//                 className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
//                   paymentMethod === 'pos_transfer' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
//                 }`}
//               >
//                 🏦 Transfer
//               </button>
//               <button
//                 onClick={() => setPaymentMethod('pos_machine')}
//                 className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
//                   paymentMethod === 'pos_machine' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
//                 }`}
//               >
//                 🏦 POS
//               </button>
//             </div>
//           </div>

//           <div className="border-t pt-4 space-y-1 text-sm mb-4">
//             <div className="flex justify-between text-gray-500">
//               <span>Platform Fee (10%)</span>
//               <span>₦{platformFee.toLocaleString()}</span>
//             </div>
//             <div className="flex justify-between font-bold text-gray-800 text-xl">
//               <span>Total</span>
//               <span>₦{total.toLocaleString()}</span>
//             </div>
//           </div>

//           <button
//             onClick={handleSale}
//             disabled={cart.length === 0 || loading}
//             className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:opacity-40"
//           >
//             {loading ? 'Processing...' : `Charge ₦${total.toLocaleString()}`}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }











import { useState, useEffect, useRef } from 'react';
import api from '../../config/api';
import { Search, Plus, Minus, Trash2, Printer, CheckCircle, LogOut, KeyRound } from 'lucide-react';
import { toast } from "sonner"
import axios from 'axios';
import { useMemo } from 'react';
import { FileText, Pill, Stethoscope, Calendar, Copy, Check, Info, ShieldCheck, X, User } from 'lucide-react';

// ── Staff clock-in gate ──────────────────────────────────────────────
const StaffClockIn = ({ onClockIn }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      toast.error('Enter your 4-digit staff code.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/api/staff/pos-login', { code });
      if (!data.success) throw new Error(data.message);
      onClockIn(data.staff);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mx-auto mb-4">
          <KeyRound className="text-indigo-600" size={24} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-1">Clock In</h2>
        <p className="text-sm text-gray-400 mb-5">Enter your 4-digit staff code to start selling.</p>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          inputMode="numeric"
          autoFocus
          className="w-full text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-200 rounded-xl py-3 mb-4 focus:outline-none focus:border-indigo-500 transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
        >
          {loading ? 'Checking…' : 'Clock In'}
        </button>
      </form>
    </div>
  );
};

// ── Prescription lookup (new) ────────────────────────────────────────
// Search a client's prescription by its code (RX-XXXXXX) or by the client's name, then see which of the
// prescribed medicines are on this shop's shelf and add them to the sale.
//
// Calls  GET {VITE_EMEDICALS_URL}?q=<code or name>
// so VITE_EMEDICALS_URL must be the full search endpoint, for example
//        VITE_EMEDICALS_URL=https://your-emedicals-api.com/api/prescriptions/search
const SHOW_CLIENT_NAME = false; // set to true to show the client's name on each prescription

const RX_STATUS = {
  issued: { label: 'Issued', cls: 'bg-sky-50 text-sky-700 ring-sky-200' },
  dispensed: { label: 'Dispensed', cls: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
  partially_dispensed: { label: 'Partly dispensed', cls: 'bg-amber-50 text-amber-700 ring-amber-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-rose-50 text-rose-700 ring-rose-200' },
};

const looksLikeCode = (q) => /^rx-?[a-z0-9]*$/i.test(q.trim());

const formatRxDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

// --- matching a prescribed medicine to the products on the shelf (typo tolerant) ---
const normalizeText = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const UNIT_WORDS = new Set(['mg', 'ml', 'g', 'mcg', 'iu', 'tablet', 'tablets', 'tab', 'tabs', 'capsule', 'capsules', 'cap', 'caps', 'syrup', 'suspension', 'injection', 'cream', 'drops', 'pack', 'strip', 'bottle']);
const wordsOf = (s) => normalizeText(s).split(' ').filter((w) => w && !/^\d/.test(w) && !UNIT_WORDS.has(w));

const editDistance = (a, b, max) => {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    const cur = [i];
    for (let j = 1; j <= b.length; j += 1) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = cur;
  }
  return prev[b.length];
};

// Short words must match exactly; longer ones may have a typo ("Parecetamol" finds "Paracetamol")
const wordsMatch = (a, b) => {
  if (a === b) return true;
  const shortest = Math.min(a.length, b.length);
  const tolerance = shortest >= 8 ? 2 : shortest >= 5 ? 1 : 0;
  return tolerance > 0 && editDistance(a, b, tolerance) <= tolerance;
};

const matchScore = (medicine, product) => {
  const nm = normalizeText(medicine);
  const np = normalizeText(product?.name);
  if (!nm || !np) return 0;
  if (nm === np) return 4;
  if (Math.min(nm.length, np.length) >= 5 && (np.includes(nm) || nm.includes(np))) return 3;
  const med = wordsOf(medicine);
  if (!med.length) return 0;
  const prod = wordsOf(`${product.name} ${product.brand || ''}`);
  return med.every((m) => prod.some((p) => wordsMatch(m, p))) ? 2 : 0;
};

// Best matches first, in-stock ones ahead of sold-out ones
const findShelfMatches = (medicine, products) =>
  products
    .map((p) => ({ p, s: matchScore(medicine, p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || (b.p.stockQuantity > 0) - (a.p.stockQuantity > 0) || String(a.p.name).localeCompare(String(b.p.name)))
    .slice(0, 3)
    .map(({ p }) => p);

const PrescriptionPanel = ({ active, products, onAddToCart, onSearchShelf, onShelfIds }) => {
  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState('');
  const [copied, setCopied] = useState('');
  const controller = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (active) inputRef.current?.focus();
  }, [active]);

  // For every prescription, for every medicine: which products on the shelf match it
  const shelf = useMemo(
    () => results.map((rx) => (rx.items || []).map((item) => findShelfMatches(item.medicine, products))),
    [results, products]
  );

  // Tell the POS which products are on the prescription, so the shelf can mark them with "Rx"
  useEffect(() => {
    const ids = new Set();
    shelf.forEach((rx) => rx.forEach((matches) => matches.forEach((p) => ids.add(p._id))));
    onShelfIds(ids);
  }, [shelf, onShelfIds]);

  const search = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) {
      setPhase('error');
      setMessage("Enter at least 2 characters: a prescription code or the client's name.");
      return;
    }
    const endpoint = import.meta.env.VITE_EMEDICALS_URL;
    if (!endpoint) {
      setPhase('error');
      setMessage('Prescription search is not set up yet (VITE_EMEDICALS_URL is missing).');
      return;
    }

    controller.current?.abort(); // only the latest search counts
    controller.current = new AbortController();
    setPhase('loading');
    setMessage('');
    setSearched(q);

    try {
      const { data } = await axios.get(endpoint, { params: { q }, signal: controller.current.signal });
      if (data?.status && data.status !== 'success') throw new Error(data.message || 'The search failed.');
      setResults(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
      setPhase('done');
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === 'CanceledError') return;
      if (err?.response?.status === 404) {
        setResults([]);
        setMeta(null);
        setPhase('done');
        return;
      }
      setPhase('error');
      setMessage(err?.response?.data?.message || err?.message || 'We could not search right now. Please try again.');
    }
  };

  const clear = () => {
    controller.current?.abort();
    setQuery('');
    setPhase('idle');
    setResults([]);
    setMeta(null);
    setMessage('');
  };

  const copyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      setTimeout(() => setCopied(''), 1500);
    } catch { /* clipboard blocked */ }
  };

  const remainingOf = (item) => Math.max(0, (Number(item.quantity) || 0) - (Number(item.dispensedQty) || 0));
  const canSell = (rx) => !['cancelled', 'dispensed'].includes(rx.status);

  const addItem = (product, qty) => {
    const added = onAddToCart(product, qty);
    if (added > 0) toast.success(`${added} × ${product.name} added to the sale`);
  };

  // One tap: best in-stock match for every medicine that is still owed
  const addAll = (rx, rxIndex) => {
    let added = 0;
    let missing = 0;
    (rx.items || []).forEach((item, i) => {
      const remaining = remainingOf(item);
      if (remaining === 0) return;
      const product = shelf[rxIndex]?.[i]?.find((p) => p.stockQuantity > 0);
      if (product && onAddToCart(product, remaining) > 0) added += 1;
      else missing += 1;
    });
    if (added) toast.success(`${added} medicine${added === 1 ? '' : 's'} added to the sale${missing ? `, ${missing} not available` : ''}`);
    else toast.error('None of these medicines are in stock on your shelf');
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
            <FileText className="text-indigo-600" size={20} />
          </div>
          <div>
            <h2 className="font-bold text-gray-800">Prescription lookup</h2>
            <p className="text-xs text-gray-400">Search by prescription code (RX-A5FB3E) or the client's name.</p>
          </div>
        </div>
        <form onSubmit={search} role="search" className="flex gap-2">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Prescription code or client name"
              aria-label="Prescription code or client name"
              autoComplete="off"
              className="w-full pl-10 pr-9 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            {query && (
              <button type="button" onClick={clear} aria-label="Clear prescription search" className="absolute right-2.5 top-2.5 p-0.5 rounded-full text-gray-400 hover:text-gray-700">
                <X size={16} />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={phase === 'loading'}
            className="bg-indigo-600 text-white px-5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {phase === 'loading' ? 'Searching…' : 'Search'}
          </button>
        </form>
        {query.trim().length >= 2 && (
          <p className="text-xs font-semibold text-indigo-600 mt-2">
            {looksLikeCode(query) ? 'Searching by prescription code' : 'Searching by client name'}
          </p>
        )}
      </div>

      {/* States */}
      <div aria-live="polite">
        {phase === 'idle' && (
          <div className="flex flex-col items-center text-center py-8">
            <ShieldCheck size={32} className="text-gray-300" />
            <p className="text-sm text-gray-400 mt-3 max-w-xs">
              Prescriptions only appear here when the client has made them public or has shared the code with you.
            </p>
          </div>
        )}

        {phase === 'loading' && (
          <div className="space-y-3">
            <div className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
            <div className="h-36 rounded-2xl bg-gray-100 animate-pulse" />
          </div>
        )}

        {phase === 'error' && (
          <div role="alert" className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50 px-3 py-2.5 text-sm text-rose-700">
            <Info size={16} className="mt-0.5 shrink-0" />
            {message}
          </div>
        )}

        {phase === 'done' && results.length === 0 && (
          <div className="flex flex-col items-center text-center py-8">
            <Search size={28} className="text-gray-300" />
            <p className="font-bold text-gray-800 mt-3">No prescription found for "{searched}"</p>
            <p className="text-sm text-gray-400 mt-1 max-w-xs">
              Check the spelling, or ask the client for their prescription code. Private prescriptions are only visible with the code.
            </p>
          </div>
        )}

        {phase === 'done' && results.length > 0 && (
          <>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-sm">
              <p className="text-gray-500">
                <span className="font-bold text-gray-800">{meta?.total ?? results.length}</span>{' '}
                {(meta?.total ?? results.length) === 1 ? 'prescription' : 'prescriptions'} found
              </p>
              {meta?.via && (
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">Matched by {meta.via}</span>
              )}
            </div>

            <div className="space-y-4">
              {results.map((rx, rxIndex) => {
                const status = RX_STATUS[rx.status] || { label: String(rx.status || '').replace(/_/g, ' '), cls: 'bg-gray-50 text-gray-600 ring-gray-200' };
                const sellable = canSell(rx);
                return (
                  <article key={rx.id || rx.code} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <header className="bg-indigo-50/60 px-4 py-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] uppercase tracking-wide text-gray-400">Prescription code</p>
                          <button type="button" onClick={() => copyCode(rx.code)} aria-label={`Copy code ${rx.code}`} className="flex items-center gap-1.5 font-mono text-lg font-black text-gray-800">
                            {rx.code}
                            {copied === rx.code ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} className="text-gray-400" />}
                          </button>
                        </div>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ring-1 ${status.cls}`}>{status.label}</span>
                      </div>

                      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                        {SHOW_CLIENT_NAME && (
                          <div className="flex items-center gap-2 min-w-0">
                            <User size={14} className="text-gray-400 shrink-0" />
                            <div className="min-w-0">
                              <dt className="text-[11px] uppercase tracking-wide text-gray-400">Client</dt>
                              <dd className="text-sm font-semibold text-gray-800 truncate">{rx.patient?.name || 'Unknown'}</dd>
                            </div>
                          </div>
                        )}
                        <div className="flex items-center gap-2 min-w-0">
                          <Stethoscope size={14} className="text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <dt className="text-[11px] uppercase tracking-wide text-gray-400">Prescribed by</dt>
                            <dd className="text-sm font-semibold text-gray-800 truncate">{rx.prescribedBy || 'Unknown'}</dd>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 min-w-0">
                          <Calendar size={14} className="text-gray-400 shrink-0" />
                          <div className="min-w-0">
                            <dt className="text-[11px] uppercase tracking-wide text-gray-400">Issued</dt>
                            <dd className="text-sm font-semibold text-gray-800 truncate">{formatRxDate(rx.issuedAt)}</dd>
                          </div>
                        </div>
                      </dl>

                      {rx.purpose && (
                        <p className="mt-3 rounded-xl bg-white/80 px-3 py-2 text-sm text-gray-700">
                          <span className="font-semibold text-gray-900">What it's for: </span>
                          {rx.purpose}
                        </p>
                      )}
                    </header>

                    <div className="p-4">
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h3 className="text-sm font-bold text-gray-800">
                          Medicines <span className="font-medium text-gray-400">({rx.items?.length || 0})</span>
                        </h3>
                        {sellable && (
                          <button
                            type="button"
                            onClick={() => addAll(rx, rxIndex)}
                            className="flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700"
                          >
                            <Plus size={14} /> Add all available
                          </button>
                        )}
                      </div>

                      {!sellable && (
                        <p className="mb-3 flex items-center gap-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-700">
                          <Info size={16} className="shrink-0" />
                          {rx.status === 'cancelled' ? 'This prescription was cancelled. Do not dispense it.' : 'This prescription has already been fully dispensed.'}
                        </p>
                      )}

                      <ul className="space-y-3">
                        {(rx.items || []).map((item, i) => {
                          const qty = Number(item.quantity) || 0;
                          const done = Math.min(Number(item.dispensedQty) || 0, qty || Infinity);
                          const pct = qty ? Math.round((done / qty) * 100) : 0;
                          const remaining = remainingOf(item);
                          const matches = shelf[rxIndex]?.[i] || [];
                          return (
                            <li key={`${item.medicine}-${i}`} className="rounded-xl border border-gray-100 p-3">
                              <div className="flex items-start gap-2">
                                <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
                                  <Pill size={16} className="text-indigo-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="font-bold text-gray-800 break-words">{item.medicine}</p>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-1.5 mt-1.5">
                                    {[['Dosage', item.dosage], ['Frequency', item.frequency], ['Duration', item.duration], ['Quantity', qty || '']].map(([label, value]) =>
                                      value ? (
                                        <div key={label} className="min-w-0">
                                          <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
                                          <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
                                        </div>
                                      ) : null
                                    )}
                                  </div>
                                </div>
                              </div>

                              {item.instructions && (
                                <p className="mt-2 flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                                  <Info size={14} className="mt-0.5 shrink-0 text-gray-400" />
                                  {item.instructions}
                                </p>
                              )}

                              {qty > 0 && (
                                <div className="mt-2">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="font-semibold text-gray-500">Dispensed</span>
                                    <span className={`font-bold ${remaining === 0 ? 'text-emerald-600' : 'text-gray-700'}`}>{done} of {qty}</span>
                                  </div>
                                  <div className="mt-1 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
                                    <div className={`h-full rounded-full ${remaining === 0 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${pct}%` }} />
                                  </div>
                                </div>
                              )}

                              {/* On your shelf */}
                              <div className="mt-3 border-t border-dashed border-gray-200 pt-3">
                                <p className="text-[11px] uppercase tracking-wide text-gray-400 mb-2">On your shelf</p>
                                {matches.length === 0 ? (
                                  <div className="flex flex-wrap items-center justify-between gap-2">
                                    <p className="text-sm text-gray-500">Not on your shelf</p>
                                    <button type="button" onClick={() => onSearchShelf(item.medicine)} className="text-xs font-semibold text-indigo-600 hover:underline">
                                      Search products
                                    </button>
                                  </div>
                                ) : (
                                  <ul className="space-y-2">
                                    {matches.map((product) => {
                                      const stock = Number(product.stockQuantity) || 0;
                                      const toAdd = Math.min(remaining || 1, stock);
                                      return (
                                        <li key={product._id} className="flex items-center gap-3 rounded-lg bg-gray-50 p-2">
                                          <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} className="w-10 h-10 rounded-md object-cover" />
                                          <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{product.name}</p>
                                            <p className="text-xs text-gray-500">
                                              <span className="font-bold text-indigo-600">₦{(product.salePrice || product.price).toLocaleString()}</span>
                                              {' · '}
                                              {stock > 0 ? `Stock: ${stock}` : <span className="font-semibold text-rose-600">Out of stock</span>}
                                              {stock > 0 && remaining > stock ? ` (only ${stock} of ${remaining})` : ''}
                                            </p>
                                          </div>
                                          {sellable && remaining > 0 && (
                                            <button
                                              type="button"
                                              disabled={stock === 0}
                                              onClick={() => addItem(product, toAdd)}
                                              className="flex items-center gap-1 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-40"
                                            >
                                              <Plus size={12} /> Add {stock > 0 ? toAdd : ''}
                                            </button>
                                          )}
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </div>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default function POSPage() {
  const [staff, setStaff] = useState(() => {
    const saved = sessionStorage.getItem('posStaff');
    return saved ? JSON.parse(saved) : null;
  });

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
    api.get('/api/products').then(({ data }) => setProducts(data.products)).catch(console.error);
  }, []);

  // ── Prescription lookup (new) ──
  const [tab, setTab] = useState('products'); // 'products' | 'prescription'
  const [rxShelfIds, setRxShelfIds] = useState(() => new Set()); // products that are on the prescription being viewed

  const handleClockIn = (staffData) => {
    sessionStorage.setItem('posStaff', JSON.stringify(staffData));
    setStaff(staffData);
  };

  const handleClockOut = () => {
    sessionStorage.removeItem('posStaff');
    setStaff(null);
    setCart([]);
  };

  if (!staff) {
    return <StaffClockIn onClockIn={handleClockIn} />;
  }

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

  // ── Prescription lookup (new) ──
  // Adds a prescribed medicine to the sale, capped by what is in stock. Returns how many were added.
  const addPrescriptionItem = (product, qty = 1) => {
    const available = Number(product.stockQuantity) || 0;
    const wanted = Math.min(Math.max(1, Number(qty) || 1), available);
    if (wanted <= 0) return 0;
    const price = product.salePrice || product.price;
    setCart(prev => {
      const idx = prev.findIndex(i => i.productId === product._id);
      if (idx > -1) {
        const quantity = Math.min(prev[idx].quantity + wanted, available);
        return prev.map((i, n) => (n === idx ? { ...i, quantity, subtotal: i.price * quantity } : i));
      }
      return [...prev, {
        productId: product._id,
        name: product.name,
        price,
        quantity: wanted,
        subtotal: price * wanted,
        stock: available,
      }];
    });
    return wanted;
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
        staffId: staff.id,
        staffName: staff.fullName,
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
            <p className="text-xs text-gray-400 mt-1">Served by {staff.fullName}</p>
          </div>

          {receipt.seller && (
            <div className="mb-4 text-sm text-gray-600">
              <p>Seller: <strong>{receipt.seller?.businessName}</strong></p>
              {receipt.seller?.phone && <p>Phone: {receipt.seller?.phone}</p>}
            </div>
          )}
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
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-800">POS Terminal</h1>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-full">
                  {staff.fullName}
                </span>
                <button
                  onClick={handleClockOut}
                  className="flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-red-600 transition"
                  title="Clock out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {/* Products / Prescription tabs (new) */}
            <div className="grid grid-cols-2 gap-1 mt-3 p-1 bg-gray-100 rounded-xl" role="tablist">
              <button
                role="tab"
                aria-selected={tab === 'products'}
                onClick={() => setTab('products')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === 'products' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Pill size={14} /> Products
              </button>
              <button
                role="tab"
                aria-selected={tab === 'prescription'}
                onClick={() => setTab('prescription')}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition ${
                  tab === 'prescription' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={14} /> Prescription
              </button>
            </div>
          </div>
          {tab === 'products' && (
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
                {rxShelfIds.has(product._id) && (
                  <span className="inline-block mt-1 text-[10px] font-bold bg-indigo-600 text-white px-1.5 py-0.5 rounded">Rx</span>
                )}
              </button>
            ))}
          </div>
          )}

          {/* Prescription lookup (new). Stays mounted so a prescription you found isn't lost when you switch tabs. */}
          <div className={tab === 'prescription' ? 'mt-1' : 'hidden'}>
            <PrescriptionPanel
              active={tab === 'prescription'}
              products={products}
              onAddToCart={addPrescriptionItem}
              onSearchShelf={(name) => { setSearch(name); setTab('products'); }}
              onShelfIds={setRxShelfIds}
            />
          </div>
        </div>

        {/* Cart & Checkout */}
        <div className="lg:col-span-2 bg-white border-l border-gray-100 flex flex-col p-4">
          <h2 className="font-bold text-gray-700 text-lg mb-3">Current Sale</h2>

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

          <div className="mb-4">
            <label className="text-xs text-gray-500 font-medium mb-1 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
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
                className={`py-2 rounded-xl text-sm font-medium border-2 transition-all ${
                  paymentMethod === 'pos_machine' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 text-gray-600'
                }`}
              >
                🏦 POS
              </button>
            </div>
          </div>

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