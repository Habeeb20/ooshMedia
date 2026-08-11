import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Play, X, ChevronLeft, Loader2 } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getThumbnail = (video) => {
  if (video.thumbnail?.url) return video.thumbnail.url;
  return video.video?.url?.replace(/\.(mp4|mov|webm)$/i, '.jpg');
};

const VideoLightbox = ({ video, onClose }) => {
  useEffect(() => {
    const handleKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white/80 hover:text-white p-2"
      >
        <X size={24} />
      </button>
      <div
        className="w-full max-w-3xl bg-black rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <video
          src={video.video.url}
          controls
          autoPlay
          className="w-full max-h-[75vh] bg-black"
        />
        <div className="p-4 bg-white">
          <p className="text-slate-800">{video.description}</p>
          {video.seller?.businessProfile?.businessName && (
            <p className="text-sm text-slate-500 mt-1">
              by {video.seller.businessProfile.businessName}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

const VideoGridPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeVideo, setActiveVideo] = useState(null);

  const fetchPage = useCallback(async (pageNum) => {
    const res = await axios.get(`${BACKEND_URL}/api/product-videos`, {
      params: { page: pageNum, limit: 12 },
    });
    return res.data;
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const data = await fetchPage(1);
        setVideos(data.videos);
        setHasMore(data.pagination.hasMore);

        // deep-link support: /videos?open=<id> opens the lightbox directly
        const openId = searchParams.get('open');
        if (openId) {
          const match = data.videos.find((v) => v._id === openId);
          if (match) setActiveVideo(match);
        }
      } catch (err) {
        console.log('Failed to load videos', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [fetchPage, searchParams]);

  const loadMore = async () => {
    setLoadingMore(true);
    try {
      const nextPage = page + 1;
      const data = await fetchPage(nextPage);
      setVideos((prev) => [...prev, ...data.videos]);
      setHasMore(data.pagination.hasMore);
      setPage(nextPage);
    } catch (err) {
      console.log('Failed to load more videos', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleOpen = (video) => {
    setActiveVideo(video);
    setSearchParams({ open: video._id }, { replace: true });
  };

  const handleClose = () => {
    setActiveVideo(null);
    setSearchParams({}, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-[#7B2038] mb-6"
      >
        <ChevronLeft size={16} />
        Back
      </Link>

      <h1 className="text-2xl font-semibold text-slate-900 mb-1">Product Videos</h1>
      <p className="text-sm text-slate-500 mb-8">See products in action, straight from sellers.</p>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-[#7B2038]" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
            {videos.map((video) => (
              <button
                key={video._id}
                onClick={() => handleOpen(video)}
                className="group rounded-2xl overflow-hidden bg-[#FBF6F7] hover:shadow-md transition-shadow duration-300 text-left"
              >
                <div className="relative aspect-square overflow-hidden">
                  <img
                    src={getThumbnail(video)}
                    alt={video.description}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 text-slate-900 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <p className="text-[15px] font-medium text-slate-900 leading-snug line-clamp-2">
                    {video.description}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:border-[#7B2038] hover:text-[#7B2038] transition disabled:opacity-50"
              >
                {loadingMore && <Loader2 size={14} className="animate-spin" />}
                {loadingMore ? 'Loading...' : 'Load more'}
              </button>
            </div>
          )}
        </>
      )}

      {activeVideo && <VideoLightbox video={activeVideo} onClose={handleClose} />}
    </div>
  );
};

export default VideoGridPage;