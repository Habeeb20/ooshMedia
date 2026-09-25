// import { useRef } from 'react';
// import HeroSection from './HeroSection';
// import CategoryBrowse from './CategoryBrowse';
// import HowItWorksSection from './HowItWorkSection';
// import Footer from '../../../components/Footer';
// import { useNavigate } from 'react-router-dom';


// export default function RentalLandingPage({ onOpenItem, onListItem }) {
//   const browseRef = useRef(null);

//   const scrollToBrowse = () => browseRef.current?.scrollIntoView({ behavior: 'smooth' });

//   function BrowseSection() {
//   const navigate = useNavigate();
//   return <CategoryBrowse onOpenItem={(id) => navigate(`/rentals/${id}`)} />;
// }

//   return (
//     <div className="font-sans">
//       <HeroSection onBrowse={scrollToBrowse} onListItem={onListItem} />
//       <div ref={browseRef}>
//         <CategoryBrowse onOpenItem={onOpenItem} />
//       </div>
//       <HowItWorksSection />
      
//       <Footer />
//       {/* <ListItemCTA onListItem={onListItem} />
//       <Footer /> */}
//     </div>
//   );
// }


import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import HeroSection from './HeroSection';
import CategoryBrowse from './CategoryBrowse';
import HowItWorksSection from './HowItWorkSection';
import Footer from '../../../components/Footer';

export default function RentalLandingPage({ onListItem }) {
  const browseRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBrowse = () => browseRef.current?.scrollIntoView({ behavior: 'smooth' });

  // Every RentalItemCard click routes straight to the item's detail page.
  // Defensive: works whether RentalItemCard calls onOpen(item._id) or
  // onOpen(item) with the whole object.
  const handleOpenItem = (idOrItem) => {
    const id = typeof idOrItem === 'string' ? idOrItem : idOrItem?._id;
    if (!id) return;
    navigate(`/rentals/${id}`);
  };

  return (
    <div className="font-sans">
      <HeroSection onBrowse={scrollToBrowse} onListItem={onListItem} />
      <div ref={browseRef}>
        <CategoryBrowse onOpenItem={handleOpenItem} />
      </div>
      <HowItWorksSection />
      <Footer />
    </div>
  );
}