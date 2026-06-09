import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const lagosMarkets = [
  { id: 1, name: "Ladipo Market", location: "Mushin", knownFor: "Car Spare Parts", description: "The largest auto spare parts market in West Africa.", category: "Auto Parts", emoji: "🔧" },
  { id: 2, name: "Computer Village", location: "Ikeja", knownFor: "Phones, Laptops & Electronics", description: "Nigeria's biggest tech hub for new and fairly used devices.", category: "Electronics & Tech", emoji: "💻" },
  { id: 3, name: "Alaba International Market", location: "Ojo", knownFor: "Electronics & Home Appliances", description: "Massive market for TVs, generators, refrigerators.", category: "Electronics", emoji: "📺" },
  { id: 4, name: "Balogun Market", location: "Lagos Island", knownFor: "Fashion, Clothing & Textiles", description: "Biggest market for Ankara, lace, aso-ebi and fashion.", category: "Fashion", emoji: "👗" },
  { id: 5, name: "Idumota Market", location: "Lagos Island", knownFor: "Textiles & General Goods", description: "Popular for fabrics, clothing and wholesale goods.", category: "Fashion", emoji: "🧵" },
  { id: 6, name: "Mile 12 Market", location: "Mile 12", knownFor: "Foodstuff & Provisions", description: "The largest food market in Lagos.", category: "Foodstuff", emoji: "🥦" },
  { id: 7, name: "Oshodi Market", location: "Oshodi", knownFor: "General Goods & Food", description: "One of the biggest and busiest general markets.", category: "General", emoji: "🛍️" },
  { id: 8, name: "Trade Fair Complex", location: "Badagry Expressway", knownFor: "Building Materials & Wholesale", description: "Huge market for building materials and furniture.", category: "Building Materials", emoji: "🏗️" },
  { id: 9, name: "Tejuosho Market", location: "Yaba", knownFor: "General Goods & Fashion", description: "Popular for clothing and household items.", category: "General", emoji: "🛒" },
  { id: 10, name: "Jankara Market", location: "Lagos Island", knownFor: "Fabrics & Household Items", description: "Known for affordable fabrics and household goods.", category: "Fashion", emoji: "🎀" },
];

const VISIBLE_MARKETS = 6;

function slugify(name) {
  return name?.toLowerCase()
      ?.replace(/[^\w ]+/g, "")
      ?.replace(/ +/g, "-");;
}
// function slugify(name) {
//   return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
// }

function formatPrice(price) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", minimumFractionDigits: 0 }).format(price);
}

function ProductCard({ product, onClick }) {
  const primaryImage = product.images?.find((i) => i.isPrimary)?.url || product.images?.[0]?.url;
  const isOnSale = product.salePrice && product.salePrice < product.price;
  const discount = isOnSale ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  return (
    <div className="product-card" onClick={() => onClick(product)}>
      <div className="product-card__image-wrap">
        {primaryImage ? (
          <img src={primaryImage} alt={product.name} className="product-card__img" loading="lazy" />
        ) : (
          <div className="product-card__no-img">
            <span>📦</span>
          </div>
        )}
        {isOnSale && <span className="product-card__badge">-{discount}%</span>}
        {product.status === "out_of_stock" && <div className="product-card__out-overlay">Out of Stock</div>}
        <div className="product-card__hover-cta">
          <button className="btn-view">View Details</button>
        </div>
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3 className="product-card__name">{product.name}</h3>
        {product.seller?.sellerProfile?.market && (
          <p className="product-card__market">📍 {product.seller.sellerProfile.market}</p>
        )}
        <div className="product-card__price-row">
          {isOnSale ? (
            <>
              <span className="price-sale">{formatPrice(product.salePrice)}</span>
              <span className="price-original">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="price-main">{formatPrice(product.price)}</span>
          )}
        </div>
        {product.ratings > 0 && (
          <div className="product-card__rating">
            {"★".repeat(Math.round(product.ratings))}{"☆".repeat(5 - Math.round(product.ratings))}
            <span className="rating-count">({product.sold || 0} sold)</span>
          </div>
        )}
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <div className="skeleton skeleton-img" />
      <div className="skeleton-body">
        <div className="skeleton skeleton-line short" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line medium" />
        <div className="skeleton skeleton-line short" />
      </div>
    </div>
  );
}

function MarketModal({ open, onClose, onSelect, selectedMarket }) {
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">All Lagos Markets</h2>
            <p className="modal-subtitle">Select a market to browse its products</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-grid">
          {lagosMarkets.map((m) => (
            <button
              key={m.id}
              className={`modal-market-card ${selectedMarket?.id === m.id ? "active" : ""}`}
              onClick={() => { onSelect(m); onClose(); }}
            >
              <span className="modal-market-emoji">{m.emoji}</span>
              <div className="modal-market-info">
                <p className="modal-market-name">{m.name}</p>
                <p className="modal-market-loc">📍 {m.location}</p>
                <p className="modal-market-known">{m.knownFor}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OjaFlowMarketplace() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filterRef = useRef(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true);
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/all`);
        if (!res.ok) throw new Error("Failed to fetch products");
        const data = await res.json();
        setProducts(Array.isArray(data) ? data : data.products || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleProductClick = useCallback((product) => {
    const slug = slugify(product.name) + "-" + product._id.slice(-6);
    navigate(`/product/${slug}`, { state: { product } });
  }, [navigate]);

  const filteredProducts = products.filter((p) => {
    const matchesMarket = selectedMarket
      ? p.seller?.sellerProfile?.market === selectedMarket.name
      : true;
    const matchesSearch = search
      ? p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesMarket && matchesSearch;
  });

  const visibleMarkets = lagosMarkets.slice(0, VISIBLE_MARKETS);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --green: #0D3B2E;
          --green-mid: #185C45;
          --green-light: #E8F5EF;
          --amber: #F5A623;
          --amber-light: #FFF8EC;
          --coral: #E8533A;
          --bg: #FAF8F4;
          --card-bg: #FFFFFF;
          --text: #1A1A1A;
          --text-muted: #6B7280;
          --text-light: #9CA3AF;
          --border: #E5E7EB;
          --radius: 14px;
          --radius-sm: 8px;
          --shadow: 0 2px 12px rgba(0,0,0,0.07);
          --shadow-hover: 0 8px 32px rgba(13,59,46,0.13);
        }

        body { background: var(--bg); font-family: 'Inter', sans-serif; color: var(--text); }

        /* ── NAVBAR ── */
        .oja-nav {
          position: sticky; top: 0; z-index: 100;
          background: var(--green);
          padding: 0 5%;
          display: flex; align-items: center; justify-content: space-between;
          height: 64px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.18);
        }
        .oja-nav__logo {
          font-family: 'Sora', sans-serif;
          font-weight: 800; font-size: 1.5rem;
          color: #fff; letter-spacing: -0.5px;
          display: flex; align-items: center; gap: 6px;
        }
        .oja-nav__logo span { color: var(--amber); }
        .oja-nav__search {
          flex: 1; max-width: 420px; margin: 0 2rem;
          position: relative;
        }
        .oja-nav__search input {
          width: 100%; padding: 10px 16px 10px 40px;
          border-radius: 50px; border: none;
          background: rgba(255,255,255,0.12);
          color: #fff; font-size: 0.9rem;
          outline: none;
          transition: background 0.2s;
        }
        .oja-nav__search input::placeholder { color: rgba(255,255,255,0.5); }
        .oja-nav__search input:focus { background: rgba(255,255,255,0.2); }
        .oja-nav__search-icon {
          position: absolute; left: 13px; top: 50%; transform: translateY(-50%);
          color: rgba(255,255,255,0.55); font-size: 0.95rem; pointer-events: none;
        }
        .oja-nav__actions { display: flex; align-items: center; gap: 12px; }
        .oja-nav__cart {
          background: var(--amber); color: var(--green);
          border: none; border-radius: 50px;
          padding: 8px 18px; font-weight: 700; font-size: 0.85rem;
          cursor: pointer; font-family: 'Sora', sans-serif;
          display: flex; align-items: center; gap: 6px;
          transition: transform 0.15s, box-shadow 0.15s;
        }
        .oja-nav__cart:hover { transform: translateY(-1px); box-shadow: 0 4px 14px rgba(245,166,35,0.4); }

        /* ── HERO ── */
        .hero {
          background: linear-gradient(135deg, var(--green) 0%, var(--green-mid) 60%, #0D3B2E 100%);
          padding: 80px 5% 90px;
          position: relative; overflow: hidden;
        }
        .hero::after {
          content: '';
          position: absolute; right: -80px; top: -80px;
          width: 500px; height: 500px;
          background: radial-gradient(circle, rgba(245,166,35,0.15) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero::before {
          content: '';
          position: absolute; left: 30%; bottom: -60px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(232,83,58,0.1) 0%, transparent 70%);
          pointer-events: none;
        }
        .hero__inner { position: relative; z-index: 1; max-width: 680px; }
        .hero__eyebrow {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(245,166,35,0.18); border: 1px solid rgba(245,166,35,0.35);
          color: var(--amber); font-size: 0.78rem; font-weight: 600;
          padding: 5px 12px; border-radius: 50px; margin-bottom: 20px;
          letter-spacing: 0.5px; text-transform: uppercase;
        }
        .hero__title {
          font-family: 'Sora', sans-serif;
          font-size: clamp(2.2rem, 5vw, 3.5rem);
          font-weight: 800; color: #fff;
          line-height: 1.1; letter-spacing: -1px;
          margin-bottom: 18px;
        }
        .hero__title em { color: var(--amber); font-style: normal; }
        .hero__sub {
          color: rgba(255,255,255,0.7); font-size: 1.05rem;
          line-height: 1.7; max-width: 520px; margin-bottom: 32px;
        }
        .hero__stats {
          display: flex; gap: 32px; flex-wrap: wrap;
        }
        .hero__stat-item { text-align: left; }
        .hero__stat-num {
          font-family: 'Sora', sans-serif;
          font-size: 1.8rem; font-weight: 800; color: var(--amber);
        }
        .hero__stat-label { color: rgba(255,255,255,0.55); font-size: 0.8rem; margin-top: 2px; }

        /* ── FILTER BAR ── */
        .filter-section {
          background: #fff;
          border-bottom: 1px solid var(--border);
          position: sticky; top: 64px; z-index: 90;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .filter-inner {
          padding: 0 5%;
          display: flex; align-items: center; gap: 0;
          overflow-x: auto;
          scrollbar-width: none;
        }
        .filter-inner::-webkit-scrollbar { display: none; }
        .filter-chip {
          flex-shrink: 0;
          display: flex; align-items: center; gap: 7px;
          padding: 14px 18px;
          border: none; background: transparent;
          cursor: pointer; font-family: 'Inter', sans-serif;
          font-size: 0.88rem; font-weight: 500; color: var(--text-muted);
          border-bottom: 3px solid transparent;
          transition: color 0.18s, border-color 0.18s;
          white-space: nowrap;
        }
        .filter-chip:hover { color: var(--green); }
        .filter-chip.active {
          color: var(--green); font-weight: 700;
          border-bottom-color: var(--green);
        }
        .filter-chip__emoji { font-size: 1.1rem; }
        .filter-chip__count {
          background: var(--green-light); color: var(--green);
          font-size: 0.72rem; font-weight: 700;
          padding: 2px 7px; border-radius: 50px;
        }
        .filter-chip.active .filter-chip__count {
          background: var(--green); color: #fff;
        }
        .filter-see-more {
          flex-shrink: 0;
          margin-left: auto;
          display: flex; align-items: center; gap: 6px;
          padding: 14px 20px;
          border: none; background: transparent;
          cursor: pointer; font-family: 'Sora', sans-serif;
          font-size: 0.85rem; font-weight: 700; color: var(--coral);
          white-space: nowrap;
          transition: opacity 0.15s;
        }
        .filter-see-more:hover { opacity: 0.75; }

        /* ── MAIN CONTENT ── */
        .main-content { padding: 40px 5% 80px; }

        .section-header {
          display: flex; align-items: flex-end; justify-content: space-between;
          margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
        }
        .section-title {
          font-family: 'Sora', sans-serif;
          font-size: 1.55rem; font-weight: 800; color: var(--text);
          letter-spacing: -0.5px;
        }
        .section-subtitle { color: var(--text-muted); font-size: 0.9rem; margin-top: 4px; }
        .section-count {
          background: var(--green-light); color: var(--green);
          padding: 6px 14px; border-radius: 50px;
          font-size: 0.82rem; font-weight: 700;
        }

        /* active market banner */
        .market-banner {
          background: linear-gradient(90deg, var(--green) 0%, var(--green-mid) 100%);
          border-radius: var(--radius);
          padding: 18px 24px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 28px; flex-wrap: wrap; gap: 12px;
        }
        .market-banner__left { display: flex; align-items: center; gap: 14px; }
        .market-banner__emoji {
          font-size: 2rem;
          background: rgba(255,255,255,0.12); border-radius: 10px;
          padding: 8px 12px;
        }
        .market-banner__name {
          font-family: 'Sora', sans-serif;
          font-size: 1.15rem; font-weight: 800; color: #fff;
        }
        .market-banner__detail { color: rgba(255,255,255,0.65); font-size: 0.83rem; margin-top: 2px; }
        .market-banner__clear {
          background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
          color: #fff; border-radius: 50px;
          padding: 7px 16px; font-size: 0.82rem; font-weight: 600;
          cursor: pointer; transition: background 0.15s;
        }
        .market-banner__clear:hover { background: rgba(255,255,255,0.25); }

        /* ── PRODUCT GRID ── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 20px;
        }

        .product-card {
          background: var(--card-bg);
          border-radius: var(--radius);
          overflow: hidden;
          border: 1px solid var(--border);
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-hover);
        }
        .product-card__image-wrap {
          position: relative; overflow: hidden;
          aspect-ratio: 1 / 1; background: var(--bg);
        }
        .product-card__img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform 0.35s ease;
        }
        .product-card:hover .product-card__img { transform: scale(1.05); }
        .product-card__no-img {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
          font-size: 3rem; background: var(--green-light);
        }
        .product-card__badge {
          position: absolute; top: 10px; left: 10px;
          background: var(--coral); color: #fff;
          font-size: 0.72rem; font-weight: 800;
          padding: 3px 9px; border-radius: 50px;
        }
        .product-card__out-overlay {
          position: absolute; inset: 0;
          background: rgba(0,0,0,0.5);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-weight: 700; font-size: 0.85rem;
        }
        .product-card__hover-cta {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 12px;
          background: linear-gradient(0deg, rgba(13,59,46,0.9) 0%, transparent 100%);
          opacity: 0; transform: translateY(8px);
          transition: opacity 0.22s, transform 0.22s;
          display: flex; justify-content: center;
        }
        .product-card:hover .product-card__hover-cta { opacity: 1; transform: translateY(0); }
        .btn-view {
          background: var(--amber); color: var(--green);
          border: none; border-radius: 50px;
          padding: 8px 20px; font-weight: 800; font-size: 0.8rem;
          cursor: pointer; font-family: 'Sora', sans-serif;
          letter-spacing: 0.2px;
        }
        .product-card__body { padding: 14px 16px 16px; }
        .product-card__category {
          font-size: 0.72rem; font-weight: 700; color: var(--amber);
          text-transform: uppercase; letter-spacing: 0.6px; margin-bottom: 4px;
        }
        .product-card__name {
          font-family: 'Sora', sans-serif;
          font-size: 0.95rem; font-weight: 700; color: var(--text);
          line-height: 1.35;
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden; margin-bottom: 5px;
        }
        .product-card__market { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 8px; }
        .product-card__price-row { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .price-main, .price-sale {
          font-family: 'Sora', sans-serif;
          font-size: 1.05rem; font-weight: 800; color: var(--green);
        }
        .price-sale { color: var(--coral); }
        .price-original {
          font-size: 0.8rem; color: var(--text-light);
          text-decoration: line-through;
        }
        .product-card__rating { font-size: 0.75rem; color: var(--amber); }
        .rating-count { color: var(--text-muted); margin-left: 4px; font-size: 0.72rem; }

        /* ── SKELETON ── */
        .skeleton-card {
          background: var(--card-bg); border-radius: var(--radius);
          border: 1px solid var(--border); overflow: hidden;
        }
        .skeleton { background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
        .skeleton-img { aspect-ratio: 1/1; border-radius: 0; }
        .skeleton-body { padding: 14px 16px 16px; display: flex; flex-direction: column; gap: 10px; }
        .skeleton-line { height: 12px; }
        .skeleton-line.short { width: 50%; }
        .skeleton-line.medium { width: 70%; }

        /* ── EMPTY / ERROR ── */
        .empty-state {
          text-align: center; padding: 80px 20px;
          grid-column: 1 / -1;
        }
        .empty-state__icon { font-size: 3.5rem; margin-bottom: 16px; }
        .empty-state__title { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 700; margin-bottom: 8px; }
        .empty-state__desc { color: var(--text-muted); font-size: 0.9rem; }

        /* ── MODAL ── */
        .modal-backdrop {
          position: fixed; inset: 0; z-index: 200;
          background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: flex-end;
          animation: fadeIn 0.18s ease;
        }
        @media (min-width: 640px) {
          .modal-backdrop { align-items: center; justify-content: center; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .modal-panel {
          background: #fff; width: 100%;
          border-radius: 24px 24px 0 0;
          max-height: 85vh; overflow-y: auto;
          padding: 28px 24px 40px;
          animation: slideUp 0.22s ease;
        }
        @media (min-width: 640px) {
          .modal-panel {
            border-radius: 20px;
            max-width: 720px; max-height: 80vh;
          }
        }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: none; opacity: 1; } }
        .modal-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 24px;
        }
        .modal-title { font-family: 'Sora', sans-serif; font-size: 1.3rem; font-weight: 800; }
        .modal-subtitle { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; }
        .modal-close {
          background: var(--bg); border: none; border-radius: 50%;
          width: 36px; height: 36px; cursor: pointer; font-size: 1rem;
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted); flex-shrink: 0;
          transition: background 0.15s;
        }
        .modal-close:hover { background: var(--border); }
        .modal-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        .modal-market-card {
          background: var(--bg); border: 2px solid var(--border);
          border-radius: var(--radius); padding: 16px;
          text-align: left; cursor: pointer;
          display: flex; gap: 12px; align-items: flex-start;
          transition: border-color 0.15s, background 0.15s, transform 0.15s;
        }
        .modal-market-card:hover { border-color: var(--green); background: var(--green-light); transform: translateY(-2px); }
        .modal-market-card.active { border-color: var(--green); background: var(--green-light); }
        .modal-market-emoji { font-size: 1.6rem; flex-shrink: 0; }
        .modal-market-info { min-width: 0; }
        .modal-market-name { font-family: 'Sora', sans-serif; font-weight: 700; font-size: 0.88rem; color: var(--text); }
        .modal-market-loc { font-size: 0.75rem; color: var(--text-muted); margin-top: 2px; }
        .modal-market-known { font-size: 0.75rem; color: var(--text-muted); margin-top: 3px; line-height: 1.4; }

        /* ── RESPONSIVE ── */
        @media (max-width: 768px) {
          .oja-nav__search { display: none; }
          .hero { padding: 52px 5% 64px; }
          .hero__stats { gap: 20px; }
          .products-grid { grid-template-columns: repeat(2, 1fr); gap: 12px; }
          .main-content { padding: 24px 4% 60px; }
          .filter-see-more { padding: 14px 14px; }
          .section-header { margin-bottom: 18px; }
        }
        @media (max-width: 400px) {
          .products-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* NAV */}
      <nav className="oja-nav">
        <div className="oja-nav__logo">🛒 E<span>Stores</span></div>
        <div className="oja-nav__search">
          <span className="oja-nav__search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products, markets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {/* <div className="oja-nav__actions">
          <button className="oja-nav__cart">🛍️ Cart</button>
        </div> */}
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero__inner">
          <div className="hero__eyebrow">🇳🇬 Lagos' Premier Marketplace</div>
          <h1 className="hero__title">
            Shop directly from<br /><em>Lagos' best markets</em>
          </h1>
          <p className="hero__sub">
            Discover thousands of products from verified sellers across Ladipo, Computer Village, Balogun, and every major market in Lagos — all in one place.
          </p>
          <div className="hero__stats">
            <div className="hero__stat-item">
              <div className="hero__stat-num">{products.length > 0 ? `${products.length}+` : "10K+"}</div>
              <div className="hero__stat-label">Products Listed</div>
            </div>
            <div className="hero__stat-item">
              <div className="hero__stat-num">10</div>
              <div className="hero__stat-label">Lagos Markets</div>
            </div>
            <div className="hero__stat-item">
              <div className="hero__stat-num">100%</div>
              <div className="hero__stat-label">Verified Sellers</div>
            </div>
          </div>
        </div>
      </section>

      {/* FILTER BAR */}
      <div className="filter-section" ref={filterRef}>
        <div className="filter-inner">
          <button
            className={`filter-chip ${!selectedMarket ? "active" : ""}`}
            onClick={() => setSelectedMarket(null)}
          >
            <span className="filter-chip__emoji">🏪</span>
            All Markets
            <span className="filter-chip__count">
              {products.length}
            </span>
          </button>

          {visibleMarkets.map((market) => {
            const count = products.filter((p) => p.seller?.sellerProfile?.market === market.name).length;
            return (
              <button
                key={market.id}
                className={`filter-chip ${selectedMarket?.id === market.id ? "active" : ""}`}
                onClick={() => setSelectedMarket(market)}
              >
                <span className="filter-chip__emoji">{market.emoji}</span>
                {market.name.split(" ")[0]}
                {count > 0 && <span className="filter-chip__count">{count}</span>}
              </button>
            );
          })}

          <button className="filter-see-more" onClick={() => setModalOpen(true)}>
            All Markets ＋
          </button>
        </div>
      </div>

      {/* MAIN */}
      <main className="main-content">
        {selectedMarket && (
          <div className="market-banner">
            <div className="market-banner__left">
              <div className="market-banner__emoji">{selectedMarket.emoji}</div>
              <div>
                <div className="market-banner__name">{selectedMarket.name}</div>
                <div className="market-banner__detail">
                  📍 {selectedMarket.location} &nbsp;·&nbsp; {selectedMarket.knownFor}
                </div>
              </div>
            </div>
            <button className="market-banner__clear" onClick={() => setSelectedMarket(null)}>
              ✕ Clear filter
            </button>
          </div>
        )}

        <div className="section-header">
          <div>
            <h2 className="section-title">
              {selectedMarket ? `${selectedMarket.name} Products` : "All Products"}
            </h2>
            <p className="section-subtitle">
              {selectedMarket ? selectedMarket.description : "Browse products from all Lagos markets"}
            </p>
          </div>
          {!loading && (
            <span className="section-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"}
            </span>
          )}
        </div>

        <div className="products-grid">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
          ) : error ? (
            <div className="empty-state">
              <div className="empty-state__icon">⚠️</div>
              <div className="empty-state__title">Couldn't load products</div>
              <p className="empty-state__desc">{error}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state__icon">🔍</div>
              <div className="empty-state__title">No products found</div>
              <p className="empty-state__desc">
                {selectedMarket
                  ? `No products from ${selectedMarket.name} yet.`
                  : "Try adjusting your search."}
              </p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} onClick={handleProductClick} />
            ))
          )}
        </div>
      </main>

      {/* MARKET MODAL */}
      <MarketModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSelect={setSelectedMarket}
        selectedMarket={selectedMarket}
      />
    </>
  );
}