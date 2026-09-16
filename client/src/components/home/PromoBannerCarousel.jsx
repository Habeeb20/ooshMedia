import { useState, useEffect, useRef } from "react";
import PromoBanner from "./PromoBanner";
import DrinksPromoBanner from "./DrinkPromoBanner";
import RentalPromoBanner from "./RentalPromoBanner";


const SLIDE_INTERVAL = 2000; // 2 seconds

const slides = [PromoBanner, DrinksPromoBanner, RentalPromoBanner];

export default function PromoBannerCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (paused) return;
    timeoutRef.current = setTimeout(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearTimeout(timeoutRef.current);
  }, [index, paused]);

  return (
    <div
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Track — shifts horizontally by 100% per slide */}
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((Slide, i) => (
          <div key={i} className="w-full flex-shrink-0">
            <Slide />
          </div>
        ))}
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-gray-800" : "w-2 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}