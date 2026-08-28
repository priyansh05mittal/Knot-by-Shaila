const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT for a given user id.
 */
const signToken = (id, expiresIn = process.env.JWT_EXPIRES_IN || '7d') => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn });
};

/**
 * Sign a token, set it as an httpOnly cookie, and send the auth response.
 * If rememberMe is false, the cookie expires with the browser session.
 */
const sendTokenResponse = (user, statusCode, res, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : process.env.JWT_EXPIRES_IN || '7d';
  const token = signToken(user._id, expiresIn);

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  };

  if (rememberMe) {
    cookieOptions.expires = new Date(
      Date.now() + (process.env.JWT_COOKIE_EXPIRES_DAYS || 30) * 24 * 60 * 60 * 1000
    );
  }

  res.cookie('token', token, cookieOptions);

  user.password = undefined;
  user.otp = undefined;
  user.otpExpires = undefined;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;

  res.status(statusCode).json({
    success: true,
    token,
    user,
  });
};

module.exports = { signToken, sendTokenResponse };
