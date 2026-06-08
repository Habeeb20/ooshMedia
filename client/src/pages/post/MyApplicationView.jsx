// MyApplicationsView.jsx — applicant's view: posts they applied to + chat with post author
import { useState, useEffect, useCallback } from 'react';
import ChatPanel from './ChatPanel';

const API   = import.meta.env.VITE_BACKEND_URL + '/api/posts';
const token = () => localStorage.getItem('token');

// ─── Style maps ──────────────────────────────────────────────────────────────
const APP_STATUS_STYLES = {
  pending:     { badge: 'bg-amber-50 text-amber-700 border-amber-200',     dot: 'bg-amber-400'   },
  accepted:    { badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-400' },
  rejected:    { badge: 'bg-red-50 text-red-600 border-red-200',            dot: 'bg-red-400'     },
  shortlisted: { badge: 'bg-violet-50 text-violet-700 border-violet-200',   dot: 'bg-violet-400'  },
};

const POST_TYPE_META = {
  contract: { icon: '📄', iconBg: 'bg-violet-50 text-violet-600' },
  supply:   { icon: '📦', iconBg: 'bg-amber-50 text-amber-600'   },
  post:     { icon: '📝', iconBg: 'bg-blue-50 text-blue-600'     },
};

// ─── Micro components ─────────────────────────────────────────────────────────
function Avatar({ src, name, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-7 h-7 text-[11px]';
  if (src)
    return <img src={src} alt={name} className={`${dim} rounded-xl object-cover flex-shrink-0 ring-1 ring-black/5`} />;
  return (
    <div className={`${dim} rounded-xl bg-[#8B1E3F] text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = APP_STATUS_STYLES[status] || APP_STATUS_STYLES.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${s.badge}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black leading-none ${accent ? 'text-[#8B1E3F]' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-36 bg-white rounded-2xl border border-gray-200 animate-pulse" />
      ))}
    </div>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      className={`text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
    >
      <path d="m6 9 6 6 6-6"/>
    </svg>
  );
}

// ─── Application card ─────────────────────────────────────────────────────────
function ApplicationCard({ item }) {
  const { post, application } = item;
  const [expanded, setExpanded] = useState(false);
  const [chat,     setChat]     = useState(null);

  if (!post || !application) return null;

  const author     = post.author || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username || 'Author';
  const typeMeta   = POST_TYPE_META[post.postType] || POST_TYPE_META.post;
  const statusStyle= APP_STATUS_STYLES[application.status] || APP_STATUS_STYLES.pending;

  return (
    <>
      <div className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${expanded ? 'border-[#8B1E3F]/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>

        {/* Top row */}
        <div
          className="flex items-start gap-3 p-4 sm:p-5 cursor-pointer"
          onClick={() => setExpanded(v => !v)}
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 ${typeMeta.iconBg}`}>
            {typeMeta.icon}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{post.postType}</span>
              <StatusBadge status={application.status} />
            </div>
            <h3 className="text-gray-900 font-bold text-sm leading-snug mb-1.5">
              {post.title || post.content?.slice(0, 70) || 'Untitled'}
            </h3>
            <div className="flex items-center gap-2">
              <Avatar src={author.profilePicture} name={authorName} />
              <span className="text-gray-400 text-xs">by {authorName}</span>
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <span className="text-gray-400 text-[10px]">
              {new Date(application.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
            </span>
            <ChevronIcon open={expanded} />
          </div>
        </div>

        {/* Expanded */}
        {expanded && (
          <div className="border-t border-gray-100 p-4 sm:p-5 space-y-4">

            {/* Post details */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2.5">
              <p className="text-gray-500 text-xs leading-relaxed">{post.content}</p>
              <div className="flex flex-wrap gap-2">
                {post.budget && (
                  <span className="text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Budget: ₦{post.budget.toLocaleString()}
                  </span>
                )}
                {post.deadline && (
                  <span className="text-amber-700 text-xs bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Due: {new Date(post.deadline).toLocaleDateString()}
                  </span>
                )}
                {post.location && (
                  <span className="text-blue-700 text-xs bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                    📍 {post.location}
                  </span>
                )}
                <span className={`text-xs px-2.5 py-0.5 rounded-full border ${statusStyle.badge}`}>
                  Post is {post.status}
                </span>
              </div>
            </div>

            {/* My application */}
            <div>
              <h4 className="text-gray-400 text-[11px] font-bold uppercase tracking-widest mb-2">Your Application</h4>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 space-y-2">
                {application.coverLetter && (
                  <p className="text-gray-500 text-xs leading-relaxed italic">
                    "{application.coverLetter}"
                  </p>
                )}
                {application.proposedPrice && (
                  <span className="inline-block text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                    Proposed: ₦{application.proposedPrice.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Chat CTA */}
            <button
              onClick={() => setChat({
                participantId:     author._id,
                participantName:   authorName,
                participantAvatar: author.profilePicture,
              })}
              className="w-full flex items-center justify-center gap-2 py-3 bg-[#8B1E3F] hover:bg-[#a02248] text-white font-bold text-sm rounded-2xl transition-all active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Message {authorName}
            </button>
          </div>
        )}
      </div>

      {chat && (
        <ChatPanel
          postId={post._id}
          postTitle={post.title || 'Post'}
          participantId={chat.participantId}
          participantName={chat.participantName}
          participantAvatar={chat.participantAvatar}
          onClose={() => setChat(null)}
        />
      )}
    </>
  );
}

// ─── Main view ────────────────────────────────────────────────────────────────
const STATUS_FILTERS = ['all', 'pending', 'shortlisted', 'accepted', 'rejected'];

export default function MyApplicationsView() {
  const [applications, setApplications] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState('all');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/my-applications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const counts = STATUS_FILTERS.reduce((acc, s) => {
    acc[s] = s === 'all'
      ? applications.length
      : applications.filter(a => a.application?.status === s).length;
    return acc;
  }, {});

  const filtered = filter === 'all'
    ? applications
    : applications.filter(a => a.application?.status === filter);

  const shortlisted = counts['shortlisted'] || 0;
  const accepted    = counts['accepted']    || 0;
  const pending     = counts['pending']     || 0;

  return (
    <div className="fade-up space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Applied"     value={applications.length} />
        <StatCard label="Shortlisted" value={shortlisted} accent />
        <StatCard label="Accepted"    value={accepted}   />
        <StatCard label="Pending"     value={pending}    />
      </div>

      {/* Header */}
      <div>
        <h2 className="text-lg font-black text-gray-900">All Applications</h2>
        <p className="text-gray-400 text-xs mt-0.5">{applications.length} total applications</p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(s => {
          const count = counts[s];
          if (s !== 'all' && count === 0) return null;
          const sStyle = s !== 'all' ? APP_STATUS_STYLES[s] : null;
          const isActive = filter === s;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                isActive
                  ? s === 'all'
                    ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow'
                    : `${sStyle.badge} shadow-sm`
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
              }`}
            >
              {s !== 'all' && (
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? sStyle.dot : 'bg-gray-300'}`} />
              )}
              {s.charAt(0).toUpperCase() + s.slice(1)}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                isActive ? 'bg-black/10 text-current' : 'bg-gray-100 text-gray-400'
              }`}>{count}</span>
            </button>
          );
        })}
      </div>

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">📨</div>
          <p className="font-bold text-gray-700">
            No applications {filter !== 'all' ? `with "${filter}" status` : 'yet'}
          </p>
          <p className="text-sm text-gray-400 mt-1">Apply to contracts and supply posts to see them here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <div key={item.application?._id || i} style={{ animationDelay: `${i * 50}ms` }} className="fade-up">
              <ApplicationCard item={item} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}