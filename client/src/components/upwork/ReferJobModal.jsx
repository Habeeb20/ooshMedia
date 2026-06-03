import { useState, useEffect } from 'react';
import { Search, X, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function ReferJobModal({ job, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [referring, setReferring] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user/all`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      setUsers(data|| []);
    } catch (err) {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleRefer = async (userId) => {
    setReferring(userId);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/referrals/refer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          jobId: job._id,
          referredToId: userId,
          message: `Check out this job: ${job.title}`
        }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success("Job referred successfully! +10 points");
        onSuccess?.();
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch (err) {
        console.log(err)
      toast.error("Failed to refer job");
    } finally {
      setReferring(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <h2 className="text-2xl font-bold">Refer Job: {job.title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={28} />
          </button>
        </div>

        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="max-h-[500px] overflow-y-auto pr-2">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-2xl mb-2 group"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={user.profilePicture || '/default-avatar.png'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="text-sm text-gray-500 capitalize">
                      {user.role} • {user.state}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleRefer(user._id)}
                  disabled={referring === user._id}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-2xl text-sm font-medium transition"
                >
                  {referring === user._id ? "Referring..." : "Refer Job"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}