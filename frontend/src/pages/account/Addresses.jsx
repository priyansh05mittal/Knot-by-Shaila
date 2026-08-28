import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, MapPin, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { EmptyState, ConfirmDialog } from '../../components/common/SharedUI';

const emptyForm = {
  label: 'Home', fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: 'India', isDefault: false,
};

const Addresses = () => {
  const { user, updateUserInPlace } = useAuth();
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEdit = (addr) => {
    setForm(addr);
    setEditingId(addr._id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = editingId
        ? await userService.updateAddress(editingId, form)
        : await userService.addAddress(form);
      setAddresses(result.addresses);
      updateUserInPlace({ addresses: result.addresses });
      toast.success(editingId ? 'Address updated.' : 'Address added.');
      setShowForm(false);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save address.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const { addresses: updated } = await userService.deleteAddress(deleteId);
      setAddresses(updated);
      updateUserInPlace({ addresses: updated });
      toast.success('Address removed.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not delete address.');
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-label font-semibold text-lg text-brown-deep">Saved Addresses</h2>
        <button onClick={openNew} className="btn-primary text-sm py-2 px-4">
          <Plus size={16} /> Add Address
        </button>
      </div>

      {addresses.length === 0 && !showForm ? (
        <EmptyState icon="📍" title="No addresses saved" description="Add an address to speed up checkout." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          {addresses.map((addr) => (
            <div key={addr._id} className="card-cozy p-5 relative">
              {addr.isDefault && (
                <span className="absolute top-4 right-4 text-[10px] bg-rose/15 text-rose-dark px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                  <Check size={10} /> Default
                </span>
              )}
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={15} className="text-rose-dark" />
                <span className="font-label font-medium text-sm text-brown-deep">{addr.label}</span>
              </div>
              <p className="text-sm text-brown-deep font-medium">{addr.fullName}</p>
              <p className="text-sm text-brown-light">{addr.phone}</p>
              <p className="text-sm text-brown-light mt-1">
                {addr.addressLine1}, {addr.addressLine2 && `${addr.addressLine2}, `}{addr.city}, {addr.state} {addr.postalCode}
              </p>
              <div className="flex gap-3 mt-4">
                <button onClick={() => openEdit(addr)} className="flex items-center gap-1.5 text-xs text-brown-deep hover:text-rose">
                  <Pencil size={13} /> Edit
                </button>
                <button onClick={() => setDeleteId(addr._id)} className="flex items-center gap-1.5 text-xs text-blush hover:text-red-600">
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-cozy p-6 grid sm:grid-cols-2 gap-3">
          <input placeholder="Label (e.g. Home, Work)" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} className="input-cozy" />
          <input required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} className="input-cozy" />
          <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} className="input-cozy" />
          <input required placeholder="Address Line 1" value={form.addressLine1} onChange={(e) => setForm((f) => ({ ...f, addressLine1: e.target.value }))} className="input-cozy sm:col-span-2" />
          <input placeholder="Address Line 2" value={form.addressLine2} onChange={(e) => setForm((f) => ({ ...f, addressLine2: e.target.value }))} className="input-cozy sm:col-span-2" />
          <input required placeholder="City" value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-cozy" />
          <input required placeholder="State" value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} className="input-cozy" />
          <input required placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} className="input-cozy" />
          <input required placeholder="Country" value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} className="input-cozy" />
          <label className="flex items-center gap-2 text-sm text-brown-deep sm:col-span-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} className="accent-rose" />
            Set as default address
          </label>
          <div className="sm:col-span-2 flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-50">
              {saving ? 'Saving…' : editingId ? 'Update Address' : 'Save Address'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={!!deleteId}
        title="Delete this address?"
        message="This action cannot be undone."
        confirmLabel="Delete"
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};

export default Addresses;
