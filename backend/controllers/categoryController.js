const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get all active categories (nested tree)
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true, parent: null })
    .sort('displayOrder')
    .populate({
      path: 'subcategories',
      match: { isActive: true },
      options: { sort: { displayOrder: 1 } },
    });

  res.status(200).json({ success: true, categories });
});

// @desc    Get single category by slug
// @route   GET /api/categories/:slug
// @access  Public
const getCategoryBySlug = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug, isActive: true }).populate('subcategories');
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }
  res.status(200).json({ success: true, category });
});

// ==================== ADMIN ====================

const getAdminCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().sort('displayOrder').populate('subcategories');
  res.status(200).json({ success: true, categories });
});

const createCategory = asyncHandler(async (req, res) => {
  const body = { ...req.body };
  if (body.parent === '') body.parent = null;

  if (req.file) {
    body.image = { url: req.file.path, publicId: req.file.filename };
  }

  const category = await Category.create(body);
  res.status(201).json({ success: true, category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }

  const body = { ...req.body };
  if (body.parent === '') body.parent = null;

  if (req.file) {
    if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
    body.image = { url: req.file.path, publicId: req.file.filename };
  }

  Object.assign(category, body);
  await category.save();

  res.status(200).json({ success: true, category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    res.status(404);
    throw new Error('Category not found.');
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productCount} product(s) assigned. Reassign them first.`);
  }

  const subCount = await Category.countDocuments({ parent: category._id });
  if (subCount > 0) {
    res.status(400);
    throw new Error('Cannot delete category with subcategories. Delete or reassign subcategories first.');
  }

  if (category.image?.publicId) await deleteFromCloudinary(category.image.publicId);
  await category.deleteOne();

  res.status(200).json({ success: true, message: 'Category deleted successfully.' });
});

module.exports = {
  getCategories,
  getCategoryBySlug,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
