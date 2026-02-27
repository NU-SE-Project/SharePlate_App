import User from "../User.js";

/**
 * ProfileService - Handles user profile operations
 * SRP: Single responsibility - profile management only
 */
class ProfileService {
  /**
   * Get user profile by ID
   */
  async getProfile(userId) {
    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }
    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updates) {
    // Security: prevent updating sensitive fields
    const restrictedFields = [
      "role",
      "email",
      "password",
      "isActive",
      "emailVerified",
      "failedLoginAttempts",
      "accountLockedUntil",
      "emailVerificationToken",
      "emailVerificationExpires",
      "passwordResetToken",
      "passwordResetExpires",
    ];

    // Remove restricted fields
    restrictedFields.forEach((field) => delete updates[field]);

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    return user;
  }
}

// Export singleton instance
export default new ProfileService();
