const multer = require('multer');
const {
  productStorage,
  customOrderStorage,
  bannerStorage,
  avatarStorage,
  categoryStorage,
  reviewStorage,
} = require('../config/cloudinary');

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp).'), false);
  }
};

const baseOptions = { fileFilter, limits: { fileSize: 5 * 1024 * 1024 } };

const uploadProductImages = multer({ storage: productStorage, ...baseOptions }).array('images', 8);
const uploadCustomOrderImages = multer({ storage: customOrderStorage, ...baseOptions }).array('referenceImages', 6);
const uploadBannerImage = multer({ storage: bannerStorage, ...baseOptions }).single('image');
const uploadAvatar = multer({ storage: avatarStorage, ...baseOptions }).single('avatar');
const uploadCategoryImage = multer({ storage: categoryStorage, ...baseOptions }).single('image');
const uploadReviewImages = multer({ storage: reviewStorage, ...baseOptions }).array('images', 4);

module.exports = {
  uploadProductImages,
  uploadCustomOrderImages,
  uploadBannerImage,
  uploadAvatar,
  uploadCategoryImage,
  uploadReviewImages,
};
