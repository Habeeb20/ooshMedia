// // components/SendEmailModal.jsx
// import { useState } from 'react';
// import { X, Send, Mail } from 'lucide-react';
// import { toast } from 'sonner';

// export default function SendEmailModal({ job, onClose }) {
//   const [subject, setSubject] = useState('');
//   const [message, setMessage] = useState('');
//   const [sending, setSending] = useState(false);

//   const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;

//   const handleSendEmail = async (e) => {
//     e.preventDefault();

//     if (!subject.trim() || !message.trim()) {
//       toast.error("Please fill in both subject and message");
//       return;
//     }

//     setSending(true);

//     try {
//       const res = await fetch(`${API_BASE}/jobs/${job._id}/send-email`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${localStorage.getItem('token')}`,
//         },
//         body: JSON.stringify({
//           subject: subject.trim(),
//           message: message.trim(),
//         }),
//       });

//       const data = await res.json();

//       if (data.success) {
//         toast.success("Email sent successfully to the client!");
//         onClose();
//       } else {
//         toast.error(data.message || "Failed to send email");
//       }
//     } catch (error) {
//       console.error(error);
//       toast.error("Something went wrong. Please try again.");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
//       <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl">
//         {/* Header */}
//         <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50">
//           <div className="flex items-center gap-3">
//             <Mail className="text-emerald-600" size={24} />
//             <div>
//               <h2 className="font-semibold text-lg">Send Direct Email</h2>
//               <p className="text-sm text-gray-500">To: {job.client?.firstName} {job.client?.lastName}</p>
//             </div>
//           </div>
//           <button
//             onClick={onClose}
//             className="text-gray-400 hover:text-gray-600 transition"
//           >
//             <X size={24} />
//           </button>
//         </div>

//         {/* Form */}
//         <form onSubmit={handleSendEmail} className="p-6 space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Subject
//             </label>
//             <input
//               type="text"
//               value={subject}
//               onChange={(e) => setSubject(e.target.value)}
//               placeholder="Application for your job opening"
//               className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
//               required
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Message
//             </label>
//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               rows={8}
//               placeholder="Hi, I'm very interested in your job posting..."
//               className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-y min-h-[180px]"
//               required
//             />
//           </div>

//           <div className="flex gap-4 pt-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition"
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               disabled={sending || !subject.trim() || !message.trim()}
//               className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
//             >
//               {sending ? (
//                 <>
//                   <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
//                   Sending...
//                 </>
//               ) : (
//                 <>
//                   <Send size={20} />
//                   Send Email
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }













// components/SendEmailModal.jsx
import { useState, useEffect } from 'react';
import { X, Send, Mail, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';

export default function SendEmailModal({ job, onClose }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [showTips, setShowTips] = useState(false);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;

  // Prefill with professional cover letter
  useEffect(() => {
    if (job) {
      setSubject(`Application for ${job.title}`);

      const coverLetterTemplate = `Dear ${job.client.businessProfile.businessName || job.client?.firstName || 'Hiring Manager'},

I am writing to express my strong interest in the ${job.title} position.

With solid experience in ${job.category || 'this field'}, I am confident I can deliver excellent results for your project. I have successfully handled similar jobs involving ${job.skillsRequired ? job.skillsRequired.slice(0, 4).join(', ') : 'the required skills'}.

I am very reliable, pay attention to details, and always strive to exceed client expectations. I would love the opportunity to discuss how I can help bring your project to success.

Thank you for your consideration. I look forward to hearing from you.

Best regards,
[Your Full Name]`;

      setMessage(coverLetterTemplate);
    }
  }, [job]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("Please fill in both subject and message");
      return;
    }

    setSending(true);

    try {
      const res = await fetch(`${API_BASE}/jobs/${job._id}/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ subject: subject.trim(), message: message.trim() }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Email sent successfully!");
        onClose();
      } else {
        toast.error(data.message || "Failed to send email");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Fixed Header */}
        <div className="px-6 py-5 border-b flex items-center justify-between bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <Mail className="text-emerald-600" size={24} />
            <div>
              <h2 className="font-semibold text-lg">Send Direct Email</h2>
              <p className="text-sm text-gray-500">
                To: {job.client.businessProfile.businessName || `${job.client?.firstName} ${job.client?.lastName}`}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <form id="email-form" onSubmit={handleSendEmail} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message / Cover Letter</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-3xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none resize-y min-h-[180px]"
                required
              />
            </div>

            {/* Tips Section */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                type="button"
                onClick={() => setShowTips(!showTips)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-gray-50 transition text-left"
              >
                <div className="flex items-center gap-3">
                  <Lightbulb className="text-amber-500" size={22} />
                  <span className="font-medium text-gray-700">Tips for a Stronger Application</span>
                </div>
                <span className="text-xl text-gray-400">{showTips ? '−' : '+'}</span>
              </button>

              {showTips && (
                <div className="px-5 pb-5 text-sm text-gray-600 bg-gray-50">
                  <ul className="list-disc pl-5 space-y-2">
                    <li><strong>Personalize it</strong> — Reference the job title or specific requirements.</li>
                    <li><strong>Highlight relevant experience</strong> — Mention similar past work.</li>
                    <li><strong>Show value</strong> — Explain how you’ll help them.</li>
                    <li><strong>Keep it concise</strong> — Ideal length is 150–300 words.</li>
                    <li><strong>Proofread carefully</strong> before sending.</li>
                  </ul>
                </div>
              )}
            </div>
          </form>
        </div>

        {/* Fixed Footer Buttons */}
        <div className="border-t p-6 bg-white shrink-0">
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </button>

            <button
              type="submit"
              form="email-form"
              disabled={sending || !subject.trim() || !message.trim()}
              className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-2xl font-semibold flex items-center justify-center gap-2 transition"
            >
              {sending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={20} />
                  Send Email
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}