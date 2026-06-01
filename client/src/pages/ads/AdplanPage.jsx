import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, Zap, Tag, TrendingUp, Trophy, Star, PartyPopper, Megaphone, ArrowRight, X } from 'lucide-react';
import { adAPI } from '../../config/adApi';
import ProductSelectorModal from './ProductSelectorModal';


const TYPE_ICONS = {
  flash_sale: Zap,
  discount_deals: Tag,
  trending_now: TrendingUp,
  top_sellers: Trophy,
  top_products: Star,
  anniversary_deals: PartyPopper,
  company_ads: Megaphone,
};

export default function AdPlansPage({ currentUser }) {
  const [plans, setPlans] = useState({});
  const [selected, setSelected] = useState(null); // { adType, planKey }
  const [loading, setLoading] = useState(true);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showCompanyAdForm, setShowCompanyAdForm] = useState(false);
  const [paying, setPaying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    adAPI.getPlans().then(r => { setPlans(r.data.data); setLoading(false); });
  }, []);

  const handleSelectPlan = (adType, planKey) => {
    setSelected({ adType, planKey });
    if (adType === 'company_ads') setShowCompanyAdForm(true);
    else setShowProductSelector(true);
  };

  const handleProceedToPayment = async (extraData = {}) => {
    if (!selected) return;
    setPaying(true);
    try {
      const res = await adAPI.subscribe({
        adType: selected.adType,
        plan: selected.planKey,
        ...extraData
      });
      window.location.href = res.data.data.authorizationUrl;
    } catch (e) {
      alert(e.response?.data?.message || 'Payment initiation failed');
    }
    setPaying(false);
  };

  if (loading) return <div style={styles.loading}>Loading ad plans...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.heroSection}>
        <span style={styles.heroTag}>🚀 Advertise & Grow</span>
        <h1 style={styles.heroTitle}>Boost Your Sales with<br /><span style={styles.heroAccent}>Premium Ad Placements</span></h1>
        <p style={styles.heroDesc}>Reach millions of buyers with targeted ad campaigns. Choose from flash sales, trending placements, company banners, and more.</p>
      </div>

      {Object.entries(plans).map(([adType, config]) => {
        const Icon = TYPE_ICONS[adType] || Star;
        return (
          <div key={adType} style={styles.adTypeSection}>
            <div style={styles.adTypeHeader}>
              <div style={{ ...styles.adTypeIconBox, background: config.color + '18', color: config.color }}>
                <Icon size={22} />
              </div>
              <div>
                <h2 style={styles.adTypeName}>{config.name}</h2>
                <p style={styles.adTypeDesc}>{config.description}</p>
              </div>
            </div>

            <div style={styles.plansGrid}>
              {Object.entries(config.plans).map(([planKey, plan]) => {
                const isSelected = selected?.adType === adType && selected?.planKey === planKey;
                const isPremium = planKey === 'premium';
                return (
                  <div
                    key={planKey}
                    style={{
                      ...styles.planCard,
                      ...(isPremium ? styles.planCardPremium : {}),
                      ...(isSelected ? { ...styles.planCardSelected, borderColor: config.color, boxShadow: `0 0 0 3px ${config.color}22` } : {})
                    }}
                  >
                    {isPremium && <div style={{ ...styles.popularBadge, background: config.color }}>Most Popular</div>}
                    <div style={styles.planHeader}>
                      <span style={styles.planLabel}>{plan.label}</span>
                      <div style={styles.planPrice}>
                        <span style={styles.planCurrency}>₦</span>
                        <span style={styles.planAmount}>{plan.price.toLocaleString()}</span>
                      </div>
                      <span style={styles.planDuration}>{plan.duration} days</span>
                    </div>

                    <ul style={styles.featureList}>
                      {plan.features.map((f, i) => (
                        <li key={i} style={styles.featureItem}>
                          <span style={{ ...styles.checkIcon, color: config.color }}>
                            <Check size={13} strokeWidth={3} />
                          </span>
                          {f}
                        </li>
                      ))}
                    </ul>

                    <button
                      style={{ ...styles.selectBtn, background: isSelected ? config.color : 'transparent', color: isSelected ? '#fff' : config.color, borderColor: config.color }}
                      onClick={() => handleSelectPlan(adType, planKey)}
                      disabled={paying}
                    >
                      {isSelected ? 'Selected ✓' : 'Select Plan'}
                      {!isSelected && <ArrowRight size={14} />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {showProductSelector && selected && selected.adType !== 'company_ads' && (
        <ProductSelectorModal
          adType={selected.adType}
          planConfig={plans[selected.adType]?.plans[selected.planKey]}
          planColor={plans[selected.adType]?.color}
          onClose={() => { setShowProductSelector(false); setSelected(null); }}
          onConfirm={(data) => { setShowProductSelector(false); handleProceedToPayment(data); }}
          paying={paying}
        />
      )}

      {showCompanyAdForm && (
        <CompanyAdFormModal
          planConfig={plans['company_ads']?.plans[selected?.planKey]}
          onClose={() => { setShowCompanyAdForm(false); setSelected(null); }}
          onConfirm={(data) => { setShowCompanyAdForm(false); handleProceedToPayment(data); }}
          paying={paying}
        />
      )}
    </div>
  );
}

// ---- CompanyAdFormModal (inline) ----
function CompanyAdFormModal({ planConfig, onClose, onConfirm, paying }) {
  const [form, setForm] = useState({ title: '', description: '', imageUrl: '', ctaText: 'Shop Now', ctaLink: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div style={modalOverlay}>
      <div style={modalBox}>
        <div style={modalHeader}>
          <h3 style={modalTitle}>Company Ad Details</h3>
          <button style={closeBtn} onClick={onClose}><X size={18} /></button>
        </div>
        <div style={modalBody}>
          <p style={modalSub}>This ad will show in the sidebar (desktop) and as a popup (mobile)</p>
          {planConfig && <div style={planInfoBox}>₦{planConfig.price.toLocaleString()} · {planConfig.duration} days</div>}
          <label style={fieldLabel}>Ad Title *</label>
          <input style={fieldInput} placeholder="e.g. Grand Clearance Sale!" value={form.title} onChange={e => set('title', e.target.value)} />
          <label style={fieldLabel}>Ad Description</label>
          <textarea style={fieldTextarea} placeholder="Short compelling description..." value={form.description} onChange={e => set('description', e.target.value)} rows={3} />
          <label style={fieldLabel}>Banner Image URL (Cloudinary)</label>
          <input style={fieldInput} placeholder="https://res.cloudinary.com/..." value={form.imageUrl} onChange={e => set('imageUrl', e.target.value)} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label style={fieldLabel}>CTA Button Text</label>
              <input style={fieldInput} placeholder="Shop Now" value={form.ctaText} onChange={e => set('ctaText', e.target.value)} />
            </div>
            <div>
              <label style={fieldLabel}>CTA Link</label>
              <input style={fieldInput} placeholder="https://..." value={form.ctaLink} onChange={e => set('ctaLink', e.target.value)} />
            </div>
          </div>
        </div>
        <div style={modalFooter}>
          <button style={cancelBtnStyle} onClick={onClose}>Cancel</button>
          <button style={confirmBtnStyle} onClick={() => onConfirm({ companyAd: form })} disabled={!form.title || paying}>
            {paying ? 'Processing...' : 'Proceed to Payment →'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 1100, margin: '0 auto', padding: '1.5rem 1rem' },
  loading: { textAlign: 'center', padding: '3rem', color: '#888' },
  heroSection: { textAlign: 'center', padding: '2.5rem 1rem 2rem', marginBottom: '1rem' },
  heroTag: { display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '5px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600, marginBottom: 14 },
  heroTitle: { fontSize: 'clamp(24px, 5vw, 42px)', fontWeight: 800, color: '#0f172a', margin: '0 0 12px', lineHeight: 1.2 },
  heroAccent: { background: 'linear-gradient(135deg, #2563eb, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  heroDesc: { fontSize: 16, color: '#64748b', maxWidth: 560, margin: '0 auto' },
  adTypeSection: { marginBottom: '2.5rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9', padding: '1.5rem', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' },
  adTypeHeader: { display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: '1.25rem' },
  adTypeIconBox: { width: 48, height: 48, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  adTypeName: { margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#0f172a' },
  adTypeDesc: { margin: 0, fontSize: 13, color: '#64748b' },
  plansGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 },
  planCard: { border: '2px solid #e2e8f0', borderRadius: 14, padding: '1.25rem', position: 'relative', transition: 'all 0.2s', background: '#fff', cursor: 'pointer' },
  planCardPremium: { border: '2px solid #e2e8f0', background: 'linear-gradient(145deg, #fafbff, #f0f4ff)' },
  planCardSelected: { background: '#f8faff' },
  popularBadge: { position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20, whiteSpace: 'nowrap' },
  planHeader: { marginBottom: '1rem' },
  planLabel: { display: 'block', fontSize: 12, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  planPrice: { display: 'flex', alignItems: 'baseline', gap: 2, marginBottom: 4 },
  planCurrency: { fontSize: 16, fontWeight: 700, color: '#0f172a' },
  planAmount: { fontSize: 28, fontWeight: 800, color: '#0f172a' },
  planDuration: { fontSize: 12, color: '#64748b', display: 'block' },
  featureList: { listStyle: 'none', margin: '0 0 1rem', padding: 0 },
  featureItem: { display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#475569', marginBottom: 7 },
  checkIcon: { flexShrink: 0, marginTop: 1 },
  selectBtn: { width: '100%', padding: '9px 0', borderRadius: 8, border: '2px solid', cursor: 'pointer', fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' },
};

const modalOverlay = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' };
const modalBox = { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' };
const modalHeader = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem', borderBottom: '1px solid #f1f5f9' };
const modalTitle = { margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' };
const closeBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex' };
const modalBody = { padding: '1.25rem', overflowY: 'auto', flex: 1 };
const modalSub = { margin: '0 0 14px', fontSize: 13, color: '#64748b', background: '#f8faff', padding: '8px 12px', borderRadius: 8 };
const planInfoBox = { margin: '0 0 14px', padding: '8px 14px', background: '#ecfdf5', color: '#065f46', fontSize: 14, fontWeight: 600, borderRadius: 8 };
const fieldLabel = { display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 5, textTransform: 'uppercase', letterSpacing: 0.5 };
const fieldInput = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box', background: '#fafafa' };
const fieldTextarea = { width: '100%', padding: '10px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', fontSize: 14, outline: 'none', marginBottom: 12, boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit', background: '#fafafa' };
const modalFooter = { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '1rem 1.25rem', borderTop: '1px solid #f1f5f9' };
const cancelBtnStyle = { padding: '9px 18px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 14 };
const confirmBtnStyle = { padding: '9px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 700 };