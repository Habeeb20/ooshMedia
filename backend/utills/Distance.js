import axios from 'axios';

// ── CONFIG ──────────────────────────────────────────────────
const DISTANCE_API_BASE =
  process.env.DISTANCE_API_BASE_URL || 'https://nigeria.jamiuadewaleyusuf.com/api/v1';

const TRANSPORT_BASE_FEE = Number(process.env.TRANSPORT_BASE_FEE || 500);
const TRANSPORT_RATE_PER_KM = Number(process.env.TRANSPORT_RATE_PER_KM || 100);
const TRANSPORT_MIN_FEE = Number(process.env.TRANSPORT_MIN_FEE || 500);
const TRANSPORT_MAX_FEE = Number(process.env.TRANSPORT_MAX_FEE || 15000);
// Used only if we truly cannot resolve any coordinates or distance at all.
const FALLBACK_DISTANCE_KM = Number(process.env.TRANSPORT_FALLBACK_DISTANCE_KM || 20);

function slugify(value) {
  if (!value) return null;
  return String(value).trim().toLowerCase().replace(/\s+/g, '-');
}

// Local last-resort distance calc so a flaky third-party API can never block checkout.
function haversineKm(a, b) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/**
 * Resolves lat/lng for a state/LGA pair.
 * Tries LGA-level bounds first (more precise, same-state deliveries),
 * falls back to state-level centroid coordinates.
 */
async function resolveCoordinates(state, lga) {
  const stateSlug = slugify(state);
  if (!stateSlug) return null;

  if (lga) {
    const lgaSlug = slugify(lga);
    try {
      const { data } = await axios.get(`${DISTANCE_API_BASE}/lgas/${lgaSlug}/bounds`, {
        timeout: 8000,
      });
      const payload = data?.data || {};
      const center = payload.center || payload.centroid || payload.coordinates;
      if (center?.lat && center?.lng) return { lat: center.lat, lng: center.lng };
    } catch (err) {
      // fall through to state-level lookup
    }
  }

  try {
    const { data } = await axios.get(`${DISTANCE_API_BASE}/states/${stateSlug}`, {
      timeout: 8000,
    });
    const coords = data?.data?.coordinates;
    if (coords?.lat && coords?.lng) return { lat: coords.lat, lng: coords.lng };
  } catch (err) {
    // no-op — caller handles null
  }

  return null;
}

/**
 * Returns { distanceKm, source } where source tells you how we got the
 * number: 'api' (the distance endpoint), 'haversine' (local fallback), or
 * 'fallback' (nothing worked, using a flat assumed distance).
 */
async function getDistanceKm(origin, destination) {
  try {
    const { data } = await axios.get(`${DISTANCE_API_BASE}/distance`, {
      params: {
        from_lat: origin.lat,
        from_lng: origin.lng,
        to_lat: destination.lat,
        to_lng: destination.lng,
      },
      timeout: 8000,
    });
    const payload = data?.data || {};
    const distance = payload.distance_km ?? payload.distance ?? payload.km;
    if (typeof distance === 'number' && !Number.isNaN(distance)) {
      return { distanceKm: distance, source: 'api' };
    }
  } catch (err) {
    // fall through to local calc
  }

  try {
    return { distanceKm: haversineKm(origin, destination), source: 'haversine' };
  } catch (err) {
    return { distanceKm: FALLBACK_DISTANCE_KM, source: 'fallback' };
  }
}

export function feeFromDistance(distanceKm) {
  const raw = TRANSPORT_BASE_FEE + distanceKm * TRANSPORT_RATE_PER_KM;
  return Math.min(TRANSPORT_MAX_FEE, Math.max(TRANSPORT_MIN_FEE, Math.round(raw)));
}

/**
 * Computes the delivery transport fee between one seller and the buyer,
 * using the state/LGA on file for each. Never throws — on any failure it
 * returns a sane fallback fee so checkout is never blocked by a geo outage.
 *
 * @returns {Promise<{fee:number, distanceKm:number, source:string}>}
 */
export async function computeTransportFee({ buyerState, buyerLga, sellerState, sellerLga }) {
  try {
    const [origin, destination] = await Promise.all([
      resolveCoordinates(sellerState, sellerLga),
      resolveCoordinates(buyerState, buyerLga),
    ]);

    if (!origin || !destination) {
      return {
        fee: feeFromDistance(FALLBACK_DISTANCE_KM),
        distanceKm: FALLBACK_DISTANCE_KM,
        source: 'fallback_no_coordinates',
      };
    }

    const { distanceKm, source } = await getDistanceKm(origin, destination);
    return { fee: feeFromDistance(distanceKm), distanceKm, source };
  } catch (err) {
    return {
      fee: feeFromDistance(FALLBACK_DISTANCE_KM),
      distanceKm: FALLBACK_DISTANCE_KM,
      source: 'fallback_error',
    };
  }
}