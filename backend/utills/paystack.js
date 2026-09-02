// utils/paystack.js
//
// NOTE: If your project already has a Paystack helper (very likely, since
// your Order flow already integrates Paystack for checkout/splits), prefer
// reusing that one instead of this — just make sure it exposes an
// `initialize` and `verify` call. This file is here so the voucher feature
// is self-contained if you don't already have one.

const PAYSTACK_BASE = "https://api.paystack.co";

function authHeaders() {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("PAYSTACK_SECRET_KEY is not set in your environment.");
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

/**
 * @param {{email:string, amountKobo:number, reference:string, callback_url?:string, metadata?:object}} params
 */
export async function initializePaystackTransaction({ email, amountKobo, reference, callback_url, metadata }) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/initialize`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ email, amount: amountKobo, reference, callback_url, metadata }),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Failed to initialize Paystack transaction.");
  return data.data; // { authorization_url, access_code, reference }
}

/**
 * @param {string} reference
 */
export async function verifyPaystackTransaction(reference) {
  const res = await fetch(`${PAYSTACK_BASE}/transaction/verify/${encodeURIComponent(reference)}`, {
    method: "GET",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!data.status) throw new Error(data.message || "Failed to verify Paystack transaction.");
  return data.data; // { status: 'success' | 'failed' | 'abandoned', amount, reference, ... }
}
