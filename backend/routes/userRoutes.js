const express = require('express');
const router = express.Router();

const {
  updateProfile,
  updateAvatar,
  changePassword,
  addAddress,
  updateAddress,
  deleteAddress,
  getWishlist,
  toggleWishlist,
  trackRecentlyViewed,
  getRecentlyViewed,
} = require('../controllers/userController');

const { protect } = require('../middleware/auth');
const { uploadAvatar } = require('../middleware/upload');
const validate = require('../middleware/validate');
const { addressValidation } = require('../validations/addressValidation');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/avatar', uploadAvatar, updateAvatar);
router.put('/change-password', changePassword);

router.post('/addresses', addressValidation, validate, addAddress);
router.put('/addresses/:addressId', addressValidation, validate, updateAddress);
router.delete('/addresses/:addressId', deleteAddress);

router.get('/wishlist', getWishlist);
router.post('/wishlist/:productId', toggleWishlist);

router.get('/recently-viewed', getRecentlyViewed);
router.post('/recently-viewed/:productId', trackRecentlyViewed);

module.exports = router;
