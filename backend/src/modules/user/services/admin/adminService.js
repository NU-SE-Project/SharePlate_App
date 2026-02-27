import User from "../../User.js";
import sessionService from "../../../auth/services/sessionService.js";

/**
 * UserAdminService - Handles administrative user operations
 * SRP: Single responsibility - admin user management only
 */
class UserAdminService {
  /**
   * Admin update user
   */
  async updateUser(userId, updates) {
    // Admin can update only safe fields
    const allowedFields = [
      "role",
      "isActive",
      "name",
      "address",
      "contactNumber",
      "location",
      "verificationStatus",
      "verifiedAt",
    ];

    const cleanUpdates = {};
    for (const key of allowedFields) {
      if (key in updates) {
        cleanUpdates[key] = updates[key];
      }
    }

    const user = await User.findByIdAndUpdate(userId, cleanUpdates, {
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

  /**
   * Soft delete user (deactivate)
   * This is safer and preserves audit trail
   */
  async deactivateUser(userId) {
    if (!userId) {
      const err = new Error("User ID required");
      err.statusCode = 400;
      throw err;
    }

    const user = await User.findById(userId);
    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    // Prevent deletion of admin accounts
    if (user.role === "admin") {
      const err = new Error(
        "Cannot delete admin accounts. Please contact system administrator.",
      );
      err.statusCode = 403;
      throw err;
    }

    // Soft delete: mark as inactive
    user.isActive = false;
    await user.save();

    // Invalidate all active sessions
    await sessionService.revokeAllSessions(userId);

    return { message: "User account deactivated successfully", user };
  }
}

// Export singleton instance
export default new UserAdminService();
