import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Sparkles, Truck, ShieldCheck, HeartHandshake, Palette, Quote, Send } from 'lucide-react';
import StitchDivider from '../common/StitchDivider';

export const CustomOrderPromo = () => (
  <section className="section-padding">
    <div className="max-w-7xl mx-auto">
      <div className="relative rounded-stitch overflow-hidden bg-gradient-to-br from-brown-deep to-brown p-10 sm:p-16 text-center">
        <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-rose/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-beige/10 blur-3xl" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-2xl mx-auto"
        >
          <Palette className="mx-auto text-rose mb-4" size={36} />
          <h2 className="text-white text-3xl sm:text-4xl mb-4">Dreamed up something one-of-a-kind?</h2>
          <p className="text-cream-deep/80 mb-8 leading-relaxed">
            Share your idea, a Pinterest inspo, or a sketch — our artisans will hand-crochet it into reality,
            just for you.
          </p>
          <Link to="/custom-order" className="btn-primary">
            <Sparkles size={16} /> Start Your Custom Order
          </Link>
        </motion.div>
      </div>
    </div>
  </section>
);

const perks = [
  { icon: HeartHandshake, title: '100% Handmade', desc: 'Every piece is hand-crocheted with care, never mass-produced.' },
  { icon: Truck, title: 'Careful Shipping', desc: 'Padded, protective packaging so your piece arrives perfect.' },
  { icon: ShieldCheck, title: 'Secure Checkout', desc: 'Encrypted payments via Razorpay, plus Cash on Delivery.' },
  { icon: Sparkles, title: 'Custom Requests', desc: 'Have a vision? We bring custom crochet designs to life.' },
];

export const WhyChooseUs = () => (
  <section className="section-padding bg-cream-deep/50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="label-eyebrow">Our Promise</span>
        <h2 className="text-3xl sm:text-4xl mt-2">Why Choose Crochet Nest</h2>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
        {perks.map((perk, i) => (
          <motion.div
            key={perk.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
            className="card-cozy p-6 text-center hover:shadow-lift hover:-translate-y-1"
          >
            <div className="w-14 h-14 rounded-full bg-rose/10 flex items-center justify-center mx-auto mb-4">
              <perk.icon className="text-rose-dark" size={24} />
            </div>
            <h3 className="font-label font-semibold text-brown-deep mb-1.5">{perk.title}</h3>
            <p className="text-sm text-brown-light leading-relaxed">{perk.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const testimonials = [
  { name: 'Ananya R.', text: 'The tote bag exceeded every expectation — the stitching is so precise and the colors are exactly as pictured. My new favorite accessory!', rating: 5 },
  { name: 'Priya M.', text: 'I ordered a custom baby blanket and the team kept me updated at every step. It arrived beautifully packaged and my daughter loves it.', rating: 5 },
  { name: 'Kavya S.', text: 'Genuinely the coziest, most well-made crochet pieces I have found online. Fast shipping too!', rating: 5 },
];

export const TestimonialSection = () => (
  <section className="section-padding">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <span className="label-eyebrow">Kind Words</span>
        <h2 className="text-3xl sm:text-4xl mt-2">Loved by Our Customers</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {testimonials.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="card-cozy p-7"
          >
            <Quote className="text-rose/40 mb-3" size={28} />
            <p className="text-brown-deep text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose/15 flex items-center justify-center font-label font-semibold text-rose-dark">
                {t.name.charAt(0)}
              </div>
              <div>
                <p className="font-label font-medium text-brown-deep text-sm">{t.name}</p>
                <p className="text-xs text-brown-light">Verified Buyer</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

const instaImages = [
  'https://images.unsplash.com/photo-1601924638867-3ec2a4e17045?w=500',
  'https://images.unsplash.com/photo-1615486511262-c7c8e0e3a20d?w=500',
  'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500',
  'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=500',
  'https://images.unsplash.com/photo-1584697964358-3e14ca57658b?w=500',
  'https://images.unsplash.com/photo-1519638399535-1b036603ac77?w=500',
];

export const InstagramGallery = () => (
  <section className="section-padding bg-cream-deep/50">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-10">
        <span className="label-eyebrow">@crochetnest</span>
        <h2 className="text-3xl sm:text-4xl mt-2">Follow Our Journey</h2>
      </div>
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
        {instaImages.map((src, i) => (
          <motion.a
            key={i}
            href="#"
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.05 }}
            className="relative aspect-square rounded-2xl overflow-hidden block"
          >
            <img src={src} alt={`Instagram post ${i + 1}`} loading="lazy" className="w-full h-full object-cover" />
          </motion.a>
        ))}
      </div>
    </div>
  </section>
);

export const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success("Welcome to the nest! Check your inbox for 10% off 🎉");
    setEmail('');
  };

  return (
    <section className="section-padding">
      <div className="max-w-3xl mx-auto text-center">
        <StitchDivider className="mb-8" />
        <h2 className="text-3xl mb-3">Join Our Cozy Newsletter</h2>
        <p className="text-brown-light mb-8">Get 10% off your first order, plus early access to new drops.</p>
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="input-cozy flex-1"
          />
          <button type="submit" className="btn-primary justify-center whitespace-nowrap">
            <Send size={16} /> Subscribe
          </button>
        </form>
      </div>
    </section>
  );
};
