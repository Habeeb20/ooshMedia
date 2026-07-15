// src/components/dashboard/ControlRoomAccess.jsx
import { useState } from 'react';
import api from '../../config/api';
import { toast } from 'sonner';
import { KeyRound, Mail, Loader2, ShieldCheck } from 'lucide-react';
import ControlRoom from './ControlRoom';

const ControlRoomAccess = ({ isActivated }) => {
  const [activated, setActivated] = useState(isActivated);
  const [sending, setSending] = useState(false);
  const [code, setCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [controlRoomToken, setControlRoomToken] = useState(
    () => sessionStorage.getItem('controlRoomToken') || null
  );

  const handleActivate = async () => {
    setSending(true);
    try {
      const { data } = await api.post('/api/staff/activate-creator');
      if (!data.success) throw new Error(data.message);
      toast.success(data.message || 'Code sent to your email or phone number.');
      setActivated(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not activate Control Room.');
    } finally {
      setSending(false);
    }
  };

  const handleResend = async () => {
    setSending(true);
    try {
      const { data } = await api.post('/api/staff/reissue-creator-code');
      if (!data.success) throw new Error(data.message);
      toast.success(data.message || 'New code sent.');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not resend code.');
    } finally {
      setSending(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (code.length !== 4) {
      toast.error('Enter the 4-digit code from your email or sms inbox.');
      return;
    }
    setVerifying(true);
    try {
      const { data } = await api.post('/api/staff/control-room/login', { code });
      if (!data.success) throw new Error(data.message);
      sessionStorage.setItem('controlRoomToken', data.controlRoomToken);
      setControlRoomToken(data.controlRoomToken);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Incorrect code.');
    } finally {
      setVerifying(false);
    }
  };

  if (controlRoomToken) {
    return <ControlRoom token={controlRoomToken} onExit={() => {
      sessionStorage.removeItem('controlRoomToken');
      setControlRoomToken(null);
    }} />;
  }

  if (!activated) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-5">
          <ShieldCheck className="text-[#8B1E3F]" size={28} />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Activate Your Control Room</h2>
        <p className="text-sm text-gray-500 max-w-sm mb-6">
          Add staff, track their sales, and manage what they can access. We'll send a 4-digit access code to your account email or phone Number.
        </p>
        <button
          type="button"
          onClick={handleActivate}
          disabled={sending}
          className="flex items-center gap-2 px-6 py-3 bg-[#8B1E3F] text-white text-sm font-semibold rounded-xl hover:bg-[#701733] transition disabled:opacity-60"
        >
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          Send Me an Access Code
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 bg-white rounded-2xl border border-gray-100">
      <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-5">
        <KeyRound className="text-[#8B1E3F]" size={28} />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Enter Control Room Code</h2>
      <p className="text-sm text-gray-500 max-w-sm mb-6">
        Check your email for the 4-digit code and enter it below.
      </p>
      <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="••••"
          inputMode="numeric"
          className="w-40 text-center text-2xl tracking-[0.5em] font-bold border-2 border-gray-200 rounded-xl py-3 focus:outline-none focus:border-[#8B1E3F] transition"
        />
        <button
          type="submit"
          disabled={verifying}
          className="px-6 py-2.5 bg-[#8B1E3F] text-white text-sm font-semibold rounded-xl hover:bg-[#701733] transition disabled:opacity-60"
        >
          {verifying ? 'Verifying…' : 'Enter Control Room'}
        </button>
      </form>
      <button
        type="button"
        onClick={handleResend}
        disabled={sending}
        className="mt-4 text-xs font-medium text-gray-400 hover:text-gray-600 transition"
      >
        Didn't get a code? Resend
      </button>
    </div>
  );
};

export default ControlRoomAccess;