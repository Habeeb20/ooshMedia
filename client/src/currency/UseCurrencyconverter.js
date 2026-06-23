import { useState, useEffect, useCallback } from "react";
import axios from "axios";

// Prices in your DB are stored in NGN, so NGN is always the base we
// convert *from*. The hook fetches the NGN rate table once, caches it
// for the session, and exposes a `convert` + `format` helper plus a
// currency switcher you can drop anywhere in the UI.
const CURRENCIES = [
  { code: "NGN", label: "Naira", symbol: "₦" },
  { code: "USD", label: "US Dollar", symbol: "$" },
  { code: "GBP", label: "British Pound", symbol: "£" },
  { code: "EUR", label: "Euro", symbol: "€" },
  { code: "CAD", label: "Canadian Dollar", symbol: "CA$" },
];

const STORAGE_KEY = "preferredCurrency";

export function useCurrencyConverter() {
  const [currency, setCurrencyState] = useState(
    () => localStorage.getItem(STORAGE_KEY) || "NGN"
  );
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setLoading(true);
      setError(null);

      // 1) Try your backend first (cached, no third-party rate limits).
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/currency/rates/NGN`
        );
        if (!data?.rates) throw new Error("Backend response had no rates");
        if (!cancelled) {
          setRates(data.rates);
          console.log("[currency] loaded rates from backend:", data.rates);
        }
        return;
      } catch (backendErr) {
        console.error(
          "[currency] backend rate fetch failed, falling back to open.er-api directly:",
          backendErr?.message || backendErr
        );
      }

      // 2) Fallback: hit the exchange-rate API directly so the
      // converter still works even if the backend route is down,
      // unmounted, or misconfigured — this is also how you can tell
      // whether the problem is your backend or the conversion math.
      try {
        const { data } = await axios.get(
          "https://open.er-api.com/v6/latest/NGN"
        );
        if (data?.result !== "success" || !data?.rates) {
          throw new Error("open.er-api returned no usable rates");
        }
        if (!cancelled) {
          setRates(data.rates);
          console.log("[currency] loaded rates from fallback API:", data.rates);
        }
      } catch (fallbackErr) {
        console.error("[currency] fallback rate fetch also failed:", fallbackErr);
        if (!cancelled) setError(fallbackErr.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setCurrency = useCallback((code) => {
    setCurrencyState(code);
    localStorage.setItem(STORAGE_KEY, code);
  }, []);

  // Converts a NGN amount into the currently selected currency.
  const convert = useCallback(
    (ngnAmount) => {
      const amount = Number(ngnAmount) || 0;
      if (currency === "NGN") return amount;

      if (!rates) {
        // Rates haven't loaded (or failed to load) — make this visible
        // in the console instead of silently returning the NGN amount,
        // which is exactly what produced the "price never changes" bug.
        console.warn(
          `[currency] convert() called for ${currency} but rates aren't loaded yet`
        );
        return amount;
      }

      const rate = rates[currency];
      if (!rate) {
        console.warn(`[currency] no rate found for ${currency} in`, rates);
        return amount;
      }

      return amount * rate;
    },
    [currency, rates]
  );

  // Converts + formats in one go, e.g. "$42.10" or "₦65,000".
  const format = useCallback(
    (ngnAmount) => {
      const value = convert(ngnAmount);
      const meta = CURRENCIES.find((c) => c.code === currency);
      const decimals = currency === "NGN" ? 0 : 2;
      return `${meta?.symbol || ""}${value.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}`;
    },
    [convert, currency]
  );

  return {
    currency,
    setCurrency,
    currencies: CURRENCIES,
    convert,
    format,
    ratesLoading: loading,
    ratesError: error,
  };
}