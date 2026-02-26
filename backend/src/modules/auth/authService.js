import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";

import User from "../user/User.js";
import RefreshToken from "./RefreshToken.js";
import { sendEmailVerification } from "./emailVerificationService.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

/* -----------------------------
   Token helpers
----------------------------- */
function signAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  });
}

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Supports "7d" format. Falls back to 7 days.
 */
function refreshExpiryDateFromNow() {
  const raw = String(process.env.JWT_REFRESH_EXPIRES_IN || "7d").trim();
  const match = raw.match(/^(\d+)\s*d$/i);
  const days = match ? Number(match[1]) : 7;
  const safeDays = Number.isFinite(days) && days > 0 ? days : 7;

  return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
}

async function revokeAllSessionsForUser(userId) {
  await RefreshToken.deleteMany({ user: userId });
}

/* -----------------------------
   REGISTER (ONLY registration)
----------------------------- */
export async function registerUser(data) {
  const { name, email, password, address, contactNumber, role, location } =
    data;

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    address,
    contactNumber,
    role,
    location,
    // emailVerified is handled separately by emailVerification module
  });

  // ✅ Send email verification (non-blocking)
  sendEmailVerification(user._id).catch((e) => {
    console.error(
      "Email verification setup failed during registration:",
      e?.message || e,
    );
  });

  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address,
    contactNumber: user.contactNumber,
    location: user.location,
    isActive: user.isActive,
    emailVerified: user.emailVerified,
    createdAt: user.createdAt,
  };
}

/* -----------------------------
   LOGIN
----------------------------- */
export async function loginUser(email, password, meta = {}) {
  const user = await User.findOne({ email }).select(
    "+password +failedLoginAttempts +accountLockedUntil",
  );

  // Security: avoid revealing whether email exists
  if (!user) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err = new Error("User account is disabled");
    err.statusCode = 403;
    throw err;
  }

  // Optional: enforce verification before login (recommended if you implement email verification)
  // if (!user.emailVerified) {
  //   const err = new Error("Please verify your email before logging in");
  //   err.statusCode = 403;
  //   throw err;
  // }

  // Lock check
  if (user.accountLockedUntil && user.accountLockedUntil > new Date()) {
    const minutesLeft = Math.ceil(
      (user.accountLockedUntil.getTime() - Date.now()) / 1000 / 60,
    );
    const err = new Error(
      `Account locked due to multiple failed login attempts. Try again in ${minutesLeft} minutes.`,
    );
    err.statusCode = 423;
    throw err;
  }

  // reset lock if time passed
  if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
  }

  const ok = await bcrypt.compare(password, user.password);

  if (!ok) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const err = new Error(
        "Account locked due to multiple failed login attempts. Try again in 15 minutes.",
      );
      err.statusCode = 423;
      throw err;
    }

    await user.save();

    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  // success: reset attempts
  user.failedLoginAttempts = 0;
  user.accountLockedUntil = null;

  // optional audit fields (only if in schema)
  user.lastLoginAt = new Date();
  user.lastLoginIp = meta.ip || null;
  await user.save();

  const payload = { userId: user._id.toString(), role: user.role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(refreshToken),
    expiresAt: refreshExpiryDateFromNow(),
    createdByIp: meta.ip || null,
    userAgent: meta.userAgent || null,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },
  };
}

/* -----------------------------
   REFRESH SESSION (rotation)
----------------------------- */
export async function refreshSession(refreshTokenFromCookie) {
  if (!refreshTokenFromCookie) {
    const err = new Error("Refresh token missing");
    err.statusCode = 401;
    throw err;
  }

  let decoded;
  try {
    decoded = jwt.verify(
      refreshTokenFromCookie,
      process.env.JWT_REFRESH_SECRET,
    );
  } catch {
    const err = new Error("Invalid or expired refresh token");
    err.statusCode = 401;
    throw err;
  }

  const { userId } = decoded;

  const incomingHash = hashToken(refreshTokenFromCookie);
  const session = await RefreshToken.findOne({
    tokenHash: incomingHash,
  }).select("+tokenHash");

  if (!session) {
    await revokeAllSessionsForUser(userId);

    const err = new Error(
      "Refresh token not recognized (possible reuse). Please login again.",
    );
    err.statusCode = 401;
    throw err;
  }

  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    await RefreshToken.deleteOne({ _id: session._id });

    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }

  // rotate
  await RefreshToken.deleteOne({ _id: session._id });

  const newPayload = { userId: user._id.toString(), role: user.role };
  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: refreshExpiryDateFromNow(),
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

/* -----------------------------
   LOGOUT (single device)
----------------------------- */
export async function logoutByRefreshToken(refreshTokenFromCookie) {
  if (!refreshTokenFromCookie) return true;

  const incomingHash = hashToken(refreshTokenFromCookie);
  await RefreshToken.deleteOne({ tokenHash: incomingHash });

  return true;
}

/* -----------------------------
   LOGOUT ALL
----------------------------- */
export async function logoutAllSessions(userId) {
  await RefreshToken.deleteMany({ user: userId });
  return true;
}
