import {
  getMyProfile,
  updateMyProfile,
  listUsers,
  adminUpdateUser,
  adminSoftDeleteUser,
  // adminHardDeleteUser,
} from "./services/userService.js";

export async function me(req, res, next) {
  try {
    const user = await getMyProfile(req.user.userId);
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

export async function updateMe(req, res, next) {
  try {
    const user = await updateMyProfile(req.user.userId, req.validated.body);
    res.status(200).json({ message: "Profile updated", user });
  } catch (err) {
    next(err);
  }
}
export async function adminList(req, res, next) {
  try {
    const result = await listUsers(req.query);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function adminPatch(req, res, next) {
  try {
    const user = await adminUpdateUser(req.params.id, req.validated.body);
    res.status(200).json({ message: "User updated", user });
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Soft delete user (mark as inactive)
 * ✅ Safer approach - preserves data and audit trail
 */
export async function adminSoftDelete(req, res, next) {
  try {
    const result = await adminSoftDeleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/**
 * Admin: Hard delete user (permanent deletion with cascading)
 * ⚠️ Use only when necessary (e.g., GDPR, duplicate accounts)
 */
/* export async function adminHardDelete(req, res, next) {
  try {
    const result = await adminHardDeleteUser(req.params.id);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
} */
