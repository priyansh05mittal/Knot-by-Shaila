const mongoose = require('mongoose');

const customOrderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },

    productType: { type: String, required: true },
    description: { type: String, required: true },
    colorPreferences: [{ type: String }],
    size: { type: String },
    budgetRange: {
      min: { type: Number },
      max: { type: Number },
    },
    deadline: { type: Date },

    referenceImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
      },
    ],

    status: {
      type: String,
      enum: ['pending', 'reviewing', 'accepted', 'rejected', 'in_progress', 'ready', 'shipped', 'delivered'],
      default: 'pending',
    },
    quotedPrice: { type: Number },
    adminNotes: { type: String },
    rejectionReason: { type: String },
    isQuoteAccepted: { type: Boolean, default: false },

    convertedOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },

    statusHistory: [
      {
        status: String,
        note: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

customOrderSchema.index({ user: 1, createdAt: -1 });
customOrderSchema.index({ status: 1 });

module.exports = mongoose.model('CustomOrder', customOrderSchema);
