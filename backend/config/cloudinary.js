const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for product images
const productStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crochet-nest/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for custom order reference images
const customOrderStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crochet-nest/custom-orders',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1600, height: 1600, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for banners
const bannerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crochet-nest/banners',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for user avatars
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crochet-nest/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto' }],
  },
});

// Storage for category images
const categoryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crochet-nest/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto' }],
  },
});

// Storage for review images
const reviewStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'crochet-nest/reviews',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary deletion error:', err.message);
  }
};

module.exports = {
  cloudinary,
  productStorage,
  customOrderStorage,
  bannerStorage,
  avatarStorage,
  categoryStorage,
  reviewStorage,
  deleteFromCloudinary,
};
