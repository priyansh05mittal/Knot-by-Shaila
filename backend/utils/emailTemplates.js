const wrapper = (title, bodyHtml) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#FFF8F0;font-family:'Segoe UI',Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#FFF8F0;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(107,79,79,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg,#D8A7B1,#E8D5C4);padding:28px 32px;text-align:center;">
              <span style="font-size:22px;font-weight:700;color:#6B4F4F;letter-spacing:0.5px;">🧶 Crochet Nest</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#4A3B3B;font-size:15px;line-height:1.7;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px;background:#FFF8F0;text-align:center;color:#A88F8F;font-size:12px;">
              © ${new Date().getFullYear()} Crochet Nest. Handmade with love, stitch by stitch.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

const otpEmailTemplate = (name, otp) =>
  wrapper(
    'Verify your email',
    `
    <h2 style="color:#6B4F4F;margin-top:0;">Hi ${name}, verify your email 💌</h2>
    <p>Thanks for joining Crochet Nest. Use the verification code below to activate your account:</p>
    <div style="margin:24px 0;text-align:center;">
      <span style="display:inline-block;background:#FFF8F0;border:1px dashed #D8A7B1;border-radius:12px;padding:16px 32px;font-size:28px;font-weight:700;letter-spacing:8px;color:#6B4F4F;">${otp}</span>
    </div>
    <p>This code expires in 10 minutes. If you didn't create an account, you can safely ignore this email.</p>
  `
  );

const resetPasswordEmailTemplate = (name, resetUrl) =>
  wrapper(
    'Reset your password',
    `
    <h2 style="color:#6B4F4F;margin-top:0;">Hi ${name}, reset your password 🔐</h2>
    <p>We received a request to reset your password. Click the button below to set a new one. This link expires in 15 minutes.</p>
    <div style="margin:28px 0;text-align:center;">
      <a href="${resetUrl}" style="background:#D8A7B1;color:#fff;text-decoration:none;padding:14px 32px;border-radius:999px;font-weight:600;display:inline-block;">Reset Password</a>
    </div>
    <p>If you didn't request this, you can safely ignore this email — your password will remain unchanged.</p>
  `
  );

const orderConfirmationEmailTemplate = (name, order) =>
  wrapper(
    'Order confirmed',
    `
    <h2 style="color:#6B4F4F;margin-top:0;">Thank you, ${name}! 🎉</h2>
    <p>Your order <strong>#${order.orderNumber}</strong> has been confirmed and is being lovingly prepared.</p>
    <div style="margin:20px 0;padding:16px;background:#FFF8F0;border-radius:12px;">
      <p style="margin:4px 0;"><strong>Total:</strong> ₹${order.totalAmount}</p>
      <p style="margin:4px 0;"><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      <p style="margin:4px 0;"><strong>Estimated Delivery:</strong> ${order.estimatedDelivery || '5-7 business days'}</p>
    </div>
    <p>You can track your order anytime from your account dashboard.</p>
  `
  );

const customOrderUpdateEmailTemplate = (name, request) =>
  wrapper(
    'Custom order update',
    `
    <h2 style="color:#6B4F4F;margin-top:0;">Hi ${name}, your custom request has an update ✨</h2>
    <p>Your custom crochet request "<strong>${request.productType}</strong>" status has been updated to:</p>
    <div style="margin:20px 0;text-align:center;">
      <span style="background:#E8D5C4;color:#6B4F4F;padding:10px 24px;border-radius:999px;font-weight:600;">${request.status}</span>
    </div>
    ${request.quotedPrice ? `<p><strong>Quoted Price:</strong> ₹${request.quotedPrice}</p>` : ''}
    ${request.adminNotes ? `<p><strong>Note from our team:</strong> ${request.adminNotes}</p>` : ''}
    <p>Log in to your account to view full details or approve the quote.</p>
  `
  );

const adminNotificationEmailTemplate = (subject, message) =>
  wrapper(
    subject,
    `
    <h2 style="color:#6B4F4F;margin-top:0;">${subject}</h2>
    <p>${message}</p>
  `
  );

module.exports = {
  otpEmailTemplate,
  resetPasswordEmailTemplate,
  orderConfirmationEmailTemplate,
  customOrderUpdateEmailTemplate,
  adminNotificationEmailTemplate,
};
