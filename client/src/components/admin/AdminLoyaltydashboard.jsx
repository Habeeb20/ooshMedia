import { useState } from 'react';
import AdminLoyaltyOverview from './LoyaltyOverview';
import AdminSellerLoyaltyOwed from './SellerLoyaltyOwned';
import AdminLoyaltyRedemptions from './LoyaltyRedemption';
import AdminLoyaltySettings from './LoyaltySettings';


const TABS = [
  { id: 'settings', label: 'Settings' },
  { id: 'overview', label: 'User Points' },
  { id: 'redemptions', label: 'Redemptions' },
  { id: 'owed', label: 'Seller Payouts Owed' },
];

export default function AdminLoyaltyDashboard() {
  const [tab, setTab] = useState('settings');

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Loyalty Program</h1>
      <p className="text-sm text-gray-500 mb-6">Manage redemption access and track point activity across the platform.</p>

      <div className="flex gap-2 mb-6 overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-colors ${
              tab === t.id
                ? 'bg-[#8B1E3F] text-white'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'settings' && <AdminLoyaltySettings />}
      {tab === 'overview' && <AdminLoyaltyOverview />}
      {tab === 'redemptions' && <AdminLoyaltyRedemptions />}
      {tab === 'owed' && <AdminSellerLoyaltyOwed />}
    </div>
  );
}