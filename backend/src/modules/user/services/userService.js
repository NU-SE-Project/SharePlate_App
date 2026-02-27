/**
 * User Service - Refactored to follow SOLID principles
 * This service now delegates to specialized services
 */
import profileService from "./ProfileService.js";
import userQueryService from "./UserQueryService.js";
import userAdminService from "./UserAdminService.js";

/* -----------------------------
   Profile Operations
----------------------------- */
export async function getMyProfile(userId) {
  return profileService.getProfile(userId);
}

export async function updateMyProfile(userId, updates) {
  return profileService.updateProfile(userId, updates);
}

/* -----------------------------
   Admin User Management
----------------------------- */
export async function listUsers(query) {
  return userQueryService.listUsers(query);
}

export async function adminUpdateUser(userId, updates) {
  return userAdminService.updateUser(userId, updates);
}

export async function adminSoftDeleteUser(userId) {
  return userAdminService.deactivateUser(userId);
}
