import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import appConfig from '../../config/AppConfig';
import Loading from '../../config/Loading';

export default function SalesAnalytics() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/inventory/stats`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        const result = await res.json();
        if (result.success) setData(result.stats.monthlySales || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) return <Loading text="Loading analytics..." />;

  return (
    <div className="bg-white rounded-3xl p-8 shadow-sm">
      <h2 className="text-2xl font-semibold mb-6">Sales Overview</h2>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data.length ? data : [
          { name: 'Jan', sales: 4200000 },
          { name: 'Feb', sales: 3800000 },
          { name: 'Mar', sales: 5100000 },
          { name: 'Apr', sales: 4600000 },
          { name: 'May', sales: 5900000 },
        ]}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="sales" fill={appConfig.colors.primary} radius={8} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}