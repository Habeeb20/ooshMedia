import axios from 'axios';

const SUPPORT_API_URL = process.env.SUPPORT_API_URL; // https://api-esurpport.edirect.ng/api
const SUPPORT_API_KEY = process.env.SUPPORT_API_KEY;
const SUPPORT_API_SECRET = process.env.SUPPORT_API_SECRET;

const supportClient = axios.create({
  baseURL: SUPPORT_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    // NOTE: confirm the exact auth header names in the provider's docs page —
    // "API Key Required" usually means one of the two patterns below.
    // Pattern A (two headers):
    'X-API-Key': SUPPORT_API_KEY,
    'X-API-Secret': SUPPORT_API_SECRET,
    // Pattern B (single bearer token), if Pattern A doesn't work, swap to:
    // Authorization: `Bearer ${SUPPORT_API_KEY}`,
  },
});

/**
 * Creates a ticket on the external helpdesk.
 * Never throws — mirrors the safeSendEmail pattern so a helpdesk outage
 * never blocks the user's ticket from being saved locally.
 * Returns { ok, ticketId, error }.
 */
export async function safeCreateExternalTicket({ name, email, subject, description, phone }) {
  try {
    const { data } = await supportClient.post('/external/tickets', {
      customer_name: name,
      customer_email: email,
      subject,
      description,
      customer_phone: phone || undefined,
    });

    // Adjust this once you see the real response shape from the provider
    const ticketId = data?.ticket_id || data?.id || data?.data?.id;

    return { ok: true, ticketId, error: null };
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    console.error('[supportApi] Failed to create external ticket:', message);
    return { ok: false, ticketId: null, error: message };
  }
}