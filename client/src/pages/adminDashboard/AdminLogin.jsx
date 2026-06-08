// src/pages/admin/AdminLogin.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:1010'; // fallback if env var missing

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();           // Prevent page refresh
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/admin/login`, {
        email,
        password,
      });

      const { token } = response.data;

      // Store admin token separately from regular user token
      localStorage.setItem('adminToken', token);

      // Clean redirect using react-router
      navigate('/admin/dashboard');

      // Optional: clear form after success
      setEmail('');
      setPassword('');
    } catch (err) {
      // Handle different kinds of errors gracefully
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Login failed. Please check your credentials and try again.';
      setError(errorMessage);
      console.error('Admin login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-rose-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-600 to-rose-800 p-8 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
          <p className="text-rose-200 opacity-90">Sign in to manage the system</p>
        </div>

        {/* Form */}
        <div className="p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                className="
                  w-full px-4 py-3 rounded-xl border border-gray-300
                  focus:border-rose-500 focus:ring-2 focus:ring-rose-200
                  outline-none transition-all
                "
                placeholder="admin@example.com"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="
                  w-full px-4 py-3 rounded-xl border border-gray-300 pr-12
                  focus:border-rose-500 focus:ring-2 focus:ring-rose-200
                  outline-none transition-all
                "
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[42px] text-gray-500 hover:text-rose-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
                w-full py-3.5 mt-2 bg-rose-600 hover:bg-rose-700
                text-white font-medium rounded-xl transition-all
                disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
              "
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <div className="text-center text-sm text-gray-500 mt-6">
              <a
                href="#"
                className="text-rose-600 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  // TODO: implement forgot password flow if needed
                  alert('Forgot password feature coming soon');
                }}
              >
                Forgot password?
              </a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}