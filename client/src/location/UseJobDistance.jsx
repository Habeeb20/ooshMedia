// // hooks/useJobDistance.js
// import { useState, useEffect } from "react";
// import { getDistanceKm } from "./UserLocation";


// export const useJobDistance = (userLocation, lga, state) => {
//   const [distanceKm, setDistanceKm] = useState(null);
//   const [driveMinutes, setDriveMinutes] = useState(null);
//   const [distanceLoading, setDistanceLoading] = useState(false);

//   useEffect(() => {
//     if (!userLocation || !lga) return;

//     const geocodeLGA = async () => {
//       setDistanceLoading(true);
//       try {
//         const query = encodeURIComponent(`${lga}${state ? ", " + state : ""}, Nigeria`);
//         const res = await fetch(
//           `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
//         );
//         const data = await res.json();

//         if (data.status === "OK") {
//           const { lat, lng } = data.results[0].geometry.location;
//           const km = getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
//           setDistanceKm(km);
//           // Average driving speed ~40km/h in Nigerian cities
//           setDriveMinutes(Math.round((km / 40) * 60));
//         }
//       } catch (err) {
//         console.error("Distance fetch failed", err);
//       } finally {
//         setDistanceLoading(false);
//       }
//     };

//     geocodeLGA();
//   }, [userLocation, lga, state]);

//   return { distanceKm, driveMinutes, distanceLoading };
// };




// hooks/useJobDistance.js
import { useState, useEffect } from "react";
import { getDistanceKm } from "./UserLocation";
import {geocodeWithCache} from "./geoCodeCache"


export const useJobDistance = (userLocation, lga, state) => {
  const [jobCoords, setJobCoords] = useState(null);
  const [distanceKm, setDistanceKm] = useState(null);
  const [driveMinutes, setDriveMinutes] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  // Geocode the job's LGA — cached, so the same LGA never re-hits the API
  useEffect(() => {
    if (!lga) return;
    let cancelled = false;

    const cacheKey = `${lga}|${state || ""}`.toLowerCase();

    const fetchCoords = async () => {
      const query = encodeURIComponent(`${lga}${state ? ", " + state : ""}, Nigeria`);
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
      );
      const data = await res.json();
      if (data.status !== "OK") return null;
      const { lat, lng } = data.results[0].geometry.location;
      return { lat, lng };
    };

    geocodeWithCache(cacheKey, fetchCoords).then((coords) => {
      if (!cancelled && coords) setJobCoords(coords);
    });

    return () => {
      cancelled = true;
    };
  }, [lga, state]);

  // Compute distance/time once we have both the user's live position and job coords
  useEffect(() => {
    if (!userLocation || !jobCoords) return;

    setDistanceLoading(true);
    try {
      const km = getDistanceKm(userLocation.lat, userLocation.lng, jobCoords.lat, jobCoords.lng);
      setDistanceKm(km);
      // Average driving speed ~40km/h in Nigerian cities
      setDriveMinutes(Math.round((km / 40) * 60));
    } finally {
      setDistanceLoading(false);
    }
  }, [userLocation, jobCoords]);

  return { jobCoords, distanceKm, driveMinutes, distanceLoading };
};