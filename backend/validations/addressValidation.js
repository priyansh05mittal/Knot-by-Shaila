const { body } = require('express-validator');

const addressValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('phone')
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Please provide a valid phone number'),
  body('addressLine1').trim().notEmpty().withMessage('Address line 1 is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('postalCode').trim().notEmpty().withMessage('Postal code is required'),
];

module.exports = { addressValidation };
