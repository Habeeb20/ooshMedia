import { useState, useEffect, useMemo } from 'react';
import api from "../../config/api";

const ROLE_LABELS = {
  user: 'Buyer',
  entity: 'Entity',
  admin: 'Admin',
};

function roleTagsFor(user) {
  const tags = [];
  if (user.isRider) tags.push('Rider');
  if (user.isSeller) tags.push('Seller');
  if (user.isEmployer) tags.push('Employer');
  if (tags.length === 0) tags.push(ROLE_LABELS[user.role] || 'User');
  return tags;
}

export default function AdminLoyaltyOverview() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  const load = () => {
    setLoading(true);
    api.get('/api/loyalty/admin/overview')
      .then(({ data }) => setRows(data))
      .catch(() => setError('Could not load loyalty overview.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return rows;
    const q = search.trim().toLowerCase();
    return rows.filter(r => {
      const name = `${r.user?.firstName || ''} ${r.user?.lastName || ''} ${r.user?.username || ''}`.toLowerCase();
      return name.includes(q);
    });
  }, [rows, search]);

  const handleToggleUser = async (userId, currentlyAllowed) => {
    setTogglingId(userId);
    // Optimistic
    setRows(prev => prev.map(r =>
      r.user?._id === userId ? { ...r, user: { ...r.user, loyaltyUsageAllowed: !currentlyAllowed } } : r
    ));
    try {
      await api.put(`/api/loyalty/admin/users/${userId}/toggle`, { enabled: !currentlyAllowed });
    } catch (err) {
      // revert
      setRows(prev => prev.map(r =>
        r.user?._id === userId ? { ...r, user: { ...r.user, loyaltyUsageAllowed: currentlyAllowed } } : r
      ));
      setError(err.response?.data?.message || 'Could not update user.');
    } finally {
      setTogglingId(null);
    }
  };

  if (loading) return <div className="text-sm text-gray-500">Loading...</div>;

  return (
    <div className="space-y-4">
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or username..."
        className="w-full max-w-sm text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:border-[#8B1E3F]"
      />

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="bg-white rounded-2xl shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold text-right">Total Earned</th>
              <th className="p-4 font-semibold text-right">Used</th>
              <th className="p-4 font-semibold text-right">Available</th>
              <th className="p-4 font-semibold text-center">Can Redeem</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const u = row.user;
              if (!u) return null;
              const allowed = u.loyaltyUsageAllowed !== false;
              return (
                <tr key={u._id} className="border-b last:border-b-0">
                  <td className="p-4">
                    <p className="font-medium text-gray-800">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-1">
                      {roleTagsFor(u).map(tag => (
                        <span key={tag} className="text-xs bg-[#fdf2f5] text-[#8B1E3F] px-2 py-0.5 rounded-full font-medium">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-4 text-right">{row.totalPoints.toLocaleString()}</td>
                  <td className="p-4 text-right text-gray-500">{row.usedPoints.toLocaleString()}</td>
                  <td className="p-4 text-right font-semibold text-[#8B1E3F]">{row.availablePoints.toLocaleString()}</td>
                  <td className="p-4 text-center">
                    <button
                      type="button"
                      onClick={() => handleToggleUser(u._id, allowed)}
                      disabled={togglingId === u._id}
                      aria-pressed={allowed}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        allowed ? 'bg-[#8B1E3F]' : 'bg-gray-300'
                      } ${togglingId === u._id ? 'opacity-60' : 'cursor-pointer'}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          allowed ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}