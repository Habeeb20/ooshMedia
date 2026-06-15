import { useEffect, useRef, useState } from 'react';
import { Loader2, Phone, MapPin, Package, User } from 'lucide-react';
import axios from 'axios';
import { useSocket } from '../config/UsesSocket';


const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const TRACKING_STEPS = [
  { key: 'awaiting_pickup', label: 'Rider Assigned', icon: '📋' },
  { key: 'on_the_way', label: 'On the Way', icon: '🛵' },
  { key: 'arrived', label: 'Arrived', icon: '📍' },
  { key: 'collected', label: 'Delivered', icon: '✅' },
];

export default function DeliveryTrackingMap({ requestId, viewerRole }) {
  // viewerRole: 'buyer' | 'seller'
  const [deliveryReq, setDeliveryReq] = useState(null);
  const token = localStorage.getItem("token")
  const [loading, setLoading] = useState(true);
  const [riderPos, setRiderPos] = useState(null);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const riderMarkerRef = useRef(null);
  const socket = useSocket();

  useEffect(() => {
    fetchRequest();
  }, [requestId]);

  const fetchRequest = async () => {
    try {
      const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/delivery/${requestId}`, {
        headers: {Authorization: `Bearer ${token}`}
      });
      setDeliveryReq(data.request);
      if (data.request.riderLocation?.lat) {
        setRiderPos({ lat: data.request.riderLocation.lat, lng: data.request.riderLocation.lng });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('delivery:location_update', ({ requestId: rid, lat, lng }) => {
      if (String(rid) === String(requestId)) {
        setRiderPos({ lat, lng });
      }
    });

    socket.on('delivery:tracking_update', ({ requestId: rid, trackingStatus }) => {
      if (String(rid) === String(requestId)) {
        setDeliveryReq((r) => r ? { ...r, trackingStatus } : r);
      }
    });

    return () => {
      socket.off('delivery:location_update');
      socket.off('delivery:tracking_update');
    };
  }, [socket, requestId]);

  // Init Google Map
  useEffect(() => {
    if (!deliveryReq || !window.google) return;

    const center = riderPos || { lat: 6.5244, lng: 3.3792 }; // Lagos default

    const map = new window.google.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      disableDefaultUI: true,
      styles: [
        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
        { featureType: 'transit', stylers: [{ visibility: 'off' }] },
        { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
        { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
        { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#fafafa' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
      ],
    });
    mapInstanceRef.current = map;

    // Destination marker
    if (deliveryReq.deliveryAddress) {
      new window.google.maps.Marker({
        position: center, // will geocode below
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#881337',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 3,
        },
        title: 'Delivery Location',
      });
    }
  }, [deliveryReq]);

  // Update rider marker on position change
  useEffect(() => {
    if (!mapInstanceRef.current || !riderPos) return;

    if (!riderMarkerRef.current) {
      riderMarkerRef.current = new window.google.maps.Marker({
        position: riderPos,
        map: mapInstanceRef.current,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r="20" fill="#881337" stroke="#fff" stroke-width="3"/>
              <text x="22" y="28" text-anchor="middle" font-size="18">🛵</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(44, 44),
          anchor: new window.google.maps.Point(22, 22),
        },
        title: 'Rider',
      });
    } else {
      riderMarkerRef.current.setPosition(riderPos);
    }

    mapInstanceRef.current.panTo(riderPos);
  }, [riderPos]);

  const currentStepIdx = TRACKING_STEPS.findIndex((s) => s.key === deliveryReq?.trackingStatus);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={28} className="animate-spin text-rose-900" />
      </div>
    );
  }

  if (!deliveryReq) {
    return <div className="text-center text-gray-500 py-12">Delivery not found</div>;
  }

  const rider = deliveryReq.rider;
  const seller = deliveryReq.seller;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Map */}
      <div className="relative w-full h-64 sm:h-80 bg-gray-200">
        <div ref={mapRef} className="w-full h-full" />
        {!riderPos && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center">
              <MapPin size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">Waiting for rider location...</p>
            </div>
          </div>
        )}

        {/* Floating status chip */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-2">
          <span className="text-lg">{TRACKING_STEPS[Math.max(0, currentStepIdx)]?.icon}</span>
          <span className="text-sm font-semibold text-gray-800">{TRACKING_STEPS[Math.max(0, currentStepIdx)]?.label}</span>
        </div>
      </div>

      <div className="p-4 space-y-4 max-w-lg mx-auto">
        {/* Progress */}
        <div className="bg-white rounded-2xl p-4">
          <div className="flex items-center justify-between relative">
            <div className="absolute top-3.5 left-0 right-0 h-0.5 bg-gray-100 z-0" />
            {TRACKING_STEPS.map((step, i) => (
              <div key={step.key} className="flex flex-col items-center gap-1.5 z-10 flex-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-sm transition-all ${
                    i <= currentStepIdx ? 'bg-rose-900 text-white shadow-md shadow-rose-900/30' : 'bg-gray-100 text-gray-300'
                  }`}
                >
                  {i < currentStepIdx ? '✓' : step.icon}
                </div>
                <span
                  className={`text-[9px] text-center leading-tight font-medium ${
                    i <= currentStepIdx ? 'text-rose-900' : 'text-gray-400'
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Rider Info (buyer sees this) */}
        {viewerRole === 'buyer' && rider && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Your Rider</p>
            <div className="flex items-center gap-3">
              {rider.profileImage ? (
                <img src={rider.profileImage} alt="" className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-rose-100 flex items-center justify-center">
                  <span className="text-rose-900 font-bold text-xl">{rider.firstName?.[0]}{rider.lastName?.[0]}</span>
                </div>
              )}
              <div className="flex-1">
                <p className="font-bold text-gray-900">{rider.firstName} {rider.lastName}</p>
                {rider.riderDetails?.vehicleType && (
                  <p className="text-sm text-gray-500 mt-0.5">{rider.riderDetails.vehicleType}</p>
                )}
              </div>
              {rider.phone && (
                <a
                  href={`tel:${rider.phone}`}
                  className="w-11 h-11 rounded-full bg-rose-900 flex items-center justify-center shadow-md shadow-rose-900/20 active:scale-95 transition-transform"
                >
                  <Phone size={18} className="text-white" />
                </a>
              )}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-50 flex justify-between text-sm">
              <span className="text-gray-500">Agreed Delivery Fee</span>
              <span className="font-bold text-rose-900">₦{deliveryReq.agreedAmount?.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Seller info (buyer sees) */}
        {viewerRole === 'buyer' && seller && (
          <div className="bg-white rounded-2xl p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Seller</p>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-800">{seller.firstName} {seller.lastName}</p>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={12} />{deliveryReq.sellerAddress}
                </p>
              </div>
              {seller.phone && (
                <a
                  href={`tel:${seller.phone}`}
                  className="w-10 h-10 rounded-full border border-rose-200 flex items-center justify-center"
                >
                  <Phone size={16} className="text-rose-900" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Order Summary */}
        <div className="bg-white rounded-2xl p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Order</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Order No.</span>
              <span className="font-semibold text-gray-900">{deliveryReq.order?.orderNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery To</span>
              <span className="font-semibold text-gray-900 text-right max-w-[60%]">{deliveryReq.deliveryAddress}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status</span>
              <span
                className={`font-semibold ${
                  deliveryReq.trackingStatus === 'collected' ? 'text-green-600' : 'text-rose-900'
                }`}
              >
                {TRACKING_STEPS.find((s) => s.key === deliveryReq.trackingStatus)?.label}
              </span>
            </div>
          </div>
        </div>

        {/* Delivered state */}
        {deliveryReq.trackingStatus === 'collected' && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-4xl mb-2">🎉</p>
            <p className="font-bold text-green-800 text-lg">Order Delivered!</p>
            <p className="text-sm text-green-600 mt-1">Your order was delivered successfully.</p>
          </div>
        )}
      </div>
    </div>
  );
}