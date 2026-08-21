


// utills/loyaltyAllocation.js

export const POINT_TO_NGN_RATE = 1000; // 1 point = ₦1000 (matches earn rate: ₦1000 spent = 1 point)
export const MIN_REDEMPTION_POINTS = 1000; // must have + redeem in blocks of at least this many points

export function pointsToNaira(points) {
  return +(points * POINT_TO_NGN_RATE).toFixed(2);
}

export function nairaToPoints(naira) {
  return Math.floor(naira / POINT_TO_NGN_RATE);
}

/**
 * Distributes a loyalty redemption value (in NGN) across cart items,
 * starting from the LAST item added to the cart and working backward
 * ("last in, first covered"). Caps at subtotal (never touches transport fee).
 *
 * @param {Array} items - cart.items in add-order (oldest first). Each item needs
 *                        { product, seller, price, quantity, subtotal, name }
 * @param {Number} loyaltyValueNGN - NGN value the buyer wants to cover with points
 * @returns {{ allocations: Array, totalAllocated: Number, unallocatedRemainder: Number }}
 */
export function allocateLoyaltyAcrossCart(items, loyaltyValueNGN) {
  let remaining = +loyaltyValueNGN.toFixed(2);
  const allocations = [];

  // Reverse traversal: most-recently-added item is consumed first.
  // Cart items are assumed to be stored oldest-first (natural push order).
  const reversedWithIndex = items.map((item, idx) => ({ item, idx })).reverse();

  for (const { item, idx } of reversedWithIndex) {
    if (remaining <= 0) break;

    const itemTotal = item.subtotal ?? (item.price * item.quantity);
    const alreadyUnavailable = 0; // reserved for future partial-redemption-per-item tracking
    const availableOnItem = itemTotal - alreadyUnavailable;
    const covered = Math.min(availableOnItem, remaining);

    if (covered > 0) {
      allocations.push({
        itemIndex: idx,
        product: item.product?._id || item.product,
        seller: item.seller,
        name: item.name,
        itemTotal,
        amountCovered: +covered.toFixed(2),
      });
      remaining = +(remaining - covered).toFixed(2);
    }
  }

  const totalAllocated = +(loyaltyValueNGN - remaining).toFixed(2);
  return { allocations, totalAllocated, unallocatedRemainder: Math.max(remaining, 0) };
}

/**
 * Groups per-item loyalty allocations by seller — an order can have multiple
 * sellers, and one seller may have multiple cart line items.
 */
export function groupAllocationsBySeller(allocations) {
  const map = {};
  for (const a of allocations) {
    const sid = a.seller.toString();
    if (!map[sid]) map[sid] = { seller: a.seller, totalCovered: 0, items: [] };
    map[sid].totalCovered = +(map[sid].totalCovered + a.amountCovered).toFixed(2);
    map[sid].items.push(a);
  }
  return Object.values(map);
}

/**
 * Validates a redemption request against the rules:
 * - user must have loyaltyUsageAllowed !== false
 * - global Settings.allowLoyaltyUsage must be true
 * - balance must be >= MIN_REDEMPTION_POINTS to redeem at all
 * - requested points must be >= MIN_REDEMPTION_POINTS (unless using full balance and balance < that... balance itself already gated above)
 * - requested points must be <= available balance
 * - requested NGN value must be <= cart subtotal (can't redeem more than the order is worth)
 */
export function validateRedemption({ pointsRequested, availablePoints, cartSubtotal, globalEnabled, userEnabled }) {
  if (!globalEnabled) return { valid: false, message: 'Loyalty redemption is currently disabled by admin.' };
  if (!userEnabled) return { valid: false, message: 'Your account is not permitted to use loyalty points.' };
  if (availablePoints < MIN_REDEMPTION_POINTS) {
    return { valid: false, message: `You need at least ${MIN_REDEMPTION_POINTS} points to redeem.` };
  }
  if (pointsRequested < MIN_REDEMPTION_POINTS) {
    return { valid: false, message: `Minimum redemption is ${MIN_REDEMPTION_POINTS} points.` };
  }
  if (pointsRequested > availablePoints) {
    return { valid: false, message: 'You do not have that many points.' };
  }
  const valueNGN = pointsToNaira(pointsRequested);
  if (valueNGN > cartSubtotal) {
    return { valid: false, message: 'Loyalty value cannot exceed the order subtotal.' };
  }
  return { valid: true, valueNGN };
}