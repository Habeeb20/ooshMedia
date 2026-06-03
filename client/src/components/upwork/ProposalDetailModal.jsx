// components/ProposalDetailModal.jsx
import { X, Calendar, Clock, Award } from 'lucide-react';
import StarRating from '../../pages/Dashboard/StarRating';


export default function ProposalDetailModal({ proposal, onClose, onEndContract }) {
  const isCompleted = proposal.status === 'completed';

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-2xl font-bold">{proposal.job?.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={28} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto max-h-[70vh]">
          {/* Status */}
          <div className={`inline-flex px-5 py-2 rounded-2xl text-sm font-medium mb-6 ${proposal.status === 'accepted' ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {proposal.status.toUpperCase()}
          </div>

          <div className="space-y-8">
            <div>
              <p className="text-gray-500">Your Bid</p>
              <p className="text-3xl font-bold text-emerald-600">₦{proposal.bidAmount}</p>
            </div>

            <div>
              <p className="text-gray-500 mb-2">Cover Letter</p>
              <p className="text-gray-700 leading-relaxed">{proposal.coverLetter}</p>
            </div>

            {isCompleted && (
              <div className="pt-6 border-t">
                <h3 className="font-semibold mb-4">Rate This Contract</h3>
                <StarRating 
                  onRate={(rating, review) => {
                    // Call rate endpoint based on who is rating
                    console.log("Rating submitted:", rating, review);
                  }} 
                />
              </div>
            )}
          </div>
        </div>

        <div className="p-6 border-t flex gap-4">
          <button onClick={onClose} className="flex-1 py-4 border rounded-2xl font-medium">Close</button>
          {isCompleted && (
            <button 
              onClick={() => onEndContract(proposal._id)}
              className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-medium"
            >
              End Contract
            </button>
          )}
        </div>
      </div>
    </div>
  );
}