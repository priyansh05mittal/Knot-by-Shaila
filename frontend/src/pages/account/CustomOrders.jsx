import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Sparkles, Check } from 'lucide-react';
import { customOrderService } from '../../services/userService';
import { EmptyState } from '../../components/common/SharedUI';

const statusColors = {
  pending: 'bg-amber-50 text-amber-700',
  reviewing: 'bg-blue-50 text-blue-700',
  accepted: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
  in_progress: 'bg-purple-50 text-purple-700',
  ready: 'bg-indigo-50 text-indigo-700',
  shipped: 'bg-purple-50 text-purple-700',
  delivered: 'bg-green-50 text-green-700',
};

const CustomOrders = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['my-custom-orders'], queryFn: customOrderService.getMine });
  const customOrders = data?.customOrders || [];

  const handleAcceptQuote = async (id) => {
    try {
      await customOrderService.acceptQuote(id);
      toast.success('Quote accepted! Your custom order is now in progress.');
      queryClient.invalidateQueries({ queryKey: ['my-custom-orders'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not accept quote.');
    }
  };

  if (isLoading) {
    return <div className="space-y-4">{Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-32 rounded-2xl shimmer-bg animate-pulse" />)}</div>;
  }

  if (customOrders.length === 0) {
    return (
      <EmptyState
        icon="✨"
        title="No custom requests yet"
        description="Have a design in mind? Let our artisans bring it to life."
        action={<Link to="/custom-order" className="btn-primary">Request a Custom Piece</Link>}
      />
    );
  }

  return (
    <div className="space-y-4">
      {customOrders.map((req) => (
        <div key={req._id} className="card-cozy p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose/10 flex items-center justify-center flex-shrink-0">
                <Sparkles size={18} className="text-rose-dark" />
              </div>
              <div>
                <p className="font-label font-medium text-brown-deep">{req.productType}</p>
                <p className="text-xs text-brown-light">{new Date(req.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
            </div>
            <span className={`text-[10px] font-medium px-2.5 py-1 rounded-full capitalize ${statusColors[req.status] || 'bg-gray-50 text-gray-700'}`}>
              {req.status.replace(/_/g, ' ')}
            </span>
          </div>

          <p className="text-sm text-brown-light mb-3 line-clamp-2">{req.description}</p>

          {req.referenceImages?.length > 0 && (
            <div className="flex gap-2 mb-3">
              {req.referenceImages.slice(0, 4).map((img, i) => (
                <img key={i} src={img.url} alt={`Reference ${i + 1}`} className="w-14 h-14 rounded-lg object-cover" />
              ))}
            </div>
          )}

          {req.quotedPrice && !req.isQuoteAccepted && req.status !== 'rejected' && (
            <div className="flex items-center justify-between p-4 rounded-2xl bg-cream-deep/60 mt-3">
              <div>
                <p className="text-xs text-brown-light">Quoted Price</p>
                <p className="font-label font-semibold text-lg text-brown-deep">₹{req.quotedPrice.toLocaleString('en-IN')}</p>
              </div>
              <button onClick={() => handleAcceptQuote(req._id)} className="btn-primary text-sm py-2 px-4">
                <Check size={14} /> Accept Quote
              </button>
            </div>
          )}

          {req.adminNotes && (
            <div className="mt-3 p-3 rounded-xl bg-cream-deep/40 text-sm text-brown-light">
              <span className="font-medium text-brown-deep">Note from our team: </span>{req.adminNotes}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default CustomOrders;
