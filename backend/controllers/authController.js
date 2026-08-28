const asyncHandler = require('express-async-handler');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const { otpEmailTemplate, resetPasswordEmailTemplate } = require('../utils/emailTemplates');
const { generateOTP, generateResetToken } = require('../utils/generators');
const { sendTokenResponse } = require('../utils/generateToken');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @desc    Register new user & send OTP
// @route   POST /api/auth/signup
// @access  Public
const signup = asyncHandler(async (req, res) => {
  const { fullName, email, contactNumber, password, acceptedTerms } = req.body;

  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    res.status(400);
    throw new Error('An account with this email already exists.');
  }

  const otp = generateOTP();

  const user = await User.create({
    fullName,
    email,
    contactNumber,
    password,
    acceptedTerms: acceptedTerms === true || acceptedTerms === 'true',
    otp,
    otpExpires: Date.now() + 10 * 60 * 1000,
  });

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify your Crochet Nest account',
      html: otpEmailTemplate(user.fullName, otp),
    });
  } catch (err) {
    console.error('Failed to send OTP email:', err.message);
  }

  res.status(201).json({
    success: true,
    message: 'Account created. Please check your email for the verification code.',
    email: user.email,
  });
});

// @desc    Verify OTP and activate account
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+otp +otpExpires');

  if (!user) {
    res.status(404);
    throw new Error('No account found with this email.');
  }

  if (user.isVerified) {
    return res.status(200).json({ success: true, message: 'Account already verified. Please log in.' });
  }

  if (!user.otp || user.otp !== otp || user.otpExpires < Date.now()) {
    res.status(400);
    throw new Error('Invalid or expired OTP. Please request a new one.');
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpires = undefined;
  await user.save({ validateBeforeSave: false });

  // Do NOT auto-login — redirect user to login page as required
  res.status(200).json({
    success: true,
    message: 'Email verified successfully. You can now log in.',
  });
});

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email?.toLowerCase() });

  if (!user) {
    res.status(404);
    throw new Error('No account found with this email.');
  }
  if (user.isVerified) {
    res.status(400);
    throw new Error('Account is already verified.');
  }

  const otp = generateOTP();
  user.otp = otp;
  user.otpExpires = Date.now() + 10 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    to: user.email,
    subject: 'Your new Crochet Nest verification code',
    html: otpEmailTemplate(user.fullName, otp),
  });

  res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.' });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password, rememberMe } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  if (user.isBlocked) {
    res.status(403);
    throw new Error('Your account has been blocked. Please contact support.');
  }

  if (!user.isVerified) {
    res.status(403);
    throw new Error('Please verify your email before logging in.');
  }

  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, rememberMe === true || rememberMe === 'true');
});

// @desc    Google OAuth login/signup
// @route   POST /api/auth/google
// @access  Public
const googleLogin = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    res.status(400);
    throw new Error('Google ID token is required.');
  }

  const ticket = await googleClient.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email.toLowerCase() });

  if (user) {
    if (user.isBlocked) {
      res.status(403);
      throw new Error('Your account has been blocked. Please contact support.');
    }
    if (!user.googleId) {
      user.googleId = payload.sub;
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    }
  } else {
    user = await User.create({
      fullName: payload.name,
      email: payload.email,
      googleId: payload.sub,
      isVerified: true,
      acceptedTerms: true,
      avatar: { url: payload.picture || '', publicId: '' },
    });
  }

  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, true);
});

// @desc    Forgot password — sends reset link
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email: email.toLowerCase() });

  // Always respond success to avoid leaking which emails are registered
  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent.',
    });
  }

  const { resetToken, hashedToken } = generateResetToken();
  user.resetPasswordToken = hashedToken;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Reset your Crochet Nest password',
      html: resetPasswordEmailTemplate(user.fullName, resetUrl),
    });
  } catch (err) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save({ validateBeforeSave: false });
    res.status(500);
    throw new Error('Failed to send reset email. Please try again later.');
  }

  res.status(200).json({
    success: true,
    message: 'If an account exists with this email, a password reset link has been sent.',
  });
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    res.status(400);
    throw new Error('Password reset link is invalid or has expired.');
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({ success: true, message: 'Password reset successful. Please log in with your new password.' });
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('wishlist', 'name slug images price');
  res.status(200).json({ success: true, user });
});

module.exports = {
  signup,
  verifyOtp,
  resendOtp,
  login,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout,
  getMe,
};
