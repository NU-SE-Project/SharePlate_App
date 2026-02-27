/**
 * Auth Service - Refactored to follow SOLID principles
 * This service now delegates to specialized services
 */
import registrationService from "./registerService.js";
import loginService from "./loginService.js";
import sessionService from "./sessionService.js";

/* -----------------------------
   REGISTER
----------------------------- */
export async function registerUser(data) {
  return registrationService.register(data);
}

/* -----------------------------
   LOGIN
----------------------------- */
export async function loginUser(email, password, meta = {}) {
  return loginService.login(email, password, meta);
}

/* -----------------------------
   REFRESH SESSION
----------------------------- */
export async function refreshSession(refreshTokenFromCookie) {
  return sessionService.refreshSession(refreshTokenFromCookie);
}

/* -----------------------------
   LOGOUT (single device)
----------------------------- */
export async function logoutByRefreshToken(refreshTokenFromCookie) {
  return sessionService.logoutSession(refreshTokenFromCookie);
}

/* -----------------------------
   LOGOUT ALL
----------------------------- */
export async function logoutAllSessions(userId) {
  return sessionService.revokeAllSessions(userId);
}
