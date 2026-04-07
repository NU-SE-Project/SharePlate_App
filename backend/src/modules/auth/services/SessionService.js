import RefreshToken from "../RefreshToken.js";
import User from "../../user/User.js";
import { Types } from "mongoose";
import tokenService from "./TokenService.js";
import { buildAuthUser } from "./buildAuthUser.js";

/**
 * SessionService - Manages user sessions and refresh tokens
 * SRP: Single responsibility - session management only
 */
class SessionService {
  /**
   * Create a new session (refresh token)
   */
  async createSession(user, meta = {}) {
    const userId = user?._id || user;
    const authVersion = Number(meta.authVersion ?? user?.authVersion ?? 0);
    const sessionId = new Types.ObjectId();
    const payload = {
      userId: userId.toString(),
      role: meta.role,
      authVersion,
      sessionId: sessionId.toString(),
    };
    const refreshToken = tokenService.signRefreshToken(payload);

    await RefreshToken.create({
      _id: sessionId,
      user: userId,
      tokenHash: tokenService.hashToken(refreshToken),
      expiresAt: tokenService.getRefreshExpiryDate(),
      createdByIp: meta.ip || null,
      userAgent: meta.userAgent || null,
    });

    return {
      refreshToken,
      sessionId: sessionId.toString(),
      authVersion,
    };
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
    const { userId, sessionId, authVersion } = decoded;

    // Check if session exists in DB
    const incomingHash = tokenService.hashToken(refreshTokenFromCookie);
    const session = await RefreshToken.findOne({
      _id: sessionId,
      user: userId,
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

    if (Number(user.authVersion || 0) !== Number(authVersion || 0)) {
      await RefreshToken.deleteOne({ _id: session._id });

      const err = new Error("Session has been revoked. Please login again.");
      err.statusCode = 401;
      throw err;
    }

    // Rotate: delete old session
    await RefreshToken.deleteOne({ _id: session._id });

    // Create new tokens
    const newSession = await this.createSession(user, {
      role: user.role,
      authVersion: user.authVersion,
    });
    const newAccessToken = tokenService.signAccessToken({
      userId: user._id.toString(),
      role: user.role,
      authVersion: Number(user.authVersion || 0),
      sessionId: newSession.sessionId,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newSession.refreshToken,
      user: buildAuthUser(user),
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
    await User.updateOne({ _id: userId }, { $inc: { authVersion: 1 } });
    await RefreshToken.deleteMany({ user: userId });
    return true;
  }
}

// Export singleton instance
export default new SessionService();
