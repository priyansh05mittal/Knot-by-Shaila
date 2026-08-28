const mongoose = require('mongoose');
const slugify = require('slugify');

const variantSchema = new mongoose.Schema(
  {
    color: { type: String },
    size: { type: String },
    sku: { type: String },
    price: { type: Number },
    stock: { type: Number, default: 0 },
    images: [{ url: String, publicId: String }],
  },
  { _id: true }
);

// Dynamic attribute so admin can add any custom field per product
// e.g. { key: 'material', value: '100% cotton yarn' }
const dynamicAttributeSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters'],
    },
    slug: { type: String, unique: true, index: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: { type: String, maxlength: 250 },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product category is required'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        alt: { type: String, default: '' },
      },
    ],
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    compareAtPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, default: 0, min: 0 },
    sku: { type: String, unique: true, sparse: true },
    variants: [variantSchema],

    // Flexible per-product attributes (material, pattern, care instructions, etc.)
    attributes: [dynamicAttributeSchema],

    tags: [{ type: String, trim: true, lowercase: true }],

    isHandmade: { type: Boolean, default: true },
    craftingTimeInDays: { type: Number, default: 3 },
    careInstructions: { type: String },

    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isBestSeller: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    ratingsAverage: { type: Number, default: 0, min: 0, max: 5 },
    ratingsCount: { type: Number, default: 0 },
    soldCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },

    seo: {
      metaTitle: String,
      metaDescription: String,
      keywords: [String],
    },
  },
  { timestamps: true }
);

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1, isNewArrival: 1, isBestSeller: 1, isTrending: 1 });

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = `${slugify(this.name, { lower: true, strict: true })}-${Date.now().toString().slice(-5)}`;
  }
  next();
});

productSchema.virtual('inStock').get(function () {
  return this.stock > 0;
});

productSchema.virtual('discountPercentage').get(function () {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) return 0;
  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Product', productSchema);
