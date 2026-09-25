import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const BRAND = '#8B1E3F';

// Small line-icon set, currentColor only — matches the icon style used elsewhere in the app
function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M5 12.5 10 17l9-10" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

function Spinner() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7 animate-spin" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.2" strokeOpacity="0.18" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

const copy = {
  verifying: {
    title: 'Confirming your payment',
    body: "This only takes a moment — don't close this page.",
  },
  success: {
    title: 'Payment confirmed',
    body: 'Your video credits have been added to your account.',
  },
  failed: {
    title: "Payment didn't go through",
    body: "We couldn't confirm this payment. If you were charged, it'll be reconciled automatically — otherwise, try again.",
  },
  missing: {
    title: 'No payment reference found',
    body: "We couldn't find a reference for this payment. Try again from your dashboard.",
  },
};

export default function PaymentVerify() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); // verifying | success | failed | missing
  const [credits, setCredits] = useState(null);
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return; // guard against double-fire in strict mode
    hasRun.current = true;

    const reference = searchParams.get('reference') || searchParams.get('trxref');
    console.log(reference)
    if (!reference) {
      setStatus('missing');
      return;
    }

    axios
      .get(`${import.meta.env.VITE_BACKEND_URL}/api/rentals/video-subscription/verify/${encodeURIComponent(reference)}`)
      .then((res) => {
        console.log(res.data)
        if (res.data?.success) {
            
          setCredits(res.data.creditsRemaining ?? null);
          setStatus('success');
        } else {
          setStatus('failed');
        }
      })
      .catch(() => setStatus('failed'));
  }, [searchParams]);

  const state = copy[status];
  const isTerminal = status === 'success' || status === 'failed' || status === 'missing';

  return (
    <div className="min-h-screen bg-[#FAF7F8] flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-[#E7DEE1] bg-white px-7 py-9 text-center shadow-sm">
          <div
            className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              backgroundColor:
                status === 'success' ? '#1E7A3F1A' : status === 'verifying' ? `${BRAND}1A` : '#B3261E1A',
              color: status === 'success' ? '#1E7A3F' : status === 'verifying' ? BRAND : '#B3261E',
            }}
          >
            {status === 'verifying' && <Spinner />}
            {status === 'success' && <CheckIcon />}
            {(status === 'failed' || status === 'missing') && <CrossIcon />}
          </div>

          <h1 className="text-lg font-semibold text-[#221B1D]">{state.title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6B6067]">{state.body}</p>

          {status === 'success' && credits !== null && (
            <p className="mt-4 text-sm font-medium text-[#221B1D]">
              Credits remaining: <span style={{ color: BRAND }}>{credits}</span>
            </p>
          )}

          {isTerminal && (
            <div className="mt-7 space-y-2">
              {status === 'success' ? (
                <button
                  type="button"
                  onClick={() => navigate('/rental/dashboard')}
                  className="w-full rounded-lg py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
                  style={{ backgroundColor: BRAND }}
                >
                  Go to dashboard
                </button>
              ) : (
                <>
                  <Link
                    to="/rental/dashboard"
                    className="block w-full rounded-lg py-3 text-sm font-medium text-white transition-colors hover:opacity-90"
                    style={{ backgroundColor: BRAND }}
                  >
                    Back to dashboard
                  </Link>
                  <p className="pt-1 text-xs text-[#B4A9AC]">Need help? Contact support with this reference: {searchParams.get('reference') || '—'}</p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}