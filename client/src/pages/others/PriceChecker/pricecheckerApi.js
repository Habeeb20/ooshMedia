// api.js
// Thin wrapper around the /api/price-checker endpoint (backed by getProducts controller)

const API_BASE = `${import.meta.env.VITE_BACKEND_URL}/api/price-checker`;

export const SELLER_TYPES = [
  { value: '', label: 'All types' },
  { value: 'importer', label: 'Importer' },
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'wholesaler', label: 'Wholesaler' },
  { value: 'online', label: 'Online Only' },
];

export const CATEGORIES = [
  { value: '', label: 'All categories' },
  { value: 'Fashion', label: 'Fashion' },
  { value: 'Electronics', label: 'Electronics' },
  { value: 'Home & Living', label: 'Home & Living' },
  { value: 'Beauty', label: 'Beauty' },
  { value: 'Automotive', label: 'Automotive' },
  { value: 'Groceries', label: 'Groceries' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

/**
 * Fetches products from the price-checker endpoint.
 * price_asc / price_desc are resolved client-side since the controller
 * only sorts by createdAt (newest/oldest) — everything else maps 1:1
 * to the query params the controller reads.
 */
export async function fetchProducts(filters = {}) {
  const {
    search = '',
    category = '',
    sellerType = '',
    state = '',
    minPrice = '',
    maxPrice = '',
    sort = 'newest',
    page = 1,
    limit = 20,
  } = filters;

  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (sellerType) params.set('sellerType', sellerType);
  if (state) params.set('state', state);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  params.set('sort', sort === 'oldest' ? 'oldest' : 'newest');
  params.set('page', page);
  params.set('limit', limit);

  const res = await fetch(`${API_BASE}?${params.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to load products (${res.status})`);
  }
  const data = await res.json();

  let products = data.products || [];
  if (sort === 'price_asc') {
    products = [...products].sort((a, b) => effectivePrice(a) - effectivePrice(b));
  } else if (sort === 'price_desc') {
    products = [...products].sort((a, b) => effectivePrice(b) - effectivePrice(a));
  }

  return { ...data, products };
}

export function effectivePrice(product) {
  return product.salePrice ?? product.price ?? 0;
}

export function formatNaira(amount) {
  if (amount === undefined || amount === null) return '—';
  return `₦${Number(amount).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}