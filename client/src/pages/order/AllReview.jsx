



// // src/pages/SellerAllReviews.jsx
// import { useEffect, useRef, useState, useCallback } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { ArrowLeft, Star, Loader2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

// const API = import.meta.env.VITE_BACKEND_URL;
// const AUTOPLAY_MS = 5000;

// function initials(first = '', last = '') {
//   return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '•';
// }

// function Avatar({ src, first, last }) {
//   const [broken, setBroken] = useState(false);
//   if (!src || broken) {
//     return (
//       <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-[13px] font-bold text-orange-900 shrink-0">
//         {initials(first, last)}
//       </div>
//     );
//   }
//   return (
//     <img
//       src={src}
//       alt={`${first} ${last}`.trim()}
//       onError={() => setBroken(true)}
//       className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
//     />
//   );
// }

// function ReviewCard({ review }) {
//   const name = [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') || review.userName || 'Anonymous';

//   return (
//     <div className="relative bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] flex flex-col h-full">
//       <Quote size={34} className="absolute top-5 right-5 text-amber-100 fill-amber-100" strokeWidth={0} />

//       <div className="flex items-center gap-3 mb-4">
//         <Avatar src={review.user?.profilePicture} first={review.user?.firstName} last={review.user?.lastName} />
//         <div className="min-w-0">
//           <p className="font-semibold text-gray-900 text-[15px] truncate">{name}</p>
//           {review.product?.name && (
//             <p className="text-xs text-gray-400 truncate">on {review.product.name}</p>
//           )}
//         </div>
//       </div>

//       {review.comment && (
//         <p className="text-[14.5px] leading-relaxed text-gray-600 flex-1">{review.comment}</p>
//       )}

//       {review.image && (
//         <img src={review.image} alt="" className="mt-4 w-24 h-24 rounded-xl object-cover" />
//       )}

//       <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
//         <div className="flex items-center gap-1">
//           {[1, 2, 3, 4, 5].map((n) => (
//             <Star
//               key={n}
//               size={16}
//               className={n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
//             />
//           ))}
//           <span className="text-xs font-medium text-gray-500 ml-1">{review.rating} stars</span>
//         </div>
//         {review.createdAt && (
//           <span className="text-xs text-gray-300">{new Date(review.createdAt).toLocaleDateString()}</span>
//         )}
//       </div>
//     </div>
//   );
// }

// function useItemsPerView() {
//   const [n, setN] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2);
//   useEffect(() => {
//     const onResize = () => setN(window.innerWidth < 768 ? 1 : 2);
//     window.addEventListener('resize', onResize);
//     return () => window.removeEventListener('resize', onResize);
//   }, []);
//   return n;
// }

// export default function SellerAllReviews() {
//   const { sellerId } = useParams();
//   const navigate = useNavigate();
//   const [reviews, setReviews] = useState([]);
//   const [page, setPage] = useState(1);
//   const [pages, setPages] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [fetchingMore, setFetchingMore] = useState(false);
//   const [slide, setSlide] = useState(0);
//   const [paused, setPaused] = useState(false);

//   const itemsPerView = useItemsPerView();
//   const slideCount = Math.max(1, Math.ceil(reviews.length / itemsPerView));
//   const timerRef = useRef(null);

//   const fetchReviews = useCallback(async (p) => {
//     p === 1 ? setLoading(true) : setFetchingMore(true);
//     try {
//       const { data } = await axios.get(`${API}/api/reviews/seller`, { params: { limit: 15, page: p, sellerId } });
//       setReviews((prev) => (p === 1 ? data.reviews : [...prev, ...data.reviews]));
//       setPage(data.page);
//       setPages(data.pages);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//       setFetchingMore(false);
//     }
//   }, [sellerId]);

//   useEffect(() => { fetchReviews(1); setSlide(0); }, [sellerId, fetchReviews]);

//   // Autoplay
//   useEffect(() => {
//     if (paused || slideCount <= 1) return;
//     timerRef.current = setInterval(() => {
//       setSlide((s) => {
//         const next = s + 1;
//         if (next >= slideCount) {
//           if (page < pages && !fetchingMore) fetchReviews(page + 1);
//           return 0;
//         }
//         return next;
//       });
//     }, AUTOPLAY_MS);
//     return () => clearInterval(timerRef.current);
//   }, [paused, slideCount, page, pages, fetchingMore, fetchReviews]);

//   const goTo = (i) => setSlide(((i % slideCount) + slideCount) % slideCount);

//   return (
//     <div id="reviews" className="max-w-7xl mx-auto px-4 py-6">
//       {/* <div className="flex items-center gap-3 mb-6">
//         <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
//           <ArrowLeft size={18} />
//         </button>
//         <h1 className="text-xl font-extrabold text-gray-900">All Reviews</h1>
//       </div> */}

//       {loading ? (
//         <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>
//       ) : reviews.length === 0 ? (
//         <p className="text-gray-400 text-center py-16">No reviews yet.</p>
//       ) : (
//         <div
//           className="relative"
//           onMouseEnter={() => setPaused(true)}
//           onMouseLeave={() => setPaused(false)}
//         >
//           <div className="overflow-hidden">
//             <div
//               className="flex transition-transform duration-700 ease-out"
//               style={{ transform: `translateX(-${slide * 100}%)` }}
//             >
//               {Array.from({ length: slideCount }).map((_, i) => (
//                 <div key={i} className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 px-0.5">
//                   {reviews.slice(i * itemsPerView, i * itemsPerView + itemsPerView).map((r) => (
//                     <ReviewCard key={r._id} review={r} />
//                   ))}
//                 </div>
//               ))}
//             </div>
//           </div>

//           {slideCount > 1 && (
//             <>
//               <button
//                 onClick={() => goTo(slide - 1)}
//                 aria-label="Previous reviews"
//                 className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
//               >
//                 <ChevronLeft size={18} className="text-gray-600" />
//               </button>
//               <button
//                 onClick={() => goTo(slide + 1)}
//                 aria-label="Next reviews"
//                 className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
//               >
//                 <ChevronRight size={18} className="text-gray-600" />
//               </button>

//               <div className="flex items-center justify-center gap-1.5 mt-6">
//                 {Array.from({ length: slideCount }).map((_, i) => (
//                   <button
//                     key={i}
//                     onClick={() => goTo(i)}
//                     aria-label={`Go to slide ${i + 1}`}
//                     className={`h-1.5 rounded-full transition-all duration-300 ${
//                       i === slide ? 'w-6 bg-amber-400' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
//                     }`}
//                   />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }






// src/pages/SellerAllReviews.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Star, Loader2, ChevronLeft, ChevronRight, Quote } from 'lucide-react';

const API = import.meta.env.VITE_BACKEND_URL;
const AUTOPLAY_MS = 5000;

function initials(first = '', last = '') {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase() || '•';
}

function Avatar({ src, first, last }) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-[13px] font-bold text-orange-900 shrink-0">
        {initials(first, last)}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={`${first} ${last}`.trim()}
      onError={() => setBroken(true)}
      className="w-11 h-11 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm"
    />
  );
}

function ReviewCard({ review }) {
  const name = [review.user?.firstName, review.user?.lastName].filter(Boolean).join(' ') || review.userName || 'Anonymous';

  return (
    <div className="relative bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 shadow-[0_2px_16px_-4px_rgba(0,0,0,0.06)] flex flex-col h-full">
      <Quote size={30} className="absolute top-5 right-5 text-amber-100 fill-amber-100" strokeWidth={0} />

      <div className="flex items-center gap-3 mb-4">
        <Avatar src={review.user?.profilePicture} first={review.user?.firstName} last={review.user?.lastName} />
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 text-[15px] truncate">{name}</p>
          {review.product?.name && (
            <p className="text-xs text-gray-400 truncate">on {review.product.name}</p>
          )}
        </div>
      </div>

      {review.comment && (
        <p className="text-[14.5px] leading-relaxed text-gray-600 flex-1">{review.comment}</p>
      )}

      {review.image && (
        <img src={review.image} alt="" className="mt-4 w-24 h-24 rounded-xl object-cover" />
      )}

      <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-50">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={16}
              className={n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}
            />
          ))}
          <span className="text-xs font-medium text-gray-500 ml-1">{review.rating} stars</span>
        </div>
        {review.createdAt && (
          <span className="text-xs text-gray-300">{new Date(review.createdAt).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  );
}

function useItemsPerView() {
  const [n, setN] = useState(typeof window !== 'undefined' && window.innerWidth < 768 ? 1 : 2);
  useEffect(() => {
    const onResize = () => setN(window.innerWidth < 768 ? 1 : 2);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return n;
}

export default function SellerAllReviews() {
  const { sellerId } = useParams();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);
  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  const itemsPerView = useItemsPerView();
  const slideCount = Math.max(1, Math.ceil(reviews.length / itemsPerView));
  const timerRef = useRef(null);
  const touchX = useRef(null);

  const fetchReviews = useCallback(async (p) => {
    p === 1 ? setLoading(true) : setFetchingMore(true);
    try {
      const { data } = await axios.get(`${API}/api/reviews/seller`, { params: { limit: 15, page: p, sellerId } });
      setReviews((prev) => (p === 1 ? data.reviews : [...prev, ...data.reviews]));
      setPage(data.page);
      setPages(data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setFetchingMore(false);
    }
  }, [sellerId]);

  useEffect(() => { fetchReviews(1); setSlide(0); }, [sellerId, fetchReviews]);

  // Reset to a valid slide whenever the layout switches between 1-up and 2-up
  useEffect(() => { setSlide((s) => Math.min(s, slideCount - 1)); }, [slideCount]);

  // Autoplay
  useEffect(() => {
    if (paused || slideCount <= 1) return;
    timerRef.current = setInterval(() => {
      setSlide((s) => {
        const next = s + 1;
        if (next >= slideCount) {
          if (page < pages && !fetchingMore) fetchReviews(page + 1);
          return 0;
        }
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [paused, slideCount, page, pages, fetchingMore, fetchReviews]);

  const goTo = (i) => setSlide(((i % slideCount) + slideCount) % slideCount);

  // Touch swipe — mobile has no arrow buttons, so this is the primary nav there
  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX;
    setPaused(true);
  };
  const onTouchEnd = (e) => {
    if (touchX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(delta) > 40) goTo(slide + (delta < 0 ? 1 : -1));
    touchX.current = null;
    setPaused(false);
  };

  return (
    <div id="reviews" className="max-w-7xl mx-auto px-4 py-8 sm:py-10">
      <div className="text-center mb-7 sm:mb-9">
        <p className="text-xs font-semibold tracking-[0.15em] text-amber-500 uppercase mb-1.5">Testimonials</p>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">What our customers say</h1>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="animate-spin text-gray-400" /></div>
      ) : reviews.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No reviews yet.</p>
      ) : (
        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            className="overflow-hidden touch-pan-y"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <div
              className="flex transition-transform duration-700 ease-out"
              style={{ transform: `translateX(-${slide * 100}%)` }}
            >
              {Array.from({ length: slideCount }).map((_, i) => (
                <div key={i} className="w-full shrink-0 grid grid-cols-1 md:grid-cols-2 gap-4 px-0.5">
                  {reviews.slice(i * itemsPerView, i * itemsPerView + itemsPerView).map((r) => (
                    <ReviewCard key={r._id} review={r} />
                  ))}
                </div>
              ))}
            </div>
          </div>

          {slideCount > 1 && (
            <>
              <button
                onClick={() => goTo(slide - 1)}
                aria-label="Previous reviews"
                className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>
              <button
                onClick={() => goTo(slide + 1)}
                aria-label="Next reviews"
                className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white border border-gray-200 shadow-md items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>

              <div className="flex items-center justify-center gap-1.5 mt-6">
                {Array.from({ length: slideCount }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === slide ? 'w-6 bg-amber-400' : 'w-2 bg-gray-200 hover:bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}