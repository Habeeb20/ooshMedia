// server/services/walletService.js
//
// Thin wrapper around the Essential Wallet voucher API
// (base: https://api-ewallet.eroot.ng/api).
//
// IMPORTANT: this file only ever runs on the server. The wallet API's
// auth token, and Paystack's secret key, must NEVER be exposed via a
// VITE_-prefixed env var — those get bundled into client JS and are
// publicly readable in the browser.
//
// .env (server-side, NOT client-side):
//   WALLET_BASE_URL=https://api-ewallet.eroot.ng/api
//   WALLET_API_TOKEN=xxxxx              (however you already auth against the wallet API elsewhere)
//   ESTORE_WALLET_MERCHANT_EMAIL=xxxx   (the Essential Wallet account that food/etc vouchers were created against)
//   PAYSTACK_SECRET_KEY=sk_xxx          (server-side only — verifies the reduced-amount charge)

import axios from 'axios';

const WALLET_BASE_URL = process.env.WALLET_BASE_URL || 'https://api-ewallet.eroot.ng/api';

// Reuses the same header/token pattern already established for the wallet
// integration elsewhere in the codebase (walletHeaders()).
function walletHeaders() {
  return {
    Authorization: `Bearer ${process.env.WALLET_API_TOKEN}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

const wallet = axios.create({
  baseURL: WALLET_BASE_URL,
  timeout: 15000,
});

/**
 * Look up a voucher by code WITHOUT redeeming it.
 * Used to read `type`, `category`, `status`, `expires_at` before we
 * decide which cart items it can apply to.
 */
export async function lookupVoucher(code) {
  const { data } = await wallet.get(`/vouchers/${encodeURIComponent(code)}`, {
    headers: walletHeaders(),
  });
  return data?.data;
}

/**
 * Reserve a checkout-mode redemption against a computed cart_kobo.
 * Does NOT move money — see docs. Caller must confirm or release.
 */
export async function reserveVoucherCheckout({ code, cartKobo, orderReference }) {
  const { data } = await wallet.post(
    '/vouchers/redeem',
    {
      code,
      mode: 'checkout',
      cart_kobo: cartKobo,
      order_reference: orderReference,
    },
  
  );
  return data?.data; // { redemption_reference, discount_kobo, amount_to_charge_kobo, expires_at, ... }
}

/**
 * Confirm a reservation AFTER a verified Paystack success.
 * This is the only call that actually moves money (credits the
 * voucher's merchant_email wallet — our fixed platform account).
 * Safe to retry.
 */
export async function confirmVoucherRedemption(reference) {
  const { data } = await wallet.post(
    `/vouchers/redeem/${encodeURIComponent(reference)}/confirm`,
    {},
    { headers: walletHeaders() }
  );
  return data?.data;
}

/**
 * Release a pending reservation (user backed out, or Paystack failed).
 * No-op-safe if already released/expired.
 */
export async function releaseVoucherRedemption(reference) {
  const { data } = await wallet.post(
    `/vouchers/redeem/${encodeURIComponent(reference)}/release`,
    {},
    { headers: walletHeaders() }
  );
  return data;
}