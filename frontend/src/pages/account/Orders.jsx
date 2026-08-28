import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { orderService } from '../../services/userService';
import { EmptyState } from '../../components/common/SharedUI';

const statusColors = {
  placed: 'bg-blue-50 text-blue-700',
  confirmed: 'bg-blue-50 text-blue-700',
  processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-purple-50 text-purple-700',
  out_for_delivery: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700',
  returned: 'bg-red-50 text-red-700',
};

const Orders = () => {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: orderService.getMyOrders });
  const orders = data?.orders || [];

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl shimmer-bg animate-pulse" />)}</div>;
  }

  if (orders.length === 0) {
    return (
      <EmptyState
        icon="📦"
        title="No orders yet"
        description="When you place an order, it will show up here."
        action={<Link to="/shop" className="btn-primary">Start Shopping</Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Link key={order._id} to={`/account/orders/${order._id}`} className="card-cozy p-5 flex items-center gap-4 hover:shadow-lift transition-shadow block">
          <div className="w-12 h-12 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
            <Package size={20} className="text-rose-dark" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-label font-medium text-brown-deep">#{order.orderNumber}</p>
            <p className="text-xs text-brown-light">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {order.items.length} item(s)</p>
          </div>
          <div className="text-right">
            <p className="font-label font-semibold text-brown-deep">₹{order.totalAmount.toLocaleString('en-IN')}</p>
            <span className={`inline-block mt-1 text-[10px] font-medium px-2.5 py-0.5 rounded-full capitalize ${statusColors[order.orderStatus] || 'bg-gray-50 text-gray-700'}`}>
              {order.orderStatus.replace(/_/g, ' ')}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Orders;
