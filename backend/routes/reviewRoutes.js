const express = require('express');
const router = express.Router();

const { deleteOwnReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');

router.delete('/:id', protect, deleteOwnReview);

module.exports = router;
