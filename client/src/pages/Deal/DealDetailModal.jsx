






import { useState, useEffect } from 'react';
import {
  X, Heart, MessageCircle, Eye, Repeat2, Share2, Star,
  ChevronLeft, ChevronRight, Send, Lock, Zap, CheckCircle,
  MessageSquare, ShoppingBag, Tag
} from 'lucide-react';
import { dealsAPI, subscriptionAPI } from '../../config/api';
import SubscriptionModal from './subscriptionModal';
import {toast} from "sonner"
const TABS = ['About', 'Comments', 'Reviews', 'Messages'];

// ─── helpers ──────────────────────────────────────────────────────────────────

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── sub-components ───────────────────────────────────────────────────────────

function Avatar({ src, name, size = 'sm' }) {
  const dim = size === 'lg' ? 'w-9 h-9 text-sm' : 'w-8 h-8 text-xs';
  if (src) return <img src={src} alt={name} className={`${dim} rounded-full object-cover flex-shrink-0 border-2 border-[#8B1E3F]/30`} />;
  return (
    <div className={`${dim} rounded-full bg-rose-50 border-2 border-[#8B1E3F]/20 text-[#8B1E3F] font-bold flex items-center justify-center flex-shrink-0`}>
      {name?.[0]?.toUpperCase()}
    </div>
  );
}

function MetaChip({ label, value }) {
  return (
    <div className="flex flex-col bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">{label}</span>
      <span className="text-xs font-bold text-gray-800 capitalize mt-0.5">{value}</span>
    </div>
  );
}

function CommentItem({ comment }) {
  const u = comment.user || {};
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
  return (
    <div className="flex gap-2.5">
      <Avatar src={u.avatar} name={name} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-gray-800">{name}</span>
          <span className="text-[10px] text-gray-400">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-xs text-gray-600 leading-relaxed">{comment.text}</p>
      </div>
    </div>
  );
}

function ReviewItem({ review }) {
  const u = review.user || {};
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Avatar src={u.avatar} name={name} />
        <span className="text-xs font-bold text-gray-800">{name}</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5].map(n => (
            <Star key={n} size={11} className={review.rating >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
          ))}
        </div>
        <span className="text-[10px] text-gray-400 ml-auto">{timeAgo(review.createdAt)}</span>
      </div>
      {review.text && <p className="text-xs text-gray-600 leading-relaxed">{review.text}</p>}
    </div>
  );
}

// function ConversationItem({ conv, currentUserId }) {
//   const [open, setOpen] = useState(false);
//   const other = conv.participants?.find(p => p._id !== currentUserId);
//   const otherName = other
//     ? `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.username
//     : 'User';
//   return (
//     <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
//       <button
//         className="flex items-center gap-2.5 p-3 w-full text-left hover:bg-gray-100 transition-colors"
//         onClick={() => setOpen(v => !v)}
//       >
//         <Avatar src={other?.avatar} name={otherName} />
//         <span className="text-xs font-bold text-gray-800 flex-1">{otherName}</span>
//         <span className="text-[10px] text-gray-400">{conv.messages?.length} msg{conv.messages?.length !== 1 ? 's' : ''}</span>
//         <span className="text-[10px] text-gray-400 ml-1">{open ? '▲' : '▼'}</span>
//       </button>
//       {open && (
//         <div className="border-t border-gray-100 p-3 flex flex-col gap-2">
//           {conv.messages?.map((m, i) => (
//             <div key={i} className={`max-w-[80%] ${m.sender === currentUserId ? 'self-end' : 'self-start'}`}>
//               <p className={`text-xs px-3 py-2 rounded-xl leading-relaxed
//                 ${m.sender === currentUserId
//                   ? 'bg-[#8B1E3F]/10 text-gray-800'
//                   : 'bg-white border border-gray-100 text-gray-700'}`}
//               >{m.text}</p>
//               <span className="text-[10px] text-gray-400 block mt-0.5 px-1">{timeAgo(m.createdAt)}</span>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }


function ConversationItem({ conv, currentUserId }) {
  const [open, setOpen] = useState(false);
  const other = conv.participants?.find(p => p._id !== currentUserId);
  const otherName = other
    ? `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.username
    : 'User';

  return (
    <div className="bg-gray-50 border border-gray-100 rounded-xl overflow-hidden">
      <button
        className="flex items-center gap-2.5 p-3 w-full text-left hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(v => !v)}
      >
        <Avatar src={other?.avatar} name={otherName} />
        <span className="text-xs font-bold text-gray-800 flex-1">{otherName}</span>
        <span className="text-[10px] text-gray-400">{conv.messages?.length} msg{conv.messages?.length !== 1 ? 's' : ''}</span>
        <span className="text-[10px] text-gray-400 ml-1">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="border-t border-gray-100 p-3 flex flex-col gap-2">
          {conv.messages?.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] flex flex-col ${
                String(m.sender) === String(currentUserId) ? 'self-end items-end' : 'self-start items-start'
              }`}
            >
              <p className={`text-xs px-3 py-2 rounded-xl leading-relaxed ${
                String(m.sender) === String(currentUserId)
                  ? 'bg-[#8B1E3F]/10 text-gray-800'
                  : 'bg-white border border-gray-100 text-gray-700'
              }`}>
                {m.text}
              </p>
              <span className="text-[10px] text-gray-400 mt-0.5 px-1">{timeAgo(m.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ─── main ──────────────────────────────────────────────────────────────────────

export default function DealDetailModal({ dealId, onClose, onUpdated }) {
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('About');
  const [imgIdx, setImgIdx] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [dmText, setDmText] = useState('');
  const [conversations, setConversations] = useState([]);
  const [points, setPoints] = useState(0);
  const [showSubscription, setShowSubscription] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
  const isAuthor = deal && currentUser && deal.author?._id === currentUser.id;
  console.log('Current user:', isAuthor);
  console.log(currentUser);

  useEffect(() => { loadDeal(); loadPoints(); }, [dealId]); // eslint-disable-line

  const loadDeal = async () => {
    setLoading(true);
    try {
      const data = await dealsAPI.getOne(dealId);
      setDeal(data);
      setLikeCount(data.likes?.length ?? 0);
      setRepostCount(data.reposts?.length ?? 0);
    } finally { setLoading(false); }
  };

  const loadPoints = async () => {
    try { const data = await subscriptionAPI.getBalance(); setPoints(data.points); } catch {}
  };

 
const loadMessages = async () => {
  try {
    const data = await dealsAPI.getMessages(dealId);
    console.log(data);
    setConversations(Array.isArray(data) ? data : data.messages || []);
  } catch {}
};
  useEffect(() => { if (tab === 'Messages') loadMessages(); }, [tab]); // eslint-disable-line

  const handleLike = async () => {
    const res = await dealsAPI.like(dealId);
    setLiked(res.liked); setLikeCount(res.likes);
  };

  const handleRepost = async () => {
    const res = await dealsAPI.repost(dealId);
    setReposted(res.reposted); setRepostCount(res.reposts);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/deals/${dealId}`);
    dealsAPI.share(dealId);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try { await dealsAPI.addComment(dealId, commentText); setCommentText(''); await loadDeal(); }
    finally { setSubmittingComment(false); }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    try {
      await dealsAPI.addReview(dealId, { rating: reviewRating, text: reviewText });
      setReviewText(''); setReviewRating(0); await loadDeal();
    } catch {}
  };

  const handleDM = async (e) => {
    e.preventDefault();
    if (!dmText.trim()) return;
    if (points < 1) { setShowSubscription(true); return; }
    try {
      await dealsAPI.sendMessage(dealId, dmText);
      toast.success('Message sent!');
      setDmText(''); setPoints(p => p - 1); await loadMessages();
    } catch (err) { if (err.status === 402) setShowSubscription(true); }
  };

  const handleStatusChange = async (status) => {
    setStatusLoading(true);
    try {
      const updated = await dealsAPI.updateStatus(dealId, status);
      setDeal(d => ({ ...d, status: updated.status }));
      onUpdated?.({ ...deal, status: updated.status });
    } finally { setStatusLoading(false); }
  };

  // ── loading ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-200/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-2xl min-h-[400px] flex items-center justify-center">
          <div className="flex items-center gap-1.5">
            {[0, 1, 2].map(i => (
              <span key={i} className="w-2 h-2 rounded-full bg-[#8B1E3F] opacity-70 animate-bounce"
                style={{ animationDelay: `${i * 120}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const author = deal.author || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username;

  const statusStyles = {
    active: 'bg-blue-100 text-blue-700',
    finalized: 'bg-emerald-100 text-emerald-700',
    closed: 'bg-red-100 text-red-600',
  };

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-gray-200/75 backdrop-blur-sm z-[1000] flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        {/* Modal box */}
        <div
          className="relative bg-white rounded-2xl border border-gray-100 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-[modalIn_0.22s_cubic-bezier(.16,1,.3,1)]"
          style={{ animation: 'modalIn 0.22s cubic-bezier(.16,1,.3,1)' }}
        >
          <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.96) translateY(8px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-all"
          >
            <X size={16} />
          </button>

          {/* ── Two-column layout ─────────────────────────────────────────── */}
          <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">

            {/* LEFT — image gallery */}
            <div className="relative bg-gray-50 md:w-[42%] flex-shrink-0 min-h-[220px] md:min-h-0 overflow-hidden">
              {deal.images?.length > 0 ? (
                <>
                  <img
                    src={deal.images[imgIdx].url}
                    alt={deal.title}
                    className="w-full h-full object-cover max-h-[300px] md:max-h-none"
                  />
                  {deal.images.length > 1 && (
                    <>
                      <button
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white z-10 hover:bg-black/80 transition"
                        onClick={() => setImgIdx(i => (i - 1 + deal.images.length) % deal.images.length)}
                      ><ChevronLeft size={16} /></button>
                      <button
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white z-10 hover:bg-black/80 transition"
                        onClick={() => setImgIdx(i => (i + 1) % deal.images.length)}
                      ><ChevronRight size={16} /></button>
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {deal.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImgIdx(i)}
                            className={`w-2 h-2 rounded-full transition-all ${i === imgIdx ? 'bg-[#8B1E3F]' : 'bg-white/50'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center gap-3 text-gray-400 bg-gray-100">
                  {deal.type === 'buy' ? <ShoppingBag size={40} /> : <Tag size={40} />}
                  <span className="text-xs">No images</span>
                </div>
              )}

              {/* Status badge */}
              <span className={`absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full ${statusStyles[deal.status] || 'bg-gray-100 text-gray-600'}`}>
                {deal.status}
              </span>
            </div>

            {/* RIGHT — content */}
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-0">

                {/* Header row: type badge + author actions */}
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
                    ${deal.type === 'buy' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {deal.type === 'buy' ? '🛍️ Want to Buy' : '🏷️ For Sale'}
                  </span>

                  {isAuthor && (
                    <div className="ml-auto flex items-center gap-2">
                      {deal.status === 'active' && (
                        <button
                          disabled={statusLoading}
                          onClick={() => handleStatusChange('finalized')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-semibold hover:bg-emerald-200 transition disabled:opacity-50"
                        >
                          <CheckCircle size={11} /> Mark Finalized
                        </button>
                      )}
                      {deal.status !== 'closed' && (
                        <button
                          disabled={statusLoading}
                          onClick={() => handleStatusChange('closed')}
                          className="px-2.5 py-1 rounded-full bg-red-100 border border-red-200 text-red-600 text-xs font-semibold hover:bg-red-200 transition disabled:opacity-50"
                        >
                          Close Deal
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Title */}
                <h2 className="text-lg font-black text-gray-900 leading-snug mb-1">{deal.title}</h2>

                {/* Price */}
                {deal.price && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl font-black text-[#8B1E3F]">₦{deal.price.toLocaleString()}</span>
                    {deal.priceNegotiable && (
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-[#8B1E3F] border border-[#8B1E3F]/20">
                        Negotiable
                      </span>
                    )}
                  </div>
                )}

                {/* Author row */}
                <div className="flex items-center gap-2.5 py-3 border-t border-b border-gray-100 mb-3">
                  <Avatar src={author.avatar} name={authorName} size="lg" />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">{authorName}</span>
                    <span className="text-[10px] text-gray-400">{timeAgo(deal.createdAt)}</span>
                  </div>
                  {deal.averageRating > 0 && (
                    <div className="ml-auto flex items-center gap-1 text-amber-500 font-bold text-xs">
                      <Star size={12} fill="currentColor" />
                      {deal.averageRating}
                      <span className="text-gray-400 font-normal">({deal.reviews?.length})</span>
                    </div>
                  )}
                </div>

                {/* Engagement bar */}
                <div className="grid grid-cols-5 gap-1.5 mb-3">
                  {[
                    { icon: <Heart size={13} fill={liked ? 'currentColor' : 'none'} />, count: likeCount, fn: handleLike, active: liked, cls: liked ? 'text-rose-500 border-rose-200 bg-rose-50' : '' },
                    { icon: <MessageCircle size={13} />, count: deal.comments?.length ?? 0, fn: () => setTab('Comments') },
                    { icon: <Eye size={13} />, count: deal.views, fn: () => {} },
                    { icon: <Repeat2 size={13} />, count: repostCount, fn: handleRepost, active: reposted, cls: reposted ? 'text-emerald-600 border-emerald-200 bg-emerald-50' : '' },
                    { icon: <Share2 size={13} />, count: deal.shares ?? 0, fn: handleShare },
                  ].map((b, i) => (
                    <button
                      key={i}
                      onClick={b.fn}
                      className={`flex items-center justify-center gap-1 py-1.5 rounded-xl border text-xs text-gray-500 bg-gray-50 border-gray-100 hover:border-gray-200 hover:text-gray-700 transition-all ${b.cls || ''}`}
                    >
                      {b.icon}
                      <span className="text-[11px]">{b.count}</span>
                    </button>
                  ))}
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-0 -mx-4 px-4 overflow-x-auto no-scrollbar">
                  {TABS.map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={`flex items-center gap-1 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition-all
                        ${tab === t
                          ? 'text-[#8B1E3F] border-[#8B1E3F]'
                          : 'text-gray-400 border-transparent hover:text-gray-700'}`}
                    >
                      {t}
                      {(t === 'Comments' && deal.comments?.length > 0) && (
                        <span className="bg-rose-50 text-[#8B1E3F] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {deal.comments.length}
                        </span>
                      )}
                      {(t === 'Reviews' && deal.reviews?.length > 0) && (
                        <span className="bg-rose-50 text-[#8B1E3F] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {deal.reviews.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* ── Tab content ─────────────────────────────────────────── */}
                <div className="py-3 pb-4">

                  {/* About */}
                  {tab === 'About' && (
                    <div className="flex flex-col gap-3">
                      <p className="text-xs text-gray-600 leading-relaxed">{deal.description}</p>

                      {/* Meta chips */}
                      <div className="flex flex-wrap gap-2">
                        {deal.category && <MetaChip label="Category" value={deal.category} />}
                        {deal.subcategory && <MetaChip label="Subcategory" value={deal.subcategory} />}
                        {deal.location && <MetaChip label="Location" value={deal.location} />}
                        {deal.tags?.length > 0 && <MetaChip label="Tags" value={deal.tags.join(', ')} />}
                      </div>

                      {/* DM section */}
                      {!isAuthor && (
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-2.5">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                            <MessageSquare size={13} className="text-[#8B1E3F]" />
                            <span>Send Direct Message</span>
                            <div className="ml-auto flex items-center gap-1 bg-amber-50 border border-amber-200 text-amber-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <Zap size={10} /> {points} pts
                            </div>
                          </div>

                          {points < 1 ? (
                            <div className="flex flex-col items-center gap-2 py-3 text-center">
                              <Lock size={18} className="text-gray-400" />
                              <p className="text-xs text-gray-500">You need message points to DM the seller.</p>
                              <button
                                onClick={() => setShowSubscription(true)}
                                className="px-4 py-2 bg-[#8B1E3F] text-white text-xs font-bold rounded-full hover:bg-[#7a1835] transition active:scale-95"
                              >
                                Subscribe — ₦10,000 / 10 pts
                              </button>
                            </div>
                          ) : (
                            <form onSubmit={handleDM} className="flex flex-col gap-2">
                              <textarea
                                rows={2}
                                placeholder={`Message ${authorName}…`}
                                value={dmText}
                                onChange={e => setDmText(e.target.value)}
                                className="w-full text-xs px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#8B1E3F] resize-none text-gray-700 placeholder-gray-400"
                              />
                              <button
                                type="submit"
                                className="self-end inline-flex items-center gap-1.5 px-4 py-2 bg-[#8B1E3F] text-white text-xs font-bold rounded-full hover:bg-[#7a1835] transition active:scale-95"
                              >
                                <Send size={11} /> Send (costs 1 pt)
                              </button>
                            </form>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Comments */}
                  {tab === 'Comments' && (
                    <div className="flex flex-col gap-3">
                      <form onSubmit={handleComment} className="flex gap-2">
                        <input
                          className="flex-1 text-xs px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-[#8B1E3F] text-gray-700 placeholder-gray-400"
                          placeholder="Add a comment…"
                          value={commentText}
                          onChange={e => setCommentText(e.target.value)}
                        />
                        <button
                          type="submit"
                          disabled={submittingComment}
                          className="px-3 py-2 bg-[#8B1E3F] text-white rounded-xl hover:bg-[#7a1835] transition disabled:opacity-50 flex items-center"
                        >
                          <Send size={12} />
                        </button>
                      </form>

                      {deal.comments?.length === 0 && (
                        <p className="text-xs text-gray-400 text-center py-6">No comments yet. Be the first!</p>
                      )}
                      <div className="flex flex-col gap-3">
                        {deal.comments?.map(c => <CommentItem key={c._id} comment={c} />)}
                      </div>
                    </div>
                  )}

                  {/* Reviews */}
                  {tab === 'Reviews' && (
                    <div className="flex flex-col gap-3">
                      {!isAuthor && (
                        <form onSubmit={handleReview} className="flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3">
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewRating(n)}
                                className="p-0.5 hover:scale-110 transition-transform"
                              >
                                <Star size={18} className={reviewRating >= n ? 'fill-amber-400 text-amber-400' : 'text-gray-300'} />
                              </button>
                            ))}
                          </div>
                          <input
                            className="text-xs px-3 py-2 bg-white border border-gray-100 rounded-xl outline-none focus:border-[#8B1E3F] text-gray-700 placeholder-gray-400"
                            placeholder="Write a review (optional)…"
                            value={reviewText}
                            onChange={e => setReviewText(e.target.value)}
                          />
                          <button
                            type="submit"
                            disabled={!reviewRating}
                            className="self-end px-4 py-2 bg-[#8B1E3F] text-white text-xs font-bold rounded-full hover:bg-[#7a1835] transition disabled:opacity-50 active:scale-95"
                          >
                            Submit Review
                          </button>
                        </form>
                      )}

                      {deal.reviews?.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No reviews yet.</p>}
                      <div className="flex flex-col gap-2">
                        {deal.reviews?.map(r => <ReviewItem key={r._id} review={r} />)}
                      </div>
                    </div>
                  )}

                  {/* Messages (author only) */}
                  {tab === 'Messages' && (
                    <div className="flex flex-col gap-2">
                      {!isAuthor && <p className="text-xs text-gray-400 text-center py-6">Only the post author can view messages here.</p>}
                      {isAuthor && conversations.length === 0 && <p className="text-xs text-gray-400 text-center py-6">No messages yet.</p>}
                      {isAuthor && conversations.map(conv => (
                        <ConversationItem key={conv._id} conv={conv} currentUserId={currentUser?._id} />
                      ))}
                    </div>
                  )}

                </div>
                {/* end tab content */}
              </div>
              {/* end scrollable right column */}
            </div>
            {/* end RIGHT */}
          </div>
          {/* end two-column layout */}
        </div>
        {/* end modal box */}
      </div>

      {showSubscription && (
        <SubscriptionModal
          onClose={() => setShowSubscription(false)}
          onSuccess={() => { loadPoints(); setShowSubscription(false); }}
        />
      )}
    </>
  );
}






















