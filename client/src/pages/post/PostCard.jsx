import { useState } from 'react';
import { Heart, Repeat2, Eye, Share2, Star, Briefcase, Package, MessageCircle, MoreHorizontal, MapPin, Calendar, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { feedAPI } from '../../config/api';
import ApplyModal from './ApplyModal';
import ReviewModal from './ReviewModal';
import ApplicationsDrawer from './ApplicationDrawer';


const TYPE_CONFIG = {
  post: { label: 'Post', color: '#2563eb', bg: '#eff6ff', icon: MessageCircle },
  contract: { label: 'Contract', color: '#7c3aed', bg: '#f5f3ff', icon: Briefcase },
  supply: { label: 'Supply Need', color: '#059669', bg: '#ecfdf5', icon: Package },
};

export default function PostCard({ post, currentUser, onUpdate }) {
  const [liked, setLiked] = useState(post.likes?.includes(currentUser?._id));
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [showApply, setShowApply] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  const [showImages, setShowImages] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isOwner = currentUser?._id === (post.author?._id || post.author);
  const canApply = ['contract', 'supply'].includes(post.postType) && !isOwner && post.status === 'active';
  const typeConfig = TYPE_CONFIG[post.postType] || TYPE_CONFIG.post;
  const TypeIcon = typeConfig.icon;

  const handleLike = async () => {
    try {
      const prev = liked;
      setLiked(!prev);
      setLikeCount(c => prev ? c - 1 : c + 1);
      await feedAPI.toggleLike(post._id);
    } catch { setLiked(liked); setLikeCount(post.likes?.length || 0); }
  };

  const handleRepost = async () => {
    try {
      await feedAPI.repost(post._id, {});
      onUpdate?.();
    } catch (e) {
      alert(e.response?.data?.message || 'Repost failed');
    }
  };

  const handleShare = async () => {
    try {
      await feedAPI.share(post._id);
      if (navigator.share) {
        await navigator.share({ title: post.title || 'Post', text: post.content, url: window.location.href });
      } else {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied!');
      }
    } catch {}
  };

  const avgRating = post.reviews?.length
    ? (post.reviews.reduce((s, r) => s + r.rating, 0) / post.reviews.length).toFixed(1)
    : null;

  const contentPreview = post.content.length > 200 && !expanded
    ? post.content.slice(0, 200) + '...'
    : post.content;

  const formatBudget = (budget) => {
    if (!budget?.min && !budget?.max) return null;
    const fmt = n => n?.toLocaleString('en-NG');
    if (budget.min && budget.max) return `₦${fmt(budget.min)} - ₦${fmt(budget.max)}`;
    if (budget.max) return `Up to ₦${fmt(budget.max)}`;
    return `From ₦${fmt(budget.min)}`;
  };

  return (
    <article style={styles.card}>
      {/* Repost indicator */}
      {post.isRepost && (
        <div style={styles.repostBanner}>
          <Repeat2 size={13} />
          <span>{post.author?.firstName} reposted</span>
        </div>
      )}

      {/* Header */}
      <div style={styles.cardHeader}>
        <div style={styles.authorInfo}>
          <div style={styles.avatar}>
            {post.author?.profilePicture
              ? <img src={post.author.profilePicture} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              : <span style={styles.avatarText}>{post.author?.firstName?.[0]}{post.author?.lastName?.[0]}</span>
            }
          </div>
          <div>
            <p style={styles.authorName}>{post.author?.firstName} {post.author?.lastName}</p>
            <p style={styles.authorSub}>
              {post.author?.businessProfile?.businessName || post.author?.username}
              {' · '}
              <span style={styles.timeAgo}>{formatTime(post.createdAt)}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ ...styles.typeBadge, background: typeConfig.bg, color: typeConfig.color }}>
            <TypeIcon size={11} />
            {typeConfig.label}
          </span>
          {isOwner && (
            <div style={{ position: 'relative' }}>
              <button style={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
                <MoreHorizontal size={18} />
              </button>
              {menuOpen && (
                <div style={styles.dropdown}>
                  <button style={styles.dropItem} onClick={() => { setMenuOpen(false); onUpdate?.('edit', post); }}>Edit Post</button>
                  {canApply === false && post.postType !== 'post' && (
                    <button style={styles.dropItem} onClick={() => { setMenuOpen(false); setShowApplications(true); }}>
                      Manage Applications ({post.applicationCount || 0})
                    </button>
                  )}
                  <button style={{ ...styles.dropItem, color: '#dc2626' }} onClick={() => { setMenuOpen(false); onUpdate?.('delete', post); }}>Delete</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Original post reference */}
      {post.isRepost && post.originalPost && (
        <div style={styles.originalPost}>
          <div style={styles.originalHeader}>
            <span style={styles.originalAuthor}>
              {post.originalPost.author?.firstName} {post.originalPost.author?.lastName}
            </span>
            <span style={styles.originalTime}>{formatTime(post.originalPost.createdAt)}</span>
          </div>
          {post.repostComment && <p style={styles.repostComment}>{post.repostComment}</p>}
          <p style={styles.originalContent}>{post.originalPost.content?.slice(0, 120)}...</p>
        </div>
      )}

      {/* Title */}
      {post.title && <h3 style={styles.postTitle}>{post.title}</h3>}

      {/* Content */}
      <p style={styles.content}>{contentPreview}</p>
      {post.content.length > 200 && (
        <button style={styles.seeMore} onClick={() => setExpanded(!expanded)}>
          {expanded ? <><ChevronUp size={14} /> See less</> : <><ChevronDown size={14} /> See more</>}
        </button>
      )}

      {/* Meta badges */}
      <div style={styles.metaRow}>
        {post.category && (
          <span style={styles.metaBadge}>📂 {post.category}</span>
        )}
        {post.location && (
          <span style={styles.metaBadge}><MapPin size={11} /> {post.location}</span>
        )}
        {formatBudget(post.budget) && (
          <span style={{ ...styles.metaBadge, background: '#ecfdf5', color: '#065f46', borderColor: '#a7f3d0' }}>
            <DollarSign size={11} /> {formatBudget(post.budget)}
          </span>
        )}
        {post.deadline && (
          <span style={{ ...styles.metaBadge, background: '#fff7ed', color: '#9a3412', borderColor: '#fed7aa' }}>
            <Calendar size={11} /> {new Date(post.deadline).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div style={styles.tagsRow}>
          {post.tags.map((tag, i) => <span key={i} style={styles.tag}>#{tag}</span>)}
        </div>
      )}

      {/* Images */}
      {post.images?.length > 0 && (
        <div style={{ ...styles.imageGrid, gridTemplateColumns: post.images.length === 1 ? '1fr' : post.images.length === 2 ? '1fr 1fr' : 'repeat(3, 1fr)' }}>
          {post.images.slice(0, 3).map((img, i) => (
            <div key={i} style={{ ...styles.imageWrapper, ...(i === 2 && post.images.length > 3 ? styles.imageOverlay : {}) }}>
              <img src={img.url} alt="" style={styles.postImage} />
              {i === 2 && post.images.length > 3 && (
                <div style={styles.moreOverlay}>+{post.images.length - 3}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Requirements/Deliverables */}
      {post.requirements?.filter(Boolean).length > 0 && (
        <div style={styles.reqSection}>
          <p style={styles.reqTitle}>Requirements</p>
          <ul style={styles.reqList}>
            {post.requirements.filter(Boolean).map((r, i) => <li key={i} style={styles.reqItem}>• {r}</li>)}
          </ul>
        </div>
      )}

      {/* Rating */}
      {avgRating && (
        <div style={styles.ratingRow}>
          <Star size={13} fill="#f59e0b" color="#f59e0b" />
          <span style={styles.ratingText}>{avgRating} ({post.reviews.length} reviews)</span>
        </div>
      )}

      {/* Actions */}
      <div style={styles.actions}>
        <div style={styles.actionGroup}>
          <button style={{ ...styles.actionBtn, ...(liked ? styles.actionBtnLiked : {}) }} onClick={handleLike}>
            <Heart size={16} fill={liked ? '#ef4444' : 'none'} color={liked ? '#ef4444' : '#666'} />
            <span>{likeCount > 0 ? likeCount : ''}</span>
          </button>

          <button style={styles.actionBtn} onClick={handleRepost}>
            <Repeat2 size={16} color={post.reposts?.includes(currentUser?._id) ? '#059669' : '#666'} />
            <span>{post.reposts?.length > 0 ? post.reposts.length : ''}</span>
          </button>

          <button style={styles.actionBtn}>
            <Eye size={16} color="#666" />
            <span>{post.views > 0 ? post.views : ''}</span>
          </button>

          <button style={styles.actionBtn} onClick={handleShare}>
            <Share2 size={16} color="#666" />
            <span>{post.shares > 0 ? post.shares : ''}</span>
          </button>

          <button style={styles.actionBtn} onClick={() => setShowReview(true)}>
            <Star size={16} color="#f59e0b" />
            <span>{post.reviews?.length > 0 ? post.reviews.length : ''}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {isOwner && ['contract', 'supply'].includes(post.postType) && (
            <button style={styles.manageBtn} onClick={() => setShowApplications(true)}>
              Manage ({post.applicationCount || 0})
            </button>
          )}

        <button
  className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
    post.status === "closed" 
      ? "bg-red-100 text-red-700 border border-red-200" 
      : "bg-green-100 text-green-700 border border-green-200"
  }`}
>
  {post.status}
</button>

          {canApply && (
            <button style={{ ...styles.applyBtn, background: typeConfig.color }} onClick={() => setShowApply(true)}>
              Apply Now
            </button>
          )}
        </div>
      </div>

      {/* Modals */}
      {showApply && (
        <ApplyModal
          post={post}
          onClose={() => setShowApply(false)}
          onApplied={() => { setShowApply(false); onUpdate?.(); }}
        />
      )}
      {showReview && (
        <ReviewModal
          post={post}
          currentUser={currentUser}
          onClose={() => setShowReview(false)}
          onReviewed={() => { setShowReview(false); onUpdate?.(); }}
        />
      )}
      {showApplications && (
        <ApplicationsDrawer
          post={post}
          onClose={() => setShowApplications(false)}
          onUpdate={onUpdate}
        />
      )}
    </article>
  );
}

function formatTime(date) {
  if (!date) return '';
  const d = new Date(date);
  const diff = (Date.now() - d) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' });
}

const styles = {
  card: { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', marginBottom: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  repostBanner: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: '#f0fdf4', color: '#059669', fontSize: 12, borderBottom: '1px solid #dcfce7' },
  cardHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 16px 0' },
  authorInfo: { display: 'flex', alignItems: 'center', gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: '50%', background: '#e8eaf6', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0 },
  avatarText: { fontSize: 14, fontWeight: 700, color: '#3949ab' },
  authorName: { margin: 0, fontWeight: 600, fontSize: 14, color: '#111' },
  authorSub: { margin: 0, fontSize: 12, color: '#888' },
  timeAgo: { color: '#aaa' },
  typeBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  menuBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 4, borderRadius: 6, display: 'flex', alignItems: 'center' },
  dropdown: { position: 'absolute', right: 0, top: 28, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.12)', zIndex: 100, minWidth: 160, overflow: 'hidden' },
  dropItem: { display: 'block', width: '100%', padding: '10px 16px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#374151', borderBottom: '1px solid #f3f4f6' },
  originalPost: { margin: '10px 16px', padding: '10px 12px', background: '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb', borderLeft: '3px solid #d1d5db' },
  originalHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  originalAuthor: { fontSize: 12, fontWeight: 600, color: '#374151' },
  originalTime: { fontSize: 11, color: '#9ca3af' },
  repostComment: { margin: '4px 0', fontSize: 13, color: '#374151', fontStyle: 'italic' },
  originalContent: { margin: 0, fontSize: 13, color: '#6b7280' },
  postTitle: { margin: '10px 16px 4px', fontWeight: 700, fontSize: 16, color: '#111' },
  content: { margin: '8px 16px', fontSize: 14, color: '#374151', lineHeight: 1.6 },
  seeMore: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#2563eb', fontSize: 13, margin: '0 16px 8px', padding: 0 },
  metaRow: { display: 'flex', flexWrap: 'wrap', gap: 6, margin: '8px 16px' },
  metaBadge: { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' },
  tagsRow: { display: 'flex', flexWrap: 'wrap', gap: 4, margin: '4px 16px 8px' },
  tag: { fontSize: 12, color: '#6366f1', background: '#eef2ff', padding: '2px 8px', borderRadius: 20 },
  imageGrid: { display: 'grid', gap: 2, margin: '8px 0' },
  imageWrapper: { position: 'relative', aspectRatio: '16/9', overflow: 'hidden' },
  postImage: { width: '100%', height: '100%', objectFit: 'cover' },
  moreOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 20, fontWeight: 700 },
  reqSection: { margin: '8px 16px', padding: '10px 12px', background: '#fafafa', borderRadius: 8, border: '1px solid #f0f0f0' },
  reqTitle: { margin: '0 0 6px', fontSize: 12, fontWeight: 700, color: '#555', textTransform: 'uppercase', letterSpacing: 0.5 },
  reqList: { margin: 0, padding: 0, listStyle: 'none' },
  reqItem: { fontSize: 13, color: '#374151', marginBottom: 3 },
  ratingRow: { display: 'flex', alignItems: 'center', gap: 4, margin: '4px 16px', },
  ratingText: { fontSize: 12, color: '#6b7280' },
  actions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderTop: '1px solid #f5f5f5', flexWrap: 'wrap', gap: 8 },
  actionGroup: { display: 'flex', alignItems: 'center', gap: 4 },
  actionBtn: { display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: '#666', padding: '6px 8px', borderRadius: 8, fontSize: 13, transition: 'background 0.15s' },
  actionBtnLiked: { color: '#ef4444' },
  manageBtn: { padding: '6px 14px', borderRadius: 8, border: '1.5px solid #7c3aed', background: '#f5f3ff', color: '#7c3aed', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  applyBtn: { padding: '6px 14px', borderRadius: 8, border: 'none', color: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
};