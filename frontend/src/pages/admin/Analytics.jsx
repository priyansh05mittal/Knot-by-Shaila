import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { adminService } from '../../services/adminService';
import { AdminPageHeader } from '../../components/admin/AdminUI';

const Analytics = () => {
  const [days, setDays] = useState(30);

  const { data: sales } = useQuery({ queryKey: ['analytics-sales', days], queryFn: () => adminService.getSalesAnalytics(days) });
  const { data: products } = useQuery({ queryKey: ['analytics-products'], queryFn: adminService.getProductAnalytics });
  const { data: users } = useQuery({ queryKey: ['analytics-users', days], queryFn: () => adminService.getUserAnalytics(days) });

  return (
    <div>
      <AdminPageHeader
        title="Analytics"
        subtitle="Deep dive into sales, product, and customer performance."
        action={
          <div className="flex bg-white rounded-full border border-beige-dark p-1">
            {[7, 30, 90].map((d) => (
              <button key={d} onClick={() => setDays(d)} className={`px-4 py-1.5 rounded-full text-sm ${days === d ? 'bg-rose text-white' : 'text-brown-light'}`}>
                {d}d
              </button>
            ))}
          </div>
        }
      />

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Orders Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={sales?.salesTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8D5C4' }} />
              <Line type="monotone" dataKey="orders" stroke="#6B4F4F" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">New User Growth</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={users?.userGrowth || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8D5C4' }} />
              <Line type="monotone" dataKey="newUsers" stroke="#D8A7B1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-brown-light mt-2">Conversion rate: <span className="font-medium text-brown-deep">{users?.conversionRate || 0}%</span></p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Category Performance</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products?.categoryPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8D5C4' }} />
              <Legend />
              <Bar dataKey="revenue" fill="#D8A7B1" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
              <Bar dataKey="unitsSold" fill="#E8D5C4" radius={[6, 6, 0, 0]} name="Units Sold" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Stock Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={products?.stockAnalytics || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
              <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8D5C4' }} />
              <Bar dataKey="count" fill="#6B4F4F" radius={[6, 6, 0, 0]} name="Products" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
