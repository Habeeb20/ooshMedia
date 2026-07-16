// components/identity-verification/VerificationHub.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileCheck2,
  Fingerprint,
  Landmark,
  IdCard,
  BookOpenCheck,
  Building2,
  ShieldCheck,
  ArrowUpRight,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

// ── Design tokens (matches the eFixit / eDrivers system) ──────────────
const TOKENS = {
  wine: '#5C1A2E',
  wineSoft: '#7A2740',
  routeEmerald: '#12B886',
  signalAmber: '#F5A623',
  coral: '#F4694F',
  mist: '#EEF2F6',
};

const CHECKS = [
  {
    type: 'nin',
    label: 'NIN',
    fullName: 'National Identity Number',
    icon: Fingerprint,
    accent: TOKENS.routeEmerald,
  },
  {
    type: 'bvn',
    label: 'BVN',
    fullName: 'Bank Verification Number',
    icon: Landmark,
    accent: TOKENS.signalAmber,
  },
  {
    type: 'votersCard',
    label: "Voter's Card",
    fullName: 'INEC Voter Registration',
    icon: IdCard,
    accent: TOKENS.coral,
  },
  {
    type: 'driverLicense',
    label: "Driver's License",
    fullName: 'FRSC Driver Record',
    icon: FileCheck2,
    accent: TOKENS.routeEmerald,
  },
  {
    type: 'passport',
    label: 'Int\u2019l Passport',
    fullName: 'NIS Passport Record',
    icon: BookOpenCheck,
    accent: TOKENS.signalAmber,
  },
  {
    type: 'cac',
    label: 'CAC',
    fullName: 'Corporate Affairs Commission',
    icon: Building2,
    accent: TOKENS.coral,
  },
];

const API_BASE = import.meta.env.VITE_BACKEND_URL

export default function VerificationHub() {
  const [status, setStatus] = useState(null);
  const [loadingType, setLoadingType] = useState(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/identity-verification/status`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          signal: controller.signal,
        });

        if (data.success) setStatus(data.identityVerification);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.code !== 'ERR_CANCELED') {
          console.error(err);
          toast.error('Could not load your verification status.');
        }
      } finally {
        setFetching(false);
      }
    })();

    return () => controller.abort();
  }, []);

  const verifiedCount = CHECKS.filter((c) => status?.[c.type]?.verified).length;

  const handleVerify = async (type) => {
    setLoadingType(type);
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/identity-verification/initiate`,
        { type },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      if (!data.success) throw new Error(data.message || 'Could not start verification.');
      window.location.href = data.redirectUrl;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Could not start verification.');
      setLoadingType(null);
    }
  };

  return (
    <div className="w-full">
      {/* Header + progress track */}
      <div
        className="rounded-2xl p-5 sm:p-6 mb-6"
        style={{ backgroundColor: TOKENS.wine }}
      >
        <div className="flex items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-white text-lg sm:text-xl font-semibold tracking-tight">
              Identity Verification
            </h2>
            <p className="text-slate-300/80 text-sm mt-0.5">
              Verify your identity to unlock full access to the platform.
            </p>
          </div>
          <div
            className="hidden sm:flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium"
            style={{ backgroundColor: TOKENS.wineSoft, color: TOKENS.routeEmerald }}
          >
            <ShieldCheck size={16} />
            {verifiedCount}/{CHECKS.length} verified
          </div>
        </div>

        {/* Road-style progress track — a nod to eDrivers/eFixit's routing theme */}
        <div className="relative h-2 rounded-full overflow-hidden" style={{ backgroundColor: TOKENS.wineSoft }}>
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: TOKENS.routeEmerald }}
            initial={{ width: 0 }}
            animate={{ width: `${(verifiedCount / CHECKS.length) * 100}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
        <div className="flex sm:hidden items-center gap-2 mt-3 text-sm font-medium" style={{ color: TOKENS.routeEmerald }}>
          <ShieldCheck size={16} />
          {verifiedCount}/{CHECKS.length} verified
        </div>
      </div>

      {/* Check cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CHECKS.map((check, i) => {
          const Icon = check.icon;
          const record = status?.[check.type];
          const isVerified = !!record?.verified;
          const isLoading = loadingType === check.type;

          return (
            <motion.div
              key={check.type}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              className="relative rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${check.accent}1A`, color: check.accent }}
                  >
                    <Icon size={20} />
                  </div>
                  <span
                    className="text-xs font-semibold px-2 py-1 rounded-full"
                    style={
                      isVerified
                        ? { backgroundColor: `${TOKENS.routeEmerald}1A`, color: TOKENS.routeEmerald }
                        : { backgroundColor: '#F1F3F5', color: '#6B7280' }
                    }
                  >
                    {isVerified ? 'Verified' : 'Not verified'}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900">{check.label}</h3>
                <p className="text-sm text-slate-500 mt-0.5">{check.fullName}</p>
                {isVerified && record?.last4 && (
                  <p className="text-xs text-slate-400 mt-2">
                    On file: •••• {record.last4}
                    {record.matchedName ? ` — ${record.matchedName}` : ''}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleVerify(check.type)}
                disabled={isVerified || isLoading || fetching}
                className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:cursor-not-allowed"
                style={
                  isVerified
                    ? { backgroundColor: '#F1F3F5', color: '#9CA3AF' }
                    : { backgroundColor: TOKENS.wine, color: 'white' }
                }
              >
                {isLoading ? (
                  <>
                    <Loader2 size={15} className="animate-spin" /> Starting...
                  </>
                ) : isVerified ? (
                  'Verified'
                ) : (
                  <>
                    Verify now <ArrowUpRight size={15} />
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}