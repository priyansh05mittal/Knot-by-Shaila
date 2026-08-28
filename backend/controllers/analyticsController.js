const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const CustomOrder = require('../models/CustomOrder');

// @desc    Dashboard summary KPIs
// @route   GET /api/admin/analytics/dashboard
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalOrders,
    totalProducts,
    pendingOrders,
    pendingCustomOrders,
    revenueAgg,
    lowStockProducts,
    topSellingProducts,
  ] = await Promise.all([
    User.countDocuments({ role: 'user' }),
    Order.countDocuments(),
    Product.countDocuments(),
    Order.countDocuments({ orderStatus: { $in: ['placed', 'confirmed', 'processing'] } }),
    CustomOrder.countDocuments({ status: 'pending' }),
    Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
    Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock images').limit(10),
    Product.find().sort('-soldCount').limit(5).select('name soldCount images price'),
  ]);

  res.status(200).json({
    success: true,
    stats: {
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue: revenueAgg[0]?.total || 0,
      pendingOrders,
      pendingCustomOrders,
      lowStockProducts,
      topSellingProducts,
    },
  });
});

// @desc    Sales & revenue trend over time
// @route   GET /api/admin/analytics/sales?period=30d
// @access  Private/Admin
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const salesTrend = await Order.aggregate([
    { $match: { createdAt: { $gte: startDate }, paymentStatus: 'paid' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const orderStatusBreakdown = await Order.aggregate([
    { $group: { _id: '$orderStatus', count: { $sum: 1 } } },
  ]);

  res.status(200).json({
    success: true,
    salesTrend: salesTrend.map((d) => ({ date: d._id, revenue: d.revenue, orders: d.orders })),
    orderStatusBreakdown: orderStatusBreakdown.map((s) => ({ status: s._id, count: s.count })),
  });
});

// @desc    Category & product performance analytics
// @route   GET /api/admin/analytics/products
// @access  Private/Admin
const getProductAnalytics = asyncHandler(async (req, res) => {
  const categoryPerformance = await Order.aggregate([
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'productInfo',
      },
    },
    { $unwind: '$productInfo' },
    {
      $lookup: {
        from: 'categories',
        localField: 'productInfo.category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo.name',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        unitsSold: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  const stockAnalytics = await Product.aggregate([
    {
      $bucket: {
        groupBy: '$stock',
        boundaries: [0, 1, 6, 20, 50, Infinity],
        default: 'other',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  res.status(200).json({ success: true, categoryPerformance, stockAnalytics });
});

// @desc    User growth analytics
// @route   GET /api/admin/analytics/users
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res) => {
  const days = parseInt(req.query.days, 10) || 30;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const userGrowth = await User.aggregate([
    { $match: { createdAt: { $gte: startDate }, role: 'user' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalCustomers = await User.countDocuments({ role: 'user' });
  const totalOrdersCount = await Order.countDocuments();
  const conversionRate = totalCustomers > 0 ? ((totalOrdersCount / totalCustomers) * 100).toFixed(2) : 0;

  res.status(200).json({
    success: true,
    userGrowth: userGrowth.map((d) => ({ date: d._id, newUsers: d.newUsers })),
    conversionRate: Number(conversionRate),
  });
});

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getUserAnalytics,
};
