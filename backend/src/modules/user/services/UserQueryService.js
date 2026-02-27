import User from "../User.js";

/**
 * UserQueryService - Handles user listing and search operations
 * SRP: Single responsibility - querying users only
 */
class UserQueryService {
  /**
   * List users with filtering and pagination
   */
  async listUsers(query) {
    const { page = 1, limit = 10, role, search, isActive } = query;

    const filter = {};

    // Filter by role
    if (role) {
      filter.role = role;
    }

    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === "true" || isActive === true;
    }

    // Search by name or email
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Validate and sanitize pagination
    const p = Math.max(Number(page), 1);
    const l = Math.min(Math.max(Number(limit), 1), 50);

    // Execute query with pagination
    const [data, total] = await Promise.all([
      User.find(filter)
        .sort({ createdAt: -1 })
        .skip((p - 1) * l)
        .limit(l),
      User.countDocuments(filter),
    ]);

    return {
      data,
      meta: {
        page: p,
        limit: l,
        total,
        pages: Math.ceil(total / l),
      },
    };
  }
}

// Export singleton instance
export default new UserQueryService();
