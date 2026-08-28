const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const APIFeatures = require('../utils/apiFeatures');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all products (with filter, search, sort, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const baseFilter = { isActive: true };

  const features = new APIFeatures(Product.find(baseFilter).populate('category', 'name slug'), req.query)
    .search(['name', 'description', 'tags'])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [products, total] = await Promise.all([
    features.query,
    Product.countDocuments(baseFilter),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    products,
  });
});

// @desc    Get single product by slug
// @route   GET /api/products/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');

  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  product.viewCount += 1;
  await product.save({ validateBeforeSave: false });

  const relatedProducts = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  })
    .limit(8)
    .select('name slug images price compareAtPrice ratingsAverage');

  res.status(200).json({ success: true, product, relatedProducts });
});

// @desc    Get featured / new arrivals / best sellers / trending collections
// @route   GET /api/products/collections/:type
// @access  Public
const getCollection = asyncHandler(async (req, res) => {
  const map = {
    featured: { isFeatured: true },
    'new-arrivals': { isNewArrival: true },
    'best-sellers': { isBestSeller: true },
    trending: { isTrending: true },
  };

  const filter = map[req.params.type];
  if (!filter) {
    res.status(400);
    throw new Error('Invalid collection type.');
  }

  const limit = Number(req.query.limit) || 12;
  const products = await Product.find({ ...filter, isActive: true })
    .sort('-createdAt')
    .limit(limit)
    .populate('category', 'name slug');

  res.status(200).json({ success: true, count: products.length, products });
});

// ==================== ADMIN ====================

// @desc    Create product
// @route   POST /api/admin/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const body = { ...req.body };

  if (typeof body.attributes === 'string') body.attributes = JSON.parse(body.attributes);
  if (typeof body.tags === 'string') body.tags = JSON.parse(body.tags);
  if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);

  if (req.files && req.files.length > 0) {
    body.images = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      alt: body.name,
    }));
  }

  const product = await Product.create(body);
  res.status(201).json({ success: true, product });
});

// @desc    Update product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const body = { ...req.body };
  if (typeof body.attributes === 'string') body.attributes = JSON.parse(body.attributes);
  if (typeof body.tags === 'string') body.tags = JSON.parse(body.tags);
  if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);

  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
      alt: body.name || product.name,
    }));
    body.images = [...product.images, ...newImages];
  }

  Object.assign(product, body);
  await product.save();

  res.status(200).json({ success: true, product });
});

// @desc    Delete product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  await Promise.all(product.images.map((img) => deleteFromCloudinary(img.publicId)));
  await product.deleteOne();

  res.status(200).json({ success: true, message: 'Product deleted successfully.' });
});

// @desc    Remove a single image from a product
// @route   DELETE /api/admin/products/:id/images/:publicId
// @access  Private/Admin
const removeProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found.');
  }

  const { publicId } = req.params;
  await deleteFromCloudinary(publicId);
  product.images = product.images.filter((img) => img.publicId !== publicId);
  await product.save();

  res.status(200).json({ success: true, images: product.images });
});

// @desc    Get all products for admin (includes inactive)
// @route   GET /api/admin/products
// @access  Private/Admin
const getAdminProducts = asyncHandler(async (req, res) => {
  const features = new APIFeatures(Product.find().populate('category', 'name slug'), req.query)
    .search(['name', 'description', 'sku'])
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const [products, total] = await Promise.all([features.query, Product.countDocuments()]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: features.pagination.page,
    pages: Math.ceil(total / features.pagination.limit),
    products,
  });
});

module.exports = {
  getProducts,
  getProductBySlug,
  getCollection,
  createProduct,
  updateProduct,
  deleteProduct,
  removeProductImage,
  getAdminProducts,
};
