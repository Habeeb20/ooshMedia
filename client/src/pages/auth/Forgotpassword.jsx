import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Mail, Phone, ShieldCheck, Lock, ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const RESEND_COOLDOWN = 30; // seconds

/**
 * ForgotPasswordFlow
 * Step 1: Enter email or phone
 * Step 2: Enter 4-digit OTP
 * Step 3: Set new password
 *
 * Usage: <ForgotPasswordFlow onComplete={() => navigate('/login')} />
 */
export default function ForgotPasswordFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [contactType, setContactType] = useState('email'); // 'email' | 'phone'
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const isEmail = contactType === 'email';

  // ---------- Step 1: Request OTP ----------
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!contact.trim()) {
      toast.error(`Enter your ${isEmail ? 'email address' : 'phone number'}`);
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, {
        contact: contact.trim(),
        type: contactType,
      });
      toast.success(`OTP sent to your ${isEmail ? 'email' : 'phone'}`);
      setCooldown(RESEND_COOLDOWN);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;
    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/forgot-password`, {
        contact: contact.trim(),
        type: contactType,
      });
      toast.success('OTP resent');
      setCooldown(RESEND_COOLDOWN);
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // ---------- Step 2: OTP input handling ----------
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otp];
    next[index] = value.slice(-1);
    setOtp(next);
    if (value && index < 3) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);
    if (!pasted) return;
    e.preventDefault();
    setOtp(pasted.split('').concat(['', '', '', '']).slice(0, 4));
    otpRefs.current[Math.min(pasted.length, 3)]?.focus();
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 4) {
      toast.error('Enter the 4-digit code');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/verify-reset-otp`, {
        contact: contact.trim(),
        otp: code,
      });
      setStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
      setOtp(['', '', '', '']);
      otpRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ---------- Step 3: Reset password ----------
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BACKEND_URL}/api/auth/reset-password`, {
        contact: contact.trim(),
        otp: otp.join(''),
        newPassword,
      });
      toast.success('Password reset successful');
      onComplete ? onComplete() : setStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
      // Send them back to re-enter the OTP if it was wrong/expired
      setStep(2);
      setOtp(['', '', '', '']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Progress indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[#8B1E3F]' : 'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleRequestOtp} className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Forgot your password?</h2>
            <p className="text-sm text-gray-500 mt-1">
              Enter the email or phone number linked to your account and we'll send you a code.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl w-fit">
            <button
              type="button"
              onClick={() => { setContactType('email'); setContact(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                isEmail ? 'bg-white text-[#8B1E3F] shadow-sm' : 'text-gray-500'
              }`}
            >
              <Mail size={16} /> Email
            </button>
            <button
              type="button"
              onClick={() => { setContactType('phone'); setContact(''); }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                !isEmail ? 'bg-white text-[#8B1E3F] shadow-sm' : 'text-gray-500'
              }`}
            >
              <Phone size={16} /> Phone
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {isEmail ? 'Email Address' : 'Phone Number'}
            </label>
            <input
              type={isEmail ? 'email' : 'tel'}
              required
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder={isEmail ? 'example@gmail.com' : '+234 801 234 5678'}
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#8B1E3F] text-white py-4 rounded-2xl font-medium hover:bg-[#701731] disabled:opacity-60 transition-colors"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? 'Sending code...' : 'Send code'}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-6">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Enter the code</h2>
            <p className="text-sm text-gray-500 mt-1">
              We sent a 4-digit code to your {isEmail ? 'email' : 'phone'}
              {contact ? <span className="font-medium text-gray-700"> ({contact})</span> : null}.
            </p>
          </div>

          <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => (otpRefs.current[i] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(i, e)}
                className="w-14 h-16 text-center text-2xl font-semibold rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] outline-none transition-colors"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#8B1E3F] text-white py-4 rounded-2xl font-medium hover:bg-[#701731] disabled:opacity-60 transition-colors"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
            {loading ? 'Verifying...' : 'Verify code'}
          </button>

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={cooldown > 0 || loading}
            className="w-full text-sm text-center text-gray-500 disabled:opacity-50"
          >
            {cooldown > 0 ? `Resend code in ${cooldown}s` : "Didn't get it? Resend code"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-6">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft size={16} /> Back
          </button>

          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Set a new password</h2>
            <p className="text-sm text-gray-500 mt-1">Choose a strong password you haven't used before.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-5 py-4 pr-12 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your new password"
              className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:ring-1 focus:ring-[#8B1E3F] outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#8B1E3F] text-white py-4 rounded-2xl font-medium hover:bg-[#701731] disabled:opacity-60 transition-colors"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            <Lock size={18} />
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
      )}
    </div>
  );
}