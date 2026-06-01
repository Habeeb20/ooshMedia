import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, TrendingUp, Eye, MousePointer, Clock, CheckCircle, XCircle, AlertCircle, Plus, BarChart2 } from 'lucide-react';
import { adAPI } from '../../config/adApi';


const STATUS_STYLE = {
  active:    { color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
  pending:   { color: '#92400e', bg: '#fef3c7', icon: Clock },
  expired:   { color: '#6b7280', bg: '#f3f4f6', icon: XCircle },
  cancelled: { color: '#dc2626', bg: '#fee2e2', icon: AlertCircle },
};

export default function MySubscriptionsPage() {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([adAPI.getMySubscriptions(), adAPI.getStats()])
      .then(([subsRes, statsRes]) => {
        setSubs(subsRes.data.data);
        setStats(statsRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this subscription?')) return;
    try {
      await adAPI.cancel(id);
      setSubs(prev => prev.map(s => s._id === id ? { ...s, status: 'cancelled' } : s));
    } catch (e) {
      alert(e.response?.data?.message || 'Cancel failed');
    }
  };

  const filtered = filter === 'all' ? subs : subs.filter(s => s.status === filter);

  const getDaysLeft = (endDate) => {
    if (!endDate) return 0;
    return Math.max(0, Math.ceil((new Date(endDate) - new Date()) / 86400000));
  };

  return (
    <div style={styles.page}>
      <div style={styles.topBar}>
        <div>
          <h1 style={styles.pageTitle}>My Ad Subscriptions</h1>
          <p style={styles.pageSub}>Track and manage your advertising campaigns</p>
        </div>
        <button style={styles.newAdBtn} onClick={() => navigate('/dashboard/ads/subscribe')}>
          <Plus size={16} /> New Ad
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div style={styles.statsGrid}>
          {[
            { label: 'Active Ads', value: stats.active, icon: CheckCircle, color: '#16a34a', bg: '#dcfce7' },
            { label: 'Total Spent', value: `₦${stats.totalSpent.toLocaleString()}`, icon: BarChart2, color: '#2563eb', bg: '#dbeafe' },
            { label: 'Impressions', value: stats.totalImpressions.toLocaleString(), icon: Eye, color: '#7c3aed', bg: '#ede9fe' },
            { label: 'Clicks', value: stats.totalClicks.toLocaleString(), icon: MousePointer, color: '#f59e0b', bg: '#fef3c7' },
          ].map((s, i) => (
            <div key={i} style={styles.statCard}>
              <div style={{ ...styles.statIcon, background: s.bg, color: s.color }}>
                <s.icon size={18} />
              </div>
              <div>
                <p style={styles.statValue}>{s.value}</p>
                <p style={styles.statLabel}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={styles.filterRow}>
        {['all', 'active', 'pending', 'expired', 'cancelled'].map(f => (
          <button
            key={f}
            style={{ ...styles.filterTab, ...(filter === f ? styles.filterTabActive : {}) }}
            onClick={() => setFilter(f)}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f !== 'all' && subs.filter(s => s.status === f).length > 0 && (
              <span style={styles.filterCount}>{subs.filter(s => s.status === f).length}</span>
            )}
          </button>
        ))}
      </div>

      {loading && <div style={styles.loading}>Loading subscriptions...</div>}

      {!loading && filtered.length === 0 && (
        <div style={styles.empty}>
          <TrendingUp size={40} color="#cbd5e1" />
          <h3 style={styles.emptyTitle}>No subscriptions yet</h3>
          <p style={styles.emptySub}>Start advertising to boost your sales</p>
          <button style={styles.emptyBtn} onClick={() => navigate('/dashboard/ads/subscribe')}>
            Browse Ad Plans
          </button>
        </div>
      )}

      <div style={styles.subsList}>
        {filtered.map(sub => {
          const cfg = STATUS_STYLE[sub.status] || STATUS_STYLE.pending;
          const StatusIcon = cfg.icon;
          const daysLeft = getDaysLeft(sub.endDate);
          const isActive = sub.status === 'active';
          const progress = isActive
            ? Math.max(0, Math.min(100, (daysLeft / sub.duration) * 100))
            : 0;

          return (
            <div key={sub._id} style={styles.subCard}>
              <div style={styles.subHeader}>
                <div style={styles.subTitleRow}>
                  <span style={styles.adTypeLabel}>
                    {sub.adType?.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                  </span>
                  <span style={{ ...styles.statusBadge, background: cfg.bg, color: cfg.color }}>
                    <StatusIcon size={11} />
                    {sub.status.charAt(0).toUpperCase() + sub.status.slice(1)}
                  </span>
                </div>
                <div style={styles.planTag}>
                  {sub.plan?.charAt(0).toUpperCase() + sub.plan?.slice(1)} Plan · ₦{sub.amount?.toLocaleString()}
                </div>
              </div>

              {/* Duration progress */}
              {isActive && (
                <div style={styles.progressSection}>
                  <div style={styles.progressHeader}>
                    <span style={styles.progressLabel}>
                      <Clock size={12} /> {daysLeft} days remaining
                    </span>
                    <span style={styles.progressLabel}>{sub.duration} days total</span>
                  </div>
                  <div style={styles.progressBar}>
                    <div style={{ ...styles.progressFill, width: `${progress}%` }} />
                  </div>
                </div>
              )}

              {/* Dates */}
              <div style={styles.datesRow}>
                {sub.startDate && (
                  <span style={styles.dateItem}>
                    <Calendar size={12} />
                    Started: {new Date(sub.startDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
                {sub.endDate && (
                  <span style={styles.dateItem}>
                    <Calendar size={12} />
                    Ends: {new Date(sub.endDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* Analytics */}
              {(sub.impressions > 0 || sub.clicks > 0) && (
                <div style={styles.analyticsRow}>
                  <div style={styles.analyticItem}>
                    <Eye size={13} color="#7c3aed" />
                    <span style={styles.analyticVal}>{sub.impressions.toLocaleString()}</span>
                    <span style={styles.analyticLabel}>Impressions</span>
                  </div>
                  <div style={styles.analyticItem}>
                    <MousePointer size={13} color="#2563eb" />
                    <span style={styles.analyticVal}>{sub.clicks.toLocaleString()}</span>
                    <span style={styles.analyticLabel}>Clicks</span>
                  </div>
                  <div style={styles.analyticItem}>
                    <TrendingUp size={13} color="#16a34a" />
                    <span style={styles.analyticVal}>
                      {sub.impressions > 0 ? ((sub.clicks / sub.impressions) * 100).toFixed(1) : 0}%
                    </span>
                    <span style={styles.analyticLabel}>CTR</span>
                  </div>
                </div>
              )}

              {/* Products */}
              {sub.products?.length > 0 && (
                <div style={styles.productsRow}>
                  {sub.products.slice(0, 4).map((p, i) => (
                    <div key={i} style={styles.productThumb}>
                      {p.images?.[0]?.url
                        ? <img src={p.images[0].url} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
                        : <span style={styles.productThumbEmpty} />
                      }
                    </div>
                  ))}
                  {sub.products.length > 4 && (
                    <div style={styles.productThumbMore}>+{sub.products.length - 4}</div>
                  )}
                </div>
              )}

              {/* Actions */}
              {sub.status === 'active' && (
                <div style={styles.subActions}>
                  <button style={styles.cancelBtn} onClick={() => handleCancel(sub._id)}>Cancel</button>
                  <button style={styles.renewBtn} onClick={() => navigate('/dashboard/ads/subscribe')}>
                    Renew / Upgrade
                  </button>
                </div>
              )}
              {sub.status === 'expired' && (
                <div style={styles.subActions}>
                  <button style={styles.renewBtn} onClick={() => navigate('/dashboard/ads/subscribe')}>
                    Renew Ad
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  page: { maxWidth: 900, margin: '0 auto', padding: '1.5rem 1rem' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: 12 },
  pageTitle: { margin: '0 0 4px', fontSize: 22, fontWeight: 800, color: '#0f172a' },
  pageSub: { margin: 0, fontSize: 14, color: '#64748b' },
  newAdBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: '1.5rem' },
  statCard: { background: '#fff', border: '1px solid #f1f5f9', borderRadius: 12, padding: '1rem', display: 'flex', alignItems: 'center', gap: 12 },
  statIcon: { width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { margin: '0 0 2px', fontWeight: 800, fontSize: 18, color: '#0f172a' },
  statLabel: { margin: 0, fontSize: 12, color: '#94a3b8' },
  filterRow: { display: 'flex', gap: 6, marginBottom: '1.25rem', overflowX: 'auto', paddingBottom: 4 },
  filterTab: { display: 'flex', alignItems: 'center', gap: 5, padding: '6px 14px', borderRadius: 20, border: '1.5px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#64748b', whiteSpace: 'nowrap', flexShrink: 0 },
  filterTabActive: { background: '#eff6ff', borderColor: '#2563eb', color: '#2563eb', fontWeight: 700 },
  filterCount: { background: '#2563eb', color: '#fff', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 10 },
  loading: { textAlign: 'center', padding: '2rem', color: '#94a3b8' },
  empty: { textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 16, border: '1px solid #f1f5f9' },
  emptyTitle: { margin: '12px 0 6px', fontSize: 18, fontWeight: 700, color: '#334155' },
  emptySub: { margin: '0 0 16px', color: '#94a3b8', fontSize: 14 },
  emptyBtn: { padding: '10px 22px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' },
  subsList: { display: 'flex', flexDirection: 'column', gap: 14 },
  subCard: { background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' },
  subHeader: { marginBottom: 12 },
  subTitleRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, flexWrap: 'wrap', gap: 8 },
  adTypeLabel: { fontWeight: 700, fontSize: 15, color: '#0f172a' },
  statusBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600 },
  planTag: { fontSize: 13, color: '#64748b' },
  progressSection: { marginBottom: 10 },
  progressHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 5 },
  progressLabel: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#64748b' },
  progressBar: { height: 6, background: '#f1f5f9', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', background: 'linear-gradient(90deg, #2563eb, #7c3aed)', borderRadius: 4, transition: 'width 0.5s' },
  datesRow: { display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 10 },
  dateItem: { display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#64748b' },
  analyticsRow: { display: 'flex', gap: 16, marginBottom: 12, background: '#f8fafc', borderRadius: 8, padding: '8px 12px', flexWrap: 'wrap' },
  analyticItem: { display: 'flex', alignItems: 'center', gap: 5 },
  analyticVal: { fontWeight: 700, fontSize: 14, color: '#1e293b' },
  analyticLabel: { fontSize: 11, color: '#94a3b8' },
  productsRow: { display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' },
  productThumb: { width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', overflow: 'hidden', border: '1px solid #e2e8f0' },
  productThumbEmpty: { display: 'block', width: '100%', height: '100%', background: '#f1f5f9' },
  productThumbMore: { width: 40, height: 40, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b' },
  subActions: { display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' },
  cancelBtn: { padding: '7px 16px', borderRadius: 8, border: '1.5px solid #fca5a5', background: '#fff', color: '#dc2626', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  renewBtn: { padding: '7px 16px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
};