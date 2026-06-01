export const AD_PLANS = {
  flash_sale: {
    name: 'Flash Sale',
    description: 'Feature your products in time-limited flash sales with countdown timers',
    icon: '⚡',
    color: '#ef4444',
    plans: {
      basic:    { label: 'Basic',    price: 5000,  duration: 3,  features: ['Up to 5 products', 'Homepage banner', 'Email notification'] },
      standard: { label: 'Standard', price: 12000, duration: 7,  features: ['Up to 15 products', 'Homepage + Category banner', 'Push notification', 'Priority placement'] },
      premium:  { label: 'Premium',  price: 25000, duration: 14, features: ['Unlimited products', 'All banners', 'SMS + Push + Email', 'Top placement', 'Analytics'] },
    }
  },
  discount_deals: {
    name: 'Discount Deals',
    description: 'Showcase your discounted products to millions of buyers',
    icon: '🏷️',
    color: '#f59e0b',
    plans: {
      basic:    { label: 'Basic',    price: 4000,  duration: 7,  features: ['Up to 8 products', 'Deals section listing', 'Badge on product'] },
      standard: { label: 'Standard', price: 9000,  duration: 14, features: ['Up to 20 products', 'Featured deals banner', 'Priority badge', 'Category boost'] },
      premium:  { label: 'Premium',  price: 20000, duration: 30, features: ['Unlimited products', 'Homepage deals strip', 'Top badge', 'Full analytics', 'Dedicated slot'] },
    }
  },
  trending_now: {
    name: 'Trending Now',
    description: 'Get your products into the trending section and boost visibility',
    icon: '🔥',
    color: '#f97316',
    plans: {
      basic:    { label: 'Basic',    price: 6000,  duration: 5,  features: ['Up to 5 products', 'Trending section', 'Trending badge'] },
      standard: { label: 'Standard', price: 14000, duration: 10, features: ['Up to 12 products', 'Top trending slot', 'Homepage feature', 'Social boost'] },
      premium:  { label: 'Premium',  price: 30000, duration: 21, features: ['Unlimited products', '#1 Trending slot', 'All sections', 'Influencer feature', 'Full analytics'] },
    }
  },
  top_sellers: {
    name: 'Top Sellers',
    description: 'Appear in the Top Sellers list and build brand credibility',
    icon: '🏆',
    color: '#eab308',
    plans: {
      basic:    { label: 'Basic',    price: 8000,  duration: 7,  features: ['Top sellers section', 'Verified badge', 'Profile boost'] },
      standard: { label: 'Standard', price: 18000, duration: 14, features: ['Featured top seller', 'Homepage spotlight', 'Verified + Top badge', 'Priority search'] },
      premium:  { label: 'Premium',  price: 35000, duration: 30, features: ['#1 Top seller slot', 'All pages feature', 'Gold badge', 'Full analytics', 'Dedicated page'] },
    }
  },
  top_products: {
    name: 'Top Products',
    description: 'Pin your products to the top of search results and category pages',
    icon: '⭐',
    color: '#8b5cf6',
    plans: {
      basic:    { label: 'Basic',    price: 5500,  duration: 7,  features: ['Up to 5 products pinned', 'Category top listing', 'Featured badge'] },
      standard: { label: 'Standard', price: 13000, duration: 14, features: ['Up to 15 products pinned', 'Search top listing', 'Homepage feature', 'Star badge'] },
      premium:  { label: 'Premium',  price: 28000, duration: 30, features: ['Unlimited pinned', 'All pages top slot', 'Diamond badge', 'Analytics', 'Competitor boost'] },
    }
  },
  anniversary_deals: {
    name: 'Anniversary Deals',
    description: 'Special seasonal and anniversary promotions with maximum reach',
    icon: '🎉',
    color: '#ec4899',
    plans: {
      basic:    { label: 'Basic',    price: 7000,  duration: 7,  features: ['Anniversary banner', 'Special deals listing', 'Festive badge'] },
      standard: { label: 'Standard', price: 16000, duration: 14, features: ['Homepage anniversary slot', 'Special badge + banner', 'Email blast', 'Category boost'] },
      premium:  { label: 'Premium',  price: 32000, duration: 30, features: ['All pages feature', 'Dedicated landing page', 'Full blast (SMS+Email+Push)', 'Analytics', 'Press feature'] },
    }
  },
  company_ads: {
    name: 'Company Advertisement',
    description: 'Display your company banner ad to all visitors (sidebar on desktop, popup on mobile)',
    icon: '📢',
    color: '#2563eb',
    plans: {
      basic:    { label: 'Basic',    price: 10000, duration: 7,  features: ['Sidebar ad (desktop)', 'Popup ad (mobile)', 'Up to 500 impressions/day'] },
      standard: { label: 'Standard', price: 22000, duration: 14, features: ['Priority sidebar placement', 'Styled popup (mobile)', 'Up to 2000 impressions/day', 'Click tracking'] },
      premium:  { label: 'Premium',  price: 45000, duration: 30, features: ['Top sidebar slot', 'Full-screen popup (mobile)', 'Unlimited impressions', 'Full analytics', 'A/B test support'] },
    }
  }
};