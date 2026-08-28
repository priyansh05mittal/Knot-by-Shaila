import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Search, Grid, List, Pencil, Trash2 } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader, AdminTable } from '../../components/admin/AdminUI';
import { EmptyState, Pagination, ConfirmDialog } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const Products = () => {
  const [view, setView] = useState('list');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', search, page],
    queryFn: () => adminService.getProducts({ search, page, limit: 12 }),
  });

  const handleDelete = async () => {
    try {
      await adminService.deleteProduct(deleteId);
      toast.success('Product deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not delete product.');
    } finally {
      setDeleteId(null);
    }
  };

  const products = data?.products || [];

  return (
    <div>
      <AdminPageHeader
        title="Products"
        subtitle={`${data?.total || 0} products in your catalog`}
        action={
          <Link to="/admin/products/new" className="btn-primary text-sm py-2.5 px-4">
            <Plus size={16} /> Add Product
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brown-light" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="input-cozy pl-11"
          />
        </div>
        <div className="flex bg-white rounded-full border border-beige-dark p-1">
          <button onClick={() => setView('list')} className={`p-2 rounded-full ${view === 'list' ? 'bg-rose text-white' : 'text-brown-light'}`}><List size={16} /></button>
          <button onClick={() => setView('card')} className={`p-2 rounded-full ${view === 'card' ? 'bg-rose text-white' : 'text-brown-light'}`}><Grid size={16} /></button>
        </div>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : products.length === 0 ? (
        <EmptyState icon="📦" title="No products found" description="Add your first product to get started." action={<Link to="/admin/products/new" className="btn-primary">Add Product</Link>} />
      ) : view === 'list' ? (
        <AdminTable columns={['Product', 'Category', 'Price', 'Stock', 'Status', 'Actions']}>
          {products.map((p) => (
            <tr key={p._id} className="hover:bg-cream-deep/30 transition-colors">
              <td className="px-5 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-cream-deep flex-shrink-0">
                    {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
                  </div>
                  <span className="text-brown-deep font-medium line-clamp-1 max-w-[220px]">{p.name}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 text-brown-light">{p.category?.name}</td>
              <td className="px-5 py-3.5 text-brown-deep">₹{p.price.toLocaleString('en-IN')}</td>
              <td className="px-5 py-3.5">
                <span className={p.stock <= 5 ? 'text-amber-600 font-medium' : 'text-brown-light'}>{p.stock}</span>
              </td>
              <td className="px-5 py-3.5">
                <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${p.isActive ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'}`}>
                  {p.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td className="px-5 py-3.5">
                <div className="flex gap-2">
                  <Link to={`/admin/products/${p._id}/edit`} className="p-2 rounded-lg hover:bg-beige/50 text-brown-deep"><Pencil size={15} /></Link>
                  <button onClick={() => setDeleteId(p._id)} className="p-2 rounded-lg hover:bg-red-50 text-blush"><Trash2 size={15} /></button>
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {products.map((p) => (
            <div key={p._id} className="bg-white rounded-cozy shadow-soft border border-beige/60 overflow-hidden">
              <div className="aspect-square bg-cream-deep">
                {p.images?.[0]?.url && <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <div className="p-4">
                <p className="font-label font-medium text-brown-deep line-clamp-1">{p.name}</p>
                <p className="text-sm text-brown-light mb-2">{p.category?.name}</p>
                <div className="flex items-center justify-between">
                  <span className="font-label font-semibold text-brown-deep">₹{p.price.toLocaleString('en-IN')}</span>
                  <div className="flex gap-1.5">
                    <Link to={`/admin/products/${p._id}/edit`} className="p-1.5 rounded-lg hover:bg-beige/50 text-brown-deep"><Pencil size={14} /></Link>
                    <button onClick={() => setDeleteId(p._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-blush"><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} pages={data?.pages || 1} onChange={setPage} />

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this product?"
        message="This will permanently remove the product and its images."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Products;
