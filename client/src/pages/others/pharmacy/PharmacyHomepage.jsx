import React from 'react'
import HeroSection from './HeroSection'
import HowToOrder from './HowToOrder'
import PopularMedicines from './PopularMedicine'
import PrescriptionLookup from './PrescriptionLookup'
import CustomerReviews from '../food/CustomerReview'
import Footer from '../../../components/Footer'

const PharmacyHomepage = () => {
  return (
    <div>
        <HeroSection/>
        <HowToOrder />
        <PopularMedicines />
        <PrescriptionLookup />
           <CustomerReviews reviews={[]} />
           <Footer />
      
    </div>
  )
}

export default PharmacyHomepage
