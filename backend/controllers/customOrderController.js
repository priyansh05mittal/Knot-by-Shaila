const asyncHandler = require('express-async-handler');
const CustomOrder = require('../models/CustomOrder');
const APIFeatures = require('../utils/apiFeatures');
const sendEmail = require('../utils/sendEmail');
const { customOrderUpdateEmailTemplate, adminNotificationEmailTemplate } = require('../utils/emailTemplates');

// @desc    Submit a custom crochet order request
// @route   POST /api/custom-orders
// @access  Private
const createCustomOrder = asyncHandler(async (req, res) => {
  const body = { ...req.body, user: req.user._id };

  if (typeof body.colorPreferences === 'string') {
    try {
      body.colorPreferences = JSON.parse(body.colorPreferences);
    } catch {
      body.colorPreferences = body.colorPreferences.split(',').map((s) => s.trim());
    }
  }
  if (typeof body.budgetRange === 'string') {
    body.budgetRange = JSON.parse(body.budgetRange);
  }

  if (req.files && req.files.length > 0) {
    body.referenceImages = req.files.map((file) => ({ url: file.path, publicId: file.filename }));
  }

  body.statusHistory = [{ status: 'pending', note: 'Request submitted.' }];

  const customOrder = await CustomOrder.create(body);

  try {
    await sendEmail({
      to: process.env.SMTP_USER,
      subject: 'New Custom Order Request',
      html: adminNotificationEmailTemplate(
        'New Custom Order Request',
        `${customOrder.fullName} submitted a request for "${customOrder.productType}". Please review it in the admin panel.`
      ),
    });
  } catch (err) {
    console.error('Admin notification email failed:', err.message);
  }

  res.status(201).json({ success: true, customOrder });
});

// @desc    Get logged-in user's custom order requests
// @route   GET /api/custom-orders
// @access  Private
const getMyCustomOrders = asyncHandler(async (req, res) => {
  const customOrders = await CustomOrder.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, customOrders });
});

// @desc    Get single custom order request
// @route   GET /api/custom-orders/:id
// @access  Private
const getCustomOrderById = asyncHandler(async (req, res) => {
  const customOrder = await CustomOrder.findById(req.params.id);

  if (!customOrder) {
    res.status(404);
    throw new Error('Custom order request not found.');
  }
  if (customOrder.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to view this request.');
  }

  res.status(200).json({ success: true, customOrder });
});

// @desc    User accepts the admin's quote
// @route   PUT /api/custom-orders/:id/accept-quote
// @access  Private
const acceptQuote = asyncHandler(async (req, res) => {
  const customOrder = await CustomOrder.findById(req.params.id);

  if (!customOrder) {
    res.status(404);
    throw new Error('Custom order request not found.');
  }
  if (customOrder.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized.');
  }
  if (!customOrder.quotedPrice) {
    res.status(400);
    throw new Error('No quote has been provided yet.');
  }

  customOrder.isQuoteAccepted = true;
  customOrder.status = 'in_progress';
  customOrder.statusHistory.push({ status: 'in_progress', note: 'Customer accepted the quote.' });
  await customOrder.save();

  res.status(200).json({ success: true, customOrder });
});

// ==================== ADMIN ====================

// @desc    Get all custom order requests (admin)
// @route   GET /api/admin/custom-orders
// @access  Private/Admin
const getAdminCustomOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(CustomOrder.find().populate('user', 'fullName email'), req.query)
    .filter()
    .sort()
    .paginate();

  const [customOrders, total] = await Promise.all([features.query, CustomOrder.countDocuments()]);

  res.status(200).json({
    success: true,
    count: customOrders.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    customOrders,
  });
});

// @desc    Update custom order status / quote (admin)
// @route   PUT /api/admin/custom-orders/:id
// @access  Private/Admin
const updateCustomOrder = asyncHandler(async (req, res) => {
  const { status, quotedPrice, adminNotes, rejectionReason } = req.body;
  const customOrder = await CustomOrder.findById(req.params.id).populate('user', 'fullName email');

  if (!customOrder) {
    res.status(404);
    throw new Error('Custom order request not found.');
  }

  if (status) {
    customOrder.status = status;
    customOrder.statusHistory.push({ status, note: adminNotes || `Status updated to ${status}` });
  }
  if (quotedPrice !== undefined) customOrder.quotedPrice = quotedPrice;
  if (adminNotes !== undefined) customOrder.adminNotes = adminNotes;
  if (rejectionReason !== undefined) customOrder.rejectionReason = rejectionReason;

  await customOrder.save();

  try {
    await sendEmail({
      to: customOrder.email,
      subject: 'Update on your custom crochet request',
      html: customOrderUpdateEmailTemplate(customOrder.fullName, customOrder),
    });
  } catch (err) {
    console.error('Custom order update email failed:', err.message);
  }

  const io = req.app.get('io');
  if (io) {
    io.to(`user-${customOrder.user._id}`).emit('custom-order-updated', {
      id: customOrder._id,
      status: customOrder.status,
    });
  }

  res.status(200).json({ success: true, customOrder });
});

module.exports = {
  createCustomOrder,
  getMyCustomOrders,
  getCustomOrderById,
  acceptQuote,
  getAdminCustomOrders,
  updateCustomOrder,
};
