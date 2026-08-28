import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader } from '../../components/admin/AdminUI';
import { ConfirmDialog, EmptyState } from '../../components/common/SharedUI';
import PageLoader from '../../components/common/PageLoader';

const emptyForm = { name: '', description: '', parent: '', displayOrder: 0 };

const Categories = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ['admin-categories'], queryFn: adminService.getCategories });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const categories = data?.categories || [];
  const topLevel = categories.filter((c) => !c.parent);

  const openNew = (parentId = '') => {
    setForm({ ...emptyForm, parent: parentId });
    setEditingId(null);
    setImageFile(null);
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, description: cat.description || '', parent: cat.parent?._id || cat.parent || '', displayOrder: cat.displayOrder });
    setEditingId(cat._id);
    setImageFile(null);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (imageFile) formData.append('image', imageFile);

      if (editingId) {
        await adminService.updateCategory(editingId, formData);
        toast.success('Category updated.');
      } else {
        await adminService.createCategory(formData);
        toast.success('Category created.');
      }
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowForm(false);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await adminService.deleteCategory(deleteId);
      toast.success('Category deleted.');
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not delete category.');
    } finally {
      setDeleteId(null);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        subtitle="Organize your products into categories and subcategories."
        action={<button onClick={() => openNew()} className="btn-primary text-sm py-2.5 px-4"><Plus size={16} /> Add Category</button>}
      />

      {topLevel.length === 0 ? (
        <EmptyState icon="🗂️" title="No categories yet" description="Create your first category to organize products." />
      ) : (
        <div className="space-y-4">
          {topLevel.map((cat) => (
            <div key={cat._id} className="bg-white rounded-cozy shadow-soft border border-beige/60 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-cream-deep flex-shrink-0">
                    {cat.image?.url ? <img src={cat.image.url} alt={cat.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center">🧶</div>}
                  </div>
                  <div>
                    <p className="font-label font-medium text-brown-deep">{cat.name}</p>
                    <p className="text-xs text-brown-light">{cat.description}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openNew(cat._id)} className="text-xs text-rose-dark font-medium flex items-center gap-1"><Plus size={12} /> Subcategory</button>
                  <button onClick={() => openEdit(cat)} className="p-2 rounded-lg hover:bg-beige/50 text-brown-deep"><Pencil size={14} /></button>
                  <button onClick={() => setDeleteId(cat._id)} className="p-2 rounded-lg hover:bg-red-50 text-blush"><Trash2 size={14} /></button>
                </div>
              </div>

              {cat.subcategories?.length > 0 && (
                <div className="mt-4 ml-6 pl-4 border-l-2 border-beige space-y-2">
                  {cat.subcategories.map((sub) => (
                    <div key={sub._id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-brown-deep">{sub.name}</span>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(sub)} className="p-1.5 rounded-lg hover:bg-beige/50 text-brown-deep"><Pencil size={13} /></button>
                        <button onClick={() => setDeleteId(sub._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-blush"><Trash2 size={13} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-cozy shadow-lift max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-label font-semibold text-lg text-brown-deep">{editingId ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required placeholder="Category Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-cozy" />
              <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-cozy resize-none" />
              <select value={form.parent} onChange={(e) => setForm((f) => ({ ...f, parent: e.target.value }))} className="input-cozy">
                <option value="">No Parent (Top Level)</option>
                {topLevel.filter((c) => c._id !== editingId).map((c) => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0])} className="text-sm" />
              <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
                {saving ? 'Saving…' : editingId ? 'Update Category' : 'Create Category'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this category?"
        message="Categories with products or subcategories cannot be deleted."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Categories;
