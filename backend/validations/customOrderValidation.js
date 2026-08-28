const { body } = require('express-validator');

const customOrderValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('phoneNumber')
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('productType').trim().notEmpty().withMessage('Product type is required'),
  body('description').trim().notEmpty().withMessage('Custom description is required'),
];

module.exports = { customOrderValidation };
