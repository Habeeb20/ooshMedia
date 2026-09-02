import React from 'react'
import HeroSection from '../food/FoodHeroSection';

import HowToOrder from "../food/HowToOrder";
import PopularFood from "../food/PopularFood";
import RestaurantShowcase from "../food/RestaurantShowcase";
import CustomerReviews from "../food/CustomerReview";
import SellerAllReviews from "../../order/AllReview";
import DrinksHerosection from './DrinksHerosection';
import PopularDrinks from './PopularDrinks';
import DrinksShowcase from './DrinksShowcase';
import EventDrinksBanner from './EventDrinksBanner';
import { EdrinksDiscountDealsSection } from './DrinksDiscountDeals';
import EdrinksWhyBuySection from './DrinksWhyChooseus';
const EdrinkHome = () => {
  return (
    <div>
        <DrinksHerosection/>
              {/* <HowToOrder /> */}
              <PopularDrinks/>
          
       <DrinksShowcase />
              {/* Pass real reviews once you have a featured-seller/reviews endpoint */}
                 <div id="seller-reviews">
                <SellerAllReviews />
              </div>
              <EventDrinksBanner />
              <CustomerReviews reviews={[]} />
              <EdrinksDiscountDealsSection />
              <EdrinksWhyBuySection/>
      
    </div>
  )
}

export default EdrinkHome
