import { useState } from 'react';
import {
  Heart, MessageCircle, Eye, Repeat2, Star, Share2,
  ShoppingBag, Tag, MapPin, CheckCircle, Clock, XCircle
} from 'lucide-react';
import { dealsAPI } from '../../config/api';

import './DealCard.css';

const STATUS_CONFIG = {
  active:    { label: 'Active',    icon: Clock,        color: 'status-active' },
  finalized: { label: 'Finalized', icon: CheckCircle,  color: 'status-done' },
  closed:    { label: 'Closed',    icon: XCircle,      color: 'status-closed' },
};

export default function DealCard({ deal, onClick, onUpdated }) {
  console.log('Rendering DealCard for:', deal);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(deal.likes?.length ?? 0);
  const [reposted, setReposted] = useState(false);
  const [repostCount, setRepostCount] = useState(deal.reposts?.length ?? 0);

  const status = STATUS_CONFIG[deal.status] || STATUS_CONFIG.active;
  const StatusIcon = status.icon;

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const data = await dealsAPI.like(deal._id);
      setLiked(data.liked);
      setLikeCount(data.likes);
    } catch {}
  };

  const handleRepost = async (e) => {
    e.stopPropagation();
    try {
      const data = await dealsAPI.repost(deal._id);
      setReposted(data.reposted);
      setRepostCount(data.reposts);
    } catch {}
  };

  const handleShare = async (e) => {
  e.stopPropagation();

  const shareUrl = `${window.location.origin}/deals/${deal._id}`;
  const shareTitle = deal.title;
  const shareText = `Check out this deal: ${deal.title}`;

  try {
    // First: Try Native Web Share API (Best on mobile)
    if (navigator.share) {
      await navigator.share({
        title: shareTitle,
        text: shareText,
        url: shareUrl,
      });
      toast.success("Shared successfully!");
    } 
    // Fallback: Copy to clipboard + show options
    else {
      await navigator.clipboard.writeText(shareUrl);
      
      // Optional: Show a small toast or modal with more options
      toast.success("Link copied! You can now share it.", {
        description: "Paste it on WhatsApp, Facebook, etc.",
        action: {
          label: "Copy Again",
          onClick: () => navigator.clipboard.writeText(shareUrl),
        },
      });
    }

    // Record share on backend
    await dealsAPI.share(deal._id);

  } catch (error) {
    if (error.name !== 'AbortError') { // User cancelled share
      console.error("Share failed:", error);
      toast.error("Could not share this deal");
    }
  }
};
  const author = deal.author || {};
  const authorName = `${author.firstName || ''} ${author.lastName || ''}`.trim() || author.username || 'Anonymous';
  const avatar = author.avatar;

  return (
    <article className="deal-card" onClick={onClick}>
      {/* Image area */}
      {deal.images?.length > 0 && (
        <div className="deal-card-img-wrap">
          <img src={deal.images[0].url} alt={deal.title} className="deal-card-img" />
          <div className="deal-card-img-overlay" />
          <span className={`deal-type-badge ${deal.type === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
            {deal.type === 'buy' ? <ShoppingBag size={11} /> : <Tag size={11} />}
            {deal.type === 'buy' ? 'Want to Buy' : 'For Sale'}
          </span>
          {deal.images.length > 1 && (
            <span className="img-count">+{deal.images.length - 1}</span>
          )}
        </div>
      )}

      {/* Card body */}
      <div className="deal-card-body">
        {/* Header row */}
        <div className="deal-card-header">
          {!deal.images?.length && (
            <span className={`deal-type-badge inline-badge ${deal.type === 'buy' ? 'badge-buy' : 'badge-sell'}`}>
              {deal.type === 'buy' ? <ShoppingBag size={11} /> : <Tag size={11} />}
              {deal.type === 'buy' ? 'Want to Buy' : 'For Sale'}
            </span>
          )}
          <span className={`status-badge ${status.color}`}>
            <StatusIcon size={10} />
            {status.label}
          </span>
        </div>

        {/* Title */}
        <h3 className="deal-title">{deal.title}</h3>
        <p className="deal-desc">{deal.description}</p>

        {/* Price */}
        {deal.price && (
          <div className="deal-price">
            ₦{deal.price.toLocaleString()}
            {deal.priceNegotiable && <span className="negotiable">Negotiable</span>}
          </div>
        )}

        {/* Category */}
        <div className="deal-meta-row">
          {deal.category && <span className="deal-category"># {deal.category}</span>}
          {deal.location && (
            <span className="deal-location"><MapPin size={12} />{deal.location}</span>
          )}
        </div>

        {/* Author */}
        <div className="deal-author">
          {avatar ? (
            <img src={avatar} alt={authorName} className="author-avatar" />
          ) : (
            <div className="author-avatar-placeholder">
              {authorName[0]?.toUpperCase()}
            </div>
          )}
          <div className="author-info">
            <span className="author-name">{authorName}</span>
            <span className="deal-time">{timeAgo(deal.createdAt)}</span>
          </div>
          {deal.averageRating > 0 && (
            <div className="deal-rating">
              <Star size={12} fill="currentColor" />
              <span>{deal.averageRating}</span>
            </div>
          )}
        </div>

        {/* Engagement bar */}
        <div className="deal-engagement">
          <button
            className={`eng-btn ${liked ? 'eng-liked' : ''}`}
            onClick={handleLike}
            title="Like"
          >
            <Heart size={14} fill={liked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          <button className="eng-btn" title="Comments">
            <MessageCircle size={14} />
            <span>{deal.comments?.length ?? 0}</span>
          </button>
          <button className="eng-btn" title="Views">
            <Eye size={14} />
            <span>{deal.views ?? 0}</span>
          </button>
          {/* <button
            className={`eng-btn ${reposted ? 'eng-reposted' : ''}`}
            onClick={handleRepost}
            title="Repost"
          >
            <Repeat2 size={14} />
            <span>{repostCount}</span>
          </button> */}
          <button className="eng-btn" onClick={handleShare} title="Share">
            <Share2 size={14} />
            <span>{deal.shares ?? 0}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}