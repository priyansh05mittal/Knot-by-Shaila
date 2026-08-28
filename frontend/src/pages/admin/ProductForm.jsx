import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, X, UploadCloud } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { AdminPageHeader } from '../../components/admin/AdminUI';
import PageLoader from '../../components/common/PageLoader';

const emptyForm = {
  name: '', description: '', shortDescription: '', category: '', price: '', compareAtPrice: '',
  stock: '', sku: '', craftingTimeInDays: 3, careInstructions: '', tags: '',
  isFeatured: false, isNewArrival: false, isBestSeller: false, isTrending: false, isActive: true, isHandmade: true,
};

const ProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const fileInputRef = useRef();

  const [form, setForm] = useState(emptyForm);
  const [attributes, setAttributes] = useState([{ key: '', value: '' }]);
  const [newFiles, setNewFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const { data: categoriesData } = useQuery({ queryKey: ['admin-categories'], queryFn: adminService.getCategories });

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products-all'],
    queryFn: () => adminService.getProducts({ limit: 1000 }),
    enabled: isEdit,
  });

  useEffect(() => {
    if (isEdit && productsData) {
      const product = productsData.products.find((p) => p._id === id);
      if (product) {
        setForm({
          name: product.name,
          description: product.description,
          shortDescription: product.shortDescription || '',
          category: product.category?._id || '',
          price: product.price,
          compareAtPrice: product.compareAtPrice || '',
          stock: product.stock,
          sku: product.sku || '',
          craftingTimeInDays: product.craftingTimeInDays,
          careInstructions: product.careInstructions || '',
          tags: (product.tags || []).join(', '),
          isFeatured: product.isFeatured,
          isNewArrival: product.isNewArrival,
          isBestSeller: product.isBestSeller,
          isTrending: product.isTrending,
          isActive: product.isActive,
          isHandmade: product.isHandmade,
        });
        setAttributes(product.attributes?.length ? product.attributes : [{ key: '', value: '' }]);
        setExistingImages(product.images || []);
      }
    }
  }, [isEdit, productsData, id]);

  const handleFiles = (e) => {
    setNewFiles((prev) => [...prev, ...Array.from(e.target.files || [])]);
  };

  const removeNewFile = (idx) => setNewFiles((prev) => prev.filter((_, i) => i !== idx));

  const removeExistingImage = async (publicId) => {
    if (!isEdit) return;
    try {
      await adminService.removeProductImage(id, publicId);
      setExistingImages((prev) => prev.filter((img) => img.publicId !== publicId));
      toast.success('Image removed.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not remove image.');
    }
  };

  const handleAttributeChange = (idx, field, value) => {
    setAttributes((prev) => prev.map((attr, i) => (i === idx ? { ...attr, [field]: value } : attr)));
  };

  const addAttributeRow = () => setAttributes((prev) => [...prev, { key: '', value: '' }]);
  const removeAttributeRow = (idx) => setAttributes((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      formData.append('tags', JSON.stringify(form.tags.split(',').map((t) => t.trim()).filter(Boolean)));
      formData.append('attributes', JSON.stringify(attributes.filter((a) => a.key && a.value)));
      newFiles.forEach((file) => formData.append('images', file));

      if (isEdit) {
        await adminService.updateProduct(id, formData);
        toast.success('Product updated successfully.');
      } else {
        await adminService.createProduct(formData);
        toast.success('Product created successfully.');
      }
      navigate('/admin/products');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not save product.');
    } finally {
      setSaving(false);
    }
  };

  if (isEdit && isLoading) return <PageLoader />;

  return (
    <div>
      <AdminPageHeader title={isEdit ? 'Edit Product' : 'Add New Product'} subtitle="Fill in the details for this handmade piece." />

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_320px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6 space-y-4">
            <h3 className="font-label font-semibold text-brown-deep">Basic Information</h3>
            <input required placeholder="Product Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-cozy" />
            <input placeholder="Short Description (for cards)" value={form.shortDescription} onChange={(e) => setForm((f) => ({ ...f, shortDescription: e.target.value }))} className="input-cozy" />
            <textarea required placeholder="Full Description" rows={5} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="input-cozy resize-none" />
            <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="input-cozy">
              <option value="">Select Category</option>
              {categoriesData?.categories?.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6 space-y-4">
            <h3 className="font-label font-semibold text-brown-deep">Pricing &amp; Inventory</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <input required type="number" min="0" placeholder="Price (₹)" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="input-cozy" />
              <input type="number" min="0" placeholder="Compare-at Price" value={form.compareAtPrice} onChange={(e) => setForm((f) => ({ ...f, compareAtPrice: e.target.value }))} className="input-cozy" />
              <input required type="number" min="0" placeholder="Stock Quantity" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className="input-cozy" />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input placeholder="SKU (optional)" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} className="input-cozy" />
              <input type="number" min="1" placeholder="Crafting Time (days)" value={form.craftingTimeInDays} onChange={(e) => setForm((f) => ({ ...f, craftingTimeInDays: e.target.value }))} className="input-cozy" />
            </div>
          </div>

          <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-label font-semibold text-brown-deep">Custom Attributes</h3>
              <button type="button" onClick={addAttributeRow} className="text-sm text-rose-dark font-medium flex items-center gap-1">
                <Plus size={14} /> Add Field
              </button>
            </div>
            <p className="text-xs text-brown-light -mt-2">
              Add any product-specific detail: material, pattern, dimensions, customization options, etc.
            </p>
            {attributes.map((attr, i) => (
              <div key={i} className="flex gap-2">
                <input placeholder="Field name (e.g. Material)" value={attr.key} onChange={(e) => handleAttributeChange(i, 'key', e.target.value)} className="input-cozy" />
                <input placeholder="Value (e.g. 100% Cotton)" value={attr.value} onChange={(e) => handleAttributeChange(i, 'value', e.target.value)} className="input-cozy" />
                <button type="button" onClick={() => removeAttributeRow(i)} className="p-3 text-brown-light hover:text-blush"><X size={16} /></button>
              </div>
            ))}
            <textarea placeholder="Care Instructions" rows={3} value={form.careInstructions} onChange={(e) => setForm((f) => ({ ...f, careInstructions: e.target.value }))} className="input-cozy resize-none" />
            <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm((f) => ({ ...f, tags: e.target.value }))} className="input-cozy" />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6">
            <h3 className="font-label font-semibold text-brown-deep mb-4">Product Images</h3>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {existingImages.map((img) => (
                <div key={img.publicId} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeExistingImage(img.publicId)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
              {newFiles.map((file, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden">
                  <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeNewFile(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                    <X size={10} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-lg border-2 border-dashed border-beige-dark flex items-center justify-center text-brown-light hover:border-rose hover:text-rose">
                <UploadCloud size={20} />
              </button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            <p className="text-xs text-brown-light">Up to 8 images. First image is the primary display image.</p>
          </div>

          <div className="bg-white rounded-cozy shadow-soft border border-beige/60 p-6 space-y-3">
            <h3 className="font-label font-semibold text-brown-deep mb-2">Visibility &amp; Tags</h3>
            {[
              { key: 'isActive', label: 'Active (visible on storefront)' },
              { key: 'isHandmade', label: 'Handmade Badge' },
              { key: 'isFeatured', label: 'Featured Collection' },
              { key: 'isNewArrival', label: 'New Arrival' },
              { key: 'isBestSeller', label: 'Best Seller' },
              { key: 'isTrending', label: 'Trending' },
            ].map((opt) => (
              <label key={opt.key} className="flex items-center gap-2.5 text-sm text-brown-deep cursor-pointer">
                <input type="checkbox" checked={form[opt.key]} onChange={(e) => setForm((f) => ({ ...f, [opt.key]: e.target.checked }))} className="accent-rose rounded" />
                {opt.label}
              </label>
            ))}
          </div>

          <button type="submit" disabled={saving} className="btn-primary w-full justify-center disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
