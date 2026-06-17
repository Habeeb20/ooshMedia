import { useState } from 'react';
import axios from 'axios';
import { MapPin, Package, Clock, CheckCircle, XCircle, MessageSquare, ChevronDown, ChevronUp, Loader2, Navigation } from 'lucide-react';
import api from '../../config/api';
const STATUS_BADGE = {
  pending: { label: 'Pending', cls: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'Accepted', cls: 'bg-green-100 text-green-700' },
  rejected: { label: 'Rejected', cls: 'bg-red-100 text-red-700' },
  negotiating: { label: 'Negotiating', cls: 'bg-blue-100 text-blue-700' },
  cancelled: { label: 'Cancelled', cls: 'bg-gray-100 text-gray-500' },
};

const TRACKING_LABELS = {
  awaiting_pickup: { label: 'Awaiting Pickup', step: 0 },
  on_the_way: { label: 'On the Way', step: 1 },
  arrived: { label: 'Arrived', step: 2 },
  collected: { label: 'Order Collected', step: 3 },
};

export default function RiderRequestCard({ request: initialReq, onUpdate }) {
  const [request, setRequest] = useState(initialReq);
  const [expanded, setExpanded] = useState(false);
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [counter, setCounter] = useState('');
  const [counterMsg, setCounterMsg] = useState('');
  const [deliveryCode, setDeliveryCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState('');
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const respond = async (action, extra = {}) => {
    setLoading(true);
    try {
      const { data } = await api.put(`/api/delivery/${request._id}/respond`, { action, ...extra });
      setRequest(data.request);
      onUpdate?.(data.request);
      if (action === 'negotiate') { setShowNegotiate(false); showToast('Counter-offer sent!'); }
      if (action === 'accept') showToast('Delivery accepted!');
      if (action === 'reject') showToast('Request rejected.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const updateTracking = async (status) => {
    setLoading(true);
    try {
      await api.put(`/api/delivery/${request._id}/tracking`, { trackingStatus: status });
      setRequest((r) => ({ ...r, trackingStatus: status }));
      showToast('Status updated!');
    } catch {
      showToast('Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async () => {
    if (!deliveryCode.trim()) return setCodeError('Enter delivery code');
    setLoading(true);
    setCodeError('');
    try {
      await api.post(`/api/delivery/${request._id}/verify-code`, { code: deliveryCode.trim() });
      setRequest((r) => ({ ...r, trackingStatus: 'collected' }));
      showToast('Order delivered successfully! 🎉');
      setShowVerify(false);
    } catch (err) {
      setCodeError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const latestAmount = request.negotiations?.at(-1)?.amount || request.offeredAmount;
  const badge = STATUS_BADGE[request.status];
  const trackStep = TRACKING_LABELS[request.trackingStatus]?.step ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm px-5 py-3 rounded-full shadow-lg">
          {toast}
        </div>
      )}

      {/* Card Header */}
      <button
        onClick={() => setExpanded((e) => !e)}
        className="w-full text-left p-4 flex items-start justify-between gap-3"
      >
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0 mt-0.5">
            <Package size={18} className="text-rose-900" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{request.order?.orderNumber}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${badge.cls}`}>{badge.label}</span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {request.seller?.firstName} {request.seller?.lastName}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Navigation size={11} />{request.distanceKm?.toFixed(1)} km
              </span>
              <span className="text-rose-900 font-bold text-sm">₦{latestAmount?.toLocaleString()}</span>
            </div>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400 shrink-0 mt-1" /> : <ChevronDown size={18} className="text-gray-400 shrink-0 mt-1" />}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-gray-50 p-4 space-y-4">
          {/* Route */}
          <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
            <div className="flex gap-2.5">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-rose-900 mt-0.5" />
                <div className="w-0.5 h-5 bg-gray-200 my-0.5" />
                <div className="w-3 h-3 rounded-full border-2 border-rose-900" />
              </div>
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Pickup</p>
                  <p className="text-sm text-gray-800 font-medium">{request.sellerAddress}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">Delivery</p>
                  <p className="text-sm text-gray-800 font-medium">{request.deliveryAddress}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <span className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600">
                📍 {request.distanceKm?.toFixed(1)} km
              </span>
              <span className="text-xs bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-gray-600">
                ⏱ ~{request.durationMinutes} min
              </span>
            </div>
          </div>

          {/* Negotiation History */}
          {request.negotiations?.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Offer History</p>
              <div className="space-y-2">
                {request.negotiations.map((n, i) => (
                  <div
                    key={i}
                    className={`flex ${n.from === 'rider' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                        n.from === 'rider'
                          ? 'bg-rose-900 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="font-bold">₦{n.amount?.toLocaleString()}</p>
                      {n.message && <p className="opacity-80 text-xs mt-0.5">{n.message}</p>}
                      <p className={`text-[10px] mt-1 ${n.from === 'rider' ? 'text-rose-200' : 'text-gray-400'}`}>
                        {n.from === 'rider' ? 'You' : 'Seller'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons: pending / negotiating */}
          {(request.status === 'pending' || request.status === 'negotiating') && (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => respond('accept')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 bg-rose-900 text-white font-semibold py-3 rounded-xl hover:bg-rose-800 transition-colors disabled:opacity-50 text-sm"
                >
                  <CheckCircle size={16} /> Accept
                </button>
                <button
                  onClick={() => respond('reject')}
                  disabled={loading}
                  className="flex items-center justify-center gap-1.5 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50 text-sm"
                >
                  <XCircle size={16} /> Decline
                </button>
              </div>
              <button
                onClick={() => setShowNegotiate((s) => !s)}
                className="w-full flex items-center justify-center gap-1.5 border border-rose-900 text-rose-900 font-semibold py-3 rounded-xl hover:bg-rose-50 transition-colors text-sm"
              >
                <MessageSquare size={16} /> Negotiate
              </button>

              {showNegotiate && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-3">
                  <input
                    type="number"
                    value={counter}
                    onChange={(e) => setCounter(e.target.value)}
                    placeholder="Your counter amount (₦)"
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-900/30 focus:border-rose-900"
                  />
                  <textarea
                    value={counterMsg}
                    onChange={(e) => setCounterMsg(e.target.value)}
                    placeholder="Message (optional)"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-3.5 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-rose-900/30 focus:border-rose-900"
                  />
                  <button
                    onClick={() => respond('negotiate', { counterAmount: Number(counter), message: counterMsg })}
                    disabled={loading || !counter}
                    className="w-full bg-rose-900 text-white font-semibold py-3 rounded-xl hover:bg-rose-800 transition-colors disabled:opacity-50 text-sm"
                  >
                    {loading ? 'Sending...' : 'Send Counter-Offer'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Tracking: accepted delivery */}
          {request.status === 'accepted' && (
            <div className="space-y-3">
              {/* Progress Steps */}
              <div className="relative flex items-center justify-between px-1">
                {['Pickup', 'On Way', 'Arrived', 'Collected'].map((label, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 flex-1">
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center z-10 text-xs font-bold transition-colors ${
                        i <= trackStep ? 'bg-rose-900 text-white' : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {i < trackStep ? '✓' : i + 1}
                    </div>
                    <span className={`text-[10px] text-center leading-tight ${i <= trackStep ? 'text-rose-900 font-semibold' : 'text-gray-400'}`}>
                      {label}
                    </span>
                    {i < 3 && (
                      <div
                        className={`absolute h-0.5 transition-colors ${i < trackStep ? 'bg-rose-900' : 'bg-gray-200'}`}
                        style={{ left: `${(i + 1) * 25 - 12.5}%`, right: `${(3 - i) * 25 - 12.5}%`, top: 14 }}
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* Tracking Action Buttons */}
              {request.trackingStatus === 'awaiting_pickup' && (
                <button
                  onClick={() => updateTracking('on_the_way')}
                  disabled={loading}
                  className="w-full bg-rose-900 text-white font-semibold py-3.5 rounded-xl hover:bg-rose-800 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : '🛵'} I've Picked Up the Order
                </button>
              )}
              {request.trackingStatus === 'on_the_way' && (
                <button
                  onClick={() => updateTracking('arrived')}
                  disabled={loading}
                  className="w-full bg-rose-900 text-white font-semibold py-3.5 rounded-xl hover:bg-rose-800 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : '📍'} I've Arrived
                </button>
              )}
              {request.trackingStatus === 'arrived' && !showVerify && (
                <button
                  onClick={() => setShowVerify(true)}
                  className="w-full bg-rose-900 text-white font-semibold py-3.5 rounded-xl hover:bg-rose-800 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  🔑 Enter Delivery Code
                </button>
              )}
              {showVerify && (
                <div className="bg-gray-50 rounded-xl p-3 space-y-2.5">
                  <p className="text-sm font-medium text-gray-700">Ask buyer for their delivery code</p>
                  <input
                    type="text"
                    value={deliveryCode}
                    onChange={(e) => { setDeliveryCode(e.target.value); setCodeError(''); }}
                    placeholder="Enter 4-digit code"
                    maxLength={6}
                    className={`w-full border rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-rose-900/30 ${codeError ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                  />
                  {codeError && <p className="text-sm text-red-600 text-center">{codeError}</p>}
                  <button
                    onClick={verifyCode}
                    disabled={loading || !deliveryCode}
                    className="w-full bg-rose-900 text-white font-semibold py-3 rounded-xl hover:bg-rose-800 transition-colors disabled:opacity-50 text-sm flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : '✓'} Confirm Delivery
                  </button>
                </div>
              )}
              {request.trackingStatus === 'collected' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold text-lg">🎉 Delivered!</p>
                  <p className="text-green-600 text-sm mt-1">Order completed successfully</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}