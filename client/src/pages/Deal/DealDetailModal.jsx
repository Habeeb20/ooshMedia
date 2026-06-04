import { useState, useEffect, useRef } from 'react';
import {
  X, Heart, MessageCircle, Eye, Repeat2, Share2, Star,
  ChevronLeft, ChevronRight, Send, Flag, MoreHorizontal,
  Lock, Zap, CheckCircle, MessageSquare, ShoppingBag, Tag
} from 'lucide-react';
import { dealsAPI, subscriptionAPI } from '../../config/api';
import SubscriptionModal from './subscriptionModal';
import './Modal.css';
import './DealDetail.css';

const TABS = ['About', 'Comments', 'Reviews', 'Messages'];

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
  const isAuthor = deal && currentUser && deal.author?._id === currentUser._id;

  useEffect(() => {
    loadDeal();
    loadPoints();
    // eslint-disable-next-line
  }, [dealId]);

  const loadDeal = async () => {
    setLoading(true);
    try {
      const data = await dealsAPI.getOne(dealId);
      setDeal(data);
      setLikeCount(data.likes?.length ?? 0);
      setRepostCount(data.reposts?.length ?? 0);
    } finally {
      setLoading(false);
    }
  };

  const loadPoints = async () => {
    try {
      const data = await subscriptionAPI.getBalance();
      setPoints(data.points);
    } catch {}
  };

  const loadMessages = async () => {
    try {
      const data = await dealsAPI.getMessages(dealId);
      setConversations(data);
    } catch {}
  };

  useEffect(() => {
    if (tab === 'Messages') loadMessages();
  }, [tab]);

  const handleLike = async () => {
    const res = await dealsAPI.like(dealId);
    setLiked(res.liked);
    setLikeCount(res.likes);
  };

  const handleRepost = async () => {
    const res = await dealsAPI.repost(dealId);
    setReposted(res.reposted);
    setRepostCount(res.reposts);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/deals/${dealId}`);
    dealsAPI.share(dealId);
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      await dealsAPI.addComment(dealId, commentText);
      setCommentText('');
      await loadDeal();
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewRating) return;
    try {
      await dealsAPI.addReview(dealId, { rating: reviewRating, text: reviewText });
      setReviewText('');
      setReviewRating(0);
      await loadDeal();
    } catch {}
  };

  const handleDM = async (e) => {
    e.preventDefault();
    if (!dmText.trim()) return;
    if (points < 1) { setShowSubscription(true); return; }
    try {
      await dealsAPI.sendMessage(dealId, dmText);
      setDmText('');
      setPoints(p => p - 1);
      await loadMessages();
    } catch (err) {
      if (err.status === 402) setShowSubscription(true);
    }
  };

  const handleStatusChange = async (status) => {
    setStatusLoading(true);
    try {
      const updated = await dealsAPI.updateStatus(dealId, status);
      setDeal(d => ({ ...d, status: updated.status }));
      onUpdated?.({ ...deal, status: updated.status });
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-box modal-large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <div className="loader-dots"><span /><span /><span /></div>
        </div>
      </div>
    );
  }

  if (!deal) return null;

  const author = deal.author || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username;

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal-box modal-xl deal-detail-modal">
          {/* Close */}
          <button className="modal-close detail-close" onClick={onClose}><X size={20} /></button>

          <div className="deal-detail-layout">
            {/* LEFT: Image gallery */}
            <div className="deal-gallery">
              {deal.images?.length > 0 ? (
                <>
                  <img src={deal.images[imgIdx].url} alt={deal.title} className="gallery-main" />
                  {deal.images.length > 1 && (
                    <>
                      <button className="gallery-nav left" onClick={() => setImgIdx(i => (i - 1 + deal.images.length) % deal.images.length)}>
                        <ChevronLeft size={20} />
                      </button>
                      <button className="gallery-nav right" onClick={() => setImgIdx(i => (i + 1) % deal.images.length)}>
                        <ChevronRight size={20} />
                      </button>
                      <div className="gallery-dots">
                        {deal.images.map((_, i) => (
                          <button key={i} className={`g-dot ${i === imgIdx ? 'g-dot-active' : ''}`} onClick={() => setImgIdx(i)} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="gallery-placeholder">
                  {deal.type === 'buy' ? <ShoppingBag size={48} /> : <Tag size={48} />}
                  <span>No images</span>
                </div>
              )}

              {/* Status badge on gallery */}
              <div className={`gallery-status ${deal.status}`}>{deal.status.toUpperCase()}</div>
            </div>

            {/* RIGHT: Content */}
            <div className="deal-detail-content">
              {/* Title + type */}
              <div className="detail-header">
                <span className={`deal-type-badge inline-badge ${deal.type === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
                  {deal.type === 'buy' ? '🛍️ Want to Buy' : '🏷️ For Sale'}
                </span>
                {isAuthor && (
                  <div className="author-actions">
                    {deal.status === 'active' && (
                      <button
                        className="btn-finalize"
                        disabled={statusLoading}
                        onClick={() => handleStatusChange('finalized')}
                      >
                        <CheckCircle size={14} /> Mark Finalized
                      </button>
                    )}
                    {deal.status !== 'closed' && (
                      <button
                        className="btn-close-deal"
                        disabled={statusLoading}
                        onClick={() => handleStatusChange('closed')}
                      >Close Deal</button>
                    )}
                  </div>
                )}
              </div>

              <h2 className="detail-title">{deal.title}</h2>

              {deal.price && (
                <div className="detail-price">
                  ₦{deal.price.toLocaleString()}
                  {deal.priceNegotiable && <span className="negotiable">Negotiable</span>}
                </div>
              )}

              {/* Author */}
              <div className="detail-author">
                {author.avatar ? (
                  <img src={author.avatar} alt={authorName} className="author-avatar-lg" />
                ) : (
                  <div className="author-avatar-lg-placeholder">{authorName?.[0]?.toUpperCase()}</div>
                )}
                <div>
                  <span className="detail-author-name">{authorName}</span>
                  <span className="detail-author-time">{timeAgo(deal.createdAt)}</span>
                </div>
                {deal.averageRating > 0 && (
                  <div className="detail-rating">
                    <Star size={14} fill="currentColor" />
                    <span>{deal.averageRating}</span>
                    <span className="rating-count">({deal.reviews?.length})</span>
                  </div>
                )}
              </div>

              {/* Engagement */}
              <div className="detail-engagement">
                <button className={`eng-btn-lg ${liked ? 'eng-liked' : ''}`} onClick={handleLike}>
                  <Heart size={16} fill={liked ? 'currentColor' : 'none'} />{likeCount}
                </button>
                <button className="eng-btn-lg" onClick={() => setTab('Comments')}>
                  <MessageCircle size={16} />{deal.comments?.length ?? 0}
                </button>
                <button className="eng-btn-lg"><Eye size={16} />{deal.views}</button>
                <button className={`eng-btn-lg ${reposted ? 'eng-reposted' : ''}`} onClick={handleRepost}>
                  <Repeat2 size={16} />{repostCount}
                </button>
                <button className="eng-btn-lg" onClick={handleShare}>
                  <Share2 size={16} />{deal.shares ?? 0}
                </button>
              </div>

              {/* Tabs */}
              <div className="detail-tabs">
                {TABS.map(t => (
                  <button key={t} className={`detail-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                    {t}
                    {t === 'Comments' && deal.comments?.length > 0 && (
                      <span className="tab-count">{deal.comments.length}</span>
                    )}
                    {t === 'Reviews' && deal.reviews?.length > 0 && (
                      <span className="tab-count">{deal.reviews.length}</span>
                    )}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="detail-tab-body">
                {/* About */}
                {tab === 'About' && (
                  <div className="tab-about">
                    <p className="detail-desc">{deal.description}</p>
                    <div className="about-meta">
                      {deal.category && <MetaChip label="Category" value={deal.category} />}
                      {deal.subcategory && <MetaChip label="Subcategory" value={deal.subcategory} />}
                      {deal.location && <MetaChip label="Location" value={deal.location} />}
                      {deal.tags?.length > 0 && <MetaChip label="Tags" value={deal.tags.join(', ')} />}
                    </div>
                    {!isAuthor && (
                      <div className="dm-section">
                        <div className="dm-header">
                          <MessageSquare size={16} />
                          <span>Send Direct Message</span>
                          <div className="points-pill">
                            <Zap size={12} />
                            {points} pts
                          </div>
                        </div>
                        {points < 1 ? (
                          <div className="dm-locked">
                            <Lock size={20} />
                            <p>You need message points to DM the seller.</p>
                            <button className="btn-subscribe" onClick={() => setShowSubscription(true)}>
                              Subscribe — ₦10,000 / 10 pts
                            </button>
                          </div>
                        ) : (
                          <form className="dm-form" onSubmit={handleDM}>
                            <textarea
                              className="form-input form-textarea"
                              rows={2}
                              placeholder={`Message ${authorName}...`}
                              value={dmText}
                              onChange={e => setDmText(e.target.value)}
                            />
                            <button type="submit" className="btn-send-dm">
                              <Send size={14} /> Send (costs 1 pt)
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Comments */}
                {tab === 'Comments' && (
                  <div className="tab-comments">
                    <form className="comment-form" onSubmit={handleComment}>
                      <input
                        className="form-input"
                        placeholder="Add a comment..."
                        value={commentText}
                        onChange={e => setCommentText(e.target.value)}
                      />
                      <button type="submit" className="btn-send" disabled={submittingComment}>
                        <Send size={14} />
                      </button>
                    </form>
                    <div className="comments-list">
                      {deal.comments?.length === 0 && (
                        <p className="tab-empty">No comments yet. Be the first!</p>
                      )}
                      {deal.comments?.map(c => (
                        <CommentItem key={c._id} comment={c} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews */}
                {tab === 'Reviews' && (
                  <div className="tab-reviews">
                    {!isAuthor && (
                      <form className="review-form" onSubmit={handleReview}>
                        <div className="star-picker">
                          {[1,2,3,4,5].map(n => (
                            <button
                              key={n}
                              type="button"
                              className={`star-btn ${reviewRating >= n ? 'active' : ''}`}
                              onClick={() => setReviewRating(n)}
                            >
                              <Star size={20} fill={reviewRating >= n ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                        </div>
                        <input
                          className="form-input"
                          placeholder="Write a review (optional)..."
                          value={reviewText}
                          onChange={e => setReviewText(e.target.value)}
                        />
                        <button type="submit" className="btn-submit buy" disabled={!reviewRating}>
                          Submit Review
                        </button>
                      </form>
                    )}
                    <div className="reviews-list">
                      {deal.reviews?.length === 0 && <p className="tab-empty">No reviews yet.</p>}
                      {deal.reviews?.map(r => <ReviewItem key={r._id} review={r} />)}
                    </div>
                  </div>
                )}

                {/* Messages (author only) */}
                {tab === 'Messages' && (
                  <div className="tab-messages">
                    {!isAuthor && <p className="tab-empty">Only the post author can view all messages here.</p>}
                    {isAuthor && conversations.length === 0 && <p className="tab-empty">No messages yet.</p>}
                    {isAuthor && conversations.map(conv => (
                      <ConversationItem key={conv._id} conv={conv} currentUserId={currentUser?._id} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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

function MetaChip({ label, value }) {
  return (
    <div className="meta-chip">
      <span className="meta-label">{label}</span>
      <span className="meta-value">{value}</span>
    </div>
  );
}

function CommentItem({ comment }) {
  const u = comment.user || {};
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
  return (
    <div className="comment-item">
      {u.avatar ? (
        <img src={u.avatar} alt={name} className="comment-avatar" />
      ) : (
        <div className="comment-avatar-placeholder">{name?.[0]?.toUpperCase()}</div>
      )}
      <div className="comment-body">
        <div className="comment-header">
          <span className="comment-name">{name}</span>
          <span className="comment-time">{timeAgo(comment.createdAt)}</span>
        </div>
        <p className="comment-text">{comment.text}</p>
      </div>
    </div>
  );
}

function ReviewItem({ review }) {
  const u = review.user || {};
  const name = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username;
  return (
    <div className="review-item">
      <div className="review-header">
        {u.avatar ? (
          <img src={u.avatar} alt={name} className="comment-avatar" />
        ) : (
          <div className="comment-avatar-placeholder">{name?.[0]?.toUpperCase()}</div>
        )}
        <span className="comment-name">{name}</span>
        <div className="review-stars">
          {[1,2,3,4,5].map(n => (
            <Star key={n} size={12} fill={review.rating >= n ? 'currentColor' : 'none'} />
          ))}
        </div>
        <span className="comment-time">{timeAgo(review.createdAt)}</span>
      </div>
      {review.text && <p className="review-text">{review.text}</p>}
    </div>
  );
}

function ConversationItem({ conv, currentUserId }) {
  const [open, setOpen] = useState(false);
  const other = conv.participants?.find(p => p._id !== currentUserId);
  const otherName = other ? `${other.firstName || ''} ${other.lastName || ''}`.trim() || other.username : 'User';
  return (
    <div className="conv-item">
      <button className="conv-header" onClick={() => setOpen(v => !v)}>
        {other?.avatar ? (
          <img src={other.avatar} alt={otherName} className="comment-avatar" />
        ) : (
          <div className="comment-avatar-placeholder">{otherName?.[0]?.toUpperCase()}</div>
        )}
        <span className="conv-name">{otherName}</span>
        <span className="conv-count">{conv.messages?.length} msg{conv.messages?.length !== 1 ? 's' : ''}</span>
        <span className="conv-chevron">{open ? '▲' : '▼'}</span>
      </button>
      {open && (
        <div className="conv-messages">
          {conv.messages?.map((m, i) => (
            <div key={i} className={`conv-msg ${m.sender === currentUserId ? 'mine' : 'theirs'}`}>
              <p>{m.text}</p>
              <span>{timeAgo(m.createdAt)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}