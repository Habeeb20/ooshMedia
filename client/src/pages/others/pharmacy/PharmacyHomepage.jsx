import React from 'react'
import HeroSection from './HeroSection'
import HowToOrder from './HowToOrder'
import PopularMedicines from './PopularMedicine'
import PrescriptionLookup from './PrescriptionLookup'

const PharmacyHomepage = () => {
  return (
    <div>
        <HeroSection/>
        <HowToOrder />
        <PopularMedicines />
        <PrescriptionLookup />
      
    </div>
  )
}

export default PharmacyHomepage
