const express = require('express');
const router = express.Router();

const { getActiveBanners, trackBannerClick } = require('../controllers/bannerController');

router.get('/', getActiveBanners);
router.post('/:id/click', trackBannerClick);

module.exports = router;
