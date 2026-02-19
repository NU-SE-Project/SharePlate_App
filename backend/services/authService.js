import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10); // Default to 10 if not set, but should be set in production for security

// ---- Token signing helpers ----
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

// Hash before storing in DB
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// Convert refresh expiry into a Date.
function refreshExpiryDateFromNow() {
  const days = process.env.JWT_REFRESH_EXPIRES_IN;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

// Optional: cleanup helper if reuse suspected
async function revokeAllSessionsForUser(userId) {
  await RefreshToken.deleteMany({ user: userId });
}

export async function registerUser(data) {
  const { name, email, password, address, contactNumber, role, location } =
    data;

  const existing = await User.findOne({ email });
  if (existing) {
    const err = new Error("Email already registered");
    err.statusCode = 409; // Conflict
    throw err;
  }

  // Hash password before saving
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashed,
    address,
    contactNumber,
    role,
    location,
  });

  // Return safe response (no password)
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address,
    contactNumber: user.contactNumber,
    location: user.location,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
}

export async function loginUser(email, password) {
  // Need password so select +password
  const user = await User.findOne({ email }).select("+password");
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

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    const err = new Error("Invalid email or password");
    err.statusCode = 401;
    throw err;
  }

  // JWT payload contains user id + role for RBAC
  const payload = { userId: user._id.toString(), role: user.role };

  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  // Save refresh token session (hash only)
  const tokenHash = hashToken(refreshToken);

  await RefreshToken.create({
    user: user._id,
    tokenHash,
    expiresAt: refreshExpiryDateFromNow(),
  });

  return {
    accessToken,
    refreshToken, // controller will store as httpOnly cookie
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
}

// -----------------------------
// Refresh: verify refresh JWT + match DB session + rotate
// -----------------------------
export async function refreshSession(refreshTokenFromCookie) {
  if (!refreshTokenFromCookie) {
    const err = new Error("Refresh token missing");
    err.statusCode = 401;
    throw err;
  }

  // 1) Verify JWT signature/expiry
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

  // 2) Find matching session by hash
  const incomingHash = hashToken(refreshTokenFromCookie);

  // We stored tokenHash as select:false, so explicitly select it if needed
  const session = await RefreshToken.findOne({ tokenHash: incomingHash });
  if (!session) {
    // This indicates token reuse or token was already rotated/deleted
    // Strong security response: revoke all sessions for that user.
    await revokeAllSessionsForUser(userId);

    const err = new Error(
      "Refresh token not recognized (possible reuse). Please login again.",
    );
    err.statusCode = 401;
    throw err;
  }

  // 3) Ensure user still exists and active
  const user = await User.findById(userId);
  if (!user || !user.isActive) {
    // delete this session too
    await RefreshToken.deleteOne({ _id: session._id });

    const err = new Error("Unauthorized");
    err.statusCode = 401;
    throw err;
  }

  // 4) Rotate tokens: delete old session, create new session, return new tokens
  await RefreshToken.deleteOne({ _id: session._id });

  const newPayload = { userId: user._id.toString(), role: user.role };

  const newAccessToken = signAccessToken(newPayload);
  const newRefreshToken = signRefreshToken(newPayload);

  await RefreshToken.create({
    user: user._id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: refreshExpiryDateFromNow(),
    // Could update lastUsedAt on the old session before deleting if you keep it
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
}

// -----------------------------
// Logout (single device): delete the session matching refresh cookie
// -----------------------------
export async function logoutByRefreshToken(refreshTokenFromCookie) {
  if (!refreshTokenFromCookie) return true;

  try {
    jwt.verify(refreshTokenFromCookie, process.env.JWT_REFRESH_SECRET);
  } catch {
    // even if invalid, just ignore and clear cookie on controller side
    return true;
  }

  const incomingHash = hashToken(refreshTokenFromCookie);
  await RefreshToken.deleteOne({ tokenHash: incomingHash });
  return true;
}

// -----------------------------
// Logout all sessions (optional endpoint)
// -----------------------------
export async function logoutAllSessions(userId) {
  await RefreshToken.deleteMany({ user: userId });
  return true;
}
