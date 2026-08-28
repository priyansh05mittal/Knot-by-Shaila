import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { Heart, ShoppingBag, Truck, ShieldCheck, Clock, Star, ChevronRight } from 'lucide-react';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import ProductCard from '../components/common/ProductCard';
import { StarRating } from '../components/common/SharedUI';
import PageLoader from '../components/common/PageLoader';
import NotFound from './NotFound';

const ProductDetail = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();

  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState({});
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug),
  });

  const product = data?.product;
  const relatedProducts = data?.relatedProducts || [];

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: ['reviews', product?._id],
    queryFn: () => productService.getReviews(product._id),
    enabled: !!product?._id,
  });

  useEffect(() => {
    setActiveImage(0);
    setQuantity(1);
  }, [slug]);

  useEffect(() => {
    if (product?._id && isAuthenticated) {
      userService.trackRecentlyViewed(product._id).catch(() => {});
    }
  }, [product?._id, isAuthenticated]);

  const colors = useMemo(
    () => [...new Set(product?.variants?.map((v) => v.color).filter(Boolean))],
    [product]
  );
  const sizes = useMemo(
    () => [...new Set(product?.variants?.map((v) => v.size).filter(Boolean))],
    [product]
  );

  if (isLoading) return <PageLoader />;
  if (isError || !product) return <NotFound />;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      return;
    }
    try {
      await addToCart(product._id, quantity, selectedVariant);
    } catch {
      /* handled in context */
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please log in to save items to your wishlist.');
      return;
    }
    const { inWishlist } = await userService.toggleWishlist(product._id);
    toast.success(inWishlist ? 'Added to wishlist 💕' : 'Removed from wishlist');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please log in to leave a review.');
      return;
    }
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append('rating', reviewForm.rating);
      formData.append('title', reviewForm.title);
      formData.append('comment', reviewForm.comment);
      await productService.submitReview(product._id, formData);
      toast.success('Thank you! Your review is pending approval.');
      setReviewForm({ rating: 5, title: '', comment: '' });
      refetchReviews();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Could not submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviews = reviewsData?.reviews || [];

  return (
    <>
      <Helmet>
        <title>{product.seo?.metaTitle || `${product.name} | Crochet Nest`}</title>
        <meta name="description" content={product.seo?.metaDescription || product.shortDescription || product.description?.slice(0, 155)} />
      </Helmet>

      <div className="section-padding pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-sm text-brown-light mb-8">
            <Link to="/" className="hover:text-rose">Home</Link>
            <ChevronRight size={14} />
            <Link to="/shop" className="hover:text-rose">Shop</Link>
            <ChevronRight size={14} />
            <span className="text-brown-deep line-clamp-1">{product.name}</span>
          </div>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-20">
            {/* Gallery */}
            <div>
              <div className="rounded-cozy overflow-hidden bg-cream-deep aspect-square mb-4">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImage}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    src={product.images?.[activeImage]?.url}
                    alt={product.images?.[activeImage]?.alt || product.name}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                        activeImage === i ? 'border-rose' : 'border-transparent'
                      }`}
                    >
                      <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <span className="label-eyebrow">{product.category?.name}</span>
              <h1 className="text-3xl sm:text-4xl mt-2 mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-5">
                <StarRating rating={Math.round(product.ratingsAverage)} size={18} />
                <span className="text-sm text-brown-light">
                  {product.ratingsAverage?.toFixed(1)} ({product.ratingsCount} reviews) · {product.soldCount} sold
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-label font-semibold text-brown-deep">₹{product.price?.toLocaleString('en-IN')}</span>
                {product.compareAtPrice > product.price && (
                  <span className="text-lg text-brown-light/60 line-through">₹{product.compareAtPrice?.toLocaleString('en-IN')}</span>
                )}
              </div>

              <p className="text-brown-light leading-relaxed mb-6">{product.shortDescription || product.description?.slice(0, 200)}</p>

              {colors.length > 0 && (
                <div className="mb-5">
                  <p className="font-label text-sm font-medium text-brown-deep mb-2">Color</p>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setSelectedVariant((v) => ({ ...v, color: c }))}
                        className={`px-4 py-2 rounded-full text-sm font-label border transition-colors ${
                          selectedVariant.color === c ? 'border-rose bg-rose/10 text-rose-dark' : 'border-beige-dark text-brown-deep hover:border-rose'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {sizes.length > 0 && (
                <div className="mb-6">
                  <p className="font-label text-sm font-medium text-brown-deep mb-2">Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {sizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedVariant((v) => ({ ...v, size: s }))}
                        className={`px-4 py-2 rounded-full text-sm font-label border transition-colors ${
                          selectedVariant.size === s ? 'border-rose bg-rose/10 text-rose-dark' : 'border-beige-dark text-brown-deep hover:border-rose'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center border border-beige-dark rounded-full">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-brown-deep">−</button>
                  <span className="w-10 text-center font-label font-medium">{quantity}</span>
                  <button onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-brown-deep">+</button>
                </div>
                <span className="text-sm text-brown-light">
                  {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                </span>
              </div>

              <div className="flex gap-3 mb-8">
                <button onClick={handleAddToCart} disabled={product.stock === 0} className="btn-primary flex-1 justify-center disabled:opacity-50">
                  <ShoppingBag size={18} /> Add to Cart
                </button>
                <button onClick={handleWishlist} className="w-14 h-14 flex-shrink-0 rounded-full border border-beige-dark flex items-center justify-center hover:border-rose hover:text-rose transition-colors">
                  <Heart size={20} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-8">
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-cream-deep/60">
                  <Truck size={20} className="text-rose-dark mb-1.5" />
                  <span className="text-xs text-brown-light">Free shipping over ₹1499</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-cream-deep/60">
                  <Clock size={20} className="text-rose-dark mb-1.5" />
                  <span className="text-xs text-brown-light">{product.craftingTimeInDays} day crafting time</span>
                </div>
                <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-cream-deep/60">
                  <ShieldCheck size={20} className="text-rose-dark mb-1.5" />
                  <span className="text-xs text-brown-light">Secure checkout</span>
                </div>
              </div>

              {product.attributes?.length > 0 && (
                <div className="border-t border-beige pt-6">
                  <h3 className="font-label font-semibold text-brown-deep mb-3">Product Details</h3>
                  <dl className="space-y-2">
                    {product.attributes.map((attr) => (
                      <div key={attr.key} className="flex justify-between text-sm">
                        <dt className="text-brown-light">{attr.key}</dt>
                        <dd className="text-brown-deep font-medium">{attr.value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </div>

          {/* Full description */}
          <div className="max-w-3xl mb-20">
            <h2 className="text-2xl mb-4">About This Piece</h2>
            <p className="text-brown-light leading-relaxed whitespace-pre-line">{product.description}</p>
            {product.careInstructions && (
              <div className="mt-6 p-5 rounded-2xl bg-cream-deep/60">
                <h4 className="font-label font-semibold text-brown-deep mb-1.5">Care Instructions</h4>
                <p className="text-sm text-brown-light">{product.careInstructions}</p>
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="max-w-3xl mb-20">
            <h2 className="text-2xl mb-6">Customer Reviews ({reviews.length})</h2>

            {reviews.length === 0 ? (
              <p className="text-brown-light mb-8">No reviews yet — be the first to share your thoughts!</p>
            ) : (
              <div className="space-y-6 mb-10">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-beige pb-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-rose/15 flex items-center justify-center font-label font-semibold text-rose-dark text-sm">
                        {review.user?.fullName?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-label font-medium text-sm text-brown-deep">{review.user?.fullName}</p>
                        <div className="flex items-center gap-2">
                          <StarRating rating={review.rating} size={13} />
                          {review.isVerifiedPurchase && (
                            <span className="text-[10px] text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Verified Purchase</span>
                          )}
                        </div>
                      </div>
                    </div>
                    {review.title && <p className="font-label font-medium text-brown-deep mb-1">{review.title}</p>}
                    <p className="text-sm text-brown-light">{review.comment}</p>
                  </div>
                ))}
              </div>
            )}

            <form onSubmit={handleReviewSubmit} className="card-cozy p-6">
              <h3 className="font-label font-semibold text-brown-deep mb-4">Write a Review</h3>
              <div className="mb-4">
                <StarRating
                  rating={reviewForm.rating}
                  interactive
                  size={24}
                  onChange={(r) => setReviewForm((f) => ({ ...f, rating: r }))}
                />
              </div>
              <input
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Review title (optional)"
                className="input-cozy mb-3"
              />
              <textarea
                required
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience with this product…"
                rows={4}
                className="input-cozy mb-4 resize-none"
              />
              <button type="submit" disabled={submittingReview} className="btn-primary disabled:opacity-50">
                {submittingReview ? 'Submitting…' : 'Submit Review'}
              </button>
            </form>
          </div>

          {/* Related */}
          {relatedProducts.length > 0 && (
            <div>
              <h2 className="text-2xl mb-8">You May Also Like</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 sm:gap-7">
                {relatedProducts.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
