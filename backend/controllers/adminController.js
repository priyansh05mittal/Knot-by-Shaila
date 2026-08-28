const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Order = require('../models/Order');
const APIFeatures = require('../utils/apiFeatures');

// @desc    Get all users (admin)
// @route   GET /api/admin/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const features = new APIFeatures(User.find({ role: 'user' }), req.query)
    .search(['fullName', 'email', 'contactNumber'])
    .filter()
    .sort()
    .paginate();

  const [users, total] = await Promise.all([features.query, User.countDocuments({ role: 'user' })]);

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    users,
  });
});

// @desc    Get single user detail with order history
// @route   GET /api/admin/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  const orders = await Order.find({ user: user._id }).sort('-createdAt');

  res.status(200).json({ success: true, user, orders });
});

// @desc    Block a user
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
const blockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }
  if (user.role === 'admin') {
    res.status(400);
    throw new Error('Cannot block an admin account.');
  }

  user.isBlocked = true;
  user.blockedReason = req.body.reason || 'Blocked by admin';
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'User blocked successfully.', user });
});

// @desc    Unblock a user
// @route   PUT /api/admin/users/:id/unblock
// @access  Private/Admin
const unblockUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.status(404);
    throw new Error('User not found.');
  }

  user.isBlocked = false;
  user.blockedReason = undefined;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ success: true, message: 'User unblocked successfully.', user });
});

module.exports = { getUsers, getUserById, blockUser, unblockUser };
