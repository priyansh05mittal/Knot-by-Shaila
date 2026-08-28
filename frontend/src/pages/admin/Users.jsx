import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Search, Ban, CheckCircle2, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader, AdminTable, StatusBadge } from '../../components/admin/AdminUI';
import { EmptyState, Pagination, ConfirmDialog } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const Users = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [blockTarget, setBlockTarget] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, page],
    queryFn: () => adminService.getUsers({ search, page, limit: 15 }),
  });

  const { data: userDetail } = useQuery({
    queryKey: ['admin-user-detail', selectedUser],
    queryFn: () => adminService.getUserById(selectedUser),
    enabled: !!selectedUser,
  });

  const users = data?.users || [];

  const handleBlock = async () => {
    const reason = window.prompt('Reason for blocking (optional):') || 'Blocked by admin';
    try {
      await adminService.blockUser(blockTarget, reason);
      toast.success('User blocked.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not block user.');
    } finally {
      setBlockTarget(null);
    }
  };

  const handleUnblock = async (id) => {
    try {
      await adminService.unblockUser(id);
      toast.success('User unblocked.');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not unblock user.');
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader title="Users" subtitle={`${data?.total || 0} registered customers`} />

      <div className="relative mb-6 max-w-md">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Search by name or email…" className="input-cozy pl-11" />
      </div>

      {users.length === 0 ? (
        <EmptyState icon="👥" title="No users found" />
      ) : (
        <AdminTable columns={['Name', 'Email', 'Phone', 'Joined', 'Status', 'Actions']}>
          {users.map((u) => (
            <tr key={u._id} className="hover:bg-cream-deep/30 transition-colors">
              <td className="px-5 py-3.5 text-brown-deep font-medium cursor-pointer" onClick={() => setSelectedUser(u._id)}>{u.fullName}</td>
              <td className="px-5 py-3.5 text-brown-light">{u.email}</td>
              <td className="px-5 py-3.5 text-brown-light">{u.contactNumber}</td>
              <td className="px-5 py-3.5 text-brown-light text-xs">{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
              <td className="px-5 py-3.5"><StatusBadge status={u.isBlocked ? 'blocked' : 'active'} /></td>
              <td className="px-5 py-3.5">
                {u.isBlocked ? (
                  <button onClick={() => handleUnblock(u._id)} className="flex items-center gap-1.5 text-xs text-green-700 hover:underline">
                    <CheckCircle2 size={13} /> Unblock
                  </button>
                ) : (
                  <button onClick={() => setBlockTarget(u._id)} className="flex items-center gap-1.5 text-xs text-blush hover:underline">
                    <Ban size={13} /> Block
                  </button>
                )}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}

      <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />

      <ConfirmDialog
        open={!!blockTarget}
        title="Block this user?"
        message="They will not be able to log in, place orders, or submit reviews."
        confirmLabel="Block User"
        danger
        onConfirm={handleBlock}
        onCancel={() => setBlockTarget(null)}
      />

      {selectedUser && userDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8" onClick={() => setSelectedUser(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-cozy shadow-lift max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-label font-semibold text-lg text-brown-deep">{userDetail.user.fullName}</h3>
              <button onClick={() => setSelectedUser(null)}><X size={20} /></button>
            </div>
            <p className="text-sm text-brown-light mb-1">{userDetail.user.email}</p>
            <p className="text-sm text-brown-light mb-4">{userDetail.user.contactNumber}</p>
            <h4 className="font-label font-medium text-brown-deep mb-2">Order History ({userDetail.orders.length})</h4>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userDetail.orders.map((o) => (
                <div key={o._id} className="flex justify-between text-sm p-2 rounded-lg bg-cream-deep/40">
                  <span className="text-brown-deep">#{o.orderNumber}</span>
                  <span className="text-brown-light capitalize">{o.orderStatus}</span>
                  <span className="text-brown-deep">₹{o.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              ))}
              {userDetail.orders.length === 0 && <p className="text-sm text-brown-light">No orders yet.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
