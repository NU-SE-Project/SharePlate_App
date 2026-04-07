import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import User from "../../user/User.js";
import sessionService from "./SessionService.js";
import {
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
} from "../../../utils/emailService.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

function generateResetToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function requestPasswordReset(email) {
  const user = await User.findOne({ email }).select(
    "+passwordResetToken +passwordResetExpires",
  );

  // do not reveal existence
  if (!user) {
    return { message: "If that email exists, a reset link has been sent" };
  }

  if (!user.isActive) {
    // still safe to show "disabled" because user already knows their email
    const err = new Error("Account is disabled");
    err.statusCode = 403;
    throw err;
  }

  const resetToken = generateResetToken();
  user.passwordResetToken = hashToken(resetToken);
  user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await user.save();

  try {
    await sendPasswordResetEmail(user.email, user.name, resetToken);
  } catch (e) {
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();

    const err = new Error("Failed to send reset email. Please try again.");
    err.statusCode = 500;
    throw err;
  }

  return { message: "If that email exists, a reset link has been sent" };
}

export async function resetPassword(token, newPassword) {
  if (!token || !newPassword) {
    const err = new Error("Token and new password are required");
    err.statusCode = 400;
    throw err;
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires +password");

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.statusCode = 400;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  // reset lockout fields if present
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;

  await user.save();

  // invalidate all sessions
  await sessionService.revokeAllSessions(user._id);

  // send confirmation (do not fail reset if email fails)
  sendPasswordChangedEmail(user.email, user.name).catch(() => {});

  return {
    message: "Password reset successful. Please login with your new password.",
  };
}

export async function changePassword(userId, currentPassword, newPassword) {
  if (!currentPassword || !newPassword) {
    const err = new Error("Current and new password are required");
    err.statusCode = 400;
    throw err;
  }

  if (currentPassword === newPassword) {
    const err = new Error(
      "New password must be different from current password",
    );
    err.statusCode = 400;
    throw err;
  }

  const user = await User.findById(userId).select("+password");
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) {
    const err = new Error("Current password is incorrect");
    err.statusCode = 401;
    throw err;
  }

  user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
  user.passwordResetToken = null;
  user.passwordResetExpires = null;

  await user.save();

  // Optional security: log out from all devices after password change
  // await RefreshToken.deleteMany({ user: user._id });

  sendPasswordChangedEmail(user.email, user.name).catch(() => {});

  return { message: "Password changed successfully" };
}

export async function validateResetToken(token) {
  if (!token) {
    const err = new Error("Token is required");
    err.statusCode = 400;
    throw err;
  }

  const hashedToken = hashToken(token);

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    const err = new Error("Invalid or expired reset token");
    err.statusCode = 400;
    throw err;
  }

  return { valid: true };
}
