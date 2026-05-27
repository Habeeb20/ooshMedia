import { useState } from 'react';
import appConfig from '../../config/AppConfig';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import Loading from '../../config/Loading';

import { toast } from 'sonner';
import { User, Camera, Calendar } from 'lucide-react';

export default function Step3_AdditionalInfo({ formData, updateForm, prevStep }) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('token', data.token);
        toast.success("Account created successfully! Welcome to MediaPulse");
        window.location.href = '/dashboard';
      } else {
        toast.error("Signup failed. Please try again.");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && <Loading overlay text="Creating your account..." size="lg" />}

      <h2 className="text-3xl font-semibold mb-2">Final Details</h2>
      <p className="text-gray-600 mb-8">Almost done! Let's finish setting up your profile</p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Date of Birth */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
          <input
            type="date"
            required
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
            value={formData.dateOfBirth}
            onChange={(e) => updateForm({ dateOfBirth: e.target.value })}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateForm({ role: 'user' })}
              className={`p-6 rounded-3xl border-2 transition-all ${formData.role === 'user' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-gray-200'}`}
            >
              <User className="w-9 h-9 mb-3 mx-auto" style={{ color: formData.role === 'user' ? appConfig.colors.primary : '#6b7280' }} />
              <p className="font-semibold">Individual User</p>
            </button>

            <button
              type="button"
              onClick={() => updateForm({ role: 'entity' })}
              className={`p-6 rounded-3xl border-2 transition-all ${formData.role === 'entity' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-gray-200'}`}
            >
              <Camera className="w-9 h-9 mb-3 mx-auto" style={{ color: formData.role === 'entity' ? appConfig.colors.primary : '#6b7280' }} />
              <p className="font-semibold">Business / Entity</p>
            </button>
          </div>
        </div>

        {/* Profile Picture */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
          <CloudinaryUpload
            onUploadComplete={(url) => updateForm({ profilePicture: url })}
            folder="profiles"
            accept="image/*"
            label="Upload Profile Photo"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
          <input
            type="password"
            required
            minLength={8}
            className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={(e) => updateForm({ password: e.target.value })}
          />
        </div>

        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={prevStep}
            className="flex-1 py-4 border border-gray-300 rounded-2xl font-semibold hover:bg-gray-50"
            disabled={loading}
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 py-4 text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-70"
            style={{ backgroundColor: appConfig.colors.primary }}
          >
            {loading ? 'Creating Account...' : 'Create My Account'}
          </button>
        </div>
      </form>
    </div>
  );



}











