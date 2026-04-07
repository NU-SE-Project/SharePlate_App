import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcryptjs";
import User from "../../user/User.js";
import sessionService from "./SessionService.js";
import tokenService from "./TokenService.js";
import { buildAuthUser } from "./buildAuthUser.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

/**
 * GoogleAuthService - Handles Google credential verification and session creation
 * SRP: Single responsibility - Google authentication only
 */
class GoogleAuthService {
  constructor() {
    this.client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  /**
   * Authenticate a user with a Google ID token
   */
  async authenticate(credential, meta = {}) {
    if (!credential) {
      const err = new Error("Google credential is required");
      err.statusCode = 400;
      throw err;
    }

    const googleProfile = await this._verifyCredential(credential);
    const user = await this._resolveUser(googleProfile);

    if (!user) {
      return this._buildOnboardingResponse(googleProfile);
    }

    this._assertUserCanLogin(user);
    await this._syncGoogleProfile(user, googleProfile, meta);

    return this._buildAuthenticatedResponse(user, meta);
  }

  /**
   * Complete Google signup with app-required fields
   */
  async completeSignup(data, meta = {}) {
    const {
      onboardingToken,
      name,
      password,
      address,
      contactNumber,
      role,
      location,
    } = data;

    if (!onboardingToken) {
      const err = new Error("Google onboarding token is required");
      err.statusCode = 400;
      throw err;
    }

    const googleProfile = tokenService.verifyGoogleOnboardingToken(
      onboardingToken,
    );

    if (googleProfile.purpose !== "google-onboarding") {
      const err = new Error("Invalid Google onboarding token");
      err.statusCode = 401;
      throw err;
    }

    const existingUser = await this._resolveUser(googleProfile);
    if (existingUser) {
      this._assertUserCanLogin(existingUser);
      await this._syncGoogleProfile(existingUser, googleProfile, meta);
      return this._buildAuthenticatedResponse(existingUser, meta);
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await User.create({
      name,
      email: googleProfile.email,
      password: hashedPassword,
      googleId: googleProfile.googleId,
      authProvider: "google",
      emailVerified: googleProfile.emailVerified,
      address,
      contactNumber,
      role,
      location,
    });

    return this._buildAuthenticatedResponse(user, meta);
  }

  async _verifyCredential(credential) {
    if (!process.env.GOOGLE_CLIENT_ID) {
      const err = new Error("Google authentication is not configured");
      err.statusCode = 500;
      throw err;
    }

    let ticket;

    try {
      ticket = await this.client.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (error) {
      const err = new Error("Invalid Google token");
      err.statusCode = 401;
      throw err;
    }

    const payload = ticket.getPayload();

    if (!payload?.email || !payload?.sub) {
      const err = new Error("Invalid Google token");
      err.statusCode = 401;
      throw err;
    }

    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      emailVerified: Boolean(payload.email_verified),
    };
  }

  async _resolveUser(googleProfile) {
    const { googleId, email } = googleProfile;

    const linkedUser = await User.findOne({ googleId });
    if (linkedUser && linkedUser.email !== email) {
      const err = new Error("Google account is linked to a different user");
      err.statusCode = 409;
      throw err;
    }

    return linkedUser || (await User.findOne({ email }));
  }

  _assertUserCanLogin(user) {
    if (!user.isActive) {
      const err = new Error("User account is disabled");
      err.statusCode = 403;
      throw err;
    }

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
  }

  async _syncGoogleProfile(user, googleProfile, meta) {
    const { googleId, emailVerified } = googleProfile;

    if (user.accountLockedUntil && user.accountLockedUntil <= new Date()) {
      user.failedLoginAttempts = 0;
      user.accountLockedUntil = null;
    }

    if (!user.googleId) {
      user.googleId = googleId;
    }

    if (emailVerified && !user.emailVerified) {
      user.emailVerified = true;
    }

    if (user.authProvider === "google" || !user.authProvider) {
      user.authProvider = "google";
    }

    user.failedLoginAttempts = 0;
    user.accountLockedUntil = null;
    user.lastLoginAt = new Date();
    user.lastLoginIp = meta.ip || null;

    await user.save();
  }

  _buildOnboardingResponse(googleProfile) {
    const onboardingToken = tokenService.signGoogleOnboardingToken({
      googleId: googleProfile.googleId,
      email: googleProfile.email,
      name: googleProfile.name,
      emailVerified: googleProfile.emailVerified,
      purpose: "google-onboarding",
    });

    return {
      requiresOnboarding: true,
      onboardingToken,
      profile: {
        email: googleProfile.email,
        name: googleProfile.name,
        emailVerified: googleProfile.emailVerified,
      },
    };
  }

  async _buildAuthenticatedResponse(user, meta) {
    const session = await sessionService.createSession(user, {
      role: user.role,
      authVersion: user.authVersion,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });
    const accessToken = tokenService.signAccessToken({
      userId: user._id.toString(),
      role: user.role,
      authVersion: Number(user.authVersion || 0),
      sessionId: session.sessionId,
    });

    return {
      requiresOnboarding: false,
      accessToken,
      refreshToken: session.refreshToken,
      user: buildAuthUser(user),
    };
  }
}

// Export singleton instance
export default new GoogleAuthService();
