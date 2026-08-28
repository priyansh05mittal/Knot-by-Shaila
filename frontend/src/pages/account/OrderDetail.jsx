import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { CheckCircle2, Circle, Truck, XCircle } from 'lucide-react';
import { orderService } from '../../services/userService';
import PageLoader from '../../components/common/PageLoader';
import { ConfirmDialog } from '../../components/common/SharedUI';

const STATUS_STEPS = ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered'];

const OrderDetail = () => {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderService.getOrderById(id),
  });

  const order = data?.order;

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await orderService.cancelOrder(id, 'Customer requested cancellation');
      toast.success('Order cancelled.');
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      queryClient.invalidateQueries({ queryKey: ['my-orders'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not cancel order.');
    } finally {
      setCancelling(false);
      setConfirmCancel(false);
    }
  };

  if (isLoading) return <PageLoader />;
  if (!order) return <p className="text-brown-light">Order not found.</p>;

  const currentStepIndex = STATUS_STEPS.indexOf(order.orderStatus);
  const isCancellable = !['shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'].includes(order.orderStatus);

  return (
    <div className="space-y-6">
      <div className="card-cozy p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-label font-semibold text-lg text-brown-deep">Order #{order.orderNumber}</h2>
            <p className="text-sm text-brown-light">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
          {isCancellable && (
            <button onClick={() => setConfirmCancel(true)} className="text-sm text-blush font-label font-medium hover:underline">
              Cancel Order
            </button>
          )}
        </div>

        {order.orderStatus === 'cancelled' ? (
          <div className="flex items-center gap-2 text-blush bg-red-50 p-4 rounded-2xl">
            <XCircle size={20} /> This order was cancelled. {order.cancelReason && `Reason: ${order.cancelReason}`}
          </div>
        ) : (
          <div className="flex items-center justify-between overflow-x-auto pb-2">
            {STATUS_STEPS.map((step, i) => (
              <div key={step} className="flex-1 flex flex-col items-center min-w-[90px]">
                <div className="flex items-center w-full">
                  <div className={`flex-1 h-0.5 ${i === 0 ? 'invisible' : i <= currentStepIndex ? 'bg-rose' : 'bg-beige-dark'}`} />
                  {i <= currentStepIndex ? (
                    <CheckCircle2 size={22} className="text-rose flex-shrink-0" />
                  ) : (
                    <Circle size={22} className="text-beige-dark flex-shrink-0" />
                  )}
                  <div className={`flex-1 h-0.5 ${i === STATUS_STEPS.length - 1 ? 'invisible' : i < currentStepIndex ? 'bg-rose' : 'bg-beige-dark'}`} />
                </div>
                <p className={`text-[11px] mt-2 text-center capitalize ${i <= currentStepIndex ? 'text-brown-deep font-medium' : 'text-brown-light'}`}>
                  {step.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-6 flex items-center gap-3 p-4 rounded-2xl bg-cream-deep/60">
            <Truck size={20} className="text-rose-dark" />
            <div>
              <p className="text-sm font-label font-medium text-brown-deep">{order.courierName || 'Courier'} · {order.trackingNumber}</p>
              <p className="text-xs text-brown-light">Estimated delivery: {order.estimatedDelivery || 'Updating soon'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="card-cozy p-6">
          <h3 className="font-label font-semibold text-brown-deep mb-4">Items</h3>
          <div className="space-y-4">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-cream-deep flex-shrink-0">
                  {item.image && <img src={item.image} alt={item.name} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-brown-deep line-clamp-1">{item.name}</p>
                  <p className="text-xs text-brown-light">Qty {item.quantity} {item.variant?.color && `· ${item.variant.color}`} {item.variant?.size && `· ${item.variant.size}`}</p>
                </div>
                <p className="text-sm font-medium text-brown-deep">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-beige mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-brown-light">Subtotal</span><span>₹{order.itemsPrice.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span className="text-brown-light">Shipping</span><span>{order.shippingPrice === 0 ? 'Free' : `₹${order.shippingPrice}`}</span></div>
            <div className="flex justify-between"><span className="text-brown-light">Tax</span><span>₹{order.taxPrice.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between font-label font-semibold text-brown-deep text-base pt-2 border-t border-beige">
              <span>Total</span><span>₹{order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-cozy p-6">
            <h3 className="font-label font-semibold text-brown-deep mb-3">Shipping Address</h3>
            <p className="text-sm text-brown-deep font-medium">{order.shippingAddress.fullName}</p>
            <p className="text-sm text-brown-light">{order.shippingAddress.phone}</p>
            <p className="text-sm text-brown-light mt-1">
              {order.shippingAddress.addressLine1}, {order.shippingAddress.addressLine2 && `${order.shippingAddress.addressLine2}, `}
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
            </p>
          </div>

          <div className="card-cozy p-6">
            <h3 className="font-label font-semibold text-brown-deep mb-3">Payment</h3>
            <p className="text-sm text-brown-light">Method: <span className="text-brown-deep font-medium capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span></p>
            <p className="text-sm text-brown-light">Status: <span className="text-brown-deep font-medium capitalize">{order.paymentStatus}</span></p>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        title="Cancel this order?"
        message="This action cannot be undone. Your items will be restocked."
        confirmLabel={cancelling ? 'Cancelling…' : 'Yes, Cancel'}
        danger
        onConfirm={handleCancel}
        onCancel={() => setConfirmCancel(false)}
      />
    </div>
  );
};

export default OrderDetail;
