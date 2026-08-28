const { body } = require('express-validator');

const productValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required').isLength({ max: 150 }),
  body('description').trim().notEmpty().withMessage('Product description is required'),
  body('category').trim().notEmpty().withMessage('Category is required').isMongoId().withMessage('Invalid category id'),
  body('price').notEmpty().withMessage('Price is required').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
];

module.exports = { productValidation };
