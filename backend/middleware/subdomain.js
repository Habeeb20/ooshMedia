// middleware/subdomain.js
export const resolveSubdomain = async (req, res, next) => {
  const host = req.hostname; // e.g. habeebstores.estores.ng
  const parts = host.split('.');

  // Adjust based on root domain length (estores.ng = 2 parts)
  const rootParts = process.env.ROOT_DOMAIN.split('.').length; // "estores.ng" -> 2
  if (parts.length > rootParts) {
    const subdomain = parts[0];
    if (subdomain !== 'www' && subdomain !== 'api') {
      req.subdomain = subdomain;
    }
  }
  next();
};