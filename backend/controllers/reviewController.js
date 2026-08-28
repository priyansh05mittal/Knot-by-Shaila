const asyncHandler = require('express-async-handler');
const Review = require('../models/Review');
const Product = require('../models/Product');
const Order = require('../models/Order');
const APIFeatures = require('../utils/apiFeatures');

const recalculateProductRating = async (productId) => {
  const stats = await Review.aggregate([
    { $match: { product: productId, status: 'approved' } },
    { $group: { _id: '$product', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratingsAverage: stats[0]?.avgRating || 0,
    ratingsCount: stats[0]?.count || 0,
  });
};

// @desc    Get approved reviews for a product
// @route   GET /api/products/:productId/reviews
// @access  Public
const getProductReviews = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Review.find({ product: req.params.productId, status: 'approved' }).populate('user', 'fullName avatar'),
    req.query
  )
    .sort()
    .paginate();

  const reviews = await features.query;
  res.status(200).json({ success: true, count: reviews.length, reviews });
});

// @desc    Submit a review (goes to pending moderation)
// @route   POST /api/products/:productId/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const existing = await Review.findOne({ product: productId, user: req.user._id });
  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this product.');
  }

  const hasPurchased = await Order.exists({
    user: req.user._id,
    'items.product': productId,
    orderStatus: 'delivered',
  });

  const body = {
    ...req.body,
    product: productId,
    user: req.user._id,
    isVerifiedPurchase: !!hasPurchased,
    status: 'pending',
  };

  if (req.files && req.files.length > 0) {
    body.images = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
  }

  const review = await Review.create(body);

  res.status(201).json({
    success: true,
    message: 'Thank you! Your review has been submitted and is awaiting approval.',
    review,
  });
});

// @desc    Delete own review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteOwnReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }
  if (review.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized.');
  }

  const productId = review.product;
  await review.deleteOne();
  await recalculateProductRating(productId);

  res.status(200).json({ success: true, message: 'Review deleted.' });
});

// ==================== ADMIN ====================

// @desc    Get all reviews (admin) — filterable by status
// @route   GET /api/admin/reviews
// @access  Private/Admin
const getAdminReviews = asyncHandler(async (req, res) => {
  const features = new APIFeatures(
    Review.find().populate('user', 'fullName email').populate('product', 'name slug images'),
    req.query
  )
    .filter()
    .sort()
    .paginate();

  const [reviews, total] = await Promise.all([features.query, Review.countDocuments()]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    reviews,
  });
});

// @desc    Approve a review
// @route   PUT /api/admin/reviews/:id/approve
// @access  Private/Admin
const approveReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  review.status = 'approved';
  review.rejectionReason = undefined;
  await review.save();
  await recalculateProductRating(review.product);

  res.status(200).json({ success: true, review });
});

// @desc    Reject a review
// @route   PUT /api/admin/reviews/:id/reject
// @access  Private/Admin
const rejectReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Review not found.');
  }

  review.status = 'rejected';
  review.rejectionReason = req.body.reason || 'Did not meet review guidelines.';
  await review.save();
  await recalculateProductRating(review.product);

  res.status(200).json({ success: true, review });
});

module.exports = {
  getProductReviews,
  createReview,
  deleteOwnReview,
  getAdminReviews,
  approveReview,
  rejectReview,
};
