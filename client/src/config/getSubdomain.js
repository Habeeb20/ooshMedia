// utils/getSubdomain.js
export const getStoreSlug = () => {
  const host = window.location.hostname; // habeebstores.estores.ng or localhost
  const rootDomain = import.meta.env.VITE_BACKEND_URL; // "estores.ng"

  if (host === rootDomain || host === `www.${rootDomain}` || host.includes('localhost')) {
    return null;
  }

  const parts = host.replace(`.${rootDomain}`, '').split('.');
  return parts[0]; // "habeebstores"
};