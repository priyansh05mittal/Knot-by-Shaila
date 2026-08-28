const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const APIFeatures = require('../utils/apiFeatures');
const { generateOrderNumber } = require('../utils/generators');
const sendEmail = require('../utils/sendEmail');
const { orderConfirmationEmailTemplate } = require('../utils/emailTemplates');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const SHIPPING_FLAT_RATE = 99;
const FREE_SHIPPING_THRESHOLD = 1499;
const TAX_RATE = 0.05;

const calculateTotals = (items) => {
  const itemsPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT_RATE;
  const taxPrice = Math.round(itemsPrice * TAX_RATE);
  const totalAmount = itemsPrice + shippingPrice + taxPrice;
  return { itemsPrice, shippingPrice, taxPrice, totalAmount };
};

// @desc    Create a Razorpay order (for online payment)
// @route   POST /api/orders/razorpay/create
// @access  Private
const createRazorpayOrder = asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    res.status(400);
    throw new Error('Invalid amount.');
  }

  const razorpayOrder = await razorpay.orders.create({
    amount: Math.round(amount * 100), // paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
  });

  res.status(200).json({ success: true, order: razorpayOrder, key: process.env.RAZORPAY_KEY_ID });
});

// @desc    Place a new order (COD or after Razorpay payment verified)
// @route   POST /api/orders
// @access  Private
const placeOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, razorpayPaymentDetails, discount = 0 } = req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error('Order must contain at least one item.');
  }

  // Verify Razorpay signature if online payment
  if (paymentMethod === 'razorpay') {
    const { orderId, paymentId, signature } = razorpayPaymentDetails || {};
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      res.status(400);
      throw new Error('Payment verification failed.');
    }
  }

  // Validate stock and build authoritative item list from DB prices
  const orderItems = [];
  for (const item of items) {
    const product = await Product.findById(item.productId);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.productId}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}.`);
    }

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: product.price,
      quantity: item.quantity,
      variant: item.variant,
    });

    product.stock -= item.quantity;
    product.soldCount += item.quantity;
    await product.save({ validateBeforeSave: false });
  }

  const { itemsPrice, shippingPrice, taxPrice, totalAmount } = calculateTotals(orderItems);

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    itemsPrice,
    shippingPrice,
    taxPrice,
    discount,
    totalAmount: totalAmount - discount,
    paymentMethod,
    paymentStatus: paymentMethod === 'razorpay' ? 'paid' : 'pending',
    razorpay: paymentMethod === 'razorpay' ? razorpayPaymentDetails : undefined,
    timeline: [{ status: 'placed', note: 'Order placed successfully.' }],
  });

  // Clear the cart after successful order
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [] });

  try {
    await sendEmail({
      to: req.user.email,
      subject: `Order Confirmed - #${order.orderNumber}`,
      html: orderConfirmationEmailTemplate(req.user.fullName, order),
    });
  } catch (err) {
    console.error('Order confirmation email failed:', err.message);
  }

  const io = req.app.get('io');
  if (io) io.to('admin-room').emit('new-order', { orderId: order._id, orderNumber: order.orderNumber });

  res.status(201).json({ success: true, order });
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort('-createdAt');
  res.status(200).json({ success: true, count: orders.length, orders });
});

// @desc    Get single order (owner or admin)
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'fullName email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('You are not authorized to view this order.');
  }

  res.status(200).json({ success: true, order });
});

// @desc    Cancel an order (owner, only if not yet shipped)
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }
  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You are not authorized to cancel this order.');
  }
  if (['shipped', 'out_for_delivery', 'delivered'].includes(order.orderStatus)) {
    res.status(400);
    throw new Error('This order can no longer be cancelled.');
  }

  order.orderStatus = 'cancelled';
  order.cancelledAt = Date.now();
  order.cancelReason = req.body.reason || 'Cancelled by customer';
  order.timeline.push({ status: 'cancelled', note: order.cancelReason });
  await order.save();

  // Restock items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  res.status(200).json({ success: true, order });
});

// ==================== ADMIN ====================

// @desc    Get all orders (admin)
// @route   GET /api/admin/orders
// @access  Private/Admin
const getAdminOrders = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Order.find().populate('user', 'fullName email'), req.query)
    .filter()
    .sort()
    .paginate();

  const [orders, total] = await Promise.all([features.query, Order.countDocuments()]);

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    orders,
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/admin/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, trackingNumber, courierName, note } = req.body;
  const order = await Order.findById(req.params.id).populate('user', 'fullName email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found.');
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    order.timeline.push({ status: orderStatus, note: note || `Status updated to ${orderStatus}` });
    if (orderStatus === 'delivered') order.deliveredAt = Date.now();
  }
  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (courierName) order.courierName = courierName;

  await order.save();

  const io = req.app.get('io');
  if (io) io.to(`user-${order.user._id}`).emit('order-status-updated', { orderId: order._id, status: order.orderStatus });

  res.status(200).json({ success: true, order });
});

module.exports = {
  createRazorpayOrder,
  placeOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAdminOrders,
  updateOrderStatus,
};
