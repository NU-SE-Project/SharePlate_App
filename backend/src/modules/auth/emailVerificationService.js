import crypto from "node:crypto";
import User from "../user/User.js";
import { sendVerificationEmail } from "../../utils/emailService.js";

function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function sendEmailVerification(userId) {
  const user = await User.findById(userId).select(
    "+emailVerificationToken +emailVerificationExpires",
  );

  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }

  if (user.emailVerified) {
    const err = new Error("Email already verified");
    err.statusCode = 400;
    throw err;
  }

  const token = generateVerificationToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.save();

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch (e) {
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();

    const err = new Error(
      "Failed to send verification email. Please try again.",
    );
    err.statusCode = 500;
    throw err;
  }

  return { message: "Verification email sent successfully" };
}

export async function verifyEmail(token) {
  if (!token) {
    const err = new Error("Verification token is required");
    err.statusCode = 400;
    throw err;
  }

  const hashed = hashToken(token);

  const user = await User.findOne({
    emailVerificationToken: hashed,
    emailVerificationExpires: { $gt: new Date() },
  }).select("+emailVerificationToken +emailVerificationExpires");

  if (!user) {
    const err = new Error("Invalid or expired verification token");
    err.statusCode = 400;
    throw err;
  }

  user.emailVerified = true;
  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  await user.save();

  return { message: "Email verified successfully! You can now login." };
}

export async function resendVerificationEmail(email) {
  const user = await User.findOne({ email }).select(
    "+emailVerificationToken +emailVerificationExpires",
  );

  // Security: do not reveal if email exists
  if (!user) {
    return {
      message: "If that email exists, a verification link has been sent",
    };
  }

  if (user.emailVerified) {
    const err = new Error("Email already verified");
    err.statusCode = 400;
    throw err;
  }

  const token = generateVerificationToken();
  user.emailVerificationToken = hashToken(token);
  user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await user.save();

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch (e) {
    const err = new Error(
      "Failed to send verification email. Please try again.",
    );
    err.statusCode = 500;
    throw err;
  }

  return { message: "If that email exists, a verification link has been sent" };
}
