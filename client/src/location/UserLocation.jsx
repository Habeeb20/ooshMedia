// import { useEffect, useState } from "react";

// export const useUserLocation = () => {
//   const [location, setLocation] = useState(null);
//   const [address, setAddress] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!navigator.geolocation) {
//       setError("Geolocation is not supported by your browser.");
//       setLoading(false);
//       return;
//     }

//     navigator.geolocation.getCurrentPosition(
//       async (position) => {
//         try {
//           const { latitude, longitude, accuracy } = position.coords;

//           const coords = {
//             lat: latitude,
//             lng: longitude,
//             accuracy,
//           };

//           setLocation(coords);

//           // 🔥 Reverse Geocoding
//           const res = await fetch(
//             `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
//           );

//           const data = await res.json();

//           if (data.status === "OK") {
//             setAddress(data.results[0]);
//           } else {
//             setError("Unable to fetch address.");
//           }
//         } catch (err) {
//           setError("Error fetching location details.");
//         } finally {
//           setLoading(false);
//         }
//       },
//       (err) => {
//         setError(err.message);
//         setLoading(false);
//       },
//       {
//         enableHighAccuracy: true, // 🔥 key for accuracy
//         timeout: 15000,
//         maximumAge: 0,
//       }
//     );
//   }, []);

//   return { location, address, loading, error };
// };


// // utils/useUserLocation.js  ← add this function ABOVE the hook

// export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
//   const R = 6371; // Earth radius in km
//   const dLat = ((lat2 - lat1) * Math.PI) / 180;
//   const dLon = ((lon2 - lon1) * Math.PI) / 180;
//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos((lat1 * Math.PI) / 180) *
//       Math.cos((lat2 * Math.PI) / 180) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);
//   return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
// };

// src/location/UserLocation.jsx
import { useEffect, useState } from "react";
import {geocodeWithCache} from "./geoCodeCache"
// import { geocodeWithCache } from "../utils/geocodeCache";

// Haversine distance between two lat/lng points, in km
export const getDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const useUserLocation = () => {
  const [location, setLocation] = useState(null);
  const [address, setAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude, accuracy } = position.coords;

          const coords = {
            lat: latitude,
            lng: longitude,
            accuracy,
          };

          setLocation(coords);

          // Reverse geocode — cached by rounded coords (~110m precision) so
          // repeated lookups near the same spot don't re-hit the API.
          const roundedKey = `reverse|${latitude.toFixed(3)},${longitude.toFixed(3)}`;

          const fetchAddress = async () => {
            const res = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
            );
            const data = await res.json();
            if (data.status !== "OK") return null;
            return data.results[0];
          };

          const result = await geocodeWithCache(roundedKey, fetchAddress);

          if (result) {
            setAddress(result);
          } else {
            setError("Unable to fetch address.");
          }
        } catch (err) {
          setError("Error fetching location details.");
        } finally {
          setLoading(false);
        }
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  }, []);

  return { location, address, loading, error };
};