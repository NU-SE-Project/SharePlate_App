import bcrypt from "bcryptjs";
import User from "../../user/User.js";
import tokenService from "./tokenService.js";
import sessionService from "./sessionService.js";

/**
 * LoginService - Handles user authentication and login security
 * SRP: Single responsibility - login and authentication only
 */
class LoginService {
  /**
   * Authenticate user and create session
   */
  async login(email, password, meta = {}) {
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

    // Check if account is locked
    await this._checkAccountLock(user);

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      await this._handleFailedLogin(user);

      const err = new Error("Invalid email or password");
      err.statusCode = 401;
      throw err;
    }

    // Success: reset failed attempts and update audit fields
    await this._handleSuccessfulLogin(user, meta);

    // Create tokens
    const payload = { userId: user._id.toString(), role: user.role };
    const accessToken = tokenService.signAccessToken(payload);
    const refreshToken = await sessionService.createSession(user._id, {
      role: user.role,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    const userObj = user.toObject();
    return {
      accessToken,
      refreshToken,
      user: {
        id: userObj._id,
        _id: userObj._id,
        name: userObj.name,
        email: userObj.email,
        role: userObj.role,
        emailVerified: userObj.emailVerified,
        address: userObj.address,
        location: userObj.location,
      },
    };
  }

  /**
   * Check if account is locked
   * @private
   */
  async _checkAccountLock(user) {
    // Check if currently locked
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

    // Reset lock if time has passed
    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
    }
  }

  /**
   * Handle failed login attempt
   * @private
   */
  async _handleFailedLogin(user) {
    user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;

    if (user.failedLoginAttempts >= 5) {
      user.accountLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      await user.save();

      const err = new Error(
        "Account locked due to multiple failed login attempts. Try again in 15 minutes.",
      );
      err.statusCode = 423;
      throw err;
    }

    await user.save();
  }

  /**
   * Handle successful login
   * @private
   */
  async _handleSuccessfulLogin(user, meta) {
    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = meta.ip || null;
    await user.save();
  }
}

// Export singleton instance
export default new LoginService();
