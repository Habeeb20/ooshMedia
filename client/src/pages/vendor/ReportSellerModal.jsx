// components/reports/ReportSellerModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flag, X, Loader2, CheckCircle2 } from "lucide-react";
import axios from "axios";
import appConfig from "../../config/appConfig";


const REASONS = [
  "Fake or counterfeit products",
  "Non-delivery of goods",
  "Poor product quality",
  "Fraudulent payment request",
  "Misleading product description",
  "Harassment or abusive behavior",
  "Price manipulation",
  "Other",
];

export default function ReportSellerModal({ open, onClose, sellerId, sellerName, productId, showToast }) {
  const [reason, setReason] = useState("");
  const [otherReason, setOtherReason] = useState("");
  const [description, setDescription] = useState("");
  const [incidentDate, setIncidentDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setReason(""); setOtherReason(""); setDescription(""); setIncidentDate(""); setSubmitted(false);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) return showToast?.("Please select a reason", "error");
    if (reason === "Other" && !otherReason.trim()) return showToast?.("Please describe the issue", "error");
    if (!description.trim()) return showToast?.("Please add some details", "error");

    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/reports`,
        {
          reportedSellerId: sellerId,
          reason,
          otherReason: reason === "Other" ? otherReason.trim() : undefined,
          description: description.trim(),
          incidentDate: incidentDate || undefined,
          relatedProductId: productId,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitted(true);
      showToast?.("Report submitted. Our team will review it.", "success");
    } catch (err) {
      showToast?.(err?.response?.data?.message || "Failed to submit report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="bg-white w-full sm:max-w-lg max-h-[90vh] rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                  <Flag size={18} className="text-red-500" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Report Seller</h2>
                  <p className="text-sm text-gray-500 line-clamp-1">{sellerName}</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 p-6">
              {submitted ? (
                <div className="text-center py-10">
                  <CheckCircle2 className="mx-auto text-green-500 mb-4" size={48} />
                  <p className="font-semibold text-gray-800 text-lg">Report submitted</p>
                  <p className="text-gray-500 mt-1 text-sm">
                    Thanks — our team will look into this. We'll keep your identity confidential.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-6 px-6 py-2.5 rounded-xl text-white font-semibold"
                    style={{ background: appConfig.colors.primary }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Reason for reporting
                    </label>
                    <select
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      style={{ "--tw-ring-color": appConfig.colors.primary }}
                    >
                      <option value="">Select a reason</option>
                      {REASONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>

                  {reason === "Other" && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Please specify
                      </label>
                      <input
                        type="text"
                        value={otherReason}
                        onChange={(e) => setOtherReason(e.target.value)}
                        maxLength={200}
                        required
                        placeholder="Briefly describe the reason"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      When did this happen? <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="date"
                      value={incidentDate}
                      max={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setIncidentDate(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Details
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                      rows={5}
                      maxLength={2000}
                      placeholder="Explain what happened — include order details if relevant"
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2"
                    />
                    <p className="text-xs text-gray-400 mt-1 text-right">{description.length}/2000</p>
                  </div>

                  <p className="text-xs text-gray-400">
                    Your identity is only visible to our review team, never to the seller.
                  </p>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-2xl text-white font-bold flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: appConfig.colors.primary }}
                  >
                    {submitting ? <Loader2 size={18} className="animate-spin" /> : <Flag size={18} />}
                    Submit Report
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}