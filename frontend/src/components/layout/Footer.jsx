import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Instagram, Facebook, Send, MapPin, Mail, Phone } from 'lucide-react';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    // Newsletter capture — wire to a real endpoint/ESP when ready.
    setTimeout(() => {
      toast.success("You're on the list! Welcome to the nest 🧶");
      setEmail('');
      setSubmitting(false);
    }, 600);
  };

  return (
    <footer className="bg-brown-deep text-cream-deep">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🧶</span>
              <span className="font-display text-xl font-semibold text-white">Crochet Nest</span>
            </div>
            <p className="text-sm text-cream-deep/70 leading-relaxed mb-5">
              Every stitch, made by hand with love. Discover cozy handmade crochet bags, tops, and gifts —
              or bring your own custom design to life.
            </p>
            <div className="flex gap-3">
              <a href="#" aria-label="Instagram" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" aria-label="Facebook" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-rose transition-colors">
                <Facebook size={18} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-label font-semibold text-white mb-4 text-sm tracking-wide uppercase">Shop</h4>
            <ul className="space-y-2.5 text-sm text-cream-deep/70">
              <li><Link to="/shop" className="hover:text-rose transition-colors">All Products</Link></li>
              <li><Link to="/shop?collection=new-arrivals" className="hover:text-rose transition-colors">New Arrivals</Link></li>
              <li><Link to="/shop?collection=best-sellers" className="hover:text-rose transition-colors">Best Sellers</Link></li>
              <li><Link to="/custom-order" className="hover:text-rose transition-colors">Custom Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-label font-semibold text-white mb-4 text-sm tracking-wide uppercase">Support</h4>
            <ul className="space-y-2.5 text-sm text-cream-deep/70">
              <li><Link to="/account/orders" className="hover:text-rose transition-colors">Track Order</Link></li>
              <li><Link to="/faq" className="hover:text-rose transition-colors">FAQs</Link></li>
              <li><Link to="/shipping-returns" className="hover:text-rose transition-colors">Shipping &amp; Returns</Link></li>
              <li><Link to="/contact" className="hover:text-rose transition-colors">Contact Us</Link></li>
            </ul>
            <ul className="space-y-2.5 text-sm text-cream-deep/70 mt-5">
              <li className="flex items-center gap-2"><Mail size={14} /> hello@crochetnest.com</li>
              <li className="flex items-center gap-2"><Phone size={14} /> +91 98765 43210</li>
              <li className="flex items-center gap-2"><MapPin size={14} /> Jaipur, Rajasthan, India</li>
            </ul>
          </div>

          <div>
            <h4 className="font-label font-semibold text-white mb-4 text-sm tracking-wide uppercase">Stay Cozy</h4>
            <p className="text-sm text-cream-deep/70 mb-4">
              Subscribe for new drops, restocks, and 10% off your first order.
            </p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 bg-white/10 border border-white/15 rounded-full px-4 py-2.5 text-sm text-white placeholder:text-cream-deep/50 focus:outline-none focus:ring-2 focus:ring-rose/50"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-10 h-10 flex-shrink-0 rounded-full bg-rose hover:bg-blush transition-colors flex items-center justify-center disabled:opacity-50"
                aria-label="Subscribe"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-cream-deep/50">
          <p>© {new Date().getFullYear()} Crochet Nest. All rights reserved.</p>
          <div className="flex gap-5">
            <Link to="/privacy-policy" className="hover:text-rose transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-rose transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
