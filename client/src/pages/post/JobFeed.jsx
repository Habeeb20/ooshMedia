



























































// components/JobFeed.jsx
import { useState, useEffect } from 'react';
import { Search, Heart, Star, Bookmark, BookmarkCheck, Eye, Share2, Filter } from 'lucide-react';
import { Mail } from 'lucide-react';

import JobModal from '../../components/upwork/JobModal';
import { SERVICE_CATEGORIES } from '../../categories/serviceCategories';
import { MessageSquare } from 'lucide-react';
import SendEmailModal from '../../components/upwork/SendEmail';
import MessageModal from '../../components/upwork/MessageModal';
import {useAuth} from "../../context/AuthContext"

import ReferJobModal from '../../components/upwork/ReferJobModal';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { useUserLocation } from '../../location/UserLocation';
import { useJobDistance } from '../../location/UseJobDistance';
export default function JobFeed() {
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const [allJobs, setAllJobs] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedJobForContact, setSelectedJobForContact] = useState(null);

  // Default tab: if not logged in, show 'recent'; otherwise 'best'
  const [activeTab, setActiveTab] = useState('recent');

  const [maxBudget, setMaxBudget] = useState('');
  const [showReferModal, setShowReferModal] = useState(false);
  const [selectedJobForRefer, setSelectedJobForRefer] = useState(null);

  // ==================== SEARCH STATES ====================
  const [jobTitleSearch, setJobTitleSearch] = useState('');
  const [categorySearch, setCategorySearch] = useState(searchParams.get('category') || '');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [modeFilter, setModeFilter] = useState('');
  const [stateFilter, setStateFilter] = useState('');
  const [lgaFilter, setLgaFilter] = useState('');

  const API_BASE = `${import.meta.env.VITE_JOBLINK_URL}`;
  const token = localStorage.getItem('token');

  const isLoggedIn = isAuthenticated && !!user;
  const hasEmployerAccess = user?.employerAccess?.isActive === true;
const { location: userLocation } = useUserLocation();
  // ==================== FETCH FUNCTIONS ====================

  const fetchAllJobs = async () => {
    try {
      const res = await fetch(`${API_BASE}/jobs?status=open`);
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      setAllJobs(Array.isArray(data) ? data : data.jobs || data.data || []);
    } catch (error) {
      console.error("Failed to fetch jobs", error);
      toast.error("Failed to load jobs. Please try again.");
      setAllJobs([]);
    }
  };

  const fetchBestMatches = async () => {
    if (!isLoggedIn || !token) {
      // Not logged in — fall back to all jobs
      fetchAllJobs();
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/best-matches`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      const jobs = data.data || data.jobs || data || [];
      setAllJobs(Array.isArray(jobs) ? jobs : []);
    } catch (error) {
      console.error("Failed to fetch best matches", error);
      toast.error("Failed to load best matches. Showing all jobs instead.");
      fetchAllJobs(); // fallback
    }
  };

  const fetchSavedJobs = async () => {
    if (!isLoggedIn || !token) {
      setSavedJobs([]);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/saved`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error(`HTTP error: ${res.status}`);
      const data = await res.json();
      if (data.success) setSavedJobs(data.savedJobs || []);
    } catch (error) {
      console.error("Failed to fetch saved jobs", error);
      setSavedJobs([]);
    }
  };

  // ==================== EFFECTS ====================

  useEffect(() => {
    const urlCategory = searchParams.get('category');
    if (urlCategory) setCategorySearch(urlCategory);
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'best') {
      fetchBestMatches();
    } else {
      fetchAllJobs();
    }
    fetchSavedJobs();
  }, [activeTab, isLoggedIn]);

  // Set default tab based on login status
  useEffect(() => {
    if (isLoggedIn) {
      setActiveTab('best');
    } else {
      setActiveTab('recent');
    }
  }, [isLoggedIn]);

  // ==================== ACTIONS ====================

  const toggleSave = async (jobId) => {
    if (!isLoggedIn) {
      toast.error("Please log in to save jobs.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/save/${jobId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) fetchSavedJobs();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleLike = async (jobId) => {
    if (!isLoggedIn) {
      toast.error("Please log in to like jobs.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/like`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        if (activeTab === 'best') fetchBestMatches();
        else fetchAllJobs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const rateJob = async (jobId, rating) => {
    if (!isLoggedIn) {
      toast.error("Please log in to rate jobs.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/jobs/${jobId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });
      if (res.ok) {
        if (activeTab === 'best') fetchBestMatches();
        else fetchAllJobs();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const recordView = async (jobId) => {
    try {
      await fetch(`${API_BASE}/jobs/${jobId}/view`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (error) {
      console.error(error);
    }
  };

  const shareJob = async (jobId) => {
    const job = allJobs.find(j => j._id === jobId);
    if (!job) return;
    try {
      await navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title}`,
        url: `${window.location.origin}/job/${jobId}`
      });
    } catch {
      navigator.clipboard.writeText(`${window.location.origin}/job/${jobId}`);
      toast.success("Link copied!");
    }
    try {
      await fetch(`${API_BASE}/jobs/${jobId}/share`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
    } catch (error) {
      console.error(error);
    }
  };

  const openEmailModal = (job) => {
    if (!hasEmployerAccess) {
      toast.error("You need Employer Access subscription to send direct emails");
      return;
    }
    setSelectedJobForContact(job);
    setShowEmailModal(true);
  };

  const openMessageModal = (job) => {
    setSelectedJobForContact(job);
    setShowMessageModal(true);
  };

  // ==================== FILTERING ====================

  let displayedJobs = activeTab === 'saved'
    ? [...savedJobs]
    : [...allJobs];

  if (activeTab !== 'best') {
    if (jobTitleSearch) {
      displayedJobs = displayedJobs.filter(job =>
        job.title?.toLowerCase().includes(jobTitleSearch.toLowerCase()) ||
        job.description?.toLowerCase().includes(jobTitleSearch.toLowerCase())
      );
    }

    if (categorySearch) {
      displayedJobs = displayedJobs.filter(job => job.category === categorySearch);
    }

    if (modeFilter) {
      displayedJobs = displayedJobs.filter(job => job.mode === modeFilter);
    }

    if (stateFilter) {
      displayedJobs = displayedJobs.filter(job =>
        job.state?.toLowerCase() === stateFilter.toLowerCase()
      );
    }

    if (lgaFilter) {
      displayedJobs = displayedJobs.filter(job =>
        job.lga?.toLowerCase() === lgaFilter.toLowerCase()
      );
    }

    if (maxBudget) {
      displayedJobs = displayedJobs.filter(job => job.budget <= Number(maxBudget));
    }
  }

  if (activeTab === 'recent') {
    displayedJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }


  // ← paste this ABOVE the return statement in JobFeed.jsx
function JobDistance({ userLocation, lga, state }) {
  const { distanceKm, driveMinutes, distanceLoading } = useJobDistance(userLocation, lga, state);

  if (!lga) return <p className="text-xs text-gray-400 mt-1">Location not specified</p>;
  if (!userLocation) return <p className="text-xs text-gray-400 mt-1">{lga}{state ? `, ${state}` : ''}</p>;
  if (distanceLoading) return <p className="text-xs text-gray-400 mt-1 animate-pulse">Calculating distance...</p>;

  return (
    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
      📍 {lga}{state ? `, ${state}` : ''}
      {distanceKm != null && (
        <span className="ml-2 text-emerald-600 font-medium">
          · {distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m` : `${distanceKm.toFixed(1)} km`} away
          · ~{driveMinutes} min drive
        </span>
      )}
    </p>
  );
}

  // ==================== RENDER ====================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-1">Find Work</h1>
        <p className="text-gray-600 mb-8">Discover opportunities that match your expertise</p>

        {/* Search & Filters */}
        <div className="bg-white rounded-3xl p-6 mb-8 shadow-sm">
          <div className="flex flex-col gap-4">
            {/* Basic Search */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by job title..."
                  value={jobTitleSearch}
                  onChange={(e) => setJobTitleSearch(e.target.value)}
                  className="w-full pl-12 pr-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                />
              </div>

              <select
                value={categorySearch}
                onChange={(e) => setCategorySearch(e.target.value)}
                className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
              >
                <option value="">All Categories</option>
                {SERVICE_CATEGORIES?.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* Advanced Search Toggle */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
                className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                <Filter size={18} />
                {showAdvancedSearch ? 'Hide Advanced Filters' : 'Advanced Search'}
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedSearch && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Mode</label>
                  <select
                    value={modeFilter}
                    onChange={(e) => setModeFilter(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                  >
                    <option value="">Any Mode</option>
                    <option value="remote">Remote</option>
                    <option value="onsite">Onsite</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                    <option value="permanent">Permanent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                  <input
                    type="text"
                    placeholder="e.g Lagos"
                    value={stateFilter}
                    onChange={(e) => setStateFilter(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Area</label>
                  <input
                    type="text"
                    placeholder="e.g Eti-Osa"
                    value={lgaFilter}
                    onChange={(e) => setLgaFilter(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Max Budget (₦)</label>
                  <input
                    type="number"
                    placeholder="Maximum budget"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full px-5 py-4 border border-gray-300 rounded-2xl focus:border-emerald-600 outline-none"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-8 bg-white rounded-t-3xl">
          {['best', 'recent', 'saved'].map((tab) => {
            // Hide "Best Matches" and "Saved Jobs" tabs if user is not logged in
            if ((tab === 'best' || tab === 'saved') && !isLoggedIn) return null;

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-5 text-lg font-semibold transition-all capitalize
                  ${activeTab === tab
                    ? 'text-emerald-700 border-b-4 border-emerald-600 bg-gray-50'
                    : 'text-gray-500 hover:text-gray-700'}`}
              >
                {tab === 'best' ? 'Best Matches' : tab === 'recent' ? 'Recent' : 'Saved Jobs'}
              </button>
            );
          })}
        </div>

        {/* Empty State */}
        {displayedJobs.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-xl font-medium mb-2">No jobs found</p>
            <p className="text-sm">
              {activeTab === 'saved'
                ? "You haven't saved any jobs yet."
                : "Try adjusting your filters or check back later."}
            </p>
          </div>
        )}

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {displayedJobs.map((job) => (
            <div
              key={job._id}
              className="bg-white border border-gray-200 hover:border-emerald-500 rounded-3xl p-6 transition-all hover:shadow-xl"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Job Title */}
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 leading-tight">
                    {job.title}
                  </h3>
                </div>

                {/* Mode & Budget */}
                <div className="flex items-center gap-4">
                  {job.mode && (
                    <div className={`px-4 py-1.5 rounded-2xl text-sm font-medium capitalize flex items-center gap-1.5
                      ${job.mode === 'remote' ? 'bg-blue-100 text-blue-700' :
                        job.mode === 'onsite' ? 'bg-emerald-100 text-emerald-700' :
                        job.mode === 'hybrid' ? 'bg-purple-100 text-purple-700' :
                        job.mode === 'contract' ? 'bg-amber-100 text-amber-700' :
                        job.mode === 'temporary' ? 'bg-rose-100 text-rose-700' :
                        'bg-gray-100 text-gray-700'}`}
                    >
                      {job.mode}
                    </div>
                  )}
                  <div className="font-bold text-2xl text-emerald-600 whitespace-nowrap">
                    ₦{job.budget?.toLocaleString() ?? '—'}
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mt-3 line-clamp-3 text-sm">{job.description}</p>
              <JobDistance userLocation={userLocation} lga={job.lga} state={job.state} />
              {/* <p className="text-gray-600 mt-3 line-clamp-3 text-sm">{job.lga}, {job.state}</p> */}
       


              {/* Rating Stars */}
              <div className="flex items-center gap-1 mt-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => rateJob(job._id, star)}
                    className="text-amber-400 hover:text-amber-500"
                  >
                    <Star
                      className={`w-5 h-5 ${star <= Math.floor(job.averageRating || 0) ? 'fill-amber-400' : ''}`}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-2">
                  ({job.averageRating?.toFixed(1) || '0.0'})
                </span>
              </div>

              {/* Footer: stats + actions */}
              <div className="flex justify-between items-center mt-6 pt-5 border-t text-sm">
                <div className="flex items-center gap-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {job.views || 0}
                  </div>
                  <button
                    onClick={() => toggleLike(job._id)}
                    className="flex items-center gap-1 hover:text-red-500"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        job.likedBy?.some(id => id?.toString() === user?._id?.toString())
                          ? 'fill-red-500 text-red-500'
                          : ''
                      }`}
                    />
                    {job.likes || 0}
                  </button>
                  <button
                    onClick={() => shareJob(job._id)}
                    className="flex items-center gap-1 text-gray-500 hover:text-blue-600"
                  >
                    <Share2 className="w-4 h-4" />
                    {job.shares || 0}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {isLoggedIn && (
                    <button
                      onClick={() => {
                        setSelectedJobForRefer(job);
                        setShowReferModal(true);
                      }}
                      className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition"
                    >
                      <Share2 size={18} />
                      Refer Job
                    </button>
                  )}

                  {isLoggedIn && hasEmployerAccess && (
                    <>
                      <button
                        onClick={() => openEmailModal(job)}
                        className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 transition"
                        title="Send Direct Email"
                      >
                        <Mail size={18} />
                        Email
                      </button>
                      <button
                        onClick={() => openMessageModal(job)}
                        className="flex items-center gap-1.5 text-emerald-600 hover:text-emerald-700 transition"
                        title="Send Message"
                      >
                        <MessageSquare size={18} />
                        Message
                      </button>
                    </>
                  )}

                  {isLoggedIn && (
                    <button onClick={() => toggleSave(job._id)} className="text-amber-500">
                      {savedJobs.some(s => s._id === job._id)
                        ? <BookmarkCheck size={26} />
                        : <Bookmark size={26} />
                      }
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={() => {
                  recordView(job._id);
                  setSelectedJob(job);
                }}
                className="w-full mt-5 bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-2xl font-medium"
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {selectedJob && (
        <JobModal
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
          isSaved={savedJobs.some(s => s._id === selectedJob._id)}
          onToggleSave={toggleSave}
          user={user}
        />
      )}

      {showEmailModal && selectedJobForContact && (
        <SendEmailModal
          job={selectedJobForContact}
          onClose={() => setShowEmailModal(false)}
        />
      )}

      {showMessageModal && selectedJobForContact && (
        <MessageModal
          isOpen={showMessageModal}
          onClose={() => setShowMessageModal(false)}
          job={selectedJobForContact}
          otherPartyName={selectedJobForContact.client?.firstName || "Client"}
        />
      )}

      {showReferModal && selectedJobForRefer && (
        <ReferJobModal
          job={selectedJobForRefer}
          onClose={() => {
            setShowReferModal(false);
            setSelectedJobForRefer(null);
          }}
          onSuccess={() => {
            toast.success("Job referred successfully! +10 points");
            if (activeTab === 'best') fetchBestMatches();
            else fetchAllJobs();
          }}
        />
      )}
    </div>
  );
}