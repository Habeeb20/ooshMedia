


// components/JobModal.jsx
import { useState } from 'react';
import { X, Clock, Award, Bookmark, BookmarkCheck, Mail, MessageSquare, MapPin, Calendar, Heart, Eye, Share2 } from 'lucide-react';
import ProposalModal from './ProposalModal';
import SendEmailModal from './SendEmail';
import MessageModal from './MessageModal';
import { Briefcase } from 'lucide-react';
import { useUserLocation } from '../../location/UserLocation';
import {  getDistanceKm } from '../../location/UserLocation';
import { useJobDistance } from '../../location/UseJobDistance';
import JobLocationMap from '../../location/JobLocationMap';
export default function JobModal({ 
  job, 
  onClose, 
  isSaved, 
  onToggleSave,
  user   
}) {
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const hasEmployerAccess = user?.employerAccess?.isActive === true;
 
// ← ADD THESE TWO LINES
const { location: userLocation } = useUserLocation();
const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, job.lga, job.state);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
          
          {/* Header */}
          <div className="px-8 py-6 border-b flex items-center justify-between bg-gray-50 rounded-t-3xl">
            <h2 className="text-2xl font-bold text-gray-900 pr-6 line-clamp-2">{job.title}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 transition">
              <X className="w-7 h-7" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-10">
            
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                <Award className="w-5 h-5" />
                {job.category}
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {job.type === 'fixed' ? 'Fixed Price' : 'Hourly'}
              </div>
              <div className="flex items-center gap-2 bg-green-200 text-black font-bold p-2 rounded-md">
                <MapPin className="w-5 h-5" />
                {job.mode}
              </div>
              {job.plan && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  {job.plan} Plan • {job.durationDays} days
                </div>
              )}
            </div>

            {/* Budget */}
            <div className="text-4xl font-bold text-emerald-600">
              ₦{job.budget?.toLocaleString()}
              {job.type === 'hourly' && <span className="text-lg font-normal">/hr</span>}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-4">Job Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {/* Skills */}
            {job.skillsRequired?.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Required Skills</h3>
                <div className="flex flex-wrap gap-3">
                  {job.skillsRequired.map((skill, i) => (
                    <span
                      key={i}
                      className="bg-emerald-50 text-emerald-700 px-5 py-2.5 rounded-2xl text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
{(job.state || job.lga) && (
  <div>
    <h3 className="font-semibold text-lg mb-4">Location</h3>
    <p className="text-gray-700">
      {job.address && `${job.address}, `}
      {job.lga && `${job.lga}, `}
      {job.state}
    </p>
       <JobLocationMap
      lga={job.lga}
      state={job.state}
      address={job.address}
    />


    {/* Distance Badge */}
    <div className="mt-3 inline-flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-2xl">
      <MapPin className="w-4 h-4 text-emerald-600" />
      {!userLocation ? (
        <span className="text-sm text-gray-500">Enable location for distance info</span>
      ) : distanceLoading ? (
        <span className="text-sm text-gray-400 animate-pulse">Calculating distance...</span>
      ) : distanceKm != null ? (
        <span className="text-sm font-medium text-emerald-700">
          {distanceKm < 1
            ? `${Math.round(distanceKm * 1000)}m away`
            : `${distanceKm.toFixed(1)} km away`}
          {' · '}~{driveMinutes} min drive
        </span>
      ) : (
        <span className="text-sm text-gray-400">Distance unavailable</span>
      )}
    </div>
  </div>
)}

                        {/* Client / Employer Information */}
            {job.client?.businessProfile && (
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h3 className="font-semibold text-lg mb-5 flex items-center gap-2 text-gray-800">
                  <Briefcase className="w-5 h-5 text-emerald-600" />
                  About the Employer
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {job.client.firstName && (
                    <div>
                      <p className="text-xs text-gray-500">Company owner Name</p>
                      <p className="font-semibold text-gray-900">
                        {job.client.firstName} {job.client.lastName}
                      </p>
                    </div>
                  )}
                  {job.client.businessProfile.businessName && (
                    <div>
                      <p className="text-xs text-gray-500">Company Name</p>
                      <p className="font-semibold text-gray-900">
                        {job.client.businessProfile.businessName}
                      </p>
                    </div>
                  )}

                  {job.client.businessProfile.yearsOfEstablishment && (
                    <div>
                      <p className="text-xs text-gray-500">Years Established</p>
                      <p className="font-semibold text-gray-900">
                        {job.client.businessProfile.yearsOfEstablishment} 
                      </p>
                    </div>
                  )}


                  {job.client.businessProfile.numberOfStaff && (
                    <div>
                      <p className="text-xs text-gray-500">Company Size</p>
                      <p className="font-semibold text-gray-900">
                        {job.client.businessProfile.numberOfStaff} staff
                      </p>
                    </div>
                  )}

                  
                  {job.client.businessProfile.address && (
                    <div className="md:col-span-2">
                      <p className="text-xs text-gray-500">Business Address</p>
                      <p className="font-medium text-gray-800">
                        {job.client.businessProfile.address}
                      </p>
                    </div>
                  )}

                  {job.client.businessProfile.coreBusinessActivity && (
                    <div>
                      <p className="text-xs text-gray-500">Core Business</p>
                      <p className="font-semibold text-gray-900">
                        {job.client.businessProfile.coreBusinessActivity}
                      </p>

                      
                      <p className="text-xs mt-5 text-gray-500">Branches</p>
                      <p className="font-medium text-gray-800">
                        Lagos Branch
                      </p>
                    </div>
                  )}

                  {job.client.businessProfile.cacNumber && (
                    <div>
                      <p className="text-xs text-gray-500">CAC Number</p>
                      <p className="font-semibold text-gray-900">
                        {job.client.businessProfile.cacNumber}
                      </p>
                    </div>
                  )}


{job.client.businessProfile.yearsOfEstablishment && (
  <div>
    <p className="text-xs text-gray-500">Years in Business</p>
    <p className="font-semibold text-gray-900">
      {new Date().getFullYear() - job.client.businessProfile.yearsOfEstablishment} Years
    </p>
  </div>
)}
                  
                
                

                
                  
              
                </div>

                {job.client.businessProfile.aboutBusiness && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">About the Company</p>
                    <p className="text-gray-700 leading-relaxed">
                      {job.client.businessProfile.aboutBusiness}
                    </p>
                  </div>
                )}

                {job.client.businessProfile.aboutOwner && (
                  <div className="mt-6">
                    <p className="text-xs text-gray-500 mb-2">About the Owner</p>
                    <p className="text-gray-700 leading-relaxed">
                      {job.client.businessProfile.aboutOwner}
                    </p>
                  </div>
                )}
              </div>
            )}
            

            {/* Benefits */}
            {(job.jobBenefits?.length > 0 || job.otherBenefits) && (
              <div>
                <h3 className="font-semibold text-lg mb-4">Benefits & Perks</h3>
                <div className="flex flex-wrap gap-2">
                  {job.jobBenefits?.map((benefit, i) => (
                    <span key={i} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-2xl text-sm">
                      {benefit.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
                {job.otherBenefits && (
                  <p className="mt-3 text-gray-600 italic">{job.otherBenefits}</p>
                )}
              </div>
            )}

            {/* Engagement Stats */}
            <div className="grid grid-cols-3 gap-6 bg-gray-50 rounded-2xl p-6">
              <div className="text-center">
                <Heart className="w-6 h-6 text-red-500 mx-auto mb-1" />
                <p className="font-semibold">{job.likes || 0}</p>
                <p className="text-xs text-gray-500">Likes</p>
              </div>
              <div className="text-center">
                <Eye className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                <p className="font-semibold">{job.views || 0}</p>
                <p className="text-xs text-gray-500">Views</p>
              </div>
              <div className="text-center">
                <Share2 className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                <p className="font-semibold">{job.shares || 0}</p>
                <p className="text-xs text-gray-500">Shares</p>
              </div>
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 flex flex-wrap gap-x-6">
              <p>Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
              {job.expiresAt && <p>Expires: {new Date(job.expiresAt).toLocaleDateString()}</p>}
              <p>Proposals: {job.proposalsCount || 0}</p>
            </div>
          </div>

          {/* Footer Actions */}
       {/* Footer Actions */}
<div className="border-t p-6 flex flex-wrap gap-3 bg-white rounded-b-3xl">
    {/* Save Button - Only for logged in users */}
    {user && (
        <button
            onClick={() => onToggleSave(job._id)}
            className="flex-1 border border-gray-300 hover:bg-gray-50 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 transition-colors"
        >
            {isSaved ? <BookmarkCheck className="w-5 h-5 text-amber-500" /> : <Bookmark className="w-5 h-5" />}
            {isSaved ? 'Saved' : 'Save Job'}
        </button>
    )}

    {/* Employer Actions */}
    {user && hasEmployerAccess && (
        <>
            <button
                onClick={() => setShowEmailModal(true)}
                className="flex-1 border border-blue-200 hover:bg-blue-50 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 text-blue-700 transition-colors"
            >
                <Mail size={20} />
                Send Email
            </button>

            <button
                onClick={() => setShowMessageModal(true)}
                className="flex-1 border border-emerald-200 hover:bg-emerald-50 py-4 rounded-2xl font-medium flex items-center justify-center gap-2 text-emerald-700 transition-colors"
            >
                <MessageSquare size={20} />
                Message Client
            </button>
        </>
    )}

    {/* Apply Button - Smart Login Redirect */}
    <button
        onClick={() => {
            if (user) {
                setShowProposalModal(true);
            } else {
                // Redirect to login with return path
                window.location.href = `/login?redirect=/jobs/${job._id}`;
            }
        }}
        className="flex-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white py-4 rounded-2xl font-semibold text-lg transition-all"
    >
        {user ? "Apply Now - Submit Proposal" : "Login to Apply"}
    </button>
</div>
        </div>
      </div>

      {/* Modals */}
      {showProposalModal && (
        <ProposalModal
          job={job}
          onClose={() => setShowProposalModal(false)}
          onSuccess={() => {
            setShowProposalModal(false);
            onClose();
          }}
        />
      )}

      {showEmailModal && (
        <SendEmailModal
          job={job}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showMessageModal && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          job={job}
          otherPartyName={`${job.client?.firstName} ${job.client?.lastName}`}
        />
      )}
    </>
  );
}


