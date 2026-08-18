




// import { useState, useEffect, useRef } from 'react';
// import appConfig from '../../config/AppConfig';
// import Loading from '../../config/Loading';
// import {lagosMarkets} from "../../categories/locationCategories"
// import { toast } from 'sonner';
// import {
//   Users, Save, Edit2, Trash2, Plus, Building2,
//   Mail, Phone, MapPin, ChevronDown, ChevronUp, CheckCircle2, Store, Factory, ShoppingBag, Truck,
//   AlertTriangle, Loader2, ShieldCheck, XCircle
// } from 'lucide-react';
// import { productCategories } from '../../categories/productCategories';
// import InspectionPaymentButton from './InspectionButton';
// // Order matters here — index position defines seniority in the supply chain
// // (0 = most upstream, higher index = further downstream toward the end customer)
// const HIERARCHY = ['manufacturer', 'distributor', 'wholesaler', 'retailer'];

// const SELLER_TYPES = [
//   { id: 'manufacturer', label: 'Manufacturer/Importer', icon: Factory, desc: 'I produce or import goods', color: 'blue' },
//   { id: 'distributor', label: 'Distributor', icon: Truck, desc: 'I distribute goods', color: 'indigo' },
//   { id: 'wholesaler', label: 'Wholesaler', icon: Store, desc: 'I sell in bulk', color: 'violet' },
//   { id: 'retailer', label: 'Retailer', icon: ShoppingBag, desc: 'I sell to end users', color: 'emerald' },
// ];

// const COLOR_MAP = {
//   blue: { active: 'border-blue-400 bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700', check: 'text-blue-500' },
//   indigo: { active: 'border-indigo-400 bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-700', check: 'text-indigo-500' },
//   violet: { active: 'border-violet-400 bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700', check: 'text-violet-500' },
//   emerald: { active: 'border-emerald-400 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700', check: 'text-emerald-500' },
// };

// const ALL_RELATIONSHIP_OPTIONS = ['manufacturer', 'distributor', 'wholesaler', 'retailer'];

// // Returns the relationship options a seller is allowed to add to their distribution
// // network, based on the most senior (most upstream) role they've selected for
// // themselves. E.g. a wholesaler can't add a manufacturer or distributor — only
// // wholesaler, retailer, and agent remain available.
// function getAllowedRelationshipOptions(sellerTypes) {
//   if (!sellerTypes || sellerTypes.length === 0) return ALL_RELATIONSHIP_OPTIONS;

//   const indices = sellerTypes
//     .map((t) => HIERARCHY.indexOf(t))
//     .filter((i) => i !== -1);

//   if (indices.length === 0) return ALL_RELATIONSHIP_OPTIONS;

//   const minIndex = Math.min(...indices);

//   return ALL_RELATIONSHIP_OPTIONS.filter((opt) => {
//     const idx = HIERARCHY.indexOf(opt);
//     if (idx === -1) return true; // 'agent' isn't ranked, always allowed
//     return idx >= minIndex;
//   });
// }

// function SectionCard({ title, subtitle, children }) {
//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
//       <div className="px-5 py-4 border-b border-gray-50">
//         <h2 className="text-base font-bold text-gray-900">{title}</h2>
//         {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
//       </div>
//       <div className="p-5">{children}</div>
//     </div>
//   );
// }

// function InputField({ label, ...props }) {
//   return (
//     <div>
//       {label && <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>}
//       <input
//         {...props}
//         className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all"
//       />
//     </div>
//   );
// }

// export default function SellerProfileSetup() {
//   const [formData, setFormData] = useState({
//     sellerTypes: [],
//     productCategories: [],
//     shopName: '',
//     shopDescription: '',
//     market: '',
//     bankDetails: {
//       bankName: '',
//       bankCode: '',
//       accountNumber: '',
//       accountName: '',
//     }
//   });
//   const [showCustomMarket, setShowCustomMarket] = useState(false);
//   const [sellerChain, setSellerChain] = useState([]);
//   const [editingChainIndex, setEditingChainIndex] = useState(null);
//   const [chainForm, setChainForm] = useState({ businessName: '', email: '', phoneNumber: '', address: '', relationship: 'wholesaler' });
//   const [loading, setLoading] = useState(false);
//   const [initialLoading, setInitialLoading] = useState(true);
//   const [showChainForm, setShowChainForm] = useState(false);

//   // ---- Paystack bank verification state ----
//   const [banks, setBanks] = useState([]);
//   const [banksLoading, setBanksLoading] = useState(true);
//   const [banksError, setBanksError] = useState(false);
//   const [verifyingAccount, setVerifyingAccount] = useState(false);
//   const [accountVerified, setAccountVerified] = useState(false);
//   const [verifyError, setVerifyError] = useState('');
//   const verifyTimeoutRef = useRef(null);
//   const verifyRequestIdRef = useRef(0);

//   useEffect(() => {
//     const fetchSellerProfile = async () => {
//       try {
//         const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         const data = await res.json();
//         console.log("Seller Profile Data:", data);
//         if (data.success && data.sellerProfile) {
//           const marketVal = data.sellerProfile.market || '';
//           const isKnownMarket = lagosMarkets.some((m) => m.name === marketVal);
//           setShowCustomMarket(marketVal !== '' && !isKnownMarket);

//           const savedBankDetails = {
//             bankName: data.sellerProfile.bankDetails?.bankName || '',
//             bankCode: data.sellerProfile.bankDetails?.bankCode || '',
//             accountNumber: data.sellerProfile.bankDetails?.accountNumber || '',
//             accountName: data.sellerProfile.bankDetails?.accountName || '',
//           };

//           setFormData({
//             sellerTypes: data.sellerProfile.sellerTypes || [],
//             productCategories: data.sellerProfile.productCategories || [],
//             shopName: data.sellerProfile.shopName || '',
//             shopDescription: data.sellerProfile.shopDescription || '',
//             market: marketVal,
//             bankDetails: savedBankDetails,
//           });
//           setSellerChain(data.sellerProfile.sellerChain || []);

//           // If we're loading a profile that already has a verified-looking
//           // account (all three fields present), treat it as verified so we
//           // don't immediately show the "unverified" warning on page load.
//           if (savedBankDetails.bankCode && savedBankDetails.accountNumber?.length >= 10 && savedBankDetails.accountName) {
//             setAccountVerified(true);
//           }
//         }
//       } catch (err) { console.error(err); }
//       finally { setInitialLoading(false); }
//     };
//     fetchSellerProfile();
//   }, []);

//   // Fetch the list of Nigerian banks (name + Paystack bank code) from our
//   // backend, which proxies Paystack's /bank endpoint since it requires the
//   // secret key.
//   useEffect(() => {
//     const fetchBanks = async () => {
//       setBanksLoading(true);
//       setBanksError(false);
//       try {
//         const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/banks`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         const data = await res.json();
//         if (data.success) {
//           setBanks(data.banks || []);
//         } else {
//           setBanksError(true);
//         }
//       } catch (err) {
//         console.error(err);
//         setBanksError(true);
//       } finally {
//         setBanksLoading(false);
//       }
//     };
//     fetchBanks();
//   }, []);

//   const toggleSellerType = (type) => setFormData(prev => ({
//     ...prev,
//     sellerTypes: prev.sellerTypes.includes(type) ? prev.sellerTypes.filter(t => t !== type) : [...prev.sellerTypes, type]
//   }));

//   const toggleProductCategory = (id) => setFormData(prev => ({
//     ...prev,
//     productCategories: prev.productCategories.includes(id) ? prev.productCategories.filter(c => c !== id) : [...prev.productCategories, id]
//   }));

//   const handleMarketSelectChange = (e) => {
//     const val = e.target.value;
//     if (val === 'Others') {
//       setShowCustomMarket(true);
//       setFormData({ ...formData, market: '' });
//     } else {
//       setShowCustomMarket(false);
//       setFormData({ ...formData, market: val });
//     }
//   };

//   const handleChainChange = (e) => setChainForm({ ...chainForm, [e.target.name]: e.target.value });

//   // Relationship options allowed for this seller's distribution network,
//   // filtered based on the seller's own selected roles.
//   const allowedRelationshipOptions = getAllowedRelationshipOptions(formData.sellerTypes);

//   const openAddChainForm = () => {
//     setChainForm({
//       businessName: '', email: '', phoneNumber: '', address: '',
//       relationship: allowedRelationshipOptions[0] || 'retailer',
//     });
//     setEditingChainIndex(null);
//     setShowChainForm(true);
//   };

//   const addOrUpdateChain = async () => {
//     if (!chainForm.businessName || !chainForm.email) { toast.error("Business name and email are required"); return; }
//     setLoading(true);
//     try {
//       let res;
//       if (editingChainIndex !== null) {
//         res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain/${sellerChain[editingChainIndex]._id}`, {
//           method: 'PUT',
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
//           body: JSON.stringify(chainForm),
//         });
//       } else {
//         res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
//           body: JSON.stringify(chainForm),
//         });
//       }
//       const data = await res.json();
//       if (data.success) {
//         toast.success(editingChainIndex !== null ? "Chain updated!" : "Distributor added!");
//         const profileRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
//           headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//         });
//         const profileData = await profileRes.json();
//         if (profileData.success) setSellerChain(profileData.sellerProfile.sellerChain || []);
//         setEditingChainIndex(null);
//         setChainForm({ businessName: '', email: '', phoneNumber: '', address: '', relationship: allowedRelationshipOptions[0] || 'retailer' });
//         setShowChainForm(false);
//       } else { toast.error(data.message || "Operation failed"); }
//     } catch { toast.error("Something went wrong"); }
//     finally { setLoading(false); }
//   };

//   const editChain = (index) => {
//     setChainForm(sellerChain[index]);
//     setEditingChainIndex(index);
//     setShowChainForm(true);
//   };

//   const deleteChain = async (index) => {
//     if (!window.confirm("Remove this distributor?")) return;
//     setLoading(true);
//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain/${sellerChain[index]._id}`, {
//         method: 'DELETE',
//         headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
//       });
//       const data = await res.json();
//       if (data.success) { toast.success("Distributor removed"); setSellerChain(sellerChain.filter((_, i) => i !== index)); }
//       else toast.error(data.message || "Failed");
//     } catch { toast.error("Something went wrong"); }
//     finally { setLoading(false); }
//   };

//   // ---- Bank details handlers ----

//   const handleBankSelectChange = (e) => {
//     const code = e.target.value;
//     const selected = banks.find((b) => b.code === code);
//     setAccountVerified(false);
//     setVerifyError('');
//     setFormData(prev => ({
//       ...prev,
//       bankDetails: {
//         ...prev.bankDetails,
//         bankCode: code,
//         bankName: selected ? selected.name : '',
//         accountName: '', // bank changed — any previously resolved name is stale
//       }
//     }));
//   };

//   const handleAccountNumberChange = (e) => {
//     // Paystack account numbers are numeric NUBAN, 10 digits
//     const val = e.target.value.replace(/\D/g, '').slice(0, 10);
//     setAccountVerified(false);
//     setVerifyError('');
//     setFormData(prev => ({
//       ...prev,
//       bankDetails: { ...prev.bankDetails, accountNumber: val, accountName: '' }
//     }));
//   };

//   // Debounced auto-verification: fires 600ms after the seller stops typing,
//   // once we have both a 10-digit account number and a selected bank.
//   useEffect(() => {
//     const { bankCode, accountNumber } = formData.bankDetails;

//     if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);

//     if (!bankCode || accountNumber.length !== 10) {
//       setVerifyingAccount(false);
//       return;
//     }

//     verifyTimeoutRef.current = setTimeout(() => {
//       verifyAccount(bankCode, accountNumber);
//     }, 600);

//     return () => clearTimeout(verifyTimeoutRef.current);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [formData.bankDetails.bankCode, formData.bankDetails.accountNumber]);

//   const verifyAccount = async (bankCode, accountNumber) => {
//     const requestId = ++verifyRequestIdRef.current;
//     setVerifyingAccount(true);
//     setVerifyError('');
//     try {
//       const res = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/seller/verify-account?accountNumber=${accountNumber}&bankCode=${bankCode}`,
//         { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
//       );
//       const data = await res.json();

//       // Ignore stale responses if the seller kept typing/changed bank
//       if (requestId !== verifyRequestIdRef.current) return;

//       if (data.success && data.accountName) {
//         setFormData(prev => ({
//           ...prev,
//           bankDetails: { ...prev.bankDetails, accountName: data.accountName }
//         }));
//         setAccountVerified(true);
//       } else {
//         setAccountVerified(false);
//         setVerifyError(data.message || "Couldn't verify this account number. Double-check it and the bank.");
//       }
//     } catch (err) {
//       if (requestId !== verifyRequestIdRef.current) return;
//       console.error(err);
//       setAccountVerified(false);
//       setVerifyError("Couldn't reach the verification service. Try again.");
//     } finally {
//       if (requestId === verifyRequestIdRef.current) setVerifyingAccount(false);
//     }
//   };

//   const bankDetailsIncomplete = !formData.bankDetails.bankCode
//     || formData.bankDetails.accountNumber.length !== 10
//     || !formData.bankDetails.accountName
//     || !accountVerified;

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (bankDetailsIncomplete) {
//       toast.error("Add and verify your bank account before saving, or orders will pay out to the estore's default account.");
//     }

//     setLoading(true);
//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
//         method: 'PUT',
//         headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
//         body: JSON.stringify({ ...formData, sellerChain }),
//       });
//       const data = await res.json();
//       if (data.success) toast.success("Seller profile saved!");
//       else toast.error(data.message || "Update failed");
//     } catch { toast.error("Something went wrong"); }
//     finally { setLoading(false); }
//   };

//   if (initialLoading) return <Loading text="Loading seller profile..." />;

//   return (
//     <div className="w-full px-0 py-2 pb-10">
//       {/* Header */}
//       <div className="flex items-center gap-3 mb-6 px-1">
//         <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] flex items-center justify-center flex-shrink-0">
//           <Users size={18} className="text-white" />
//         </div>
//         <div>
//           <h1 className="text-xl font-bold text-gray-900 leading-tight">Seller Profile</h1>
//           <p className="text-xs text-gray-400">Manage your seller identity & distribution network</p>
//         </div>
//       </div>

//       <form onSubmit={handleSubmit} className="space-y-4">

//         {/* Seller Type */}
//         <SectionCard title="I am a..." subtitle="Select all roles that apply to you">
//           <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
//             {SELLER_TYPES.map(({ id, label, icon: Icon, desc, color }) => {
//               const isActive = formData.sellerTypes.includes(id);
//               const c = COLOR_MAP[color];
//               return (
//                 <button
//                   key={id}
//                   type="button"
//                   onClick={() => toggleSellerType(id)}
//                   className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
//                     isActive ? c.active : 'border-gray-100 hover:border-gray-200 bg-gray-50'
//                   }`}
//                 >
//                   <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${isActive ? c.icon : 'bg-gray-100 text-gray-400'}`}>
//                     <Icon size={17} />
//                   </div>
//                   <p className={`text-sm font-bold leading-tight ${isActive ? c.text : 'text-gray-700'}`}>{label}</p>
//                   <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
//                   {isActive && (
//                     <CheckCircle2 size={15} className={`absolute top-3 right-3 ${c.check}`} />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//         </SectionCard>

//         {/* Market Location Dropdown */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
//         Market Location
//       </label>
//       <select
//         value={showCustomMarket ? 'Others' : formData.market}
//         onChange={handleMarketSelectChange}
//         className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white"
//       >
//         <option value="">Select Market (Optional)</option>
//         {lagosMarkets.map((market) => (
//           <option key={market.id} value={market.name}>
//             {market.name} — {market.location}
//           </option>
//         ))}
//         <option value="Others">Others (type your own)</option>
//       </select>

//       {showCustomMarket && (
//         <input
//           type="text"
//           autoFocus
//           value={formData.market}
//           onChange={(e) => setFormData({ ...formData, market: e.target.value })}
//           placeholder="Enter your market/location"
//           className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all"
//         />
//       )}

//       <p className="text-xs text-gray-400 mt-1.5">
//         Where is your shop located? (Ladipo, Computer Village, Alaba, etc.)
//       </p>
//     </div>

//         {/* Shop Description */}
//         <SectionCard title="Shop Information" subtitle="Tell buyers about your business">
//           <div>
//             <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Shop Description</label>
//             <textarea
//               value={formData.shopDescription}
//               onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
//               rows={4}
//               className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all resize-none"
//               placeholder="What do you sell? Who are your customers? What makes you unique?"
//             />
//             <p className="text-xs text-gray-300 mt-1.5 text-right">{formData.shopDescription.length} chars</p>
//           </div>
//         </SectionCard>

//         {/* Product Categories */}
//         <SectionCard title="Product Categories" subtitle="Select the categories you sell in">
//           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
//             {productCategories.map((cat) => {
//               const isActive = formData.productCategories.includes(cat.id);
//               return (
//                 <button
//                   key={cat.id}
//                   type="button"
//                   onClick={() => toggleProductCategory(cat.id)}
//                   className={`relative p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 ${
//                     isActive
//                       ? 'border-[#8B1E3F] bg-rose-50'
//                       : 'border-gray-100 bg-gray-50 hover:border-gray-200'
//                   }`}
//                 >
//                   <span className="text-xl block mb-1.5">{cat.icon}</span>
//                   <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-[#8B1E3F]' : 'text-gray-600'}`}>{cat.name}</p>
//                   {isActive && (
//                     <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B1E3F]" />
//                   )}
//                 </button>
//               );
//             })}
//           </div>
//           {formData.productCategories.length > 0 && (
//             <p className="text-xs text-[#8B1E3F] font-semibold mt-3">
//               {formData.productCategories.length} categor{formData.productCategories.length === 1 ? 'y' : 'ies'} selected
//             </p>
//           )}
//         </SectionCard>

//         {/* ==================== BANK DETAILS ==================== */}
// <SectionCard
//   title="Bank Information"
//   subtitle="For receiving payments from sales — verified via Paystack"
// >
//   {/* Persistent warning if bank details aren't complete + verified */}
//   {bankDetailsIncomplete && (
//     <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200 bg-amber-50">
//       <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
//       <p className="text-xs text-amber-700 leading-relaxed">
//         <span className="font-bold">No verified account on file.</span> Until you add and verify a bank
//         account, payments for goods ordered from your store will be settled into the estore's default
//         account instead of yours.
//       </p>
//     </div>
//   )}

//   <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//     {/* Bank Name — select from Paystack's bank list */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bank Name</label>
//       <select
//         value={formData.bankDetails.bankCode}
//         onChange={handleBankSelectChange}
//         disabled={banksLoading}
//         className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white disabled:opacity-50"
//       >
//         <option value="">{banksLoading ? 'Loading banks...' : 'Select your bank'}</option>
//         {banks.map((bank) => (
//           <option key={bank.code} value={bank.code}>{bank.name}</option>
//         ))}
//       </select>
//       {banksError && (
//         <p className="text-xs text-red-500 mt-1.5">Couldn't load the bank list. Refresh the page to try again.</p>
//       )}
//     </div>

//     {/* Account Number */}
//     <div>
//       <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Account Number</label>
//       <div className="relative">
//         <input
//           type="text"
//           inputMode="numeric"
//           value={formData.bankDetails.accountNumber}
//           onChange={handleAccountNumberChange}
//           disabled={!formData.bankDetails.bankCode}
//           placeholder="0123456789"
//           className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all disabled:opacity-50"
//         />
//         <div className="absolute right-3 top-1/2 -translate-y-1/2">
//           {verifyingAccount && <Loader2 size={16} className="text-gray-400 animate-spin" />}
//           {!verifyingAccount && accountVerified && <ShieldCheck size={16} className="text-emerald-500" />}
//           {!verifyingAccount && !accountVerified && verifyError && <XCircle size={16} className="text-red-400" />}
//         </div>
//       </div>
//       {!formData.bankDetails.bankCode && (
//         <p className="text-xs text-gray-400 mt-1.5">Select a bank first</p>
//       )}
//     </div>

//     {/* Account Name — auto-filled and read-only, resolved by Paystack */}
//     <div className="sm:col-span-2">
//       <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Account Name</label>
//       <input
//         type="text"
//         readOnly
//         value={
//           verifyingAccount
//             ? 'Verifying...'
//             : formData.bankDetails.accountName || ''
//         }
//         placeholder="Auto-filled once your account number is verified"
//         className={`w-full px-4 py-3 rounded-xl border text-sm placeholder-gray-300 transition-all cursor-not-allowed ${
//           accountVerified
//             ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold'
//             : 'border-gray-200 bg-gray-50 text-gray-500'
//         }`}
//       />
//       {accountVerified && (
//         <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
//           <ShieldCheck size={12} /> Verified with Paystack
//         </p>
//       )}
//       {!accountVerified && verifyError && (
//         <p className="text-xs text-red-500 mt-1.5">{verifyError}</p>
//       )}
//     </div>
//   </div>

//   <p className="text-xs text-amber-600 mt-3">
//     ⚠️ This account name is resolved automatically and can't be edited — it must match what Paystack has on file for the account number and bank you select. This is what settlements will be paid into.
//   </p>
// </SectionCard>

//         {/* Distribution Chain */}
//         <SectionCard title="Distribution Network" subtitle="Add your suppliers, wholesalers, and partners">

//           {/* Chain list */}
//           {sellerChain.length > 0 && (
//             <div className="space-y-2 mb-4">
//               {sellerChain.map((chain, index) => (
//                 <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
//                   <div className="w-9 h-9 rounded-xl bg-[#8B1E3F]/10 flex items-center justify-center flex-shrink-0">
//                     <Building2 size={15} className="text-[#8B1E3F]" />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-sm font-bold text-gray-800 truncate">{chain.businessName}</p>
//                     <p className="text-xs text-gray-400 truncate">{chain.email}</p>
//                     <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-500 capitalize">
//                       {chain.relationship}
//                     </span>
//                   </div>
//                   <div className="flex gap-1 flex-shrink-0">
//                     <button type="button" onClick={() => editChain(index)} className="p-2 rounded-lg hover:bg-white hover:border hover:border-gray-200 text-gray-400 hover:text-gray-700 transition-all">
//                       <Edit2 size={14} />
//                     </button>
//                     <button type="button" onClick={() => deleteChain(index)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
//                       <Trash2 size={14} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           {/* Toggle form */}
//           {!showChainForm ? (
//             <button
//               type="button"
//               onClick={openAddChainForm}
//               className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#8B1E3F] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
//             >
//               <Plus size={15} />
//               Add Distributor
//             </button>
//           ) : (
//             <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
//               <div className="flex items-center justify-between mb-4">
//                 <p className="text-sm font-bold text-gray-700">
//                   {editingChainIndex !== null ? 'Edit Distributor' : 'New Distributor'}
//                 </p>
//                 <button
//                   type="button"
//                   onClick={() => { setShowChainForm(false); setEditingChainIndex(null); setChainForm({ businessName: '', email: '', phoneNumber: '', address: '', relationship: allowedRelationshipOptions[0] || 'retailer' }); }}
//                   className="text-xs text-gray-400 hover:text-gray-600"
//                 >
//                   Cancel
//                 </button>
//               </div>

//               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                 <InputField label="Business Name" type="text" name="businessName" value={chainForm.businessName} onChange={handleChainChange} placeholder="e.g. Ade & Sons Ltd" />
//                 <InputField label="Email" type="email" name="email" value={chainForm.email} onChange={handleChainChange} placeholder="contact@business.com" />
//                 <InputField label="Phone Number" type="tel" name="phoneNumber" value={chainForm.phoneNumber} onChange={handleChainChange} placeholder="+234 xxx xxx xxxx" />
//                 <InputField label="Address" type="text" name="address" value={chainForm.address} onChange={handleChainChange} placeholder="Business address" />
//                 <div className="sm:col-span-2">
//                   <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Relationship</label>
//                   <select
//                     name="relationship"
//                     value={chainForm.relationship}
//                     onChange={handleChainChange}
//                     className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white"
//                   >
//                     {allowedRelationshipOptions.map(r => (
//                       <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
//                     ))}
//                   </select>
//                   <p className="text-xs text-gray-400 mt-1.5">
//                     Only roles at or below your own level in the supply chain are shown.
//                   </p>
//                 </div>
//               </div>

//               <button
//                 type="button"
//                 onClick={addOrUpdateChain}
//                 disabled={loading}
//                 className="mt-4 w-full py-3 rounded-xl bg-[#8B1E3F] text-white text-sm font-bold hover:bg-[#7a1835] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
//               >
//                 {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
//                 {editingChainIndex !== null ? 'Update Distributor' : 'Add to Network'}
//               </button>
//             </div>
//           )}
//         </SectionCard>

//         {/* Save */}
//         <button
//           type="submit"
//           disabled={loading}
//           className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 bg-[#8B1E3F] hover:bg-[#7a1835] active:scale-[0.99] transition-all disabled:opacity-60"
//         >
//           {loading
//             ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
//             : <><Save size={18} /> Save Seller Profile</>
//           }
//         </button>
//       </form>
//     </div>
//   );
// }


























import { useState, useEffect, useRef } from 'react';
import appConfig from '../../config/AppConfig';
import Loading from '../../config/Loading';
import {lagosMarkets} from "../../categories/locationCategories"
import { toast } from 'sonner';
import {
  Users, Save, Edit2, Trash2, Plus, Building2,
  Mail, Phone, MapPin, ChevronDown, ChevronUp, CheckCircle2, Store, Factory, ShoppingBag, Truck,
  AlertTriangle, Loader2, ShieldCheck, XCircle
} from 'lucide-react';
import { productCategories } from '../../categories/productCategories';
import InspectionPaymentButton from './InspectionButton';
import ScrollingNoticeBanner from '../../config/scrollingNotice';
import CautionBanner from '../../config/cautionBanner';


// Order matters here — index position defines seniority in the supply chain
// (0 = most upstream, higher index = further downstream toward the end customer)
const HIERARCHY = ['manufacturer', 'distributor', 'wholesaler', 'retailer'];

const SELLER_TYPES = [
  { id: 'manufacturer', label: 'Manufacturer/Importer', icon: Factory, desc: 'I produce or import goods', color: 'blue' },
  { id: 'distributor', label: 'Distributor', icon: Truck, desc: 'I distribute goods', color: 'indigo' },
  { id: 'wholesaler', label: 'Wholesaler', icon: Store, desc: 'I sell in bulk', color: 'violet' },
  { id: 'retailer', label: 'Retailer', icon: ShoppingBag, desc: 'I sell to end users', color: 'emerald' },
];

const COLOR_MAP = {
  blue: { active: 'border-blue-400 bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700', check: 'text-blue-500' },
  indigo: { active: 'border-indigo-400 bg-indigo-50', icon: 'bg-indigo-100 text-indigo-600', text: 'text-indigo-700', check: 'text-indigo-500' },
  violet: { active: 'border-violet-400 bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700', check: 'text-violet-500' },
  emerald: { active: 'border-emerald-400 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700', check: 'text-emerald-500' },
};

const ALL_RELATIONSHIP_OPTIONS = ['manufacturer', 'distributor', 'wholesaler', 'retailer'];

// Returns the relationship options a seller is allowed to add to their distribution
// network, based on the most senior (most upstream) role they've selected for
// themselves. E.g. a wholesaler can't add a manufacturer or distributor — only
// wholesaler, retailer, and agent remain available.
function getAllowedRelationshipOptions(sellerTypes) {
  if (!sellerTypes || sellerTypes.length === 0) return ALL_RELATIONSHIP_OPTIONS;

  const indices = sellerTypes
    .map((t) => HIERARCHY.indexOf(t))
    .filter((i) => i !== -1);

  if (indices.length === 0) return ALL_RELATIONSHIP_OPTIONS;

  const minIndex = Math.min(...indices);

  return ALL_RELATIONSHIP_OPTIONS.filter((opt) => {
    const idx = HIERARCHY.indexOf(opt);
    if (idx === -1) return true; // 'agent' isn't ranked, always allowed
    return idx >= minIndex;
  });
}

function SectionCard({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-50">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InputField({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>}
      <input
        {...props}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all"
      />
    </div>
  );
}

export default function SellerProfileSetup() {
  const [formData, setFormData] = useState({
    sellerTypes: [],
    productCategories: [],
    shopName: '',
    shopDescription: '',
    market: '',
    bankDetails: {
      bankName: '',
      bankCode: '',
      accountNumber: '',
      accountName: '',
    }
  });
  const [showCustomMarket, setShowCustomMarket] = useState(false);
  const [sellerChain, setSellerChain] = useState([]);
  const [editingChainIndex, setEditingChainIndex] = useState(null);
  const [chainForm, setChainForm] = useState({ businessName: '', email: '', phoneNumber: '', address: '', relationship: 'wholesaler' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showChainForm, setShowChainForm] = useState(false);

  // ---- Inspection payment / verification badges ----
  const [sellerEmail, setSellerEmail] = useState('');
  const [inspectionPaid, setInspectionPaid] = useState(false);
  const [addressVerified, setAddressVerified] = useState(false);
  const [isSuperVerify, setIsSuperVerify] = useState(false);

  // ---- Paystack bank verification state ----
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [banksError, setBanksError] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [accountVerified, setAccountVerified] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const verifyTimeoutRef = useRef(null);
  const verifyRequestIdRef = useRef(0);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        console.log("Seller Profile Data:", data);
        if (data.success && data.sellerProfile) {
          const marketVal = data.sellerProfile.market || '';
          const isKnownMarket = lagosMarkets.some((m) => m.name === marketVal);
          setShowCustomMarket(marketVal !== '' && !isKnownMarket);

          const savedBankDetails = {
            bankName: data.sellerProfile.bankDetails?.bankName || '',
            bankCode: data.sellerProfile.bankDetails?.bankCode || '',
            accountNumber: data.sellerProfile.bankDetails?.accountNumber || '',
            accountName: data.sellerProfile.bankDetails?.accountName || '',
          };

          setFormData({
            sellerTypes: data.sellerProfile.sellerTypes || [],
            productCategories: data.sellerProfile.productCategories || [],
            shopName: data.sellerProfile.shopName || '',
            shopDescription: data.sellerProfile.shopDescription || '',
            market: marketVal,
            bankDetails: savedBankDetails,
          });
          setSellerChain(data.sellerProfile.sellerChain || []);

          // Adjust this to wherever your API actually returns the seller's
          // email from (top-level user object, data.user.email, etc.)
          setSellerEmail(data.user?.email || data.email || data.user.alternateContact || '');
          setInspectionPaid(Boolean(data.sellerProfile.inspectionPayment?.paid));
          setAddressVerified(Boolean(data.sellerProfile.addressVerified));
          setIsSuperVerify(Boolean(data.sellerProfile.isSuperVerify));

          // If we're loading a profile that already has a verified-looking
          // account (all three fields present), treat it as verified so we
          // don't immediately show the "unverified" warning on page load.
          if (savedBankDetails.bankCode && savedBankDetails.accountNumber?.length >= 10 && savedBankDetails.accountName) {
            setAccountVerified(true);
          }
        }
      } catch (err) { console.error(err); }
      finally { setInitialLoading(false); }
    };
    fetchSellerProfile();
  }, []);

  // Fetch the list of Nigerian banks (name + Paystack bank code) from our
  // backend, which proxies Paystack's /bank endpoint since it requires the
  // secret key.
  useEffect(() => {
    const fetchBanks = async () => {
      setBanksLoading(true);
      setBanksError(false);
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/banks`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        if (data.success) {
          setBanks(data.banks || []);
        } else {
          setBanksError(true);
        }
      } catch (err) {
        console.error(err);
        setBanksError(true);
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();
  }, []);

  const toggleSellerType = (type) => setFormData(prev => ({
    ...prev,
    sellerTypes: prev.sellerTypes.includes(type) ? prev.sellerTypes.filter(t => t !== type) : [...prev.sellerTypes, type]
  }));

  const toggleProductCategory = (id) => setFormData(prev => ({
    ...prev,
    productCategories: prev.productCategories.includes(id) ? prev.productCategories.filter(c => c !== id) : [...prev.productCategories, id]
  }));

  const handleMarketSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'Others') {
      setShowCustomMarket(true);
      setFormData({ ...formData, market: '' });
    } else {
      setShowCustomMarket(false);
      setFormData({ ...formData, market: val });
    }
  };

  const handleChainChange = (e) => setChainForm({ ...chainForm, [e.target.name]: e.target.value });

  // Relationship options allowed for this seller's distribution network,
  // filtered based on the seller's own selected roles.
  const allowedRelationshipOptions = getAllowedRelationshipOptions(formData.sellerTypes);

  const openAddChainForm = () => {
    setChainForm({
      businessName: '', email: '', phoneNumber: '', address: '',
      relationship: allowedRelationshipOptions[0] || 'retailer',
    });
    setEditingChainIndex(null);
    setShowChainForm(true);
  };

  const addOrUpdateChain = async () => {
    if (!chainForm.businessName || !chainForm.email) { toast.error("Business name and email are required"); return; }
    setLoading(true);
    try {
      let res;
      if (editingChainIndex !== null) {
        res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain/${sellerChain[editingChainIndex]._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(chainForm),
        });
      } else {
        res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(chainForm),
        });
      }
      const data = await res.json();
      if (data.success) {
        toast.success(editingChainIndex !== null ? "Chain updated!" : "Distributor added!");
        const profileRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const profileData = await profileRes.json();
        if (profileData.success) setSellerChain(profileData.sellerProfile.sellerChain || []);
        setEditingChainIndex(null);
        setChainForm({ businessName: '', email: '', phoneNumber: '', address: '', relationship: allowedRelationshipOptions[0] || 'retailer' });
        setShowChainForm(false);
      } else { toast.error(data.message || "Operation failed"); }
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  const editChain = (index) => {
    setChainForm(sellerChain[index]);
    setEditingChainIndex(index);
    setShowChainForm(true);
  };

  const deleteChain = async (index) => {
    if (!window.confirm("Remove this distributor?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/chain/${sellerChain[index]._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) { toast.success("Distributor removed"); setSellerChain(sellerChain.filter((_, i) => i !== index)); }
      else toast.error(data.message || "Failed");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  // ---- Bank details handlers ----

  const handleBankSelectChange = (e) => {
    const code = e.target.value;
    const selected = banks.find((b) => b.code === code);
    setAccountVerified(false);
    setVerifyError('');
    setFormData(prev => ({
      ...prev,
      bankDetails: {
        ...prev.bankDetails,
        bankCode: code,
        bankName: selected ? selected.name : '',
        accountName: '', // bank changed — any previously resolved name is stale
      }
    }));
  };

  const handleAccountNumberChange = (e) => {
    // Paystack account numbers are numeric NUBAN, 10 digits
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setAccountVerified(false);
    setVerifyError('');
    setFormData(prev => ({
      ...prev,
      bankDetails: { ...prev.bankDetails, accountNumber: val, accountName: '' }
    }));
  };

  // Debounced auto-verification: fires 600ms after the seller stops typing,
  // once we have both a 10-digit account number and a selected bank.
  useEffect(() => {
    const { bankCode, accountNumber } = formData.bankDetails;

    if (verifyTimeoutRef.current) clearTimeout(verifyTimeoutRef.current);

    if (!bankCode || accountNumber.length !== 10) {
      setVerifyingAccount(false);
      return;
    }

    verifyTimeoutRef.current = setTimeout(() => {
      verifyAccount(bankCode, accountNumber);
    }, 600);

    return () => clearTimeout(verifyTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.bankDetails.bankCode, formData.bankDetails.accountNumber]);

  const verifyAccount = async (bankCode, accountNumber) => {
    const requestId = ++verifyRequestIdRef.current;
    setVerifyingAccount(true);
    setVerifyError('');
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/seller/verify-account?accountNumber=${accountNumber}&bankCode=${bankCode}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const data = await res.json();

      // Ignore stale responses if the seller kept typing/changed bank
      if (requestId !== verifyRequestIdRef.current) return;

      if (data.success && data.accountName) {
        setFormData(prev => ({
          ...prev,
          bankDetails: { ...prev.bankDetails, accountName: data.accountName }
        }));
        setAccountVerified(true);
      } else {
        setAccountVerified(false);
        setVerifyError(data.message || "Couldn't verify this account number. Double-check it and the bank.");
      }
    } catch (err) {
      if (requestId !== verifyRequestIdRef.current) return;
      console.error(err);
      setAccountVerified(false);
      setVerifyError("Couldn't reach the verification service. Try again.");
    } finally {
      if (requestId === verifyRequestIdRef.current) setVerifyingAccount(false);
    }
  };

  const bankDetailsIncomplete = !formData.bankDetails.bankCode
    || formData.bankDetails.accountNumber.length !== 10
    || !formData.bankDetails.accountName
    || !accountVerified;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (bankDetailsIncomplete) {
      toast.error("Add and verify your bank account before saving, or orders will pay out to the estore's default account.");
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ ...formData, sellerChain }),
      });
      const data = await res.json();
      if (data.success) toast.success("Seller profile saved!");
      else toast.error(data.message || "Update failed");
    } catch { toast.error("Something went wrong"); }
    finally { setLoading(false); }
  };

  if (initialLoading) return <Loading text="Loading seller profile..." />;

  return (
    <div className="w-full px-0 py-2 pb-10">
  
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-6 px-1 flex-wrap">
            <CautionBanner />
        <div className="flex items-center gap-3">
            
          <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-white" />
          </div>
      
          <div>
            <h1 className="text-xl font-bold text-gray-900 leading-tight">Seller Profile</h1>
            <p className="text-xs text-gray-400 flex items-center gap-2 flex-wrap">
              <span>Manage your seller identity & distribution network</span>
              {addressVerified && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-bold">
                  <CheckCircle2 size={10} /> Address Verified
                </span>
              )}
              {isSuperVerify && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-[10px] font-bold">
                  <ShieldCheck size={10} /> Super Verified
                </span>
              )}
            </p>
          </div>
        </div>
         

        <InspectionPaymentButton
          sellerEmail={sellerEmail}
          paid={inspectionPaid}
          onPaid={() => setInspectionPaid(true)}
        />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">


        {/* Seller Type */}
        <SectionCard title="I am a..." subtitle="Select all roles that apply to you">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SELLER_TYPES.map(({ id, label, icon: Icon, desc, color }) => {
              const isActive = formData.sellerTypes.includes(id);
              const c = COLOR_MAP[color];
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleSellerType(id)}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 active:scale-95 ${
                    isActive ? c.active : 'border-gray-100 hover:border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${isActive ? c.icon : 'bg-gray-100 text-gray-400'}`}>
                    <Icon size={17} />
                  </div>
                  <p className={`text-sm font-bold leading-tight ${isActive ? c.text : 'text-gray-700'}`}>{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                  {isActive && (
                    <CheckCircle2 size={15} className={`absolute top-3 right-3 ${c.check}`} />
                  )}
                </button>
              );
            })}
          </div>
        </SectionCard>

        {/* Market Location Dropdown */}
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        Market Location
      </label>
      <select
        value={showCustomMarket ? 'Others' : formData.market}
        onChange={handleMarketSelectChange}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white"
      >
        <option value="">Select Market (Optional)</option>
        {lagosMarkets.map((market) => (
          <option key={market.id} value={market.name}>
            {market.name} — {market.location}
          </option>
        ))}
        <option value="Others">Others (type your own)</option>
      </select>

      {showCustomMarket && (
        <input
          type="text"
          autoFocus
          value={formData.market}
          onChange={(e) => setFormData({ ...formData, market: e.target.value })}
          placeholder="Enter your market/location"
          className="w-full mt-2 px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all"
        />
      )}

      <p className="text-xs text-gray-400 mt-1.5">
        Where is your shop located? (Ladipo, Computer Village, Alaba, etc.)
      </p>
    </div>

        {/* Shop Description */}
        <SectionCard title="Shop Information" subtitle="Tell buyers about your business">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Shop Description</label>
            <textarea
              value={formData.shopDescription}
              onChange={(e) => setFormData({ ...formData, shopDescription: e.target.value })}
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all resize-none"
              placeholder="What do you sell? Who are your customers? What makes you unique?"
            />
            <p className="text-xs text-gray-300 mt-1.5 text-right">{formData.shopDescription.length} chars</p>
          </div>
        </SectionCard>

        {/* Product Categories */}
        <SectionCard title="Product Categories" subtitle="Select the categories you sell in">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {productCategories.map((cat) => {
              const isActive = formData.productCategories.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => toggleProductCategory(cat.id)}
                  className={`relative p-3 rounded-xl border text-left transition-all duration-200 active:scale-95 ${
                    isActive
                      ? 'border-[#8B1E3F] bg-rose-50'
                      : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                  }`}
                >
                  <span className="text-xl block mb-1.5">{cat.icon}</span>
                  <p className={`text-xs font-semibold leading-tight ${isActive ? 'text-[#8B1E3F]' : 'text-gray-600'}`}>{cat.name}</p>
                  {isActive && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8B1E3F]" />
                  )}
                </button>
              );
            })}
          </div>
          {formData.productCategories.length > 0 && (
            <p className="text-xs text-[#8B1E3F] font-semibold mt-3">
              {formData.productCategories.length} categor{formData.productCategories.length === 1 ? 'y' : 'ies'} selected
            </p>
          )}
        </SectionCard>

        {/* ==================== BANK DETAILS ==================== */}
<SectionCard
  title="Bank Information"
  subtitle="For receiving payments from sales — verified via Paystack"
>
  {/* Persistent warning if bank details aren't complete + verified */}
  {bankDetailsIncomplete && (
    <div className="mb-4 flex items-start gap-2.5 p-3.5 rounded-xl border border-amber-200 bg-amber-50">
      <AlertTriangle size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
      <p className="text-xs text-amber-700 leading-relaxed">
        <span className="font-bold">No verified account on file.</span> Until you add and verify a bank
        account, payments for goods ordered from your store will be settled into the estore's default
        account instead of yours.
      </p>
    </div>
  )}

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    {/* Bank Name — select from Paystack's bank list */}
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Bank Name</label>
      <select
        value={formData.bankDetails.bankCode}
        onChange={handleBankSelectChange}
        disabled={banksLoading}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white disabled:opacity-50"
      >
        <option value="">{banksLoading ? 'Loading banks...' : 'Select your bank'}</option>
        {banks.map((bank) => (
          <option key={bank.code} value={bank.code}>{bank.name}</option>
        ))}
      </select>
      {banksError && (
        <p className="text-xs text-red-500 mt-1.5">Couldn't load the bank list. Refresh the page to try again.</p>
      )}
    </div>

    {/* Account Number */}
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Account Number</label>
      <div className="relative">
        <input
          type="text"
          inputMode="numeric"
          value={formData.bankDetails.accountNumber}
          onChange={handleAccountNumberChange}
          disabled={!formData.bankDetails.bankCode}
          placeholder="0123456789"
          className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all disabled:opacity-50"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {verifyingAccount && <Loader2 size={16} className="text-gray-400 animate-spin" />}
          {!verifyingAccount && accountVerified && <ShieldCheck size={16} className="text-emerald-500" />}
          {!verifyingAccount && !accountVerified && verifyError && <XCircle size={16} className="text-red-400" />}
        </div>
      </div>
      {!formData.bankDetails.bankCode && (
        <p className="text-xs text-gray-400 mt-1.5">Select a bank first</p>
      )}
    </div>

    {/* Account Name — auto-filled and read-only, resolved by Paystack */}
    <div className="sm:col-span-2">
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Account Name</label>
      <input
        type="text"
        readOnly
        value={
          verifyingAccount
            ? 'Verifying...'
            : formData.bankDetails.accountName || ''
        }
        placeholder="Auto-filled once your account number is verified"
        className={`w-full px-4 py-3 rounded-xl border text-sm placeholder-gray-300 transition-all cursor-not-allowed ${
          accountVerified
            ? 'border-emerald-200 bg-emerald-50 text-emerald-700 font-semibold'
            : 'border-gray-200 bg-gray-50 text-gray-500'
        }`}
      />
      {accountVerified && (
        <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1">
          <ShieldCheck size={12} /> Verified with Paystack
        </p>
      )}
      {!accountVerified && verifyError && (
        <p className="text-xs text-red-500 mt-1.5">{verifyError}</p>
      )}
    </div>
  </div>

  <p className="text-xs text-amber-600 mt-3">
    ⚠️ This account name is resolved automatically and can't be edited — it must match what Paystack has on file for the account number and bank you select. This is what settlements will be paid into.
  </p>
</SectionCard>

        {/* Distribution Chain */}
        <SectionCard title="Distribution Network" subtitle="Add your suppliers, wholesalers, and partners">

          {/* Chain list */}
          {sellerChain.length > 0 && (
            <div className="space-y-2 mb-4">
              {sellerChain.map((chain, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-[#8B1E3F]/10 flex items-center justify-center flex-shrink-0">
                    <Building2 size={15} className="text-[#8B1E3F]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-800 truncate">{chain.businessName}</p>
                    <p className="text-xs text-gray-400 truncate">{chain.email}</p>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-white border border-gray-200 text-[10px] font-semibold text-gray-500 capitalize">
                      {chain.relationship}
                    </span>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button type="button" onClick={() => editChain(index)} className="p-2 rounded-lg hover:bg-white hover:border hover:border-gray-200 text-gray-400 hover:text-gray-700 transition-all">
                      <Edit2 size={14} />
                    </button>
                    <button type="button" onClick={() => deleteChain(index)} className="p-2 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Toggle form */}
          {!showChainForm ? (
            <button
              type="button"
              onClick={openAddChainForm}
              className="w-full py-3 rounded-xl border-2 border-dashed border-gray-200 text-sm font-semibold text-gray-400 hover:border-[#8B1E3F] hover:text-[#8B1E3F] hover:bg-rose-50 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={15} />
              Add Distributor
            </button>
          ) : (
            <div className="border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-gray-700">
                  {editingChainIndex !== null ? 'Edit Distributor' : 'New Distributor'}
                </p>
                <button
                  type="button"
                  onClick={() => { setShowChainForm(false); setEditingChainIndex(null); setChainForm({ businessName: '', email: '', phoneNumber: '', address: '', relationship: allowedRelationshipOptions[0] || 'retailer' }); }}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label="Business Name" type="text" name="businessName" value={chainForm.businessName} onChange={handleChainChange} placeholder="e.g. Ade & Sons Ltd" />
                <InputField label="Email" type="email" name="email" value={chainForm.email} onChange={handleChainChange} placeholder="contact@business.com" />
                <InputField label="Phone Number" type="tel" name="phoneNumber" value={chainForm.phoneNumber} onChange={handleChainChange} placeholder="+234 xxx xxx xxxx" />
                <InputField label="Address" type="text" name="address" value={chainForm.address} onChange={handleChainChange} placeholder="Business address" />
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">Relationship</label>
                  <select
                    name="relationship"
                    value={chainForm.relationship}
                    onChange={handleChainChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white"
                  >
                    {allowedRelationshipOptions.map(r => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1.5">
                    Only roles at or below your own level in the supply chain are shown.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={addOrUpdateChain}
                disabled={loading}
                className="mt-4 w-full py-3 rounded-xl bg-[#8B1E3F] text-white text-sm font-bold hover:bg-[#7a1835] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />}
                {editingChainIndex !== null ? 'Update Distributor' : 'Add to Network'}
              </button>
            </div>
          )}
        </SectionCard>

        {/* Save */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2.5 bg-[#8B1E3F] hover:bg-[#7a1835] active:scale-[0.99] transition-all disabled:opacity-60"
        >
          {loading
            ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            : <><Save size={18} /> Save Seller Profile</>
          }
        </button>
      </form>
    </div>
  );
}