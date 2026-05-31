// hooks/useJobDistance.js
import { useState, useEffect } from "react";
import { getDistanceKm } from "./UserLocation";


export const useJobDistance = (userLocation, lga, state) => {
  const [distanceKm, setDistanceKm] = useState(null);
  const [driveMinutes, setDriveMinutes] = useState(null);
  const [distanceLoading, setDistanceLoading] = useState(false);

  useEffect(() => {
    if (!userLocation || !lga) return;

    const geocodeLGA = async () => {
      setDistanceLoading(true);
      try {
        const query = encodeURIComponent(`${lga}${state ? ", " + state : ""}, Nigeria`);
        const res = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${query}&key=${import.meta.env.VITE_GOOGLE_MAPS_API_KEY}`
        );
        const data = await res.json();

        if (data.status === "OK") {
          const { lat, lng } = data.results[0].geometry.location;
          const km = getDistanceKm(userLocation.lat, userLocation.lng, lat, lng);
          setDistanceKm(km);
          // Average driving speed ~40km/h in Nigerian cities
          setDriveMinutes(Math.round((km / 40) * 60));
        }
      } catch (err) {
        console.error("Distance fetch failed", err);
      } finally {
        setDistanceLoading(false);
      }
    };

    geocodeLGA();
  }, [userLocation, lga, state]);

  return { distanceKm, driveMinutes, distanceLoading };
};