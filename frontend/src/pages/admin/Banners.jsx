import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X, MousePointerClick, Eye } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader } from '../../components/admin/AdminUI';
import { ConfirmDialog, EmptyState } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const emptyForm = {
  title: '', subtitle: '', redirectUrl: '', buttonText: 'Shop Now', displayOrder: 0,
  isActive: true, startDate: '', endDate: '', placement: 'hero',
};

const Banners = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-banners'], queryFn: adminService.getBanners });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const banners = data?.banners || [];

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (b) => {
    setForm({
      title: b.title, subtitle: b.subtitle || '', redirectUrl: b.redirectUrl || '', buttonText: b.buttonText,
      displayOrder: b.displayOrder, isActive: b.isActive, placement: b.placement,
      startDate: b.startDate ? b.startDate.slice(0, 10) : '', endDate: b.endDate ? b.endDate.slice(0, 10) : '',
    });
    setEditingId(b._id);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingId && !imageFile) {
      toast.error('Please upload a banner image.');
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await adminService.updateBanner(editingId, formData);
        toast.success('Banner updated.');
      } else {
        await adminService.createBanner(formData);
        toast.success('Banner created.');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
      setShowForm(false);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save banner.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteBanner(deleteId);
      toast.success('Banner deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not delete banner.');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Banners"
        subtitle="Manage homepage slider banners, schedules, and redirects."
        action={<button onClick={openNew} className="btn-primary text-sm py-2.5 px-4"><Plus size={16} /> Add Banner</button>}
      />

      {banners.length === 0 ? (
        <EmptyState icon="🖼️" title="No banners yet" description="Create a banner to feature on your homepage slider." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {banners.map((b) => (
            <div key={b._id} className="bg-white rounded-cozy shadow-soft border border-beige/60 overflow-hidden">
              <div className="aspect-video bg-cream-deep relative">
                <img src={b.image?.url} alt={b.title} className="w-full h-full object-cover" />
                <span className={`absolute top-3 left-3 text-[10px] font-medium px-2.5 py-1 rounded-full ${b.isActive ? 'bg-green-500 text-white' : 'bg-gray-500 text-white'}`}>
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="p-4">
                <p className="font-label font-medium text-brown-deep line-clamp-1">{b.title}</p>
                <p className="text-xs text-brown-light mb-3 capitalize">{b.placement} placement</p>
                <div className="flex items-center gap-4 text-xs text-brown-light mb-3">
                  <span className="flex items-center gap-1"><Eye size={13} /> {b.impressionCount || 0}</span>
                  <span className="flex items-center gap-1"><MousePointerClick size={13} /> {b.clickCount || 0}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(b)} className="flex-1 btn-outline text-sm py-2 justify-center"><Pencil size={13} /> Edit</button>
                  <button onClick={() => setDeleteId(b._id)} className="p-2 rounded-full hover:bg-red-50 text-blush"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 overflow-y-auto py-8" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-cozy shadow-lift max-w-lg w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-label font-semibold text-lg text-brown-deep">{editingId ? 'Edit Banner' : 'New Banner'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className="input-cozy" />
              <input placeholder="Subtitle" value={form.subtitle} onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))} className="input-cozy" />
              <div className="grid grid-cols-2 gap-3">
                <input placeholder="Redirect URL (e.g. /shop)" value={form.redirectUrl} onChange={(e) => setForm((f) => ({ ...f, redirectUrl: e.target.value }))} className="input-cozy" />
                <input placeholder="Button Text" value={form.buttonText} onChange={(e) => setForm((f) => ({ ...f, buttonText: e.target.value }))} className="input-cozy" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select value={form.placement} onChange={(e) => setForm((f) => ({ ...f, placement: e.target.value }))} className="input-cozy">
                  <option value="hero">Hero</option>
                  <option value="promo">Promo</option>
                  <option value="category">Category</option>
                </select>
                <input type="number" placeholder="Display Order" value={form.displayOrder} onChange={(e) => setForm((f) => ({ ...f, displayOrder: e.target.value }))} className="input-cozy" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-brown-light">Start Date</label>
                  <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className="input-cozy" />
                </div>
                <div>
                  <label className="text-xs text-brown-light">End Date</label>
                  <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className="input-cozy" />
                </div>
              </div>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} className="text-sm" />
              <label className="flex items-center gap-2 text-sm text-brown-deep">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.checked }))} className="accent-rose" />
                Active
              </label>
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Update Banner' : 'Create Banner'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this banner?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Banners;
