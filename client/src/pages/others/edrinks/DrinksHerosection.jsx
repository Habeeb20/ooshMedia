import React from 'react'
import im from "../../../assets/drinks/9 Popular Sodas Ranked From Least To Most Caffeine - NewsBreak.jpeg"
import im2 from "../../../assets/drinks/_ (6).jpeg"
import im3 from "../../../assets/drinks/_ (7).jpeg"
import im4 from '../../../assets/drinks/_ (8).jpeg'
import im5 from "../../../assets/drinks/Fanta.jpeg"
import appConfig from '../../../config/appConfig'
import { useNavigate } from 'react-router-dom'

const DrinksHerosection = () => {
    const navigate = useNavigate();

  const handleOrderNowClick = () => {
    const popularFoodSection = document.getElementById("popular-food");

    if (popularFoodSection) {
      // Already on the homepage — just smooth-scroll to the section.
      popularFoodSection.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      // Not on the homepage (e.g. someone lands on HeroSection from another route) —
      // navigate home with a hash, then scroll once the page has rendered.
      navigate("/#popular-food");
      setTimeout(() => {
        document
          .getElementById("popular-food")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  };

  return (
    <section className=" mb-10">
      {/* Curved red shape — pushed further right/down on mobile so it clears the text entirely */}
      <div
        className="absolute -top-[160px] -right-[260px]
          w-[440px] h-[440px]
          sm:-top-[300px] sm:-right-[280px] sm:w-[700px] sm:h-[700px]
          md:-top-[360px] md:-right-[300px] md:w-[900px] md:h-[900px]
          lg:-top-[400px] lg:-right-[320px] lg:w-[1000px] lg:h-[1000px]
          rounded-full pointer-events-none"
        style={{ backgroundColor: appConfig.colors.primary }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-10 sm:pb-16">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-4">
          {/* Copy — capped narrow on mobile so it never touches the curve; single line on desktop */}
          <div className="relative z-10 w-full md:max-w-xl md:pt-16 text-left pl-1 sm:pl-2">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-black leading-[1.1] text-gray-900 max-w-[180px] sm:max-w-none md:whitespace-nowrap">
              {/* Delicious */}
              <br className="md:hidden" />
              <br/>
              <span className="">Cool down and hydrate</span>
            </h1>
            <p className=" mt-3 text-xs font-semibold sm:text-sm md:text-base text-gray-500 max-w-[170px] sm:max-w-xs">
Browse our catalog, order in bulk and enjoy premium beverages wherever you are
            </p>
            {/* <p className="mt-3 text-xs sm:text-sm md:text-base text-gray-500 max-w-[170px] sm:max-w-xs">
              Restaurants &nbsp;·&nbsp; Abula &nbsp;·&nbsp; FastFood
            </p> */}

            <button
              onClick={handleOrderNowClick}
              className="mt-5 sm:mt-6 px-15 py-4.5 rounded-full text-white text-xs sm:text-sm  tracking-wide uppercase shadow-lg hover:scale-105 active:scale-95 transition-transform"
              style={{ backgroundColor: appConfig.colors.primary }}
            >
              Order Now
            </button>
          </div>

          {/* Floating plate cluster — sits over the red half only */}
          <div className="relative z-10 w-full flex-1 h-[240px] sm:h-[380px] md:h-[480px] mt-4 md:mt-0 ">
            <img
              src={im}
              alt=""
              className="plate plate-1 absolute top-[40%] left-[4%] sm:left-[8%] w-[54px] sm:w-[85px] md:w-[100px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer hidden xs:block"
            />
            <img
              src={im2}
              alt=""
              className="plate plate-2 absolute top-[4%] left-[30%] sm:left-[28%] w-[60px] sm:w-[95px] md:w-[115px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
            <img
              src={im3}
              alt=""
              className="plate plate-3 absolute -top-[2%] left-[54%] sm:left-[50%] w-[52px] sm:w-[80px] md:w-[95px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
            <img
              src={im4}
              alt=""
              className="plate plate-4 absolute top-[8%] right-[8%] sm:right-[12%] w-[62px] sm:w-[100px] md:w-[120px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
            <img
              src={im5}
              alt=""
              className="plate plate-5 absolute top-[30%] right-[4%] w-[50px] sm:w-[75px] md:w-[90px] rounded-full shadow-xl object-cover aspect-square border-4 border-white cursor-pointer hidden sm:block"
            />
            <img
              src={im5}
              alt="Featured dish"
              className="plate plate-6 absolute -top-[110px] right-[2%] left-auto translate-x-0
                sm:top-auto sm:bottom-15 sm:left-[36%] sm:right-auto sm:translate-x-0
                w-[120px] sm:w-[220px] md:w-[260px]
                rounded-full shadow-2xl object-cover aspect-square border-4 border-white cursor-pointer"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes plateRelaySpin {
          0%   { transform: rotate(0deg); }
          25%  { transform: rotate(360deg); }
          100% { transform: rotate(360deg); }
        }
        .plate {
          animation: plateRelaySpin 8s linear infinite;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }
        .plate-1 { animation-delay: 0s; }
        .plate-2 { animation-delay: 1.3s; }
        .plate-3 { animation-delay: 2.6s; }
        .plate-4 { animation-delay: 4s; }
        .plate-5 { animation-delay: 5.3s; }
        .plate-6 { animation-delay: 6.6s; }
        .plate:hover {
          animation-play-state: paused;
          transform: scale(1.08) translateY(-4px);
          box-shadow: 0 12px 28px rgba(0,0,0,0.22);
          z-index: 20;
        }
        @media (prefers-reduced-motion: reduce) {
          .plate { animation: none; }
        }
      `}</style>
    </section>
  );
}

export default DrinksHerosection
