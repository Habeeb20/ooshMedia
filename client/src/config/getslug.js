// src/config/getStoreSlug.js  (or src/utils/getStoreSlug.js — match your project structure)

export const getStoreSlug = () => {
  const host = window.location.hostname; // e.g. habeebstores.estores.ng
  const rootDomain = import.meta.env.VITE_ROOT_DOMAIN; // e.g. "estores.ng"

  // Not on a subdomain — root domain, www, or local dev
  if (
    !rootDomain ||
    host === rootDomain ||
    host === `www.${rootDomain}` ||
    host.includes('localhost') ||
    host.includes('127.0.0.1')
  ) {
    return null;
  }

  // Strip the root domain off the end, whatever's left before it is the subdomain
  if (host.endsWith(`.${rootDomain}`)) {
    const sub = host.slice(0, -(`.${rootDomain}`.length));
    // guard against multi-level subdomains like "api.habeebstores.estores.ng"
    return sub.split('.')[0];
  }

  return null;
};

export default getStoreSlug;