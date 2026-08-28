import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, ShoppingBag, Package, IndianRupee, Clock, Sparkles, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminService } from '../../services/adminService';
import { StatCard, AdminPageHeader } from '../../components/admin/AdminUI';

const COLORS = ['#D8A7B1', '#E8D5C4', '#C97B84', '#6B4F4F', '#8A6B6B', '#4A3B3B'];

const Dashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.getDashboardStats,
  });
  const { data: salesData } = useQuery({
    queryKey: ['admin-sales', 30],
    queryFn: () => adminService.getSalesAnalytics(30),
  });

  const stats = statsData?.stats;

  return (
    <div>
      <AdminPageHeader title="Dashboard" subtitle="A quick overview of your store's performance." />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={IndianRupee} label="Total Revenue" value={statsLoading ? '…' : `₹${(stats?.totalRevenue || 0).toLocaleString('en-IN')}`} accent="rose" />
        <StatCard icon={ShoppingBag} label="Total Orders" value={statsLoading ? '…' : stats?.totalOrders} accent="blush" />
        <StatCard icon={Package} label="Total Products" value={statsLoading ? '…' : stats?.totalProducts} accent="brown" />
        <StatCard icon={Users} label="Total Users" value={statsLoading ? '…' : stats?.totalUsers} accent="beige" />
        <StatCard icon={Clock} label="Pending Orders" value={statsLoading ? '…' : stats?.pendingOrders} accent="rose" />
        <StatCard icon={Sparkles} label="Custom Requests" value={statsLoading ? '…' : stats?.pendingCustomOrders} accent="blush" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Revenue Trend (30 days)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={salesData?.salesTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8D5C4" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d?.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #E8D5C4' }} />
              <Line type="monotone" dataKey="revenue" stroke="#D8A7B1" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Order Status</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={salesData?.orderStatusBreakdown || []}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label={({ status }) => status}
              >
                {(salesData?.orderStatusBreakdown || []).map((entry, i) => (
                  <Cell key={entry.status} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Top Selling Products</h3>
          <div className="space-y-3">
            {stats?.topSellingProducts?.map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-deep flex-shrink-0">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown-deep line-clamp-1">{p.name}</p>
                  <p className="text-xs text-brown-light">{p.soldCount} sold</p>
                </div>
                <p className="text-sm font-medium text-brown-deep">₹{p.price.toLocaleString('en-IN')}</p>
              </div>
            ))}
            {!stats?.topSellingProducts?.length && <p className="text-sm text-brown-light">No sales data yet.</p>}
          </div>
        </div>

        <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="font-label font-semibold text-brown-deep">Low Stock Alerts</h3>
          </div>
          <div className="space-y-3">
            {stats?.lowStockProducts?.map((p) => (
              <Link key={p._id} to={`/admin/products/${p._id}/edit`} className="flex items-center gap-3 hover:bg-cream-deep/40 -mx-2 px-2 py-1 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-deep flex-shrink-0">
                  {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown-deep line-clamp-1">{p.name}</p>
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">{p.stock} left</span>
              </Link>
            ))}
            {!stats?.lowStockProducts?.length && <p className="text-sm text-brown-light">All products well-stocked 🎉</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
