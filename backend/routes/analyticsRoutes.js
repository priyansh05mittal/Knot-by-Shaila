const express = require('express');
const router = express.Router();

const { protect, restrictTo } = require('../middleware/auth');
const {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics,
} = require('../controllers/analyticsController');

router.use(protect, restrictTo('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesAnalytics);
router.get('/products', getProductAnalytics);
router.get('/users', getUserAnalytics);

module.exports = router;
