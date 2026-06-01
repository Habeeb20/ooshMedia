import { useState, useEffect } from 'react';
import { X, Check, Search, Package } from 'lucide-react';
import axios from 'axios';

export default function ProductSelectorModal({ adType, planConfig, planColor, onClose, onConfirm, paying }) {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [discount, setDiscount] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/products`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => { setProducts(r.data.products || []);
        console.log(r.data.products)
         setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const toggle = (id) => {
    setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const filtered = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const showDiscount = ['flash_sale', 'discount_deals', 'anniversary_deals'].includes(adType);

  return (
    <div style={overlay}>
      <div style={modal}>
        <div style={header}>
          <div>
            <h3 style={title}>Select Products</h3>
            <p style={sub}>{planConfig?.duration} days · ₦{planConfig?.price?.toLocaleString()}</p>
          </div>
          <button style={closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div style={bodyStyle}>
          <div style={searchBox}>
            <Search size={15} color="#94a3b8" />
            <input
              style={searchInput}
              placeholder="Search your products..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {showDiscount && (
            <div style={discountRow}>
              <label style={fieldLabel}>Discount Percentage (%)</label>
              <input style={fieldInput} type="number" min={1} max={90} placeholder="e.g. 30"
                value={discount} onChange={e => setDiscount(e.target.value)} />
            </div>
          )}

          {selected.length > 0 && (
            <div style={selectedCount}>
              <span style={{ ...dot, background: planColor }} />
              {selected.length} product{selected.length > 1 ? 's' : ''} selected
            </div>
          )}

          {loading && <p style={loadingTxt}>Loading your products...</p>}

          <div style={productGrid}>
            {filtered.map(product => {
              const isSelected = selected.includes(product._id);
              return (
                <div
                  key={product._id}
                  style={{ ...productCard, ...(isSelected ? { ...selectedCard, borderColor: planColor, background: planColor + '08' } : {}) }}
                  onClick={() => toggle(product._id)}
                >
                  {isSelected && (
                    <div style={{ ...checkMark, background: planColor }}>
                      <Check size={10} color="#fff" strokeWidth={3} />
                    </div>
                  )}
                  <div style={productImg}>
                    {product.images?.[0]?.url
                      ? <img src={product.images[0].url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <Package size={20} color="#94a3b8" />
                    }
                  </div>
                  <p style={productName}>{product.name}</p>
                  <p style={productPrice}>₦{product.price?.toLocaleString()}</p>
                  <span style={productCat}>{product.category}</span>
                </div>
              );
            })}
            {!loading && filtered.length === 0 && (
              <p style={emptyTxt}>No products found</p>
            )}
          </div>
        </div>

        <div style={footer}>
          <button style={cancelBtn} onClick={onClose}>Cancel</button>
          <button
            style={{ ...confirmBtn, background: selected.length ? planColor : '#94a3b8', cursor: selected.length ? 'pointer' : 'not-allowed' }}
            onClick={() => onConfirm({ products: selected, discountPercentage: discount ? Number(discount) : undefined })}
            disabled={!selected.length || paying}
          >
            {paying ? 'Processing...' : `Proceed to Payment (${selected.length} products) →`}
          </button>
        </div>
      </div>
    </div>
  );
}

const overlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
const modal = { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 600, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '1.25rem', borderBottom: '1px solid #f1f5f9' };
const title = { margin: '0 0 2px', fontSize: 17, fontWeight: 700, color: '#0f172a' };
const sub = { margin: 0, fontSize: 12, color: '#64748b' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' };
const bodyStyle = { padding: '1.25rem', overflowY: 'auto', flex: 1 };
const searchBox = { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, marginBottom: 12, background: '#fafafa' };
const searchInput = { flex: 1, border: 'none', outline: 'none', fontSize: 14, background: 'transparent' };
const discountRow = { marginBottom: 12 };
const fieldLabel = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 };
const fieldInput = { width: '100%', padding: '9px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', boxSizing: 'border-box' };
const selectedCount = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 12 };
const dot = { width: 8, height: 8, borderRadius: '50%', display: 'inline-block' };
const loadingTxt = { textAlign: 'center', color: '#888', padding: '1rem 0' };
const productGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 };
const productCard = { border: '2px solid #e2e8f0', borderRadius: 10, padding: 10, cursor: 'pointer', position: 'relative', transition: 'all 0.15s' };
const selectedCard = { borderWidth: 2 };
const checkMark = { position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const productImg = { width: '100%', aspectRatio: '1', background: '#f8fafc', borderRadius: 6, marginBottom: 6, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const productName = { margin: '0 0 2px', fontSize: 12, fontWeight: 600, color: '#1e293b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' };
const productPrice = { margin: '0 0 4px', fontSize: 12, color: '#2563eb', fontWeight: 700 };
const productCat = { fontSize: 10, background: '#f1f5f9', color: '#64748b', padding: '2px 6px', borderRadius: 4 };
const emptyTxt = { gridColumn: '1/-1', textAlign: 'center', color: '#94a3b8', padding: '1rem' };
const footer = { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9', flexWrap: 'wrap' };
const cancelBtn = { padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14 };
const confirmBtn = { padding: '9px 18px', borderRadius: 8, border: 'none', color: '#fff', fontSize: 13, fontWeight: 700 };