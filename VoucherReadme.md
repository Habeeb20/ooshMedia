# Voucher Feature — Integration Guide

This is a complete voucher system for your estores project: creation + Paystack
funding, a designed voucher card, redemption inside checkout (with category
matching against your product categories), and history views for the buyer,
the voucher creator, sellers, and admin.

I don't have access to your actual repo (auth middleware, existing order
controller, api config, routing), so every file has clear `// adjust path`
comments where you'll need to point imports at your real files. Read the
"Integration checklist" below before wiring this in.

## File map

```
backend/
  models/Voucher.js
  data/voucherCategories.js            (your original list, unchanged)
  utils/voucherCategoryMap.js          (voucher category → product category matching)
  utils/generateVoucherCode.js
  utils/paystack.js                    (skip if you already have a Paystack helper)
  controllers/voucherController.js     (create, verify payment, webhook, validate, checkout)
  controllers/adminVoucherController.js
  controllers/sellerVoucherController.js
  routes/voucherRoutes.js

frontend/
  data/voucherCategories.js
  components/voucher/VoucherCard.jsx
  components/checkout/VoucherModal.jsx (matches your existing CheckoutPage.jsx call signature)
  pages/voucher/CreateVoucherPage.jsx
  pages/voucher/VoucherPaymentCallback.jsx
  pages/voucher/VoucherHistoryPage.jsx
  pages/admin/AdminVouchersPage.jsx
  pages/seller/SellerVoucherSalesPage.jsx
```

## How it works end-to-end

1. **Create** — user picks category, amount (min ₦500), number of users (1–10),
   expiry date. Backend computes `perUserShareKobo = floor(total / numberOfUsers)`
   and creates a `Voucher` in `pending_payment`, then starts a Paystack
   transaction for the *total* amount.
2. **Fund** — user pays on Paystack, gets redirected to
   `/voucher/payment-callback?...&reference=...`. That page calls
   `GET /api/vouchers/verify/:reference`, which confirms the charge, generates
   a unique code (`VC-XXXXXXXXXX`), and marks the voucher `active`. A
   Paystack **webhook** (`POST /api/vouchers/webhook`) is also wired up as a
   backup in case the user closes the tab before the callback runs.
3. **Card** — `VoucherCard` renders the code (copyable) with a distinct
   gradient/icon per category (food, groceries, medical, transport).
4. **Redeem in checkout** — your `CheckoutPage.jsx` already renders
   `VoucherModal` with `cart`, `deliveryFeeKobo`, `onOrderPlaced` — I built
   `VoucherModal` to match that exact interface, so no changes to
   `CheckoutPage.jsx` are needed. The modal does two calls:
   - `POST /api/vouchers/validate` — read-only. Checks the code is active,
     unexpired, not already used by this user, and that at least one cart
     item's category matches the voucher's category (via
     `voucherCategoryMap.js`). Returns the discount amount and which items
     qualified, so the user sees a preview before committing anything.
   - `POST /api/vouchers/checkout` — re-validates, then **atomically**
     reserves the user's one-time redemption slot with a single
     `findOneAndUpdate` guarded by `"redemptions.user": {$ne: userId}` and a
     size check on `redemptions` vs `numberOfUsers`. This is what prevents a
     double-submit or two tabs from letting one user redeem twice or from
     over-drawing a voucher's slots. It then creates the `Order` with
     `voucherUsed` populated and, if anything remains to be paid, starts a
     normal Paystack charge for the balance.
5. **History**
   - Buyer: sees `voucherUsed` on their own orders (already in your `Order`
     schema — no new UI strictly required, though you can build one).
   - Creator: `VoucherHistoryPage` — every voucher they created, who redeemed
     it, on what products, and how much was covered.
   - Seller: `SellerVoucherSalesPage` — every product of theirs that was
     bought using someone's voucher, the buyer, and the amount to reconcile
     for payout.
   - Admin: `AdminVouchersPage` — every voucher, drill into full redemption
     detail including buyer, seller, and matched products.

## Category matching

`utils/voucherCategoryMap.js` maps your voucher categories
(`food, medical, transport, groceries`) to the product category ids in your
`data/categories.js`:

- `food` / `groceries` → `groceries`, `drinks`, `farm-products`
- `medical` → `health`, `pharmacy`, `herbal`
- `transport` → `automotive`

Plus a keyword fallback in case `Product.category` ever stores a display name
instead of the slug. **Review this mapping** — it's my best read of your
category list, but only you know which categories should really count as
"food" etc. Adjust the arrays at the top of that file freely.

## Integration checklist

1. **Paths**: fix every `// adjust path` import — `models/Order.js`,
   `models/Product.js`, `middleware/auth.js` (`protect`, `restrictTo`),
   frontend `config/api.js`.
2. **Mount the router**: `app.use('/api/vouchers', voucherRoutes)`.
3. **Webhook body parsing order matters.** If you have `app.use(express.json())`
   globally before you mount `voucherRoutes`, the webhook's raw-body signature
   check will break because the body will already be parsed. Either:
   - Mount `app.post('/api/vouchers/webhook', express.raw({type:'application/json'}), paystackWebhook)`
     directly in `app.js` **before** your global `express.json()`, or
   - Use `express.json({ verify: ... })` globally with a path exclusion for
     `/api/vouchers/webhook`.
4. **Env vars**: `FRONTEND_URL` (for Paystack `callback_url`s) and your
   existing `PAYSTACK_PUBLIC_KEY` / `PAYSTACK_SECRET_KEY`.
5. **Frontend routes** — add to your router:
   ```jsx
   <Route path="/voucher/create" element={<CreateVoucherPage />} />
   <Route path="/voucher/payment-callback" element={<VoucherPaymentCallback />} />
   <Route path="/voucher/history" element={<VoucherHistoryPage />} />
   <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
   <Route path="/seller/voucher-sales" element={<SellerVoucherSalesPage />} />
   ```
6. **`checkoutWithVoucher` is a reference implementation, not a copy of your
   real checkout controller** (which I don't have access to). It rebuilds
   order totals, item subtotals, and a 1% platform fee from scratch. Please
   diff it against your actual `/api/orders/checkout` logic and reuse your
   real helpers for:
   - multi-seller order splitting (your `Order.seller` is a single field —
     if your real checkout creates one order per seller for multi-seller
     carts, do the same here instead of picking the first seller),
   - delivery/pickup code generation,
   - Paystack **split** payments (this reference version does a plain charge
     for the remaining balance, not a split),
   - loyalty points, since it currently ignores loyalty when a voucher is
     used — decide if the two should be combinable.
7. **Minimum amount assumption**: I read "amount minimum can be 500" as
   ₦500 total (not per user). If you meant ₦500 minimum *per user share*,
   change the validation in `createVoucher` to check
   `amountNaira / numberOfUsers >= 500` instead.
8. **Voucher discount scope**: the discount is capped at the subtotal of the
   *matching* items only (e.g. a food voucher can't discount a phone that's
   also in the cart) — I think this is the correct reading of "the voucher
   category has to match a product in the cart," but if you actually want the
   voucher to discount the *entire* cart total as long as *any* matching item
   exists, that's a one-line change in `checkVoucherEligibility`
   (`discountKobo = Math.min(voucher.perUserShareKobo, grossTotalKobo)`).
9. **Security**: NIN/BVN-style sensitive fields aren't touched by this
   feature. Voucher codes are excluded characters `0/O/1/I` to reduce
   support tickets from misread codes. Redemption is race-safe via atomic
   `findOneAndUpdate`; no separate distributed lock is needed for this scale.

## Testing the flow locally

1. Create a voucher as User A → pay with a Paystack test card → land on the
   callback page → confirm the card renders with a code.
2. As User B, add a qualifying product to cart → go to checkout → "Use
   Voucher Instead" → enter the code → confirm the discount preview only
   shows qualifying items → complete checkout.
3. As User B again, try to reuse the same code → should be rejected
   ("You have already used this voucher").
4. Repeat with up to `numberOfUsers` different accounts → the next one after
   the limit should get "already been fully redeemed."
5. Check `VoucherHistoryPage` as User A shows User B's redemption with the
   right product and amount. Check `SellerVoucherSalesPage` as the seller of
   that product shows the same sale. Check `AdminVouchersPage` shows both.
