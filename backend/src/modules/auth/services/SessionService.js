import RefreshToken from "../RefreshToken.js";
import User from "../../user/User.js";
import tokenService from "./tokenService.js";

/**
 * SessionService - Manages user sessions and refresh tokens
 * SRP: Single responsibility - session management only
 */
class SessionService {
  /**
   * Create a new session (refresh token)
   */
  async createSession(userId, meta = {}) {
    const payload = { userId: userId.toString(), role: meta.role };
    const refreshToken = tokenService.signRefreshToken(payload);

    await RefreshToken.create({
      user: userId,
      tokenHash: tokenService.hashToken(refreshToken),
      expiresAt: tokenService.getRefreshExpiryDate(),
      createdByIp: meta.ip || null,
      userAgent: meta.userAgent || null,
    });

    return refreshToken;
  }

  /**
   * Refresh session - validate old token and create new one (rotation)
   */
  async refreshSession(refreshTokenFromCookie) {
    if (!refreshTokenFromCookie) {
      const err = new Error("Refresh token missing");
      err.statusCode = 401;
      throw err;
    }

    // Verify token
    const decoded = tokenService.verifyRefreshToken(refreshTokenFromCookie);
    const { userId } = decoded;

    // Check if session exists in DB
    const incomingHash = tokenService.hashToken(refreshTokenFromCookie);
    const session = await RefreshToken.findOne({
      tokenHash: incomingHash,
    }).select("+tokenHash");

    if (!session) {
      // Possible reuse attack - revoke all sessions
      await this.revokeAllSessions(userId);

      const err = new Error(
        "Refresh token not recognized (possible reuse). Please login again.",
      );
      err.statusCode = 401;
      throw err;
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user || !user.isActive) {
      await RefreshToken.deleteOne({ _id: session._id });

      const err = new Error("Unauthorized");
      err.statusCode = 401;
      throw err;
    }

    // Rotate: delete old session
    await RefreshToken.deleteOne({ _id: session._id });

    // Create new tokens
    const newPayload = { userId: user._id.toString(), role: user.role };
    const newAccessToken = tokenService.signAccessToken(newPayload);
    const newRefreshToken = tokenService.signRefreshToken(newPayload);

    // Store new session
    await RefreshToken.create({
      user: user._id,
      tokenHash: tokenService.hashToken(newRefreshToken),
      expiresAt: tokenService.getRefreshExpiryDate(),
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }

  /**
   * Logout single session
   */
  async logoutSession(refreshTokenFromCookie) {
    if (!refreshTokenFromCookie) return true;

    const incomingHash = tokenService.hashToken(refreshTokenFromCookie);
    await RefreshToken.deleteOne({ tokenHash: incomingHash });

    return true;
  }

  /**
   * Revoke all sessions for a user
   */
  async revokeAllSessions(userId) {
    await RefreshToken.deleteMany({ user: userId });
    return true;
  }
}

// Export singleton instance
export default new SessionService();
