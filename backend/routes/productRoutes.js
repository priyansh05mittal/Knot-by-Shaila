const express = require('express');
const router = express.Router();

const { getProducts, getProductBySlug, getCollection } = require('../controllers/productController');
const { getProductReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { uploadReviewImages } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { reviewValidation } = require('../validations/reviewValidation');

router.get('/', getProducts);
router.get('/collections/:type', getCollection);
router.get('/:slug', getProductBySlug);

router.get('/:productId/reviews', getProductReviews);
router.post('/:productId/reviews', protect, uploadReviewImages, reviewValidation, validate, createReview);

module.exports = router;
