/**
 * Auth Service - Refactored to follow SOLID principles
 * This service now delegates to specialized services
 */
import registrationService from "./RegisterService.js";
import loginService from "./LoginService.js";
import sessionService from "./SessionService.js";
import googleAuthService from "./googleAuthService.js";

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
   GOOGLE AUTH
----------------------------- */
export async function authenticateWithGoogle(credential, meta = {}) {
  return googleAuthService.authenticate(credential, meta);
}

export async function completeGoogleSignup(data, meta = {}) {
  return googleAuthService.completeSignup(data, meta);
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
