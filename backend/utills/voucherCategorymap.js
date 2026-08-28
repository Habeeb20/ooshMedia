// server/config/voucherCategoryMap.js
//
// The wallet API's voucher `category` field is a free vocabulary chosen
// by whoever creates the voucher (e.g. "food", "electricity") — it does
// NOT match your product-category ids directly. This file is the single
// place that maps one to the other, so admin can extend it without
// touching controller logic.
//
// Edit this whenever a new voucher category is introduced on the wallet
// side. Keys are lowercased/trimmed before lookup, so "Food" and "food"
// both work.

export const VOUCHER_CATEGORY_TO_PRODUCT_CATEGORIES = {
  food: [
    'groceries',
    'farm-products',
    'kitchen',
    'Groceries & Food',
    // herbal food-type items are flagged at the variety level (type: 'food'),
    // handled separately in matchesVoucherCategory() below
  ],

  electricity: [
    // No direct "utility bill" product category exists today. Add the
    // relevant ids here once/if you sell prepaid electricity units or
    // similar as a product. Left empty on purpose rather than guessing.
  ],

  electronics: ['electronics', 'mobile-accessories', 'computers', 'gaming'],

  fashion: ['fashion'],

  beauty: ['beauty'],

  // Add more as new voucher categories appear on the wallet side.
};

/**
 * Returns true if a given product (with its `category` and, for
 * varieties, `varieties[].type`) is eligible for a voucher of the given
 * wallet-side category.
 */
export function productMatchesVoucherCategory(product, voucherCategory) {
  const key = String(voucherCategory || '').trim().toLowerCase();
  const allowedProductCategories = VOUCHER_CATEGORY_TO_PRODUCT_CATEGORIES[key] || [];

  if (allowedProductCategories.includes(product.category)) return true;

  // Products can also carry a food/drink/package variety independent of
  // their top-level category (see Product.varieties[].type) — a food
  // voucher should still match those.
  if (key === 'food' && Array.isArray(product.varieties)) {
    return product.varieties.some((v) => v.type === 'food');
  }
  console.log(voucherCategory)

  return false;
}