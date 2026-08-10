// pages/BlacklistedSellers.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { ShieldAlert, Loader2, MapPin } from "lucide-react";

export default function BlacklistedSellers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/blacklist/public`)
      .then(({ data }) => setUsers(data.users || []))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-[#f5f5f7] min-h-screen py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center">
            <ShieldAlert className="text-red-500" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900">Blacklisted Sellers</h1>
            <p className="text-gray-500">Accounts suspended for policy violations</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin" /></div>
        ) : users.length === 0 ? (
          <p className="text-gray-500 text-center py-16">No blacklisted sellers at this time.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {users.map((u) => (
              <div key={u._id} className="bg-white border border-red-100 rounded-2xl p-5">
                <div className="flex items-start gap-4">
                  <img
                    src={u.profilePicture || "https://ui-avatars.com/api/?name=Seller"}
                    className="w-14 h-14 rounded-2xl object-cover"
                    alt=""
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{u.businessProfile?.businessName || u.username}</p>
                    <p className="text-sm text-gray-400">@{u.username}</p>
                    {(u.state || u.lga) && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                        <MapPin size={12} /> {u.state}, {u.lga}
                      </p>
                    )}
                  </div>
                </div>
                <div className="mt-4 bg-red-50 rounded-xl p-3">
                  <p className="text-xs text-red-500 font-semibold uppercase">Reason</p>
                  <p className="text-sm text-red-700 mt-1">{u.blacklist?.reason}</p>
                  <p className="text-xs text-red-400 mt-2">
                    Blacklisted {new Date(u.blacklist?.blacklistedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}