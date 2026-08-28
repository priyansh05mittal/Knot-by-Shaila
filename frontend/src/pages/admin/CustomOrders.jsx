import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { EmptyState, Pagination } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const STATUSES = ['pending', 'reviewing', 'accepted', 'rejected', 'in_progress', 'ready', 'shipped', 'delivered'];

const CustomOrders = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-custom-orders', page, statusFilter],
    queryFn: () => adminService.getCustomOrders({ page, limit: 12, ...(statusFilter && { status: statusFilter }) }),
  });

  const customOrders = data?.customOrders || [];

  const handleUpdate = async (id, updates) => {
    try {
      await adminService.updateCustomOrder(id, updates);
      toast.success('Custom order updated.');
      queryClient.invalidateQueries({ queryKey: ['admin-custom-orders'] });
      setSelected(null);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not update request.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader title="Custom Order Requests" subtitle={`${data?.total || 0} total requests`} />

      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => { setStatusFilter(''); setPage(1); }} className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${!statusFilter ? 'bg-rose text-white' : 'bg-white border border-beige-dark text-brown-deep'}`}>All</button>
        {STATUSES.map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 rounded-full text-sm capitalize whitespace-nowrap ${statusFilter === s ? 'bg-rose text-white' : 'bg-white border border-beige-dark text-brown-deep'}`}>
            {s.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {customOrders.length === 0 ? (
        <EmptyState icon="✨" title="No custom requests found" />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {customOrders.map((req) => (
            <button key={req._id} onClick={() => setSelected(req)} className="bg-white rounded-cozy shadow-soft border border-beige/60 p-5 text-left hover:shadow-lift transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <p className="font-label font-medium text-brown-deep">{req.productType}</p>
                <StatusBadge status={req.status} />
              </div>
              <p className="text-sm text-brown-light line-clamp-2 mb-3">{req.description}</p>
              <p className="text-xs text-brown-light">{req.user?.fullName} · {new Date(req.createdAt).toLocaleDateString('en-IN')}</p>
              {req.referenceImages?.length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {req.referenceImages.slice(0, 4).map((img, i) => (
                    <img key={i} src={img.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />

      {selected && <CustomOrderModal request={selected} onClose={() => setSelected(null)} onUpdate={handleUpdate} />}
    </div>
  );
};

const CustomOrderModal = ({ request, onClose, onUpdate }) => {
  const [status, setStatus] = useState(request.status);
  const [quotedPrice, setQuotedPrice] = useState(request.quotedPrice || '');
  const [adminNotes, setAdminNotes] = useState(request.adminNotes || '');
  const [rejectionReason, setRejectionReason] = useState(request.rejectionReason || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-cozy shadow-lift max-w-lg w-full p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-label font-semibold text-lg text-brown-deep">{request.productType}</h3>
          <button onClick={onClose}><X size={20} /></button>
        </div>

        <div className="mb-4 p-4 rounded-2xl bg-cream-deep/60 text-sm space-y-1">
          <p className="text-brown-deep font-medium">{request.fullName} · {request.email} · {request.phoneNumber}</p>
          <p className="text-brown-light">{request.description}</p>
          {request.colorPreferences?.length > 0 && <p className="text-brown-light">Colors: {request.colorPreferences.join(', ')}</p>}
          {request.size && <p className="text-brown-light">Size: {request.size}</p>}
          {request.budgetRange && (request.budgetRange.min || request.budgetRange.max) && (
            <p className="text-brown-light">Budget: ₹{request.budgetRange.min} – ₹{request.budgetRange.max}</p>
          )}
        </div>

        {request.referenceImages?.length > 0 && (
          <div className="flex gap-2 mb-4 flex-wrap">
            {request.referenceImages.map((img, i) => (
              <a key={i} href={img.url} target="_blank" rel="noreferrer">
                <img src={img.url} alt="" className="w-16 h-16 rounded-lg object-cover" />
              </a>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="text-xs text-brown-light">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-cozy">
              {STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <input type="number" placeholder="Quoted Price (₹)" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} className="input-cozy" />
          <textarea placeholder="Admin notes for customer" rows={2} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} className="input-cozy resize-none" />
          {status === 'rejected' && (
            <textarea placeholder="Rejection reason" rows={2} value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} className="input-cozy resize-none" />
          )}
        </div>

        <button
          onClick={() => onUpdate(request._id, { status, quotedPrice: quotedPrice ? Number(quotedPrice) : undefined, adminNotes, rejectionReason })}
          className="btn-primary w-full justify-center mt-5"
        >
          Save Update
        </button>
      </div>
    </div>
  );
};

export default CustomOrders;
