import { useNavigate } from "react-router-dom";
import im5 from "../../../assets/drinks/Fanta.jpeg";

export default function EventDrinksBanner() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 mt-10">
      <div
        onClick={() => navigate("/wholesale")}
        className="group rounded-[2rem] overflow-hidden relative min-h-[260px] sm:h-[320px] md:h-[380px] cursor-pointer shadow-xl"
      >
        {/* background image */}
        <img
          src={im5}
          alt="Crates of drinks for events"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* dark overlay — strongest bottom-left where text sits, fading toward the image on the right */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(100deg, rgba(26,15,8,0.94) 0%, rgba(26,15,8,0.82) 35%, rgba(26,15,8,0.45) 60%, rgba(26,15,8,0.05) 85%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(26,15,8,0.55) 0%, rgba(26,15,8,0) 45%)",
          }}
        />

        {/* content */}
        <div className="relative h-full flex flex-col justify-center px-6 sm:px-10 md:px-14 py-8 max-w-xl">
          <h1 className="text-2xl sm:text-3xl md:text-[2.5rem] font-black leading-[1.1] tracking-tight text-[#fdf6ec]">
            Are you hosting an event and need drinks?
          </h1>

          <p className="mt-3 sm:mt-4 text-sm sm:text-base md:text-lg leading-relaxed text-[#e8d9c5] max-w-md">
            Get exclusive wholesale pricing for weddings, parties, and
            corporate events. Let's handle the beverages too.
          </p>

          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate("/wholesale");
            }}
            className="mt-6 sm:mt-8 self-start bg-rose-900 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:bg-[#ffb521] hover:scale-105 active:scale-95 transition-all shadow-lg"
          >
            Order now
          </button>
        </div>
      </div>
    </section>
  );
}