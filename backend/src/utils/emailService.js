import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// Create reusable transporter
let transporter;

function createTransporter() {
  // If SMTP credentials are provided, use them
  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Otherwise use ethereal (development/testing fake SMTP)
  // Logs will show preview URL for testing
  console.warn(
    "⚠️  No SMTP configuration found. Using test email service (emails won't be sent).",
  );
  console.warn(
    "   Configure SMTP_HOST, SMTP_USER, SMTP_PASSWORD in .env for real emails.",
  );

  // For now, return null and we'll handle it in sendEmail
  return null;
}

/**
 * Initialize email service (call this on app startup if needed)
 */
export async function initEmailService() {
  if (!transporter) {
    transporter = createTransporter();

    // If no SMTP configured, create test account
    if (!transporter && process.env.NODE_ENV === "development") {
      try {
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        console.log("📧 Test email account created:", testAccount.user);
      } catch (error) {
        console.error("Failed to create test email account:", error.message);
      }
    }
  }
}

/**
 * Send email helper
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text body
 * @param {string} options.html - HTML body (optional)
 */
export async function sendEmail({ to, subject, text, html }) {
  try {
    // Initialize if not already done
    if (!transporter) {
      await initEmailService();
    }

    // If still no transporter, just log (for academic/demo purposes)
    if (!transporter) {
      console.log("\n📧 ====== EMAIL (NOT SENT - NO SMTP) ======");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("Text:", text);
      console.log("==========================================\n");
      return { messageId: "mock-id", accepted: [to] };
    }

    const mailOptions = {
      from:
        process.env.SMTP_FROM ||
        process.env.SMTP_USER ||
        "noreply@shareplate.com",
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);

    // If using Ethereal (test), log preview URL
    if (process.env.NODE_ENV === "development" && info.messageId) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) {
        console.log("📧 Email Preview URL:", previewUrl);
      }
    }

    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error.message);
    throw error;
  }
}

/**
 * Send email verification email
 */
export async function sendVerificationEmail(email, name, token) {
  const verifyUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/verify-email?token=${token}`;

  const subject = "Verify Your Email - SharePlate";
  const text = `
Hello ${name},

Thank you for registering with SharePlate!

Please verify your email address by clicking the link below:
${verifyUrl}

This link will expire in 24 hours.

If you didn't create an account, please ignore this email.

Best regards,
SharePlate Team
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SharePlate! 🍽️</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>Thank you for registering with SharePlate! Please verify your email address to complete your registration.</p>
          <p style="text-align: center;">
            <a href="${verifyUrl}" class="button">Verify Email Address</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verifyUrl}</p>
          <p><strong>This link will expire in 24 hours.</strong></p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SharePlate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email, name, token) {
  const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${token}`;

  const subject = "Password Reset Request - SharePlate";
  const text = `
Hello ${name},

We received a request to reset your password for your SharePlate account.

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you didn't request a password reset, please ignore this email or contact support if you have concerns.

Best regards,
SharePlate Team
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .button { display: inline-block; padding: 12px 24px; background-color: #FF9800; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request 🔐</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>We received a request to reset the password for your SharePlate account.</p>
          <p style="text-align: center;">
            <a href="${resetUrl}" class="button">Reset Password</a>
          </p>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SharePlate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, text, html });
}

/**
 * Send password changed confirmation email
 */
export async function sendPasswordChangedEmail(email, name) {
  const subject = "Password Changed - SharePlate";
  const text = `
Hello ${name},

This email confirms that your password was successfully changed.

If you did not make this change, please contact support immediately.

Best regards,
SharePlate Team
  `.trim();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .warning { background-color: #ffebee; border-left: 4px solid #f44336; padding: 12px; margin: 20px 0; }
        .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Changed ✅</h1>
        </div>
        <div class="content">
          <p>Hello <strong>${name}</strong>,</p>
          <p>This email confirms that your password was successfully changed.</p>
          <div class="warning">
            <strong>⚠️ Security Alert:</strong> If you did not make this change, please contact support immediately and secure your account.
          </div>
          <p>Changed at: ${new Date().toLocaleString()}</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} SharePlate. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, text, html });
}
