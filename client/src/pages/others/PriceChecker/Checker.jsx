// import { useState } from 'react';
// import LandingView from './LandingView';
// import ResultsView from './ResultView';

// export default function PriceChecker() {
//   const [view, setView] = useState(() => (
//     new URLSearchParams(window.location.search).get('q') ? 'results' : 'landing'
//   ));
//   const [filters, setFilters] = useState(() => {
//     const params = new URLSearchParams(window.location.search);
//     return {
//       search: params.get('q') || '',
//       sellerType: params.get('sellerType') || '',
//       state: params.get('state') || '',
//       category: params.get('category') || '',
//       sort: params.get('sort') || 'newest',
//       minPrice: params.get('minPrice') || '',
//       maxPrice: params.get('maxPrice') || '',
//     };
//   });

//   const goToResults = (nextFilters) => {
//     setFilters(nextFilters);
//     setView('results');
//     const params = new URLSearchParams();
//     Object.entries(nextFilters).forEach(([key, value]) => {
//       if (value) params.set(key === 'search' ? 'q' : key, value);
//     });
//     window.history.pushState({}, '', `?${params.toString()}`);
//   };

//   const goHome = () => {
//     setView('landing');
//     window.history.pushState({}, '', window.location.pathname);
//   };

//   if (view === 'results') {
//     return <ResultsView initialFilters={filters} onLogoClick={goHome} />;
//   }

//   return <LandingView initialFilters={filters} onSearch={goToResults} />;
// }








import { useState } from 'react';
import LandingView from './LandingView';
import ResultsView from './ResultView';

export default function PriceChecker() {
  const [category, setCategory] = useState(() => (
    new URLSearchParams(window.location.search).get('type') || 'products'
  ));
  const [view, setView] = useState(() => (
    new URLSearchParams(window.location.search).get('q') ? 'results' : 'landing'
  ));
  const [filters, setFilters] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('q') || '',
      sellerType: params.get('sellerType') || '',
      state: params.get('state') || '',
      category: params.get('category') || '',
      sort: params.get('sort') || 'newest',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      make: params.get('make') || '',
      model: params.get('model') || '',
      year: params.get('year') || '',
      transmission: params.get('transmission') || '',
      fuelType: params.get('fuelType') || '',
      bodyType: params.get('bodyType') || '',
      condition: params.get('condition') || '',
      listingType: params.get('listingType') || '',
      landType: params.get('landType') || '',
      kind: params.get('kind') || '',
    };
  });

  const goToResults = (nextCategory, nextFilters) => {
    setCategory(nextCategory);
    setFilters(nextFilters);
    setView('results');
    const params = new URLSearchParams();
    params.set('type', nextCategory);
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key === 'search' ? 'q' : key, value);
    });
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  const goHome = () => {
    setView('landing');
    window.history.pushState({}, '', window.location.pathname);
  };

  if (view === 'results') {
    return (
      <ResultsView
        category={category}
        initialFilters={filters}
        onLogoClick={goHome}
        onCategoryChange={(nextCategory) => goToResults(nextCategory, {})}
      />
    );
  }

  return <LandingView category={category} initialFilters={filters} onSearch={goToResults} />;
}