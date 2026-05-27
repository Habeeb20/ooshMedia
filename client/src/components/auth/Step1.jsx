// import { useState } from 'react';
// import appConfig from '../../config/AppConfig';

// import { toast } from 'sonner';

// export default function Step1_ContactOTP({ formData, updateForm, nextStep }) {
//   const [loading, setLoading] = useState(false);
//   const [otpSent, setOtpSent] = useState(false);

//   const sendOTP = async () => {
//     setLoading(true);
//     try {
//       if (formData.contactType === 'email' && formData.email) {
//         // Call your backend endpoint
//         await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ email: formData.email, type: 'email' })
//         });
//         setOtpSent(true);
//         toast.success("OTP sent to your email");
//       } else if (formData.contactType === 'phone' && formData.phoneNumber) {
//         await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
//           method: 'POST',
//           body: JSON.stringify({ phone: formData.phoneNumber, type: 'phone' })
//         });
//         setOtpSent(true);
//         toast.success("OTP sent to your phone");
//       }
//     } catch (err) {
//       toast.error("Failed to send OTP");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const verifyOTP = async () => {
//     setLoading(true);
//     try {
//       // Call backend to verify
//       const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
//         method: 'POST',
//         body: JSON.stringify({
//           contact: formData.contactType === 'email' ? formData.email : formData.phoneNumber,
//           otp: formData.otp,
//           type: formData.contactType
//         })
//       });

//       if (res.ok) {
//         updateForm({ isVerified: true });
//         toast.success("Verification successful!");
//         nextStep();
//       } else {
//         toast.error("Invalid OTP");
//       }
//     } catch (err) {
//       toast.error("Verification failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div>
//       <h2 className="text-2xl font-semibold mb-6">Let's get you started</h2>

//       <div className="flex gap-4 mb-8">
//         <button
//           onClick={() => updateForm({ contactType: 'email' })}
//           className={`flex-1 py-4 rounded-2xl font-medium transition ${formData.contactType === 'email' ? 'bg-[#8B1E3F] text-white' : 'bg-gray-100'}`}
//         >
//           Email
//         </button>
//         <button
//           onClick={() => updateForm({ contactType: 'phone' })}
//           className={`flex-1 py-4 rounded-2xl font-medium transition ${formData.contactType === 'phone' ? 'bg-[#8B1E3F] text-white' : 'bg-gray-100'}`}
//         >
//           Phone Number
//         </button>
//       </div>

//       {formData.contactType === 'email' ? (
//         <input
//           type="email"
//           placeholder="Enter your email"
//           className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#8B1E3F]"
//           value={formData.email}
//           onChange={(e) => updateForm({ email: e.target.value })}
//         />
//       ) : (
//         <input
//           type="tel"
//           placeholder="Enter phone number (e.g +234...)"
//           className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#8B1E3F]"
//           value={formData.phoneNumber}
//           onChange={(e) => updateForm({ phoneNumber: e.target.value })}
//         />
//       )}

//       <button
//         onClick={sendOTP}
//         disabled={loading}
//         className="mt-4 w-full bg-[#8B1E3F] text-white py-4 rounded-2xl font-semibold hover:bg-[#A6224A]"
//       >
//         {loading ? 'Sending OTP...' : 'Send OTP'}
//       </button>

//       {otpSent && (
//         <div className="mt-6">
//           <input
//             type="text"
//             maxLength={4}
//             placeholder="Enter 4-digit OTP"
//             className="w-full px-5 py-4 text-center text-2xl tracking-widest rounded-2xl border border-gray-200"
//             value={formData.otp}
//             onChange={(e) => updateForm({ otp: e.target.value })}
//           />
//           <button
//             onClick={verifyOTP}
//             disabled={loading}
//             className="mt-4 w-full bg-black text-white py-4 rounded-2xl font-semibold"
//           >
//             Verify OTP
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }





import { useState } from 'react';
import appConfig from '../../config/appConfig';
import { toast } from 'sonner';
import { X } from 'lucide-react';

export default function Step1_ContactOTP({ formData, updateForm, nextStep }) {
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);

  const sendOTP = async () => {
    if (!formData.email && !formData.phoneNumber) {
      toast.error("Please enter your email or phone number");
      return;
    }

    setLoading(true);
    try {
      const payload = formData.contactType === 'email' 
        ? { email: formData.email, type: 'email' }
        : { phone: formData.phoneNumber, type: 'phone' };

      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setOtpSent(true);
        setShowOtpModal(true);
        toast.success(`OTP sent to your ${formData.contactType}`);
      } else {
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    if (formData.otp.length !== 4) {
      toast.error("Please enter 4-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contact: formData.contactType === 'email' ? formData.email : formData.phoneNumber,
          otp: formData.otp,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        updateForm({ isVerified: true });
        toast.success("Verification successful! 🎉");
        setShowOtpModal(false);
        nextStep();
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowOtpModal(false);
    updateForm({ otp: '' }); // Clear OTP when closing
  };

  return (
    <div>
      <h2 className="text-3xl font-semibold mb-2">Get Started</h2>
      <p className="text-gray-600 mb-8">Verify your contact to continue</p>

      {/* Toggle Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => updateForm({ contactType: 'email', otp: '' })}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all ${
            formData.contactType === 'email' 
              ? 'bg-[#8B1E3F] text-white shadow-md' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Email Address
        </button>
        <button
          onClick={() => updateForm({ contactType: 'phone', otp: '' })}
          className={`flex-1 py-4 rounded-2xl font-medium transition-all ${
            formData.contactType === 'phone' 
              ? 'bg-[#8B1E3F] text-white shadow-md' 
              : 'bg-gray-100 hover:bg-gray-200'
          }`}
        >
          Phone Number
        </button>
      </div>

      {/* Input */}
      {formData.contactType === 'email' ? (
        <input
          type="email"
          placeholder="Enter your email address"
          className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#8B1E3F] text-lg"
          value={formData.email}
          onChange={(e) => updateForm({ email: e.target.value })}
        />
      ) : (
        <input
          type="tel"
          placeholder="Enter phone number (+234...)"
          className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-[#8B1E3F] text-lg"
          value={formData.phoneNumber}
          onChange={(e) => updateForm({ phoneNumber: e.target.value })}
        />
      )}

      <button
        onClick={sendOTP}
        disabled={loading}
        className="mt-6 w-full py-4 bg-[#8B1E3F] hover:bg-[#A6224A] text-white font-semibold rounded-2xl transition-all disabled:opacity-70"
      >
        {loading ? 'Sending OTP...' : 'Send Verification Code'}
      </button>

      {/* OTP Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b">
              <div>
                <h3 className="text-2xl font-semibold">Enter OTP</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Check your {formData.contactType} for the code
                </p>
              </div>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={28} />
              </button>
            </div>

            <div className="p-8">
              <input
                type="text"
                maxLength={4}
                className="w-full text-center text-5xl font-mono tracking-[12px] py-6 rounded-2xl border border-gray-200 focus:border-[#8B1E3F] focus:outline-none"
                value={formData.otp}
                onChange={(e) => updateForm({ otp: e.target.value.replace(/\D/g, '') })}
              />

              <button
                onClick={verifyOTP}
                disabled={loading || formData.otp.length !== 4}
                className="mt-8 w-full py-4 text-white font-semibold rounded-2xl transition-all disabled:opacity-50"
                style={{ backgroundColor: appConfig.colors.primary }}
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Didn't receive code?{' '}
                <button 
                  onClick={sendOTP}
                  disabled={loading}
                  className="text-[#8B1E3F] hover:underline font-medium"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}