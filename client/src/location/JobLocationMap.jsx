// components/upwork/JobLocationMap.jsx
import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useUserLocation } from './UserLocation';
import { useJobDistance } from './UseJobDistance';

const mapContainerStyle = {
  width: '100%',
  height: '350px',
  borderRadius: '16px',
};

export default function JobLocationMap({ lga, state, address }) {
  const { location: userLocation } = useUserLocation();
  const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, lga, state);
  const [jobCoords, setJobCoords] = useState(null);
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  // Geocode the job LGA to get coordinates for the map marker
  useEffect(() => {
    if (!lga) return;
    const geocodeLGA = async () => {
      const query = encodeURIComponent(`${lga}${state ? ', ' + state : ''}, Nigeria`);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );

      const data = await res.json();
      if (data.status === 'OK') {
        const { lat, lng } = data.results[0].geometry.location;
        setJobCoords({ lat, lng });
      }
    };
    geocodeLGA();
  }, [lga, state]);

  // Compute map center — midpoint between user and job
  const mapCenter = userLocation && jobCoords
    ? {
        lat: (userLocation.lat + jobCoords.lat) / 2,
        lng: (userLocation.lng + jobCoords.lng) / 2,
      }
    : jobCoords || { lat: 6.5244, lng: 3.3792 }; // fallback: Lagos

  // Auto zoom based on distance
  const getZoom = () => {
    if (!distanceKm) return 11;
    if (distanceKm < 2) return 14;
    if (distanceKm < 10) return 12;
    if (distanceKm < 50) return 10;
    if (distanceKm < 150) return 8;
    return 7;
  };

  if (!isLoaded) {
    return (
      <div className="w-full h-[350px] rounded-2xl bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400 animate-pulse text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Distance Summary Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        {!userLocation ? (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-100 px-4 py-2 rounded-2xl">
            📍 Enable location access to see distance
          </p>
        ) : distanceLoading ? (
          <p className="text-sm text-gray-400 animate-pulse px-4 py-2">Calculating distance...</p>
        ) : distanceKm != null ? (
          <>
            <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-medium px-4 py-2 rounded-2xl">
              📍 {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`} away
            </span>
            <span className="bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium px-4 py-2 rounded-2xl">
              🚗 ~{driveMinutes} min drive
            </span>
          </>
        ) : null}
      </div>

      {/* Map */}
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={getZoom()}
        options={{
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
          styles: [
            { featureType: 'poi', stylers: [{ visibility: 'off' }] },
          ],
        }}
      >
        {/* User Marker */}
        {userLocation && (
          <Marker
            position={{ lat: userLocation.lat, lng: userLocation.lng }}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(44, 44),
            }}
            title="Your Location"
            onClick={() => setActiveMarker('user')}
          >
            {activeMarker === 'user' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="text-sm font-medium text-gray-800">📍 Your Location</div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Job Marker */}
        {jobCoords && (
          <Marker
            position={jobCoords}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new window.google.maps.Size(44, 44),
            }}
            title={`${lga}${state ? ', ' + state : ''}`}
            onClick={() => setActiveMarker('job')}
          >
            {activeMarker === 'job' && (
              <InfoWindow onCloseClick={() => setActiveMarker(null)}>
                <div className="text-sm font-medium text-gray-800">
                  🏢 {lga}{state ? `, ${state}` : ''}
                  {address && <><br /><span className="text-gray-500 text-xs">{address}</span></>}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}

        {/* Blue Line between user and job */}
        {userLocation && jobCoords && (
          <Polyline
            path={[
              { lat: userLocation.lat, lng: userLocation.lng },
              { lat: jobCoords.lat, lng: jobCoords.lng },
            ]}
            options={{
              strokeColor: '#3B82F6',
              strokeOpacity: 0.8,
              strokeWeight: 3,
              geodesic: true,
            }}
          />
        )}
      </GoogleMap>

      {/* Legend */}
      <div className="flex items-center gap-5 text-xs text-gray-500">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          You
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          Job Location ({lga}{state ? `, ${state}` : ''})
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-0.5 bg-blue-400" />
          Distance
        </div>
      </div>
    </div>
  );
}