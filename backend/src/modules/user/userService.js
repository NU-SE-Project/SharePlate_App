import User from "./User.js";
import RefreshToken from "../auth/RefreshToken.js";
import Notification from "../notification/Notification.js";
import Donation from "../donation/shop/Donation.js";
import FoodRequest from "../donation/foodbank/Request.js";
import Pickup from "../pickup/Pickup.js";
import Acceptance from "../request/shop/Acceptance.js";
import FoodRequestShop from "../request/foodbank/FoodRequest.js";

export async function getMyProfile(userId) {
  const user = await User.findById(userId); // password not returned due to select:false
  if (!user) {
    const err = new Error("User not found");
    err.statusCode = 404;
    throw err;
  }
  return user;
}

export async function updateMyProfile(userId, updates) {
  // Security: user must NOT change these fields from profile update
  delete updates.role;
  delete updates.email;
  delete updates.password;
  delete updates.isActive;

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

/**
 * Safely delete a user (SOFT DELETE - marks as inactive)
 * ✅ Preserves audit trail and data integrity
 * ✅ Prevents orphaned references and broken relationships
 * ✅ User data remains for historical records
 */
export async function adminSoftDeleteUser(userId) {
  // Prevent self-deletion
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

  // Prevent accidental deletion of admin accounts
  if (user.role === "admin") {
    const err = new Error(
      "Cannot delete admin accounts. Please contact system administrator.",
    );
    err.statusCode = 403;
    throw err;
  }

  // Soft delete: mark as inactive and invalidate sessions
  user.isActive = false;
  await user.save();

  // Invalidate all active sessions
  await RefreshToken.deleteMany({ user: userId });

  return { message: "User account deactivated successfully", user };
}

/**
 * Permanently delete a user (HARD DELETE with cascading)
 * ⚠️ WARNING: This cannot be undone!
 * ⚠️ Only use if absolutely necessary (e.g., GDPR right to be forgotten)
 */
/* export async function adminHardDeleteUser(userId) {
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

  // Delete related data to prevent orphaned references
  await Promise.all([
    // Delete all active sessions
    RefreshToken.deleteMany({ user: userId }),

    // Delete all notifications
    Notification.deleteMany({ user: userId }),

    // Delete/handle donations
    Donation.deleteMany({ donor: userId }),

    // Delete/handle food bank requests
    FoodRequest.deleteMany({ requester: userId }),
    FoodRequest.deleteMany({ approver: userId }),

    // Delete/handle pickups
    Pickup.deleteMany({ arrangedBy: userId }),
    Pickup.deleteMany({ pickedUpBy: userId }),

    // Delete/handle acceptances
    Acceptance.deleteMany({ acceptedBy: userId }),

    // Delete/handle shop food requests
    FoodRequestShop.deleteMany({ requester: userId }),
  ]);

  // Finally, delete the user
  await User.findByIdAndDelete(userId);

  return { message: "User account permanently deleted", userId };
}*/

export async function listUsers(query) {
  const { page = 1, limit = 10, role, search, isActive } = query;

  const filter = {};
  if (role) filter.role = role;

  // Optional filter by active/inactive status
  if (isActive !== undefined) {
    filter.isActive = isActive === "true" || isActive === true;
  }

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const p = Math.max(Number(page), 1);
  const l = Math.min(Math.max(Number(limit), 1), 50);

  const [data, total] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip((p - 1) * l)
      .limit(l),
    User.countDocuments(filter),
  ]);

  return {
    data,
    meta: { page: p, limit: l, total, pages: Math.ceil(total / l) },
  };
}

export async function adminUpdateUser(userId, updates) {
  // Admin can update only safe fields
  const allowed = [
    "role",
    "isActive",
    "name",
    "address",
    "contactNumber",
    "location",
  ];
  const clean = {};
  for (const key of allowed) {
    if (key in updates) clean[key] = updates[key];
  }

  const user = await User.findByIdAndUpdate(userId, clean, {
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
