const { body } = require('express-validator');

const signupValidation = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ max: 80 }),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email'),
  body('contactNumber')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage('Please provide a valid contact number'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
  body('acceptedTerms').custom((value) => {
    if (value !== true && value !== 'true') throw new Error('You must accept the Terms & Conditions');
    return true;
  }),
];

const loginValidation = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

const verifyOtpValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
  body('otp').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
];

const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Please provide a valid email'),
];

const resetPasswordValidation = [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) throw new Error('Passwords do not match');
    return true;
  }),
];

module.exports = {
  signupValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
