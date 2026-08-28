import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { EmptyState } from '../components/common/SharedUI';

const FREE_SHIPPING_THRESHOLD = 1499;
const SHIPPING_FLAT_RATE = 99;

const Cart = () => {
  const { cart, updateItem, removeItem, subtotal, loading } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const items = cart.items || [];
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_FLAT_RATE;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shipping + tax;

  if (!isAuthenticated) {
    return (
      <div className="section-padding">
        <EmptyState
          icon="🛍️"
          title="Log in to view your cart"
          description="Please log in to see items you've added to your cart."
          action={<Link to="/login" className="btn-primary">Log In</Link>}
        />
      </div>
    );
  }

  return (
    <>
      <Helmet><title>Your Cart | Crochet Nest</title></Helmet>

      <div className="section-padding">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl mb-10">Your Cart</h1>

          {!loading && items.length === 0 ? (
            <EmptyState
              icon="🧶"
              title="Your cart is feeling a little empty"
              description="Explore our handmade collection and find something you'll love."
              action={<Link to="/shop" className="btn-primary">Start Shopping</Link>}
            />
          ) : (
            <div className="grid lg:grid-cols-[1fr_360px] gap-10">
              <div className="space-y-4">
                <AnimatePresence>
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="card-cozy p-4 flex gap-4 items-center overflow-hidden"
                    >
                      <Link to={`/product/${item.product?.slug}`} className="w-20 h-20 rounded-xl overflow-hidden bg-cream-deep flex-shrink-0">
                        {item.product?.images?.[0]?.url ? (
                          <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">🧶</div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.product?.slug}`} className="font-label font-medium text-brown-deep hover:text-rose transition-colors line-clamp-1">
                          {item.product?.name}
                        </Link>
                        {(item.variant?.color || item.variant?.size) && (
                          <p className="text-xs text-brown-light mt-0.5">
                            {[item.variant.color, item.variant.size].filter(Boolean).join(' / ')}
                          </p>
                        )}
                        <p className="font-label font-semibold text-brown-deep mt-1">₹{item.product?.price?.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex items-center border border-beige-dark rounded-full">
                        <button onClick={() => updateItem(item._id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-brown-deep">−</button>
                        <span className="w-8 text-center text-sm font-label font-medium">{item.quantity}</span>
                        <button onClick={() => updateItem(item._id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-brown-deep">+</button>
                      </div>
                      <button onClick={() => removeItem(item._id)} className="text-brown-light hover:text-blush transition-colors p-2">
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              <div className="card-cozy p-6 h-fit sticky top-24">
                <h2 className="font-label font-semibold text-lg text-brown-deep mb-5">Order Summary</h2>
                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-light">Subtotal</span>
                    <span className="text-brown-deep font-medium">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-light">Shipping</span>
                    <span className="text-brown-deep font-medium">{shipping === 0 ? 'Free' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brown-light">Tax (5%)</span>
                    <span className="text-brown-deep font-medium">₹{tax.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div className="flex justify-between font-label font-semibold text-lg text-brown-deep border-t border-beige pt-4 mb-6">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
                <button onClick={() => navigate('/checkout')} className="btn-primary w-full justify-center">
                  Proceed to Checkout <ArrowRight size={16} />
                </button>
                {subtotal < FREE_SHIPPING_THRESHOLD && subtotal > 0 && (
                  <p className="text-xs text-brown-light text-center mt-3">
                    Add ₹{(FREE_SHIPPING_THRESHOLD - subtotal).toLocaleString('en-IN')} more for free shipping!
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Cart;
