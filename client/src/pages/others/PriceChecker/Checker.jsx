import { useState } from 'react';
import LandingView from './LandingView';
import ResultsView from './ResultView';


/**
 * PriceChecker
 * Two-stage flow:
 *  1. LandingView — hero + search bar + quick filters
 *  2. ResultsView — comparison grid with the full filter sidebar
 *
 * No router dependency: view state is local, and the URL is kept in sync
 * with history.pushState so results are shareable/back-button friendly.
 * Drop <PriceChecker /> in wherever this feature is routed to (e.g. /price-checker).
 */
export default function PriceChecker() {
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
    };
  });

  const goToResults = (nextFilters) => {
    setFilters(nextFilters);
    setView('results');
    const params = new URLSearchParams();
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
    return <ResultsView initialFilters={filters} onLogoClick={goHome} />;
  }

  return <LandingView initialFilters={filters} onSearch={goToResults} />;
}