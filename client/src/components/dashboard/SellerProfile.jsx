



import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import Loading from '../../config/Loading';
import {lagosMarkets} from "../../categories/locationCategories"
import { toast } from 'sonner';
import {
  Users, Save, Edit2, Trash2, Plus, Building2,
  Mail, Phone, MapPin, ChevronDown, ChevronUp, CheckCircle2, Store, Factory, ShoppingBag
} from 'lucide-react';
import { productCategories } from '../../categories/productCategories';

const SELLER_TYPES = [
  { id: 'manufacturer', label: 'Manufacturer', icon: Factory, desc: 'I produce goods', color: 'blue' },
  { id: 'wholesaler', label: 'Wholesaler', icon: Store, desc: 'I sell in bulk', color: 'violet' },
  { id: 'retailer', label: 'Retailer', icon: ShoppingBag, desc: 'I sell to end users', color: 'emerald' },
];

const COLOR_MAP = {
  blue: { active: 'border-blue-400 bg-blue-50', icon: 'bg-blue-100 text-blue-600', text: 'text-blue-700', check: 'text-blue-500' },
  violet: { active: 'border-violet-400 bg-violet-50', icon: 'bg-violet-100 text-violet-600', text: 'text-violet-700', check: 'text-violet-500' },
  emerald: { active: 'border-emerald-400 bg-emerald-50', icon: 'bg-emerald-100 text-emerald-600', text: 'text-emerald-700', check: 'text-emerald-500' },
};

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
      accountNumber: '',
      accountName: '',
    }
  });
  const [sellerChain, setSellerChain] = useState([]);
  const [editingChainIndex, setEditingChainIndex] = useState(null);
  const [chainForm, setChainForm] = useState({ businessName: '', email: '', phoneNumber: '', address: '', relationship: 'wholesaler' });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showChainForm, setShowChainForm] = useState(false);

  useEffect(() => {
    const fetchSellerProfile = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/seller/profile`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await res.json();
        console.log("Seller Profile Data:", data);
        if (data.success && data.sellerProfile) {
          setFormData({
            sellerTypes: data.sellerProfile.sellerTypes || [],
            productCategories: data.sellerProfile.productCategories || [],
            shopName: data.sellerProfile.shopName || '',
            shopDescription: data.sellerProfile.shopDescription || '',
            market: data.sellerProfile.market || '',
              bankDetails: {
      bankName: data.sellerProfile.bankDetails?.bankName || '',
      accountNumber: data.sellerProfile.bankDetails?.accountNumber || '',
      accountName: data.sellerProfile.bankDetails?.accountName || '',
    }
          });
          setSellerChain(data.sellerProfile.sellerChain || []);
        }
      } catch (err) { console.error(err); }
      finally { setInitialLoading(false); }
    };
    fetchSellerProfile();
  }, []);

  const toggleSellerType = (type) => setFormData(prev => ({
    ...prev,
    sellerTypes: prev.sellerTypes.includes(type) ? prev.sellerTypes.filter(t => t !== type) : [...prev.sellerTypes, type]
  }));

  const toggleProductCategory = (id) => setFormData(prev => ({
    ...prev,
    productCategories: prev.productCategories.includes(id) ? prev.productCategories.filter(c => c !== id) : [...prev.productCategories, id]
  }));

  const handleChainChange = (e) => setChainForm({ ...chainForm, [e.target.name]: e.target.value });

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
        setChainForm({ businessName: '', email: '', phoneNumber: '', address: '', relationship: 'wholesaler' });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
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

  const RELATIONSHIP_OPTIONS = ['manufacturer', 'wholesaler', 'distributor', 'retailer', 'agent'];

  return (
    <div className="w-full px-0 py-2 pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-10 h-10 rounded-xl bg-[#8B1E3F] flex items-center justify-center flex-shrink-0">
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">Seller Profile</h1>
          <p className="text-xs text-gray-400">Manage your seller identity & distribution network</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Seller Type */}
        <SectionCard title="I am a..." subtitle="Select all roles that apply to you">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
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
        value={formData.market}
        onChange={(e) => setFormData({ ...formData, market: e.target.value })}
        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:border-[#8B1E3F] focus:ring-2 focus:ring-[#8B1E3F]/10 transition-all bg-white"
      >
        <option value="">Select Market (Optional)</option>
        {lagosMarkets.map((market) => (
          <option key={market.id} value={market.name}>
            {market.name} — {market.location}
          </option>
        ))}
      </select>
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
  subtitle="For receiving payments from sales"
>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <InputField 
      label="Bank Name" 
      type="text" 
      value={formData.bankDetails.bankName}
      onChange={(e) => setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, bankName: e.target.value }
      }))}
      placeholder="e.g. GTBank, Zenith Bank"
    />

    <InputField 
      label="Account Number" 
      type="text" 
      // maxLength={10}
      value={formData.bankDetails.accountNumber}
      onChange={(e) => setFormData(prev => ({
        ...prev,
        bankDetails: { ...prev.bankDetails, accountNumber: e.target.value }
      }))}
      placeholder="0123456789"
    />

    <div className="sm:col-span-2">
      <InputField 
        label="Account Name" 
        type="text" 
        value={formData.bankDetails.accountName}
        onChange={(e) => setFormData(prev => ({
          ...prev,
          bankDetails: { ...prev.bankDetails, accountName: e.target.value }
        }))}
        placeholder="Account name as registered on bank"
      />
    </div>
  </div>
  <p className="text-xs text-amber-600 mt-3">
    ⚠️ Ensure account details are correct. This will be used for settlements.
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
              onClick={() => setShowChainForm(true)}
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
                  onClick={() => { setShowChainForm(false); setEditingChainIndex(null); setChainForm({ businessName: '', email: '', phoneNumber: '', address: '', relationship: 'wholesaler' }); }}
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
                    {RELATIONSHIP_OPTIONS.map(r => (
                      <option key={r} value={r} className="capitalize">{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
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








































