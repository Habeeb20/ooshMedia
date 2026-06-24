



import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import {
  Wallet, Eye, EyeOff, ArrowUpRight, ArrowDownLeft,
  Send, Download, CreditCard, Building2, RefreshCw,
  ChevronRight, ChevronLeft, X, Loader2, CheckCircle2,
  AlertCircle, Copy, Search, Phone, Zap, ShieldCheck,
} from 'lucide-react';

const API      = import.meta.env.VITE_BACKEND_URL;
const WALLET2   = 'https://api-ewallet.eroot.ng/api';
const WALLET = `${import.meta.env.VITE_BACKEND_URL}/api/wallet`
const token = localStorage.getItem('token')
const getToken = () => localStorage.getItem('token');
const authHdr  = () => ({ Authorization: `Bearer ${token}` });

/* ─── tiny helpers ─── */
const fmt   = (n) => `₦${Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 })}`;
const refId = () => `TXN-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

/* ══════════════════════════════════════════════════════════════════
   SUB-PANELS
   ══════════════════════════════════════════════════════════════════ */

/* ─── Send Money ──────────────────────────────────────────────── */
function SendMoney({ onBack, onDone, userEmail }) {
  const [banks, setBanks]       = useState([]);
  const [step, setStep]         = useState(1); // 1=form 2=confirm 3=success
  const [form, setForm]         = useState({ bankCode:'', accountNumber:'', amount:'', narration:'' });
  const [resolvedName, setName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending]     = useState(false);
  const [err, setErr]             = useState('');

  useEffect(() => {
    axios.get(`${WALLET}/banks`)
    // axios.get(`${WALLET}/fetch/bank/provider/public`)
      .then(r => setBanks(r.data?.data || r.data?.banks || []))
      .catch(() => {});
  }, []);

  const verifyAccount = async () => {
    if (!form.bankCode || form.accountNumber.length < 10) return;
    setVerifying(true); setName(''); setErr('');
    try {
      const r = await axios.post(`${WALLET}/verify-account`, {
        account_number: form.accountNumber,
        bank_code: form.bankCode,
      });
      setName(r.data?.data?.account_name || r.data?.account_name || '');
    } catch { setErr('Could not verify account. Check details.'); }
    finally { setVerifying(false); }
  };

  useEffect(() => {
    if (form.accountNumber.length === 10 && form.bankCode) verifyAccount();
  }, [form.accountNumber, form.bankCode]);

  const handleSend = async () => {
    setSending(true); setErr('');
    try {
      const bankLabel = banks.find(b => b.code === form.bankCode)?.name || '';
      // 1. Create recipient
      const recRes = await axios.post(`${WALLET}/create-receipient`, {
        email: userEmail,
        account_number: form.accountNumber,
        bank_code: form.bankCode,
        name: resolvedName,
      });
      const recipientCode = recRes.data?.data?.recipient_code || recRes.data?.recipient_code;

      // 2. Transfer
      const ref = refId();
      await axios.post(`${WALLET}/transfer`, {
        email: userEmail,
        amount: Number(form.amount) * 100,
        recipient: recipientCode,
        reason: form.narration || 'Transfer',
        reference: ref,
      });

      // 3. Save to local DB
      await axios.post(`${API}/api/wallet/record`, {
        type: 'transfer', direction: 'debit',
        amount: Number(form.amount),
        recipient: { accountNumber: form.accountNumber, accountName: resolvedName, bankName: bankLabel, bankCode: form.bankCode },
        narration: form.narration || 'Transfer',
        reference: ref,
        status: 'success',
      }, { headers: authHdr() });

      setStep(3);
    } catch (e) {
      setErr(e.response?.data?.message || 'Transfer failed. Try again.');
      await axios.post(`${API}/api/wallet/record`, {
        type:'transfer', direction:'debit', amount: Number(form.amount),
        status:'failed', failReason: e.response?.data?.message || 'Unknown',
        recipient:{ accountNumber: form.accountNumber, accountName: resolvedName },
      }, { headers: authHdr() }).catch(()=>{});
    } finally { setSending(false); }
  };

  if (step === 3) return (
    <PanelShell onBack={onBack} title="Transfer Sent">
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={42} className="text-emerald-500" />
        </div>
        <p className="text-xl font-bold text-gray-800">Transfer Successful!</p>
        <p className="text-gray-500 text-sm">{fmt(form.amount)} sent to {resolvedName}</p>
        <button onClick={onDone} className="mt-6 w-full py-4 bg-rose-900 text-white rounded-2xl font-semibold">Done</button>
      </div>
    </PanelShell>
  );

  return (
    <PanelShell onBack={onBack} title="Send Money">
      <div className="space-y-4">
        {/* Bank select */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Bank</label>
          <select
            value={form.bankCode}
            onChange={e => setForm(f=>({...f, bankCode:e.target.value}))}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-rose-900 focus:ring-2 focus:ring-rose-900/10"
          >
            <option value="">Select bank…</option>
            {banks.map(b => <option key={b.code||b.id} value={b.code}>{b.name}</option>)}
          </select>
        </div>

        {/* Account number */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Account Number</label>
          <div className="relative">
            <input
              maxLength={10}
              value={form.accountNumber}
              onChange={e => setForm(f=>({...f, accountNumber: e.target.value.replace(/\D/,'')}))}
              placeholder="10-digit account number"
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-rose-900 focus:ring-2 focus:ring-rose-900/10"
            />
            {verifying && <Loader2 className="absolute right-4 top-3.5 animate-spin text-gray-400" size={18}/>}
          </div>
          {resolvedName && (
            <div className="mt-2 flex items-center gap-2 text-emerald-600 text-sm font-semibold">
              <CheckCircle2 size={14}/> {resolvedName}
            </div>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Amount (₦)</label>
          <input
            type="number" min="1"
            value={form.amount}
            onChange={e => setForm(f=>({...f, amount:e.target.value}))}
            placeholder="0.00"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-rose-900 focus:ring-2 focus:ring-rose-900/10"
          />
        </div>

        {/* Narration */}
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Narration (optional)</label>
          <input
            value={form.narration}
            onChange={e => setForm(f=>({...f, narration:e.target.value}))}
            placeholder="What's this for?"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-rose-900 focus:ring-2 focus:ring-rose-900/10"
          />
        </div>

        {err && <ErrorBox msg={err}/>}

        <button
          onClick={handleSend}
          disabled={sending || !resolvedName || !form.amount}
          className="w-full py-4 bg-rose-900 hover:bg-rose-800 text-white rounded-2xl font-bold text-base transition disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
        >
          {sending ? <><Loader2 size={18} className="animate-spin"/>Sending…</> : <>Send {form.amount ? fmt(form.amount) : 'Money'}</>}
        </button>
      </div>
    </PanelShell>
  );
}

/* ─── Withdraw ────────────────────────────────────────────────── */
function Withdraw({ onBack, onDone, userEmail, walletData }) {
  const [form, setForm]   = useState({ amount:'', narration:'Withdrawal' });
  const [loading, setLoading] = useState(false);
  const [done, setDone]   = useState(false);
  const [err, setErr]     = useState('');

  const handleWithdraw = async () => {
    setLoading(true); setErr('');
    try {
      const ref = refId();
      // Transfer to user's own registered bank account
      const recRes = await axios.post(`${WALLET}/create-receipient`, {
        email: userEmail,
        account_number: walletData.accountNumber,
        bank_code: walletData.bankCode || '',
        name: walletData.accountName || '',
      });
      const recipientCode = recRes.data?.data?.recipient_code || recRes.data?.recipient_code;

      await axios.post(`${WALLET}/transfer`, {
        email: userEmail,
        amount: Number(form.amount) * 100,
        recipient: recipientCode,
        reason: form.narration,
        reference: ref,
      });

      await axios.post(`${API}/api/wallet/record`, {
        type:'withdrawal', direction:'debit', amount: Number(form.amount),
        narration: form.narration, reference: ref, status:'success',
      }, { headers: authHdr() });

      setDone(true);
    } catch (e) {
      setErr(e.response?.data?.message || 'Withdrawal failed.');
    } finally { setLoading(false); }
  };

  if (done) return (
    <PanelShell onBack={onBack} title="Withdrawal">
      <div className="flex flex-col items-center py-10 gap-4">
        <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={42} className="text-emerald-500"/>
        </div>
        <p className="text-xl font-bold text-gray-800">Withdrawal Successful!</p>
        <p className="text-gray-500 text-sm">{fmt(form.amount)} will arrive in your account shortly</p>
        <button onClick={onDone} className="mt-6 w-full py-4 bg-rose-900 text-white rounded-2xl font-semibold">Done</button>
      </div>
    </PanelShell>
  );

  return (
    <PanelShell onBack={onBack} title="Withdraw Funds">
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 mb-5">
        <p className="text-xs text-rose-700 font-semibold mb-1">Withdrawing to</p>
        <p className="font-bold text-gray-800">{walletData?.accountName || 'Your account'}</p>
        <p className="text-sm text-gray-500">{walletData?.accountNumber} · {walletData?.bankName}</p>
      </div>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 block">Amount (₦)</label>
          <input
            type="number" min="1"
            value={form.amount}
            onChange={e => setForm(f=>({...f, amount:e.target.value}))}
            placeholder="0.00"
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-rose-900 focus:ring-2 focus:ring-rose-900/10"
          />
        </div>
        {err && <ErrorBox msg={err}/>}
        <button
          onClick={handleWithdraw}
          disabled={loading || !form.amount}
          className="w-full py-4 bg-rose-900 hover:bg-rose-800 text-white rounded-2xl font-bold text-base transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <><Loader2 size={18} className="animate-spin"/>Processing…</> : <>Withdraw {form.amount ? fmt(form.amount) : ''}</>}
        </button>
      </div>
    </PanelShell>
  );
}

/* ─── Receive ─────────────────────────────────────────────────── */
function Receive({ onBack, walletData }) {
  const [copied, setCopied] = useState(false);
  const copy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PanelShell onBack={onBack} title="Receive Money">
      <div className="flex flex-col items-center py-6 gap-6">
        {/* QR-style account card */}
        <div className="w-full bg-gradient-to-br from-rose-900 via-rose-800 to-red-900 rounded-3xl p-7 text-white shadow-2xl">
          <p className="text-rose-300 text-xs font-semibold tracking-widest uppercase mb-6">Your Account Details</p>
          <p className="text-4xl font-black tracking-widest mb-1">{walletData?.accountNumber || '—'}</p>
          <p className="text-rose-200 text-sm mb-6">{walletData?.bankName || 'Wema Bank'}</p>
          <div className="border-t border-rose-700 pt-4">
            <p className="text-xl font-bold">{walletData?.accountName || '—'}</p>
          </div>
        </div>

        <button
          onClick={() => copy(walletData?.accountNumber || '')}
          className="w-full py-4 border-2 border-rose-900 text-rose-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-50 transition"
        >
          {copied ? <CheckCircle2 size={18}/> : <Copy size={18}/>}
          {copied ? 'Copied!' : 'Copy Account Number'}
        </button>

        <p className="text-gray-400 text-xs text-center max-w-xs">
          Share these details with anyone sending you money. Transfers arrive instantly.
        </p>
      </div>
    </PanelShell>
  );
}

/* ─── Transaction History ─────────────────────────────────────── */
function History({ onBack, userEmail }) {
  const [txns, setTxns]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState('api'); // 'api' | 'local'

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Try external API first
        const r = await axios.post(`${WALLET}/transfer-history`, { email: userEmail });
        setTxns(r.data?.data || r.data?.transfers || []);
        setSource('api');
      } catch {
        // Fall back to local DB
        try {
          const r2 = await axios.get(`${API}/api/wallet/history`, { headers: authHdr() });
          setTxns(r2.data?.data || []);
          setSource('local');
        } catch { setTxns([]); }
      } finally { setLoading(false); }
    };
    fetchHistory();
  }, [userEmail]);

  const iconFor = (tx) => {
    const dir = tx.direction || (tx.type === 'credit' ? 'credit' : 'debit');
    return dir === 'credit'
      ? <ArrowDownLeft size={16} className="text-emerald-500"/>
      : <ArrowUpRight  size={16} className="text-rose-600"/>;
  };

  return (
    <PanelShell onBack={onBack} title="Transaction History">
      {source === 'local' && (
        <div className="mb-4 flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <AlertCircle size={14} className="text-amber-500 flex-shrink-0"/>
          <p className="text-amber-700 text-xs">Showing saved records (API unavailable)</p>
        </div>
      )}
      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="animate-spin text-rose-900" size={28}/></div>
      ) : txns.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <ArrowDownLeft size={36} className="mx-auto mb-2 opacity-30"/>
          <p className="text-sm">No transactions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {txns.map((tx, i) => {
            const dir = tx.direction || (Number(tx.amount) > 0 ? 'credit' : 'debit');
            const amt = Math.abs(tx.amount || tx.amount_in_kobo / 100 || 0);
            return (
              <div key={tx.id || tx._id || i} className="flex items-center gap-4 bg-gray-50 rounded-2xl px-4 py-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dir==='credit' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                  {iconFor(tx)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{tx.narration || tx.reason || tx.description || 'Transaction'}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString('en-NG', { day:'numeric', month:'short', year:'numeric'}) : tx.date || ''}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className={`font-bold text-sm ${dir==='credit' ? 'text-emerald-600' : 'text-rose-700'}`}>
                    {dir==='credit' ? '+' : '-'}{fmt(amt)}
                  </p>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                    tx.status==='success' ? 'bg-emerald-100 text-emerald-600' :
                    tx.status==='failed'  ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-500'
                  }`}>{tx.status || 'success'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PanelShell>
  );
}

/* ─── Shared shell for sub-panels ────────────────────────────── */
function PanelShell({ title, onBack, children }) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="sticky top-0 bg-white z-10 flex items-center gap-3 px-6 pt-6 pb-4 border-b border-gray-100">
          <button onClick={onBack} className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition flex-shrink-0">
            <ChevronLeft size={18} className="text-gray-600"/>
          </button>
          <h2 className="font-bold text-gray-900 text-base">{title}</h2>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
      <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5"/>
      <p className="text-red-600 text-sm">{msg}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   WALLET SETUP SCREEN
   ══════════════════════════════════════════════════════════════════ */
function WalletSetup({ user, onCreate }) {
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await axios.post(`${API}/api/auth/create`, {}, { headers: authHdr() });
      toast.success('🎉 Wallet created successfully!');
      onCreate();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to create wallet');
    } finally { setCreating(false); }
  };

  const perks = [
    { icon: ShieldCheck, label: 'Bank-grade security',  sub: 'Powered by Paystack & Wema Bank' },
    { icon: Zap,         label: 'Instant transfers',     sub: 'Send & receive money in seconds' },
    { icon: Building2,   label: 'Dedicated account',     sub: 'Your own personal account number' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-950 via-rose-900 to-red-900 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo mark */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-white/10 border border-white/20 rounded-3xl flex items-center justify-center backdrop-blur-sm">
            <Wallet size={38} className="text-white"/>
          </div>
        </div>

        <h1 className="text-3xl font-black text-white text-center mb-2">Open Your Wallet</h1>
        <p className="text-rose-200 text-center text-sm mb-8 max-w-xs mx-auto">
          Get a free Wema Bank account number tied to your profile — no paperwork required.
        </p>

        {/* Perks */}
        <div className="space-y-3 mb-8">
          {perks.map(p => (
            <div key={p.label} className="flex items-center gap-4 bg-white/8 border border-white/10 rounded-2xl px-5 py-4 backdrop-blur-sm">
              <div className="w-10 h-10 bg-rose-800 rounded-xl flex items-center justify-center flex-shrink-0">
                <p.icon size={18} className="text-rose-200"/>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{p.label}</p>
                <p className="text-rose-300 text-xs">{p.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* User preview */}
        {user && (
          <div className="bg-white/8 border border-white/10 rounded-2xl px-5 py-4 mb-6 backdrop-blur-sm">
            <p className="text-rose-300 text-xs mb-1">Creating wallet for</p>
            <p className="text-white font-bold text-lg">{user.firstName} {user.lastName}</p>
            <p className="text-rose-200 text-sm">{user.email}</p>
          </div>
        )}

        <button
          onClick={handleCreate}
          disabled={creating}
          className="w-full py-5 bg-white text-rose-900 rounded-2xl font-black text-base hover:bg-rose-50 transition-all disabled:opacity-70 flex items-center justify-center gap-3 shadow-xl shadow-black/20"
        >
          {creating
            ? <><Loader2 size={20} className="animate-spin text-rose-900"/>Creating Wallet…</>
            : <><Wallet size={20}/>Create Free Wallet</>}
        </button>

        <p className="text-rose-400 text-xs text-center mt-5">
          By continuing you agree to our Terms of Service & Privacy Policy
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   MAIN WALLET DASHBOARD
   ══════════════════════════════════════════════════════════════════ */
function WalletDashboard({ user, walletData, onRefresh }) {
  const [showBal, setShowBal]   = useState(true);
  const [balance, setBalance]   = useState(null);
  const [balLoading, setBal]    = useState(false);
  const [panel, setPanel]       = useState(null); // 'send'|'withdraw'|'receive'|'history'
  const [recentTxns, setRecent] = useState([]);

  const userEmail = user?.email || '';

  // Fetch live balance
  const fetchBalance = useCallback(async () => {
    if (!userEmail) return;
    setBal(true);
    try {
      const r = await axios.get(`${WALLET}/balance`, { headers: {Authorization: `Bearer ${token}`} },{ email: userEmail },    );
      setBalance(r.data?.data?.balance ?? r.data?.balance ?? null);
    } catch(error) { console.log(error.response.data) }
    finally { setBal(false); }
  }, [userEmail]);

  // Fetch recent transactions (local DB)
  const fetchRecent = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/api/wallet/history?limit=5`, { headers: authHdr() });
      setRecent(r.data?.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchBalance();
    fetchRecent();
  }, [fetchBalance, fetchRecent]);

  const quickActions = [
    { id:'send',     icon: Send,        label:'Send',     color:'bg-rose-900',   text:'text-white' },
    { id:'receive',  icon: Download,    label:'Receive',  color:'bg-rose-100',   text:'text-rose-900' },
    { id:'withdraw', icon: CreditCard,  label:'Withdraw', color:'bg-gray-900',   text:'text-white' },
    { id:'history',  icon: RefreshCw,   label:'History',  color:'bg-gray-100',   text:'text-gray-700' },
  ];

  const closePanel = () => { setPanel(null); fetchBalance(); fetchRecent(); };

  const txnDir = (tx) => tx.direction || (tx.type === 'credit' ? 'credit' : 'debit');

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top hero card ── */}
      <div className="bg-gradient-to-br from-rose-950 via-rose-900 to-red-800 px-6 pt-12 pb-28 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/5 rounded-full"/>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full"/>

        <div className="relative z-10 max-w-md mx-auto">
          {/* User greeting */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              {user?.profilePicture
                ? <img src={user.profilePicture} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-rose-700"/>
                : <div className="w-10 h-10 rounded-full bg-rose-800 border-2 border-rose-700 flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </div>}
              <div>
                <p className="text-rose-300 text-xs">Good day 👋</p>
                <p className="text-white font-bold text-sm">{user?.firstName} {user?.lastName}</p>
              </div>
            </div>
            <button onClick={fetchBalance} disabled={balLoading} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
              <RefreshCw size={15} className={`text-white ${balLoading ? 'animate-spin' : ''}`}/>
            </button>
          </div>

          {/* Balance */}
          <div>
            <p className="text-rose-300 text-xs tracking-widest uppercase mb-1">Available Balance</p>
            <div className="flex items-center gap-3 mb-1">
              <p className="text-5xl font-black text-white tracking-tight">
                {showBal
                  ? balLoading ? '…' : fmt(balance ?? walletData?.balance ?? 0)
                  : '₦ ••••••'}
              </p>
              <button onClick={() => setShowBal(v=>!v)} className="text-rose-300 hover:text-white transition">
                {showBal ? <EyeOff size={22}/> : <Eye size={22}/>}
              </button>
            </div>
            <p className="text-rose-300 text-xs">{walletData?.bankName || 'Wema Bank'} · {walletData?.accountNumber}</p>
          </div>
        </div>
      </div>

      {/* ── Floating card (pulls up over hero) ── */}
      <div className="max-w-200 mx-auto px-4 -mt-16 relative z-10 space-y-4">

        {/* Account details pill */}
        <div className="bg-white rounded-3xl shadow-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Account Details</p>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-semibold">● Active</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Account Name',   value: walletData?.accountName   || user?.firstName + ' ' + user?.lastName },
              { label:'Account Number', value: walletData?.accountNumber || '—' },
              { label:'Bank',           value: walletData?.bankName       || 'Wema Bank' },
              { label:'Currency',       value: walletData?.currency       || 'NGN' },
            ].map(item => (
              <div key={item.label} className="bg-gray-50 rounded-2xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{item.label}</p>
                <p className="text-sm font-bold text-gray-800 truncate">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-3xl shadow-xl p-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-4">Quick Actions</p>
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map(a => (
              <button
                key={a.id}
                onClick={() => setPanel(a.id)}
                className="flex flex-col items-center gap-2 group"
              >
                <div className={`w-13 h-13 w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                  <a.icon size={20} className={a.text}/>
                </div>
                <span className="text-xs font-semibold text-gray-600">{a.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        <div className="bg-white rounded-3xl shadow-xl p-5 pb-8">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Recent Transactions</p>
            <button onClick={() => setPanel('history')} className="text-xs text-rose-900 font-semibold">See all</button>
          </div>

          {recentTxns.length === 0 ? (
            <div className="text-center py-8 text-gray-300">
              <RefreshCw size={28} className="mx-auto mb-2 opacity-40"/>
              <p className="text-sm">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTxns.map((tx, i) => {
                const dir = txnDir(tx);
                const amt = Math.abs(tx.amount || 0);
                return (
                  <div key={tx._id || i} className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${dir==='credit' ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                      {dir==='credit'
                        ? <ArrowDownLeft size={16} className="text-emerald-600"/>
                        : <ArrowUpRight  size={16} className="text-rose-700"/>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{tx.narration || tx.type}</p>
                      <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString('en-NG', { day:'numeric', month:'short'})}</p>
                    </div>
                    <p className={`text-sm font-bold flex-shrink-0 ${dir==='credit' ? 'text-emerald-600' : 'text-rose-700'}`}>
                      {dir==='credit' ? '+' : '-'}{fmt(amt)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Sub-panel modals ── */}
      {panel === 'send'     && <SendMoney   onBack={closePanel} onDone={closePanel} userEmail={userEmail}/>}
      {panel === 'receive'  && <Receive     onBack={closePanel} walletData={walletData}/>}
      {panel === 'withdraw' && <Withdraw    onBack={closePanel} onDone={closePanel} userEmail={userEmail} walletData={walletData}/>}
      {panel === 'history'  && <History     onBack={closePanel} userEmail={userEmail}/>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════
   ROOT EXPORT
   ══════════════════════════════════════════════════════════════════ */
export default function WalletManager() {
  const [user,       setUser]   = useState(null);
  const [isWallet,   setIsWallet] = useState(false);
  const [walletData, setWallet] = useState(null);
  const [loading,    setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const r = await axios.get(`${API}/api/auth/status`, { headers: {Authorization: `Bearer ${token}`}});
      setUser(r.data.user);
      console.log(r.data)
      setIsWallet(r.data.isWallet);
      setWallet(r.data.wallet || r.data.user?.walletAccount);
    } catch { toast.error('Failed to load wallet'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Loader2 className="animate-spin text-rose-900" size={36}/>
    </div>
  );

  if (!isWallet || !walletData) return <WalletSetup user={user} onCreate={load}/>;

  return <WalletDashboard user={user} walletData={walletData} onRefresh={load}/>;
}

























