const nodemailer = require('nodemailer');
const {
  SMTP_EMAIL,
  SMTP_APP_PASSWORD,
  isProduction,
} = require('../config/env');

const hasSmtpConfig = () =>
  Boolean(SMTP_EMAIL && SMTP_APP_PASSWORD);

function createTransporter() {
  if (!hasSmtpConfig()) {
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SMTP_EMAIL,
      pass: SMTP_APP_PASSWORD,
    },
  });
}

function buildPasswordResetEmail({ resetUrl, expiryMinutes }) {
  const escapedUrl = resetUrl.replace(/"/g, '&quot;');

  return `
    <!doctype html>
    <html>
      <body style="margin:0;padding:0;background:#f4f7fb;font-family:Arial,sans-serif;color:#111827;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f7fb;padding:32px 16px;">
          <tr>
            <td align="center">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e5e7eb;">
                <tr>
                  <td style="background:#05050a;padding:28px 32px;color:#ffffff;">
                    <h1 style="margin:0;font-size:24px;line-height:1.2;">Reset your ScanVista password</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">We received a request to reset your ScanVista account password.</p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">This link expires in ${expiryMinutes} minutes and can only be used once.</p>
                    <p style="margin:0 0 28px;">
                      <a href="${escapedUrl}" style="display:inline-block;background:#00f0ff;color:#05050a;text-decoration:none;font-weight:700;padding:14px 22px;border-radius:10px;">Reset password</a>
                    </p>
                    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#4b5563;">If the button does not work, copy and paste this link into your browser:</p>
                    <p style="margin:0 0 24px;font-size:13px;line-height:1.6;word-break:break-all;color:#2563eb;">${resetUrl}</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you did not request this reset, you can safely ignore this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

async function sendPasswordResetEmail({ to, resetUrl, expiryMinutes }) {
  const transporter = createTransporter();
  const subject = 'Reset your ScanVista password';
  const html = buildPasswordResetEmail({ resetUrl, expiryMinutes });

  if (!transporter) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    console.info('[mail] SMTP is not configured. Password reset link:', resetUrl);
    return { skipped: true };
  }

  return transporter.sendMail({
    from: SMTP_EMAIL,
    to,
    subject,
    html,
  });
}

module.exports = {
  sendPasswordResetEmail,
};
