import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, ArrowRight } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

const getThumbnail = (video) => {
  if (video.thumbnail?.url) return video.thumbnail.url;
  return video.video?.url?.replace(/\.(mp4|mov|webm)$/i, '.jpg');
};

const VideoCardSkeleton = () => (
  <div className="rounded-2xl overflow-hidden bg-[#FBF6F7] animate-pulse">
    <div className="aspect-square bg-slate-200" />
    <div className="p-4 space-y-2">
      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
      <div className="h-3 bg-slate-200 rounded w-1/3" />
    </div>
  </div>
);

const ProductVideoSection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/product-videos`, {
          params: { page: 1, limit: 4 },
        });
        setVideos(res.data.videos);
        console.log(res.data.videos)
      } catch (err) {
        console.log('Failed to load product videos', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  if (!loading && videos.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-900">Fake Product Videos</h2>
          <p className="text-sm text-slate-500 mt-0.5">See products in action, straight from sellers.</p>
        </div>
        <Link
          to="/videos"
          className="flex items-center gap-1 text-sm font-medium text-[#7B2038] hover:text-[#611829] transition whitespace-nowrap"
        >
          See all
          <ArrowRight size={15} />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-6 sm:gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <VideoCardSkeleton key={i} />)
          : videos.map((video) => (
              <Link
                to={`/videos?open=${video._id}`}
                key={video._id}
                className="group rounded-2xl overflow-hidden bg-[#FBF6F7] hover:shadow-md transition-shadow duration-300"
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
                  <p className="text-[10px] font-medium text-slate-900 leading-snug line-clamp-2">
                  {video.tags}
                  </p>
                  <span className="inline-block mt-2 text-sm font-medium text-[#7B2038]">
                    View More
                  </span>
                </div>
              </Link>
            ))}
      </div>
    </section>
  );
};

export default ProductVideoSection;