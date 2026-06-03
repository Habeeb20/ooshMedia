// components/JobCard.jsx
import { Clock, Users } from 'lucide-react';

// Inside Job Modal or Job Card
const handleRefer = async (userId) => {
  const message = prompt("Add a short message (optional):");
  
  const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/referrals/refer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: JSON.stringify({
      jobId: job._id,
      referredToId: userId,
      message
    }),
  });

  const data = await res.json();
  if (data.success) {
    toast.success(data.message);
  } else {
    toast.error(data.message);
  }
};

export default function JobCard({ job, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 hover:border-emerald-600 rounded-2xl p-6 cursor-pointer transition-all hover:shadow-lg"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-900 line-clamp-2 pr-4">
          {job.title}
        </h3>
        <span className="text-sm font-medium text-emerald-600 whitespace-nowrap">
          ${job.budget} {job.type === 'hourly' && '/hr'}
        </span>
      </div>

      <p className="text-gray-600 mt-3 line-clamp-3 text-[15px]">
        {job.description}
      </p>

      <div className="flex flex-wrap gap-2 mt-4">
        {job.skillsRequired?.slice(0, 5).map((skill, i) => (
          <span
            key={i}
            className="bg-gray-100 text-gray-700 text-xs px-3 py-1 rounded-full"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-6 text-sm text-gray-500">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4" />
            <span>{job.proposalsCount} proposals</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>{new Date(job.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <span className="text-emerald-600 font-medium hover:text-emerald-700">
          View Details →
        </span>
      </div>
    </div>
  );
}