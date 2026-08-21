import { useState, useEffect } from 'react';
import api from "../../config/api";

export default function AdminLoyaltySettings() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/api/loyalty/admin/settings')
      .then(({ data }) => setEnabled(!!data.allowLoyaltyUsage))
      .catch(() => setError('Could not load settings.'))
      .finally(() => setLoading(false));
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    setSaving(true);
    setError('');
    // Optimistic update
    setEnabled(next);
    try {
      await api.put('/api/loyalty/admin/settings/toggle', { enabled: next });
    } catch (err) {
      setEnabled(!next); // revert on failure
      setError(err.response?.data?.message || 'Could not update setting.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="max-w-lg space-y-4">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-bold text-gray-700 mb-1">Allow Loyalty Point Redemption</h2>
            <p className="text-sm text-gray-500">
              When on, eligible users can redeem loyalty points at checkout to reduce their order total.
              When off, the option is hidden from every user regardless of their individual setting.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggle}
            disabled={saving}
            aria-pressed={enabled}
            aria-label="Allow loyalty point redemption store-wide"
            className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
              enabled ? 'bg-[#8B1E3F]' : 'bg-gray-300'
            } ${saving ? 'opacity-60' : 'cursor-pointer'}`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <p className="text-xs text-gray-400 mt-3">
          Status: <span className={`font-semibold ${enabled ? 'text-green-700' : 'text-gray-500'}`}>
            {enabled ? 'Enabled store-wide' : 'Disabled store-wide'}
          </span>
        </p>

        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
}