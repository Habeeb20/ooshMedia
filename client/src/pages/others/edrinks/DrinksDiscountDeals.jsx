/* eslint-disable no-unused-vars */
// ============================
// DISCOUNT DEALS SECTION — drinks only
// ============================
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Tag, TrendingUp, Trophy, Star, PartyPopper, ChevronLeft, ChevronRight, Clock, X } from 'lucide-react';
import { adAPI } from '../../../config/adApi';
const DRINKS_CATEGORY = 'drinks'; // adjust to match the exact category string you store on Product

export function EdrinksDiscountDealsSection() {
  const [ads, setAds] = useState([]);
  const navigate = useNavigate();
  const scrollRef = useRef();

  useEffect(() => {
    adAPI.getActiveAds('discount_deals').then(r => setAds(r.data.data)).catch(() => {});
  }, []);

  const allProducts = ads
    .flatMap(ad =>
      (ad.products || []).filter(Boolean).map(p => ({ ...p, adId: ad._id, discount: ad.discountPercentage }))
    )
    .filter(p => p.category?.trim().toLowerCase() === DRINKS_CATEGORY);

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



const dd = {
  section: {
    maxWidth: '1280px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '20px',
    fontWeight: 800,
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#6b7280',
  },
  navBtns: {
    display: 'flex',
    gap: '8px',
  },
  navBtn: {
    width: '34px',
    height: '34px',
    borderRadius: '9999px',
    border: '1px solid #e5e7eb',
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
  },
  scroller: {
    display: 'flex',
    gap: '16px',
    overflowX: 'auto',
    scrollBehavior: 'smooth',
    paddingBottom: '8px',
    scrollbarWidth: 'none',
  },
  card: {
    flex: '0 0 auto',
    width: '220px',
    borderRadius: '16px',
    border: '1px solid #ece7f0',
    background: '#fff',
    overflow: 'hidden',
    cursor: 'pointer',
  },
  imgBox: {
    position: 'relative',
    width: '100%',
    aspectRatio: '4 / 3',
    background: '#f0ecf3',
  },
  img: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  badge: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: '#f59e0b',
    padding: '4px 8px',
    borderRadius: '9999px',
  },
  badgeText: {
    color: '#fff',
    fontSize: '11px',
    fontWeight: 700,
  },
  info: {
    padding: '12px',
  },
  name: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#111827',
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cat: {
    fontSize: '12px',
    color: '#6b7280',
    margin: '2px 0 8px',
  },
  prices: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
  },
  newPrice: {
    fontSize: '15px',
    fontWeight: 800,
    color: '#9c1f45',
  },
  oldPrice: {
    fontSize: '12px',
    color: '#9ca3af',
    textDecoration: 'line-through',
  },
};