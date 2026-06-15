import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, MapPin, Star, Phone, Send, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

export default function RiderListModal({ order, sellerAddress, onClose, onRequestSent }) {
  const [riders, setRiders] = useState([]);
  const [loadingRiders, setLoadingRiders] = useState(true);
  const [selectedRider, setSelectedRider] = useState(null);
  const [distance, setDistance] = useState(null);
  const [calculatingDistance, setCalculatingDistance] = useState(false);
  const [offeredAmount, setOfferedAmount] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
const token = localStorage.getItem('token')
  useEffect(() => {
    fetchRiders();
  }, []);

  const fetchRiders = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/riders`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      setRiders(data.riders);
    } catch {
      setError('Failed to load riders');
    } finally {
      setLoadingRiders(false);
    }
  };

  const handleSelectRider = async (rider) => {
    setSelectedRider(rider);
    setDistance(null);
    setCalculatingDistance(true);
    try {
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/calculate-distance`, {
        origin: sellerAddress,
        destination: order.delivery.address,
      }, {
        headers: {Authorization: `Bearer ${token}`
      }
      });
      setDistance(data);
      setOfferedAmount(String(data.suggestedFee));
    } catch(err) {
        console.log(err)
      setError('Could not calculate distance');
    } finally {
      setCalculatingDistance(false);
    }
  };

  const handleSendRequest = async () => {
    if (!offeredAmount || isNaN(offeredAmount))
      return setError('Enter a valid amount');
    setSending(true);
    setError('');
    try {
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/request`, {
        orderId: order._id,
        riderId: selectedRider._id,
        offeredAmount: Number(offeredAmount),
        sellerAddress,
        distanceKm: distance?.distanceKm,
        durationMinutes: distance?.durationMinutes,
      }, {
        headers: {
            Authorization: `Bearer ${token}`
        }
      });
      onRequestSent?.();
      onClose();
    } catch (err) {
        console.log(err.response.data.message)
      setError(err.response?.data?.message || 'Failed to send request');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Assign a Rider</h2>
            <p className="text-sm text-gray-500 mt-0.5">Order #{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl p-3">{error}</div>
          )}

          {loadingRiders ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={28} className="animate-spin text-rose-900" />
            </div>
          ) : riders.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No riders available right now</p>
          ) : (
            riders.map((rider) => (
              <div key={rider._id}>
                <button
                  onClick={() => handleSelectRider(rider)}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                    selectedRider?._id === rider._id
                      ? 'border-rose-900 bg-rose-50'
                      : 'border-gray-100 bg-gray-50 hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      {rider.profileImage ? (
                        <img src={rider.profileImage} alt="" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                          <span className="text-rose-900 font-bold text-lg">
                            {rider.firstName?.[0]}{rider.lastName?.[0]}
                          </span>
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">
                        {rider.firstName} {rider.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">@{rider.username}</p>
                      {rider.averageRating && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star size={12} className="fill-amber-400 stroke-amber-400" />
                          <span className="text-xs text-gray-600">{rider.averageRating.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0">
                      {selectedRider?._id === rider._id ? (
                        <ChevronUp size={18} className="text-rose-900" />
                      ) : (
                        <ChevronDown size={18} className="text-gray-400" />
                      )}
                    </div>
                  </div>

                  {rider.phone && (
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-gray-500">
                      <Phone size={13} />
                      <span>{rider.phone}</span>
                    </div>
                  )}
                </button>

                {/* Expanded: distance + offer */}
                {selectedRider?._id === rider._id && (
                  <div className="mt-2 rounded-2xl border border-rose-100 bg-white p-4 space-y-4">
                    {calculatingDistance ? (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader2 size={14} className="animate-spin" />
                        Calculating distance...
                      </div>
                    ) : distance ? (
                      <>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">Distance</p>
                            <p className="font-bold text-gray-900 text-sm">{distance.distanceText}</p>
                          </div>
                          <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-gray-500 mb-1">ETA</p>
                            <p className="font-bold text-gray-900 text-sm">{distance.durationText}</p>
                          </div>
                          <div className="bg-rose-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-rose-700 mb-1">Suggested</p>
                            <p className="font-bold text-rose-900 text-sm">₦{distance.suggestedFee?.toLocaleString()}</p>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Your Offer (₦)
                          </label>
                          <input
                            type="number"
                            value={offeredAmount}
                            onChange={(e) => setOfferedAmount(e.target.value)}
                            placeholder="Enter delivery fee offer"
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-900/30 focus:border-rose-900"
                          />
                        </div>

                        <div className="bg-gray-50 rounded-xl p-3 space-y-1 text-sm">
                          <div className="flex justify-between text-gray-500">
                            <span>Pickup</span>
                            <span className="text-gray-900 text-right max-w-[60%] truncate">{sellerAddress}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Delivery</span>
                            <span className="text-gray-900 text-right max-w-[60%] truncate">{order.delivery?.address}</span>
                          </div>
                        </div>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer CTA */}
        {selectedRider && distance && (
          <div className="p-5 border-t border-gray-100 shrink-0">
            <button
              onClick={handleSendRequest}
              disabled={sending}
              className="w-full bg-rose-900 text-white font-semibold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-800 active:scale-[.98] transition-all disabled:opacity-60"
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {sending ? 'Sending...' : `Send Request — ₦${Number(offeredAmount || 0).toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}