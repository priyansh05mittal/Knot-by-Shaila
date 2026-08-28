import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader, AdminTable, StatusBadge } from '../../components/admin/AdminUI';
import { EmptyState, Pagination } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const ORDER_STATUSES = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

const orderStatusColors = {
  placed: 'bg-blue-50 text-blue-700', confirmed: 'bg-blue-50 text-blue-700', processing: 'bg-amber-50 text-amber-700',
  shipped: 'bg-purple-50 text-purple-700', out_for_delivery: 'bg-purple-50 text-purple-700', delivered: 'bg-green-50 text-green-700',
  cancelled: 'bg-red-50 text-red-700', returned: 'bg-red-50 text-red-700',
};

const Orders = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, statusFilter],
    queryFn: () => adminService.getOrders({ page, limit: 15, ...(statusFilter && { orderStatus: statusFilter }) }),
  });

  const orders = data?.orders || [];

  const handleUpdate = async (id, updates) => {
    try {
      await adminService.updateOrderStatus(id, updates);
      toast.success('Order updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      setSelectedOrder(null);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not update order.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader title="Orders" subtitle={`${data?.total || 0} total orders`} />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${!statusFilter ? 'bg-rose text-white' : 'bg-white border border-beige-dark text-brown-deep'}`}>All</button>
        {ORDER_STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 rounded-full text-sm capitalize whitespace-nowrap ${statusFilter === s ? 'bg-rose text-white' : 'bg-white border border-beige-dark text-brown-deep'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" />
      ) : (
        <AdminTable columns={['Order #', 'Customer', 'Items', 'Total', 'Payment', 'Status', 'Date', '']}>
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-cream-deep/30 transition-colors cursor-pointer" onClick={() => setSelectedOrder(order)}>
              <td className="px-5 py-3.5 text-brown-deep font-medium">#{order.orderNumber}</td>
              <td className="px-5 py-3.5 text-brown-light">{order.user?.fullName}</td>
              <td className="px-5 py-3.5 text-brown-light">{order.items.length}</td>
              <td className="px-5 py-3.5 text-brown-deep">₹{order.totalAmount.toLocaleString('en-IN')}</td>
              <td className="px-5 py-3.5"><StatusBadge status={order.paymentStatus} /></td>
              <td className="px-5 py-3.5"><span className={`inline-block text-[11px] font-medium px-2.5 py-1 rounded-full capitalize ${orderStatusColors[order.orderStatus]}`}>{order.orderStatus.replace(/_/g, ' ')}</span></td>
              <td className="px-5 py-3.5 text-brown-light text-xs">{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="px-5 py-3.5 text-rose-dark text-sm font-medium">Manage</td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />

      {selectedOrder && (
        <OrderManageModal order={selectedOrder} onClose={() => setSelectedOrder(null)} onUpdate={handleUpdate} />
      )}
    </div>
  );
};

const OrderManageModal = ({ order, onClose, onUpdate }) => {
  const [orderStatus, setOrderStatus] = useState(order.orderStatus);
  const [paymentStatus, setPaymentStatus] = useState(order.paymentStatus);
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || '');
  const [courierName, setCourierName] = useState(order.courierName || '');
  const [note, setNote] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-cozy shadow-lift max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-label font-semibold text-lg text-brown-deep">Order #{order.orderNumber}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="mb-4 p-4 rounded-2xl bg-cream-deep/60 text-sm">
          <p className="text-brown-deep font-medium">{order.user?.fullName} · {order.user?.email}</p>
          <p className="text-brown-light mt-1">{order.items.length} item(s) · ₹{order.totalAmount.toLocaleString('en-IN')}</p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs text-brown-light">Order Status</label>
            <select value={orderStatus} onChange={(e) => setOrderStatus(e.target.value)} className="input-cozy">
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-brown-light">Payment Status</label>
            <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)} className="input-cozy">
              {['pending', 'paid', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Tracking Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input-cozy" />
            <input placeholder="Courier Name" value={courierName} onChange={(e) => setCourierName(e.target.value)} className="input-cozy" />
          </div>
          <textarea placeholder="Add a note (optional)" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className="input-cozy resize-none" />
        </div>

        <button
          onClick={() => onUpdate(order._id, { orderStatus, paymentStatus, trackingNumber, courierName, note })}
          className="btn-primary w-full justify-center mt-5"
        >
          Update Order
        </button>
      </div>
    </div>
  );
};

export default Orders;
