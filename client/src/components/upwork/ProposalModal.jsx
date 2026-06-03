// components/ProposalModal.jsx
import { useState, useEffect } from 'react';
import { X, FileText, ExternalLink, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function ProposalModal({ job, onClose, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Form, 2: Success
  const [myCVs, setMyCVs] = useState([]);
  const [selectedCV, setSelectedCV] = useState('');
  const [formData, setFormData] = useState({
    coverLetter: '',
    bidAmount: job.budget || '',
    estimatedDuration: '',
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const API_BASE = `${import.meta.env.VITE_BACKEND_URL}`;
  const token = localStorage.getItem('token');

  // Fetch User's CVs
  const fetchMyCVs = async () => {
    try {
      const res = await fetch(`${API_BASE}/cv/my-cvs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMyCVs(data.cvs);
        if (data.cvs.length > 0) {
          setSelectedCV(data.cvs[0]._id); // Auto-select first CV
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchMyCVs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCV) return alert("Please select a CV");

    setSubmitting(true);

    try {
      const res = await fetch(`${API_BASE}/proposals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          job: job._id,
          coverLetter: formData.coverLetter,
          bidAmount: Number(formData.bidAmount),
          estimatedDuration: formData.estimatedDuration,
          cv: selectedCV,           // Attach selected CV
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStep(2); // Show success screen
        toast.success("successfully proposed")
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || "Failed to submit proposal");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-8 py-5 border-b flex items-center justify-between bg-gray-50 rounded-t-3xl">
          <h2 className="text-2xl font-semibold">Submit a Proposal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-7 h-7" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSubmit} className="p-8 overflow-y-auto max-h-[calc(95vh-140px)]">
            <div className="space-y-8">
              {/* Job Info */}
              <div className="bg-gray-50 p-5 rounded-2xl">
                <p className="font-medium text-gray-900">{job.title}</p>
                <p className="text-emerald-600 font-medium mt-1">
                  Budget: ${job.budget} {job.type === 'hourly' && '/hr'}
                </p>
              </div>

              {/* CV Selection */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="font-semibold text-gray-800">Select CV</label>
                  <a
                    href="/dashboard?tab=cv"
                    target="_blank"
                    className="text-emerald-600 hover:text-emerald-700 text-sm flex items-center gap-1"
                  >
                    Manage CVs <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {myCVs.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {myCVs.map((cv) => (
                      <div
                        key={cv._id}
                        onClick={() => setSelectedCV(cv._id)}
                        className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-center gap-3 ${
                          selectedCV === cv._id ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <FileText className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-medium">{cv.title}</p>
                          <p className="text-sm text-gray-500">{cv.template} template</p>
                        </div>
                        {selectedCV === cv._id && <CheckCircle className="w-5 h-5 text-emerald-600 ml-auto" />}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border border-dashed rounded-2xl">
                    <p className="text-gray-500">You don't have any CV yet</p>
                    <a
                      href="/dashboard?tab=cv"
                      className="text-emerald-600 hover:underline mt-2 inline-block"
                    >
                      Create your first CV →
                    </a>
                  </div>
                )}
              </div>

              {/* Bid Amount */}
              <div>
                <label className="block font-medium mb-2">Your Bid Amount ($)</label>
                <input
                  type="number"
                  value={formData.bidAmount}
                  onChange={(e) => setFormData({ ...formData, bidAmount: e.target.value })}
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                  required
                />
              </div>

              {/* Estimated Duration */}
              <div>
                <label className="block font-medium mb-2">Estimated Duration</label>
                <input
                  type="text"
                  value={formData.estimatedDuration}
                  onChange={(e) => setFormData({ ...formData, estimatedDuration: e.target.value })}
                  placeholder="e.g., 2 weeks, 1 month"
                  className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                />
              </div>

              {/* Cover Letter */}
              <div>
                <label className="block font-medium mb-2">Cover Letter</label>
                <textarea
                  value={formData.coverLetter}
                  onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                  rows={8}
                  placeholder="Why are you the best fit for this job?..."
                  className="w-full px-5 py-4 border border-gray-300 rounded-3xl focus:border-emerald-600 outline-none resize-y"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !selectedCV}
              className="w-full mt-10 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white py-4 rounded-2xl font-semibold text-lg transition"
            >
              {submitting ? "Submitting Proposal..." : "Submit Proposal"}
            </button>
          </form>
        ) : (
          // Success Screen
          <div className="p-12 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold mt-6">Proposal Submitted!</h2>
            <p className="text-gray-600 mt-3">The client has been notified. Good luck!</p>
            <button
              onClick={onClose}
              className="mt-8 px-10 py-3 bg-gray-900 text-white rounded-2xl"
            >
              Back to Jobs
            </button>
          </div>
        )}
      </div>
    </div>
  );
}