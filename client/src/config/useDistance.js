// import { useEffect, useState } from "react";
// import { loadGoogleMaps } from "./LoadGoogleMap";


// // module-level cache so identical origin+destination pairs across cards
// // in the same grid don't fire duplicate billed API calls
// const cache = new Map();

// export default function useDistance(userLocation, destinationAddress) {
//   const [distanceText, setDistanceText] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (!userLocation || !destinationAddress) return;

//     const cacheKey = `${userLocation.lat},${userLocation.lng}|${destinationAddress}`;
//     if (cache.has(cacheKey)) {
//       setDistanceText(cache.get(cacheKey));
//       return;
//     }

//     let mounted = true;
//     setLoading(true);

//     loadGoogleMaps()
//       .then((maps) => {
//         const service = new maps.DistanceMatrixService();
//         service.getDistanceMatrix(
//           {
//             origins: [new maps.LatLng(userLocation.lat, userLocation.lng)],
//             destinations: [destinationAddress],
//             travelMode: maps.TravelMode.DRIVING,
//             unitSystem: maps.UnitSystem.METRIC,
//           },
//           (response, status) => {
//             if (!mounted) return;
//             setLoading(false);

//             if (status !== "OK") return;

//             const result = response.rows?.[0]?.elements?.[0];
//             if (result?.status === "OK") {
//               const text = result.distance.text;
//               cache.set(cacheKey, text);
//               setDistanceText(text);
//             }
//           }
//         );
//       })
//       .catch(() => mounted && setLoading(false));

//     return () => {
//       mounted = false;
//     };
//   }, [userLocation, destinationAddress]);

//   return { distanceText, loading };
// }

import { useEffect, useState } from "react";

import { loadGoogleMaps } from "./LoadGoogleMap";
const cache = new Map();

export default function useDistance(userLocation, destinationAddress) {
  const [distanceText, setDistanceText] = useState(null);
  const [durationText, setDurationText] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userLocation || !destinationAddress) return;

    const cacheKey = `${userLocation.lat},${userLocation.lng}|${destinationAddress}`;
    if (cache.has(cacheKey)) {
      const cached = cache.get(cacheKey);
      setDistanceText(cached.distanceText);
      setDurationText(cached.durationText);
      return;
    }

    let mounted = true;
    setLoading(true);

    loadGoogleMaps()
      .then(() => {
        // loadGoogleMaps resolves with no value — read the loaded API off window instead
        const maps = window.google?.maps;
        if (!maps) {
          console.log("window.google.maps not available after load");
          setLoading(false);
          return;
        }

        const service = new maps.DistanceMatrixService();
        service.getDistanceMatrix(
          {
            origins: [new maps.LatLng(userLocation.lat, userLocation.lng)],
            destinations: [destinationAddress],
            travelMode: maps.TravelMode.DRIVING,
            unitSystem: maps.UnitSystem.METRIC,
          },
          (response, status) => {
            if (!mounted) return;
            setLoading(false);

            if (status !== "OK") {
              console.log("DistanceMatrix status:", status);
              return;
            }

            const result = response.rows?.[0]?.elements?.[0];
            if (result?.status !== "OK") {
              console.log("DistanceMatrix element status:", result?.status, "for address:", destinationAddress);
              return;
            }

            const distText = result.distance.text;
            const baseMins = Math.round(result.duration.value / 60);
            const durText = `${baseMins}-${baseMins + 10}min`;

            cache.set(cacheKey, { distanceText: distText, durationText: durText });
            setDistanceText(distText);
            setDurationText(durText);
          }
        );
      })
      .catch((err) => {
        console.log("Google Maps load error:", err);
        mounted && setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [userLocation, destinationAddress]);

  return { distanceText, durationText, loading };
}