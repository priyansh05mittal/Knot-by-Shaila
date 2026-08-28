import React, { memo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, ShoppingBag, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { userService } from '../../services/userService';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();

  const handleWishlist = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.error('Please log in to save items to your wishlist.');
        return;
      }
      try {
        const { inWishlist } = await userService.toggleWishlist(product._id);
        toast.success(inWishlist ? 'Added to wishlist 💕' : 'Removed from wishlist');
      } catch (err) {
        toast.error(err.friendlyMessage || 'Something went wrong.');
      }
    },
    [isAuthenticated, product._id]
  );

  const handleQuickAdd = useCallback(
    async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        toast.error('Please log in to add items to your cart.');
        return;
      }
      try {
        await addToCart(product._id, 1);
      } catch {
        /* toast already handled in context */
      }
    },
    [isAuthenticated, addToCart, product._id]
  );

  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
      className="group"
    >
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative rounded-cozy overflow-hidden bg-cream-deep aspect-[4/5] mb-3">
          {product.images?.[0]?.url ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl">🧶</div>
          )}

          {discount > 0 && (
            <span className="absolute top-3 left-3 bg-rose text-white text-xs font-label font-semibold px-2.5 py-1 rounded-full">
              -{discount}%
            </span>
          )}
          {product.isHandmade && (
            <span className="absolute top-3 right-3 bg-white/90 text-brown-deep text-[10px] font-label font-semibold px-2 py-1 rounded-full">
              Handmade
            </span>
          )}

          <div className="absolute inset-x-0 bottom-0 p-3 flex items-center justify-between translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={handleWishlist}
              className="w-10 h-10 rounded-full bg-white shadow-lift flex items-center justify-center hover:bg-rose hover:text-white transition-colors"
              aria-label="Add to wishlist"
            >
              <Heart size={16} />
            </button>
            <button
              onClick={handleQuickAdd}
              disabled={product.stock === 0}
              className="flex-1 mx-2 h-10 rounded-full bg-brown-deep text-white text-sm font-label font-medium flex items-center justify-center gap-2 hover:bg-rose transition-colors disabled:opacity-50"
            >
              <ShoppingBag size={15} />
              {product.stock === 0 ? 'Sold Out' : 'Quick Add'}
            </button>
          </div>
        </div>

        <h3 className="font-label font-medium text-brown-deep text-sm leading-snug line-clamp-1 group-hover:text-rose transition-colors">
          {product.name}
        </h3>
        <div className="flex items-center gap-1 mt-1">
          <Star size={12} className="fill-rose text-rose" />
          <span className="text-xs text-brown-light">
            {product.ratingsAverage?.toFixed(1) || 'New'} {product.ratingsCount ? `(${product.ratingsCount})` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-label font-semibold text-brown-deep">₹{product.price?.toLocaleString('en-IN')}</span>
          {product.compareAtPrice > product.price && (
            <span className="text-xs text-brown-light/60 line-through">₹{product.compareAtPrice?.toLocaleString('en-IN')}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

export default memo(ProductCard);
