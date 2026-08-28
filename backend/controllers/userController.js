const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Product = require('../models/Product');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Update logged-in user's profile
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { fullName, contactNumber } = req.body;
  const user = await User.findById(req.user._id);

  if (fullName) user.fullName = fullName;
  if (contactNumber) user.contactNumber = contactNumber;

  await user.save();
  res.status(200).json({ success: true, user: user.toSafeObject() });
});

// @desc    Upload/update avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Please upload an image.');
  }

  const user = await User.findById(req.user._id);

  if (user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
  }

  user.avatar = { url: req.file.path, publicId: req.file.filename };
  await user.save();

  res.status(200).json({ success: true, avatar: user.avatar });
});

// @desc    Change password (logged in)
// @route   PUT /api/users/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id).select('+password');

  if (!(await user.comparePassword(currentPassword))) {
    res.status(401);
    throw new Error('Current password is incorrect.');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json({ success: true, message: 'Password updated successfully.' });
});

// @desc    Add address
// @route   POST /api/users/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }
  if (user.addresses.length === 0) req.body.isDefault = true;

  user.addresses.push(req.body);
  await user.save();

  res.status(201).json({ success: true, addresses: user.addresses });
});

// @desc    Update address
// @route   PUT /api/users/addresses/:addressId
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const address = user.addresses.id(req.params.addressId);

  if (!address) {
    res.status(404);
    throw new Error('Address not found.');
  }

  if (req.body.isDefault) {
    user.addresses.forEach((addr) => (addr.isDefault = false));
  }

  Object.assign(address, req.body);
  await user.save();

  res.status(200).json({ success: true, addresses: user.addresses });
});

// @desc    Delete address
// @route   DELETE /api/users/addresses/:addressId
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.addresses = user.addresses.filter((addr) => addr._id.toString() !== req.params.addressId);
  await user.save();
  res.status(200).json({ success: true, addresses: user.addresses });
});

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'wishlist',
    match: { isActive: true },
    select: 'name slug images price compareAtPrice ratingsAverage stock',
  });
  res.status(200).json({ success: true, wishlist: user.wishlist });
});

// @desc    Toggle wishlist item
// @route   POST /api/users/wishlist/:productId
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const user = await User.findById(req.user._id);
  const index = user.wishlist.findIndex((id) => id.toString() === productId);

  let inWishlist;
  if (index > -1) {
    user.wishlist.splice(index, 1);
    inWishlist = false;
  } else {
    user.wishlist.push(productId);
    inWishlist = true;
  }

  await user.save();
  res.status(200).json({ success: true, inWishlist });
});

// @desc    Track recently viewed product
// @route   POST /api/users/recently-viewed/:productId
// @access  Private
const trackRecentlyViewed = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const user = await User.findById(req.user._id);

  user.recentlyViewed = user.recentlyViewed.filter((rv) => rv.product.toString() !== productId);
  user.recentlyViewed.unshift({ product: productId, viewedAt: Date.now() });
  user.recentlyViewed = user.recentlyViewed.slice(0, 20);

  await user.save({ validateBeforeSave: false });
  res.status(200).json({ success: true });
});

// @desc    Get recently viewed products
// @route   GET /api/users/recently-viewed
// @access  Private
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: 'recentlyViewed.product',
    match: { isActive: true },
    select: 'name slug images price compareAtPrice ratingsAverage',
  });

  const items = user.recentlyViewed.filter((rv) => rv.product).map((rv) => rv.product);
  res.status(200).json({ success: true, products: items });
});

module.exports = {
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
};
