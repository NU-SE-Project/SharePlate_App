import jwt from "jsonwebtoken";
import crypto from "node:crypto";

/**
 * TokenService - Handles all token generation and validation
 * SRP: Single responsibility - token operations only
 */
class TokenService {
  constructor() {
    this.accessSecret = process.env.JWT_ACCESS_SECRET;
    this.refreshSecret = process.env.JWT_REFRESH_SECRET;
    this.accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
    this.refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  }

  /**
   * Generate access token
   */
  signAccessToken(payload) {
    return jwt.sign(payload, this.accessSecret, {
      expiresIn: this.accessExpiresIn,
    });
  }

  /**
   * Generate refresh token
   */
  signRefreshToken(payload) {
    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshExpiresIn,
    });
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token) {
    try {
      return jwt.verify(token, this.refreshSecret);
    } catch (error) {
      const err = new Error("Invalid or expired refresh token");
      err.statusCode = 401;
      throw err;
    }
  }

  /**
   * Hash token (for storage)
   */
  hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Generate random token (for email verification, password reset, etc.)
   */
  generateRandomToken(bytes = 32) {
    return crypto.randomBytes(bytes).toString("hex");
  }

  /**
   * Calculate refresh token expiry date
   * Supports "7d" format. Falls back to 7 days.
   */
  getRefreshExpiryDate() {
    const raw = String(this.refreshExpiresIn).trim();
    const match = raw.match(/^(\d+)\s*d$/i);
    const days = match ? Number(match[1]) : 7;
    const safeDays = Number.isFinite(days) && days > 0 ? days : 7;

    return new Date(Date.now() + safeDays * 24 * 60 * 60 * 1000);
  }
}

// Export singleton instance
export default new TokenService();
