import { useRef, useState } from "react";
import axios from "axios";
import { Search, X, Copy, Check, FileText, Info, ShieldCheck, Pill, Stethoscope, Calendar, User } from "lucide-react";
import appConfig from "../../../config/appConfig";
import { withAlpha } from "./colorUtils";

/**
 * Search a client's prescription by its code (RX-XXXXXX) or by the client's name.
 *
 * Calls   GET {VITE_EMEDICALS_URL}?q=<code or name>
 * so VITE_EMEDICALS_URL must be the full search endpoint, for example
 *         VITE_EMEDICALS_URL=https://your-emedicals-api.com/api/prescriptions/search
 *
 * Expected response:
 *   { status: "success", data: [{ id, code, status, issuedAt, purpose, patient: { id, name }, prescribedBy,
 *       items: [{ medicine, dosage, frequency, duration, instructions, quantity, dispensedQty }] }],
 *     meta: { total, via: "code" | "name" } }
 */

const STATUS = {
  issued: { label: "Issued", cls: "bg-sky-50 text-sky-700 ring-sky-200" },
  dispensed: { label: "Dispensed", cls: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  partially_dispensed: { label: "Partly dispensed", cls: "bg-amber-50 text-amber-700 ring-amber-200" },
  cancelled: { label: "Cancelled", cls: "bg-rose-50 text-rose-700 ring-rose-200" },
};

const looksLikeCode = (q) => /^rx-?[a-z0-9]*$/i.test(q.trim());

const formatDate = (d) =>
  d ? new Date(d).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" }) : "";

const Field = ({ label, value }) =>
  value ? (
    <div className="min-w-0">
      <p className="text-[11px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-semibold text-gray-800 break-words">{value}</p>
    </div>
  ) : null;

function ItemCard({ item, brand }) {
  const qty = Number(item.quantity) || 0;
  const done = Math.min(Number(item.dispensedQty) || 0, qty || Infinity);
  const pct = qty ? Math.round((done / qty) * 100) : 0;
  const complete = qty > 0 && done >= qty;

  // Lets the store section show this drug ("Find in store")
  const findInStore = () => window.dispatchEvent(new CustomEvent("medicine-search", { detail: item.medicine }));

  return (
    <li className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: withAlpha(brand, 0.1), color: brand }}>
            <Pill className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="font-bold text-gray-900 break-words">{item.medicine}</p>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
              <Field label="Dosage" value={item.dosage} />
              <Field label="Frequency" value={item.frequency} />
              <Field label="Duration" value={item.duration} />
              <Field label="Quantity" value={qty || ""} />
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={findInStore}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-gray-50"
          style={{ borderColor: withAlpha(brand, 0.4), color: brand }}
        >
          <Search className="h-3.5 w-3.5" />
          Find in store
        </button>
      </div>

      {item.instructions && (
        <p className="mt-3 flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2 text-sm text-gray-600">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
          {item.instructions}
        </p>
      )}

      {qty > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-500">Dispensed</span>
            <span className={`font-bold ${complete ? "text-emerald-600" : "text-gray-700"}`}>
              {done} of {qty}
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: complete ? "#059669" : brand }} />
          </div>
        </div>
      )}
    </li>
  );
}

function PrescriptionCard({ rx, brand }) {
  const [copied, setCopied] = useState(false);
  const status = STATUS[rx.status] || { label: String(rx.status || "").replace(/_/g, " "), cls: "bg-gray-50 text-gray-600 ring-gray-200" };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(rx.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard blocked: nothing to do */ }
  };

  return (
    <article className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
      <header className="px-5 py-4 sm:px-6" style={{ background: `linear-gradient(135deg, ${withAlpha(brand, 0.1)} 0%, ${withAlpha(brand, 0.03)} 100%)` }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl text-white" style={{ backgroundColor: brand }}>
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Prescription code</p>
              <button type="button" onClick={copy} aria-label={`Copy code ${rx.code}`} className="flex items-center gap-1.5 font-mono text-lg font-black tracking-wide text-gray-900">
                {rx.code}
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4 text-gray-400" />}
              </button>
            </div>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ring-1 ${status.cls}`}>{status.label}</span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-2 min-w-0">
            <User className="h-4 w-4 shrink-0 text-gray-400" />
            {/* <div className="min-w-0"><dt className="text-[11px] uppercase tracking-wide text-gray-400">Client</dt><dd className="truncate text-sm font-semibold text-gray-800">{rx.patient?.name || "Unknown"}</dd></div> */}
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Stethoscope className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0"><dt className="text-[11px] uppercase tracking-wide text-gray-400">Prescribed by</dt><dd className="truncate text-sm font-semibold text-gray-800">{rx.prescribedBy || "Unknown"}</dd></div>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <Calendar className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0"><dt className="text-[11px] uppercase tracking-wide text-gray-400">Issued</dt><dd className="truncate text-sm font-semibold text-gray-800">{formatDate(rx.issuedAt)}</dd></div>
          </div>
        </dl>

        {rx.purpose && (
          <p className="mt-3 rounded-xl bg-white/70 px-3 py-2 text-sm text-gray-700">
            <span className="font-semibold text-gray-900">What it's for: </span>
            {rx.purpose}
          </p>
        )}
      </header>

      <div className="px-5 py-5 sm:px-6">
        <h3 className="mb-3 text-sm font-bold text-gray-900">
          Medicines <span className="font-medium text-gray-400">({rx.items?.length || 0})</span>
        </h3>
        <ul className="space-y-3">
          {(rx.items || []).map((item, i) => <ItemCard key={`${item.medicine}-${i}`} item={item} brand={brand} />)}
        </ul>
      </div>
    </article>
  );
}

export default function PrescriptionLookup() {
  const brand = appConfig.colors.primary;
  const [query, setQuery] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | loading | done | error
  const [results, setResults] = useState([]);
  const [meta, setMeta] = useState(null);
  const [message, setMessage] = useState("");
  const [searched, setSearched] = useState("");
  const controller = useRef(null);

  const search = async (e) => {
    e?.preventDefault();
    const q = query.trim();
    if (q.length < 2) { setPhase("error"); setMessage("Enter at least 2 characters: a prescription code or the client's name."); return; }

    const endpoint = import.meta.env.VITE_EMEDICALS_URL;
    if (!endpoint) { setPhase("error"); setMessage("Prescription search is not set up yet (VITE_EMEDICALS_URL is missing)."); return; }

    controller.current?.abort();                 // only the latest search counts
    controller.current = new AbortController();
    setPhase("loading");
    setMessage("");
    setSearched(q);

    try {
      const { data } = await axios.get(endpoint, { params: { q }, signal: controller.current.signal });
      if (data?.status && data.status !== "success") throw new Error(data.message || "The search failed.");
      setResults(Array.isArray(data?.data) ? data.data : []);
      setMeta(data?.meta || null);
      setPhase("done");
    } catch (err) {
      if (axios.isCancel?.(err) || err?.name === "CanceledError") return;
      if (err?.response?.status === 404) { setResults([]); setMeta(null); setPhase("done"); return; }
      setPhase("error");
      setMessage(err?.response?.data?.message || err?.message || "We could not search right now. Please try again.");
    }
  };

  const reset = () => { controller.current?.abort(); setQuery(""); setPhase("idle"); setResults([]); setMeta(null); setMessage(""); };

  return (
    <section id="prescription-lookup" className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 scroll-mt-6">
      <div className="overflow-hidden rounded-[32px] border border-gray-100 bg-white shadow-lg">
        {/* Search panel */}
        <div className="relative px-5 py-8 sm:px-10 sm:py-10 text-center" style={{ background: `linear-gradient(150deg, ${withAlpha(brand, 0.12)} 0%, ${withAlpha(brand, 0.03)} 100%)` }}>
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg" style={{ backgroundColor: brand }}>
            <FileText className="h-7 w-7" />
          </span>
          <h2 className="mt-4 text-xl sm:text-3xl font-extrabold text-gray-900">Check a Client's Prescription</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-gray-500">
            Search by the prescription code (like <span className="font-mono font-bold text-gray-700">RX-A5FB3E</span>) or by the client's name.
          </p>

          <form onSubmit={search} className="mx-auto mt-6 flex max-w-xl flex-col gap-3 sm:flex-row" role="search">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Prescription code or client name"
                aria-label="Prescription code or client name"
                autoComplete="off"
                className="w-full rounded-full border border-gray-200 bg-white py-3.5 pl-11 pr-10 text-sm shadow-sm focus:outline-none focus:ring-2"
                style={{ "--tw-ring-color": withAlpha(brand, 0.3) }}
              />
              {query && (
                <button type="button" onClick={reset} aria-label="Clear" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              disabled={phase === "loading"}
              className="inline-flex items-center justify-center gap-2 rounded-full px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition-transform hover:scale-105 active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
              style={{ backgroundColor: brand }}
            >
              {phase === "loading" ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" /> : <Search className="h-4 w-4" />}
              {phase === "loading" ? "Searching" : "Search"}
            </button>
          </form>

          {query.trim().length >= 2 && (
            <p className="mt-3 text-xs font-semibold" style={{ color: brand }}>
              {looksLikeCode(query) ? "Searching by prescription code" : "Searching by client name"}
            </p>
          )}
        </div>

        {/* Results */}
        <div className="px-4 py-6 sm:px-8 sm:py-8" aria-live="polite">
          {phase === "idle" && (
            <div className="flex flex-col items-center py-4 text-center">
              <ShieldCheck className="h-8 w-8 text-gray-300" />
              <p className="mt-3 max-w-md text-sm text-gray-500">
                Prescriptions only appear here when the client has made them public or has shared the code with you.
              </p>
            </div>
          )}

          {phase === "loading" && (
            <div className="space-y-3">
              <div className="h-28 animate-pulse rounded-3xl bg-gray-100" />
              <div className="h-40 animate-pulse rounded-3xl bg-gray-100" />
            </div>
          )}

          {phase === "error" && (
            <div role="alert" className="flex items-start gap-3 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              {message}
            </div>
          )}

          {phase === "done" && results.length === 0 && (
            <div className="flex flex-col items-center py-6 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: withAlpha(brand, 0.1), color: brand }}>
                <Search className="h-7 w-7" />
              </span>
              <p className="mt-4 font-bold text-gray-900">No prescription found for "{searched}"</p>
              <p className="mt-1 max-w-md text-sm text-gray-500">
                Check the spelling, or ask the client for their prescription code. Private prescriptions are only visible with the code.
              </p>
            </div>
          )}

          {phase === "done" && results.length > 0 && (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm text-gray-500">
                  <span className="font-bold text-gray-900">{meta?.total ?? results.length}</span>{" "}
                  {(meta?.total ?? results.length) === 1 ? "prescription" : "prescriptions"} found
                </p>
                {meta?.via && (
                  <span className="rounded-full px-3 py-1 text-xs font-bold" style={{ backgroundColor: withAlpha(brand, 0.1), color: brand }}>
                    Matched by {meta.via}
                  </span>
                )}
              </div>
              <div className="space-y-5">
                {results.map((rx) => <PrescriptionCard key={rx.id || rx.code} rx={rx} brand={brand} />)}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}