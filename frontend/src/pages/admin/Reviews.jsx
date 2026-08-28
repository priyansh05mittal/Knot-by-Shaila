import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Check, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader, StatusBadge } from '../../components/admin/AdminUI';
import { StarRating, EmptyState, Pagination } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const Reviews = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('pending');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews', page, statusFilter],
    queryFn: () => adminService.getReviews({ page, limit: 12, ...(statusFilter && { status: statusFilter }) }),
  });

  const reviews = data?.reviews || [];

  const handleApprove = async (id) => {
    try {
      await adminService.approveReview(id);
      toast.success('Review approved.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not approve review.');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection (optional):') || undefined;
    try {
      await adminService.rejectReview(id, reason);
      toast.success('Review rejected.');
      queryClient.invalidateQueries({ queryKey: ['admin-reviews'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not reject review.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader title="Reviews" subtitle="Only approved reviews are shown publicly on product pages." />

      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected'].map((s) => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(1); }} className={`px-4 py-2 rounded-full text-sm capitalize ${statusFilter === s ? 'bg-rose text-white' : 'bg-white border border-beige-dark text-brown-deep'}`}>
            {s}
          </button>
        ))}
      </div>

      {reviews.length === 0 ? (
        <EmptyState icon="⭐" title={`No ${statusFilter} reviews`} />
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review._id} className="bg-white rounded-cozy shadow-soft border border-beige/60 p-5">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-deep flex-shrink-0">
                    {review.product?.images?.[0]?.url && <img src={review.product.images[0].url} alt="" className="w-full h-full object-cover" />}
                  </div>
                  <div>
                    <p className="font-label font-medium text-brown-deep">{review.product?.name}</p>
                    <p className="text-xs text-brown-light">by {review.user?.fullName} · {review.user?.email}</p>
                  </div>
                </div>
                <StatusBadge status={review.status} />
              </div>

              <StarRating rating={review.rating} size={15} />
              {review.title && <p className="font-label font-medium text-brown-deep mt-2">{review.title}</p>}
              <p className="text-sm text-brown-light mt-1">{review.comment}</p>

              {review.images?.length > 0 && (
                <div className="flex gap-2 mt-3">
                  {review.images.map((img, i) => <img key={i} src={img.url} alt="" className="w-14 h-14 rounded-lg object-cover" />)}
                </div>
              )}

              {statusFilter === 'pending' && (
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleApprove(review._id)} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100">
                    <Check size={14} /> Approve
                  </button>
                  <button onClick={() => handleReject(review._id)} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-full bg-red-50 text-blush hover:bg-red-100">
                    <X size={14} /> Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />
    </div>
  );
};

export default Reviews;
