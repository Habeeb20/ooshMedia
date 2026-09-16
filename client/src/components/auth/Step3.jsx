// import { useState } from 'react';
// import appConfig from '../../config/AppConfig';
// import CloudinaryUpload from '../../config/CloudinaryUpload';
// import Loading from '../../config/Loading';
// import axios from "axios"
// import { toast } from 'sonner';
// import { User, Camera, Calendar } from 'lucide-react';
// import { Eye, EyeOff } from "lucide-react";
// export default function Step3_AdditionalInfo({ formData, updateForm, prevStep }) {
//   const [loading, setLoading] = useState(false);
// const [showPassword, setShowPassword] = useState(false);
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//  try {
//   const response = await axios.post(
//     `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
//     formData,
//     { headers: { 'Content-Type': 'application/json' } }
//   );

//   const data = response.data;

//   if (data.success === true) {
//     localStorage.setItem('token', data.token);
//     toast.success("Account created successfully! Welcome to Estores");
//     window.location.href = '/dashboard';
//   } else {
//     toast.error(data.message || "An error occurred");
//   }
// } catch (err) {
//   toast.error(err.response?.data?.message || "Network error. Please check your connection.");
// } finally {
//   setLoading(false);
// }
//   };

//   return (
//     <div className="relative">
//       {loading && <Loading overlay text="Creating your account..." size="lg" />}

//       <h2 className="text-3xl font-semibold mb-2">Final Details</h2>
//       <p className="text-gray-600 mb-8">Almost done! Let's finish setting up your profile</p>

//       <form onSubmit={handleSubmit} className="space-y-8">
//         {/* Date of Birth */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
//           <input
//             type="date"
//             required
//             className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//             value={formData.dateOfBirth}
//             onChange={(e) => updateForm({ dateOfBirth: e.target.value })}
//           />
//         </div>

//         {/* Role Selection */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-3">Account Type</label>
//           <div className="grid grid-cols-2 gap-4">
//             <button
//               type="button"
//               onClick={() => updateForm({ role: 'user' })}
//               className={`p-6 rounded-3xl border-2 transition-all ${formData.role === 'user' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-gray-200'}`}
//             >
//               <User className="w-9 h-9 mb-3 mx-auto" style={{ color: formData.role === 'user' ? appConfig.colors.primary : '#6b7280' }} />
//               <p className="font-semibold">Individual User</p>
//             </button>

//             <button
//               type="button"
//               onClick={() => updateForm({ role: 'entity' })}
//               className={`p-6 rounded-3xl border-2 transition-all ${formData.role === 'entity' ? 'border-[#8B1E3F] bg-[#8B1E3F]/5' : 'border-gray-200'}`}
//             >
//               <Camera className="w-9 h-9 mb-3 mx-auto" style={{ color: formData.role === 'entity' ? appConfig.colors.primary : '#6b7280' }} />
//               <p className="font-semibold">Business / Entity</p>
//             </button>
//           </div>
//         </div>

//         {/* Profile Picture */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-3">Profile Picture</label>
//           <CloudinaryUpload
//             onUploadComplete={(url) => updateForm({ profilePicture: url })}
//             folder="profiles"
//             accept="image/*"
//             label="Upload Profile Photo"
//           />
//         </div>

//         {/* Password */}
//      <div>
//   <label className="block text-sm font-medium text-gray-700 mb-2">Create Password</label>
//   <div className="relative">
//     <input
//       type={showPassword ? "text" : "password"}
//       required
//       minLength={8}
//       className="w-full px-5 py-4 pr-14 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
//       placeholder="Minimum 8 characters"
//       value={formData.password}
//       onChange={(e) => updateForm({ password: e.target.value })}
//     />
//     <button
//       type="button"
//       onClick={() => setShowPassword((v) => !v)}
//       className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
//       aria-label={showPassword ? "Hide password" : "Show password"}
//       tabIndex={-1}
//     >
//       {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//     </button>
//   </div>
// </div>

//         <div className="flex gap-4 pt-6">
//           <button
//             type="button"
//             onClick={prevStep}
//             className="flex-1 py-4 border border-gray-300 rounded-2xl font-semibold hover:bg-gray-50"
//             disabled={loading}
//           >
//             Back
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="flex-1 py-4 text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-70"
//             style={{ backgroundColor: appConfig.colors.primary }}
//           >
//             {loading ? 'Creating Account...' : 'Create My Account'}
//           </button>
//         </div>
//       </form>
//     </div>
//   );



// }












import { useState } from 'react';
import appConfig from '../../config/AppConfig';
import CloudinaryUpload from '../../config/CloudinaryUpload';
import Loading from '../../config/Loading';
import axios from "axios"
import { toast } from 'sonner';
import { User, Camera, Calendar, Check, X } from 'lucide-react';
import { Eye, EyeOff } from "lucide-react";

const PASSWORD_RULES = [
  { key: 'length', label: 'At least 8 characters', test: (pw) => pw.length >= 8 },
  { key: 'uppercase', label: 'One uppercase letter', test: (pw) => /[A-Z]/.test(pw) },
  { key: 'lowercase', label: 'One lowercase letter', test: (pw) => /[a-z]/.test(pw) },
  { key: 'digit', label: 'One number', test: (pw) => /\d/.test(pw) },
  { key: 'special', label: 'One special character', test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]/\\;'`~]/.test(pw) },
];

function getPasswordStrength(password) {
  const passed = PASSWORD_RULES.filter((rule) => rule.test(password)).length;
  if (password.length === 0) return { label: '', color: '', percent: 0 };
  if (passed <= 2) return { label: 'Weak', color: '#EF4444', percent: 33 };
  if (passed <= 4) return { label: 'Medium', color: '#F59E0B', percent: 66 };
  return { label: 'Strong', color: '#10B981', percent: 100 };
}

export default function Step3_AdditionalInfo({ formData, updateForm, prevStep }) {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const password = formData.password || '';
  const strength = getPasswordStrength(password);
  const allRulesPassed = PASSWORD_RULES.every((rule) => rule.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!allRulesPassed) {
      setPasswordTouched(true);
      toast.error("Please meet all password requirements");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
        formData,
        { headers: { 'Content-Type': 'application/json' } }
      );

      const data = response.data;

      if (data.success === true) {
        localStorage.setItem('token', data.token);
        toast.success("Account created successfully! Welcome to Estores");
        window.location.href = '/dashboard';
      } else {
        toast.error(data.message || "An error occurred");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Network error. Please check your connection.");
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
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              minLength={8}
              className="w-full px-5 py-4 pr-14 rounded-2xl border border-gray-200 focus:border-[#8B1E3F]"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => updateForm({ password: e.target.value })}
              onBlur={() => setPasswordTouched(true)}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Strength meter */}
          {password.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: `${strength.percent}%`, backgroundColor: strength.color }}
                  />
                </div>
                <span className="text-xs font-semibold" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            </div>
          )}

          {/* Rule checklist */}
          {(passwordTouched || password.length > 0) && (
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.test(password);
                return (
                  <li key={rule.key} className="flex items-center gap-1.5 text-xs">
                    {passed ? (
                      <Check size={14} className="text-emerald-500 shrink-0" />
                    ) : (
                      <X size={14} className="text-gray-300 shrink-0" />
                    )}
                    <span className={passed ? 'text-gray-700' : 'text-gray-400'}>
                      {rule.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
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
            disabled={loading || !allRulesPassed}
            className="flex-1 py-4 text-white font-semibold rounded-2xl transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: appConfig.colors.primary }}
          >
            {loading ? 'Creating Account...' : 'Create My Account'}
          </button>
        </div>
      </form>
    </div>
  );
}