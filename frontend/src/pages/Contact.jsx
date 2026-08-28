import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin } from 'lucide-react';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSending(true);
    // Wire this to a real contact endpoint when available.
    setTimeout(() => {
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setForm({ name: '', email: '', message: '' });
      setSending(false);
    }, 700);
  };

  return (
    <>
      <Helmet><title>Contact Us | Crochet Nest</title></Helmet>

      <div className="section-padding">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
          <div>
            <span className="label-eyebrow">Get In Touch</span>
            <h1 className="text-3xl sm:text-4xl mt-2 mb-6">We'd Love to Hear From You</h1>
            <p className="text-brown-light mb-8 leading-relaxed">
              Questions about an order, a custom request, or just want to say hi? Reach out — we typically
              respond within 24 hours.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3"><Mail size={18} className="text-rose-dark" /> hello@crochetnest.com</div>
              <div className="flex items-center gap-3"><Phone size={18} className="text-rose-dark" /> +91 98765 43210</div>
              <div className="flex items-center gap-3"><MapPin size={18} className="text-rose-dark" /> Jaipur, Rajasthan, India</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="card-cozy p-6 sm:p-8 space-y-4">
            <input required placeholder="Your Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="input-cozy" />
            <input required type="email" placeholder="Your Email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="input-cozy" />
            <textarea required placeholder="Your message…" rows={5} value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} className="input-cozy resize-none" />
            <button type="submit" disabled={sending} className="btn-primary w-full justify-center disabled:opacity-50">
              {sending ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
