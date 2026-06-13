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

function buildTwoFactorEmail({ otp, expiryMinutes }) {
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
                    <h1 style="margin:0;font-size:24px;line-height:1.2;">Your Two-Factor Authentication Code</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">You are attempting to log in to ScanVista with Two-Factor Authentication enabled.</p>
                    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">Here is your 6-digit authentication code (valid for ${expiryMinutes} minutes):</p>
                    <div style="background:#f3f4f6;border-radius:8px;padding:20px;text-align:center;margin-bottom:24px;">
                      <span style="font-size:32px;font-weight:bold;letter-spacing:4px;color:#111827;">${otp}</span>
                    </div>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you did not attempt to log in, please secure your account and change your password immediately.</p>
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

async function sendTwoFactorEmail({ to, otp, expiryMinutes }) {
  const transporter = createTransporter();
  const subject = 'Your ScanVista Login Code';
  const html = buildTwoFactorEmail({ otp, expiryMinutes });

  if (!transporter) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    console.info('[mail] SMTP is not configured. 2FA OTP:', otp);
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
  sendTwoFactorEmail,
};

function buildTwoFactorEmail({ code, expiryMinutes }) {
  const escapedCode = code.replace(/"/g, '&quot;');

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
                    <h1 style="margin:0;font-size:24px;line-height:1.2;">Your ScanVista 2FA Verification Code</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello,</p>
                    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">To complete your sign-in, please use the following 6-digit verification code:</p>
                    <div style="background:#f3f4f6;border-radius:12px;padding:20px;text-align:center;margin:24px 0;">
                      <span style="font-family:'Courier New',Courier,monospace;font-size:36px;font-weight:bold;letter-spacing:6px;color:#05050a;">${escapedCode}</span>
                    </div>
                    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#4b5563;">This code is valid for exactly <strong>${expiryMinutes} minutes</strong> and can only be used once.</p>
                    <p style="margin:0;font-size:14px;line-height:1.6;color:#6b7280;">If you did not attempt to sign in to your ScanVista account, you can safely ignore this email.</p>
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

async function sendTwoFactorCodeEmail({ to, code, expiryMinutes }) {
  const transporter = createTransporter();
  const subject = 'Your ScanVista 2FA Verification Code';
  const html = buildTwoFactorEmail({ code, expiryMinutes });

  if (!transporter) {
    if (isProduction) {
      throw new Error('SMTP is not configured');
    }
    console.info('[mail] SMTP is not configured. Two-Factor Verification Code is:', code);
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
  sendTwoFactorCodeEmail,
};
