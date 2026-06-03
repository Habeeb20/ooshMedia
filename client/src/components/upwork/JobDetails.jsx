// // components/JobDetail.jsx
// import { Clock, Award, Calendar } from 'lucide-react';

// export default function JobDetail({ job }) {
//   return (
//     <div className="max-w-6xl mx-auto px-4 py-8">
//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//         {/* Main Content */}
//         <div className="lg:col-span-2 space-y-8">
//           <div className="bg-white rounded-3xl p-8 border">
//             <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

//             <div className="flex items-center gap-6 mt-6">
//               <div className="flex items-center gap-2 text-emerald-600 font-medium">
//                 <Award className="w-5 h-5" />
//                 {job.category}
//               </div>
//               <div className="flex items-center gap-2">
//                 <Clock className="w-5 h-5" />
//                 {job.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
//               </div>
//             </div>

//             <div className="mt-8">
//               <h2 className="font-semibold text-lg mb-3">Job Description</h2>
//               <p className="text-gray-700 leading-relaxed whitespace-pre-line">
//                 {job.description}
//               </p>
//             </div>

//             <div className="mt-8">
//               <h2 className="font-semibold text-lg mb-3">Required Skills</h2>
//               <div className="flex flex-wrap gap-2">
//                 {job.skillsRequired?.map((skill, i) => (
//                   <span
//                     key={i}
//                     className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm"
//                   >
//                     {skill}
//                   </span>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Sidebar */}
//         <div className="space-y-6">
//           <div className="bg-white border rounded-3xl p-6">
//             <div className="text-3xl font-bold text-gray-900">
//               ${job.budget}
//               {job.type === 'hourly' && <span className="text-lg font-normal">/hr</span>}
//             </div>
//             <button className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3.5 rounded-2xl transition">
//               Submit a Proposal
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







// components/JobDetail.jsx
import { Clock, Award, Calendar, MapPin, Users, Heart, Eye, Share2 } from 'lucide-react';

export default function JobDetail({ job }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-3xl p-8 border">
            <h1 className="text-3xl font-bold text-gray-900">{job.title}</h1>

            <div className="flex items-center gap-6 mt-6 text-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <Award className="w-5 h-5" />
                {job.category}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {job.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                {job.mode}
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="font-semibold text-lg mb-3">Job Description</h2>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skillsRequired?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold text-lg mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {(job.state || job.lga || job.address) && (
              <div className="mt-8">
                <h2 className="font-semibold text-lg mb-3">Location</h2>
                <p className="text-gray-700">
                  {job.address && `${job.address}, `} 
                  {job.lga && `${job.lga}, `} 
                  {job.state}
                </p>
              </div>
            )}

            {/* Job Benefits */}
            {job.jobBenefits?.length > 0 && (
              <div className="mt-8">
                <h2 className="font-semibold text-lg mb-3">Benefits</h2>
                <div className="flex flex-wrap gap-2">
                  {job.jobBenefits.map((benefit, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm">
                      {benefit.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                {job.otherBenefits && (
                  <p className="mt-3 text-gray-600">{job.otherBenefits}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing Card */}
          <div className="bg-white border rounded-3xl p-6 sticky top-6">
            <div className="text-4xl font-bold text-gray-900">
              ₦{job.budget?.toLocaleString()}
              {job.type === 'hourly' && <span className="text-base font-normal">/hr</span>}
            </div>

            <div className="mt-6 space-y-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium capitalize">{job.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="font-medium">{job.durationDays} days</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Expires</span>
                <span className="font-medium">
                  {job.expiresAt ? new Date(job.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Proposals</span>
                <span className="font-medium">{job.proposalsCount || 0}</span>
              </div>
            </div>

            <button className="w-full mt-8 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-4 rounded-2xl transition">
              Submit a Proposal
            </button>
          </div>

          {/* Stats */}
          <div className="bg-white border rounded-3xl p-6">
            <h3 className="font-semibold mb-4">Engagement</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="flex justify-center mb-1"><Heart className="w-5 h-5 text-red-500" /></div>
                <p className="font-semibold">{job.likes || 0}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div>
                <div className="flex justify-center mb-1"><Eye className="w-5 h-5 text-blue-500" /></div>
                <p className="font-semibold">{job.views || 0}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div>
                <div className="flex justify-center mb-1"><Share2 className="w-5 h-5 text-purple-500" /></div>
                <p className="font-semibold">{job.shares || 0}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}