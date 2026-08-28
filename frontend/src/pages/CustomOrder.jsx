import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { UploadCloud, X, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { customOrderService } from '../services/userService';

const emptyForm = {
  fullName: '', email: '', phoneNumber: '', productType: '', description: '',
  colorPreferences: '', size: '', budgetMin: '', budgetMax: '', deadline: '',
};

const CustomOrder = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ ...emptyForm, fullName: user?.fullName || '', email: user?.email || '', phoneNumber: user?.contactNumber || '' });
  const [files, setFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const fileInputRef = useRef();

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []).slice(0, 6 - files.length);
    setFiles((prev) => [...prev, ...selected].slice(0, 6));
  };

  const removeFile = (idx) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('phoneNumber', form.phoneNumber);
      formData.append('productType', form.productType);
      formData.append('description', form.description);
      formData.append('size', form.size);
      formData.append('colorPreferences', JSON.stringify(form.colorPreferences.split(',').map((s) => s.trim()).filter(Boolean)));
      formData.append('budgetRange', JSON.stringify({ min: Number(form.budgetMin) || 0, max: Number(form.budgetMax) || 0 }));
      if (form.deadline) formData.append('deadline', form.deadline);
      files.forEach((file) => formData.append('referenceImages', file));

      await customOrderService.create(formData);
      setSubmitted(true);
      toast.success('Your custom request has been submitted! 🎉');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not submit your request.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="section-padding">
        <div className="max-w-lg mx-auto text-center py-16">
          <span className="text-6xl mb-6 block">🧶✨</span>
          <h1 className="text-3xl mb-4">Request Received!</h1>
          <p className="text-brown-light mb-8">
            Thank you for sharing your vision with us. Our team will review your request and send you a
            personalized quote within 1-2 business days. You can track the status from your account.
          </p>
          <a href="/account/custom-orders" className="btn-primary">View My Requests</a>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Custom Crochet Order | Crochet Nest</title></Helmet>

      <div className="section-padding">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Sparkles className="mx-auto text-rose mb-4" size={32} />
            <span className="label-eyebrow">Made Just For You</span>
            <h1 className="text-3xl sm:text-4xl mt-2 mb-3">Request a Custom Crochet Piece</h1>
            <p className="text-brown-light max-w-xl mx-auto">
              Share your vision, inspiration photos, and preferences — we'll hand-craft it to bring your idea to life.
            </p>
          </div>

          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="card-cozy p-6 sm:p-8 space-y-5"
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <input required name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full Name" className="input-cozy" />
              <input required type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email" className="input-cozy" />
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <input required name="phoneNumber" value={form.phoneNumber} onChange={handleChange} placeholder="Phone Number" className="input-cozy" />
              <input required name="productType" value={form.productType} onChange={handleChange} placeholder="Product Type (e.g. Tote Bag, Sweater)" className="input-cozy" />
            </div>

            <textarea
              required
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe your dream piece — style, pattern, occasion, anything that helps us understand your vision…"
              rows={5}
              className="input-cozy resize-none"
            />

            <div className="grid sm:grid-cols-2 gap-4">
              <input name="colorPreferences" value={form.colorPreferences} onChange={handleChange} placeholder="Color Preferences (comma separated)" className="input-cozy" />
              <input name="size" value={form.size} onChange={handleChange} placeholder="Size (if applicable)" className="input-cozy" />
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <input type="number" min="0" name="budgetMin" value={form.budgetMin} onChange={handleChange} placeholder="Budget Min (₹)" className="input-cozy" />
              <input type="number" min="0" name="budgetMax" value={form.budgetMax} onChange={handleChange} placeholder="Budget Max (₹)" className="input-cozy" />
              <input type="date" name="deadline" value={form.deadline} onChange={handleChange} className="input-cozy" />
            </div>

            <div>
              <label className="font-label text-sm font-medium text-brown-deep mb-2 block">
                Reference Images <span className="text-brown-light font-normal">(sketches, Pinterest, inspiration — up to 6)</span>
              </label>
              <div className="flex flex-wrap gap-3">
                {files.map((file, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-beige-dark">
                    <img src={URL.createObjectURL(file)} alt={`Reference ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeFile(i)} className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center">
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {files.length < 6 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-20 h-20 rounded-xl border-2 border-dashed border-beige-dark flex flex-col items-center justify-center text-brown-light hover:border-rose hover:text-rose transition-colors"
                  >
                    <UploadCloud size={18} />
                    <span className="text-[10px] mt-1">Upload</span>
                  </button>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" multiple hidden onChange={handleFiles} />
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-50">
              {submitting ? 'Submitting…' : 'Submit Custom Request'}
            </button>
          </motion.form>
        </div>
      </div>
    </>
  );
};

export default CustomOrder;
