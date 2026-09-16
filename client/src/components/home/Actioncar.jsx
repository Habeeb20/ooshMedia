import React, { useState, useEffect, useMemo, useCallback } from "react";
import { MapPin, ArrowRight, ChevronLeft, RefreshCw, AlertTriangle, Gavel } from "lucide-react";

/* ---------------------------------------------------------------------
   DATA SOURCE
   Live lots are fetched from the eAuction API. The shape expected for
   each item matches what GET /auction/items returns, e.g.:
   {
     id, title, description, status, category,
     startingPrice, reservePrice, currentBid, buyNowPrice, bidIncrement,
     location, state, lga, images: [...], isFeatured, viewCount,
     approvedAt, bidTimeoutSeconds,
     auctionCategory: { name }, auctionSubCategory: { name },
     vendor: { ninVerificationStatus, state },
     vehicleDetail: { make, model, year, ... }
   }
--------------------------------------------------------------------- */

// In dev, Vite's proxy (see vite.config.js) forwards "/api/eauction/*" to
// the real eAuction API so the browser never hits it cross-origin.
// In prod, point this at your own backend's passthrough route instead —
// set VITE_BACKEND_URL and it'll call
// `${VITE_BACKEND_URL}/api/eauction/auction/items` automatically.
const ITEMS_ENDPOINT = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/eauction/auction/items`
  : "/eauction/auction/items";

// Only these auction categories should show up in the catalog.
const ALLOWED_CATEGORIES = ["CARS"];

// Clicking a lot takes the visitor straight to this public description
// page, with the lot's id appended as a query param.
const LOT_DESCRIPTION_URL = "https://eauction.ng/description";
const lotDescriptionHref = (id) => `${LOT_DESCRIPTION_URL}?id=${encodeURIComponent(id)}`;

/* ---------------------------------------------------------------------
   HELPERS
--------------------------------------------------------------------- */

const naira = (v) =>
  v === null || v === undefined || v === ""
    ? null
    : `₦${Number(v).toLocaleString("en-NG")}`;

const lotLabel = (item) => {
  const vd = item.vehicleDetail;
  if (vd) return `${vd.year} ${vd.make} ${vd.model}`;
  return item.title;
};

const STATUS_STYLE = {
  LIVE: { label: "Live", cls: "bg-red-100 text-red-700" },
  ENDED: { label: "Ended", cls: "bg-gray-100 text-gray-600" },
  SOLD: { label: "Sold", cls: "bg-emerald-100 text-emerald-700" },
};

/**
 * The API might respond with a raw array, or with the payload wrapped in
 * a common envelope shape (e.g. { data: [...] } or { items: [...] }).
 * Normalize whatever comes back into a plain array of lot objects, then
 * keep only the categories this catalog cares about.
 */
function normalizeItemsResponse(payload) {
  let list = [];
  if (Array.isArray(payload)) list = payload;
  else if (Array.isArray(payload?.data)) list = payload.data;
  else if (Array.isArray(payload?.items)) list = payload.items;
  else if (Array.isArray(payload?.results)) list = payload.results;

  return list.filter((item) =>
    ALLOWED_CATEGORIES.includes(String(item?.category ?? "").toUpperCase())
  );
}

/* ---------------------------------------------------------------------
   PRESENTATIONAL PIECES
--------------------------------------------------------------------- */

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.LIVE;
  return (
    <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide ${s.cls}`}>
      {s.label}
    </span>
  );
}

function LotCard({ item }) {
  const price = naira(item.currentBid) || naira(item.startingPrice);
  const priceLabel = item.currentBid ? "Current bid" : "Starting price";

  return (
    <a
      href={lotDescriptionHref(item.id)}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`View details for ${lotLabel(item)} on eAuction.ng`}
      className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl overflow-hidden border border-gray-100 transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-rose-900"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img src={item.images?.[0]} alt={lotLabel(item)} loading="lazy" className="h-full w-full object-cover" />
        <StatusBadge status={item.status} />
        {item.isFeatured && (
          <span className="absolute top-3 right-3 bg-rose-800 text-white text-[10px] font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[11px] text-gray-400">
            LOT #{String(item.id).padStart(3, "0")}
          </span>
          <span className="rounded-full bg-rose-10 text-rose-700 px-2.5 py-0.5 text-[11px] font-medium">
            {item.auctionSubCategory?.name || item.category}
          </span>
        </div>

        <h3 className="font-semibold text-lg leading-tight text-gray-900 truncate">{lotLabel(item)}</h3>

        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin size={13} strokeWidth={2.2} />
          <span>{item.location}, {item.state}</span>
        </div>

        <div className="mt-2 flex items-end justify-between border-t border-gray-100 pt-3">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-gray-400">{priceLabel}</div>
            <div className="mt-0.5 font-bold text-lg text-emerald-600">{price}</div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-rose-900 px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-rose-800">
            View Lot
            <ArrowRight size={13} strokeWidth={2.4} />
          </span>
        </div>
      </div>
    </a>
  );
}

/* ---------------------------------------------------------------------
   PAGES
--------------------------------------------------------------------- */

function SectionHeader({ liveCount, page, onBack }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {page === "all" ? (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-rose-900 transition-colors"
          >
            <ChevronLeft size={18} strokeWidth={2.2} />
            Back
          </button>
        ) : (
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-rose-800 text-white">
            <Gavel size={17} />
          </span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]" />
        <span className="font-medium">{liveCount} lots live now</span>
      </div>
    </div>
  );
}

function StateNotice({ icon, title, message, onRetry }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
      <div className="mx-auto flex max-w-md flex-col items-center gap-3 py-16 text-center">
        <span className="flex items-center justify-center w-14 h-14 rounded-full bg-red-50 text-red-500">{icon}</span>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="text-sm text-gray-500 mb-2">{message}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 rounded-2xl bg-rose-800 hover:bg-rose-900 px-6 py-3 text-sm font-semibold text-white transition-all"
          >
            <RefreshCw size={15} strokeWidth={2.4} />
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

function LotCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100">
      <div className="aspect-[4/3] bg-gray-200" />
      <div className="flex flex-col gap-2 px-5 py-4">
        <div className="h-3 w-2/5 rounded bg-gray-200" />
        <div className="h-3 w-full rounded bg-gray-200" />
        <div className="mt-2 h-3 w-2/3 rounded bg-gray-200" />
      </div>
    </div>
  );
}

function CatalogHome({ items, loading, onViewAll }) {
  const featured = items.slice(0, 4);
  const liveCount = items.filter((i) => i.status === "LIVE").length;

  return (
    <>
      <SectionHeader liveCount={liveCount} page="home" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Vehicle Auctions</h1>
          <p className="max-w-xl text-sm text-gray-500">
            Verified vehicles, inspected and sold to the highest bidder. Every lot ships with a full condition report.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => <LotCardSkeleton key={i} />)
            : featured.map((item) => <LotCard key={item.id} item={item} />)}
        </div>
        {!loading && items.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">No live lots right now — check back shortly.</p>
        )}
        {!loading && items.length > 0 && (
          <div className="mt-10 mb-2 flex justify-center">
            <button
              onClick={onViewAll}
              className="rounded-2xl bg-rose-800 hover:bg-rose-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5"
            >
              View full catalog ({items.length} lots)
            </button>
          </div>
        )}
      </div>
    </>
  );
}

function CatalogAll({ items, loading, onBack }) {
  const liveCount = items.filter((i) => i.status === "LIVE").length;
  const [filter, setFilter] = useState("ALL");

  const subcats = useMemo(
    () => ["ALL", ...new Set(items.map((i) => i.auctionSubCategory?.name).filter(Boolean))],
    [items]
  );
  const filtered = filter === "ALL" ? items : items.filter((i) => i.auctionSubCategory?.name === filter);

  return (
    <>
      <SectionHeader liveCount={liveCount} page="all" onBack={onBack} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2">
        <div className="mb-7">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Full catalog</h1>
          <p className="text-sm text-gray-500">{loading ? "Loading lots…" : `${filtered.length} of ${items.length} lots`}</p>
        </div>

        {!loading && (
          <div className="mb-7 flex flex-wrap gap-2">
            {subcats.map((c) => (
              <button
                key={c}
                onClick={() => setFilter(c)}
                className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
                  filter === c
                    ? "bg-rose-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {c === "ALL" ? "All categories" : c}
              </button>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <LotCardSkeleton key={i} />)
            : filtered.map((item) => <LotCard key={item.id} item={item} />)}
        </div>
        {!loading && filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">No lots match this category.</p>
        )}
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------
   ROOT
--------------------------------------------------------------------- */

export default function AuctionCatalog() {
  const [page, setPage] = useState("home");
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading"); // "loading" | "ready" | "error"
  const [errorMessage, setErrorMessage] = useState("");

  const fetchItems = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const res = await fetch(ITEMS_ENDPOINT);
      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }
      const payload = await res.json();
      const list = normalizeItemsResponse(payload);
      setItems(list);
      setStatus("ready");
    } catch (err) {
      setErrorMessage(err?.message || "Something went wrong while loading lots.");
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {status === "error" ? (
        <>
          <SectionHeader liveCount={0} page="home" />
          <StateNotice
            icon={<AlertTriangle size={26} strokeWidth={2} />}
            title="Couldn't load the catalog"
            message={errorMessage}
            onRetry={fetchItems}
          />
        </>
      ) : page === "home" ? (
        <CatalogHome items={items} loading={status === "loading"} onViewAll={() => setPage("all")} />
      ) : (
        <CatalogAll items={items} loading={status === "loading"} onBack={() => setPage("home")} />
      )}
    </div>
  );
}