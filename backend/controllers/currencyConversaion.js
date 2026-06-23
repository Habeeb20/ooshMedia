import axios from "axios";

const BASE_URL = "https://open.er-api.com/v6/latest";

// ---------------------------------------------------------------------------
// In-memory cache, keyed by base currency (e.g. "USD", "NGN").
// The API itself only refreshes once a day, so there's no point hitting
// it on every request — we cache each base currency's rate table and
// only re-fetch once it's older than CACHE_TTL_MS.
// ---------------------------------------------------------------------------
const cache = new Map(); // base -> { rates, fetchedAt, nextUpdateUtc }
const CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

async function getRatesForBase(base) {
  const cached = cache.get(base);
  const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS;

  if (isFresh) {
    return cached;
  }

  const { data } = await axios.get(`${BASE_URL}/${base}`);

  if (data.result !== "success") {
    throw new Error(`Exchange rate API returned an error for base "${base}"`);
  }

  const entry = {
    rates: data.rates,
    fetchedAt: Date.now(),
    nextUpdateUtc: data.time_next_update_utc,
  };

  cache.set(base, entry);
  return entry;
}

/**
 * GET /api/currency/rates/:base
 * Returns the full rate table for a given base currency (defaults to USD).
 */
export const getRates = async (req, res, next) => {
  try {
    const base = (req.params.base || "USD").toUpperCase();
    const { rates, fetchedAt, nextUpdateUtc } = await getRatesForBase(base);

    return res.status(200).json({
      success: true,
      base,
      rates,
      cachedAt: new Date(fetchedAt).toISOString(),
      nextUpdateUtc,
    });
  } catch (error) {
    console.error("getRates error:", error.message);
    return next(error);
  }
};

/**
 * GET /api/currency/convert?amount=100&from=USD&to=NGN
 * Converts an amount from one currency to another.
 */
export const convertCurrency = async (req, res, next) => {
  try {
    const { amount, from, to } = req.query;

    if (!amount || !from || !to) {
      return res.status(400).json({
        success: false,
        message: "Please provide amount, from, and to query parameters",
      });
    }

    const numericAmount = Number(amount);
    if (Number.isNaN(numericAmount)) {
      return res.status(400).json({
        success: false,
        message: "amount must be a valid number",
      });
    }

    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    const { rates, nextUpdateUtc } = await getRatesForBase(fromCode);
    const rate = rates[toCode];

    if (!rate) {
      return res.status(404).json({
        success: false,
        message: `No exchange rate found for ${toCode}`,
      });
    }

    const convertedAmount = numericAmount * rate;

    return res.status(200).json({
      success: true,
      from: fromCode,
      to: toCode,
      amount: numericAmount,
      rate,
      convertedAmount,
      nextUpdateUtc,
    });
  } catch (error) {
    console.error("convertCurrency error:", error.message);
    return next(error);
  }
};