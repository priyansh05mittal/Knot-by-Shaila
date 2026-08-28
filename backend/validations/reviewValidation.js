const { body } = require('express-validator');

const reviewValidation = [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().notEmpty().withMessage('Comment is required').isLength({ max: 1000 }),
  body('title').optional().trim().isLength({ max: 120 }),
];

module.exports = { reviewValidation };
