const asyncHandler = require('express-async-handler');
const Banner = require('../models/Banner');
const { deleteFromCloudinary } = require('../config/cloudinary');

// @desc    Get active banners (public, for homepage slider)
// @route   GET /api/banners
// @access  Public
const getActiveBanners = asyncHandler(async (req, res) => {
  const now = new Date();
  const filter = {
    isActive: true,
    $and: [
      { $or: [{ startDate: null }, { startDate: { $lte: now } }] },
      { $or: [{ endDate: null }, { endDate: { $gte: now } }] },
    ],
  };

  if (req.query.placement) filter.placement = req.query.placement;

  const banners = await Banner.find(filter).sort('displayOrder');

  // Fire-and-forget impression tracking
  Banner.updateMany({ _id: { $in: banners.map((b) => b._id) } }, { $inc: { impressionCount: 1 } }).exec();

  res.status(200).json({ success: true, banners });
});

// @desc    Track a banner click
// @route   POST /api/banners/:id/click
// @access  Public
const trackBannerClick = asyncHandler(async (req, res) => {
  await Banner.findByIdAndUpdate(req.params.id, { $inc: { clickCount: 1 } });
  res.status(200).json({ success: true });
});

// ==================== ADMIN ====================

const getAdminBanners = asyncHandler(async (req, res) => {
  const banners = await Banner.find().sort('displayOrder');
  res.status(200).json({ success: true, banners });
});

const createBanner = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('Banner image is required.');
  }

  const banner = await Banner.create({
    ...req.body,
    image: { url: req.file.path, publicId: req.file.filename },
  });

  res.status(201).json({ success: true, banner });
});

const updateBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found.');
  }

  const body = { ...req.body };
  if (req.file) {
    if (banner.image?.publicId) await deleteFromCloudinary(banner.image.publicId);
    body.image = { url: req.file.path, publicId: req.file.filename };
  }

  Object.assign(banner, body);
  await banner.save();

  res.status(200).json({ success: true, banner });
});

const deleteBanner = asyncHandler(async (req, res) => {
  const banner = await Banner.findById(req.params.id);
  if (!banner) {
    res.status(404);
    throw new Error('Banner not found.');
  }

  if (banner.image?.publicId) await deleteFromCloudinary(banner.image.publicId);
  await banner.deleteOne();

  res.status(200).json({ success: true, message: 'Banner deleted successfully.' });
});

module.exports = {
  getActiveBanners,
  trackBannerClick,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
};
