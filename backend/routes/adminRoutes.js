const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/auth');
const validate = require('../middleware/validate');

// Middleware: every route below requires an authenticated admin
router.use(protect, restrictTo('admin'));

// ---------- Products ----------
const {
  createProduct,
  updateProduct,
  deleteProduct,
  removeProductImage,
  getAdminProducts,
} = require('../controllers/productController');
const { uploadProductImages } = require('../middleware/upload');
const { productValidation } = require('../validations/productValidation');

router.get('/products', getAdminProducts);
router.post('/products', uploadProductImages, productValidation, validate, createProduct);
router.put('/products/:id', uploadProductImages, updateProduct);
router.delete('/products/:id', deleteProduct);
router.delete('/products/:id/images/:publicId', removeProductImage);

// ---------- Categories ----------
const {
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { uploadCategoryImage } = require('../middleware/upload');

router.get('/categories', getAdminCategories);
router.post('/categories', uploadCategoryImage, createCategory);
router.put('/categories/:id', uploadCategoryImage, updateCategory);
router.delete('/categories/:id', deleteCategory);

// ---------- Banners ----------
const {
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} = require('../controllers/bannerController');
const { uploadBannerImage } = require('../middleware/upload');

router.get('/banners', getAdminBanners);
router.post('/banners', uploadBannerImage, createBanner);
router.put('/banners/:id', uploadBannerImage, updateBanner);
router.delete('/banners/:id', deleteBanner);

// ---------- Orders ----------
const { getAdminOrders, updateOrderStatus } = require('../controllers/orderController');

router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

// ---------- Custom Orders ----------
const { getAdminCustomOrders, updateCustomOrder } = require('../controllers/customOrderController');

router.get('/custom-orders', getAdminCustomOrders);
router.put('/custom-orders/:id', updateCustomOrder);

// ---------- Reviews ----------
const { getAdminReviews, approveReview, rejectReview } = require('../controllers/reviewController');

router.get('/reviews', getAdminReviews);
router.put('/reviews/:id/approve', approveReview);
router.put('/reviews/:id/reject', rejectReview);

// ---------- Users ----------
const { getUsers, getUserById, blockUser, unblockUser } = require('../controllers/adminController');

router.get('/users', getUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/block', blockUser);
router.put('/users/:id/unblock', unblockUser);

module.exports = router;
