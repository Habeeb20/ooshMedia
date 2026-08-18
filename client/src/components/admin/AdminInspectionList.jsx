// components/admin/AdminInspectionList.jsx
//
// Lists sellers who have paid the inspection fee, with action buttons to
// activate/deactivate addressVerified after a physical inspection, and
// separately toggle the isSuperVerify badge.

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, MapPin, ShieldCheck, Loader2, Building2 } from 'lucide-react';

export default function AdminInspectionList() {
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actioningId, setActioningId] = useState(null); // seller._id currently being updated

  useEffect(() => {
    fetchSellers();
  }, []);

  const fetchSellers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/sellers/inspections`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      const data = await res.json();
      if (data.success) setSellers(data.sellers || []);
      else toast.error(data.message || 'Could not load sellers');
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong loading sellers');
    } finally {
      setLoading(false);
    }
  };

  const toggleAddressVerified = async (seller) => {
    const action = seller.sellerProfile.addressVerified ? 'deactivate' : 'activate';
    setActioningId(seller._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/sellers/${seller._id}/address-verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'activate' ? 'Address marked as verified' : 'Address verification removed');
        setSellers(prev => prev.map(s => s._id === seller._id
          ? { ...s, sellerProfile: { ...s.sellerProfile, addressVerified: data.addressVerified } }
          : s));
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setActioningId(null);
    }
  };

  const toggleSuperVerify = async (seller) => {
    const action = seller.sellerProfile.isSuperVerify ? 'deactivate' : 'activate';
    setActioningId(seller._id);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/admin/sellers/${seller._id}/super-verify`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(action === 'activate' ? 'Seller marked as super verified' : 'Super verify removed');
        setSellers(prev => prev.map(s => s._id === seller._id
          ? { ...s, sellerProfile: { ...s.sellerProfile, isSuperVerify: data.isSuperVerify } }
          : s));
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch (err) {
      console.error(err);
      toast.error('Something went wrong');
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-gray-400 flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> Loading sellers...</div>;
  }

  if (sellers.length === 0) {
    return <div className="p-6 text-sm text-gray-400">No sellers have paid for inspection yet.</div>;
  }

  return (
    <div className="space-y-3">
      {sellers.map((seller) => {
        const sp = seller.sellerProfile || {};
        const isActioning = actioningId === seller._id;
        return (
          <div key={seller._id} className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 bg-white">
            <div className="w-10 h-10 rounded-xl bg-[#8B1E3F]/10 flex items-center justify-center flex-shrink-0">
              <Building2 size={16} className="text-[#8B1E3F]" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-gray-800 truncate">
                {sp.shopName || `${seller.firstName} ${seller.lastName}`}
              </p>
              <p className="text-xs text-gray-400 truncate">{seller.email}</p>
              <p className="text-xs text-gray-400 truncate">
                {seller.businessProfile?.businessAddress || sp.market || 'No address on file'}
              </p>
              <p className="text-[10px] text-gray-300 mt-0.5">
                Paid ₦{sp.inspectionPayment?.amount?.toLocaleString('en-NG')} on{' '}
                {sp.inspectionPayment?.paidAt ? new Date(sp.inspectionPayment.paidAt).toLocaleDateString() : '—'}
              </p>
            </div>

            <div className="flex flex-col gap-1.5 flex-shrink-0">
              <button
                type="button"
                disabled={isActioning}
                onClick={() => toggleAddressVerified(seller)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                  sp.addressVerified
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-emerald-300 hover:text-emerald-600'
                }`}
              >
                {sp.addressVerified ? <XCircle size={13} /> : <MapPin size={13} />}
                {sp.addressVerified ? 'Deactivate Address' : 'Activate Address'}
              </button>

              <button
                type="button"
                disabled={isActioning}
                onClick={() => toggleSuperVerify(seller)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-50 ${
                  sp.isSuperVerify
                    ? 'bg-violet-50 text-violet-700 border border-violet-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
                    : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-violet-300 hover:text-violet-600'
                }`}
              >
                {sp.isSuperVerify ? <XCircle size={13} /> : <ShieldCheck size={13} />}
                {sp.isSuperVerify ? 'Remove Super Verify' : 'Grant Super Verify'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}