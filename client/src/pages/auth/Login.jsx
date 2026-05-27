import { useState } from 'react';
import appConfig from '../../config/AppConfig';
import { useNavigate } from 'react-router-dom';

import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import Loading from '../../config/Loading';

export default function Login() {
  const [formData, setFormData] = useState({
    contact: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
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
        // Save token to localStorage
        localStorage.setItem('token', data.token);
        
        toast.success(`Welcome back, ${data.user.firstName}!`);
        
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        toast.error(data.message || "Invalid credentials");
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
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
              background: `linear-gradient(135deg, ${appConfig.colors.primary}, ${appConfig.colors.primaryLight})` 
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
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  placeholder="Enter your password"
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none text-lg transition"
                  value={formData.password}
                  onChange={handleChange}
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
                boxShadow: `0 10px 15px -3px ${appConfig.colors.primary}30`
              }}
            >
              {loading && <Loading overlay text="Signing in..." />}
              {!loading && 'Sign In'}
              {!loading && <ArrowRight size={22} />}
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
    </div>
  );
}