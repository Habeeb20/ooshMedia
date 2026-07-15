// src/components/dashboard/ControlRoom.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  UserPlus, Copy, Trash2, Power, LogOut, Loader2,
  Eye, EyeOff, ChevronDown
} from 'lucide-react';
import StaffSalesDashboard from './StaffSalesDashboard';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const SIDEBAR_LABELS = {
  stock: 'Stock',
  inventory: 'Stock Management',
  POS: 'POS',
  sellerDelivery: 'Delivery Panel',
  deliveryTracking: 'Delivery Tracking',
  sellerChain: 'Seller Chain History',
  products: 'Products',
  customerAnalytics: 'Sales Analytics',
};
const SIDEBAR_KEYS = Object.keys(SIDEBAR_LABELS);

const authHeaders = (token) => ({ headers: { Authorization: `Bearer ${token}` } });

const ControlRoom = ({ token, onExit }) => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [visibleCodes, setVisibleCodes] = useState({});
  const [expandedPerms, setExpandedPerms] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phoneNumber: '', age: '', role: '' });

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/staff`, authHeaders(token));
      setStaffList(data.staff || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not load staff.');
      if (err.response?.status === 401) onExit();
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!form.fullName || !form.email) {
      toast.error('Full name and email are required.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await axios.post(`${API_BASE_URL}/api/staff`, form, authHeaders(token));
      if (!data.success) throw new Error(data.message);
      toast.success('Staff added — their code has been emailed to them.');
      setForm({ fullName: '', email: '', phoneNumber: '', age: '', role: '' });
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not add staff.');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleActive = async (id) => {
    try {
      const { data } = await axios.put(`${API_BASE_URL}/api/staff/${id}/active`, {}, authHeaders(token));
      if (!data.success) throw new Error(data.message);
      setStaffList((prev) => prev.map((s) => (s._id === id ? data.staff : s)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update status.');
    }
  };

  const removeStaff = async (id) => {
    if (!window.confirm('Remove this staff member? This cannot be undone.')) return;
    try {
      const { data } = await axios.delete(`${API_BASE_URL}/api/staff/${id}`, authHeaders(token));
      if (!data.success) throw new Error(data.message);
      setStaffList((prev) => prev.filter((s) => s._id !== id));
      toast.success('Staff removed.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove staff.');
    }
  };

  const togglePermission = async (staff, key) => {
    const updated = { ...staff.permissions, [key]: !staff.permissions?.[key] };
    try {
      const { data } = await axios.put(
        `${API_BASE_URL}/api/staff/${staff._id}/permissions`,
        { permissions: updated },
        authHeaders(token)
      );
      if (!data.success) throw new Error(data.message);
      setStaffList((prev) => prev.map((s) => (s._id === staff._id ? data.staff : s)));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not update permission.');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Code copied.');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Control Room</h2>
          <p className="text-sm text-gray-500">Manage staff access and track their sales.</p>
        </div>
        <button
          type="button"
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-red-600 transition"
        >
          <LogOut size={15} /> Exit
        </button>
      </div>

      {/* Sales dashboard */}
      <StaffSalesDashboard token={token} />

      {/* Staff management */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-900">Staff ({staffList.length})</h3>
          <button
            type="button"
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 text-sm font-semibold px-3.5 py-2 rounded-xl bg-[#8B1E3F] text-white hover:bg-[#701733] transition"
          >
            <UserPlus size={15} /> Add Staff
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleAddStaff} className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5 p-4 bg-gray-50 rounded-xl">
            <input
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <input
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <input
              placeholder="Phone number"
              value={form.phoneNumber}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <input
              placeholder="Age"
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
            <input
              placeholder="Role (e.g. Cashier)"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-200 sm:col-span-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="sm:col-span-2 py-2.5 bg-[#8B1E3F] text-white text-sm font-semibold rounded-lg hover:bg-[#701733] transition disabled:opacity-60"
            >
              {submitting ? 'Adding…' : 'Add Staff & Send Code'}
            </button>
          </form>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-10 text-gray-400 gap-2">
            <Loader2 className="animate-spin" size={18} /> Loading staff…
          </div>
        ) : staffList.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-10">No staff added yet.</p>
        ) : (
          <div className="space-y-2">
            {staffList.map((staff) => (
              <div key={staff._id} className="border border-gray-100 rounded-xl overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {staff.fullName}
                      {staff.role && <span className="ml-2 text-xs font-medium text-gray-400">{staff.role}</span>}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{staff.email} {staff.phoneNumber ? `· ${staff.phoneNumber}` : ''}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setVisibleCodes((v) => ({ ...v, [staff._id]: !v[staff._id] }))}
                      className="flex items-center gap-1.5 text-xs font-mono font-bold bg-gray-50 border border-gray-200 px-2.5 py-1.5 rounded-lg"
                    >
                      {visibleCodes[staff._id] ? staff.code : '••••'}
                      {visibleCodes[staff._id] ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => copyCode(staff.code)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 transition"
                      title="Copy code"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(staff._id)}
                      className={`p-1.5 rounded-lg transition ${staff.isActive ? 'text-emerald-600 hover:bg-emerald-50' : 'text-gray-400 hover:bg-gray-100'}`}
                      title={staff.isActive ? 'Active — click to disable' : 'Disabled — click to enable'}
                    >
                      <Power size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeStaff(staff._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      title="Remove staff"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedPerms(expandedPerms === staff._id ? null : staff._id)}
                      className="p-1.5 text-gray-400 hover:text-gray-700 transition"
                    >
                      <ChevronDown size={14} className={`transition-transform ${expandedPerms === staff._id ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {expandedPerms === staff._id && (
                  <div className="border-t border-gray-100 bg-gray-50/60 p-3.5">
                    <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500 mb-2">
                      Visible sidebar sections
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {SIDEBAR_KEYS.map((key) => (
                        <label
                          key={key}
                          className="flex items-center gap-2 text-xs font-medium text-gray-600 bg-white border border-gray-150 rounded-lg px-2.5 py-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={!!staff.permissions?.[key]}
                            onChange={() => togglePermission(staff, key)}
                            className="accent-[#8B1E3F]"
                          />
                          {SIDEBAR_LABELS[key]}
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ControlRoom;