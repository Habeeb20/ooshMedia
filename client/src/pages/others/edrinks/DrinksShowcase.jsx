import restaurantImg from "../../../assets/drinks/9 Popular Sodas Ranked From Least To Most Caffeine - NewsBreak.jpeg";

export default function DrinksShowcase() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 mt-16 sm:mt-24 mb-30">
      <h2 className="text-center text-xl sm:text-2xl font-extrabold text-gray-900">
        Place Of Our Bar
      </h2>

      <div className="mt-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-lg sm:text-2xl font-black text-gray-900">
            Clean and Comfortable
          </h3>
          <p className="mt-3 text-sm sm:text-base text-gray-500 max-w-md mx-auto md:mx-0 leading-relaxed">
            Every seller on our platform is verified, and every bar and shops are
            held to the same standard 
          </p>
        </div>

        <div className="flex-1 w-full">
          <img
            src={restaurantImg}
            alt="Inside one of our partner kitchens"
            className="w-full h-[220px] sm:h-[300px] object-cover rounded-3xl shadow-lg"
          />
        </div>
      </div>
    </section>
  );
}