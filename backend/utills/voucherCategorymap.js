// // server/config/voucherCategoryMap.js
// //
// // The wallet API's voucher `category` field is a free vocabulary chosen
// // by whoever creates the voucher (e.g. "food", "electricity") — it does
// // NOT match your product-category ids directly. This file is the single
// // place that maps one to the other, so admin can extend it without
// // touching controller logic.
// //
// // Edit this whenever a new voucher category is introduced on the wallet
// // side. Keys are lowercased/trimmed before lookup, so "Food" and "food"
// // both work.

// export const VOUCHER_CATEGORY_TO_PRODUCT_CATEGORIES = {
//   food: [
//     'groceries',
//     'farm-products',
//     'kitchen',
//     'Groceries & Food',
//     // herbal food-type items are flagged at the variety level (type: 'food'),
//     // handled separately in matchesVoucherCategory() below
//   ],

//   electricity: [
//     // No direct "utility bill" product category exists today. Add the
//     // relevant ids here once/if you sell prepaid electricity units or
//     // similar as a product. Left empty on purpose rather than guessing.
//   ],

//   electronics: ['electronics', 'mobile-accessories', 'computers', 'gaming'],

//   fashion: ['fashion'],

//   beauty: ['beauty'],

//   // Add more as new voucher categories appear on the wallet side.
// };

// /**
//  * Returns true if a given product (with its `category` and, for
//  * varieties, `varieties[].type`) is eligible for a voucher of the given
//  * wallet-side category.
//  */
// export function productMatchesVoucherCategory(product, voucherCategory) {
//   const key = String(voucherCategory || '').trim().toLowerCase();
//   const allowedProductCategories = VOUCHER_CATEGORY_TO_PRODUCT_CATEGORIES[key] || [];

//   if (allowedProductCategories.includes(product.category)) return true;

//   // Products can also carry a food/drink/package variety independent of
//   // their top-level category (see Product.varieties[].type) — a food
//   // voucher should still match those.
//   if (key === 'food' && Array.isArray(product.varieties)) {
//     return product.varieties.some((v) => v.type === 'food');
//   }
//   console.log(voucherCategory)

//   return false;
// }
















// utils/voucherCategoryMap.js
//
// Decides whether a product "counts" for a given voucher category.
// This is what enforces: "a food voucher can only be used if there's
// food-related products in the checkout."
//
// Built against the category ids in your data/categories.js
// (productCategories). Adjust the arrays below if you rename/add categories.

const VOUCHER_TO_PRODUCT_CATEGORY_IDS = {
  food: ["groceries", "drinks", "farm-products"],
  groceries: ["groceries", "drinks", "farm-products"],
  medical: ["health", "pharmacy", "herbal"],
  transport: ["automotive"],
};

// Fallback keyword matching, in case `product.category` on a given product
// was saved as a free-text name (e.g. "Groceries & Food") rather than the
// slug id (e.g. "groceries"). This also catches subcategory-level matches
// like "fast food" living inside the "herbal" category in your data.
const VOUCHER_KEYWORDS = {
  food: ["food", "grocery", "groceries", "drink", "beverage", "snack", "cake", "farm", "fruit", "vegetable", "fast food", "swallow"],
  groceries: ["grocery", "groceries", "food", "drink", "farm", "beverage"],
  medical: ["health", "pharmacy", "medical", "drug", "wellness", "herbal", "medicine", "supplement"],
  transport: ["automotive", "car", "transport", "motor", "tyre", "vehicle"],
};

function normalize(str = "") {
  return String(str).toLowerCase().trim();
}

/**
 * @param {string} voucherCategory - e.g. "food"
 * @param {string} productCategory - the product's `category` field
 * @param {string} [productSubCategory] - the product's `subCategory` field
 * @returns {boolean}
 */
export function isProductCategoryMatch(voucherCategory, productCategory, productSubCategory = "") {
  console.log(voucherCategory, productCategory, productSubCategory)
  const vCat = normalize(voucherCategory);
  const pCat = normalize(productCategory);
  const pSub = normalize(productSubCategory);

  const allowedIds = VOUCHER_TO_PRODUCT_CATEGORY_IDS[vCat] || [];
  if (allowedIds.includes(pCat)) return true;

  const keywords = VOUCHER_KEYWORDS[vCat] || [];
  return keywords.some((kw) => pCat.includes(kw) || pSub.includes(kw));
}

export default VOUCHER_TO_PRODUCT_CATEGORY_IDS;
