
import HeroSection from "./FoodHeroSection";
import HowToOrder from "./HowToOrder";
import PopularFood from "./PopularFood";
import RestaurantShowcase from "./RestaurantShowcase";
import CustomerReviews from "./CustomerReview";
import SellerAllReviews from "../../order/AllReview";
// import SiteFooter from "./Foodfooter";

export default function HomePage() {
  return (
    <div className="bg-white ">
      <HeroSection />
      <HowToOrder />
      <PopularFood />
   
      <RestaurantShowcase />
      {/* Pass real reviews once you have a featured-seller/reviews endpoint */}
         <div id="seller-reviews">
        <SellerAllReviews />
      </div>
      <CustomerReviews reviews={[]} />
      {/* <SiteFooter /> */}
    </div>
  );
}