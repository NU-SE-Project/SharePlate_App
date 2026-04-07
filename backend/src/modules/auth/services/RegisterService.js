import bcrypt from "bcryptjs";
import User from "../../user/User.js";
import { sendEmailVerification } from "./emailVerificationService.js";
import { buildAuthUser } from "./buildAuthUser.js";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS || 10);

/**
 * RegistrationService - Handles user registration
 * SRP: Single responsibility - user registration only
 */
class RegistrationService {
  /**
   * Register a new user
   */
  async register(data) {
    const { name, email, password, address, contactNumber, role, location } =
      data;

    // Check if email already exists
    const existing = await User.findOne({ email });
    if (existing) {
      const err = new Error("Email already registered");
      err.statusCode = 409;
      throw err;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      address,
      contactNumber,
      role,
      location,
    });

    // Send email verification (non-blocking)
    this._sendVerificationEmail(user._id);

    return {
      ...buildAuthUser(user),
      createdAt: user.createdAt,
    };
  }

  /**
   * Send verification email (non-blocking)
   * @private
   */
  _sendVerificationEmail(userId) {
    sendEmailVerification(userId).catch((e) => {
      console.error(
        "Email verification setup failed during registration:",
        e?.message || e,
      );
    });
  }
}

// Export singleton instance
export default new RegistrationService();
