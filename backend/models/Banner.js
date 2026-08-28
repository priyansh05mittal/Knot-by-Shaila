const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    image: {
      url: { type: String, required: true },
      publicId: { type: String, required: true },
    },
    redirectUrl: { type: String, default: '' },
    buttonText: { type: String, default: 'Shop Now' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date },
    endDate: { type: Date },
    clickCount: { type: Number, default: 0 },
    impressionCount: { type: Number, default: 0 },
    placement: {
      type: String,
      enum: ['hero', 'promo', 'category'],
      default: 'hero',
    },
  },
  { timestamps: true }
);

bannerSchema.methods.isCurrentlyActive = function () {
  const now = new Date();
  if (!this.isActive) return false;
  if (this.startDate && now < this.startDate) return false;
  if (this.endDate && now > this.endDate) return false;
  return true;
};

module.exports = mongoose.model('Banner', bannerSchema);
