import { useState, useEffect, useCallback, useRef } from 'react';
import { Plus, Briefcase, Package, FileText, Filter, TrendingUp, RefreshCw } from 'lucide-react';
import { feedAPI } from '../../config/api';
import CreatePostModal from './CreatePost';
import PostCard from './PostCard';


const FILTERS = [
  { value: '', label: 'All', icon: TrendingUp },
  { value: 'post', label: 'Posts', icon: FileText },
  { value: 'contract', label: 'Contracts', icon: Briefcase },
  { value: 'supply', label: 'Supply', icon: Package },
];

export default function FeedPage({ currentUser }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [postType, setPostType] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [createType, setCreateType] = useState('post');
  const [refreshing, setRefreshing] = useState(false);
  const loaderRef = useRef();

  const fetchPosts = useCallback(async (p = 1, type = postType, replace = false) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const res = await feedAPI.getFeed({ page: p, limit: 10, ...(type && { postType: type }) });
      const { data, pagination } = res.data;
      setPosts(prev => replace || p === 1 ? data : [...prev, ...data]);
      setHasMore(p < pagination.pages);
      setPage(p);
    } catch {}
    setLoading(false);
    setLoadingMore(false);
  }, [postType]);

  useEffect(() => { fetchPosts(1, postType, true); }, [postType]);

  // Infinite scroll
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchPosts(page + 1);
      }
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [hasMore, loadingMore, page, fetchPosts]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchPosts(1, postType, true);
    setRefreshing(false);
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  const handlePostUpdate = (action, post) => {
    if (action === 'delete') {
      if (window.confirm('Delete this post?')) {
        feedAPI.deletePost(post._id).then(() => {
          setPosts(prev => prev.filter(p => p._id !== post._id));
        });
      }
    } else {
      fetchPosts(1, postType, true);
    }
  };

  return (
    <div style={styles.page}>
      {/* Sidebar - desktop */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarCard}>
          <div style={styles.userSection}>
            <div style={styles.sidebarAvatar}>
              {currentUser?.profilePicture
                ? <img src={currentUser.profilePicture} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                : <span style={styles.sidebarAvatarText}>{currentUser?.firstName?.[0]}{currentUser?.lastName?.[0]}</span>
              }
            </div>
            <p style={styles.sidebarName}>{currentUser?.firstName} {currentUser?.lastName}</p>
            <p style={styles.sidebarBiz}>{currentUser?.businessProfile?.businessName || currentUser?.username}</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.createBtns}>
            {[
              { type: 'post', label: 'New Post', color: '#2563eb', Icon: FileText },
              { type: 'contract', label: 'Post Contract', color: '#7c3aed', Icon: Briefcase },
              { type: 'supply', label: 'Need Supply', color: '#059669', Icon: Package },
            ].map(({ type, label, color, Icon }) => (
              <button
                key={type}
                style={{ ...styles.createBtn, borderColor: color, color }}
                onClick={() => { setCreateType(type); setShowCreate(true); }}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
      </aside>

      {/* Main feed */}
      <main style={styles.main}>
        {/* Filter bar */}
        <div style={styles.filterBar}>
          <div style={styles.filterTabs}>
            {FILTERS.map(f => (
              <button
                key={f.value}
                style={{ ...styles.filterTab, ...(postType === f.value ? styles.filterTabActive : {}) }}
                onClick={() => setPostType(f.value)}
              >
                <f.icon size={14} />
                {f.label}
              </button>
            ))}
          </div>
          <button style={styles.refreshBtn} onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw size={14} style={{ animation: refreshing ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div>
            {[1, 2, 3].map(i => (
              <div key={i} style={styles.skeleton}>
                <div style={styles.skeletonHeader}>
                  <div style={styles.skeletonAvatar} />
                  <div style={{ flex: 1 }}>
                    <div style={{ ...styles.skeletonLine, width: '40%' }} />
                    <div style={{ ...styles.skeletonLine, width: '60%', height: 10, marginTop: 6 }} />
                  </div>
                </div>
                <div style={{ ...styles.skeletonLine, width: '90%' }} />
                <div style={{ ...styles.skeletonLine, width: '70%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Posts */}
        {!loading && posts.map(post => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            onUpdate={handlePostUpdate}
          />
        ))}

        {!loading && posts.length === 0 && (
          <div style={styles.empty}>
            <p style={styles.emptyTitle}>No posts yet</p>
            <p style={styles.emptyDesc}>Be the first to post something!</p>
            <button style={styles.emptyBtn} onClick={() => setShowCreate(true)}>
              <Plus size={16} /> Create Post
            </button>
          </div>
        )}

        {/* Infinite scroll trigger */}
        <div ref={loaderRef} style={{ height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {loadingMore && <div style={styles.loadingDots}><span /><span /><span /></div>}
        </div>
      </main>

      {/* FAB - mobile */}
      <button style={styles.fab} onClick={() => { setCreateType('post'); setShowCreate(true); }}>
        <Plus size={24} />
      </button>

      {/* Create modal */}
      {showCreate && (
        <CreatePostModal
          onClose={() => setShowCreate(false)}
          onCreated={handlePostCreated}
          currentUser={currentUser}
          defaultType={createType}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        @media (max-width: 768px) {
          .sidebar { display: none !important; }
          .main { padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: { display: 'flex', gap: 20, maxWidth: 960, margin: '0 auto', padding: '1rem', minHeight: '100vh', boxSizing: 'border-box' },
  sidebar: { width: 240, flexShrink: 0, className: 'sidebar' },
  sidebarCard: { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '1.25rem', position: 'sticky', top: 80 },
  userSection: { textAlign: 'center' },
  sidebarAvatar: { width: 64, height: 64, borderRadius: '50%', background: '#e8eaf6', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  sidebarAvatarText: { fontSize: 22, fontWeight: 700, color: '#3949ab' },
  sidebarName: { margin: '0 0 2px', fontWeight: 700, fontSize: 15, color: '#111' },
  sidebarBiz: { margin: 0, fontSize: 12, color: '#888' },
  divider: { height: 1, background: '#f0f0f0', margin: '14px 0' },
  createBtns: { display: 'flex', flexDirection: 'column', gap: 8 },
  createBtn: { display: 'flex', alignItems: 'center', gap: 8, padding: '9px 12px', borderRadius: 8, border: '1.5px solid', background: '#fff', cursor: 'pointer', fontSize: 13, fontWeight: 600, transition: 'background 0.15s', width: '100%' },
  main: { flex: 1, minWidth: 0 },
  filterBar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '8px 12px', marginBottom: 12 },
  filterTabs: { display: 'flex', gap: 4, overflowX: 'auto' },
  filterTab: { display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: '#666', transition: 'all 0.15s', whiteSpace: 'nowrap' },
  filterTabActive: { background: '#eff6ff', color: '#2563eb', fontWeight: 700 },
  refreshBtn: { background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 6, borderRadius: 8, display: 'flex', alignItems: 'center' },
  skeleton: { background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0', padding: '1rem', marginBottom: 12 },
  skeletonHeader: { display: 'flex', gap: 10, marginBottom: 14 },
  skeletonAvatar: { width: 44, height: 44, borderRadius: '50%', background: '#f3f4f6', flexShrink: 0, animation: 'pulse 1.5s infinite' },
  skeletonLine: { height: 12, background: '#f3f4f6', borderRadius: 6, marginBottom: 8, animation: 'pulse 1.5s infinite' },
  empty: { textAlign: 'center', padding: '3rem 1rem', background: '#fff', borderRadius: 12, border: '1px solid #f0f0f0' },
  emptyTitle: { fontWeight: 700, fontSize: 18, color: '#111', margin: '0 0 6px' },
  emptyDesc: { fontSize: 14, color: '#888', margin: '0 0 16px' },
  emptyBtn: { display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 8, border: 'none', background: '#2563eb', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  loadingDots: { display: 'flex', gap: 6 },
  fab: { display: 'none', position: 'fixed', bottom: 24, right: 24, width: 56, height: 56, borderRadius: '50%', background: '#2563eb', border: 'none', color: '#fff', cursor: 'pointer', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(37,99,235,0.4)', zIndex: 500 },
};