// // server/services/walletService.js
// //
// // Thin wrapper around the Essential Wallet voucher API
// // (base: https://api-ewallet.eroot.ng/api).
// //
// // IMPORTANT: this file only ever runs on the server. The wallet API's
// // auth token, and Paystack's secret key, must NEVER be exposed via a
// // VITE_-prefixed env var — those get bundled into client JS and are
// // publicly readable in the browser.
// //
// // .env (server-side, NOT client-side):
// //   WALLET_BASE_URL=https://api-ewallet.eroot.ng/api
// //   WALLET_API_TOKEN=xxxxx              (however you already auth against the wallet API elsewhere)
// //   ESTORE_WALLET_MERCHANT_EMAIL=xxxx   (the Essential Wallet account that food/etc vouchers were created against)
// //   PAYSTACK_SECRET_KEY=sk_xxx          (server-side only — verifies the reduced-amount charge)

// import axios from 'axios';
// import dotenv from "dotenv"

// dotenv.config()
// const WALLET_BASE_URL = process.env.WALLET_BASE_URL || 'https://api-ewallet.eroot.ng/api';


// const WALLET_API_TOKEN= process.env.WALLET_API_TOKEN

// // Reuses the same header/token pattern already established for the wallet
// // integration elsewhere in the codebase (walletHeaders()).
// function walletHeaders() {
//   return {
//     Authorization: `Bearer ${WALLET_API_TOKEN}`,
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   };
// }



// const wallet = axios.create({
//   baseURL: WALLET_BASE_URL,
//   timeout: 15000,
// });

// /**
//  * Look up a voucher by code WITHOUT redeeming it.
//  * Used to read `type`, `category`, `status`, `expires_at` before we
//  * decide which cart items it can apply to.
//  */
// export async function lookupVoucher(code) {
//   const { data } = await wallet.get(`/merchant/vouchers/${encodeURIComponent(code)}`, {
//     headers: walletHeaders(),
//   });
//   return data?.data;
// }

// /**
//  * Reserve a checkout-mode redemption against a computed cart_kobo.
//  * Does NOT move money — see docs. Caller must confirm or release.
//  */
// export async function reserveVoucherCheckout({ code, cartKobo, orderReference, category }) {
//   console.log(cartKobo, orderReference, category)
//   const { data } = await wallet.post(
//     '/vouchers/redeem',
//     {
      
//       mode: 'checkout',
//       cart_kobo: cartKobo,
//       category:category,
//       order_reference: orderReference,
//     },
//    {headers: walletHeaders()} ,
//   );
//   return data?.data; // { redemption_reference, discount_kobo, amount_to_charge_kobo, expires_at, ... }
// }

// /**
//  * Confirm a reservation AFTER a verified Paystack success.
//  * This is the only call that actually moves money (credits the
//  * voucher's merchant_email wallet — our fixed platform account).
//  * Safe to retry.
//  */
// export async function confirmVoucherRedemption(reference) {
//   const { data } = await wallet.post(
//     `/vouchers/redeem/${encodeURIComponent(reference)}/confirm`,
//     {},
//     { headers: walletHeaders() }
//   );
//   return data?.data;
// }

// /**
//  * Release a pending reservation (user backed out, or Paystack failed).
//  * No-op-safe if already released/expired.
//  */
// export async function releaseVoucherRedemption(reference) {
//   const { data } = await wallet.post(
//     `/vouchers/redeem/${encodeURIComponent(reference)}/release`,
//     {},
//     { headers: walletHeaders() }
//   );
//   return data;
// }




























// server/utills/voucherService.js
//
// Thin wrapper around the Essential Wallet MERCHANT/eStore voucher API
// (base: https://api-ewallet.eroot.ng/api).
//
// We integrate as a third-party eStore, so EVERY call here is
// authenticated with the store's own merchant API key (esk_...) — never
// a shopper's wallet JWT. There is no supported way for an eStore to
// obtain a shopper's wallet JWT, and nothing below tries to.
//
// IMPORTANT: this file only ever runs on the server. The merchant key,
// and Paystack's secret key, must NEVER be exposed via a VITE_-prefixed
// env var — those get bundled into client JS and are publicly readable
// in the browser.
//
// .env (server-side, NOT client-side):
//   WALLET_BASE_URL=https://api-ewallet.eroot.ng/api
//   WALLET_MERCHANT_API_KEY=esk_xxxxx   (issued via `php artisan merchant:create-key` on api-wallet — an esk_... key, NOT a user JWT)
//   PAYSTACK_SECRET_KEY=sk_xxx          (server-side only — verifies the reduced-amount charge)

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WALLET_BASE_URL = process.env.WALLET_BASE_URL || 'https://api-ewallet.eroot.ng/api';
const WALLET_MERCHANT_API_KEY = process.env.WALLET_MERCHANT_API_KEY;

function walletHeaders() {
  return {
    Authorization: `Bearer ${WALLET_MERCHANT_API_KEY}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

const wallet = axios.create({
  baseURL: WALLET_BASE_URL,
  timeout: 15000,
});

/**
 * GET /merchant/vouchers/{code}
 * Look up a voucher by code WITHOUT redeeming it. Open to any active
 * merchant key. Pass cartKobo to get a discount preview for that total.
 */
export async function lookupVoucher(code, cartKobo) {
  const { data } = await wallet.get(`/merchant/vouchers/${encodeURIComponent(code)}`, {
    headers: walletHeaders(),
    params: cartKobo != null ? { cart_kobo: cartKobo } : undefined,
  });
  return data?.data;
}

/**
 * POST /merchant/vouchers/{code}/redeem/request-otp
 * Step 1 of checkout redemption. Resolves `phone` to a wallet account and
 * texts it a 6-digit code. Returns an opaque otp_reference — we never see
 * the code itself, only what the shopper types back into our own modal.
 */
export async function requestVoucherOtp(code, phone) {
  const { data } = await wallet.post(
    `/merchant/vouchers/${encodeURIComponent(code)}/redeem/request-otp`,
    { phone },
    { headers: walletHeaders() }
  );
  return data?.data; // { otp_reference, expires_at }
}

/**
 * POST /merchant/vouchers/redeem
 * Step 2. Verifies the OTP and reserves the voucher's discount against
 * this order. Does NOT move money — caller must confirm or release.
 * `category` must be the cart's real category — the wallet API rejects a
 * mismatch against the voucher's own category independently of whatever
 * we check locally.
 */
export async function redeemVoucherWithOtp({ otpReference, otp, cartKobo, category, orderReference }) {
  const { data } = await wallet.post(
    '/merchant/vouchers/redeem',
    {
      otp_reference: otpReference,
      otp,
      cart_kobo: cartKobo,
      category,
      order_reference: orderReference,
    },
    { headers: walletHeaders() }
  );
  return data?.data; // { mode, redemption_reference, discount_kobo, amount_to_charge_kobo, order_reference, expires_at }
}

/**
 * POST /merchant/vouchers/redeem/{reference}/confirm
 * Confirms a pending reservation AFTER a verified Paystack success — the
 * only call that actually moves money (credits the voucher's merchant
 * wallet). Safe to retry.
 */
export async function confirmVoucherRedemption(reference) {
  const { data } = await wallet.post(
    `/merchant/vouchers/redeem/${encodeURIComponent(reference)}/confirm`,
    {},
    { headers: walletHeaders() }
  );
  return data?.data;
}

/**
 * POST /merchant/vouchers/redeem/{reference}/release
 * Cancels a pending reservation (buyer backed out, or Paystack failed).
 * No-op-safe if already released/expired. Fails if already confirmed.
 */
export async function releaseVoucherRedemption(reference) {
  const { data } = await wallet.post(
    `/merchant/vouchers/redeem/${encodeURIComponent(reference)}/release`,
    {},
    { headers: walletHeaders() }
  );
  return data;
}

/**
 * GET /merchant/redemptions/{reference}
 * Optional: reconciliation lookup for a redemption belonging to this
 * merchant key, independent of our own DB record.
 */
export async function getRedemptionStatus(reference) {
  const { data } = await wallet.get(`/merchant/redemptions/${encodeURIComponent(reference)}`, {
    headers: walletHeaders(),
  });
  return data?.data;
}