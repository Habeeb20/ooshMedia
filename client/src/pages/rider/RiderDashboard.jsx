





import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Loader2, Radio, AlertCircle } from 'lucide-react';

import { useSocket } from '../../config/UsesSocket';
import RiderRequestCard from './RiderRequestCard';

export default function RiderDashboard() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [activeRequestId, setActiveRequestId] = useState(null);

  const locationIntervalRef = useRef(null);
  const socket = useSocket();
  const token = localStorage.getItem('token');

  // Axios instance with auth header
  const api = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    if (token) fetchRequests();
    else setLoading(false);
  }, []);

  // Socket listener
  useEffect(() => {
    if (!socket) return;

    socket.on('delivery:new_request', () => {
      fetchRequests();
    });

    return () => socket.off('delivery:new_request');
  }, [socket]);

  const fetchRequests = async () => {
    try {
      const { data } = await api.get('/api/delivery/my-requests');
      setRequests(data.requests || []);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        // Handle token expiry if needed
        console.warn("Token expired or invalid");
      }
    } finally {
      setLoading(false);
    }
  };

  const startLocationSharing = (requestId) => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported on this device');
      return;
    }

    setIsSharing(true);
    setActiveRequestId(requestId);

    locationIntervalRef.current = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
          try {
            await api.patch(`/api/delivery/${requestId}/location`, {
              lat: coords.latitude,
              lng: coords.longitude,
            });
          } catch (err) {
            console.error('Failed to update location:', err);
          }
        },
        (err) => console.error('Geolocation error:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    }, 10000); // Update every 10 seconds
  };

  const stopLocationSharing = () => {
    if (locationIntervalRef.current) {
      clearInterval(locationIntervalRef.current);
    }
    setIsSharing(false);
    setActiveRequestId(null);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, []);

  const handleUpdate = (updatedReq) => {
    setRequests((prev) =>
      prev.map((r) => (r._id === updatedReq._id ? updatedReq : r))
    );

    if (updatedReq.status === 'accepted' && !isSharing) {
      startLocationSharing(updatedReq._id);
    }
  };

  const pending = requests.filter((r) => ['pending', 'negotiating'].includes(r.status));
  const active = requests.filter((r) => r.status === 'accepted' && r.trackingStatus !== 'collected');
  const history = requests.filter((r) => ['rejected', 'cancelled'].includes(r.status) || r.trackingStatus === 'collected');

  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Delivery Requests</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {pending.length} pending · {active.length} active
              </p>
            </div>

            {isSharing && (
              <button
                onClick={stopLocationSharing}
                className="flex items-center gap-2 bg-green-100 text-green-700 text-sm font-semibold px-4 py-2 rounded-full"
              >
                <Radio size={14} className="animate-pulse" />
                Live Tracking
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-rose-600" />
          </div>
        ) : (
          <>
            {/* Warning Banner */}
            {active.length > 0 && !isSharing && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">Location sharing is disabled</p>
                  <p className="text-xs text-amber-600 mt-1">
                    Customers cannot track your movement.
                  </p>
                  <button
                    onClick={() => startLocationSharing(active[0]._id)}
                    className="mt-3 text-xs font-bold text-amber-900 underline"
                  >
                    Enable Live Location
                  </button>
                </div>
              </div>
            )}

            {/* Active Deliveries */}
            {active.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">Active Delivery</h2>
                <div className="space-y-3">
                  {active.map((r) => (
                    <RiderRequestCard key={r._id} request={r} onUpdate={handleUpdate} />
                  ))}
                </div>
              </section>
            )}

            {/* Pending Requests */}
            {pending.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">
                  Pending Requests ({pending.length})
                </h2>
                <div className="space-y-3">
                  {pending.map((r) => (
                    <RiderRequestCard key={r._id} request={r} onUpdate={handleUpdate} />
                  ))}
                </div>
              </section>
            )}

            {/* Empty State */}
            {pending.length === 0 && active.length === 0 && history.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-5xl">🛵</span>
                </div>
                <p className="font-semibold text-gray-700">No delivery requests yet</p>
                <p className="text-sm text-gray-400 mt-1">New requests will appear here</p>
              </div>
            )}

            {/* History */}
            {history.length > 0 && (
              <section>
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-3">History</h2>
                <div className="space-y-3">
                  {history.map((r) => (
                    <RiderRequestCard key={r._id} request={r} onUpdate={handleUpdate} />
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}