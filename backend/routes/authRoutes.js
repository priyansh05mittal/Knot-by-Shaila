const express = require('express');
const router = express.Router();

const {
  signup,
  verifyOtp,
  resendOtp,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
} = require('../controllers/authController');

const { protect } = require('../middleware/auth');
const { authLimiter, otpLimiter } = require('../middleware/rateLimiter');
const validate = require('../middleware/validate');
const {
  signupValidation,
  loginValidation,
  verifyOtpValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} = require('../validations/authValidation');

router.post('/signup', authLimiter, signupValidation, validate, signup);
router.post('/verify-otp', otpLimiter, verifyOtpValidation, validate, verifyOtp);
router.post('/resend-otp', otpLimiter, resendOtp);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/google', authLimiter, googleLogin);
router.post('/forgot-password', authLimiter, forgotPasswordValidation, validate, forgotPassword);
router.post('/reset-password/:token', resetPasswordValidation, validate, resetPassword);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
