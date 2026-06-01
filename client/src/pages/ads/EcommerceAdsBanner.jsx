import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Tag, TrendingUp, Trophy, Star, PartyPopper, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';

import { adAPI } from '../../config/adApi';
// ============================
// FLASH SALE SECTION
// ============================
export function FlashSaleSection() {
  const [ads, setAds] = useState([]);
  const [timeLeft, setTimeLeft] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    adAPI.getActiveAds('flash_sale').then(r => {
      const data = r.data.data;
      setAds(data);
      // Init countdown
      const tl = {};
      data.forEach(ad => {
        tl[ad._id] = getTimeLeft(ad.endDate);
      });
      setTimeLeft(tl);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        const next = { ...prev };
        ads.forEach(ad => { next[ad._id] = getTimeLeft(ad.endDate); });
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [ads]);

  const allProducts = ads.flatMap(ad =>
    (ad.products || []).filter(Boolean).map(p => ({ ...p, adId: ad._id, discount: ad.discountPercentage }))
  );

  if (!allProducts.length) return null;

  const endDate = ads[0]?.endDate;
  const tl = timeLeft[ads[0]?._id] || {};

  return (
    <section style={fs.section}>
      <div style={fs.header}>
        <div style={fs.titleRow}>
          <div style={fs.flashBadge}><Zap size={14} fill="#fff" /> FLASH SALE</div>
          <h2 style={fs.sectionTitle}>Today's Flash Deals</h2>
        </div>
        {endDate && (
          <div style={fs.countdown}>
            <Clock size={13} />
            <span>Ends in:</span>
            {['hours', 'minutes', 'seconds'].map(unit => (
              <div key={unit} style={fs.timeBlock}>
                <span style={fs.timeNum}>{String(tl[unit] || 0).padStart(2, '0')}</span>
                <span style={fs.timeUnit}>{unit.slice(0, 1).toUpperCase()}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={fs.grid}>
        {allProducts.slice(0, 8).map((product, i) => (
          <div key={`${product._id}-${i}`} style={fs.card}
            onClick={() => { adAPI.trackClick(product.adId); navigate(`/product/${product.slug || product._id}`); }}>
            <div style={fs.imgBox}>
              {product.discount > 0 && <span style={fs.discountTag}>-{product.discount}%</span>}
              <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} style={fs.img} />
            </div>
            <div style={fs.info}>
              <p style={fs.name}>{product.name}</p>
              <div style={fs.priceRow}>
                {product.discount > 0 && (
                  <span style={fs.originalPrice}>₦{product.price?.toLocaleString()}</span>
                )}
                <span style={fs.salePrice}>
                  ₦{Math.round(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}
                </span>
              </div>
              <div style={fs.soldBar}>
                <div style={{ ...fs.soldFill, width: `${Math.min((product.sold || 0) / 100 * 100, 100)}%` }} />
              </div>
              <span style={fs.soldText}>{product.sold || 0} sold</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================
// DISCOUNT DEALS SECTION
// ============================
export function DiscountDealsSection() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef();

  useEffect(() => {
    adAPI.getActiveAds('discount_deals').then(r => setAds(r.data.data)).catch(() => {});
  }, []);

  const allProducts = ads.flatMap(ad =>
    (ad.products || []).filter(Boolean).map(p => ({ ...p, adId: ad._id, discount: ad.discountPercentage }))
  );

  if (!allProducts.length) return null;

  const scroll = (dir) => scrollRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });

  return (
    <section style={dd.section}>
      <div style={dd.header}>
        <div style={dd.titleRow}>
          <Tag size={20} color="#f59e0b" />
          <h2 style={dd.title}>Discount Deals</h2>
          <span style={dd.subtitle}>Save big on these exclusive deals</span>
        </div>
        <div style={dd.navBtns}>
          <button style={dd.navBtn} onClick={() => scroll(-1)}><ChevronLeft size={18} /></button>
          <button style={dd.navBtn} onClick={() => scroll(1)}><ChevronRight size={18} /></button>
        </div>
      </div>

      <div ref={scrollRef} style={dd.scroller}>
        {allProducts.map((product, i) => (
          <div key={`${product._id}-${i}`} style={dd.card}
            onClick={() => { adAPI.trackClick(product.adId); navigate(`/product/${product.slug || product._id}`); }}>
            <div style={dd.imgBox}>
              <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} style={dd.img} />
              {product.discount > 0 && (
                <div style={dd.badge}>
                  <span style={dd.badgeText}>{product.discount}% OFF</span>
                </div>
              )}
            </div>
            <div style={dd.info}>
              <p style={dd.name}>{product.name}</p>
              <p style={dd.cat}>{product.category}</p>
              <div style={dd.prices}>
                <span style={dd.newPrice}>₦{Math.round(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}</span>
                {product.discount > 0 && <span style={dd.oldPrice}>₦{product.price?.toLocaleString()}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================
// TRENDING NOW SECTION
// ============================
export function TrendingNowSection() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    adAPI.getActiveAds('trending_now').then(r => setAds(r.data.data)).catch(() => {});
  }, []);

  const allProducts = ads.flatMap(ad => (ad.products || []).filter(Boolean).map(p => ({ ...p, adId: ad._id })));

  if (!allProducts.length) return null;

  return (
    <section style={tn.section}>
      <div style={tn.header}>
        <TrendingUp size={20} color="#f97316" />
        <h2 style={tn.title}>Trending Now</h2>
        <span style={tn.fire}>🔥</span>
      </div>
      <div style={tn.grid}>
        {allProducts.slice(0, 6).map((product, i) => (
          <div key={`${product._id}-${i}`} style={{ ...tn.card, ...(i === 0 ? tn.cardFeatured : {}) }}
            onClick={() => { adAPI.trackClick(product.adId); navigate(`/product/${product.slug || product._id}`); }}>
            <div style={{ ...tn.rank, background: i < 3 ? ['#ef4444', '#f97316', '#f59e0b'][i] : '#e2e8f0', color: i < 3 ? '#fff' : '#64748b' }}>
              #{i + 1}
            </div>
            <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} style={i === 0 ? tn.imgFeatured : tn.img} />
            <div style={tn.info}>
              <p style={tn.name}>{product.name}</p>
              <p style={tn.price}>₦{product.price?.toLocaleString()}</p>
              <div style={tn.stats}>
                <span style={tn.stat}>👁 {product.views || 0}</span>
                <span style={tn.stat}>⭐ {product.ratings?.toFixed(1) || '—'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================
// TOP SELLERS SECTION
// ============================
export function TopSellersSection() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    adAPI.getActiveAds('top_sellers').then(r => setAds(r.data.data)).catch(() => {});
  }, []);

  if (!ads.length) return null;

  return (
    <section style={ts.section}>
      <div style={ts.header}>
        <Trophy size={20} color="#eab308" />
        <h2 style={ts.title}>Top Sellers</h2>
      </div>
      <div style={ts.grid}>
        {ads.slice(0, 6).map((ad, i) => {
          const seller = ad.seller;
          return (
            <div key={ad._id} style={ts.card} onClick={() => navigate(`/seller/${seller?._id}`)}>
              <div style={{ ...ts.rankBadge, background: i < 3 ? '#fef3c7' : '#f8fafc' }}>
                <span style={{ ...ts.rankNum, color: i < 3 ? '#92400e' : '#64748b' }}>#{i + 1}</span>
                {i < 3 && <Trophy size={12} color="#eab308" />}
              </div>
              <div style={ts.avatar}>
                {seller?.profilePicture
                  ? <img src={seller.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                  : <span style={ts.avatarText}>{seller?.firstName?.[0]}{seller?.lastName?.[0]}</span>
                }
              </div>
              <p style={ts.sellerName}>{seller?.businessProfile?.businessName || `${seller?.firstName} ${seller?.lastName}`}</p>
              <p style={ts.sellerSub}>{seller?.sellerProfile?.shopName || 'Verified Seller'}</p>
              {seller?.businessProfile?.verified && <span style={ts.verifiedBadge}>✓ Verified</span>}
              <button style={ts.viewBtn}>View Shop</button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ============================
// TOP PRODUCTS SECTION
// ============================
export function TopProductsSection() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    adAPI.getActiveAds('top_products').then(r => setAds(r.data.data)).catch(() => {});
  }, []);

  const allProducts = ads.flatMap(ad => (ad.products || []).filter(Boolean).map(p => ({ ...p, adId: ad._id })));

  if (!allProducts.length) return null;

  return (
    <section style={tp.section}>
      <div style={tp.header}>
        <Star size={20} color="#8b5cf6" fill="#8b5cf6" />
        <h2 style={tp.title}>Top Products</h2>
        <span style={tp.badge}>Editor's Pick</span>
      </div>
      <div style={tp.grid}>
        {allProducts.slice(0, 8).map((product, i) => (
          <div key={`${product._id}-${i}`} style={tp.card}
            onClick={() => { adAPI.trackClick(product.adId); navigate(`/product/${product.slug || product._id}`); }}>
            <div style={tp.imgBox}>
              <span style={tp.starBadge}>⭐ Top Pick</span>
              <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} style={tp.img} />
            </div>
            <div style={tp.info}>
              <p style={tp.name}>{product.name}</p>
              <p style={tp.price}>₦{product.price?.toLocaleString()}</p>
              <div style={tp.rating}>
                {'★'.repeat(Math.round(product.ratings || 4))}{'☆'.repeat(5 - Math.round(product.ratings || 4))}
                <span style={tp.ratingNum}>({product.sold || 0})</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================
// ANNIVERSARY DEALS SECTION
// ============================
export function AnniversaryDealsSection() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    adAPI.getActiveAds('anniversary_deals').then(r => setAds(r.data.data)).catch(() => {});
  }, []);

  const allProducts = ads.flatMap(ad =>
    (ad.products || []).filter(Boolean).map(p => ({ ...p, adId: ad._id, discount: ad.discountPercentage }))
  );

  if (!allProducts.length) return null;

  return (
    <section style={an.section}>
      <div style={an.heroBanner}>
        <div style={an.heroText}>
          <span style={an.confetti}>🎉</span>
          <h2 style={an.heroTitle}>Anniversary Deals</h2>
          <p style={an.heroSub}>Celebrate with unbeatable prices!</p>
        </div>
        <div style={an.decorCircle1} />
        <div style={an.decorCircle2} />
      </div>
      <div style={an.grid}>
        {allProducts.slice(0, 8).map((product, i) => (
          <div key={`${product._id}-${i}`} style={an.card}
            onClick={() => { adAPI.trackClick(product.adId); navigate(`/product/${product.slug || product._id}`); }}>
            <div style={an.imgBox}>
              {product.discount > 0 && <span style={an.discBadge}>🎉 {product.discount}% OFF</span>}
              <img src={product.images?.[0]?.url || '/placeholder.png'} alt={product.name} style={an.img} />
            </div>
            <p style={an.name}>{product.name}</p>
            <div style={an.priceRow}>
              <span style={an.newPrice}>₦{Math.round(product.price * (1 - (product.discount || 0) / 100)).toLocaleString()}</span>
              {product.discount > 0 && <span style={an.oldPrice}>₦{product.price?.toLocaleString()}</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ============================
// COMPANY ADS SIDEBAR + POPUP
// ============================
export function CompanyAdDisplay() {
  const [ads, setAds] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);
  const [popupTimer, setPopupTimer] = useState(3);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    adAPI.getActiveAds('company_ads').then(r => {
      const data = r.data.data;
      setAds(data);
      if (data.length && !popupClosed) {
        setTimeout(() => setShowPopup(true), 2000);
      }
    }).catch(() => {});
  }, []);

  // Rotate ads every 8s
  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => setCurrentIdx(i => (i + 1) % ads.length), 8000);
    return () => clearInterval(t);
  }, [ads.length]);

  // Popup countdown
  useEffect(() => {
    if (!showPopup) return;
    const t = setInterval(() => {
      setPopupTimer(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [showPopup]);

  if (!ads.length) return null;

  const current = ads[currentIdx];
  const ad = current?.companyAd;
  if (!ad?.title) return null;

  const handleClick = () => {
    adAPI.trackClick(current._id);
    if (ad.ctaLink) window.open(ad.ctaLink, '_blank');
  };

  // Mobile popup
  if (isMobile) {
    if (!showPopup || popupClosed) return null;
    return (
      <div style={ca.mobileOverlay}>
        <div style={ca.mobilePopup}>
          <div style={ca.mobileHeader}>
            <span style={ca.sponsoredLabel}>Sponsored</span>
            <button
              style={{ ...ca.closePopupBtn, ...(popupTimer > 0 ? ca.closeDisabled : {}) }}
              onClick={() => { setShowPopup(false); setPopupClosed(true); }}
              disabled={popupTimer > 0}
            >
              {popupTimer > 0 ? `${popupTimer}s` : <X size={16} />}
            </button>
          </div>
          {ad.imageUrl && (
            <img src={ad.imageUrl} alt={ad.title} style={ca.mobileImg} />
          )}
          <div style={ca.mobileBody}>
            <h3 style={ca.mobileTitle}>{ad.title}</h3>
            {ad.description && <p style={ca.mobileDesc}>{ad.description}</p>}
            <button style={ca.mobileCTA} onClick={handleClick}>{ad.ctaText || 'Learn More'} →</button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop sidebar
  return (
    <div style={ca.sidebar}>
      <div style={ca.sidebarInner}>
        <span style={ca.sidebarSponsored}>Sponsored</span>
        {ad.imageUrl && (
          <img src={ad.imageUrl} alt={ad.title} style={ca.sidebarImg} />
        )}
        <div style={ca.sidebarBody}>
          <h4 style={ca.sidebarTitle}>{ad.title}</h4>
          {ad.description && <p style={ca.sidebarDesc}>{ad.description}</p>}
          <button style={ca.sidebarCTA} onClick={handleClick}>{ad.ctaText || 'Learn More'}</button>
        </div>
        {ads.length > 1 && (
          <div style={ca.dots}>
            {ads.map((_, i) => (
              <span key={i} style={{ ...ca.dot, background: i === currentIdx ? '#2563eb' : '#cbd5e1' }} onClick={() => setCurrentIdx(i)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- Helpers ----
function getTimeLeft(endDate) {
  const diff = Math.max(0, new Date(endDate) - new Date());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

// ---- Styles ----
const fs = {
  section: { background: 'linear-gradient(135deg, #fff5f5, #fff)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #fee2e2' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: 10 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  flashBadge: { display: 'flex', alignItems: 'center', gap: 4, background: '#ef4444', color: '#fff', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 800 },
  sectionTitle: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' },
  countdown: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#ef4444', fontWeight: 600 },
  timeBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', background: '#ef4444', borderRadius: 6, padding: '4px 8px', minWidth: 32 },
  timeNum: { fontSize: 16, fontWeight: 800, color: '#fff', lineHeight: 1 },
  timeUnit: { fontSize: 9, color: '#fca5a5', fontWeight: 700 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  card: { background: '#fff', borderRadius: 12, overflow: 'hidden', border: '1px solid #fecaca', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' },
  imgBox: { position: 'relative', background: '#f8fafc', aspectRatio: '1' },
  discountTag: { position: 'absolute', top: 6, left: 6, background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 6, zIndex: 1 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: '8px 10px' },
  name: { margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap', marginBottom: 4 },
  originalPrice: { fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' },
  salePrice: { fontSize: 13, fontWeight: 800, color: '#ef4444' },
  soldBar: { height: 4, background: '#fee2e2', borderRadius: 4, overflow: 'hidden', marginBottom: 2 },
  soldFill: { height: '100%', background: '#ef4444', borderRadius: 4 },
  soldText: { fontSize: 10, color: '#94a3b8' },
};

const dd = {
  section: { background: '#fff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #fef3c7' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' },
  titleRow: { display: 'flex', alignItems: 'center', gap: 10 },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' },
  subtitle: { fontSize: 13, color: '#94a3b8' },
  navBtns: { display: 'flex', gap: 6 },
  navBtn: { width: 32, height: 32, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  scroller: { display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollbarWidth: 'none' },
  card: { flexShrink: 0, width: 160, background: '#fff', borderRadius: 12, border: '1px solid #fef3c7', overflow: 'hidden', cursor: 'pointer' },
  imgBox: { position: 'relative', background: '#fffbeb', aspectRatio: '1' },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  badge: { position: 'absolute', inset: 0, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 6 },
  badgeText: { background: '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 6 },
  info: { padding: '8px 10px' },
  name: { margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cat: { margin: '0 0 6px', fontSize: 10, color: '#94a3b8' },
  prices: { display: 'flex', flexDirection: 'column', gap: 1 },
  newPrice: { fontSize: 13, fontWeight: 800, color: '#f59e0b' },
  oldPrice: { fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' },
};

const tn = {
  section: { background: 'linear-gradient(135deg, #fff7ed, #fff)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #fed7aa' },
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b', flex: 1 },
  fire: { fontSize: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #fed7aa', overflow: 'hidden', cursor: 'pointer', position: 'relative', transition: 'transform 0.15s' },
  cardFeatured: { gridColumn: 'span 2', display: 'flex', flexDirection: 'row' },
  rank: { position: 'absolute', top: 8, left: 8, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, zIndex: 1 },
  img: { width: '100%', aspectRatio: '1', objectFit: 'cover' },
  imgFeatured: { width: '50%', objectFit: 'cover' },
  info: { padding: '8px 10px', flex: 1 },
  name: { margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  price: { margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: '#f97316' },
  stats: { display: 'flex', gap: 8 },
  stat: { fontSize: 10, color: '#94a3b8' },
};

const ts = {
  section: { background: 'linear-gradient(135deg, #fffbeb, #fff)', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #fde68a' },
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 12 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #fde68a', padding: '1rem', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.15s' },
  rankBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 700, marginBottom: 8 },
  rankNum: { fontWeight: 800 },
  avatar: { width: 56, height: 56, borderRadius: '50%', background: '#e8eaf6', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarText: { fontSize: 18, fontWeight: 700, color: '#3949ab' },
  sellerName: { margin: '0 0 2px', fontWeight: 700, fontSize: 13, color: '#1e293b' },
  sellerSub: { margin: '0 0 6px', fontSize: 11, color: '#94a3b8' },
  verifiedBadge: { display: 'inline-block', fontSize: 10, background: '#dcfce7', color: '#166534', padding: '2px 7px', borderRadius: 20, fontWeight: 600, marginBottom: 8 },
  viewBtn: { width: '100%', padding: '6px 0', borderRadius: 8, background: '#fef3c7', border: 'none', color: '#92400e', fontSize: 12, fontWeight: 700, cursor: 'pointer' },
};

const tp = {
  section: { background: '#faf5ff', borderRadius: 16, padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #e9d5ff' },
  header: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' },
  title: { margin: 0, fontSize: 20, fontWeight: 800, color: '#1e293b', flex: 1 },
  badge: { background: '#7c3aed', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  card: { background: '#fff', borderRadius: 12, border: '1px solid #e9d5ff', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s' },
  imgBox: { position: 'relative', background: '#faf5ff', aspectRatio: '1' },
  starBadge: { position: 'absolute', top: 6, left: 6, background: '#fff', border: '1px solid #e9d5ff', borderRadius: 20, fontSize: 10, fontWeight: 700, padding: '2px 6px', zIndex: 1 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  info: { padding: '8px 10px' },
  name: { margin: '0 0 4px', fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  price: { margin: '0 0 4px', fontSize: 13, fontWeight: 800, color: '#7c3aed' },
  rating: { fontSize: 11, color: '#f59e0b' },
  ratingNum: { color: '#94a3b8', fontSize: 10, marginLeft: 2 },
};

const an = {
  section: { borderRadius: 16, overflow: 'hidden', marginBottom: '1.5rem', border: '1px solid #fce7f3' },
  heroBanner: { background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', padding: '1.5rem', position: 'relative', overflow: 'hidden' },
  heroText: { position: 'relative', zIndex: 1 },
  confetti: { fontSize: 28 },
  heroTitle: { margin: '4px 0 4px', fontSize: 24, fontWeight: 900, color: '#fff' },
  heroSub: { margin: 0, color: 'rgba(255,255,255,0.8)', fontSize: 14 },
  decorCircle1: { position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -30, right: 40 },
  decorCircle2: { position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -20, right: 100 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, background: '#fff', padding: '1.25rem' },
  card: { background: '#fff', borderRadius: 10, border: '1px solid #fce7f3', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.15s' },
  imgBox: { position: 'relative', background: '#fdf2f8', aspectRatio: '1' },
  discBadge: { position: 'absolute', top: 6, left: 6, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20, zIndex: 1 },
  img: { width: '100%', height: '100%', objectFit: 'cover' },
  name: { margin: '8px 8px 3px', fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  priceRow: { display: 'flex', alignItems: 'center', gap: 5, padding: '0 8px 8px', flexWrap: 'wrap' },
  newPrice: { fontSize: 13, fontWeight: 800, color: '#ec4899' },
  oldPrice: { fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' },
};

const ca = {
  // Mobile popup
  mobileOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  mobilePopup: { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 340, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' },
  mobileHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' },
  sponsoredLabel: { fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5 },
  closePopupBtn: { width: 28, height: 28, borderRadius: '50%', border: '1.5px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 12, fontWeight: 700, color: '#64748b' },
  closeDisabled: { background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' },
  mobileImg: { width: '100%', aspectRatio: '16/9', objectFit: 'cover' },
  mobileBody: { padding: '1rem' },
  mobileTitle: { margin: '0 0 6px', fontSize: 17, fontWeight: 800, color: '#1e293b' },
  mobileDesc: { margin: '0 0 12px', fontSize: 13, color: '#64748b', lineHeight: 1.5 },
  mobileCTA: { width: '100%', padding: '10px 0', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  // Desktop sidebar
  sidebar: { width: 220, flexShrink: 0 },
  sidebarInner: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', overflow: 'hidden', position: 'sticky', top: 80 },
  sidebarSponsored: { display: 'block', textAlign: 'center', fontSize: 10, color: '#94a3b8', fontWeight: 600, letterSpacing: 0.5, padding: '6px 0', background: '#f8fafc', borderBottom: '1px solid #f1f5f9' },
  sidebarImg: { width: '100%', aspectRatio: '4/3', objectFit: 'cover' },
  sidebarBody: { padding: '12px' },
  sidebarTitle: { margin: '0 0 5px', fontSize: 14, fontWeight: 700, color: '#1e293b' },
  sidebarDesc: { margin: '0 0 10px', fontSize: 12, color: '#64748b', lineHeight: 1.5 },
  sidebarCTA: { width: '100%', padding: '8px 0', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: 'pointer' },
  dots: { display: 'flex', justifyContent: 'center', gap: 5, padding: '8px 0', background: '#f8fafc' },
  dot: { width: 6, height: 6, borderRadius: '50%', cursor: 'pointer', transition: 'background 0.2s' },
};