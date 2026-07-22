// import { useState } from 'react';
// import appConfig from '../../config/AppConfig';
// import { useNavigate, useLocation } from 'react-router-dom';

// import { Eye, EyeOff, ArrowRight } from 'lucide-react';
// import { toast } from 'sonner';
// import Loading from '../../config/Loading';
// import {useAuth} from "../../context/AuthContext"
// export default function Login() {
//   const [formData, setFormData] = useState({
//     contact: '',
//     password: '',
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const location = useLocation();
//   const { login } = useAuth();

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           contact: formData.contact,
//           password: formData.password,
//         }),
//       });

//       const data = await res.json();

//       if (res.ok && data.success) {
//         // Save token to localStorage
//         localStorage.setItem('token', data.token);
        
//         toast.success(`Welcome back, ${data.user.firstName}!`);
        
//         // Redirect to dashboard
//         login(data.token, data.user);
//         localStorage.setItem('user', JSON.stringify(data.user));
//         const from = location.state?.from || '/dashboard';
//         navigate(from, { replace: true });
//       } else {
//         toast.error(data.message || "Invalid credentials");
//       }
//     } catch (err) {
//       toast.error("Network error. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
//       <div className="max-w-md w-full">
//         {/* Logo & Header */}
//         <div className="text-center mb-5">
//           <div 
//             className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
//             style={{ 
//               background: `linear-gradient(135deg, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})` 
//             }}
//           >
//             <span className="text-5xl">🎥</span>
//           </div>
//           <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
//           <p className="text-gray-600 mt-3">Sign in to continue to {appConfig.name}</p>
//         </div>

//         {/* Login Card */}
//         <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
//           <form onSubmit={handleLogin} className="space-y-6">
//             {/* Contact Input */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Email, Phone or Username
//               </label>
//               <input
//                 type="text"
//                 name="contact"
//                 required
//                 placeholder="Enter email, phone or username"
//                 className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none text-lg transition"
//                 value={formData.contact}
//                 onChange={handleChange}
//               />
//             </div>

//             {/* Password Input */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Password
//               </label>
//               <div className="relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   name="password"
//                   required
//                   placeholder="Enter your password"
//                   className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none text-lg transition"
//                   value={formData.password}
//                   onChange={handleChange}
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowPassword(!showPassword)}
//                   className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
//                 >
//                   {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
//                 </button>
//               </div>
//             </div>

//             {/* Forgot Password */}
//             <div className="text-right">
//               <button
//                 type="button"
//                 onClick={() => navigate('/forgot-password')}
//                 className="text-sm text-[#8B1E3F] hover:underline font-medium"
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             {/* Login Button */}
//             <button
//               type="submit"
//               disabled={loading}
//               className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg"
//               style={{ 
//                 backgroundColor: appConfig.colors.primary,
//                 boxShadow: `0 10px 15px -3px ${appConfig.colors.primary}30`
//               }}
//             >
//               {loading && <Loading overlay text="Signing in..." />}
//               {!loading && 'Sign In'}
//               {!loading && <ArrowRight size={22} />}
//             </button>
//           </form>

//           {/* Sign Up Link */}
//           <div className="text-center mt-8">
//             <p className="text-gray-600">
//               Don't have an account?{' '}
//               <button
//                 onClick={() => navigate('/signup')}
//                 className="font-semibold text-[#8B1E3F] hover:underline"
//               >
//                 Create Account
//               </button>
//             </p>
//           </div>
//         </div>

//         {/* Footer Text */}
//         <p className="text-center text-xs text-gray-500 mt-8">
//           © 2026 {appConfig.name}. All rights reserved.
//         </p>
//       </div>
//     </div>
//   );
// }









import { useState, useEffect } from 'react';
import appConfig from '../../config/AppConfig';
import { useNavigate, useLocation } from 'react-router-dom';

import { Eye, EyeOff, ArrowRight, Mail, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '../../config/Loading';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ── e-Auth modal state ────────────────────────────────────────
  const [showEAuthModal, setShowEAuthModal] = useState(false);
  const [eAuthStep, setEAuthStep] = useState('email'); // 'email' | 'code'
  const [eAuthEmail, setEAuthEmail] = useState('');
  const [eAuthCode, setEAuthCode] = useState('');
  const [eAuthSubmitting, setEAuthSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Countdown for "resend code"
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const completeLogin = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    login(token, user);
    toast.success(`Welcome back, ${user.firstName}!`);
    const from = location.state?.from || '/dashboard';
    navigate(from, { replace: true });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: formData.contact,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        completeLogin(data.token, data.user);
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetEAuthModal = () => {
    setShowEAuthModal(false);
    setEAuthStep('email');
    setEAuthEmail('');
    setEAuthCode('');
    setResendCooldown(0);
  };

  // ── e-Auth step 1: request the code ───────────────────────────
  const handleEAuthRequestCode = async (e) => {
    e.preventDefault();

    if (!eAuthEmail.trim()) {
      toast.error('Please enter your email');
      return;
    }

    setEAuthSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/e-auth/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: eAuthEmail.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('Check your email for the code');
        setEAuthStep('code');
        setEAuthCode('');
        setResendCooldown(30);
      } else {
        toast.error(data.message || 'Could not send code. Please try again.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setEAuthSubmitting(false);
    }
  };

  // ── e-Auth step 2: verify the code and log in ─────────────────
  const handleEAuthVerifyCode = async (e) => {
    e.preventDefault();

    if (!eAuthCode.trim() || eAuthCode.trim().length !== 4) {
      toast.error('Enter the 4-digit code');
      return;
    }

    setEAuthSubmitting(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/e-auth/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: eAuthEmail.trim(), code: eAuthCode.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        resetEAuthModal();
        completeLogin(data.token, data.user);
      } else {
        toast.error(data.message || 'Incorrect code. Please try again.');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setEAuthSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0 || eAuthSubmitting) return;

    setEAuthSubmitting(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/e-auth/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: eAuthEmail.trim() }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success('New code sent');
        setEAuthCode('');
        setResendCooldown(30);
      } else {
        toast.error(data.message || 'Could not resend code');
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setEAuthSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-5">
          <div
            className="mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-6 shadow-xl"
            style={{
              background: `linear-gradient(135deg, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})`,
            }}
          >
            <span className="text-5xl">🎥</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
          <p className="text-gray-600 mt-3">Sign in to continue to {appConfig.name}</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Contact Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email, Phone or Username
              </label>
              <input
                type="text"
                name="contact"
                required
                placeholder="Enter email, phone or username"
                className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none text-lg transition"
                value={formData.contact}
                onChange={handleChange}
                disabled={loading}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none text-lg transition"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                >
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate('/forgot-password')}
                className="text-sm text-[#8B1E3F] hover:underline font-medium"
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-2xl text-white font-semibold text-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 shadow-lg"
              style={{
                backgroundColor: appConfig.colors.primary,
                boxShadow: `0 10px 15px -3px ${appConfig.colors.primary}30`,
              }}
            >
              {loading && <Loading overlay text="Signing in..." />}
              {!loading && 'Sign In'}
              {!loading && <ArrowRight size={22} />}
            </button>

            {/* e-Auth button */}
            <button
              type="button"
              onClick={() => setShowEAuthModal(true)}
              disabled={loading}
              className="w-full py-4 rounded-2xl font-semibold text-lg border-2 flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{
                borderColor: appConfig.colors.primary,
                color: appConfig.colors.primary,
              }}
            >
              <Mail size={20} />
              Sign in with e-Auth
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/signup')}
                className="font-semibold text-[#8B1E3F] hover:underline"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-gray-500 mt-8">
          © 2026 {appConfig.name}. All rights reserved.
        </p>
      </div>

      {/* ────────────────────────────────────────────────
          E-AUTH MODAL (2-step: email → code)
      ──────────────────────────────────────────────── */}
      {showEAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
            <button
              onClick={resetEAuthModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})`,
                  }}
                >
                  <Mail className="h-7 w-7 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {eAuthStep === 'email' ? 'Sign in with e-Auth' : 'Enter your code'}
                </h2>
                <p className="mt-2 text-gray-600 text-sm">
                  {eAuthStep === 'email' ? (
                    "We'll send a 4-digit code to your email — no password needed"
                  ) : (
                    <>We sent a code to <span className="font-medium text-gray-700">{eAuthEmail}</span></>
                  )}
                </p>
              </div>

              {eAuthStep === 'email' ? (
                <form onSubmit={handleEAuthRequestCode} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your email address
                    </label>
                    <input
                      type="email"
                      value={eAuthEmail}
                      onChange={(e) => setEAuthEmail(e.target.value)}
                      autoFocus
                      placeholder="you@example.com"
                      disabled={eAuthSubmitting}
                      className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none text-lg transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={eAuthSubmitting || !eAuthEmail.trim()}
                    className="w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: appConfig.colors.primary }}
                  >
                    {eAuthSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      <>
                        Send Code
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleEAuthVerifyCode} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      4-digit code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={4}
                      value={eAuthCode}
                      onChange={(e) => setEAuthCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      autoFocus
                      placeholder="0000"
                      disabled={eAuthSubmitting}
                      className="w-full text-center text-2xl tracking-[0.5em] px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={eAuthSubmitting || eAuthCode.length !== 4}
                    className="w-full py-4 rounded-2xl text-white font-semibold text-lg flex items-center justify-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ backgroundColor: appConfig.colors.primary }}
                  >
                    {eAuthSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      <>
                        Verify & Sign In
                        <ArrowRight size={20} />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      onClick={() => setEAuthStep('email')}
                      disabled={eAuthSubmitting}
                      className="font-medium hover:underline"
                      style={{ color: appConfig.colors.primary }}
                    >
                      Use a different email
                    </button>

                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={eAuthSubmitting || resendCooldown > 0}
                      className="font-medium hover:underline disabled:text-gray-400 disabled:cursor-not-allowed disabled:no-underline"
                      style={resendCooldown > 0 ? {} : { color: appConfig.colors.primary }}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}