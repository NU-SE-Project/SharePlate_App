const GOOGLE_ONBOARDING_STORAGE_KEY = "shareplate_google_onboarding";

export function getStoredGoogleOnboarding() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(GOOGLE_ONBOARDING_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

export function setStoredGoogleOnboarding(payload) {
  if (typeof window === "undefined") return;

  if (!payload) {
    clearStoredGoogleOnboarding();
    return;
  }

  window.sessionStorage.setItem(
    GOOGLE_ONBOARDING_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export function clearStoredGoogleOnboarding() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(GOOGLE_ONBOARDING_STORAGE_KEY);
}
