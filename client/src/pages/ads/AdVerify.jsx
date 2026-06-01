import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { adAPI } from '../../config/adApi';

export default function AdVerifyPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading');
  const [sub, setSub] = useState(null);

  useEffect(() => {
    const reference = params.get('reference');
    if (!reference) { setStatus('error'); return; }
    adAPI.verify(reference)
      .then(r => { setStatus('success'); setSub(r.data.data); })
      .catch(() => setStatus('error'));
  }, []);

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {status === 'loading' && (
          <>
            <Loader size={40} style={{ animation: 'spin 1s linear infinite', color: '#2563eb' }} />
            <h2 style={styles.title}>Verifying Payment...</h2>
            <p style={styles.desc}>Please wait while we confirm your payment.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={styles.successIcon}><CheckCircle size={48} color="#16a34a" /></div>
            <h2 style={{ ...styles.title, color: '#16a34a' }}>Payment Successful! 🎉</h2>
            <p style={styles.desc}>Your ad subscription is now active.</p>
            {sub && (
              <div style={styles.subInfo}>
                <div style={styles.subRow}><span>Ad Type</span><strong>{sub.adType?.replace(/_/g, ' ')}</strong></div>
                <div style={styles.subRow}><span>Plan</span><strong style={{ textTransform: 'capitalize' }}>{sub.plan}</strong></div>
                <div style={styles.subRow}><span>Duration</span><strong>{sub.duration} days</strong></div>
                <div style={styles.subRow}><span>Ends</span><strong>{new Date(sub.endDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</strong></div>
              </div>
            )}
            <button style={styles.btn} onClick={() => navigate('/dashboard/ads')}>Go to My Ads →</button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle size={48} color="#dc2626" />
            <h2 style={{ ...styles.title, color: '#dc2626' }}>Payment Failed</h2>
            <p style={styles.desc}>Your payment could not be verified. Please try again or contact support.</p>
            <button style={{ ...styles.btn, background: '#dc2626' }} onClick={() => navigate('/dashboard/ads/subscribe')}>Try Again</button>
          </>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

const styles = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card: { background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '2.5rem 2rem', maxWidth: 420, width: '100%', textAlign: 'center', boxShadow: '0 4px 24px rgba(0,0,0,0.07)' },
  successIcon: { margin: '0 auto 12px', width: 80, height: 80, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  title: { margin: '0 0 8px', fontSize: 22, fontWeight: 800, color: '#1e293b' },
  desc: { margin: '0 0 20px', fontSize: 14, color: '#64748b' },
  subInfo: { background: '#f8fafc', borderRadius: 12, padding: '1rem', marginBottom: 20, textAlign: 'left' },
  subRow: { display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#475569', padding: '5px 0', borderBottom: '1px solid #f1f5f9' },
  btn: { padding: '12px 28px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15, cursor: 'pointer' },
};