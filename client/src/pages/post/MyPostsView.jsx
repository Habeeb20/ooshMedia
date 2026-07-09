// MyPostsView.jsx — post owner's view: list of their posts + applicants + chat
import { useState, useEffect, useCallback } from 'react';
import ChatPanel from './ChatPanel';

const API   = import.meta.env.VITE_BACKEND_URL + '/api/posts';
const token = () => localStorage.getItem('token');

// ─── Style maps ──────────────────────────────────────────────────────────────
const TYPE_STYLES = {
  post:     { badge: 'bg-blue-50 text-blue-700 border-blue-200',     icon: 'bg-blue-50 text-blue-600'    },
  contract: { badge: 'bg-violet-50 text-violet-700 border-violet-200', icon: 'bg-violet-50 text-violet-600' },
  supply:   { badge: 'bg-amber-50 text-amber-700 border-amber-200',   icon: 'bg-amber-50 text-amber-600'  },
};

const STATUS_STYLES = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-red-50 text-red-600 border-red-200',
  draft:  'bg-gray-100 text-gray-500 border-gray-200',
};

const APP_STATUS_STYLES = {
  pending:     'bg-amber-50 text-amber-700 border-amber-200',
  accepted:    'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:    'bg-red-50 text-red-600 border-red-200',
  shortlisted: 'bg-violet-50 text-violet-700 border-violet-200',
};

// ─── Shared micro-components ─────────────────────────────────────────────────
function Avatar({ src, name, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-10 h-10 text-sm' : 'w-9 h-9 text-xs';
  if (src)
    return <img src={src} alt={name} className={`${dim} rounded-xl object-cover flex-shrink-0 ring-1 ring-black/5`} />;
  return (
    <div className={`${dim} rounded-xl bg-[#8B1E3F] text-white font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.[0]?.toUpperCase() || '?'}
    </div>
  );
}

function Badge({ children, styles }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-widest ${styles}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children}
    </span>
  );
}

function Skeleton() {
  return (
    <div className="space-y-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="h-28 bg-white rounded-2xl border border-gray-200 animate-pulse" />
      ))}
    </div>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-1">{label}</p>
      <p className={`text-2xl font-black leading-none ${accent ? 'text-[#8B1E3F]' : 'text-gray-900'}`}>{value}</p>
    </div>
  );
}

// ─── Applicant card ───────────────────────────────────────────────────────────
function ApplicantCard({ application, post, onChat, onStatusChange }) {
  const u    = application.applicant || {};
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'User';
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (status) => {
    setUpdating(true);
    try {
      const res  = await fetch(`${API}/${post._id}/applications/${application._id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) onStatusChange(application._id, status);
    } finally { setUpdating(false); }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 hover:border-[#8B1E3F]/40 transition-all slide-in">
      <div className="flex items-start gap-3">
        <Avatar src={u.profilePicture} name={name} size="lg" />
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-bold text-gray-900">{name}</span>
            <span className="text-gray-400 text-xs">@{u.username}</span>
            <Badge styles={APP_STATUS_STYLES[application.status] || APP_STATUS_STYLES.pending}>
              {application.status || 'pending'}
            </Badge>
          </div>

          {/* Cover letter */}
          {application.coverLetter && (
            <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 mb-2.5 italic">
              "{application.coverLetter}"
            </p>
          )}

          {/* Price + date */}
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {application.proposedPrice && (
              <span className="text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                ₦{application.proposedPrice.toLocaleString()}
              </span>
            )}
            <span className="text-gray-400 text-[10px]">
              {new Date(application.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {['pending', 'shortlisted', 'accepted', 'rejected']
              .filter(s => s !== application.status)
              .map(s => (
                <button
                  key={s}
                  disabled={updating}
                  onClick={() => handleStatus(s)}
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all disabled:opacity-40 ${APP_STATUS_STYLES[s]}`}
                >
                  → {s}
                </button>
              ))}

            <button
              onClick={() => onChat(u._id)}
              className="ml-auto flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-[#8B1E3F] text-white hover:bg-[#a02248] transition-all"
            >
              <ChatBubbleIcon />
              Chat
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Small icons ─────────────────────────────────────────────────────────────
function ChatBubbleIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  );
}
function UsersIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
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
function PostTypeIcon({ type }) {
  const icons = {
    contract: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
    supply: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    post: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </svg>
    ),
  };
  return icons[type] || icons.post;
}

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post: initialPost, onFinalized }) {
  const [post,        setPost]        = useState(initialPost);
  const [expanded,    setExpanded]    = useState(false);
  const [applications,setApplications]= useState([]);
  const [loadingApps, setLoadingApps] = useState(false);
  const [finalizing,  setFinalizing]  = useState(false);
  const [chat,        setChat]        = useState(null);

  const loadApplications = useCallback(async () => {
    if (!expanded) return;
    setLoadingApps(true);
    try {
      const res  = await fetch(`${API}/${post._id}/applications`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) setApplications(data.data);
    } finally { setLoadingApps(false); }
  }, [post._id, expanded]);

  useEffect(() => { loadApplications(); }, [loadApplications]);

  const handleFinalize = async () => {
    if (finalizing) return;
    if (!window.confirm('Mark this post as finalized/closed?')) return;
    setFinalizing(true);
    try {
      const res  = await fetch(`${API}/${post._id}/finalize`, {
        method: 'PUT', headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setPost(p => ({ ...p, status: 'closed' }));
        onFinalized?.(post._id);
      }
    } finally { setFinalizing(false); }
  };

  const handleStatusChange = (appId, newStatus) =>
    setApplications(prev => prev.map(a => a._id === appId ? { ...a, status: newStatus } : a));

  const handleOpenChat = (participantId) => {
    const app  = applications.find(a => a.applicant?._id === participantId);
    const u    = app?.applicant || {};
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
    setChat({ participantId, participantName: name, participantAvatar: u.profilePicture });
  };

  const typeStyle = TYPE_STYLES[post.postType] || TYPE_STYLES.post;

  return (
    <>
      <div className={`bg-white border rounded-2xl transition-all duration-300 overflow-hidden ${expanded ? 'border-[#8B1E3F]/30 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>

        {/* Header */}
        <div
          className="flex items-start gap-3 p-4 sm:p-5 cursor-pointer"
          onClick={() => setExpanded(v => !v)}
        >
          {/* Type icon */}
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${typeStyle.icon}`}>
            <PostTypeIcon type={post.postType} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <Badge styles={typeStyle.badge}>{post.postType}</Badge>
              <Badge styles={STATUS_STYLES[post.status] || STATUS_STYLES.draft}>{post.status}</Badge>
              {post.category && (
                <span className="text-gray-400 text-[10px] font-medium px-2 py-0.5 bg-gray-100 rounded-full">
                  {post.category}
                </span>
              )}
            </div>
            <h3 className="text-gray-900 font-bold text-sm sm:text-[15px] leading-snug mb-0.5">
              {post.title || post.content?.slice(0, 80) || 'Untitled'}
            </h3>
            <p className="text-gray-400 text-xs line-clamp-1">{post.content}</p>
          </div>

          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className="flex items-center gap-3 text-gray-400 text-xs">
              <span className="flex items-center gap-1"><UsersIcon />{post.applicationCount || 0}</span>
              <span className="flex items-center gap-1"><EyeIcon />{post.views || 0}</span>
            </div>
            <ChevronIcon open={expanded} />
          </div>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div className="border-t border-gray-100 px-4 sm:px-5 pb-5">
            <div className="pt-4 space-y-4">

              <p className="text-gray-600 text-sm leading-relaxed">{post.content}</p>

              {/* Meta tags */}
              <div className="flex flex-wrap gap-2">
                {post.budget && (
                  <span className="text-emerald-700 text-xs font-bold bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                    Budget: ₦{post.budget.min}- ₦{post.budget.max}
                  </span>
                )}
                {post.deadline && (
                  <span className="text-amber-700 text-xs font-medium bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    Deadline: {new Date(post.deadline).toLocaleDateString()}
                  </span>
                )}
                {post.location && (
                  <span className="text-blue-700 text-xs font-medium bg-blue-50 border border-blue-200 px-3 py-1 rounded-full">
                    📍 {post.location}
                  </span>
                )}
              </div>

              {/* Finalize */}
              {post.status === 'active' && (
                <button
                  onClick={handleFinalize}
                  disabled={finalizing}
                  className="flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 hover:bg-emerald-100 transition-all disabled:opacity-50"
                >
                  {finalizing
                    ? <span className="w-3 h-3 border-2 border-emerald-600/30 border-t-emerald-600 rounded-full animate-spin" />
                    : <CheckIcon />
                  }
                  Mark as Finalized
                </button>
              )}

              {/* Applicants (contract / supply only) */}
              {['contract', 'supply'].includes(post.postType) && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-gray-800 text-sm font-bold">Applications</h4>
                    {applications.length > 0 && (
                      <span className="bg-[#8B1E3F] text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                        {applications.length}
                      </span>
                    )}
                  </div>

                  {loadingApps ? (
                    <div className="space-y-2">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  ) : applications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-200">
                      No applications yet
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {applications.map(app => (
                        <ApplicantCard
                          key={app._id}
                          application={app}
                          post={post}
                          onChat={handleOpenChat}
                          onStatusChange={handleStatusChange}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
const FILTERS = [
  { id: 'all',      label: 'All'       },
  { id: 'contract', label: 'Contracts' },
  { id: 'supply',   label: 'Supply'    },
  { id: 'post',     label: 'Posts'     },
];

export default function MyPostsView() {
  const [posts,      setPosts]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filter,     setFilter]     = useState('all');
  const [page,       setPage]       = useState(1);
  const [pagination, setPagination] = useState(null);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/my-posts?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token()}` },
      });
      const data = await res.json();
      if (data.success) {
        setPosts(data.data);
        console.log(data.data)
        setPagination(data.pagination);
      }
    } finally { setLoading(false); }
  }, [page]);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const filtered = filter === 'all' ? posts : posts.filter(p => p.postType === filter);

  // Quick derived stats
  const total    = pagination?.total || 0;
  const active   = posts.filter(p => p.status === 'active').length;
  const totalApps= posts.reduce((s, p) => s + (p.applicationCount || 0), 0);
  const views    = posts.reduce((s, p) => s + (p.views || 0), 0);

  return (
    <div className="fade-up space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Posts"   value={total}    />
        <StatCard label="Applications"  value={totalApps} accent />
        <StatCard label="Active"        value={active}   />
        <StatCard label="Total Views"   value={views}    />
      </div>

      {/* Header + filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">All Posts</h2>
          <p className="text-gray-400 text-xs mt-0.5">Click a post to see applicants</p>
        </div>
        <div className="flex bg-white border border-gray-200 rounded-2xl p-1 gap-1 self-start sm:self-auto">
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filter === f.id
                  ? 'bg-[#8B1E3F] text-white shadow'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <Skeleton />
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
          <div className="text-5xl mb-4">📋</div>
          <p className="font-bold text-gray-700">No posts yet</p>
          <p className="text-sm text-gray-400 mt-1">Posts you create will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((post, i) => (
            <div key={post._id} style={{ animationDelay: `${i * 50}ms` }} className="fade-up">
              <PostCard post={post} onFinalized={loadPosts} />
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center gap-2 pt-2">
          {[...Array(pagination.pages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-xs font-bold transition-all border ${
                page === i + 1
                  ? 'bg-[#8B1E3F] text-white border-[#8B1E3F] shadow'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}