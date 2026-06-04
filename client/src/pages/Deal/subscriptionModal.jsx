import { useState, useEffect } from 'react';
import { X, Zap, Shield, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { subscriptionAPI } from '../../config/api';
import './Modal.css';

const PAYSTACK_PK = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY ;

export default function SubscriptionModal({ onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Load Paystack inline JS
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, []);

  const handlePay = async () => {
    setLoading(true);
    setError('');
    try {
      // Initiate via backend to get reference
      const data = await subscriptionAPI.initiate();
      const { reference, access_code } = data.data;

      // Pop Paystack modal
      const PaystackPop = window.PaystackPop;
      const handler = PaystackPop.setup({
        key: PAYSTACK_PK,
        email: getCurrentUserEmail(),
        amount: 1000000, // ₦10,000 in kobo
        ref: reference,
        currency: 'NGN',
        channels: ['card', 'bank', 'ussd', 'mobile_money'],
        metadata: { custom_fields: [{ display_name: 'Package', value: '10 Message Points' }] },
        callback: async (response) => {
          try {
            await subscriptionAPI.verify(response.reference);
            onSuccess();
          } catch {
            setError('Payment verification failed. Contact support.');
          }
        },
        onClose: () => { setLoading(false); },
      });
      handler.openIframe();
    } catch (err) {
      setError(err.message || 'Payment initiation failed.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box modal-small sub-modal">
        <button className="modal-close" onClick={onClose}><X size={20} /></button>

        <div className="sub-icon-wrap">
          <div className="sub-icon"><Zap size={28} /></div>
        </div>

        <h2 className="sub-title">Unlock Direct Messaging</h2>
        <p className="sub-sub">Connect directly with deal owners</p>

        <div className="sub-card">
          <div className="sub-card-header">
            <span className="sub-plan">Messaging Bundle</span>
            <span className="sub-price">₦10,000</span>
          </div>
          <ul className="sub-features">
            <li><CheckCircle size={14} /><span>10 message connection points</span></li>
            <li><CheckCircle size={14} /><span>Each connection = 1 point</span></li>
            <li><CheckCircle size={14} /><span>Unlimited messages per connection</span></li>
            <li><CheckCircle size={14} /><span>Renew anytime</span></li>
          </ul>
        </div>

        <div className="sub-trust">
          <Shield size={14} />
          <span>Secured by Paystack · SSL Encrypted</span>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="btn-pay" onClick={handlePay} disabled={loading}>
          {loading ? <Loader2 size={16} className="spin" /> : <CreditCard size={16} />}
          {loading ? 'Processing...' : 'Pay ₦10,000 — Get 10 Points'}
        </button>

        <button className="btn-ghost center" onClick={onClose}>Maybe later</button>
      </div>
    </div>
  );
}

function getCurrentUserEmail() {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user.email || 'user@example.com';
  } catch { return 'user@example.com'; }
}