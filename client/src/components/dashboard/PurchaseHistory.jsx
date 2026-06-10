import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Package,
  Wallet,
  Loader2,
  Calendar,
  TrendingUp,
  Receipt,
} from "lucide-react";

const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}/api/seller`;

export default function PurchaseHistoryManager() {
  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const emptyForm = {
    productName: "",
    category: "",
    quantity: 1,
    unit: "",
    unitPrice: 0,
    totalAmount: 0,
    currency: "NGN",
    purchaseDate: "",
    invoiceNumber: "",
    paymentMethod: "cash",
    paymentStatus: "paid",
    deliveryDate: "",
    deliveryStatus: "delivered",
    notes: "",
    receiptUrl: "",
  };

  const [chains, setChains] = useState([]);
  const [selectedChainId, setSelectedChainId] = useState("");
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (selectedChainId) {
      fetchPurchaseHistory(selectedChainId);
    }
  }, [selectedChainId]);

  useEffect(() => {
    const total = Number(form.quantity || 0) * Number(form.unitPrice || 0);
    setForm((prev) => ({ ...prev, totalAmount: total }));
  }, [form.quantity, form.unitPrice]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${BASE_URL}/profile`, { headers });
      const sellerChains = data?.sellerProfile?.sellerChain || [];
      setChains(sellerChains);
      if (sellerChains.length) setSelectedChainId(sellerChains[0]._id);
    } catch (err) {
      toast.error("Failed to load seller profile");
    } finally {
      setLoading(false);
    }
  };

  const fetchPurchaseHistory = async (chainId) => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${BASE_URL}/seller-chain/${chainId}/purchase-history`,
        { headers }
      );
      setPurchaseHistory(data?.data || []);
    } catch (err) {
      toast.error("Failed to load purchase history");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (editingId) {
        await axios.put(
          `${BASE_URL}/seller-chain/${selectedChainId}/purchase-history/${editingId}`,
          form,
          { headers }
        );
        toast.success("Purchase updated successfully");
      } else {
        await axios.post(
          `${BASE_URL}/seller-chain/${selectedChainId}/purchase-history`,
          form,
          { headers }
        );
        toast.success("Purchase added successfully");
      }
      resetForm();
      fetchPurchaseHistory(selectedChainId);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);
    setForm({
      ...emptyForm,
      ...item,
      purchaseDate: item.purchaseDate ? item.purchaseDate.split("T")[0] : "",
      deliveryDate: item.deliveryDate ? item.deliveryDate.split("T")[0] : "",
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (historyId) => {
    if (!window.confirm("Are you sure you want to delete this purchase?")) return;
    try {
      await axios.delete(
        `${BASE_URL}/seller-chain/${selectedChainId}/purchase-history/${historyId}`,
        { headers }
      );
      toast.success("Purchase deleted successfully");
      fetchPurchaseHistory(selectedChainId);
    } catch {
      toast.error("Failed to delete purchase");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(false);
  };

  const filteredHistory = useMemo(() => {
    return purchaseHistory.filter((item) =>
      item.productName?.toLowerCase().includes(search.toLowerCase())
    );
  }, [purchaseHistory, search]);

  const totalSpent = purchaseHistory.reduce(
    (sum, item) => sum + Number(item.totalAmount || 0),
    0
  );

  const paymentMethodOptions = ["cash", "bank_transfer", "card", "mobile_money"];
  const statusOptions = ["paid", "pending", "overdue"];
  const deliveryOptions = ["delivered", "in_transit", "pending"];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Purchase History</h1>
          <p className="text-gray-500 mt-1">Track and manage all your supplier purchases</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex items-center gap-3 w-full md:w-auto">
          <div className="text-sm font-medium text-gray-500 px-3">Supplier Chain</div>
          <select
            value={selectedChainId}
            onChange={(e) => setSelectedChainId(e.target.value)}
            className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 flex-1 md:flex-none"
          >
            {chains.map((chain) => (
              <option key={chain._id} value={chain._id}>
                {chain.businessName} • {chain.relationship}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ y: -2 }}
          className="bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-3xl p-8 shadow-xl shadow-indigo-500/20"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-sm font-medium">TOTAL PURCHASES</p>
              <p className="text-5xl font-bold mt-2">{purchaseHistory.length}</p>
            </div>
            <Package className="w-14 h-14 opacity-80" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">TOTAL SPENT</p>
              <p className="text-5xl font-bold mt-2 text-gray-900">
                ₦{totalSpent.toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="bg-white border border-gray-100 rounded-3xl p-8 shadow-xl"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">AVG PER PURCHASE</p>
              <p className="text-5xl font-bold mt-2 text-gray-900">
                ₦{purchaseHistory.length ? Math.round(totalSpent / purchaseHistory.length).toLocaleString() : "0"}
              </p>
            </div>
            <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Form Section */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                {editingId ? "✍️ Edit Purchase" : "➕ New Purchase"}
              </h3>
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-sm font-medium transition-all"
                >
                  <Plus className="w-4 h-4" /> Add New
                </button>
              )}
            </div>

            <AnimatePresence>
              {(showForm || editingId) && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8"
                >
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Product Name</label>
                        <input
                          type="text"
                          value={form.productName}
                          onChange={(e) => setForm({ ...form, productName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Category</label>
                        <input
                          type="text"
                          value={form.category}
                          onChange={(e) => setForm({ ...form, category: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Quantity</label>
                        <input
                          type="number"
                          value={form.quantity}
                          onChange={(e) => setForm({ ...form, quantity: parseInt(e.target.value) || 1 })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          min="1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Unit</label>
                        <input
                          type="text"
                          value={form.unit}
                          onChange={(e) => setForm({ ...form, unit: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                          placeholder="kg, pcs, liters..."
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Unit Price (₦)</label>
                        <input
                          type="number"
                          value={form.unitPrice}
                          onChange={(e) => setForm({ ...form, unitPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Purchase Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={form.purchaseDate}
                            onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Delivery Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                          <input
                            type="date"
                            value={form.deliveryDate}
                            onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Payment Method</label>
                        <select
                          value={form.paymentMethod}
                          onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500"
                        >
                          {paymentMethodOptions.map((method) => (
                            <option key={method} value={method}>
                              {method.replace("_", " ").toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1.5">Payment Status</label>
                        <select
                          value={form.paymentStatus}
                          onChange={(e) => setForm({ ...form, paymentStatus: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.toUpperCase()}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1.5">Notes</label>
                      <textarea
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 resize-y"
                        placeholder="Additional information..."
                      />
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all"
                      >
                        {saving ? (
                          <Loader2 className="animate-spin w-5 h-5" />
                        ) : editingId ? (
                          "Update Purchase"
                        ) : (
                          "Create Purchase"
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={resetForm}
                        className="px-8 py-4 border border-gray-300 hover:bg-gray-50 rounded-2xl font-medium transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Purchase List */}
        <div className="lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by product name..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-2xl focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
            <div className="text-sm text-gray-500">
              {filteredHistory.length} of {purchaseHistory.length} records
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredHistory.map((item, index) => (
                  <motion.div
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="bg-white border border-gray-100 hover:border-gray-200 rounded-3xl p-7 group transition-all hover:shadow-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold rounded-full">
                            {item.category || "General"}
                          </div>
                          <div className="text-emerald-600 font-semibold text-lg">
                            ₦{Number(item.totalAmount || 0).toLocaleString()}
                          </div>
                        </div>

                        <h4 className="text-xl font-semibold mt-3 text-gray-900">{item.productName}</h4>
                        
                        <div className="flex gap-6 mt-4 text-sm">
                          <div>
                            <p className="text-gray-400">Qty</p>
                            <p className="font-medium">{item.quantity} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Purchase Date</p>
                            <p className="font-medium">{new Date(item.purchaseDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Status</p>
                            <p className="font-medium capitalize flex items-center gap-1">
                              <span className={`inline-block w-2 h-2 rounded-full ${item.paymentStatus === "paid" ? "bg-green-500" : "bg-amber-500"}`}></span>
                              {item.paymentStatus}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-all">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl transition-colors"
                        >
                          <Pencil size={20} />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-3 hover:bg-red-50 text-red-600 rounded-2xl transition-colors"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!filteredHistory.length && (
                <div className="bg-white border border-dashed border-gray-200 rounded-3xl py-20 text-center">
                  <Receipt className="mx-auto w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-400 text-lg">No purchases found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your search or add a new purchase</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}