// components/ProposalCard.jsx
import { Calendar, Clock, Award, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function ProposalCard({ proposal, onViewDetails }) {
  const { job, status, bidAmount, estimatedDuration, coverLetter, createdAt } = proposal;

  const getStatusConfig = (status) => {
    switch (status) {
      case 'accepted':
        return {
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: CheckCircle,
          label: 'Accepted'
        };
      case 'rejected':
        return {
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: XCircle,
          label: 'Rejected'
        };
      case 'shortlisted':
        return {
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Award,
          label: 'Shortlisted'
        };
      default:
        return {
          color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: AlertTriangle,
          label: 'Pending'
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white border border-gray-200 hover:border-emerald-300 rounded-3xl p-7 transition-all hover:shadow-lg group">
      {/* Job Title & Budget */}
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
            {job?.title}
          </h3>
          <p className="text-emerald-600 font-medium mt-1">
            Your Bid: <span className="font-semibold">${bidAmount}</span>
            {job?.type === 'hourly' && '/hr'}
          </p>
        </div>

        {/* Status Badge */}
        <div className={`px-5 py-2 rounded-2xl text-sm font-medium flex items-center gap-2 border ${statusConfig.color}`}>
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </div>
      </div>

      {/* Meta Info */}
      <div className="flex items-center gap-6 mt-5 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          <span>Submitted {new Date(createdAt).toLocaleDateString()}</span>
        </div>
        {estimatedDuration && (
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{estimatedDuration}</span>
          </div>
        )}
        <div className="flex items-center gap-1.5">
          <Award className="w-4 h-4" />
          <span>{job?.category}</span>
        </div>
      </div>

      {/* Cover Letter Preview */}
      <div className="mt-6">
        <p className="text-gray-600 text-[15px] line-clamp-3 leading-relaxed">
          {coverLetter}
        </p>
      </div>

      {/* Skills */}
      {job?.skillsRequired && job.skillsRequired.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-6">
          {job.skillsRequired.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="bg-gray-100 text-gray-700 text-xs px-4 py-1.5 rounded-full"
            >
              {skill}
            </span>
          ))}
        </div>
      )}

      {/* Action Button */}
      <div className="mt-8 flex gap-3">
        <button
          onClick={() => onViewDetails(proposal)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-3.5 rounded-2xl font-medium transition-all active:scale-95"
        >
          View Proposal Details
        </button>

        {status === 'accepted' && (
          <button className="flex-1 border border-emerald-600 text-emerald-700 py-3.5 rounded-2xl font-medium hover:bg-emerald-50 transition">
            View Contract
          </button>
        )}
      </div>
    </div>
  );
}