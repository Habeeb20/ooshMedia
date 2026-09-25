// Decodes the JWT already sitting in localStorage under 'token' (same key
// your rentalApi axios interceptor reads) and pulls the user id out of its
// payload — no separate auth context/hook required.

function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0'))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function getCurrentUserId() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  const payload = decodeJwtPayload(token);
  // Covers whatever your verifyToken middleware signs the token with —
  // adjust this if your JWT payload uses a different key than these.
  return payload?.id || payload?._id || payload?.userId || payload?.sub || null;
}

export default getCurrentUserId;